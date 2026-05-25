"""Career router."""

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, Union

from app.db.session import get_db
from app.db.redis import get_redis
import redis.asyncio as redis
from app.services.auth import AuthService
from app.schemas.career import SkillGap, CareerScore, MarketInsightsResponse, CareerMapResponse
from app.schemas.common import ApiResponse
from sqlalchemy import select
import uuid
from app.models.onboarding import LearnerProfile
from app.models.career_map import CareerMapSnapshot
from datetime import datetime, timezone

router = APIRouter(prefix="/career", tags=["career"])


@router.get("/skill-gap")
async def get_skill_gap(
    db: AsyncSession = Depends(get_db),
    redis_client: redis.Redis = Depends(get_redis),
    authorization: str = Header(None),
):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization")
    
    token = authorization.replace("Bearer ", "")
    auth_service = AuthService(db, redis_client)
    user = await auth_service.get_current_user(token)
    
    result = await db.execute(
        select(LearnerProfile).where(LearnerProfile.user_id == user.id)
    )
    profile = result.scalar_one_or_none()
    
    import json

    FALLBACK_SKILLS = {
        "data_scientist": ["python", "machine_learning", "data_science", "statistics", "sql", "deep_learning"],
        "software_engineer": ["python", "java", "data_structures", "algorithms", "system_design", "git"],
        "frontend_developer": ["javascript", "react", "html", "css", "typescript", "tailwind"],
        "backend_developer": ["python", "node.js", "databases", "sql", "apis", "docker", "git"],
        "fullstack_developer": ["javascript", "react", "node.js", "databases", "html", "css", "git"],
        "ai_engineer": ["python", "machine_learning", "deep_learning", "neural_networks", "natural_language_processing", "computer_vision", "mathematics"],
        "default": ["communication", "problem_solving", "teamwork", "adaptability", "critical_thinking"]
    }

    if not profile or not profile.career_target:
        return ApiResponse.ok(SkillGap(
            career_target="Not set",
            skills_required=[],
            skills_owned=[],
            skills_gained_by_course=[],
            gap=[],
            gap_percentage=0.0,
        ))
    
    career_target = profile.career_target
    target_slug = career_target.lower().strip().replace(" ", "_").replace("-", "_")

    skills_json = await redis_client.get(f"career:skills:{target_slug}")
    if skills_json:
        try:
            required = json.loads(skills_json)
        except Exception:
            required = FALLBACK_SKILLS.get(target_slug, FALLBACK_SKILLS["default"])
    else:
        required = FALLBACK_SKILLS.get(target_slug, FALLBACK_SKILLS["default"])

    # Determine owned skills based on prior_knowledge
    owned = []
    prior_str = profile.prior_knowledge or ""
    if "Possesses skills:" in prior_str:
        import re
        match = re.search(r"Possesses skills:\s*([^.\[]+)", prior_str, re.IGNORECASE)
        if match:
            skills_part = match.group(1)
            user_skills = [s.strip().lower().replace("_", " ").replace("-", " ") for s in skills_part.split(",") if s.strip()]
            for s in required:
                s_lower = s.lower().strip().replace("_", " ").replace("-", " ")
                if any(us == s_lower or us in s_lower or s_lower in us for us in user_skills):
                    owned.append(s)
    elif prior_str == "advanced" and len(required) >= 4:
        owned = required[:4]
    elif prior_str == "intermediate" and len(required) >= 3:
        owned = required[:3]
    elif prior_str == "beginner" and len(required) >= 2:
        owned = required[:2]
    elif prior_str == "none":
        owned = []
    else:
        # Fallback default if length constraints are not met
        owned = required[:1] if required else []

    gap = [s for s in required if s not in owned]
    gap_percentage = round(len(owned) / len(required) * 100, 1) if required else 0.0

    return ApiResponse.ok(SkillGap(
        career_target=career_target,
        skills_required=required,
        skills_owned=owned,
        skills_gained_by_course=[],
        gap=gap,
        gap_percentage=gap_percentage,
    ))


@router.get("/score")
async def get_career_score(
    db: AsyncSession = Depends(get_db),
    redis_client: redis.Redis = Depends(get_redis),
    authorization: str = Header(None),
):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization")
    
    token = authorization.replace("Bearer ", "")
    auth_service = AuthService(db, redis_client)
    user = await auth_service.get_current_user(token)
    
    result = await db.execute(
        select(LearnerProfile).where(LearnerProfile.user_id == user.id)
    )
    profile = result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(status_code=403, detail="Complete onboarding first")
    
    skill_match = 45.0
    nsqf_alignment = profile.goal == "certification"
    
    return ApiResponse.ok(CareerScore(
        career_target=profile.career_target or "Not set",
        skill_match_pct=skill_match,
        nsqf_alignment=nsqf_alignment,
        level=f"NSQF Level {profile.topic[:2] if profile.topic else '4'}",
        next_steps=[
            "Complete foundational courses",
            "Build portfolio projects",
            "Apply for internships",
        ],
    ))


