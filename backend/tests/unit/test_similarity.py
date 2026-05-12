"""Unit tests for similarity functions."""

import pytest
from app.ml.similarity import cosine_similarity, jaccard_similarity, time_fit_score, quality_signal, nsqf_bonus


class TestCosineSimilarity:
    def test_identical_vectors(self):
        vec = [1.0, 0.5, 0.5]
        assert cosine_similarity(vec, vec) == pytest.approx(1.0)

    def test_orthogonal_vectors(self):
        vec1 = [1.0, 0.0, 0.0]
        vec2 = [0.0, 1.0, 0.0]
        assert cosine_similarity(vec1, vec2) == pytest.approx(0.0)

    def test_empty_vectors(self):
        assert cosine_similarity([], []) == 0.0

    def test_zero_vector(self):
        assert cosine_similarity([0, 0, 0], [1, 1, 1]) == 0.0


class TestJaccardSimilarity:
    def test_identical_sets(self):
        set1 = ["python", "javascript", "java"]
        set2 = ["python", "javascript", "java"]
        assert jaccard_similarity(set1, set2) == 1.0

    def test_disjoint_sets(self):
        set1 = ["python", "javascript"]
        set2 = ["java", "rust"]
        assert jaccard_similarity(set1, set2) == 0.0

    def test_partial_overlap(self):
        set1 = ["python", "javascript"]
        set2 = ["python", "java"]
        assert jaccard_similarity(set1, set2) == pytest.approx(0.333, 0.01)

    def test_empty_sets(self):
        assert jaccard_similarity([], []) == 0.0


class TestTimeFitScore:
    def test_perfect_match(self):
        assert time_fit_score(8, 8) == pytest.approx(1.0)

    def test_1_5x_difference(self):
        score = time_fit_score(8, 12)
        assert 0 < score < 1.0

    def test_2_5x_difference(self):
        score = time_fit_score(8, 20)
        assert 0 <= score < 0.5

    def test_3x_difference(self):
        score = time_fit_score(5, 15)
        assert score == 0.0

    def test_zero_values(self):
        assert time_fit_score(0, 8) == 0.5
        assert time_fit_score(8, 0) == 0.5


class TestQualitySignal:
    def test_high_rating_many_reviews(self):
        score = quality_signal(5.0, 100)
        assert score > 0.5

    def test_low_rating_few_reviews(self):
        score = quality_signal(2.0, 5)
        assert score < 0.3

    def test_zero_rating(self):
        assert quality_signal(0, 50) == 0.0


class TestNsqfBonus:
    def test_certification_with_nsqf(self):
        assert nsqf_bonus("certification", 4) == 1.0

    def test_job_goal_no_nsqf(self):
        assert nsqf_bonus("job", 4) == 0.0

    def test_certification_no_nsqf(self):
        assert nsqf_bonus("certification", 0) == 0.0