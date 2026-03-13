import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import type { ApiResponse } from '@/features/projects/types';
import type {
    Comment,
    CreateCommentPayload,
} from './types';

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const commentKeys = {
    all: ['comments'] as const,
    list: (projectId: string, taskId: string) =>
        [...commentKeys.all, projectId, taskId] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useGetCommentsQuery(projectId: string, taskId: string) {
    return useQuery({
        queryKey: commentKeys.list(projectId, taskId),
        queryFn: async () => {
            const response = await apiClient.get<ApiResponse<Comment[]>>(
                `/comments/${projectId}/tasks/${taskId}`
            );
            return response.data.data;
        },
        enabled: !!projectId && !!taskId,
    });
}

export function useCreateCommentMutation(projectId: string, taskId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: CreateCommentPayload) => {
            const response = await apiClient.post<ApiResponse<Comment>>(
                `/comments/${projectId}/tasks/${taskId}`,
                payload
            );
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: commentKeys.list(projectId, taskId),
            });
        },
    });
}

export function useUpdateCommentMutation(projectId: string, taskId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            commentId,
            content,
        }: {
            commentId: string;
            content: string;
        }) => {
            const response = await apiClient.patch<ApiResponse<Comment>>(
                `/comments/${projectId}/edit/${commentId}`,
                { content }
            );
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: commentKeys.list(projectId, taskId),
            });
        },
    });
}

export function useDeleteCommentMutation(projectId: string, taskId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (commentId: string) => {
            await apiClient.delete(
                `/comments/${projectId}/edit/${commentId}`
            );
            return commentId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: commentKeys.list(projectId, taskId),
            });
        },
    });
}