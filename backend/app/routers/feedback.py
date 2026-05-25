"""Feedback router - proxies feedback to Google Apps Script Web App."""

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
import redis.asyncio as redis
from pydantic import BaseModel, Field
import httpx

from app.db.session import get_db
from app.db.redis import get_redis
from app.services.auth import AuthService
from app.config import settings
from app.schemas.common import ApiResponse

router = APIRouter(prefix="/feedback", tags=["feedback"])


class FeedbackPayload(BaseModel):
    title: str
    message: str
    page: str


@router.post("/submit")
async def submit_feedback(
    payload: FeedbackPayload,
    db: AsyncSession = Depends(get_db),
    redis_client: redis.Redis = Depends(get_redis),
    authorization: str = Header(None),
):
    """Submits student feedback, forwarding it to a Google Apps Script endpoint if configured."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization")
    
    token = authorization.replace("Bearer ", "")
    auth_service = AuthService(db, redis_client)
    user = await auth_service.get_current_user(token)

    feedback_data = {
        "page": payload.page,
        "role": "student",
        "plan": user.subscription_tier or "free",
        "email": user.email,
        "phone": "",
        "name": user.full_name or "",
        "title": payload.title,
        "message": payload.message
    }

    if not settings.APPS_SCRIPT_URL:
        # Fallback to local log when no Google Apps Script is configured
        print("FEEDBACK RECEIVED (Demo mode):", feedback_data)
        return ApiResponse.ok({
            "status": "success",
            "is_mock": True,
            "message": "Feedback logged locally (Google Apps Script URL not configured)."
        })

    try:
        async with httpx.AsyncClient() as client:
            # POST to Google Apps Script Web App
            response = await client.post(
                settings.APPS_SCRIPT_URL,
                json=feedback_data,
                headers={"Content-Type": "application/json"},
                timeout=10.0,
                follow_redirects=True  # Apps Script web apps redirect to unique endpoints
            )
            
            if response.status_code in [200, 201]:
                return ApiResponse.ok({
                    "status": "success",
                    "is_mock": False,
                    "message": "Feedback submitted successfully to Google Apps Script."
                })
            else:
                print(f"Apps Script failed with status {response.status_code}: {response.text}")
                return ApiResponse.ok({
                    "status": "success",
                    "is_mock": True,
                    "message": f"Forwarding failed (status {response.status_code}). Logged feedback locally."
                })
    except Exception as e:
        print(f"Apps Script connection failed: {str(e)}")
        return ApiResponse.ok({
            "status": "success",
            "is_mock": True,
            "message": f"Connection failed: {str(e)}. Logged feedback locally."
        })


contact_router = APIRouter(prefix="/contact", tags=["contact"])


class ContactPayload(BaseModel):
    name: str
    email: str
    phone: str
    title: str
    message: str
    page: str = "/contact"


@contact_router.post("/submit")
async def submit_contact(
    payload: ContactPayload,
    db: AsyncSession = Depends(get_db),
    redis_client: redis.Redis = Depends(get_redis),
    authorization: str = Header(None),
):
    """Submits contact form, forwarding to Google Apps Script. Accessible to guests and logged-in users."""
    role = "guest"
    plan = "guest"
    email = payload.email
    name = payload.name

    if authorization:
        try:
            token = authorization.replace("Bearer ", "")
            auth_service = AuthService(db, redis_client)
            user = await auth_service.get_current_user(token)
            if user:
                role = "student"
                plan = user.subscription_tier or "free"
                if not name.strip():
                    name = user.full_name
                if not email.strip():
                    email = user.email
        except Exception:
            pass

    contact_data = {
        "page": payload.page,
        "role": role,
        "plan": plan,
        "email": email,
        "phone": payload.phone,
        "name": name,
        "title": payload.title,
        "message": payload.message
    }

    if not settings.APPS_SCRIPT_URL:
        print("CONTACT RECEIVED (Demo mode):", contact_data)
        return ApiResponse.ok({
            "status": "success",
            "is_mock": True,
            "message": "Contact message logged locally (Google Apps Script URL not configured)."
        })

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                settings.APPS_SCRIPT_URL,
                json=contact_data,
                headers={"Content-Type": "application/json"},
                timeout=10.0,
                follow_redirects=True
            )
            
            if response.status_code in [200, 201]:
                return ApiResponse.ok({
                    "status": "success",
                    "is_mock": False,
                    "message": "Contact message submitted successfully to Google Apps Script."
                })
            else:
                print(f"Apps Script failed with status {response.status_code}: {response.text}")
                return ApiResponse.ok({
                    "status": "success",
                    "is_mock": True,
                    "message": f"Forwarding failed (status {response.status_code}). Logged contact locally."
                })
    except Exception as e:
        print(f"Apps Script connection failed: {str(e)}")
        return ApiResponse.ok({
            "status": "success",
            "is_mock": True,
            "message": f"Connection failed: {str(e)}. Logged contact locally."
        })
