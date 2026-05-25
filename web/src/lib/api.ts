import { authService } from './auth';

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || 'http://localhost:8000';

const originalFetch = globalThis.fetch;

const customFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    let response = await originalFetch(input, init);
    
    if (response.status === 401) {
        const isRefreshRequest = typeof input === 'string' && input.includes('/api/v1/auth/refresh');
        
        if (!isRefreshRequest && typeof window !== 'undefined') {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
                try {
                    const refreshResponse = await originalFetch(`${BACKEND_BASE_URL}/api/v1/auth/refresh`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ refresh_token: refreshToken })
                    });
                    
                    if (refreshResponse.ok) {
                        const refreshData = await refreshResponse.json();
                        if (refreshData.success && refreshData.data?.access_token) {
                            localStorage.setItem('auth_token', refreshData.data.access_token);
                            if (refreshData.data.refresh_token) {
                                localStorage.setItem('refresh_token', refreshData.data.refresh_token);
                            }
                            
                            const newInit = { ...init };
                            if (newInit.headers) {
                                const headersRecord = { ...(newInit.headers as Record<string, string>) };
                                headersRecord['Authorization'] = `Bearer ${refreshData.data.access_token}`;
                                newInit.headers = headersRecord;
                            } else {
                                newInit.headers = {
                                    'Authorization': `Bearer ${refreshData.data.access_token}`
                                };
                            }
                            
                            response = await originalFetch(input, newInit);
                            return response;
                        }
                    }
                } catch (err) {
                    console.error('Failed to silently refresh token:', err);
                }
            }
        }
    }
    
    return response;
};

const fetch = customFetch;

function getAuthHeaders(): HeadersInit {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json'
    };
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }
    return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 401) {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('refresh_token');
            if (window.location.pathname !== '/auth' && window.location.pathname !== '/') {
                window.location.href = '/auth';
            }
        }
        throw new Error('API Error: 401');
    }
    if (!response.ok) {
        let errorMsg = `API Error: ${response.status}`;
        try {
            const errData = await response.json();
            if (errData && errData.detail) {
                errorMsg = errData.detail;
            } else if (errData && errData.message) {
                errorMsg = errData.message;
            }
        } catch (_) {}
        throw new Error(errorMsg);
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
    name?: string;
    timezone: string;
    preferred_language: string;
    onboarding_done: boolean;
    created_at: string;
    interests: string[];
    skills: string[];
    career_goal?: string;
    learning_goals?: string[];
    target_roles?: string[];
    preferred_nsqf_level?: number;
    progress?: number;
    subscription_tier?: string;
    pending_subscription_tier?: string;
    subscription_expires_at?: string;
    avatar_url?: string | null;
}

export interface LeaderboardUser {
    rank: number;
    name: string;
    avatar: string;
    points: number;
    streak: number;
    courses: number;
    change: number;
    country: string;
    is_current?: boolean;
}

export interface MarketSkill {
    name: string;
    demand: number;
    growth: string;
    salary: string;
    icon: string;
}

export interface MarketJobRole {
    title: string;
    demand: string;
    openings: number;
    avgSalary: string;
    growth: string;
}

export interface MarketCompany {
    name: string;
    hiring: number;
    roles: string[];
}

export interface CareerForecast {
    year: number;
    webDev: number;
    dataScience: number;
    aiMl: number;
    cloud: number;
}

export interface YourPathFit {
    currentRole: string;
    matchScore: number;
    demandForecast: string;
    growthRate: string;
    recommendedSkills: string[];
    jobAvailability: number;
}

export interface MarketInsightsData {
    your_path_fit: YourPathFit;
    skills: MarketSkill[];
    job_roles: MarketJobRole[];
    companies: MarketCompany[];
    career_forecasts: CareerForecast[];
}

export interface MilestoneDetails {
    skills: string[];
    resources: string[];
    nextSteps: string;
    provider?: string;
    level?: string;
    salary?: string;
    companies?: string[];
    course_id?: string;
    enrolment_id?: string;
    current_week?: number;
    study_mode?: string;
    url?: string;
}


export interface Milestone {
    id: number;
    title: string;
    status: string;
    type: string;
    description: string;
    duration: string;
    progress: number;
    icon: string;
    color: string;
    bgColor: string;
    details: MilestoneDetails;
}

export interface CareerPath {
    goal: string;
    duration: string;
    level: string;
    match: number;
}

export interface CareerMapData {
    career_path: CareerPath;
    milestones: Milestone[];
    generated_at?: string;
    is_stale?: boolean;
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

