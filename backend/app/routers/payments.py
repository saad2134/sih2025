"""Payments router - Polar.sh integration and local mock billing fallback."""

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
import redis.asyncio as redis
import httpx
import json

from app.db.session import get_db
from app.db.redis import get_redis
from app.services.auth import AuthService
from app.config import settings
from app.schemas.common import ApiResponse
from app.models.user import User

router = APIRouter(prefix="/payments", tags=["payments"])


@router.post("/checkout")
async def create_checkout(
    plan: str = "pro",
    db: AsyncSession = Depends(get_db),
    redis_client: redis.Redis = Depends(get_redis),
    authorization: str = Header(None),
):
    """Generate checkout session. Fallbacks to mock checkout if API key not configured."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization")
    
    token = authorization.replace("Bearer ", "")
    auth_service = AuthService(db, redis_client)
    user = await auth_service.get_current_user(token)

    # 1. Determine checkout URL from settings based on requested plan
    checkout_url = None
    if plan.lower() == "premium":
        checkout_url = settings.POLAR_PREMIUM_CHECKOUT_URL
    else:
        checkout_url = settings.POLAR_PRO_CHECKOUT_URL

    # 2. If we have a pre-configured Polar checkout URL, append metadata & email and return it
    if checkout_url and checkout_url != "will_be_added_soon":
        import urllib.parse
        parsed = urllib.parse.urlparse(checkout_url)
        query = urllib.parse.parse_qs(parsed.query)
        query['customer_email'] = [user.email]
        query['metadata[user_id]'] = [str(user.id)]
        query['metadata[subscription_tier]'] = [plan.lower()]
        
        # Append product_id parameter to pre-select the specific plan if configured
        product_id = settings.POLAR_PREMIUM_PRODUCT_ID if plan.lower() == "premium" else settings.POLAR_PRO_PRODUCT_ID
        if product_id:
            query['product_id'] = [product_id]
            
        new_query = urllib.parse.urlencode(query, doseq=True)
        final_url = urllib.parse.urlunparse((
            parsed.scheme,
            parsed.netloc,
            parsed.path,
            parsed.params,
            new_query,
            parsed.fragment
        ))
        
        return ApiResponse.ok({
            "checkout_url": final_url,
            "is_mock": False
        })

    # 3. Fallback to dynamic Polar.sh API Integration if API key is present
    if settings.POLAR_API_KEY:
        # Try standard checkouts endpoint first
        polar_url = "https://api.polar.sh/api/v1/checkouts/"
        headers = {
            "Authorization": f"Bearer {settings.POLAR_API_KEY}",
            "Content-Type": "application/json"
        }
        product_id = settings.POLAR_PREMIUM_PRODUCT_ID if plan.lower() == "premium" else settings.POLAR_PRO_PRODUCT_ID
        
        payload = {
            "success_url": f"http://localhost:3000/student/billing?success=true&plan={plan.lower()}",
            "customer_email": user.email,
            "metadata": {
                "user_id": str(user.id),
                "subscription_tier": plan.lower()
            }
        }
        if product_id:
            payload["products"] = [product_id]
        else:
            payload["product_price_id"] = "YOUR_POLAR_PRODUCT_PRICE_ID"

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(polar_url, json=payload, headers=headers, timeout=10.0)
                if response.status_code == 201:
                    data = response.json()
                    return ApiResponse.ok({
                        "checkout_url": data.get("url"),
                        "is_mock": False
                    })
                else:
                    # Try fallback to /checkouts/custom/ if they are on an older version of the Polar account
                    polar_url_old = "https://api.polar.sh/api/v1/checkouts/custom/"
                    payload_old = {
                        "success_url": f"http://localhost:3000/student/billing?success=true&plan={plan.lower()}",
                        "customer_email": user.email,
                        "metadata": {
                            "user_id": str(user.id),
                            "subscription_tier": plan.lower()
                        }
                    }
                    if product_id:
                        payload_old["product_price_id"] = product_id
                    else:
                        payload_old["product_price_id"] = "YOUR_POLAR_PRODUCT_PRICE_ID"
                    
                    response_old = await client.post(polar_url_old, json=payload_old, headers=headers, timeout=10.0)
                    if response_old.status_code == 201:
                        data = response_old.json()
                        return ApiResponse.ok({
                            "checkout_url": data.get("url"),
                            "is_mock": False
                        })
                    
                    # Log error and fallback
                    mock_success_url = f"http://localhost:3000/student/billing?mock_success=true&plan={plan.lower()}"
                    return ApiResponse.ok({
                        "checkout_url": mock_success_url,
                        "is_mock": True,
                        "message": f"Polar API error: {response.text} / {response_old.text}. Falling back to mock."
                    })
        except Exception as e:
            mock_success_url = f"http://localhost:3000/student/billing?mock_success=true&plan={plan.lower()}"
            return ApiResponse.ok({
                "checkout_url": mock_success_url,
                "is_mock": True,
                "message": f"Connection to Polar failed: {str(e)}. Falling back to mock."
            })

    # 4. Local mock checkout fallback
    mock_success_url = f"http://localhost:3000/student/billing?mock_success=true&plan={plan.lower()}"
    return ApiResponse.ok({
        "checkout_url": mock_success_url,
        "is_mock": True,
        "message": f"Polar checkout URL or API Key not configured. Using local mock checkout for plan: {plan}."
    })


async def cancel_polar_subscription(subscription_id: str, plan: str) -> bool:
    """Helper to cancel Polar subscription at period end or change product."""
    if not settings.POLAR_API_KEY or not subscription_id:
        return False
    
    headers = {
        "Authorization": f"Bearer {settings.POLAR_API_KEY}",
        "Content-Type": "application/json"
    }
    url = f"https://api.polar.sh/api/v1/subscriptions/{subscription_id}"
    
    try:
        async with httpx.AsyncClient() as client:
            if plan.lower() == "free":
                # Cancel at period end
                payload = {"cancel_at_period_end": True}
                res = await client.patch(url, json=payload, headers=headers, timeout=10.0)
                return res.status_code in [200, 201]
            else:
                # Downgrade from Premium to Pro
                product_id = settings.POLAR_PRO_PRODUCT_ID
                if product_id:
                    # Upgrade/downgrade subscription product at next billing cycle
                    payload = {
                        "product_id": product_id,
                        "proration_behavior": "next_period"
                    }
                    res = await client.patch(url, json=payload, headers=headers, timeout=10.0)
                    if res.status_code in [200, 201]:
                        return True
                    # Fallback to cancel at period end so they don't get charged premium price
                    payload = {"cancel_at_period_end": True}
                    res = await client.patch(url, json=payload, headers=headers, timeout=10.0)
                    return res.status_code in [200, 201]
    except Exception as e:
        print(f"Error calling Polar API: {e}")
    return False


@router.post("/mock-confirm")
async def mock_confirm_payment(
    plan: str = "pro",
    db: AsyncSession = Depends(get_db),
    redis_client: redis.Redis = Depends(get_redis),
    authorization: str = Header(None),
):
    """Updates user subscription status for local testing without real webhook."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization")
    
    token = authorization.replace("Bearer ", "")
    auth_service = AuthService(db, redis_client)
    user = await auth_service.get_current_user(token)

    from datetime import datetime, timedelta, timezone
    
    PLAN_ORDER = {"free": 0, "pro": 1, "premium": 2}
    current_tier = user.subscription_tier or "free"
    target_tier = plan.lower()
    
    current_order = PLAN_ORDER.get(current_tier, 0)
    target_order = PLAN_ORDER.get(target_tier, 0)

    # 1. Handle downgrade logic
    if target_order < current_order:
        # Schedule downgrade at period end (e.g. 30 days from now for mock)
        period_end = datetime.now(timezone.utc) + timedelta(days=30)
        user.pending_subscription_tier = target_tier
        user.subscription_expires_at = period_end
        
        # 2. Try to change/cancel plan in Polar if subscription exists
        polar_cancelled = False
        if user.polar_subscription_id:
            polar_cancelled = await cancel_polar_subscription(user.polar_subscription_id, target_tier)
            
        await db.commit()
        return ApiResponse.ok({
            "status": "success",
            "subscription_tier": user.subscription_tier,
            "pending_subscription_tier": user.pending_subscription_tier,
            "subscription_expires_at": user.subscription_expires_at.isoformat(),
            "polar_updated": polar_cancelled,
            "message": f"Subscription downgrade to {target_tier} scheduled. You retain {current_tier} benefits until {user.subscription_expires_at.strftime('%Y-%m-%d')}."
        })
    else:
        # 3. Handle upgrade logic (immediate transition)
        user.subscription_tier = target_tier
        user.pending_subscription_tier = None
        user.subscription_expires_at = None
        
        # Give mock subscription ID if none exists for checkout confirmation testing
        if not user.polar_subscription_id:
            user.polar_subscription_id = "mock_sub_id_" + str(user.id)[:8]
            
        await db.commit()
        
        return ApiResponse.ok({
            "status": "success",
            "subscription_tier": user.subscription_tier,
            "message": f"Subscription successfully updated to {user.subscription_tier}."
        })


