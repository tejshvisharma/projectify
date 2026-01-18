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

        // If no response OR not 401 → just reject
        if (!error.response || error.response.status !== 401) {
            return Promise.reject(error);
        }

        // If request already retried → logout
        if (originalRequest._retry) {
            useAuthStore.getState().clearUser();
            return Promise.reject(error);
        }

        // Mark request as retried
        originalRequest._retry = true;

        // If refresh already in progress → queue request
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({
                    resolve: (tokenRefreshed) => {
                        // After refresh, retry the original request
                        resolve(apiClient(originalRequest));
                    },
                    reject,
                });
            });
        }

        isRefreshing = true;

        try {
            // 🔁 Call refresh token endpoint
            await apiClient.post("/auth/refresh-token");

            processQueue(null, true);
            // After refresh, retry the original request
            return apiClient(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError, false);

            // Refresh failed → logout user
            useAuthStore.getState().clearUser();
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    },
);

export default apiClient;