    async getUserStats(): Promise<ApiResponse<{
        streak: number;
        rank: number;
        total_users: number;
        points: number;
        level: number;
    }>> {
        const response = await fetch(`${BACKEND_BASE_URL}/api/v1/auth/stats`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    async getLeaderboard(): Promise<ApiResponse<{
        weekly: LeaderboardUser[];
        monthly: LeaderboardUser[];
        all_time: LeaderboardUser[];
    }>> {
        const response = await fetch(`${BACKEND_BASE_URL}/api/v1/auth/leaderboard`, {
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

    async updateLearnerProfile(data: any): Promise<ApiResponse<{ profile: LearnerProfile; job_id: string }>> {
        const response = await fetch(`${BACKEND_BASE_URL}/api/v1/onboarding/profile`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
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

    async getMarketInsights(): Promise<ApiResponse<MarketInsightsData>> {
        const response = await fetch(`${BACKEND_BASE_URL}/api/v1/career/market-insights`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    async getCareerMap(): Promise<ApiResponse<CareerMapData>> {
        const response = await fetch(`${BACKEND_BASE_URL}/api/v1/career/map`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    async regenerateCareerMap(): Promise<ApiResponse<CareerMapData>> {
        const response = await fetch(`${BACKEND_BASE_URL}/api/v1/career/map/regenerate`, {
            method: 'POST',
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    async getEnrolledCourses(): Promise<ApiResponse<{
        enrolment_id: string;
        course_id: string;
        title: string;
        provider: string;
        progress_pct: number;
        current_week: number;
        total_hours: number;
        enrolled_at: string;
        completed_at: string | null;
    }[]>> {
        const response = await fetch(`${BACKEND_BASE_URL}/api/v1/recommendations/enrolled`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    async updateEnrolment(
        enrolmentId: string,
        data: { progress_pct?: number; current_week?: number; dropped?: boolean; study_mode?: string }
    ): Promise<ApiResponse<any>> {
        const response = await fetch(`${BACKEND_BASE_URL}/api/v1/recommendations/enrolments/${enrolmentId}`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },

    async getSavedCourses(): Promise<ApiResponse<any[]>> {
        const response = await fetch(`${BACKEND_BASE_URL}/api/v1/recommendations/saved`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    async saveCourse(courseId: string): Promise<ApiResponse<any>> {
        const response = await fetch(`${BACKEND_BASE_URL}/api/v1/recommendations/saved/${courseId}`, {
            method: 'POST',
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    async unsaveCourse(courseId: string): Promise<ApiResponse<any>> {
        const response = await fetch(`${BACKEND_BASE_URL}/api/v1/recommendations/saved/${courseId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    async overrideMilestone(milestoneId: number, studyMode: string): Promise<ApiResponse<any>> {
        const response = await fetch(`${BACKEND_BASE_URL}/api/v1/career/milestones/override`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ milestone_id: milestoneId, study_mode: studyMode })
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

    async checkout(plan?: string): Promise<ApiResponse<{ checkout_url: string; is_mock: boolean; message?: string }>> {
        const url = plan 
            ? `${BACKEND_BASE_URL}/api/v1/payments/checkout?plan=${encodeURIComponent(plan)}` 
            : `${BACKEND_BASE_URL}/api/v1/payments/checkout`;
        const response = await fetch(url, {
            method: 'POST',
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    async mockConfirmPayment(plan?: string): Promise<ApiResponse<{ status: string; subscription_tier: string; message: string }>> {
        const url = plan 
            ? `${BACKEND_BASE_URL}/api/v1/payments/mock-confirm?plan=${encodeURIComponent(plan)}` 
            : `${BACKEND_BASE_URL}/api/v1/payments/mock-confirm`;
        const response = await fetch(url, {
            method: 'POST',
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    async confirmCheckout(checkoutId: string, customerSessionToken?: string): Promise<ApiResponse<{ status: string; subscription_tier: string; message: string }>> {
        const url = customerSessionToken
            ? `${BACKEND_BASE_URL}/api/v1/payments/confirm-checkout?checkout_id=${encodeURIComponent(checkoutId)}&customer_session_token=${encodeURIComponent(customerSessionToken)}`
            : `${BACKEND_BASE_URL}/api/v1/payments/confirm-checkout?checkout_id=${encodeURIComponent(checkoutId)}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    async submitFeedback(title: string, message: string, page: string): Promise<ApiResponse<{ status: string; is_mock: boolean; message: string }>> {
        const response = await fetch(`${BACKEND_BASE_URL}/api/v1/feedback/submit`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ title, message, page })
        });
        return handleResponse(response);
    },

    async submitContact(data: { name: string; email: string; phone: string; title: string; message: string; page: string }): Promise<ApiResponse<{ status: string; is_mock: boolean; message: string }>> {
        const response = await fetch(`${BACKEND_BASE_URL}/api/v1/contact/submit`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },

    async companionChat(message: string, history: { role: string; content: string }[]): Promise<ApiResponse<{ response: string; is_mock: boolean }>> {
        const response = await fetch(`${BACKEND_BASE_URL}/api/v1/companion/chat`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ message, history })
        });
        return handleResponse(response);
    },

    async checkHealth(): Promise<{ status: string; version: string; database: string; redis: string }> {
        const response = await fetch(`${BACKEND_BASE_URL}/api/v1/health`);
        return handleResponse(response);
    },

    async getUploadSignature(): Promise<ApiResponse<{ signature: string; expire: number }>> {
        const response = await fetch(`${BACKEND_BASE_URL}/api/v1/auth/upload-signature`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    async updateAvatar(avatarUrl: string, oldFileUuid?: string): Promise<ApiResponse<{ avatar_url: string }>> {
        const response = await fetch(`${BACKEND_BASE_URL}/api/v1/auth/avatar`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ avatar_url: avatarUrl, old_file_uuid: oldFileUuid ?? null })
        });
        return handleResponse(response);
    }
};

export { BACKEND_BASE_URL };