@router.post("/confirm-checkout")
async def confirm_checkout(
    checkout_id: str,
    customer_session_token: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    redis_client: redis.Redis = Depends(get_redis),
    authorization: str = Header(None),
):
    """Confirm a Polar checkout session and update user subscription status."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization")
    
    token = authorization.replace("Bearer ", "")
    auth_service = AuthService(db, redis_client)
    user = await auth_service.get_current_user(token)

    # 1. If Polar API Key is set, query Polar to check status
    if settings.POLAR_API_KEY:
        url = f"https://api.polar.sh/api/v1/checkouts/{checkout_id}"
        headers = {
            "Authorization": f"Bearer {settings.POLAR_API_KEY}"
        }
        try:
            async with httpx.AsyncClient() as client:
                res = await client.get(url, headers=headers, timeout=10.0)
                if res.status_code == 200:
                    data = res.json()
                    status_str = data.get("status")
                    metadata = data.get("metadata", {})
                    
                    # A. SECURITY CHECK: Verify user_id in checkout matches logged-in user
                    checkout_user_id = metadata.get("user_id")
                    if checkout_user_id and checkout_user_id != str(user.id):
                        raise HTTPException(
                            status_code=403,
                            detail="Checkout session does not belong to the current user."
                        )
                        
                    # B. SECURITY CHECK: Check for replay attack (duplicate subscription ID)
                    sub_id = data.get("subscription_id") or data.get("id")
                    if sub_id:
                        from sqlalchemy import select
                        dup_result = await db.execute(
                            select(User).where(User.polar_subscription_id == sub_id, User.id != user.id)
                        )
                        duplicate_user = dup_result.scalar_one_or_none()
                        if duplicate_user:
                            raise HTTPException(
                                status_code=400,
                                detail="This checkout session has already been claimed by another user."
                            )

                    product_id = data.get("product_id")
                    tier = None
                    if product_id:
                        if product_id == settings.POLAR_PREMIUM_PRODUCT_ID:
                            tier = "premium"
                        elif product_id == settings.POLAR_PRO_PRODUCT_ID:
                            tier = "pro"
                            
                    if not tier:
                        tier = metadata.get("subscription_tier")
                        
                    if not tier:
                        tier = "pro"
                    
                    if status_str in ["succeeded", "confirmed"]:
                        user.subscription_tier = tier.lower()
                        user.polar_subscription_id = sub_id
                        user.pending_subscription_tier = None
                        user.subscription_expires_at = None
                        await db.commit()
                        
                        return ApiResponse.ok({
                            "status": "success",
                            "subscription_tier": user.subscription_tier,
                            "message": f"Payment verified! Upgraded to {user.subscription_tier}."
                        })
                    else:
                        raise HTTPException(
                            status_code=400,
                            detail=f"Checkout status is {status_str}, not succeeded."
                        )
                elif res.status_code == 404:
                    raise HTTPException(
                        status_code=404,
                        detail="Checkout session not found on Polar."
                    )
                else:
                    raise HTTPException(
                        status_code=res.status_code,
                        detail="Failed to retrieve checkout details from Polar."
                    )
        except HTTPException:
            raise
        except Exception as e:
            # Only allow fallback to mock if ENVIRONMENT is development
            if settings.ENVIRONMENT != "development":
                raise HTTPException(
                    status_code=500,
                    detail=f"Polar API communication error: {str(e)}"
                )

    # 2. Fallback to mock subscription confirmation (Only allowed in local development)
    if settings.ENVIRONMENT != "development":
        raise HTTPException(
            status_code=400,
            detail="Mock checkouts are only permitted in development mode."
        )

    tier = "pro"
    if "premium" in checkout_id.lower():
        tier = "premium"
    elif "pro" in checkout_id.lower():
        tier = "pro"
        
    user.subscription_tier = tier
    user.pending_subscription_tier = None
    user.subscription_expires_at = None
    if not user.polar_subscription_id:
        user.polar_subscription_id = "mock_sub_id_" + checkout_id[:8]
        
    await db.commit()
    
    return ApiResponse.ok({
        "status": "success",
        "subscription_tier": user.subscription_tier,
        "message": f"Payment mock-verified! Subscription upgraded to {user.subscription_tier}."
    })


@router.post("/webhook")
async def polar_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """Receives Polar.sh webhook event to activate premium subscriptions."""
    payload = await request.body()
    signature = request.headers.get("webhook-signature")
    
    # In production, verify webhook signature using settings.POLAR_WEBHOOK_SECRET
    # and polar helper libraries or standard hmac sha256.
    
    try:
        event = json.loads(payload)
        event_type = event.get("type")
        event_data = event.get("data", {})
        
        # Look for user_id in metadata
        metadata = event_data.get("metadata", {})
        user_id_str = metadata.get("user_id")
        tier = metadata.get("subscription_tier", "pro") # Default to pro
        
        if event_type in ["subscription.created", "order.created"] and user_id_str:
            import uuid
            user_id = uuid.UUID(user_id_str)
            user = await db.get(User, user_id)
            if user:
                product_id = event_data.get("product_id")
                tier = None
                if product_id:
                    if product_id == settings.POLAR_PREMIUM_PRODUCT_ID:
                        tier = "premium"
                    elif product_id == settings.POLAR_PRO_PRODUCT_ID:
                        tier = "pro"
                        
                if not tier:
                    tier = metadata.get("subscription_tier")
                    
                if not tier:
                    tier = "pro"

                user.subscription_tier = tier.lower()
                user.polar_subscription_id = event_data.get("id")
                # Clear pending transitions
                user.pending_subscription_tier = None
                user.subscription_expires_at = None
                await db.commit()
                return {"status": "success", "message": f"User subscription upgraded to {tier}."}
                
        elif event_type == "subscription.updated" and user_id_str:
            import uuid
            from datetime import datetime
            user_id = uuid.UUID(user_id_str)
            user = await db.get(User, user_id)
            if user:
                user.polar_subscription_id = event_data.get("id")
                cancel_at_period_end = event_data.get("cancel_at_period_end", False)
                period_end = event_data.get("current_period_end")
                
                # If they cancelled the plan to go back to free
                if cancel_at_period_end:
                    user.pending_subscription_tier = "free"
                    if period_end:
                        try:
                            user.subscription_expires_at = datetime.fromisoformat(period_end.replace("Z", "+00:00"))
                        except Exception:
                            pass
                
                # If they changed product ID (upgrade or downgrade)
                product_id = event_data.get("product_id")
                if product_id:
                    # Determine target tier from product ID
                    target_tier = "free"
                    if product_id == settings.POLAR_PREMIUM_PRODUCT_ID:
                        target_tier = "premium"
                    elif product_id == settings.POLAR_PRO_PRODUCT_ID:
                        target_tier = "pro"
                        
                    PLAN_ORDER = {"free": 0, "pro": 1, "premium": 2}
                    current_tier = user.subscription_tier or "free"
                    
                    if PLAN_ORDER.get(target_tier, 0) < PLAN_ORDER.get(current_tier, 0):
                        # Downgrade: keep benefits until period end
                        user.pending_subscription_tier = target_tier
                        if period_end:
                            try:
                                user.subscription_expires_at = datetime.fromisoformat(period_end.replace("Z", "+00:00"))
                            except Exception:
                                pass
                    else:
                        # Upgrade: immediate switch
                        user.subscription_tier = target_tier
                        user.pending_subscription_tier = None
                        user.subscription_expires_at = None
                        
                await db.commit()
                return {"status": "success", "message": "Subscription updated."}
                
        elif event_type == "subscription.canceled" and user_id_str:
            import uuid
            user_id = uuid.UUID(user_id_str)
            user = await db.get(User, user_id)
            if user:
                user.subscription_tier = "free"
                user.pending_subscription_tier = None
                user.subscription_expires_at = None
                await db.commit()
                return {"status": "success", "message": "Subscription canceled."}
                
        return {"status": "ignored", "message": "Event type not processed."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