@router.get("/market-insights")
async def get_market_insights(
    db: AsyncSession = Depends(get_db),
    redis_client: redis.Redis = Depends(get_redis),
    authorization: str = Header(None),
):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization")
    
    token = authorization.replace("Bearer ", "")
    auth_service = AuthService(db, redis_client)
    user = await auth_service.get_current_user(token)
    
    result = await db.execute(
        select(LearnerProfile).where(LearnerProfile.user_id == user.id)
    )
    profile = result.scalar_one_or_none()

    import json
    import re

    FALLBACK_SKILLS = {
        "data_scientist": ["python", "machine_learning", "data_science", "statistics", "sql", "deep_learning"],
        "software_engineer": ["python", "java", "data_structures", "algorithms", "system_design", "git"],
        "frontend_developer": ["javascript", "react", "html", "css", "typescript", "tailwind"],
        "backend_developer": ["python", "node.js", "databases", "sql", "apis", "docker", "git"],
        "fullstack_developer": ["javascript", "react", "node.js", "databases", "html", "css", "git"],
        "default": ["communication", "problem_solving", "teamwork", "adaptability", "critical_thinking"]
    }

    if not profile or not profile.career_target:
        your_path_fit = {
            "currentRole": "Software Developer",
            "matchScore": 0,
            "demandForecast": "High Demand",
            "growthRate": "+12% YoY",
            "recommendedSkills": [],
            "jobAvailability": 8.0
        }
    else:
        career_target = profile.career_target
        target_slug = career_target.lower().strip().replace(" ", "_").replace("-", "_")

        skills_json = await redis_client.get(f"career:skills:{target_slug}")
        if skills_json:
            try:
                required = json.loads(skills_json)
            except Exception:
                required = FALLBACK_SKILLS.get(target_slug, FALLBACK_SKILLS["default"])
        else:
            required = FALLBACK_SKILLS.get(target_slug, FALLBACK_SKILLS["default"])

        # Determine owned skills based on prior_knowledge
        owned = []
        prior_str = profile.prior_knowledge or ""
        if "Possesses skills:" in prior_str:
            match = re.search(r"Possesses skills:\s*([^.\[]+)", prior_str, re.IGNORECASE)
            if match:
                skills_part = match.group(1)
                user_skills = [s.strip().lower().replace("_", " ").replace("-", " ") for s in skills_part.split(",") if s.strip()]
                for s in required:
                    s_lower = s.lower().strip().replace("_", " ").replace("-", " ")
                    if any(us == s_lower or us in s_lower or s_lower in us for us in user_skills):
                        owned.append(s)
        elif prior_str == "advanced" and len(required) >= 4:
            owned = required[:4]
        elif prior_str == "intermediate" and len(required) >= 3:
            owned = required[:3]
        elif prior_str == "beginner" and len(required) >= 2:
            owned = required[:2]
        elif prior_str == "none":
            owned = []
        else:
            owned = required[:1] if required else []

        gap = [s for s in required if s not in owned]
        gap_percentage = int(round(len(owned) / len(required) * 100)) if required else 0

        forecasts_map = {
            "data_scientist": ("Very High Demand", "+22% YoY", 9.2),
            "software_engineer": ("High Demand", "+15% YoY", 8.8),
            "frontend_developer": ("Very High Demand", "+18% YoY", 9.0),
            "backend_developer": ("Very High Demand", "+16% YoY", 8.9),
            "fullstack_developer": ("High Demand", "+20% YoY", 9.1),
            "default": ("Medium Demand", "+8% YoY", 7.5),
        }
        demand_desc, growth_desc, availability = forecasts_map.get(target_slug, forecasts_map["default"])

        your_path_fit = {
            "currentRole": career_target,
            "matchScore": gap_percentage,
            "demandForecast": demand_desc,
            "growthRate": growth_desc,
            "recommendedSkills": [s.replace("_", " ").replace("-", " ").title() for s in gap[:4]],
            "jobAvailability": availability
        }

    # Rest of the macroeconomic datasets
    skills = [
        {"name": "Web Development", "demand": 92, "growth": "+15%", "salary": "₹6-12 LPA", "icon": "Code"},
        {"name": "Data Science", "demand": 88, "growth": "+22%", "salary": "₹8-15 LPA", "icon": "Database"},
        {"name": "Cloud Computing", "demand": 85, "growth": "+18%", "salary": "₹7-14 LPA", "icon": "Cloud"},
        {"name": "AI/ML", "demand": 90, "growth": "+25%", "salary": "₹10-20 LPA", "icon": "Brain"},
        {"name": "Cybersecurity", "demand": 82, "growth": "+12%", "salary": "₹6-13 LPA", "icon": "Shield"},
        {"name": "Mobile Development", "demand": 78, "growth": "+10%", "salary": "₹5-11 LPA", "icon": "Smartphone"},
        {"name": "UI/UX Design", "demand": 76, "growth": "+14%", "salary": "₹5-10 LPA", "icon": "Palette"},
        {"name": "DevOps", "demand": 80, "growth": "+16%", "salary": "₹7-13 LPA", "icon": "Cloud"},
    ]

    job_roles = [
        {"title": "Frontend Developer", "demand": "Very High", "openings": 12500, "avgSalary": "₹8 LPA", "growth": "+18%"},
        {"title": "Backend Developer", "demand": "Very High", "openings": 10200, "avgSalary": "₹9 LPA", "growth": "+15%"},
        {"title": "Full-Stack Developer", "demand": "High", "openings": 8900, "avgSalary": "₹10 LPA", "growth": "+20%"},
        {"title": "Data Scientist", "demand": "Very High", "openings": 7600, "avgSalary": "₹12 LPA", "growth": "+25%"},
        {"title": "ML Engineer", "demand": "High", "openings": 5400, "avgSalary": "₹14 LPA", "growth": "+28%"},
        {"title": "DevOps Engineer", "demand": "High", "openings": 4800, "avgSalary": "₹11 LPA", "growth": "+16%"},
    ]

    companies = [
        {"name": "TCS", "hiring": 4500, "roles": ["Software Engineer", "Developer", "Analyst"]},
        {"name": "Infosys", "hiring": 3800, "roles": ["Engineer", "Consultant", "Developer"]},
        {"name": "Wipro", "hiring": 3200, "roles": ["Developer", "Analyst", "Tester"]},
        {"name": "Accenture", "hiring": 2800, "roles": ["Developer", "Analyst", "Manager"]},
        {"name": "Google", "hiring": 1200, "roles": ["SDE", "ML Engineer", "Data Scientist"]},
        {"name": "Microsoft", "hiring": 950, "roles": ["SDE", "Cloud Engineer", "AI Researcher"]},
    ]

    career_forecasts = [
        {"year": 2026, "webDev": 85, "dataScience": 78, "aiMl": 72, "cloud": 68},
        {"year": 2027, "webDev": 88, "dataScience": 82, "aiMl": 78, "cloud": 74},
        {"year": 2028, "webDev": 90, "dataScience": 86, "aiMl": 84, "cloud": 80},
        {"year": 2029, "webDev": 92, "dataScience": 89, "aiMl": 88, "cloud": 85},
        {"year": 2030, "webDev": 94, "dataScience": 92, "aiMl": 92, "cloud": 90},
    ]

    return ApiResponse.ok(
        MarketInsightsResponse(
            your_path_fit=your_path_fit,
            skills=skills,
            job_roles=job_roles,
            companies=companies,
            career_forecasts=career_forecasts,
        )
    )


