import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import type { ApiResponse } from '@/features/projects/types';
import type { Note, CreateNotePayload } from './types';

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const noteKeys = {
    all: ['notes'] as const,
    list: (projectId: string) =>
        [...noteKeys.all, projectId] as const,
    mentions: (projectId: string) =>
        [...noteKeys.list(projectId), 'mentions'] as const,
};

// ─── Fetch all notes ──────────────────────────────────────────────────────────
export function useGetNotesQuery(projectId: string) {
    return useQuery({
        queryKey: noteKeys.list(projectId),
        queryFn: async () => {
            const response = await apiClient.get<ApiResponse<Note[]>>(
                `/projects/${projectId}/notes`
            );
            return response.data.data;
        },
        enabled: !!projectId,
    });
}

// ─── Fetch notes where current user is mentioned ──────────────────────────────
export function useGetMyMentionsQuery(projectId: string) {
    return useQuery({
        queryKey: noteKeys.mentions(projectId),
        queryFn: async () => {
            const response = await apiClient.get<ApiResponse<Note[]>>(
                `/projects/${projectId}/notes/mentions/me`
            );
            return response.data.data;
        },
        enabled: !!projectId,
    });
}

// ─── Create note ──────────────────────────────────────────────────────────────
export function useCreateNoteMutation(projectId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: CreateNotePayload) => {
            const response = await apiClient.post<ApiResponse<Note>>(
                `/projects/${projectId}/notes`,
                payload
            );
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: noteKeys.list(projectId),
            });
        },
    });
}

// ─── Update note ──────────────────────────────────────────────────────────────
export function useUpdateNoteMutation(projectId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            noteId,
            content,
        }: {
            noteId: string;
            content: string;
        }) => {
            const response = await apiClient.patch<ApiResponse<Note>>(
                `/projects/${projectId}/notes/${noteId}`,
                { content }
            );
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: noteKeys.list(projectId),
            });
        },
    });
}

// ─── Delete note ──────────────────────────────────────────────────────────────
export function useDeleteNoteMutation(projectId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (noteId: string) => {
            await apiClient.delete(`/projects/${projectId}/notes/${noteId}`);
            return noteId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: noteKeys.list(projectId),
            });
        },
    });
}