import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import type {
    ApiResponse,
    Project,
    ProjectsListResponse,
    ProjectMember,
    Task,
    CreateTaskPayload,
    UpdateTaskPayload,
    ProjectsMeta,
} from './types';

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const projectKeys = {
    all: ['projects'] as const,
    lists: () => [...projectKeys.all, 'list'] as const,
    list: (page: number, limit: number) =>
        [...projectKeys.lists(), { page, limit }] as const,
    details: () => [...projectKeys.all, 'detail'] as const,
    detail: (id: string) => [...projectKeys.details(), id] as const,
    members: (id: string) => [...projectKeys.detail(id), 'members'] as const,
    tasks: (id: string) => [...projectKeys.detail(id), 'tasks'] as const,
};

export function useGetProjectsQuery(page: number, limit: number) {
    return useQuery({
        queryKey: projectKeys.list(page, limit),
        queryFn: async () => {
            const response = await apiClient.get
            <ApiResponse < ProjectsListResponse >>
       (`/projects?page=${page}&limit=${limit}`);
            return response.data.data;
        },
    });
}

// Fetch single project by ID
export function useGetProjectQuery(projectId: string) {
    return useQuery({
        queryKey: projectKeys.detail(projectId),
        queryFn: async () => {
            const response = await apiClient.get<ApiResponse<Project>>(
                `/projects/${projectId}`
            );
            return response.data.data;
        },
        enabled: !!projectId, // Don't run if projectId is empty
    });
}

// Fetch project members
export function useGetProjectMembersQuery(projectId: string) {
    return useQuery({
        queryKey: projectKeys.members(projectId),
        queryFn: async () => {
            const response = await apiClient.get<ApiResponse<ProjectMember[]>>(
                `/projects/${projectId}/members`
            );
            return response.data.data;
        },
        enabled: !!projectId,
    });
}

// Fetch project tasks (all, unpaginated for Kanban — or paginated for list view)
export function useGetProjectTasksQuery(projectId: string) {
    return useQuery({
        queryKey: projectKeys.tasks(projectId),
        queryFn: async () => {
            // Fetch up to 100 tasks (max allowed) for the Kanban board
            const response = await apiClient.get
                <ApiResponse<{ tasks: Task[]; meta: ProjectsMeta } >
      > (`/projects/${projectId}/tasks?limit=100`);
            return response.data.data.tasks;
        },
        enabled: !!projectId,
    });
}

// Create task mutation
export function useCreateTaskMutation(projectId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: CreateTaskPayload) => {
            // Tasks use multipart/form-data per the API docs
            const formData = new FormData();
            Object.entries(payload).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formData.append(key, String(value));
                }
            });

            const response = await apiClient.post<ApiResponse<Task>>(
                `/projects/${projectId}/tasks`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            return response.data.data;
        },
        onSuccess: () => {
            // Invalidate tasks cache → React Query auto-refetches
            queryClient.invalidateQueries({ queryKey: projectKeys.tasks(projectId) });
        },
    });
}

// Update task mutation
export function useUpdateTaskMutation(projectId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            taskId,
            payload,
        }: {
            taskId: string;
            payload: UpdateTaskPayload;
        }) => {
            const formData = new FormData();
            Object.entries(payload).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formData.append(key, String(value));
                }
            });

            const response = await apiClient.patch<ApiResponse<Task>>(
                `/projects/${projectId}/tasks/${taskId}`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: projectKeys.tasks(projectId) });
        },
    });
}

// Delete task mutation
export function useDeleteTaskMutation(projectId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (taskId: string) => {
            await apiClient.delete(`/projects/${projectId}/tasks/${taskId}`);
            return taskId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: projectKeys.tasks(projectId) });
        },
    });
}