async def _generate_career_map(
    user_id: uuid.UUID,
    profile: Optional[LearnerProfile],
    enrolments: list,
    redis_client: redis.Redis,
    db: AsyncSession,
) -> tuple[dict, list]:
    import json
    import re

    # 1. Determine career path parameters
    career_target = "Software Developer"
    if profile and profile.career_target:
        career_target = profile.career_target

    target_slug = career_target.lower().strip().replace(" ", "_").replace("-", "_")

    # Match score logic similar to skill gap
    FALLBACK_SKILLS = {
        "data_scientist": ["python", "machine_learning", "data_science", "statistics", "sql", "deep_learning"],
        "software_engineer": ["python", "java", "data_structures", "algorithms", "system_design", "git"],
        "frontend_developer": ["javascript", "react", "html", "css", "typescript", "tailwind"],
        "backend_developer": ["python", "node.js", "databases", "sql", "apis", "docker", "git"],
        "fullstack_developer": ["javascript", "react", "node.js", "databases", "html", "css", "git"],
        "ai_engineer": ["python", "machine_learning", "deep_learning", "neural_networks", "natural_language_processing", "computer_vision", "mathematics"],
        "default": ["communication", "problem_solving", "teamwork", "adaptability", "critical_thinking"]
    }

    if not profile:
        match_score = 0
    else:
        skills_json = await redis_client.get(f"career:skills:{target_slug}")
        if skills_json:
            try:
                required = json.loads(skills_json)
            except Exception:
                required = FALLBACK_SKILLS.get(target_slug, FALLBACK_SKILLS["default"])
        else:
            required = FALLBACK_SKILLS.get(target_slug, FALLBACK_SKILLS["default"])

        owned = []
        prior_str = profile.prior_knowledge or ""
        if "Possesses skills:" in prior_str:
            match = re.search(r"Possesses skills:\s*([^.\[]+)", prior_str, re.IGNORECASE)
            if match:
                skills_part = match.group(1)
                user_skills = [s.strip().lower().replace("_", " ").replace("-", " ") for s in skills_part.split(",") if s.strip()]
                for s in required:
                    s_lower = s.lower().strip().replace("_", " ").replace("-", " ")
                    if any(us == s_lower or us in s_lower or s_lower in us for us in user_skills):
                        owned.append(s)
        elif prior_str == "advanced" and len(required) >= 4:
            owned = required[:4]
        elif prior_str == "intermediate" and len(required) >= 3:
            owned = required[:3]
        elif prior_str == "beginner" and len(required) >= 2:
            owned = required[:2]
        elif prior_str == "none":
            owned = []
        else:
            owned = required[:1] if required else []

        match_score = int(round(len(owned) / len(required) * 100)) if required else 0

    career_path = {
        "goal": career_target,
        "duration": "9-12 months",
        "level": "Beginner to Job-Ready",
        "match": match_score
    }

    # 2. Build milestones
    milestones = []
    
    # Milestone 1: Onboarding Profile Setup (Completed)
    milestones.append({
        "id": 1,
        "title": "Profile Setup",
        "status": "completed",
        "type": "onboarding",
        "description": "Career assessment and goal setting completed",
        "duration": "Completed",
        "progress": 100,
        "icon": "CheckCircle2",
        "color": "text-green-600",
        "bgColor": "bg-green-50",
        "details": {
            "skills": ["Self-assessment", "Goal setting"],
            "resources": ["Career assessment test", "Profile completion"],
            "nextSteps": "Begin foundational courses"
        }
    })

    # Milestone 2, 3, 4: Courses (dynamic from enrollments, backfilled)
    course_templates = {
        "frontend_developer": [
            {"title": "Web Development Fundamentals", "desc": "Learn HTML, CSS, and JavaScript basics", "skills": ["HTML5", "CSS3", "JavaScript", "Responsive Design"]},
            {"title": "React Frontend Framework", "desc": "Master React, state management, and hooks", "skills": ["React.js", "Redux", "Hooks", "Component Lifecycle"]},
            {"title": "Advanced JavaScript & TypeScript", "desc": "Explore modern TypeScript and ESNext features", "skills": ["TypeScript", "ES6+", "Asynchronous JS", "REST APIs"]}
        ],
        "backend_developer": [
            {"title": "Backend Programming Core", "desc": "Learn Python basics, logic, and core syntax", "skills": ["Python", "Algorithms", "Logic", "Object-Oriented Programming"]},
            {"title": "Databases & SQL Design", "desc": "Master schema design and SQL querying", "skills": ["PostgreSQL", "SQL", "Database Design", "Indexes"]},
            {"title": "Web APIs & Microservices", "desc": "Build secure FastAPI endpoints and microservices", "skills": ["FastAPI", "REST APIs", "Docker", "Authentication"]}
        ],
        "data_scientist": [
            {"title": "Python for Data Science", "desc": "Master Pandas, NumPy, and basic data analysis", "skills": ["Python", "Pandas", "NumPy", "Data Wrangling"]},
            {"title": "Applied Statistics & Math", "desc": "Probability, statistics, and linear algebra", "skills": ["Statistics", "Probability", "Linear Algebra", "Hypothesis Testing"]},
            {"title": "Machine Learning Foundations", "desc": "Supervised and unsupervised learning models", "skills": ["Scikit-Learn", "Regression", "Clustering", "Supervised Learning"]}
        ],
        "fullstack_developer": [
            {"title": "Frontend Core Development", "desc": "HTML, CSS, JavaScript, and React foundations", "skills": ["HTML5", "CSS3", "JavaScript", "React.js"]},
            {"title": "Backend Engineering & Node.js", "desc": "Build server logic with Express and databases", "skills": ["Node.js", "Express", "SQL", "MongoDB"]},
            {"title": "System Integration & Cloud", "desc": "Deploy applications and orchestrate APIs", "skills": ["Docker", "AWS", "CI/CD", "Web Security"]}
        ],
        "ai_engineer": [
            {"title": "Mathematics & Python for AI", "desc": "Linear algebra, probability, and python programming for artificial intelligence.", "skills": ["Python", "Linear Algebra", "Calculus", "Probability"]},
            {"title": "Machine Learning Foundations", "desc": "Supervised and unsupervised learning models and evaluation techniques.", "skills": ["Supervised Learning", "Regression", "Clustering", "Scikit-Learn"]},
            {"title": "Deep Learning & Neural Networks", "desc": "Deep learning architectures, neural networks, CNNs, and RNNs.", "skills": ["Deep Learning", "Neural Networks", "TensorFlow", "PyTorch"]}
        ],
        "default": [
            {"title": "Introduction to Computer Science", "desc": "Learn core logic and algorithmic thinking", "skills": ["Logic", "Flowcharts", "Basic Programming"]},
            {"title": "Data Structures & Algorithms", "desc": "Explore lists, trees, and sorting algorithms", "skills": ["Arrays", "Lists", "Trees", "Big O"]},
            {"title": "Software Engineering Practices", "desc": "Master git version control and development lifecycles", "skills": ["Git", "SDLC", "Agile", "Testing"]}
        ]
    }

    templates = course_templates.get(target_slug, course_templates["default"])
    
    # Process actual enrollments
    course_milestones = []
    for idx, enrol in enumerate(enrolments):
        status = "upcoming"
        if enrol.completed_at or enrol.progress_pct >= 100:
            status = "completed"
        elif enrol.progress_pct > 0:
            status = "current"

        enrol_skills = enrol.course.job_roles if enrol.course.job_roles else []
        if not enrol_skills:
            enrol_skills = ["Core Concepts", "Best Practices"]

        course_milestones.append({
            "title": enrol.course.title,
            "status": status,
            "type": "course",
            "description": enrol.course.provider or "Learn course skills",
            "duration": f"{int((enrol.course.total_hours or 0) / 40) or 2} months",
            "progress": int(enrol.progress_pct),
            "icon": "BookOpen",
            "color": "text-blue-600",
            "bgColor": "bg-blue-50",
            "details": {
                "skills": enrol_skills,
                "resources": ["Interactive tutorials", "Practice projects", "Video lectures"],
                "nextSteps": "Complete the next module/milestone",
                "provider": enrol.course.provider,
                "level": f"NSQF Level {enrol.course.nsqf_level}" if enrol.course.nsqf_level else "Beginner",
                "course_id": str(enrol.course_id),
                "enrolment_id": str(enrol.id),
                "current_week": enrol.current_week,
                "url": enrol.course.url,
            }
        })

    # Fetch all courses from the database to rank them dynamically
    from app.models.course import Course
    from app.services.matching import MatchingService
    
    matching_service = MatchingService(db)
    
    db_courses_res = await db.execute(select(Course))
    all_db_courses = list(db_courses_res.scalars().all())
    
    scored_courses = []
    if profile:
        for course in all_db_courses:
            report = await matching_service.compute_match_report(profile, course)
            scored_courses.append((course, report))
        scored_courses.sort(key=lambda x: x[1].overall_match_pct, reverse=True)
        real_db_courses = [c for c, r in scored_courses if r.overall_match_pct > 20]
    else:
        real_db_courses = []
        
    # If not enough relevant courses in database, trigger discovery service
    if len(real_db_courses) < 3:
        try:
            from app.services.course_discovery import CourseDiscoveryService
            discovery_service = CourseDiscoveryService(db)
            await discovery_service.discover_and_save_courses(career_target)
            
            # Re-fetch and re-score courses
            db_courses_res = await db.execute(select(Course))
            all_db_courses = list(db_courses_res.scalars().all())
            
            scored_courses = []
            if profile:
                for course in all_db_courses:
                    report = await matching_service.compute_match_report(profile, course)
                    scored_courses.append((course, report))
                scored_courses.sort(key=lambda x: x[1].overall_match_pct, reverse=True)
                real_db_courses = [c for c, r in scored_courses if r.overall_match_pct > 20]
        except Exception:
            pass

    # Pick the top ranked courses
    if scored_courses:
        real_db_courses = [c for c, r in scored_courses]
    else:
        real_db_courses = []

    # Merge with templates to have exactly 3 course milestones
    for i in range(3):
        if len(course_milestones) < 3:
            enrolled_ids = {str(enrol.course_id) for enrol in enrolments}
            available_courses = [c for c in real_db_courses if str(c.id) not in enrolled_ids]
            
            if i < len(available_courses):
                course = available_courses[i]
                course_skills = [s.strip() for s in course.style_tags] if course.style_tags else templates[i]["skills"]
                course_milestones.append({
                    "title": course.title,
                    "status": "upcoming",
                    "type": "course",
                    "description": course.description or "Learn course skills",
                    "duration": f"{course.total_hours or 40} hours",
                    "progress": 0,
                    "icon": "BookOpen",
                    "color": "text-blue-600",
                    "bgColor": "bg-blue-50",
                    "details": {
                        "skills": course_skills,
                        "resources": ["Interactive tutorials", "Practice projects", "Video lectures"],
                        "nextSteps": "Enroll to start this course",
                        "provider": course.provider,
                        "level": f"NSQF Level {course.nsqf_level}" if course.nsqf_level else "Beginner",
                        "course_id": str(course.id),
                        "url": course.url,
                    }
                })
            else:
                tpl = templates[i]
                course_milestones.append({
                    "title": tpl["title"],
                    "status": "upcoming",
                    "type": "course",
                    "description": tpl["desc"],
                    "duration": "8 weeks",
                    "progress": 0,
                    "icon": "BookOpen",
                    "color": "text-blue-600",
                    "bgColor": "bg-blue-50",
                    "details": {
                        "skills": tpl["skills"],
                        "resources": ["Core curriculum lectures", "Exercises", "Mini-projects"],
                        "nextSteps": "Enroll to start this course",
                        "provider": "ShikshaDisha Academy",
                        "level": "Beginner to Intermediate"
                    }
                })
        else:
            break

    # Truncate to exactly 3 if user is enrolled in more
    course_milestones = course_milestones[:3]
    
    # Ensure at least one course is marked "current" if none are completed or in progress
    has_active = any(m["status"] in ("completed", "current") for m in course_milestones)
    if not has_active and course_milestones:
        course_milestones[0]["status"] = "current"
        course_milestones[0]["progress"] = 10

    # Add course milestones to final list (IDs 2, 3, 4)
    for idx, milestone in enumerate(course_milestones):
        milestone["id"] = idx + 2
        milestones.append(milestone)

    # Milestone 5: Internship / Certification (Upcoming)
    internship_templates = {
        "frontend_developer": {"title": "Frontend Internship", "provider": "Tech Solutions Ltd.", "skills": ["React.js", "Team Collaboration", "Project Management", "Code Review"]},
        "backend_developer": {"title": "Backend Developer Internship", "provider": "Cloud Systems Inc.", "skills": ["FastAPI", "SQL Optimization", "APIs", "Git Workflow"]},
        "data_scientist": {"title": "Data Analyst Internship", "provider": "Analytica Corp", "skills": ["Pandas", "Data Visualization", "Client Reports", "Statistics"]},
        "fullstack_developer": {"title": "Full-Stack Internship", "provider": "WebTech Enterprises", "skills": ["Node.js", "React.js", "REST Integration", "Deployment"]},
        "ai_engineer": {"title": "AI Engineer Internship", "provider": "DeepMind Partner Labs", "skills": ["Deep Learning", "PyTorch", "Model Deployment", "Team Collaboration"]},
        "default": {"title": "Software Engineering Internship", "provider": "Core Technologies", "skills": ["Software Design", "Code Standards", "Teamwork", "Agile"]}
    }
    intern_tpl = internship_templates.get(target_slug, internship_templates["default"])
    
    milestones.append({
        "id": 5,
        "title": intern_tpl["title"],
        "status": "upcoming",
        "type": "internship",
        "description": f"Gain industry experience with {intern_tpl['provider']}",
        "duration": "3 months",
        "progress": 0,
        "icon": "Briefcase",
        "color": "text-purple-600",
        "bgColor": "bg-purple-50",
        "details": {
            "skills": intern_tpl["skills"],
            "resources": ["Mentor guidance", "Real team projects", "Industry exposure"],
            "nextSteps": "Apply after completing core courses",
            "provider": intern_tpl["provider"],
            "level": "Intermediate"
        }
    })

    # Milestone 6: Job Ready Target (Upcoming)
    milestones.append({
        "id": 6,
        "title": f"Job Ready: {career_target}",
        "status": "upcoming",
        "type": "job",
        "description": f"Start your career as a professional {career_target}",
        "duration": "Permanent",
        "progress": 0,
        "icon": "Target",
        "color": "text-green-600",
        "bgColor": "bg-green-50",
        "details": {
            "skills": ["Full-Stack Development", "Problem Solving", "Interview Prep", "Resume Building"],
            "resources": ["Job placement assistance", "Mock interview sessions", "Career mentoring"],
            "nextSteps": "Start applying and taking interviews",
            "salary": "₹6-12 LPA starting",
            "companies": ["Tech Startups", "IT Services", "Top Product Firms"]
        }
    })

    return career_path, milestones


