import { useMutation, useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/axios';
import { useAuthStore } from '@/stores/auth.store';

// Types
interface LoginCredentials {
    email: string;
    password: string;
}

interface RegisterData {
    username: string;
    email: string;
    password: string;
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
    const setUser = useAuthStore((state) => state.setUser);

    return useMutation({
        mutationFn: register,
        onSuccess: (data) => {
            setUser(data.data.user);
        },
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
