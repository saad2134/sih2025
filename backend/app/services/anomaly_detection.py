import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from typing import Dict, List, Optional, Tuple
from datetime import datetime
import pickle
import os


class AnomalyDetector:
    def __init__(self, contamination: float = 0.1, n_estimators: int = 100):
        self.contamination = float(contamination) if contamination else 0.1
        self.n_estimators = n_estimators
        self.model: Optional[IsolationForest] = None
        self.scaler = StandardScaler()
        self.is_fitted = False
        self.feature_names = [
            "duration_seconds",
            "idle_seconds",
            "pause_count",
            "seek_count",
            "scroll_depth",
            "interaction_density",
            "time_since_last_activity",
            "progress_delta",
        ]

    def extract_features(
        self, activity: Dict, prev_activity: Optional[Dict] = None
    ) -> np.ndarray:
        duration = float(activity.get("duration_seconds", 0))
        idle = float(activity.get("idle_seconds", 0))
        pauses = float(activity.get("pause_count", 0))
        seeks = float(activity.get("seek_count", 0))
        scroll = float(activity.get("scroll_depth", 0) or 0)
        interactions = len(activity.get("interactions", []))

        interaction_density = interactions / max(duration, 1) * 60

        time_since_last = 0.0
        if (
            prev_activity
            and activity.get("timestamp")
            and prev_activity.get("timestamp")
        ):
            try:
                curr = activity["timestamp"]
                prev = prev_activity["timestamp"]
                if isinstance(curr, str):
                    curr = datetime.fromisoformat(curr.replace("Z", "+00:00"))
                if isinstance(prev, str):
                    prev = datetime.fromisoformat(prev.replace("Z", "+00:00"))
                time_since_last = (curr - prev).total_seconds() / 60
            except:
                pass

        progress_delta = 0.0
        if prev_activity:
            prev_progress = prev_activity.get("progress_percent", 0)
            curr_progress = activity.get("progress_percent", 0)
            progress_delta = curr_progress - prev_progress

        features = np.array(
            [
                duration / 3600,
                idle / 3600,
                pauses / 10,
                seeks / 10,
                scroll / 100,
                interaction_density / 10,
                time_since_last / 60,
                progress_delta,
            ]
        )

        return features

    def fit(self, historical_activities: List[Dict]):
        if len(historical_activities) < 10:
            return False

        features_list = []
        for i, activity in enumerate(historical_activities):
            prev = historical_activities[i - 1] if i > 0 else None
            features = self.extract_features(activity, prev)
            features_list.append(features)

        X = np.array(features_list)
        X_scaled = self.scaler.fit_transform(X)

        self.model = IsolationForest(
            contamination=self.contamination,
            n_estimators=self.n_estimators,
            random_state=42,
            n_jobs=-1,
        )
        self.model.fit(X_scaled)
        self.is_fitted = True
        return True

    def predict(
        self, activity: Dict, prev_activity: Optional[Dict] = None
    ) -> Tuple[str, float]:
        if not self.is_fitted or self.model is None:
            return "unknown", 0.0

        features = self.extract_features(activity, prev_activity).reshape(1, -1)
        features_scaled = self.scaler.transform(features)

        prediction = self.model.predict(features_scaled)[0]
        score = self.model.score_samples(features_scaled)[0]

        if prediction == -1:
            anomaly_type = self._classify_anomaly(activity, features[0], score)
            return anomaly_type, abs(score)
        return "normal", abs(score)

    def _classify_anomaly(
        self, activity: Dict, features: np.ndarray, score: float
    ) -> str:
        duration = activity.get("duration_seconds", 0)
        idle = activity.get("idle_seconds", 0)
        pauses = activity.get("pause_count", 0)
        seeks = activity.get("seek_count", 0)
        scroll = activity.get("scroll_depth", 0) or 0
        interactions = len(activity.get("interactions", []))

        avg_duration = features[0] * 3600 if features[0] > 0 else 0
        avg_idle = features[1] * 3600 if features[1] > 0 else 0

        is_long_duration = duration > avg_duration * 1.5 if avg_duration > 0 else False
        is_short_but_active = duration < 60 and pauses > 0
        is_low_engagement = scroll < 30 and interactions < 2

        if is_long_duration and idle > duration * 0.7:
            return "struggle"
        elif is_short_but_active and is_low_engagement:
            return "bored"
        elif duration < 30 and seeks > 3:
            return "skipping"
        elif scroll > 80 and duration < 45:
            return "bored"
        elif duration > 300 and pauses == 0 and seeks == 0:
            return "struggle"

        return "unknown"