@router.get("/map")
async def get_career_map(
    db: AsyncSession = Depends(get_db),
    redis_client: redis.Redis = Depends(get_redis),
    authorization: str = Header(None),
):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization")
    
    token = authorization.replace("Bearer ", "")
    auth_service = AuthService(db, redis_client)
    user = await auth_service.get_current_user(token)
    
    result = await db.execute(
        select(LearnerProfile).where(LearnerProfile.user_id == user.id)
    )
    profile = result.scalar_one_or_none()

    from app.models.recommendation import Enrolment
    from sqlalchemy.orm import selectinload
    
    enrol_stmt = select(Enrolment).options(selectinload(Enrolment.course)).where(
        Enrolment.user_id == user.id,
        Enrolment.dropped == False
    )
    enrol_result = await db.execute(enrol_stmt)
    enrolments = enrol_result.scalars().all()

    # Look up existing snapshot
    snapshot_stmt = select(CareerMapSnapshot).where(CareerMapSnapshot.user_id == user.id)
    snapshot_result = await db.execute(snapshot_stmt)
    snapshot = snapshot_result.scalar_one_or_none()

    # Determine career target
    career_target = "Software Developer"
    if profile and profile.career_target:
        career_target = profile.career_target

    # Determine if stale
    is_stale = False
    if not snapshot:
        is_stale = True
    elif snapshot.is_stale:
        is_stale = True
    elif snapshot.career_target_used != career_target:
        is_stale = True
    elif snapshot.enrolment_count != len(enrolments):
        is_stale = True

    if is_stale:
        # Generate new path and milestones
        career_path, milestones = await _generate_career_map(user.id, profile, enrolments, redis_client, db)
        
        if not snapshot:
            snapshot = CareerMapSnapshot(
                user_id=user.id,
                career_target_used=career_target,
                career_path=career_path,
                milestones=milestones,
                enrolment_count=len(enrolments),
                is_stale=False,
                generated_at=datetime.now(timezone.utc)
            )
            db.add(snapshot)
        else:
            snapshot.career_target_used = career_target
            snapshot.career_path = career_path
            snapshot.milestones = milestones
            snapshot.enrolment_count = len(enrolments)
            snapshot.is_stale = False
            snapshot.generated_at = datetime.now(timezone.utc)
        
        await db.flush()
    else:
        # Load from snapshot
        career_path = snapshot.career_path
        milestones = snapshot.milestones

    # Always overlay live progress and manual overrides
    milestones = await _overlay_milestone_progress(milestones, enrolments, user.id, db)

    return ApiResponse.ok(
        CareerMapResponse(
            career_path=career_path,
            milestones=milestones,
            generated_at=snapshot.generated_at,
            is_stale=is_stale
        )
    )


