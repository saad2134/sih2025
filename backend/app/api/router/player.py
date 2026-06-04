from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models import Course, Enrolment
from app.models.adaptive import CourseActivity, UserEngagementProfile
from app.services.embed_player import embed_player_service, progress_tracker
from app.services.anomaly_detection import anomaly_monitor


router = APIRouter(prefix="/api/player", tags=["player"])


class VideoEvent(BaseModel):
    enrolment_id: str
    lesson_id: str
    lesson_type: str = "video"
    event_type: str
    position: int = 0
    duration: int = 0
    paused_at: Optional[int] = None
    seek_from: Optional[int] = None
    seek_to: Optional[int] = None
    video_ended: bool = False


class EmbedResponse(BaseModel):
    embed_enabled: bool
    embed_type: str
    embed_provider: Optional[str]
    embed_id: Optional[str]
    embed_html: Optional[str]
    tracking_enabled: bool
    redirect_url: Optional[str] = None


class ProgressUpdate(BaseModel):
    enrolment_id: str
    lesson_id: str
    lesson_type: str
    position: int
    duration: int
    completed: bool = False


@router.get("/course/{course_id}/embed", response_model=EmbedResponse)
async def get_course_embed(
    course_id: str,
    autoplay: bool = False,
    start_time: int = 0,
    db: Session = Depends(get_db),
):
    """Get embed HTML for a course video player."""
    course = db.query(Course).filter(Course.id == course_id).first()

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    result = embed_player_service.get_embed_html(
        provider=str(course.embed_provider or "none"),
        url=str(course.url or ""),
        is_embeddable=bool(course.is_embeddable),
        autoplay=autoplay,
        start_time=start_time,
    )

    return EmbedResponse(**result)


@router.get("/course/{course_id}/tracking-config")
async def get_tracking_config(course_id: str, db: Session = Depends(get_db)):
    """Get tracking configuration for the embedded player."""
    course = db.query(Course).filter(Course.id == course_id).first()

    if not course or not course.is_embeddable:
        return {"enabled": False}

    return embed_player_service.get_tracking_config(
        provider=str(course.embed_provider or "youtube"),
        embed_id=str(course.embed_id or ""),
    )


@router.post("/event")
async def record_video_event(event: VideoEvent, db: Session = Depends(get_db)):
    """Record video playback events and detect anomalies."""
    enrolment = db.query(Enrolment).filter(Enrolment.id == event.enrolment_id).first()

    if not enrolment:
        raise HTTPException(status_code=404, detail="Enrollment not found")

    activity_data = {
        "enrolment_id": event.enrolment_id,
        "lesson_id": event.lesson_id,
        "activity_type": event.lesson_type,
        "duration_seconds": event.duration,
        "video_position": event.position,
        "video_duration": event.duration,
        "video_ended": 1 if event.video_ended else 0,
        "seek_count": 1 if event.event_type == "seek" else 0,
        "pause_count": 1 if event.event_type == "pause" else 0,
        "embed_provider": enrolment.course.embed_provider if enrolment.course else None,
        "timestamp": datetime.utcnow(),
        "interactions": [
            {
                "type": event.event_type,
                "position": event.position,
                "duration": event.duration,
                "seek_from": event.seek_from,
                "seek_to": event.seek_to,
            }
        ],
    }

    prev_activity = (
        db.query(CourseActivity)
        .filter(CourseActivity.enrolment_id == event.enrolment_id)
        .order_by(CourseActivity.timestamp.desc())
        .first()
    )

    prev_data = None
    if prev_activity:
        prev_data = {
            "duration_seconds": prev_activity.duration_seconds,
            "idle_seconds": prev_activity.idle_seconds,
            "pause_count": prev_activity.pause_count,
            "seek_count": prev_activity.seek_count,
            "scroll_depth": prev_activity.scroll_depth,
            "interactions": prev_activity.interactions,
            "timestamp": prev_activity.timestamp,
        }

    anomaly_result = anomaly_monitor.analyze_activity(activity_data, prev_data)

    db_activity = CourseActivity(
        enrolment_id=event.enrolment_id,
        lesson_id=event.lesson_id,
        activity_type=event.lesson_type,
        duration_seconds=event.duration,
        video_position=event.position,
        video_duration=event.duration,
        video_ended=1 if event.video_ended else 0,
        seek_count=1 if event.event_type == "seek" else 0,
        pause_count=1 if event.event_type == "pause" else 0,
        embed_provider=enrolment.course.embed_provider if enrolment.course else None,
        is_anomaly="yes" if anomaly_result["is_anomaly"] else "no",
        anomaly_type=anomaly_result["anomaly_type"],
        anomaly_score=anomaly_result["anomaly_score"],
    )
    db.add(db_activity)

    enrolment.current_lesson_id = event.lesson_id
    enrolment.current_lesson_type = event.lesson_type
    enrolment.current_position = event.position

    if event.event_type == "timeupdate" and event.duration > 0:
        enrolment.progress_percent = min((event.position / event.duration) * 100, 99.9)

    if event.video_ended or event.completed:
        if enrolment.progress_percent < 100:
            enrolment.progress_percent = 100.0
            enrolment.completed_at = datetime.utcnow()

    enrolment.last_watched_at = datetime.utcnow()

    engagement_profile = (
        db.query(UserEngagementProfile)
        .filter(
            UserEngagementProfile.user_id == enrolment.user_id,
            UserEngagementProfile.course_id == enrolment.course_id,
        )
        .first()
    )

    if engagement_profile:
        engagement_profile.last_updated = datetime.utcnow()
        if anomaly_result["is_anomaly"]:
            engagement_profile.anomaly_count += 1
            if anomaly_result["anomaly_type"] == "struggle":
                engagement_profile.struggle_count += 1
            elif anomaly_result["anomaly_type"] == "bored":
                engagement_profile.bored_count += 1
            elif anomaly_result["anomaly_type"] == "skipping":
                engagement_profile.skipping_count += 1

    db.commit()

    return {
        "status": "recorded",
        "anomaly": anomaly_result,
        "recommendation": anomaly_result.get("recommendation"),
    }


