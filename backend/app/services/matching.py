from typing import Optional
from app.ml.similarity import (
    cosine_similarity,
    jaccard_similarity,
    time_fit_score,
    nsqf_level_bonus,
    quality_signal,
)
from app.enums import GoalEnum


MATH_WARNING_TOPICS = {
    3: ["derivatives", "calculus", "probability", "linear algebra"],
    4: [
        "advanced calculus",
        "linear algebra",
        "statistics",
        "proofs",
        "derivatives",
        "probability theory",
    ],
}


def check_math_level(
    user_comfort: int, course_depth: int
) -> tuple[str, Optional[str], list[str]]:
    if course_depth <= user_comfort:
        return "PASS", None, []
    elif course_depth == user_comfort + 1:
        topics = MATH_WARNING_TOPICS.get(course_depth, ["mathematical concepts"])
        return "WARN", f"Requires: {', '.join(topics[:3])}.", topics
    else:
        topics = MATH_WARNING_TOPICS.get(course_depth, ["advanced mathematics"])
        return "EXCLUDE", f"Requires: {', '.join(topics)}.", topics


def check_time_level(
    user_hours: float, course_hours: float
) -> tuple[str, Optional[str]]:
    if course_hours <= user_hours:
        return "PASS", None
    elif course_hours <= user_hours * 1.5:
        return (
            "WARN",
            f"Course needs {course_hours:.0f} hrs/week (you said {user_hours:.0f} available)",
        )
    elif course_hours <= user_hours * 2.5:
        return (
            "WARN",
            f"Significant time gap — course needs {course_hours:.0f} hrs/week",
        )
    else:
        return (
            "EXCLUDE",
            f"Course requires {course_hours:.0f} hrs/week (way beyond {user_hours:.0f} available)",
        )


def compute_match_report(
    course: dict,
    profile: dict,
    user_hours: float,
    user_comfort: int,
    user_goal: GoalEnum,
    cluster_completion: Optional[float] = None,
    global_completion: Optional[float] = None,
) -> dict:
    vark_user = [
        profile.get("vark_v", 0.25),
        profile.get("vark_a", 0.25),
        profile.get("vark_r", 0.25),
        profile.get("vark_k", 0.25),
    ]
    vark_course = [
        course.get("vark_v_score", 0.25),
        course.get("vark_a_score", 0.25),
        course.get("vark_r_score", 0.25),
        course.get("vark_k_score", 0.25),
    ]
    vark_sim = cosine_similarity(vark_user, vark_course)
    vark_pct = int(vark_sim * 100)

    style_user = profile.get("style_preferences", [])
    style_course = course.get("style_tags", [])
    style_sim = jaccard_similarity(style_user, style_course)
    style_pct = int(style_sim * 100)

    course_hours = course.get("hours_per_week", 4)
    time_fit = time_fit_score(user_hours, course_hours)

    nsqf_match = course.get("nsqf_level", 0) > 0 and user_goal in (
        GoalEnum.certification,
        GoalEnum.job,
    )

    math_level, math_detail, math_topics_ahead = check_math_level(
        user_comfort, course.get("math_depth", 1)
    )

    time_level, time_detail = check_time_level(user_hours, course_hours)

    warnings = []
    if math_level == "WARN":
        warnings.append(
            {
                "type": "math",
                "severity": "warn",
                "message": math_detail or "Math level may be challenging",
            }
        )
    if time_level == "WARN":
        warnings.append(
            {
                "type": "time",
                "severity": "warn",
                "message": time_detail or "Time commitment is higher than available",
            }
        )

    avg_rating = course.get("avg_rating", 0) or 0
    review_count = course.get("review_count", 0) or 0
    quality = quality_signal(avg_rating, review_count)

    score = (
        0.30 * vark_sim
        + 0.20 * style_sim
        + 0.20 * time_fit
        + 0.15 * nsqf_level_bonus(str(user_goal), course.get("nsqf_level", 0))
        + 0.15 * quality
    )
    overall_pct = int(min(score, 1.0) * 100)

    if overall_pct >= 80:
        label = "Strong Match"
    elif overall_pct >= 65:
        label = "Good Match"
    elif overall_pct >= 50:
        label = "Proceed with Caution"
    else:
        label = "Not Recommended"

    why = (
        f"Ranked #{1} because: VARK match {vark_pct}%, time fit {int(time_fit * 100)}%"
    )
    if nsqf_match:
        why += ", NSQF certified"

    collab_confidence = "LOW"
    if cluster_completion is not None and cluster_completion > 0:
        collab_confidence = "HIGH"
    elif global_completion is not None and global_completion > 0:
        collab_confidence = "MEDIUM"

    week_breakdown = None
    if course.get("week_breakdown"):
        week_breakdown = course["week_breakdown"]

    return {
        "overall_match_pct": overall_pct,
        "vark_alignment_pct": vark_pct,
        "style_match_pct": style_pct,
        "time_fit": f"Course needs {course_hours:.0f} hrs/week (you said {user_hours:.0f})",
        "nsqf_match": nsqf_match,
        "math_level": math_level,
        "math_warning_detail": math_detail,
        "math_topics_ahead": math_topics_ahead,
        "completion_rate_your_cluster": cluster_completion,
        "completion_rate_global": global_completion,
        "collab_confidence": collab_confidence,
        "week_breakdown": week_breakdown,
        "recommendation_label": label,
        "warnings": warnings,
        "why_this_ranking": why,
    }


def filter_and_score_courses(
    courses: list[dict],
    profile: dict,
    user_hours: float,
    user_comfort: int,
    user_goal: GoalEnum,
) -> list[tuple[dict, dict]]:
    results = []
    for course in courses:
        math_level, _, _ = check_math_level(user_comfort, course.get("math_depth", 1))
        if math_level == "EXCLUDE":
            continue
        time_level, _ = check_time_level(user_hours, course.get("hours_per_week", 4))
        if time_level == "EXCLUDE":
            continue

        if profile.get("preferred_language"):
            if course.get("language", "en") != profile.get("preferred_language"):
                continue

        match_report = compute_match_report(
            course, profile, user_hours, user_comfort, user_goal
        )
        if math_level == "WARN":
            match_report["warnings"].insert(
                0,
                {
                    "type": "math",
                    "severity": "warn",
                    "message": f"Math level is one step above your comfort",
                },
            )
        results.append((course, match_report))
    results.sort(key=lambda x: x[1]["overall_match_pct"], reverse=True)
    return results
