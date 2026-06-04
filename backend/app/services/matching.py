"""Matching engine - 3 layer architecture for course recommendations."""

import uuid
import numpy as np
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func
from sqlalchemy.orm import selectinload
from typing import Optional

from app.models.course import Course
from app.models.onboarding import LearnerProfile
from app.schemas.recommendations import MatchReport, WarningItem, CourseWithMatch
from app.ml.similarity import cosine_similarity, style_similarity, time_fit_score, quality_signal


WEIGHTS = {
    "career": 0.40,
    "vark": 0.15,
    "style": 0.15,
    "time": 0.10,
    "nsqf": 0.10,
    "quality": 0.10,
}


class MatchingService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_recommendations(
        self,
        profile: LearnerProfile,
        limit: int = 20,
        offset: int = 0,
    ) -> list[CourseWithMatch]:
        courses_result = await self.db.execute(
            select(Course).limit(200)
        )
        all_courses = courses_result.scalars().all()
        
        scored = []
        for course in all_courses:
            match_report = await self.compute_match_report(profile, course)
            if match_report.math_level != "EXCLUDE":
                scored.append((course, match_report))
        
        scored.sort(key=lambda x: x[1].overall_match_pct, reverse=True)
        
        results = []
        for i, (course, report) in enumerate(scored[offset:offset + limit]):
            results.append(CourseWithMatch(
                id=str(course.id),
                title=course.title,
                provider=course.provider,
                url=course.url,
                description=course.description,
                nsqf_level=course.nsqf_level,
                nsqf_sector=course.nsqf_sector,
                style_tags=course.style_tags,
                math_depth=course.math_depth,
                hours_per_week=course.hours_per_week,
                completion_rate=course.completion_rate,
                avg_rating=course.avg_rating,
                difficulty=course.difficulty,
                language=course.language,
                is_nsqf=course.nsqf_level > 0,
                match_report=report,
            ))
        
        return results

    async def compute_match_report(
        self,
        profile: LearnerProfile,
        course: Course,
    ) -> MatchReport:
        user_vark = [profile.vark_v, profile.vark_a, profile.vark_r, profile.vark_k]
        course_vark = [course.vark_v_score, course.vark_a_score, course.vark_r_score, course.vark_k_score]
        vark_sim = cosine_similarity(user_vark, course_vark)
        style_sim = style_similarity(profile.style_preferences, course.style_tags or [])
        time_fit = time_fit_score(profile.hours_per_week, course.hours_per_week)
        nsqf_match = profile.goal == "certification" and course.nsqf_level > 0
        quality = quality_signal(course.avg_rating, course.review_count)

        # Compute semantic/keyword matching boost with higher priority on career target
        career_target = (profile.career_target or "").lower()
        topic = (profile.topic or "").lower()
        course_text = f"{course.title} {course.description or ''} {' '.join(course.job_roles or [])} {course.nsqf_sector or ''}".lower()
        
        career_words = set([w for w in career_target.split() if len(w) > 2])
        topic_words = set([w for w in topic.split() if len(w) > 2])
        
        career_match = 0.0
        if career_words:
            overlap_career = [w for w in career_words if w in course_text]
            career_match = len(overlap_career) / len(career_words)
            
        topic_match = 0.0
        if topic_words:
            overlap_topic = [w for w in topic_words if w in course_text]
            topic_match = len(overlap_topic) / len(topic_words)
            
        if career_words and topic_words:
            word_match = 0.8 * career_match + 0.2 * topic_match
        elif career_words:
            word_match = career_match
        else:
            word_match = topic_match

        vark_pct = int(vark_sim * 100)
        style_pct = int(style_sim * 100)
        overall = int(
            (
                WEIGHTS["career"] * word_match +
                WEIGHTS["vark"] * vark_sim +
                WEIGHTS["style"] * style_sim +
                WEIGHTS["time"] * time_fit +
                WEIGHTS["nsqf"] * (1.0 if nsqf_match else 0.0) +
                WEIGHTS["quality"] * quality
            ) * 100
        )

        math_level, math_warning = self._check_math(profile.math_comfort, course.math_depth)

        warnings = []
        if math_level == "WARN":
            warnings.append(WarningItem(
                type="math",
                severity="warn",
                message=f"Requires calculus-level math (depth {course.math_depth})",
            ))
        if time_fit < 0.5 and time_fit > 0:
            warnings.append(WarningItem(
                type="time",
                severity="warn",
                message=f"Course needs {course.hours_per_week}hrs/week, you have {profile.hours_per_week}",
            ))

        label = "Strong Match" if overall >= 80 else "Good Match" if overall >= 65 else "Proceed with Caution" if overall >= 50 else "Not Recommended"

        time_fit_str = f"Good — {course.hours_per_week} hrs/week (you said {profile.hours_per_week} available)"
        if time_fit < 0.5:
            time_fit_str = f"Time mismatch — course needs {course.hours_per_week}hrs/week"

        return MatchReport(
            overall_match_pct=overall,
            vark_alignment_pct=vark_pct,
            style_match_pct=style_pct,
            time_fit=time_fit_str,
            nsqf_match=nsqf_match,
            math_level=math_level,
            math_warning_detail=math_warning,
            math_topics_ahead=course.math_topics or [],
            completion_rate_your_cluster=None,
            completion_rate_global=course.completion_rate,
            collab_confidence="LOW",
            week_breakdown=course.week_breakdown,
            recommendation_label=label,
            warnings=warnings,
            why_this_ranking=f"Scored {overall}% — VARK {vark_pct}%, Style {style_pct}%, Time {int(time_fit*100)}%",
        )

    def _check_math(self, comfort: int, depth: int) -> tuple[str, Optional[str]]:
        if depth <= comfort:
            return "PASS", None
        elif depth == comfort + 1:
            warning = f"Math warning: course requires level {depth} math (you rated {comfort})"
            return "WARN", warning
        else:
            warning = f"Math gap: course requires level {depth} math (you rated {comfort})"
            return "EXCLUDE", warning