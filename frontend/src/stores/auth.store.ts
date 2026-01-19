import { create } from 'zustand';
import { authHydrationClient } from '@/lib/axios';

export interface User {
    id: string;
    username: string;
    email: string;
    role: string;
}

export interface UserProfile {
    _id: string;
    username: string;
    email: string;
    fullName: string;
    role: string;
    avatar?: {
        url: string;
        localPath?: string;
    };
    isEmailVerified: boolean;
    createdAt: string;
    updatedAt: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setUser: (user: User) => void;
    clearUser: () => void;
    checkAuth: () => Promise<void>;
}

/**
 * Zustand store for authentication state management
 * - Uses HTTP-only cookies for authentication (no tokens in localStorage)
 * - checkAuth() should be called on app startup to restore auth state from backend session
 */
export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true, // Start as loading until checkAuth completes

    setUser: (user: User) => {
        set({
            user,
            isAuthenticated: true,
            isLoading: false,
        });
    },

    clearUser: () => {
        set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
        });
    },

    checkAuth: async () => {
        try {
            // Call backend to verify auth status via HTTP-only cookie
            const response = await authHydrationClient.get('/auth/profile');
            const user = response.data.data.user;

            set({
                user,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (error) {
            // If check fails (401 or network error), user is not authenticated
            set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
            });
        }
    },
}));
