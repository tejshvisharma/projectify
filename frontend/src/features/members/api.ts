import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { projectKeys } from '@/features/projects/api';
import type { ApiResponse } from '@/features/projects/types';
import type {
    ProjectMember,
    AddMemberPayload,
    SearchUsersResponse,
    UpdateMemberRolePayload,
} from './types';

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const memberKeys = {
    all: ['members'] as const,
    list: (projectId: string) =>
        [...memberKeys.all, projectId] as const,
    search: (query: string, page: number, limit: number) =>
        [...memberKeys.all, 'search-users', query, { page, limit }] as const,
};

interface SearchUsersParams {
    query: string;
    page?: number;
    limit?: number;
    signal?: AbortSignal;
}

interface UseSearchUsersQueryParams {
    query: string;
    page: number;
    limit?: number;
    enabled?: boolean;
}

export async function searchUsers({
    query,
    page = 1,
    limit = 10,
    signal,
}: SearchUsersParams) {
    const response = await apiClient.get<ApiResponse<SearchUsersResponse>>(
        `/users/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
        { signal }
    );

    return response.data.data;
}

export async function addProjectMember(
    projectId: string,
    payload: AddMemberPayload,
) {
    const response = await apiClient.post<ApiResponse<ProjectMember>>(
        `/projects/${projectId}/members`,
        payload
    );

    return response.data.data;
}

export function useSearchUsersQuery({
    query,
    page,
    limit = 10,
    enabled = true,
}: UseSearchUsersQueryParams) {
    const normalizedQuery = query.trim();

    return useQuery({
        queryKey: memberKeys.search(normalizedQuery, page, limit),
        queryFn: ({ signal }) =>
            searchUsers({ query: normalizedQuery, page, limit, signal }),
        enabled: enabled && normalizedQuery.length > 0,
        staleTime: 1000 * 60,
        placeholderData: keepPreviousData,
    });
}

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
        mutationFn: (payload: AddMemberPayload) =>
            addProjectMember(projectId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: memberKeys.list(projectId),
            });
            queryClient.invalidateQueries({
                queryKey: projectKeys.members(projectId),
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
