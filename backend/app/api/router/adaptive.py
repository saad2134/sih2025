from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.adaptive import (
    CourseActivity,
    UserEngagementProfile,
    AdaptiveRecommendation,
    QuizQuestion,
    QuizAttempt,
    LearningState,
    Intervention,
)
from app.services.anomaly_detection import anomaly_monitor, get_anomaly_status
from app.services.forgetting_curve import quiz_session_manager, forgetting_curve_engine
from app.services.adaptive_rl import adaptive_engine


router = APIRouter(prefix="/api/adaptive", tags=["adaptive"])


class ActivityRecord(BaseModel):
    enrolment_id: str
    lesson_id: Optional[str] = None
    activity_type: str
    duration_seconds: int = 0
    scroll_depth: Optional[float] = None
    pause_count: int = 0
    seek_count: int = 0
    idle_seconds: int = 0
    interactions: List[dict] = []
    progress_percent: Optional[float] = None


class AnomalyResponse(BaseModel):
    is_anomaly: bool
    anomaly_type: str
    anomaly_score: float
    pattern_detected: Optional[str]
    recommendation: Optional[dict]
    timestamp: Optional[str]


class QuizAnswer(BaseModel):
    question_id: str
    selected_answer: str
    quality: int = Field(..., ge=0, le=5)
    time_taken_seconds: int


class AdaptiveRecommendationResponse(BaseModel):
    action: str
    state: str
    message: str
    type: str
    priority: int
    confidence: float
    context: dict


@router.post("/activity", response_model=AnomalyResponse)
async def record_activity(activity: ActivityRecord, db: Session = Depends(get_db)):
    """Record user activity and detect anomalies in real-time."""

    activity_data = activity.model_dump()
    activity_data["timestamp"] = datetime.utcnow()

    last_activity = (
        db.query(CourseActivity)
        .filter(CourseActivity.enrolment_id == activity.enrolment_id)
        .order_by(CourseActivity.timestamp.desc())
        .first()
    )

    prev_activity = None
    if last_activity:
        prev_activity = {
            "duration_seconds": last_activity.duration_seconds,
            "idle_seconds": last_activity.idle_seconds,
            "pause_count": last_activity.pause_count,
            "seek_count": last_activity.seek_count,
            "scroll_depth": last_activity.scroll_depth,
            "interactions": last_activity.interactions,
            "progress_percent": last_activity.enrolment.progress_percent
            if last_activity.enrolment
            else 0,
            "timestamp": last_activity.timestamp,
        }

    anomaly_result = anomaly_monitor.analyze_activity(activity_data, prev_activity)

    db_activity = CourseActivity(
        enrolment_id=activity.enrolment_id,
        lesson_id=activity.lesson_id,
        activity_type=activity.activity_type,
        duration_seconds=activity.duration_seconds,
        scroll_depth=activity.scroll_depth,
        pause_count=activity.pause_count,
        seek_count=activity.seek_count,
        idle_seconds=activity.idle_seconds,
        interactions=activity.interactions,
        is_anomaly="yes" if anomaly_result["is_anomaly"] else "no",
        anomaly_type=anomaly_result["anomaly_type"],
        anomaly_score=anomaly_result["anomaly_score"],
    )
    db.add(db_activity)

    engagement_profile = (
        db.query(UserEngagementProfile)
        .filter(
            UserEngagementProfile.user_id == db_activity.enrolment.user_id
            if db_activity.enrolment
            else None,
            UserEngagementProfile.course_id == db_activity.enrolment.course_id
            if db_activity.enrolment
            else None,
        )
        .first()
    )

    if engagement_profile:
        if anomaly_result["is_anomaly"]:
            engagement_profile.anomaly_count += 1
            if anomaly_result["anomaly_type"] == "struggle":
                engagement_profile.struggle_count += 1
            elif anomaly_result["anomaly_type"] == "bored":
                engagement_profile.bored_count += 1
            elif anomaly_result["anomaly_type"] == "skipping":
                engagement_profile.skipping_count += 1
            engagement_profile.last_anomaly_at = datetime.utcnow()

    db.commit()

    return AnomalyResponse(**anomaly_result)


