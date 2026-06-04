import numpy as np
import json
import os
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
from collections import defaultdict
import pickle


class AdaptiveQLearning:
    """
    Q-Learning based adaptive recommendation system.
    """

    ACTIONS = [
        "continue_lesson",
        "break",
        "skip_ahead",
        "review_prerequisites",
        "take_quiz",
        "change_difficulty",
        "suggest_alternative",
        "encourage",
    ]

    STATES = [
        "normal",
        "struggling",
        "bored",
        "skipping",
        "engaged",
        "fatigued",
    ]

    def __init__(
        self,
        learning_rate: float = 0.1,
        discount_factor: float = 0.9,
        epsilon: float = 0.1,
    ):
        self.learning_rate = learning_rate
        self.discount_factor = discount_factor
        self.epsilon = epsilon
        self.q_table: Dict[Tuple[str, str], Dict[str, float]] = defaultdict(
            lambda: defaultdict(float)
        )
        self.action_counts: Dict[Tuple[str, str], Dict[str, int]] = defaultdict(
            lambda: defaultdict(int)
        )
        self.reward_history: List[Dict] = []

    def _state_key(
        self,
        engagement_score: float,
        anomaly_type: Optional[str],
        progress_delta: float,
    ) -> str:
        if anomaly_type == "struggle":
            return "struggling"
        elif anomaly_type == "bored":
            return "bored"
        elif anomaly_type == "skipping":
            return "skipping"
        elif engagement_score > 0.8:
            return "engaged"
        elif engagement_score < 0.3:
            return "fatigued"
        return "normal"

    def get_action(self, state: str, user_id: str) -> Tuple[str, Dict]:
        """Select action using epsilon-greedy policy."""
        state_key = (state, user_id)

        if np.random.random() < self.epsilon:
            action = np.random.choice(self.ACTIONS)
            exploration = True
        else:
            q_values = self.q_table[state_key]
            if not q_values or max(q_values.values()) == 0:
                action = np.random.choice(self.ACTIONS)
                exploration = True
            else:
                action = max(q_values, key=q_values.get)
                exploration = False

        action_info = self._get_action_details(action, state)

        return action, {
            "exploration": exploration,
            "confidence": self._get_confidence(state_key, action),
        }

    def _get_action_details(self, action: str, state: str) -> Dict:
        details = {
            "continue_break": {
                "message": "Let's take a short break and come back refreshed.",
                "type": "break",
                "priority": 3,
            },
            "break": {
                "message": "Time for a break! You've been working hard.",
                "type": "break",
                "priority": 4,
            },
            "skip_ahead": {
                "message": "You're ready to move ahead. Let's skip to the next topic.",
                "type": "acceleration",
                "priority": 2,
            },
            "review_prerequisites": {
                "message": "Let's review some foundational concepts first.",
                "type": "regression",
                "priority": 3,
            },
            "take_quiz": {
                "message": "Let's test your understanding with a quick quiz.",
                "type": "assessment",
                "priority": 2,
            },
            "change_difficulty": {
                "message": "Let's adjust the difficulty level for better learning.",
                "type": "difficulty",
                "priority": 3,
            },
            "suggest_alternative": {
                "message": "Let me suggest a different approach to this topic.",
                "type": "alternative",
                "priority": 3,
            },
            "encourage": {
                "message": "Great progress! Keep going, you're doing well.",
                "type": "motivation",
                "priority": 1,
            },
        }
        return details.get(
            action, {"message": "Keep learning!", "type": "neutral", "priority": 1}
        )

    def _get_confidence(self, state_key: Tuple[str, str], action: str) -> float:
        total_count = sum(self.action_counts[state_key].values())
        if total_count == 0:
            return 0.0
        action_count = self.action_counts[state_key][action]
        return action_count / total_count

    def update_q_value(
        self,
        state: str,
        action: str,
        reward: float,
        next_state: str,
        user_id: str,
    ):
        """Update Q-value using Q-learning update rule."""
        state_key = (state, user_id)
        next_state_key = (next_state, user_id)

        current_q = self.q_table[state_key][action]

        max_next_q = (
            max(self.q_table[next_state_key].values())
            if self.q_table[next_state_key]
            else 0
        )

        new_q = current_q + self.learning_rate * (
            reward + self.discount_factor * max_next_q - current_q
        )

        self.q_table[state_key][action] = new_q
        self.action_counts[state_key][action] += 1

    def calculate_reward(
        self,
        action_taken: str,
        outcome: Dict,
        engagement_before: float,
        engagement_after: float,
        progress_before: float,
        progress_after: float,
    ) -> float:
        """Calculate reward based on learning outcome."""
        engagement_delta = engagement_after - engagement_before
        progress_delta = progress_after - progress_before

        progress_reward = progress_delta * 10
        engagement_reward = engagement_delta * 5

        completion_bonus = 0
        if outcome.get("completed"):
            completion_bonus = 20

        time_bonus = 0
        if outcome.get("time_efficient"):
            time_bonus = 5

        effectiveness = outcome.get("effectiveness_score", 0.5)
        effectiveness_reward = (effectiveness - 0.5) * 10

        action_penalty = self._get_action_penalty(action_taken, outcome)

        total_reward = (
            progress_reward
            + engagement_reward
            + completion_bonus
            + time_bonus
            + effectiveness_reward
            - action_penalty
        )

        return total_reward

    def _get_action_penalty(self, action: str, outcome: Dict) -> float:
        """Apply penalty for inappropriate actions."""
        anomaly = outcome.get("anomaly_type", "normal")

        if action == "break" and anomaly not in ["struggling", "fatigued"]:
            return 3
        if action == "skip_ahead" and anomaly in ["struggling"]:
            return 8
        if action == "encourage" and anomaly == "bored":
            return 5

        return 0


