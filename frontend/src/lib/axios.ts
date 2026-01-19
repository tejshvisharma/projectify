// /lib/axios.ts

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/auth.store";

// Main API client WITH interceptors (for protected routes)
export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// Minimal client WITHOUT interceptors (for auth hydration only)
export const authHydrationClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// Attach interceptor ONLY to apiClient
let isRefreshing = false;
let failedQueue: {
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}[] = [];

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

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };

        if (!error.response || error.response.status !== 401) {
            return Promise.reject(error);
        }

        // Prevent retrying refresh endpoint itself
        if (originalRequest.url?.includes('/auth/refresh-token')) {
            useAuthStore.getState().clearUser();
            // Optional: redirect in a microtask to avoid blocking
            setTimeout(() => {
                window.location.href = '/login';
            }, 0);
            return Promise.reject(error);
        }

        if (originalRequest._retry) {
            useAuthStore.getState().clearUser();
            setTimeout(() => {
                window.location.href = '/login';
            }, 0);
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
            await apiClient.post("/auth/refresh-token");
            processQueue(null, true);
            return apiClient(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError, false);
            useAuthStore.getState().clearUser();
            setTimeout(() => {
                window.location.href = '/login';
            }, 0);
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);