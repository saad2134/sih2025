import pytest
from app.ml.vark_scorer import compute_vark_scores, get_dominant_vark
from app.ml.similarity import (
    cosine_similarity,
    jaccard_similarity,
    time_fit_score,
    quality_signal,
)
from app.services.matching import (
    check_math_level,
    check_time_level,
    filter_and_score_courses,
    compute_match_report,
)
from app.enums import GoalEnum


class TestVARKScorer:
    def test_all_visual_answers(self):
        answers = [
            {"vark_dim": "V"},
            {"vark_dim": "V"},
            {"vark_dim": "V"},
            {"vark_dim": "V"},
        ]
        v, a, r, k = compute_vark_scores(answers)
        assert v == 1.0
        assert a == 0.0
        assert r == 0.0
        assert k == 0.0

    def test_mixed_answers(self):
        answers = [
            {"vark_dim": "V"},
            {"vark_dim": "A"},
            {"vark_dim": "R"},
            {"vark_dim": "K"},
        ]
        v, a, r, k = compute_vark_scores(answers)
        assert abs(v - 0.25) < 0.01
        assert abs(a - 0.25) < 0.01
        assert abs(r - 0.25) < 0.01
        assert abs(k - 0.25) < 0.01

    def test_empty_answers_returns_equal(self):
        v, a, r, k = compute_vark_scores([])
        assert v == 0.25
        assert a == 0.25
        assert r == 0.25
        assert k == 0.25

    def test_get_dominant_vark(self):
        assert get_dominant_vark(0.6, 0.2, 0.1, 0.1) == "V"
        assert get_dominant_vark(0.1, 0.7, 0.1, 0.1) == "A"
        assert get_dominant_vark(0.1, 0.1, 0.8, 0.0) == "R"
        assert get_dominant_vark(0.0, 0.1, 0.1, 0.8) == "K"


class TestSimilarity:
    def test_cosine_identical(self):
        assert cosine_similarity([1.0, 0.0, 0.0, 0.0], [1.0, 0.0, 0.0, 0.0]) == 1.0

    def test_cosine_zero_vector(self):
        assert cosine_similarity([0.0, 0.0], [1.0, 1.0]) == 0.0

    def test_jaccard_full_overlap(self):
        assert jaccard_similarity(["a", "b"], ["a", "b"]) == 1.0

    def test_jaccard_no_overlap(self):
        assert jaccard_similarity(["a", "b"], ["c", "d"]) == 0.0

    def test_jaccard_empty(self):
        assert jaccard_similarity([], ["a"]) == 0.0

    def test_time_fit_exact_match(self):
        assert time_fit_score(5.0, 5.0) == 1.0

    def test_time_fit_gap(self):
        score = time_fit_score(5.0, 10.0)
        assert 0.0 < score < 1.0

    def test_quality_signal(self):
        score = quality_signal(4.0, 100)
        assert 0.0 < score < 1.0

    def test_quality_signal_zero_rating(self):
        assert quality_signal(0.0, 10) == 0.0


class TestMathCheck:
    def test_math_pass_when_comfort_higher(self):
        level, detail, topics = check_math_level(4, 2)
        assert level == "PASS"

    def test_math_warn_one_step_above(self):
        level, detail, topics = check_math_level(2, 3)
        assert level == "WARN"
        assert detail is not None
        assert len(topics) > 0

    def test_math_exclude_two_steps_above(self):
        level, detail, topics = check_math_level(1, 4)
        assert level == "EXCLUDE"

    def test_math_equal_is_pass(self):
        level, _, _ = check_math_level(3, 3)
        assert level == "PASS"


class TestTimeCheck:
    def test_time_pass_exact_match(self):
        level, detail = check_time_level(5.0, 5.0)
        assert level == "PASS"

    def test_time_warn_50_percent_over(self):
        level, detail = check_time_level(5.0, 7.0)
        assert level == "WARN"

    def test_time_exclude_way_over(self):
        level, detail = check_time_level(5.0, 15.0)
        assert level == "EXCLUDE"


class TestMatching:
    def test_filter_excludes_math_exclude(self):
        courses = [
            {
                "id": "1",
                "math_depth": 1,
                "hours_per_week": 4,
                "vark_v_score": 0.25,
                "vark_a_score": 0.25,
                "vark_r_score": 0.25,
                "vark_k_score": 0.25,
            },
            {
                "id": "2",
                "math_depth": 4,
                "hours_per_week": 4,
                "vark_v_score": 0.25,
                "vark_a_score": 0.25,
                "vark_r_score": 0.25,
                "vark_k_score": 0.25,
            },
        ]
        profile = {
            "vark_v": 0.25,
            "vark_a": 0.25,
            "vark_r": 0.25,
            "vark_k": 0.25,
            "style_preferences": [],
        }
        results = filter_and_score_courses(
            courses, profile, user_hours=5.0, user_comfort=1, user_goal=GoalEnum.job
        )
        course_ids = [c["id"] for c, _ in results]
        assert "2" not in course_ids
        assert "1" in course_ids

    def test_match_report_labels(self):
        course = {
            "vark_v_score": 0.25,
            "vark_a_score": 0.25,
            "vark_r_score": 0.25,
            "vark_k_score": 0.25,
            "style_tags": [],
            "math_depth": 1,
            "hours_per_week": 4,
            "nsqf_level": 0,
            "avg_rating": None,
            "review_count": 0,
        }
        profile = {
            "vark_v": 0.25,
            "vark_a": 0.25,
            "vark_r": 0.25,
            "vark_k": 0.25,
            "style_preferences": [],
        }
        report = compute_match_report(
            course, profile, user_hours=5.0, user_comfort=2, user_goal=GoalEnum.job
        )
        assert "recommendation_label" in report
        assert 0 <= report["overall_match_pct"] <= 100
        assert report["math_level"] == "PASS"

    def test_match_report_warns_math_mismatch(self):
        course = {
            "vark_v_score": 0.25,
            "vark_a_score": 0.25,
            "vark_r_score": 0.25,
            "vark_k_score": 0.25,
            "style_tags": [],
            "math_depth": 3,
            "hours_per_week": 4,
            "nsqf_level": 0,
            "avg_rating": None,
            "review_count": 0,
        }
        profile = {
            "vark_v": 0.25,
            "vark_a": 0.25,
            "vark_r": 0.25,
            "vark_k": 0.25,
            "style_preferences": [],
        }
        report = compute_match_report(
            course, profile, user_hours=5.0, user_comfort=2, user_goal=GoalEnum.job
        )
        assert report["math_level"] == "WARN"
        assert len(report["warnings"]) > 0
