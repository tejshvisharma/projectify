import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
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

    forgotPassword: async (email: string) => {
        try {
            const res = await apiClient.post("/auth/forgot-password", { email });
            if (res.data && res.data.success === false) {
                // Simulate axios error for consistent error handling
                const err: any = new Error(res.data.message || 'Failed to send reset link.');
                err.response = { data: res.data };
                throw err;
            }
            return res;
        } catch (err: any) {
            // If axios error, just throw
            throw err;
        }
    },

    resetPassword: (token: string, newPassword: string) =>
        apiClient.post(`/auth/reset-password?token=${token}`, { newPassword }),
};

interface ApiResponse<T> {
    statuscode: number;
    success: boolean;
    message: string;
    data: T;
}

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const authKeys = {
    profile: ['auth', 'profile'] as const,
};

// ─── Fetch fresh profile ──────────────────────────────────────────────────────
export function useProfileQuery() {
    return useQuery({
        queryKey: authKeys.profile,
        queryFn: async () => {
            const response = await apiClient.get<ApiResponse<UserProfile>>(
                '/auth/profile'
            );
            return response.data.data;
        },
    });
}

// ─── Update profile (fullName + username) ────────────────────────────────────
export function useUpdateProfileMutation() {
    const queryClient = useQueryClient();
    const setUser = useAuthStore((s) => s.setUser);

    return useMutation({
        mutationFn: async (payload: {
            fullName?: string;
            username?: string;
        }) => {
            const response = await apiClient.patch<ApiResponse<UserProfile>>(
                '/auth/update-profile',
                payload
            );
            return response.data.data;
        },
        onSuccess: (updatedUser) => {
            // Update React Query cache
            queryClient.setQueryData(authKeys.profile, updatedUser);
            
            setUser(updatedUser);
        },
    });
}

// ─── Update avatar ────────────────────────────────────────────────────────────
export function useUpdateAvatarMutation() {
    const queryClient = useQueryClient();
    const setUser = useAuthStore((s) => s.setUser);

    return useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append('avatar', file);

            const response = await apiClient.patch<ApiResponse<UserProfile>>(
                '/auth/update-avatar',
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            return response.data.data;
        },
        onSuccess: (updatedUser) => {
            queryClient.setQueryData(authKeys.profile, updatedUser);
            setUser(updatedUser);
        },
    });
}

// ─── Change password ──────────────────────────────────────────────────────────
export function useChangePasswordMutation() {
    return useMutation({
        mutationFn: async (payload: {
            oldPassword: string;
            newPassword: string;
        }) => {
            const response = await apiClient.post<ApiResponse<null>>(
                '/auth/change-password',
                payload
            );
            return response.data;
        },
    });
}