class AdaptiveRecommendationEngine:
    def __init__(self):
        self.ql = AdaptiveQLearning(learning_rate=0.1, discount_factor=0.9, epsilon=0.1)
        self.load_model()

    def load_model(self):
        """Load trained Q-table if exists."""
        model_path = "models/q_learning_model.pkl"
        if os.path.exists(model_path):
            try:
                with open(model_path, "rb") as f:
                    data = pickle.load(f)
                    self.ql.q_table = data.get("q_table", {})
                    self.ql.action_counts = data.get("action_counts", {})
            except:
                pass

    def save_model(self):
        """Save Q-table."""
        os.makedirs("models", exist_ok=True)
        with open("models/q_learning_model.pkl", "wb") as f:
            pickle.dump(
                {
                    "q_table": dict(self.ql.q_table),
                    "action_counts": dict(self.ql.action_counts),
                },
                f,
            )

    def get_recommendation(
        self,
        user_id: str,
        engagement_score: float,
        anomaly_type: Optional[str],
        progress_delta: float,
        course_context: Dict,
    ) -> Dict:
        """Get adaptive recommendation based on current state."""
        state = self.ql._state_key(engagement_score, anomaly_type, progress_delta)

        action, metadata = self.ql.get_action(state, user_id)

        recommendation = {
            "action": action,
            "state": state,
            "engagement_score": engagement_score,
            "anomaly_type": anomaly_type,
            "confidence": metadata.get("confidence", 0.0),
            "exploration": metadata.get("exploration", False),
            "timestamp": datetime.utcnow().isoformat(),
        }

        recommendation.update(self.ql._get_action_details(action, state))

        recommendation["context"] = {
            "progress": course_context.get("progress_percent", 0),
            "time_spent": course_context.get("total_time_spent", 0),
            "current_lesson": course_context.get("current_lesson"),
            "streak": course_context.get("streak_days", 0),
        }

        return recommendation

    def record_outcome(
        self,
        user_id: str,
        state: str,
        action: str,
        outcome: Dict,
        engagement_before: float,
        engagement_after: float,
        progress_before: float,
        progress_after: float,
    ):
        """Record outcome and update Q-table."""
        next_state = self.ql._state_key(
            engagement_after,
            outcome.get("anomaly_type"),
            progress_after - progress_before,
        )

        reward = self.ql.calculate_reward(
            action,
            outcome,
            engagement_before,
            engagement_after,
            progress_before,
            progress_after,
        )

        self.ql.update_q_value(state, action, reward, next_state, user_id)

        self.ql.reward_history.append(
            {
                "user_id": user_id,
                "state": state,
                "action": action,
                "reward": reward,
                "timestamp": datetime.utcnow().isoformat(),
            }
        )

        if len(self.ql.reward_history) % 100 == 0:
            self.save_model()

    def get_intervention_message(self, anomaly_type: str, action: str) -> str:
        """Get contextual intervention message."""
        messages = {
            (
                "struggle",
                "break",
            ): "You're spending a lot of time here. Let's take a 5-minute break and try a different approach when you return.",
            (
                "struggle",
                "review_prerequisites",
            ): "This might be building on concepts you haven't mastered yet. Let's review the prerequisites.",
            (
                "struggle",
                "change_difficulty",
            ): "This seems challenging. Would you like to try a simpler version first?",
            (
                "bored",
                "skip_ahead",
            ): "You're getting through this quickly! Want to skip ahead to more interesting content?",
            (
                "bored",
                "take_quiz",
            ): "Let's test your understanding with a quick quiz to make sure you're getting this.",
            (
                "bored",
                "suggest_alternative",
            ): "This might not be matching your learning style. Let me suggest a different approach.",
            (
                "skipping",
                "encourage",
            ): "Whoa, slow down! Let's make sure you're actually absorbing this material.",
            (
                "skipping",
                "take_quiz",
            ): "Let's pause and check your understanding with a quiz.",
            (
                "fatigued",
                "break",
            ): "You seem tired. Taking a break now will help you retain more later.",
            (
                "fatigued",
                "continue",
            ): "Just one more concept, then you can take a break!",
        }

        return messages.get((anomaly_type, action), "Keep going, you're doing great!")


adaptive_engine = AdaptiveRecommendationEngine()