@router.post("/map/regenerate")
async def regenerate_career_map(
    db: AsyncSession = Depends(get_db),
    redis_client: redis.Redis = Depends(get_redis),
    authorization: str = Header(None),
):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization")
    
    token = authorization.replace("Bearer ", "")
    auth_service = AuthService(db, redis_client)
    user = await auth_service.get_current_user(token)
    
    result = await db.execute(
        select(LearnerProfile).where(LearnerProfile.user_id == user.id)
    )
    profile = result.scalar_one_or_none()

    from app.models.recommendation import Enrolment
    from sqlalchemy.orm import selectinload
    
    enrol_stmt = select(Enrolment).options(selectinload(Enrolment.course)).where(
        Enrolment.user_id == user.id,
        Enrolment.dropped == False
    )
    enrol_result = await db.execute(enrol_stmt)
    enrolments = enrol_result.scalars().all()

    # Look up existing snapshot
    snapshot_stmt = select(CareerMapSnapshot).where(CareerMapSnapshot.user_id == user.id)
    snapshot_result = await db.execute(snapshot_stmt)
    snapshot = snapshot_result.scalar_one_or_none()

    career_target = "Software Developer"
    if profile and profile.career_target:
        career_target = profile.career_target

    # Force generation
    career_path, milestones = await _generate_career_map(user.id, profile, enrolments, redis_client, db)
    
    if not snapshot:
        snapshot = CareerMapSnapshot(
            user_id=user.id,
            career_target_used=career_target,
            career_path=career_path,
            milestones=milestones,
            enrolment_count=len(enrolments),
            is_stale=False,
            generated_at=datetime.now(timezone.utc)
        )
        db.add(snapshot)
    else:
        snapshot.career_target_used = career_target
        snapshot.career_path = career_path
        snapshot.milestones = milestones
        snapshot.enrolment_count = len(enrolments)
        snapshot.is_stale = False
        snapshot.generated_at = datetime.now(timezone.utc)
    
    await db.flush()

    # Always overlay live progress and manual overrides
    milestones = await _overlay_milestone_progress(milestones, enrolments, user.id, db)

    return ApiResponse.ok(
        CareerMapResponse(
            career_path=career_path,
            milestones=milestones,
            generated_at=snapshot.generated_at,
            is_stale=snapshot.is_stale
        )
    )


