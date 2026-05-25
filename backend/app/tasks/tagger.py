"""LLM tagging tasks - Gemini Flash batch tagging."""

import asyncio
from datetime import datetime, timezone
from sqlalchemy import select

from app.tasks.celery_app import celery_app
from app.db.session import get_db_context
from app.models.course import Course
from app.config import settings


async def llm_tag_untagged_async():
    if not settings.GEMINI_API_KEY:
        return {"status": "skipped", "reason": "GEMINI_API_KEY not set"}

    async with get_db_context() as db:
        result = await db.execute(
            select(Course).where(Course.llm_tagged == False).limit(10)
        )
        courses = result.scalars().all()

        if not courses:
            return {"status": "complete", "tagged": 0}

        tagged_count = 0
        for course in courses:
            try:
                tags = await tag_single_course_func(course, settings.GEMINI_API_KEY)
                
                if tags:
                    course.math_depth = tags.get("math_depth", course.math_depth)
                    course.math_topics = tags.get("math_topics", course.math_topics or [])
                    course.style_tags = tags.get("style_tags", course.style_tags or [])
                    course.vark_v_score = tags.get("vark_v", 0.25)
                    course.vark_a_score = tags.get("vark_a", 0.25)
                    course.vark_r_score = tags.get("vark_r", 0.25)
                    course.vark_k_score = tags.get("vark_k", 0.25)
                    course.llm_tagged = True
                    tagged_count += 1

            except Exception as e:
                continue

        await db.commit()
        return {"status": "success", "tagged": tagged_count, "total": len(courses)}


@celery_app.task(name="app.tasks.tagger.llm_tag_untagged", bind=True, max_retries=3)
def llm_tag_untagged(self):
    """
    Every 10 min: Tag untagged courses with Gemini Flash.
    Max 3 concurrent, 2 RPS rate limit.
    Tags: math_depth, style_tags, vark_scores.
    """
    try:
        return asyncio.run(llm_tag_untagged_async())
    except Exception as exc:
        raise self.retry(exc=exc, countdown=300)


async def tag_single_course_func(course: Course, api_key: str) -> dict:
    """Tag a single course using Gemini Flash."""
    import google.generativeai as genai
    
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-2.5-flash")
    
    prompt = f"""
    Analyze this course and return JSON with:
    - math_depth: integer 1-4 (1=none, 2=basic, 3=intermediate, 4=advanced)
    - math_topics: list of specific math topics covered
    - style_tags: list from [blackboard_pen, digital_slides, handwritten, smartboard, full_infographics, code_heavy, animation]
    - vark_v, vark_a, vark_r, vark_k: floats 0-1 that sum to 1.0 (dominant teaching style)

    Course: {course.title}
    Description: {course.description or 'No description'}

    Return ONLY valid JSON, no markdown.
    """
    
    response = await asyncio.to_thread(
        model.generate_content,
        prompt,
        generation_config={"response_mime_type": "application/json"}
    )
    
    import json
    try:
        return json.loads(response.text.strip())
    except:
        return {}


async def tag_single_course_async(course_id: str):
    async with get_db_context() as db:
        course = await db.get(Course, course_id)
        if not course:
            return {"status": "error", "message": "Course not found"}
        
        if course.llm_tagged:
            return {"status": "skipped", "reason": "Already tagged"}
        
        if not settings.GEMINI_API_KEY:
            return {"status": "skipped", "reason": "GEMINI_API_KEY not set"}
            
        tags = await tag_single_course_func(course, settings.GEMINI_API_KEY)
        if tags:
            course.math_depth = tags.get("math_depth", course.math_depth)
            course.math_topics = tags.get("math_topics", course.math_topics or [])
            course.style_tags = tags.get("style_tags", course.style_tags or [])
            course.vark_v_score = tags.get("vark_v", 0.25)
            course.vark_a_score = tags.get("vark_a", 0.25)
            course.vark_r_score = tags.get("vark_r", 0.25)
            course.vark_k_score = tags.get("vark_k", 0.25)
            course.llm_tagged = True
            await db.commit()
            return {"status": "success", "course_id": course_id}
            
        return {"status": "failed", "reason": "Could not generate tags"}


@celery_app.task(name="app.tasks.tagger.tag_single_course")
def tag_single_course(course_id: str):
    """Tag a single course - called after ingestion."""
    try:
        return asyncio.run(tag_single_course_async(course_id))
    except Exception as e:
        return {"status": "error", "message": str(e)}