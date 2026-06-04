"""VARK quiz scoring - computes normalized VARK scores from quiz answers."""

from pydantic import BaseModel
from app.schemas.onboarding import VarkAnswer


class VARKScores(BaseModel):
    v: float
    a: float
    r: float
    k: float


class VARKScorer:
    """Computes VARK scores from quiz answers using 16-question rubric."""

    DIM_MAP = {"V": "v", "A": "a", "R": "r", "K": "k"}

    def __init__(self):
        self.question_dim_weights = {
            1: {"V": 3, "A": 2, "R": 2, "K": 1},
            2: {"V": 2, "A": 3, "R": 2, "K": 1},
            3: {"V": 2, "A": 2, "R": 2, "K": 2},
            4: {"V": 2, "A": 2, "R": 2, "K": 2},
            5: {"V": 3, "A": 1, "R": 2, "K": 2},
            6: {"V": 2, "A": 2, "R": 2, "K": 2},
            7: {"V": 3, "A": 2, "R": 2, "K": 1},
            8: {"V": 2, "A": 2, "R": 2, "K": 2},
        }

    def compute_scores(self, answers: list[VarkAnswer]) -> VARKScores:
        scores = {"V": 0.0, "A": 0.0, "R": 0.0, "K": 0.0}
        total_weight = 0

        for answer in answers:
            q_id = answer.question_id
            dim = answer.option_id[0].upper()
            
            if dim in scores and q_id in self.question_dim_weights:
                weight = self.question_dim_weights[q_id].get(dim, 1)
                scores[dim] += weight
                total_weight += weight

        if total_weight == 0:
            return VARKScores(v=0.25, a=0.25, r=0.25, k=0.25)

        raw_scores = {d: s / total_weight for d, s in scores.items()}
        total = sum(raw_scores.values())
        if total > 0:
            normalized = {d: s / total for d, s in raw_scores.items()}
        else:
            normalized = {"V": 0.25, "A": 0.25, "R": 0.25, "K": 0.25}

        return VARKScores(**normalized)