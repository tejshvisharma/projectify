import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/auth.store";

/**
 * Create Axios instance
 */
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true, // cookies (accessToken, refreshToken)
    headers: {
        "Content-Type": "application/json",
    },
});

/**
 * Flag to prevent multiple refresh calls at once
 */
let isRefreshing = false;

/**
 * Queue for failed requests while token is refreshing
 */
let failedQueue: {
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}[] = [];

/**
 * Process queued requests after refresh
 */
const processQueue = (error: unknown, tokenRefreshed = false) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(tokenRefreshed);
        }
    });

    failedQueue = [];
};

/**
 * Response interceptor
 */
apiClient.interceptors.response.use(
    (response) => response,

    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };

        if (!error.response || error.response.status !== 401) {
            return Promise.reject(error);
        }

        const url = originalRequest.url ?? '';

        // 🚫 SKIP refresh logic for auth-related endpoints
        if (
            url.includes('/auth/profile') ||
            url.includes('/auth/login') ||
            url.includes('/auth/register') ||
            url.includes('/auth/refresh-token')
        ) {
            return Promise.reject(error);
        }

        if (originalRequest._retry) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({
                    resolve: () => resolve(apiClient(originalRequest)),
                    reject,
                });
            });
        }

        isRefreshing = true;

        try {
            await apiClient.post('/auth/refresh-token');
            processQueue(null);
            return apiClient(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError);
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);


export default apiClient;
