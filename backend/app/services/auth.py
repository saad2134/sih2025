"""Auth service with JWT token management."""

import re
import uuid
from datetime import datetime, timedelta, timezone, date
from passlib.context import CryptContext
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
import redis.asyncio as redis

from app.config import settings
from app.models.user import User
from app.models.onboarding import LearnerProfile
from app.schemas.auth import SignupRequest, LoginRequest, TokenResponse, UserResponse

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:
    def __init__(self, db: AsyncSession, redis_client: redis.Redis):
        self.db = db
        self.redis = redis_client

    def hash_password(self, password: str) -> str:
        return pwd_context.hash(password)

    def verify_password(self, plain: str, hashed: str) -> bool:
        return pwd_context.verify(plain, hashed)

    def create_access_token(self, user_id: str, expires_delta: timedelta | None = None) -> str:
        expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
        to_encode = {"sub": user_id, "exp": expire, "type": "access"}
        return jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")

    def create_refresh_token(self, user_id: str) -> str:
        expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        to_encode = {"sub": user_id, "exp": expire, "type": "refresh", "jti": str(uuid.uuid4())}
        token = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
        return token

    async def store_refresh_token(self, user_id: str, token: str):
        await self.redis.setex(
            f"refresh:{user_id}:{token}",
            timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
            "valid"
        )

    async def validate_refresh_token(self, user_id: str, token: str) -> bool:
        key = f"refresh:{user_id}:{token}"
        return await self.redis.exists(key)

    async def revoke_refresh_token(self, user_id: str, token: str):
        await self.redis.delete(f"refresh:{user_id}:{token}")

    async def register(self, data: SignupRequest) -> tuple[User, TokenResponse]:
        result = await self.db.execute(select(User).where(User.email == data.email.lower()))
        existing = result.scalar_one_or_none()
        if existing:
            raise ValueError("DUPLICATE_EMAIL")

        user = User(
            email=data.email.lower(),
            password_hash=self.hash_password(data.password),
            full_name=data.full_name,
            timezone=data.timezone or "Asia/Kolkata",
        )
        self.db.add(user)
        await self.db.flush()

        access_token = self.create_access_token(str(user.id))
        refresh_token = self.create_refresh_token(str(user.id))
        await self.store_refresh_token(str(user.id), refresh_token)

        return user, TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
        )

    async def login(self, data: LoginRequest) -> TokenResponse:
        result = await self.db.execute(select(User).where(User.email == data.email.lower()))
        user = result.scalar_one_or_none()
        if not user:
            raise ValueError("USER_NOT_FOUND")
        if not self.verify_password(data.password, user.password_hash):
            raise ValueError("INVALID_PASSWORD")

        access_token = self.create_access_token(str(user.id))
        refresh_token = self.create_refresh_token(str(user.id))
        await self.store_refresh_token(str(user.id), refresh_token)

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
        )

    async def refresh_tokens(self, refresh_token: str) -> TokenResponse:
        try:
            payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=["HS256"])
            if payload.get("type") != "refresh":
                raise ValueError("INVALID_TOKEN")
            
            user_id = payload.get("sub")
            if not await self.validate_refresh_token(user_id, refresh_token):
                raise ValueError("TOKEN_EXPIRED")

            await self.revoke_refresh_token(user_id, refresh_token)
            
            new_access = self.create_access_token(user_id)
            new_refresh = self.create_refresh_token(user_id)
            await self.store_refresh_token(user_id, new_refresh)

            return TokenResponse(
                access_token=new_access,
                refresh_token=new_refresh,
            )
        except JWTError:
            raise ValueError("INVALID_TOKEN")

    async def get_current_user(self, token: str) -> User:
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            user_id = payload.get("sub")
            if payload.get("type") != "access":
                raise ValueError("INVALID_TOKEN")
        except JWTError:
            raise ValueError("INVALID_TOKEN")

        result = await self.db.execute(select(User).where(User.id == uuid.UUID(user_id)))
        user = result.scalar_one_or_none()
        if not user:
            raise ValueError("USER_NOT_FOUND")
        return user

    async def logout(self, user_id: str, refresh_token: str):
        await self.revoke_refresh_token(user_id, refresh_token)

    # ── Streak & Rank helpers ──────────────────────────────────────────

    @staticmethod
    def _parse_tag(text: str, tag: str, default: int = 0) -> int:
        """Parse an integer value from a [Tag: value] bracket tag in text."""
        m = re.search(rf"\[{tag}:\s*(\d+)\]", text or "")
        return int(m.group(1)) if m else default

    @staticmethod
    def _set_tag(text: str, tag: str, value: int) -> str:
        """Set or update a [Tag: value] bracket tag in text."""
        pattern = rf"\[{tag}:\s*\d+\]"
        replacement = f"[{tag}: {value}]"
        if re.search(pattern, text or ""):
            return re.sub(pattern, replacement, text)
        return (text or "") + f" {replacement}"

    async def update_user_activity(self, user: User):
        """Update last_active_at and calculate/update streak if date changes."""
        now = datetime.now(timezone.utc)

        # Check for subscription expiration
        if user.subscription_expires_at is not None:
            # Ensure DB timestamp compares with timezone-aware now
            expires_at = user.subscription_expires_at
            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)
            if now >= expires_at:
                user.subscription_tier = user.pending_subscription_tier or "free"
                user.pending_subscription_tier = None
                user.subscription_expires_at = None
                await self.db.flush()

        today = now.date()

        last_active = user.last_active_at

        # Only update/re-calculate streak if last_active is None or not today
        last_active_date = None
        if last_active is not None:
            last_active_date = last_active.date() if hasattr(last_active, 'date') else last_active

        if last_active_date is None or (today - last_active_date).days > 0:
            # Get learner profile for prior_knowledge tags
            profile_result = await self.db.execute(
                select(LearnerProfile).where(LearnerProfile.user_id == user.id)
            )
            learner_profile = profile_result.scalar_one_or_none()
            if learner_profile:
                prior = learner_profile.prior_knowledge or ""
                current_streak = self._parse_tag(prior, "Streak", 0)

                if last_active_date is not None:
                    diff = (today - last_active_date).days
                    if diff == 1:
                        new_streak = current_streak + 1
                    else:
                        new_streak = 1
                else:
                    new_streak = 1

                if new_streak != current_streak:
                    updated_prior = self._set_tag(prior, "Streak", new_streak)
                    learner_profile.prior_knowledge = updated_prior
                    await self.db.flush()

            user.last_active_at = now
            await self.db.flush()
            await self.db.commit()

    async def _get_db_users_data(self, current_user: User) -> list[dict]:
        # Get all users and their learner profiles
        stmt = select(User).options(selectinload(User.learner_profile))
        result = await self.db.execute(stmt)
        users = result.scalars().all()

        # Get enrolment counts
        from app.models.recommendation import Enrolment
        enrol_stmt = select(Enrolment.user_id, func.count(Enrolment.id)).group_by(Enrolment.user_id)
        enrol_result = await self.db.execute(enrol_stmt)
        enrolment_counts = {row[0]: row[1] for row in enrol_result.all()}

        db_users = []
        for u in users:
            prior = u.learner_profile.prior_knowledge if u.learner_profile else ""
            points = self._parse_tag(prior, "Points", 0)
            streak = self._parse_tag(prior, "Streak", 1)
            
            # calculate initials for avatar
            parts = u.full_name.strip().split()
            if not parts:
                avatar = "U"
            elif len(parts) == 1:
                avatar = parts[0][:2].upper()
            else:
                avatar = (parts[0][0] + parts[-1][0]).upper()

            # deterministic change based on name hash
            change = (hash(u.full_name) % 5) - 2

            db_users.append({
                "id": str(u.id),
                "name": u.full_name,
                "avatar": avatar,
                "points": points,
                "streak": streak,
                "courses": enrolment_counts.get(u.id, 0),
                "change": change,
                "country": "IN",
                "is_current": u.id == current_user.id
            })
        return db_users

    async def get_leaderboard(self, current_user: User) -> dict:
        """Return weekly, monthly, and all_time leaderboard lists.

        Backfills with mock templates if total DB users < 10.
        Marks current user with is_current = True.
        """
        # Fetch DB users data
        db_users = await self._get_db_users_data(current_user)

        # High-quality mock templates
        mock_templates = [
            {"name": "Ananya Patel", "avatar": "AP", "points": 24500, "streak": 120, "courses": 85, "change": 0, "country": "IN"},
            {"name": "Raj Malhotra", "avatar": "RM", "points": 22800, "streak": 95, "courses": 78, "change": 0, "country": "IN"},
            {"name": "Priya Sharma", "avatar": "PS", "points": 21500, "streak": 45, "courses": 72, "change": 1, "country": "IN"},
            {"name": "Amit Kumar", "avatar": "AK", "points": 19800, "streak": 38, "courses": 65, "change": -1, "country": "IN"},
            {"name": "Karthik Nair", "avatar": "KN", "points": 18400, "streak": 60, "courses": 58, "change": 2, "country": "IN"},
            {"name": "Sneha Reddy", "avatar": "SR", "points": 16500, "streak": 28, "courses": 45, "change": 3, "country": "IN"},
            {"name": "Rahul Verma", "avatar": "RV", "points": 14200, "streak": 32, "courses": 38, "change": 1, "country": "IN"},
            {"name": "Vikram Singh", "avatar": "VS", "points": 12500, "streak": 25, "courses": 32, "change": -2, "country": "IN"},
            {"name": "Meera Iyer", "avatar": "MI", "points": 11000, "streak": 55, "courses": 28, "change": 2, "country": "IN"},
            {"name": "Siddharth Rao", "avatar": "SR", "points": 9500, "streak": 18, "courses": 22, "change": -1, "country": "IN"},
        ]

        # We will generate lists for: weekly (0.2x multiplier), monthly (0.5x), all_time (1.0x)
        periods = {
            "weekly": 0.2,
            "monthly": 0.5,
            "all_time": 1.0
        }

        result = {}

        for period, multiplier in periods.items():
            # Build DB entries for this period
            entries = []
            db_names = set()
            for u in db_users:
                # Calculate scaled points and streak
                p = max(10, int(u["points"] * multiplier)) if u["points"] > 0 else 0
                s = max(1, int(u["streak"] * multiplier))
                entries.append({
                    "name": u["name"],
                    "avatar": u["avatar"],
                    "points": p,
                    "streak": s,
                    "courses": u["courses"],
                    "change": u["change"],
                    "country": u["country"],
                    "is_current": u["is_current"],
                })
                db_names.add(u["name"].lower())

            # Backfill with mock templates if total entries < 10
            # Ensure no name collisions
            mock_index = 0
            while len(entries) < 10 and mock_index < len(mock_templates):
                tpl = mock_templates[mock_index]
                if tpl["name"].lower() not in db_names:
                    p = int(tpl["points"] * multiplier)
                    s = int(tpl["streak"] * multiplier)
                    entries.append({
                        "name": tpl["name"],
                        "avatar": tpl["avatar"],
                        "points": p,
                        "streak": s,
                        "courses": tpl["courses"],
                        "change": tpl["change"],
                        "country": tpl["country"],
                        "is_current": False,
                    })
                mock_index += 1

            # Sort entries by points desc, then streak desc
            entries.sort(key=lambda x: (x["points"], x["streak"]), reverse=True)

            # Assign ranks (1-indexed)
            for idx, entry in enumerate(entries):
                entry["rank"] = idx + 1

            # If current user is not in the top 10, let's find the current user in all DB users for this period,
            # and append them as a special entry at the end!
            has_current = any(e["is_current"] for e in entries)
            if not has_current:
                # Find current user in the full DB list
                current_db_user = next((u for u in db_users if u["is_current"]), None)
                if current_db_user:
                    # We need to find their actual rank among ALL DB users + ALL mock templates!
                    full_list = []
                    db_names_full = set()
                    for u in db_users:
                        full_list.append({
                            "name": u["name"],
                            "avatar": u["avatar"],
                            "points": max(10, int(u["points"] * multiplier)) if u["points"] > 0 else 0,
                            "streak": max(1, int(u["streak"] * multiplier)),
                            "courses": u["courses"],
                            "change": u["change"],
                            "country": u["country"],
                            "is_current": u["is_current"],
                        })
                        db_names_full.add(u["name"].lower())
                    for tpl in mock_templates:
                        if tpl["name"].lower() not in db_names_full:
                            full_list.append({
                                "name": tpl["name"],
                                "avatar": tpl["avatar"],
                                "points": int(tpl["points"] * multiplier),
                                "streak": int(tpl["streak"] * multiplier),
                                "courses": tpl["courses"],
                                "change": tpl["change"],
                                "country": tpl["country"],
                                "is_current": False,
                            })
                    full_list.sort(key=lambda x: (x["points"], x["streak"]), reverse=True)
                    # Find rank of current user
                    current_rank = 1
                    for idx, e in enumerate(full_list):
                        if e["is_current"]:
                            current_rank = idx + 1
                            break
                    # Append current user to the top 10 entries with their actual rank
                    entries.append({
                        "name": current_db_user["name"],
                        "avatar": current_db_user["avatar"],
                        "points": max(10, int(current_db_user["points"] * multiplier)) if current_db_user["points"] > 0 else 0,
                        "streak": max(1, int(current_db_user["streak"] * multiplier)),
                        "courses": current_db_user["courses"],
                        "change": current_db_user["change"],
                        "country": current_db_user["country"],
                        "is_current": True,
                        "rank": current_rank
                    })

            result[period] = entries

        return result

    async def get_user_stats(self, user: User) -> dict:
        """Calculate real rank, streak, points and level for a user.

        Streak logic:
        - Throttled update of last_active_at and streak via update_user_activity().
        """
        # Ensure activity time and streak are up-to-date
        await self.update_user_activity(user)

        # Get leaderboard to find exact rank and total users
        leaderboard = await self.get_leaderboard(user)
        all_time_list = leaderboard["all_time"]

        # Find current user's entry in the all_time leaderboard
        current_entry = next((e for e in all_time_list if e["is_current"]), None)

        if current_entry:
            rank = current_entry["rank"]
            points = current_entry["points"]
            streak = current_entry["streak"]
        else:
            # Fallback if profile not created yet or user not in list
            profile_result = await self.db.execute(
                select(LearnerProfile).where(LearnerProfile.user_id == user.id)
            )
            learner_profile = profile_result.scalar_one_or_none()
            prior = learner_profile.prior_knowledge if learner_profile else ""
            streak = self._parse_tag(prior, "Streak", 1)
            points = self._parse_tag(prior, "Points", 0)
            rank = 1

        level = (points // 350) + 1

        # Return total users in the DB (scaled to at least 10 for backfills consistency)
        count_result = await self.db.execute(select(func.count()).select_from(User))
        total_db_users = count_result.scalar() or 1
        total_users = max(total_db_users, 10)

        return {
            "streak": streak,
            "rank": rank,
            "total_users": total_users,
            "points": points,
            "level": level,
        }