"""Unit tests for VARK scorer."""

import pytest
from app.ml.vark_scorer import VARKScorer, VARKScores
from app.schemas.onboarding import VarkAnswer


class TestVARKScorer:
    def test_compute_scores_basic(self):
        scorer = VARKScorer()
        
        answers = [
            VarkAnswer(question_id=1, option_id="1a"),
            VarkAnswer(question_id=2, option_id="2r"),
            VarkAnswer(question_id=3, option_id="3k"),
            VarkAnswer(question_id=4, option_id="4a"),
            VarkAnswer(question_id=5, option_id="5a"),
            VarkAnswer(question_id=6, option_id="6r"),
            VarkAnswer(question_id=7, option_id="7k"),
            VarkAnswer(question_id=8, option_id="8a"),
        ]
        
        scores = scorer.compute_scores(answers)
        
        assert isinstance(scores, VARKScores)
        assert 0 <= scores.v <= 1
        assert 0 <= scores.a <= 1
        assert 0 <= scores.r <= 1
        assert 0 <= scores.k <= 1
        assert abs(scores.v + scores.a + scores.r + scores.k - 1.0) < 0.01

    def test_compute_scores_empty(self):
        scorer = VARKScorer()
        scores = scorer.compute_scores([])
        
        assert scores.v == 0.25
        assert scores.a == 0.25
        assert scores.r == 0.25
        assert scores.k == 0.25

    def test_compute_scores_single_answer(self):
        scorer = VARKScorer()
        answers = [VarkAnswer(question_id=1, option_id="1a")]
        
        scores = scorer.compute_scores(answers)
        
        assert scores.v > 0
        assert scores.v + scores.a + scores.r + scores.k == pytest.approx(1.0)