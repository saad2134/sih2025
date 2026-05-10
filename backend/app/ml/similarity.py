import numpy as np


def cosine_similarity(vec1: list[float], vec2: list[float]) -> float:
    v1 = np.array(vec1)
    v2 = np.array(vec2)
    norm1 = np.linalg.norm(v1)
    norm2 = np.linalg.norm(v2)
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return float(np.dot(v1, v2) / (norm1 * norm2))


def jaccard_similarity(set1: list[str], set2: list[str]) -> float:
    if not set1 or not set2:
        return 0.0
    s1 = set(set1)
    s2 = set(set2)
    intersection = len(s1 & s2)
    union = len(s1 | s2)
    if union == 0:
        return 0.0
    return intersection / union


def time_fit_score(user_hours: float, course_hours: float) -> float:
    if course_hours == 0:
        return 0.0
    diff = abs(course_hours - user_hours)
    max_hours = max(user_hours, course_hours)
    if max_hours == 0:
        return 1.0
    return max(0.0, 1.0 - (diff / max_hours))


def nsqf_level_bonus(user_goal: str, course_nsqf_level: int) -> float:
    if course_nsqf_level <= 0:
        return 0.0
    if user_goal in ("certification", "job"):
        return 0.1
    return 0.0


def quality_signal(avg_rating: float, review_count: int) -> float:
    if avg_rating is None or review_count is None:
        return 0.0
    if avg_rating <= 0:
        return 0.0
    rating_norm = avg_rating / 5.0
    log_count = np.log10(review_count + 1)
    return rating_norm * log_count / 3.0
