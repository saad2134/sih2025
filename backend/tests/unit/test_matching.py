"""Unit tests for matching engine."""

import pytest


class TestMatchingService:
    def test_math_check_pass(self):
        from app.services.matching import MatchingService
        
        service = MatchingService.__new__(MatchingService)
        
        level, warning = service._check_math(comfort=3, depth=2)
        assert level == "PASS"
        assert warning is None

    def test_math_check_warn(self):
        from app.services.matching import MatchingService
        
        service = MatchingService.__new__(MatchingService)
        
        level, warning = service._check_math(comfort=2, depth=3)
        assert level == "WARN"
        assert warning is not None

    def test_math_check_exclude(self):
        from app.services.matching import MatchingService
        
        service = MatchingService.__new__(MatchingService)
        
        level, warning = service._check_math(comfort=2, depth=5)
        assert level == "EXCLUDE"
        assert warning is not None

    def test_math_check_equal(self):
        from app.services.matching import MatchingService
        
        service = MatchingService.__new__(MatchingService)
        
        level, warning = service._check_math(comfort=3, depth=3)
        assert level == "PASS"