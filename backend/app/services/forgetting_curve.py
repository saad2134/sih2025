import math
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from uuid import UUID


class ForgettingCurveEngine:
    """
    SM-2 based spaced repetition algorithm with forgetting curve modeling.
    """

    MIN_EASE_FACTOR = 1.3
    DEFAULT_EASE_FACTOR = 2.5

    def __init__(self):
        self.learning_rate = 0.1
        self.forgetting_index = 0.9

    def calculate_next_review(
        self,
        quality: int,
        ease_factor: float,
        interval_days: int,
        repetitions: int,
    ) -> Dict:
        """
        Calculate next review date and parameters using SM-2 algorithm.

        Quality ratings:
        0 - Complete blackout
        1 - Incorrect, but upon seeing correct answer, remembered
        2 - Incorrect, but correct answer seemed easy to recall
        3 - Correct with serious difficulty
        4 - Correct after hesitation
        5 - Perfect response
        """
        if quality < 3:
            new_repetitions = 0
            new_interval = 1
            new_ease_factor = max(self.MIN_EASE_FACTOR, ease_factor - 0.2)
        else:
            if repetitions == 0:
                new_interval = 1
            elif repetitions == 1:
                new_interval = 6
            else:
                new_interval = int(interval_days * ease_factor)

            new_repetitions = repetitions + 1
            new_ease_factor = ease_factor + (
                0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
            )
            new_ease_factor = max(self.MIN_EASE_FACTOR, new_ease_factor)

        next_review = datetime.utcnow() + timedelta(days=new_interval)

        return {
            "ease_factor": round(new_ease_factor, 2),
            "interval_days": new_interval,
            "repetitions": new_repetitions,
            "next_review_at": next_review,
            "quality": quality,
        }

    def predict_retention(
        self, days_since_review: int, ease_factor: float, interval: int
    ) -> float:
        """
        Predict probability of recalling a item using forgetting curve model.
        R = e^(-t/S) where S is stability (related to ease factor and interval)
        """
        if interval == 0:
            return 1.0

        stability = ease_factor * interval / 2
        retention = math.exp(-days_since_review / max(stability, 1))

        return max(0.0, min(1.0, retention))

    def get_optimal_review_time(
        self, ease_factor: float, interval_days: int, target_retention: float = 0.8
    ) -> int:
        """
        Calculate optimal time to review to maintain target retention.
        """
        if ease_factor <= 0:
            return interval_days

        stability = ease_factor * interval_days / 2
        optimal_days = -stability * math.log(target_retention)

        return max(1, int(optimal_days))

    def schedule_reviews(
        self, questions: List[Dict], current_time: Optional[datetime] = None
    ) -> List[Dict]:
        """
        Sort questions by urgency (time until review needed).
        """
        if current_time is None:
            current_time = datetime.utcnow()

        scheduled = []
        for q in questions:
            next_review = q.get("next_review_at")
            if next_review:
                if isinstance(next_review, str):
                    next_review = datetime.fromisoformat(
                        next_review.replace("Z", "+00:00")
                    )

                days_until = (next_review - current_time).total_seconds() / 86400

                retention = 1.0
                if q.get("last_reviewed_at"):
                    last_review = q.get("last_reviewed_at")
                    if isinstance(last_review, str):
                        last_review = datetime.fromisoformat(
                            last_review.replace("Z", "+00:00")
                        )
                    days_since = (current_time - last_review).total_seconds() / 86400
                    retention = self.predict_retention(
                        days_since, q.get("ease_factor", 2.5), q.get("interval_days", 1)
                    )

                urgency_score = -days_until + (1 - retention) * 10

                scheduled.append(
                    {
                        **q,
                        "days_until_review": max(0, days_until),
                        "predicted_retention": round(retention, 2),
                        "urgency_score": round(urgency_score, 2),
                    }
                )

        scheduled.sort(key=lambda x: x["urgency_score"], reverse=True)
        return scheduled

    def adaptive_difficulty(
        self, user_performance: List[Dict], current_difficulty: int
    ) -> int:
        """
        Adjust question difficulty based on recent performance.
        """
        if not user_performance:
            return current_difficulty

        recent = user_performance[-5:]
        avg_quality = sum(r.get("quality", 3) for r in recent) / len(recent)

        if avg_quality >= 4.5 and current_difficulty < 5:
            return current_difficulty + 1
        elif avg_quality <= 2.5 and current_difficulty > 1:
            return current_difficulty - 1

        return current_difficulty