@router.post("/progress")
async def update_progress(progress: ProgressUpdate, db: Session = Depends(get_db)):
    """Update course progress."""
    enrolment = (
        db.query(Enrolment).filter(Enrolment.id == progress.enrolment_id).first()
    )

    if not enrolment:
        raise HTTPException(status_code=404, detail="Enrollment not found")

    enrolment.current_lesson_id = progress.lesson_id
    enrolment.current_lesson_type = progress.lesson_type

    if progress.duration > 0:
        enrolment.current_position = progress.position
        enrolment.progress_percent = min(
            (progress.position / progress.duration) * 100, 99.9
        )

    if progress.completed:
        enrolment.progress_percent = 100.0
        if not enrolment.completed_at:
            enrolment.completed_at = datetime.utcnow()

    enrolment.last_watched_at = datetime.utcnow()
    db.commit()

    return {
        "status": "updated",
        "progress_percent": enrolment.progress_percent,
        "completed": bool(enrolment.completed_at),
    }


@router.get("/enrolment/{enrolment_id}/status")
async def get_enrolment_status(enrolment_id: str, db: Session = Depends(get_db)):
    """Get current enrollment playback status."""
    enrolment = db.query(Enrolment).filter(Enrolment.id == enrolment_id).first()

    if not enrolment:
        raise HTTPException(status_code=404, detail="Enrollment not found")

    course = enrolment.course

    embed_info = None
    if course and course.embed_enabled:
        embed_info = embed_player_service.get_embed_html(
            provider=course.embed_provider or "none",
            url=course.url or "",
            embed_enabled=course.embed_enabled,
            start_time=enrolment.current_position or 0,
        )

    return {
        "enrolment_id": enrolment.id,
        "course_id": enrolment.course_id,
        "course_title": course.title if course else None,
        "progress_percent": enrolment.progress_percent,
        "current_lesson_id": enrolment.current_lesson_id,
        "current_lesson_type": enrolment.current_lesson_type,
        "current_position": enrolment.current_position,
        "total_watch_time": enrolment.total_watch_time,
        "status": enrolment.status,
        "completed": bool(enrolment.completed_at),
        "enrolled_at": enrolment.enrolled_at.isoformat()
        if enrolment.enrolled_at
        else None,
        "completed_at": enrolment.completed_at.isoformat()
        if enrolment.completed_at
        else None,
        "embed": embed_info,
    }


@router.get("/enrolment/{enrolment_id}/next")
async def get_next_lesson(enrolment_id: str, db: Session = Depends(get_db)):
    """Get the next lesson to play."""
    enrolment = db.query(Enrolment).filter(Enrolment.id == enrolment_id).first()

    if not enrolment:
        raise HTTPException(status_code=404, detail="Enrollment not found")

    course = enrolment.course

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    week_breakdown = course.week_breakdown
    current_lesson = enrolment.current_lesson_id

    next_lesson = None

    if week_breakdown and isinstance(week_breakdown, list):
        found_current = False
        for week in week_breakdown:
            if "lessons" in week:
                for lesson in week["lessons"]:
                    if found_current:
                        next_lesson = lesson
                        break
                    if lesson.get("id") == current_lesson:
                        found_current = True
                if next_lesson:
                    break

        if not next_lesson and not found_current and week_breakdown:
            first_week = week_breakdown[0]
            if "lessons" in first_week and first_week["lessons"]:
                next_lesson = first_week["lessons"][0]

    if not next_lesson and course.url:
        next_lesson = {
            "id": "default",
            "title": "Start Course",
            "type": "video",
            "url": course.url,
        }

    return {
        "next_lesson": next_lesson,
        "course": {
            "id": course.id,
            "title": course.title,
            "embed_enabled": course.embed_enabled,
            "embed_provider": course.embed_provider,
        },
    }
