import { BACKEND_BASE_URL } from './api';

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  token?: string;
  access_token?: string;
  refresh_token?: string;
}

export const authService = {
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password
        }),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        const token = result.data?.access_token;
        if (token) {
          localStorage.setItem('auth_token', token);
          localStorage.setItem('refresh_token', result.data.refresh_token);
        }
        if (data.rememberMe) {
          localStorage.setItem('remember_email', data.email);
        }
      }
      
      return {
        success: result.success,
        message: result.error?.message || (result.success ? 'Login successful' : 'Login failed'),
        access_token: result.data?.access_token,
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Unable to connect to server. Please try again.',
      };
    }
  },

  async signup(data: SignupData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          full_name: data.name,
        }),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        const token = result.data?.access_token;
        if (token) {
          localStorage.setItem('auth_token', token);
          localStorage.setItem('refresh_token', result.data.refresh_token);
        }
      }
      
      return {
        success: result.success,
        message: result.error?.message || (result.success ? 'Registration successful' : 'Registration failed'),
        access_token: result.data?.access_token,
      };
    } catch (error) {
      console.error('Signup error:', error);
      return {
        success: false,
        message: 'Unable to connect to server. Please try again.',
      };
    }
  },

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('user_id');
    localStorage.removeItem('remember_email');
    localStorage.removeItem('onboarding_completed');
  },

  getStoredEmail(): string {
    return localStorage.getItem('remember_email') || '';
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  },

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }
};