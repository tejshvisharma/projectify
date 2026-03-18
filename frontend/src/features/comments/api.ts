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

        // ── Optimistic update ────────────────────────────────────────────────────
        onMutate: async (payload) => {
            await queryClient.cancelQueries({
                queryKey: commentKeys.list(projectId, taskId),
            });

            const previousComments = queryClient.getQueryData<Comment[]>(
                commentKeys.list(projectId, taskId)
            );

            // Build a temporary comment that looks real
            // It will be replaced by the server version on settle
            const optimisticComment: Comment = {
                _id: `temp-${Date.now()}`, // temporary ID
                content: payload.content,
                task: taskId,
                user: {
                    _id: 'temp',
                    username: '...', // will be replaced by real data
                    avatar: { url: '' },
                },
                attachments: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            queryClient.setQueryData<Comment[]>(
                commentKeys.list(projectId, taskId),
                (old) => [...(old ?? []), optimisticComment]
            );

            return { previousComments };
        },

        onError: (error, variables, context) => {
            if (context?.previousComments) {
                queryClient.setQueryData(
                    commentKeys.list(projectId, taskId),
                    context.previousComments
                );
            }
        },

        // Replace temp comment with real server data
        onSettled: () => {
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