@router.get("/engagement/{user_id}/{course_id}")
async def get_engagement_profile(
    user_id: str, course_id: str, db: Session = Depends(get_db)
):
    """Get user engagement profile for a course."""
    profile = (
        db.query(UserEngagementProfile)
        .filter(
            UserEngagementProfile.user_id == user_id,
            UserEngagementProfile.course_id == course_id,
        )
        .first()
    )

    if not profile:
        raise HTTPException(status_code=404, detail="Engagement profile not found")

    return {
        "avg_session_duration": profile.avg_session_duration,
        "avg_completion_speed": profile.avg_completion_speed,
        "avg_idle_time": profile.avg_idle_time,
        "avg_pause_frequency": profile.avg_pause_frequency,
        "avg_scroll_depth": profile.avg_scroll_depth,
        "interaction_density": profile.interaction_density,
        "anomaly_count": profile.anomaly_count,
        "struggle_count": profile.struggle_count,
        "boredom_count": profile.boredom_count,
        "skipping_count": profile.skipping_count,
        "isolation_forest_score": profile.isolation_forest_score,
        "last_updated": profile.last_updated.isoformat()
        if profile.last_updated
        else None,
    }


@router.get(
    "/recommend/{user_id}/{course_id}", response_model=AdaptiveRecommendationResponse
)
async def get_adaptive_recommendation(
    user_id: str, course_id: str, db: Session = Depends(get_db)
):
    """Get RL-based adaptive recommendation."""
    learning_state = (
        db.query(LearningState)
        .filter(
            LearningState.user_id == user_id,
            LearningState.course_id == course_id,
        )
        .first()
    )

    if not learning_state:
        learning_state = LearningState(
            user_id=user_id,
            course_id=course_id,
            progress_percent=0.0,
            engagement_score=0.5,
            confidence_level=0.5,
        )
        db.add(learning_state)
        db.commit()

    engagement_profile = (
        db.query(UserEngagementProfile)
        .filter(
            UserEngagementProfile.user_id == user_id,
            UserEngagementProfile.course_id == course_id,
        )
        .first()
    )

    anomaly_count = engagement_profile.anomaly_count if engagement_profile else 0
    engagement_score = 0.5
    if anomaly_count > 5:
        engagement_score = 0.3
    elif anomaly_count == 0:
        engagement_score = 0.7

    recommendation = adaptive_engine.get_recommendation(
        user_id=user_id,
        engagement_score=engagement_score,
        anomaly_type=None,
        progress_delta=learning_state.progress_percent,
        course_context={
            "progress_percent": learning_state.progress_percent,
            "total_time_spent": learning_state.total_time_spent,
            "current_lesson": learning_state.current_lesson,
            "streak_days": learning_state.streak_days,
        },
    )

    return AdaptiveRecommendationResponse(**recommendation)


@router.post("/quiz/start")
async def start_quiz_session(
    user_id: str,
    course_id: str,
    session_type: str = "review",
    db: Session = Depends(get_db),
):
    """Start a quiz session with spaced repetition."""
    questions = db.query(QuizQuestion).filter(QuizQuestion.course_id == course_id).all()

    if not questions:
        raise HTTPException(
            status_code=404, detail="No questions found for this course"
        )

    question_list = [
        {
            "id": q.id,
            "question_text": q.question_text,
            "question_type": q.question_type,
            "options": q.options,
            "difficulty": q.difficulty,
            "ease_factor": q.ease_factor if hasattr(q, "ease_factor") else 2.5,
            "interval_days": q.interval_days if hasattr(q, "interval_days") else 1,
            "repetitions": q.repetitions if hasattr(q, "repetitions") else 0,
            "next_review_at": q.next_review_at,
            "last_reviewed_at": q.last_reviewed_at,
        }
        for q in questions
    ]

    session = quiz_session_manager.start_session(
        user_id=user_id,
        course_id=course_id,
        available_questions=question_list,
        session_type=session_type,
    )

    return session


@router.post("/quiz/answer")
async def record_quiz_answer(
    session_id: str,
    question_id: str,
    answer: str,
    quality: int,
    time_taken: int,
    db: Session = Depends(get_db),
):
    """Record a quiz answer and update spaced repetition schedule."""
    result = quiz_session_manager.record_answer(
        session_id=session_id,
        question_id=question_id,
        answer=answer,
        quality=quality,
        time_taken=time_taken,
    )

    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    question = db.query(QuizQuestion).filter(QuizQuestion.id == question_id).first()

    if question:
        question.ease_factor = result.get("ease_factor", 2.5)

        last_attempt = (
            db.query(QuizAttempt)
            .filter(
                QuizAttempt.question_id == question_id,
                QuizAttempt.user_id
                == quiz_session_manager.session_questions.get(session_id, {}).get(
                    "user_id"
                ),
            )
            .order_by(QuizAttempt.attempt_number.desc())
            .first()
        )

        attempt = QuizAttempt(
            user_id=quiz_session_manager.session_questions.get(session_id, {}).get(
                "user_id"
            ),
            question_id=question_id,
            selected_answer=answer,
            is_correct=1 if quality >= 3 else 0,
            time_taken_seconds=time_taken,
            attempt_number=(last_attempt.attempt_number + 1) if last_attempt else 1,
            ease_factor=result.get("ease_factor", 2.5),
            interval_days=result.get("new_interval", 1),
            repetitions=(last_attempt.repetitions + 1) if last_attempt else 1,
            next_review_at=result.get("next_review"),
        )
        db.add(attempt)
        db.commit()

    return result


