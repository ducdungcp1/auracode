import axios, { AxiosInstance, AxiosError } from 'axios';
import { User, Problem, RegistrationData } from '../types';

// API Base URL - use Vite's built-in proxy for /api requests
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance
const api: AxiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 seconds
});

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest: any = error.config;

        // If 401 and haven't retried yet, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    throw new Error('No refresh token');
                }

                const response = await axios.post(`${API_URL}/api/auth/refresh`, {
                    refreshToken,
                });

                const { accessToken, refreshToken: newRefreshToken } = response.data.tokens;

                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', newRefreshToken);

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed - clear tokens and redirect to login
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// ========================================
// Authentication APIs
// ========================================

export interface LoginResponse {
    message: string;
    tokens: {
        accessToken: string;
        refreshToken: string;
    };
    user: User;
}

export interface RegisterResponse {
    message: string;
    userId: string;
}

export interface OTPResponse {
    message: string;
    identifier: string;
}

export interface VerifyOTPResponse {
    message: string;
    tokens: {
        accessToken: string;
        refreshToken: string;
    };
    user: User;
}

/**
 * Register a new user
 */
export const register = async (data: RegistrationData): Promise<RegisterResponse> => {
    const response = await api.post('/api/auth/register', {
        username: data.username,
        email: data.email,
        password: data.password,
        fullName: `${data.surname} ${data.givenName}`.trim(),
        phone: data.phone,
        studentId: data.id,
        dob: data.dob,
    });
    return response.data;
};

/**
 * Login with username and password
 */
export const login = async (username: string, password: string): Promise<LoginResponse> => {
    const response = await api.post('/api/auth/login', {
        username,
        password,
    });
    return response.data;
};

/**
 * Send OTP via email
 */
export const sendOTPEmail = async (email: string): Promise<OTPResponse> => {
    const response = await api.post('/api/auth/send-otp-email', { email });
    return response.data;
};

/**
 * Send OTP via SMS
 */
export const sendOTPSMS = async (phone: string): Promise<OTPResponse> => {
    const response = await api.post('/api/auth/send-otp-sms', { phone });
    return response.data;
};

/**
 * Verify OTP code
 */
export const verifyOTP = async (
    identifier: string,
    otp: string,
    type: 'email' | 'sms'
): Promise<VerifyOTPResponse> => {
    const response = await api.post('/api/auth/verify-otp', {
        identifier,
        otp,
        type,
    });
    return response.data;
};

/**
 * Refresh access token
 */
export const refreshToken = async (refreshToken: string) => {
    const response = await api.post('/api/auth/refresh', { refreshToken });
    return response.data;
};

/**
 * Logout
 */
export const logout = async (): Promise<void> => {
    await api.post('/api/auth/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
};

// ========================================
// Problem APIs
// ========================================

export interface GetProblemsParams {
    difficulty?: string;
    tags?: string[];
    search?: string;
    page?: number;
    limit?: number;
}

export interface ProblemListResponse {
    problems: Problem[];
    total: number;
    page: number;
    pages: number;
}

/**
 * Get all problems with optional filters
 */
export const getProblems = async (params?: GetProblemsParams): Promise<ProblemListResponse> => {
    const response = await api.get('/api/problems', { params });
    return response.data;
};

/**
 * Get a single problem by ID
 */
export const getProblem = async (id: string): Promise<Problem> => {
    const response = await api.get(`/api/problems/${id}`);
    return response.data.problem;
};

/**
 * Create a new problem (Teacher+)
 */
export const createProblem = async (problem: Partial<Problem>): Promise<Problem> => {
    const response = await api.post('/api/problems', problem);
    return response.data.problem;
};

/**
 * Update a problem (Teacher+)
 */
export const updateProblem = async (id: string, problem: Partial<Problem>): Promise<Problem> => {
    const response = await api.put(`/api/problems/${id}`, problem);
    return response.data.problem;
};

/**
 * Delete a problem (Admin only)
 */
export const deleteProblem = async (id: string): Promise<void> => {
    await api.delete(`/api/problems/${id}`);
};

// ========================================
// Judge APIs
// ========================================

export interface SubmitCodeRequest {
    problemId: string;
    code: string;
    language: string;
}

export interface Submission {
    _id: string;
    userId: string;
    problemId: string;
    code: string;
    language: string;
    status: 'Pending' | 'Judging' | 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Memory Limit Exceeded' | 'Runtime Error' | 'Compilation Error';
    verdict?: string;
    testsPassed: number;
    totalTests: number;
    runtime?: number;
    memory?: number;
    createdAt: string;
    updatedAt: string;
}

export interface SubmitCodeResponse {
    message: string;
    submission: Submission;
}

/**
 * Submit code for judging
 */
export const submitCode = async (data: SubmitCodeRequest): Promise<SubmitCodeResponse> => {
    const response = await api.post('/api/judge/submit', data);
    return response.data;
};

/**
 * Get submission status
 */
export const getSubmission = async (id: string): Promise<Submission> => {
    const response = await api.get(`/api/judge/submission/${id}`);
    return response.data.submission;
};

/**
 * Get user's submission history
 */
export const getSubmissions = async (userId?: string): Promise<Submission[]> => {
    const params = userId ? { userId } : {};
    const response = await api.get('/api/judge/submissions', { params });
    return response.data.submissions;
};

// ========================================
// User APIs (TODO: Implement on backend)
// ========================================

/**
 * Get all users (Admin only)
 */
export const getUsers = async (): Promise<User[]> => {
    const response = await api.get('/api/users');
    return response.data.users;
};

/**
 * Get user profile
 */
export const getUser = async (id: string): Promise<User> => {
    const response = await api.get(`/api/users/${id}`);
    return response.data.user;
};

/**
 * Update user profile
 */
export const updateUser = async (id: string, data: Partial<User>): Promise<User> => {
    const response = await api.put(`/api/users/${id}`, data);
    return response.data.user;
};

/**
 * Delete user (Admin only)
 */
export const deleteUser = async (id: string): Promise<void> => {
    await api.delete(`/api/users/${id}`);
};

// ========================================
// Helper function for error messages
// ========================================

export const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message || error.message;
    }
    return 'An unexpected error occurred';
};

export default api;
