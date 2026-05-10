from app.ml.vark_scorer import compute_vark_scores, get_dominant_vark, VARK_QUESTIONS
from app.ml.similarity import cosine_similarity, jaccard_similarity, time_fit_score
from app.services.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.services.matching import (
    compute_match_report,
    filter_and_score_courses,
    check_math_level,
    check_time_level,
)

__all__ = [
    "compute_vark_scores",
    "get_dominant_vark",
    "VARK_QUESTIONS",
    "cosine_similarity",
    "jaccard_similarity",
    "time_fit_score",
    "get_password_hash",
    "verify_password",
    "create_access_token",
    "create_refresh_token",
    "decode_token",
    "compute_match_report",
    "filter_and_score_courses",
    "check_math_level",
    "check_time_level",
]