@router.get("/quiz/due/{user_id}/{course_id}")
async def get_due_quizzes(user_id: str, course_id: str, db: Session = Depends(get_db)):
    """Get quizzes due for review based on forgetting curve."""
    attempts = (
        db.query(QuizAttempt)
        .filter(
            QuizAttempt.user_id == user_id,
            QuizAttempt.next_review_at <= datetime.utcnow(),
        )
        .order_by(QuizAttempt.next_review_at)
        .limit(20)
        .all()
    )

    return {
        "due_count": len(attempts),
        "questions": [
            {
                "id": a.question_id,
                "question_text": a.question.question_text if a.question else None,
                "ease_factor": a.ease_factor,
                "interval_days": a.interval_days,
                "due_at": a.next_review_at.isoformat() if a.next_review_at else None,
                "predicted_retention": forgetting_curve_engine.predict_retention(
                    (
                        datetime.utcnow() - (a.last_reviewed_at or datetime.utcnow())
                    ).days,
                    a.ease_factor,
                    a.interval_days,
                ),
            }
            for a in attempts
        ],
    }


@router.post("/intervention")
async def create_intervention(
    user_id: str,
    course_id: str,
    intervention_type: str,
    message: str,
    trigger_event: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Create an intervention message for the user."""
    intervention = Intervention(
        user_id=user_id,
        course_id=course_id,
        intervention_type=intervention_type,
        trigger_event=trigger_event,
        message=message,
    )
    db.add(intervention)
    db.commit()

    return {"id": intervention.id, "status": "created"}


@router.get("/interventions/{user_id}")
async def get_interventions(
    user_id: str, unread_only: bool = False, db: Session = Depends(get_db)
):
    """Get user interventions."""
    query = db.query(Intervention).filter(Intervention.user_id == user_id)

    if unread_only:
        query = query.filter(Intervention.is_read == 0)

    interventions = query.order_by(Intervention.created_at.desc()).limit(20).all()

    return {
        "count": len(interventions),
        "interventions": [
            {
                "id": i.id,
                "type": i.intervention_type,
                "message": i.message,
                "is_read": bool(i.is_read),
                "created_at": i.created_at.isoformat(),
            }
            for i in interventions
        ],
    }


@router.post("/intervention/{intervention_id}/read")
async def mark_intervention_read(intervention_id: str, db: Session = Depends(get_db)):
    """Mark an intervention as read."""
    intervention = (
        db.query(Intervention).filter(Intervention.id == intervention_id).first()
    )

    if not intervention:
        raise HTTPException(status_code=404, detail="Intervention not found")

    intervention.is_read = 1
    intervention.read_at = datetime.utcnow()
    db.commit()

    return {"status": "marked_read"}


@router.post("/learning-state")
async def update_learning_state(
    user_id: str,
    course_id: str,
    progress_percent: float,
    confidence_level: float,
    engagement_score: float,
    current_lesson: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Update user's learning state for a course."""
    state = (
        db.query(LearningState)
        .filter(
            LearningState.user_id == user_id,
            LearningState.course_id == course_id,
        )
        .first()
    )

    if not state:
        state = LearningState(
            user_id=user_id,
            course_id=course_id,
            created_at=datetime.utcnow(),
        )
        db.add(state)

    state.progress_percent = progress_percent
    state.confidence_level = confidence_level
    state.engagement_score = engagement_score
    state.current_lesson = current_lesson
    state.updated_at = datetime.utcnow()

    if state.last_learned_at:
        days_since = (datetime.utcnow() - state.last_learned_at).days
        if days_since == 1:
            state.streak_days += 1
        elif days_since > 1:
            state.streak_days = 1

    state.last_learned_at = datetime.utcnow()
    db.commit()

    return {"status": "updated", "streak_days": state.streak_days}
