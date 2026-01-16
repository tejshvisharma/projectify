import { useMutation, useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/axios';
import { useAuthStore } from '@/stores/auth.store';
import { LoginPayload, RegisterPayload, UserProfile } from "./types";
// Types
interface LoginCredentials {
    email: string;
    password: string;
}

interface RegisterData {
    username: string;
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
}

interface User {
    id: string;
    username: string;
    email: string;
    role: string;
}

interface AuthResponse {
    success: boolean;
    data: {
        user: User;
    };
    message: string;
}

// API functions
const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
};

const register = async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
};

const getProfile = async (): Promise<User> => {
    const response = await apiClient.get('/auth/profile');
    return response.data.data.user;
};

const logout = async (): Promise<void> => {
    await apiClient.post('/auth/logout');
};

// Hooks
export const useLoginMutation = () => {
    const setUser = useAuthStore((state) => state.setUser);

    return useMutation({
        mutationFn: login,
        onSuccess: (data) => {
            setUser(data.data.user);
        },
    });
};

export const useRegisterMutation = () => {
    return useMutation({
        mutationFn: register,
    });
};

export const useProfileQuery = () => {
    return useQuery({
        queryKey: ['profile'],
        queryFn: getProfile,
        enabled: false, // Only fetch when explicitly called
    });
};

export const useLogoutMutation = () => {
    const clearUser = useAuthStore((state) => state.clearUser);

    return useMutation({
        mutationFn: logout,
        onSuccess: () => {
            clearUser();
            window.location.href = '/login';
        },
    });
};

// for future use of implementations :
export const authApi = {
    register: (payload: RegisterPayload) =>
        apiClient.post("/auth/register", payload),

    verifyEmail: (token: string) =>
        apiClient.get(`/auth/verify-email?token=${token}`),

    resendVerification: (email: string) =>
        apiClient.post("/auth/resend-verification", { email }),

    login: (payload: LoginPayload) =>
        apiClient.post("/auth/login", payload),

    logout: () =>
        apiClient.post("/auth/logout"),

    refreshToken: () =>
        apiClient.post("/auth/refresh-token"),

    getProfile: async (): Promise<UserProfile> => {
        const res = await apiClient.get("/auth/profile");
        return res.data.data;
    },

    changePassword: (payload: { oldPassword: string; newPassword: string }) =>
        apiClient.post("/auth/change-password", payload),

    forgotPassword: (email: string) =>
        apiClient.post("/auth/forgot-password", { email }),

    resetPassword: (token: string, newPassword: string) =>
        apiClient.post(`/auth/reset-password?token=${token}`, { newPassword }),
};