class EngagementMonitor:
    def __init__(self):
        self.detector = AnomalyDetector(contamination=0.1)
        self.thresholds = {
            "struggle": {
                "min_duration": 300,
                "min_idle_ratio": 0.5,
                "max_interactions": 2,
            },
            "bored": {
                "max_duration": 120,
                "max_scroll": 40,
                "max_interactions": 3,
            },
            "skipping": {
                "max_duration": 45,
                "min_seeks": 3,
                "max_scroll": 60,
            },
        }

    def analyze_activity(
        self,
        activity: Dict,
        prev_activity: Optional[Dict] = None,
        user_profile: Optional[Dict] = None,
    ) -> Dict:
        if user_profile:
            self._calibrate_with_profile(user_profile)

        anomaly_type, anomaly_score = self.detector.predict(activity, prev_activity)

        pattern = self._detect_pattern(activity, prev_activity)
        effective_anomaly_type = anomaly_type if anomaly_type else "normal"
        if (
            pattern
            and not effective_anomaly_type
            or effective_anomaly_type == "unknown"
        ):
            effective_anomaly_type = pattern
            anomaly_score = 0.7

        recommendation = self._get_recommendation(effective_anomaly_type, activity)

        return {
            "is_anomaly": anomaly_type != "normal",
            "anomaly_type": anomaly_type,
            "anomaly_score": round(anomaly_score, 3),
            "pattern_detected": pattern,
            "recommendation": recommendation,
            "timestamp": activity.get("timestamp"),
        }

    def _calibrate_with_profile(self, profile: Dict):
        baseline_duration = profile.get("avg_session_duration", 1800)
        baseline_idle = profile.get("avg_idle_time", 300)

        if baseline_duration > 0:
            self.detector.model = None
            self.detector.is_fitted = False

    def _detect_pattern(
        self, activity: Dict, prev_activity: Optional[Dict] = None
    ) -> Optional[str]:
        duration = activity.get("duration_seconds", 0)
        idle = activity.get("idle_seconds", 0)
        pauses = activity.get("pause_count", 0)
        seeks = activity.get("seek_count", 0)
        scroll = activity.get("scroll_depth", 0) or 0
        interactions = len(activity.get("interactions", []))

        if duration > 600 and (idle / duration) > 0.6:
            return "struggle"

        if duration < 90 and scroll < 30 and interactions < 3:
            return "bored"

        if duration < 45 and seeks > 2:
            return "skipping"

        if prev_activity:
            prev_duration = prev_activity.get("duration_seconds", 0)
            if duration > prev_duration * 2 and duration > 300:
                return "struggle"
            if duration < prev_duration * 0.3 and duration < 60:
                return "bored"

        return None

    def _get_recommendation(self, anomaly_type: str, activity: Dict) -> Optional[Dict]:
        recommendations = {
            "struggle": {
                "action": "break",
                "message": "Taking a break might help. This concept might need a different approach.",
                "suggestions": [
                    "Take a 5-minute break",
                    "Try a different learning resource",
                    "Review prerequisite concepts",
                ],
            },
            "bored": {
                "action": "accelerate",
                "message": "You seem to be moving quickly. Want to skip ahead?",
                "suggestions": [
                    "Skip to next topic",
                    "Take a quick quiz to test knowledge",
                    "Try a hands-on exercise",
                ],
            },
            "skipping": {
                "action": "slow_down",
                "message": "Slow down! You might miss important concepts.",
                "suggestions": [
                    "Try the interactive exercise",
                    "Take notes on key points",
                    "Pause and reflect on what you learned",
                ],
            },
        }

        if anomaly_type in recommendations:
            rec = recommendations[anomaly_type].copy()
            rec["current_lesson"] = activity.get("lesson_id")
            return rec
        return None

    def batch_analyze(
        self, activities: List[Dict], user_profile: Optional[Dict] = None
    ) -> List[Dict]:
        results = []
        for i, activity in enumerate(activities):
            prev = activities[i - 1] if i > 0 else None
            result = self.analyze_activity(activity, prev, user_profile)
            results.append(result)
        return results


anomaly_monitor = EngagementMonitor()


def get_anomaly_status(activity: Dict, user_id: str, course_id: str) -> Dict:
    return anomaly_monitor.analyze_activity(activity)
