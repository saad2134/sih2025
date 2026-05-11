import { authService } from './auth';

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function getAuthHeaders(): HeadersInit {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || localStorage.getItem('token')}`
    };
}

function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }
    return response.json();
}

export interface Course {
    course_id: string;
    title: string;
    provider: string;
    duration_months: number;
    nsqf_level: number;
    match_probability: number;
    skills: string;
}

export interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    timezone: string;
    preferred_language: string;
    onboarding_done: boolean;
    created_at: string;
}

export interface LearnerProfile {
    id: string;
    user_id: string;
    topic: string;
    goal: string;
    hours_per_week: number;
    math_comfort: number;
    style_preferences: string[];
    prior_knowledge: string;
    career_target?: string;
    vark_scores: {
        v: number;
        a: number;
        r: number;
        k: number;
        dominant: string;
    };
}

export interface VarkAnswer {
    question_id: number;
    option_id: string;
}

export interface OnboardingSubmit {
    vark_answers: VarkAnswer[];
    topic: string;
    goal: string;
    hours_per_week: number;
    math_comfort: number;
    style_preferences: string[];
    prior_knowledge: string;
    career_target?: string;
    language?: string;
}

export interface QuizQuestion {
    id: number;
    text: string;
    options: { id: string; label: string; vark_dim: string }[];
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: unknown;
    };
}

export const apiService = {
    async register(email: string, password: string, fullName: string): Promise<ApiResponse<{ user_id: string; access_token: string; refresh_token: string }>> {
        const response = await fetch(`${BACKEND_BASE_URL}/api/v1/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, full_name: fullName })
        });
        return handleResponse(response);
    },

    async login(email: string, password: string): Promise<ApiResponse<{ access_token: string; refresh_token: string }>> {
        const response = await fetch(`${BACKEND_BASE_URL}/api/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await handleResponse<ApiResponse<{ access_token: string; refresh_token: string }>>(response);
        if (data.success && data.data) {
            localStorage.setItem('auth_token', data.data.access_token);
            localStorage.setItem('refresh_token', data.data.refresh_token);
        }
        return data;
    },

    async logout(): Promise<void> {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
            await fetch(`${BACKEND_BASE_URL}/api/v1/auth/logout`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ refresh_token: refreshToken })
            });
        }
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
    },

    async getMe(): Promise<ApiResponse<UserProfile>> {
        const response = await fetch(`${BACKEND_BASE_URL}/api/v1/auth/me`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    async getOnboardingQuiz(): Promise<ApiResponse<{ questions: QuizQuestion[] }>> {
        const response = await fetch(`${BACKEND_BASE_URL}/api/v1/onboarding/quiz`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    async submitOnboarding(data: OnboardingSubmit): Promise<ApiResponse<{ job_id: string; profile_id: string }>> {
        const response = await fetch(`${BACKEND_BASE_URL}/api/v1/onboarding/submit`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },

    async getOnboardingStatus(jobId: string): Promise<ApiResponse<{ job_id: string; status: string; data?: unknown; error?: string }>> {
        const response = await fetch(`${BACKEND_BASE_URL}/api/v1/onboarding/status/${jobId}`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    async getLearnerProfile(): Promise<ApiResponse<LearnerProfile>> {
        const response = await fetch(`${BACKEND_BASE_URL}/api/v1/onboarding/profile`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    async getRecommendations(limit = 20, offset = 0): Promise<ApiResponse<{ items: unknown[]; total: number }>> {
        const response = await fetch(`${BACKEND_BASE_URL}/api/v1/recommendations?limit=${limit}&offset=${offset}`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    async getCourseMatchReport(courseId: string): Promise<ApiResponse<unknown>> {
        const response = await fetch(`${BACKEND_BASE_URL}/api/v1/recommendations/${courseId}/match-report`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    async enrolInCourse(courseId: string): Promise<ApiResponse<{ enrolment_id: string }>> {
        const response = await fetch(`${BACKEND_BASE_URL}/api/v1/recommendations/${courseId}/enrol`, {
            method: 'POST',
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    async getCourses(params?: { topic?: string; difficulty?: string; nsqf_only?: boolean; page?: number; limit?: number }): Promise<ApiResponse<{ items: unknown[]; total: number; page: number; limit: number }>> {
        const searchParams = new URLSearchParams();
        if (params?.topic) searchParams.set('topic', params.topic);
        if (params?.difficulty) searchParams.set('difficulty', params.difficulty);
        if (params?.nsqf_only) searchParams.set('nsqf_only', 'true');
        if (params?.page) searchParams.set('page', String(params.page));
        if (params?.limit) searchParams.set('limit', String(params.limit));

        const response = await fetch(`${BACKEND_BASE_URL}/api/v1/courses?${searchParams}`);
        return handleResponse(response);
    },

    async getCourse(courseId: string): Promise<ApiResponse<unknown>> {
        const response = await fetch(`${BACKEND_BASE_URL}/api/v1/courses/${courseId}`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    async searchCourses(query: string, limit = 20): Promise<ApiResponse<{ items: { id: string; title: string; provider: string }[] }>> {
        const response = await fetch(`${BACKEND_BASE_URL}/api/v1/courses/search?q=${encodeURIComponent(query)}&limit=${limit}`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    async getSkillGap(): Promise<ApiResponse<{
        career_target: string;
        skills_required: string[];
        skills_owned: string[];
        gap: string[];
        gap_percentage: number;
    }>> {
        const response = await fetch(`${BACKEND_BASE_URL}/api/v1/career/skill-gap`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    async getCareerScore(): Promise<ApiResponse<{
        career_target: string;
        skill_match_pct: number;
        nsqf_alignment: boolean;
        level: string;
        next_steps: string[];
    }>> {
        const response = await fetch(`${BACKEND_BASE_URL}/api/v1/career/score`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    async submitReview(courseId: string, rating: number, body: string, completionStatus: string): Promise<ApiResponse<unknown>> {
        const response = await fetch(`${BACKEND_BASE_URL}/api/v1/reviews/submit`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                course_id: courseId,
                rating,
                body,
                completion_status: completionStatus
            })
        });
        return handleResponse(response);
    },

    async getCourseReviews(courseId: string, varkType?: string): Promise<ApiResponse<{ items: unknown[] }>> {
        const url = varkType
            ? `${BACKEND_BASE_URL}/api/v1/reviews/course/${courseId}?vark_type=${varkType}`
            : `${BACKEND_BASE_URL}/api/v1/reviews/course/${courseId}`;
        const response = await fetch(url, { headers: getAuthHeaders() });
        return handleResponse(response);
    },

    async checkHealth(): Promise<{ status: string; version: string; database: string; redis: string }> {
        const response = await fetch(`${BACKEND_BASE_URL}/api/v1/health`);
        return handleResponse(response);
    }
};

export { BACKEND_BASE_URL };