import axios from 'axios';
import { useAuthStore } from '@/stores/auth.store';

// Create axios instance with base configuration
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true, // Enable sending cookies for JWT auth
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor to handle 401 errors globally
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 Unauthorized errors
        if (error.response?.status === 401) {
            // Clear auth state
            useAuthStore.getState().clearUser();

            // Only redirect if not already on login/register page
            const currentPath = window.location.pathname;
            if (!currentPath.startsWith('/login') && !currentPath.startsWith('/register')) {
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
