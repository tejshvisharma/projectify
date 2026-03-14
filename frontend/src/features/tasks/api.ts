import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { projectKeys } from '@/features/projects/api';
import type { ApiResponse } from '@/features/projects/types';
import type { Task } from './types';

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