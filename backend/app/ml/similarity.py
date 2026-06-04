"""Similarity computation functions for matching engine."""

import numpy as np


def cosine_similarity(vec1: list[float], vec2: list[float]) -> float:
    """Compute cosine similarity between two vectors."""
    if len(vec1) != len(vec2):
        return 0.0
    v1 = np.array(vec1)
    v2 = np.array(vec2)
    norm1 = np.linalg.norm(v1)
    norm2 = np.linalg.norm(v2)
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return float(np.dot(v1, v2) / (norm1 * norm2))


def jaccard_similarity(set1: list[str], set2: list[str]) -> float:
    """Compute Jaccard similarity between two sets."""
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
    """
    Compute time fit score.
    1.0 = perfect match (user hours >= course hours)
    Otherwise, penalize if course needs more hours than user has:
    0.5 = 1.5x difference
    0.0 = 2.5x+ difference
    """
    if course_hours <= 0 or user_hours <= 0:
        return 0.5
    
    if course_hours <= user_hours:
        return 1.0
        
    ratio = course_hours / user_hours
    
    if ratio <= 1.5:
        return 1.0 - (ratio - 1.0) * 1.0
    elif ratio <= 2.5:
        return 0.5 - (ratio - 1.5) * 0.25
    else:
        return 0.0


def quality_signal(rating: float, review_count: int) -> float:
    """
    Compute quality signal from rating and review count.
    Log-weighted to avoid small-n inflation.
    """
    if rating <= 0:
        return 0.0
    return (rating / 5.0) * np.log10(review_count + 1) / np.log10(101)


def nsqf_bonus(goal: str, nsqf_level: int) -> float:
    """NSQF alignment bonus for certification goals."""
    if goal == "certification" and nsqf_level > 0:
        return 1.0
    return 0.0


def style_similarity(user_prefs: list[str], course_tags: list[str]) -> float:
    """Compute style similarity with fuzzy mapping between user preferences and course tags."""
    if not user_prefs or not course_tags:
        return 0.0
        
    user_prefs_clean = [p.lower().strip() for p in user_prefs]
    course_tags_clean = [t.lower().strip() for t in course_tags]
    
    match_count = 0
    for pref in user_prefs_clean:
        matched = False
        for tag in course_tags_clean:
            # Substring matches or exact matches
            if pref in tag or tag in pref:
                matched = True
                break
            # Semantic equivalence mapping
            if pref == 'videos' and 'video' in tag:
                matched = True
                break
            if pref == 'reading' and 'read' in tag:
                matched = True
                break
            if pref == 'quizzes' and ('quiz' in tag or 'interactive' in tag):
                matched = True
                break
            if pref in ['projects', 'handson', 'hands_on'] and any(k in tag for k in ['project', 'lab', 'practical', 'exercise', 'hands-on']):
                matched = True
                break
            if pref in ['selfpaced', 'self-paced'] and 'paced' in tag:
                matched = True
                break
        if matched:
            match_count += 1
            
    return match_count / len(user_prefs_clean)