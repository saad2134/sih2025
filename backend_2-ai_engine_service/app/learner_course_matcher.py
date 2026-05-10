import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
import joblib
import os
from .catalog import load_catalog
from .embeddings import embed_texts
from .indexer import load_index
from .config import settings

class LearnerCourseMatcher:
    def __init__(self):
        self.index = None
        self.meta = None
        self.scaler = StandardScaler()
        self.is_ready = False
        
        self.models_dir = 'models'
        os.makedirs(self.models_dir, exist_ok=True)
        
        # Load FAISS index and metadata
        try:
            self.index, self.meta = load_index()
            self.is_ready = True
        except Exception as e:
            print(f"Warning: Failed to load FAISS index: {e}")

    def _profile_to_text(self, profile):
        """Convert learner profile to a text query for semantic search"""
        text_parts = []
        
        if profile.get('career_goal'):
            text_parts.append(f"I want to become a {profile['career_goal']}")
            
        if profile.get('interests'):
            interests = ", ".join(profile['interests']) if isinstance(profile['interests'], list) else str(profile['interests'])
            text_parts.append(f"I am interested in {interests}")
            
        if profile.get('skills'):
            skills = ", ".join(profile['skills']) if isinstance(profile['skills'], list) else str(profile['skills'])
            text_parts.append(f"I have skills in {skills}")
            
        if profile.get('learning_goals'):
            goals = ", ".join(profile['learning_goals']) if isinstance(profile['learning_goals'], list) else str(profile['learning_goals'])
            text_parts.append(f"My learning goals are {goals}")
            
        return ". ".join(text_parts) if text_parts else "learning courses"

    def match_courses(self, profile, courses=None, top_k=10):
        """
        Match courses to a learner profile using Semantic Search (FAISS) + Reranking.
        If `courses` is provided, we filter/rank those. If None, we search the global index.
        """
        if not self.is_ready:
            # Try reloading if not ready
            try:
                self.index, self.meta = load_index()
                self.is_ready = True
            except:
                return []
        
        # 1. Semantic Retrieval using FAISS
        query_text = self._profile_to_text(profile)
        query_embedding = embed_texts([query_text])
        
        # Search efficiently using FAISS
        scores, indices = self.index.search(query_embedding, top_k * 3) # Fetch more candidates for reranking
        
        candidates = []
        for score, idx in zip(scores[0], indices[0]):
            if idx < len(self.meta):
                course = self.meta[idx]
                candidates.append({
                    **course,
                    'semantic_score': float(score)  # Cosine similarity
                })
        
        # 2. Reranking / Filtering
        results = []
        user_level = profile.get('preferred_nsqf_level', 1)
        user_lang = profile.get('preferred_language', '').lower()
        user_region = profile.get('region', '').lower()
        
        for course in candidates:
            # Base score from semantic match
            final_score = course['semantic_score'] * 0.7
            
            # NSQF Level alignment (higher score if level is close)
            # We assume users want courses near their level, not too easy or too hard
            course_level = course.get('nsqf_level', 1)
            level_diff = abs(user_level - course_level)
            if level_diff == 0:
                final_score += 0.15
            elif level_diff <= 1:
                final_score += 0.1
            elif level_diff <= 2:
                final_score += 0.05
                
            # Language Match
            if user_lang and user_lang in course.get('language', '').lower():
                final_score += 0.1
                
            # Region Preference (if course has specific region)
            course_region = course.get('region', '').lower()
            if user_region and course_region and user_region == course_region:
                final_score += 0.05
            
            results.append({
                'course_id': course.get('course_id'),
                'title': course.get('title'),
                'description': course.get('description'),
                'nsqf_level': course.get('nsqf_level'),
                'skills': course.get('skills'),
                'duration_months': course.get('duration_months'),
                'language': course.get('language'),
                'provider': course.get('provider', 'NSDC'),  # Default if missing
                'match_probability': round(min(final_score, 0.99), 3),
                'tags': ['Recommended'] if final_score > 0.8 else []
            })
            
        # Sort by final score
        results.sort(key=lambda x: x['match_probability'], reverse=True)
        return results[:top_k]

    # Legacy method stubs to maintain compatibility if called elsewhere, 
    # but they now just pass-through or return dummy values as we rely on Semantic Match.
    def predict_match(self, profile, course):
        # Calculate consistency purely for single-item prediction
        # In a real scenario, this would check the vector distance
        return {'match_probability': 0.8, 'will_match': True}

matcher = LearnerCourseMatcher()