class QuizSessionManager:
    def __init__(self):
        self.forgetting_curve = ForgettingCurveEngine()
        self.session_questions: Dict[str, List[Dict]] = {}
        self.max_questions_per_session = 20
        self.min_interval_hours = 4

    def start_session(
        self,
        user_id: str,
        course_id: str,
        available_questions: List[Dict],
        session_type: str = "review",
    ) -> Dict:
        """
        Start a quiz session with optimal question selection.
        """
        session_id = f"{user_id}_{course_id}_{datetime.utcnow().timestamp()}"

        if session_type == "review":
            scheduled = self.forgetting_curve.schedule_reviews(available_questions)
            questions = scheduled[: self.max_questions_per_session]
        elif session_type == "learn":
            questions = sorted(
                available_questions, key=lambda x: x.get("repetitions", 0)
            )[: self.max_questions_per_session]
        elif session_type == "challenge":
            questions = sorted(
                available_questions,
                key=lambda x: x.get("difficulty", 2),
                reverse=True,
            )[: self.max_questions_per_session // 2]
        else:
            questions = available_questions[: self.max_questions_per_session]

        self.session_questions[session_id] = {
            "questions": questions,
            "user_id": user_id,
            "course_id": course_id,
            "type": session_type,
            "started_at": datetime.utcnow(),
            "current_index": 0,
            "answers": [],
        }

        return {
            "session_id": session_id,
            "total_questions": len(questions),
            "session_type": session_type,
            "first_question": questions[0] if questions else None,
        }

    def get_next_question(self, session_id: str) -> Optional[Dict]:
        """Get next question in session."""
        if session_id not in self.session_questions:
            return None

        session = self.session_questions[session_id]
        idx = session["current_index"]

        if idx < len(session["questions"]):
            return session["questions"][idx]
        return None

    def record_answer(
        self,
        session_id: str,
        question_id: str,
        answer: str,
        quality: int,
        time_taken: int,
    ) -> Dict:
        """Record answer and calculate next review."""
        if session_id not in self.session_questions:
            return {"error": "Invalid session"}

        session = self.session_questions[session_id]

        question = next(
            (q for q in session["questions"] if str(q.get("id")) == question_id), None
        )
        if not question:
            return {"error": "Question not found"}

        result = self.forgetting_curve.calculate_next_review(
            quality=quality,
            ease_factor=question.get("ease_factor", 2.5),
            interval_days=question.get("interval_days", 1),
            repetitions=question.get("repetitions", 0),
        )

        session["answers"].append(
            {
                "question_id": question_id,
                "answer": answer,
                "quality": quality,
                "time_taken": time_taken,
                "result": result,
            }
        )

        session["current_index"] += 1

        return {
            "correct": quality >= 3,
            "quality": quality,
            "next_review": result["next_review_at"],
            "new_interval": result["interval_days"],
            "ease_factor": result["ease_factor"],
            "progress": {
                "answered": session["current_index"],
                "total": len(session["questions"]),
            },
        }

    def end_session(self, session_id: str) -> Dict:
        """End session and return summary."""
        if session_id not in self.session_questions:
            return {"error": "Invalid session"}

        session = self.session_questions[session_id]

        total = len(session["answers"])
        correct = sum(1 for a in session["answers"] if a.get("quality", 0) >= 3)

        summary = {
            "session_id": session_id,
            "total_questions": total,
            "correct_answers": correct,
            "accuracy": round(correct / total * 100, 1) if total > 0 else 0,
            "session_type": session["type"],
            "duration_minutes": (
                datetime.utcnow() - session["started_at"]
            ).total_seconds()
            / 60,
            "answers_detail": session["answers"],
        }

        del self.session_questions[session_id]

        return summary


forgetting_curve_engine = ForgettingCurveEngine()
quiz_session_manager = QuizSessionManager()