async def _overlay_milestone_progress(milestones: list, enrolments: list, user_id: uuid.UUID, db: AsyncSession) -> list:
    from app.models.career_map import MilestoneOverride
    
    # Fetch overrides
    overrides_stmt = select(MilestoneOverride).where(MilestoneOverride.user_id == user_id)
    overrides_res = await db.execute(overrides_stmt)
    overrides = overrides_res.scalars().all()
    overrides_map = {o.milestone_id: o.study_mode for o in overrides}
    
    enrolments_map = {str(e.course_id): e for e in enrolments}
    
    for milestone in milestones:
        m_id = milestone.get("id")
        
        # Apply override if exists
        if m_id in overrides_map:
            study_mode = overrides_map[m_id]
            milestone["details"]["study_mode"] = study_mode
            if study_mode in ["already_studied", "learned_off_platform"]:
                milestone["status"] = "completed"
                milestone["progress"] = 100
        else:
            milestone["details"]["study_mode"] = "standard"
            
        # Apply enrolment if applicable
        if milestone.get("type") == "course" and milestone.get("details"):
            course_id = milestone["details"].get("course_id")
            if course_id and course_id in enrolments_map:
                enrol = enrolments_map[course_id]
                study_mode = enrol.study_mode or "standard"
                milestone["details"]["study_mode"] = study_mode
                milestone["details"]["enrolment_id"] = str(enrol.id)
                milestone["details"]["current_week"] = enrol.current_week
                if enrol.course and enrol.course.url:
                    milestone["details"]["url"] = enrol.course.url
                
                if study_mode in ["already_studied", "learned_off_platform"]:
                    milestone["status"] = "completed"
                    milestone["progress"] = 100
                else:
                    status = "upcoming"
                    if enrol.dropped:
                        status = "upcoming"
                        milestone["progress"] = 0
                    elif enrol.completed_at or enrol.progress_pct >= 100:
                        status = "completed"
                        milestone["progress"] = 100
                    else:
                        if enrol.progress_pct > 0:
                            status = "current"
                        milestone["progress"] = int(enrol.progress_pct)
                    
                    milestone["status"] = status
    return milestones


