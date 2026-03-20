import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { projectKeys } from '@/features/projects/api';
import type { ApiResponse } from '@/features/projects/types';
import type {
    ProjectMember,
    AddMemberPayload,
    UpdateMemberRolePayload,
} from './types';

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const memberKeys = {
    all: ['members'] as const,
    list: (projectId: string) =>
        [...memberKeys.all, projectId] as const,
};

// ─── Fetch members ────────────────────────────────────────────────────────────
export function useGetProjectMembersQuery(projectId: string) {
    return useQuery({
        queryKey: memberKeys.list(projectId),
        queryFn: async () => {
            const response = await apiClient.get<ApiResponse<ProjectMember[]>>(
                `/projects/${projectId}/members`
            );
            return response.data.data;
        },
        enabled: !!projectId,
    });
}

// ─── Add member ───────────────────────────────────────────────────────────────
export function useAddMemberMutation(projectId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: AddMemberPayload) => {
            const response = await apiClient.post<ApiResponse<ProjectMember>>(
                `/projects/${projectId}/members`,
                payload
            );
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: memberKeys.list(projectId),
            });
        },
    });
}

// ─── Update member role ───────────────────────────────────────────────────────
export function useUpdateMemberRoleMutation(projectId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            memberId,
            role,
        }: UpdateMemberRolePayload) => {
            const response = await apiClient.patch<ApiResponse<ProjectMember>>(
                `/projects/${projectId}/members/${memberId}`,
                { role }
            );
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: memberKeys.list(projectId),
            });
        },
    });
}

// ─── Remove member ────────────────────────────────────────────────────────────
export function useRemoveMemberMutation(projectId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (memberId: string) => {
            await apiClient.delete(
                `/projects/${projectId}/members/${memberId}`
            );
            return memberId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: memberKeys.list(projectId),
            });
        },
    });
}
