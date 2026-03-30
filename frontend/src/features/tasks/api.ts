import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { projectKeys } from '@/features/projects/api';
import type { ApiResponse } from '@/features/projects/types';
import type { Task, TaskStatus } from './types';

export interface SubmitTaskPayload {
    comment: string;
    attachments?: File[];
}

export interface VerifyTaskPayload {
    action: 'approve' | 'reject';
    reason?: string;
}

export async function submitTask(
    projectId: string,
    taskId: string,
    data: SubmitTaskPayload,
) {
    const formData = new FormData();
    formData.append('comment', data.comment);

    (data.attachments ?? []).forEach((file) => {
        formData.append('attachments', file);
    });

    const response = await apiClient.patch<ApiResponse<Task>>(
        `/projects/${projectId}/tasks/${taskId}/submit`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
    );

    return response.data.data;
}

export async function verifyTask(
    projectId: string,
    taskId: string,
    payload: VerifyTaskPayload,
) {
    const response = await apiClient.patch<ApiResponse<unknown>>(
        `/projects/${projectId}/tasks/${taskId}/verify`,
        payload,
    );

    return response.data.data;
}

export async function updateTaskStatus(
    projectId: string,
    taskId: string,
    status: TaskStatus,
) {
    const formData = new FormData();
    formData.append('status', status);

    const response = await apiClient.patch<ApiResponse<Task>>(
        `/projects/${projectId}/tasks/${taskId}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
    );

    return response.data.data;
}

export function useSubmitTaskMutation(projectId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ taskId, data }: { taskId: string; data: SubmitTaskPayload }) =>
            submitTask(projectId, taskId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: projectKeys.tasks(projectId) });
        },
    });
}

export function useVerifyTaskMutation(projectId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ taskId, payload }: { taskId: string; payload: VerifyTaskPayload }) =>
            verifyTask(projectId, taskId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: projectKeys.tasks(projectId) });
        },
    });
}

export function useUpdateTaskStatusMutation(projectId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
            updateTaskStatus(projectId, taskId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: projectKeys.tasks(projectId) });
        },
    });
}

// Add attachment(s) to a task
export function useAddAttachmentMutation(projectId: string, taskId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (files: File[]) => {
            // Attachments require multipart/form-data
            const formData = new FormData();
            files.forEach((file) => {
                formData.append('attachments', file);
            });

            const response = await apiClient.patch<ApiResponse<Task>>(
                `/projects/${projectId}/tasks/${taskId}`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            return response.data.data;
        },
        onSuccess: () => {
            // Invalidate tasks cache so the board + modal both refresh
            queryClient.invalidateQueries({
                queryKey: projectKeys.tasks(projectId),
            });
        },
    });
}

// Remove a single attachment by its public_id
export function useRemoveAttachmentMutation(projectId: string, taskId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (publicId: string) => {
            const formData = new FormData();
            // API expects removeFiles as JSON string array
            formData.append('removeFiles', JSON.stringify([publicId]));

            const response = await apiClient.patch<ApiResponse<Task>>(
                `/projects/${projectId}/tasks/${taskId}`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: projectKeys.tasks(projectId),
            });
        },
    });
}