from app.schemas.career import MilestoneOverrideRequest

@router.post("/milestones/override")
async def override_milestone(
    data: MilestoneOverrideRequest,
    db: AsyncSession = Depends(get_db),
    redis_client: redis.Redis = Depends(get_redis),
    authorization: str = Header(None),
):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization")
    
    token = authorization.replace("Bearer ", "")
    auth_service = AuthService(db, redis_client)
    user = await auth_service.get_current_user(token)
    
    from app.models.career_map import MilestoneOverride
    from app.models.recommendation import Enrolment
    from sqlalchemy.dialects.postgresql import insert
    
    # Check if this milestone has an enrolment
    from app.models.career_map import CareerMapSnapshot
    snapshot_stmt = select(CareerMapSnapshot).where(CareerMapSnapshot.user_id == user.id)
    snapshot_res = await db.execute(snapshot_stmt)
    snapshot = snapshot_res.scalar_one_or_none()
    
    enrolment_id = None
    if snapshot:
        for m in snapshot.milestones:
            if m.get("id") == data.milestone_id:
                enrolment_id = m.get("details", {}).get("enrolment_id")
                break
                
    if enrolment_id:
        enrol_uuid = uuid.UUID(enrolment_id)
        enrolment = await db.get(Enrolment, enrol_uuid)
        if enrolment:
            enrolment.study_mode = data.study_mode
            await db.flush()
    else:
        stmt = insert(MilestoneOverride).values(
            user_id=user.id,
            milestone_id=data.milestone_id,
            study_mode=data.study_mode
        )
        stmt = stmt.on_conflict_do_update(
            index_elements=["user_id", "milestone_id"],
            set_={"study_mode": data.study_mode}
        )
        await db.execute(stmt)
        await db.flush()

    if snapshot:
        snapshot.is_stale = True
        await db.flush()
        
    return ApiResponse.ok({"status": "success"})