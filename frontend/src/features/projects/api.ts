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
    SubTask,
    CreateSubTaskPayload,
    CreateProjectPayload,
    ProjectLeaderboardResponse,
    GlobalLeaderboardResponse,
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
    leaderboard: (id: string, page: number, limit: number) =>
        [...projectKeys.detail(id), 'leaderboard', { page, limit }] as const,
    globalLeaderboard: (page: number, limit: number) =>
        [...projectKeys.all, 'global-leaderboard', { page, limit }] as const,
    subtasks: (projectId: string, taskId: string) =>
        [...projectKeys.detail(projectId), 'tasks', taskId, 'subtasks'] as const,
};

export function useGetProjectsQuery(page: number, limit: number) {
    return useQuery({
        queryKey: projectKeys.list(page, limit),
        queryFn: async () => {
            const response = await apiClient.get
                <ApiResponse<ProjectsListResponse>>
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
// Create Project Mutation
export function useCreateProjectMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: CreateProjectPayload) => {
            const response = await apiClient.post<ApiResponse<Project>>(
                '/projects',
                payload
            );
            return response.data.data;
        },
        onSuccess: () => {
            // Invalidate all project lists so ProjectsListPage refetches
            queryClient.invalidateQueries({
                queryKey: projectKeys.lists(),
            });
        },
    });
}

// Update Project mutation 

export function useUpdateProjectMutation(projectId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: Partial<CreateProjectPayload>) => {
            const response = await apiClient.patch<ApiResponse<Project>>(
                `/projects/${projectId}`,
                payload
            );
            return response.data.data;
        },
        onSuccess: (updatedProject) => {
            // Update the specific project in cache
            queryClient.setQueryData(
                projectKeys.detail(projectId),
                updatedProject
            );
            // Also invalidate lists so ProjectsListPage reflects changes
            queryClient.invalidateQueries({
                queryKey: projectKeys.lists(),
            });
        },
    });
}

// Delete Projects Mutations
export function useDeleteProjectMutation(projectId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            await apiClient.delete(`/projects/${projectId}`);
        },
        onSuccess: () => {
            // Remove from all project list caches
            queryClient.invalidateQueries({
                queryKey: projectKeys.lists(),
            });
            // Remove the specific project from cache
            queryClient.removeQueries({
                queryKey: projectKeys.detail(projectId),
            });
        },
    });
}

// Fetch project tasks (all, unpaginated for Kanban — or paginated for list view)
export function useGetProjectTasksQuery(projectId: string) {
    return useQuery({
        queryKey: projectKeys.tasks(projectId),
        queryFn: async () => {
            // Fetch up to 100 tasks (max allowed) for the Kanban board
            const response = await apiClient.get
                <ApiResponse<{ tasks: Task[]; meta: ProjectsMeta }>
                >(`/projects/${projectId}/tasks?limit=100`);
            return response.data.data.tasks;
        },
        enabled: !!projectId,
    });
}

export function useGetProjectLeaderboardQuery(
    projectId: string,
    page: number,
    limit: number,
) {
    return useQuery({
        queryKey: projectKeys.leaderboard(projectId, page, limit),
        queryFn: async () => {
            const response = await apiClient.get<ApiResponse<ProjectLeaderboardResponse>>(
                `/projects/${projectId}/leaderboard?page=${page}&limit=${limit}`
            );
            return response.data.data;
        },
        enabled: !!projectId,
    });
}

export function useGetGlobalLeaderboardQuery(page: number, limit: number) {
    return useQuery({
        queryKey: projectKeys.globalLeaderboard(page, limit),
        queryFn: async () => {
            const response = await apiClient.get<ApiResponse<GlobalLeaderboardResponse>>(
                `/leaderboard/global?page=${page}&limit=${limit}`
            );
            return response.data.data;
        },
    });
}

export function useTaskFromCache(projectId: string, taskId: string) {
    return useQuery({
        queryKey: projectKeys.tasks(projectId),
        queryFn: async () => {
            // Same queryFn as useGetProjectTasksQuery
            // React Query will NOT re-fetch if cache is still fresh
            const response = await apiClient.get
                <ApiResponse<{ tasks: Task[]; meta: unknown }>
                >(`/projects/${projectId}/tasks?limit=100`);
            return response.data.data.tasks;
        },
        // select picks just the one task we need from the full array
        select: (tasks: Task[]) => tasks.find((t) => t._id === taskId),
        enabled: !!projectId && !!taskId,
        // Don't refetch just because modal opened
        staleTime: 1000 * 60, // treat cache as fresh for 60 seconds
    });
}

// Create task mutation
export function useCreateTaskMutation(projectId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: CreateTaskPayload) => {
            const formData = new FormData();

            // Append each field only if it has a value
            formData.append('title', payload.title);
            formData.append('description', payload.description ?? '');
            formData.append('assignedTo', payload.assignedTo);

            if (payload.status) formData.append('status', payload.status);
            if (payload.priority) formData.append('priority', payload.priority);
            if (payload.difficulty) formData.append('difficulty', payload.difficulty);
            if (payload.dueDate) formData.append('dueDate', payload.dueDate);

            // Credits must be a string for FormData
            formData.append('credits', String(payload.credits ?? 0));

            const response = await apiClient.post<ApiResponse<Task>>(
                `/projects/${projectId}/tasks`,
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
        onError: (error: any) => {
            console.log('Create task error:', error.response?.data);
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

        // ── Optimistic update ────────────────────────────────────────────────────
        onMutate: async ({ taskId, payload }) => {
            // Step 1: Cancel any in-flight refetches
            // Prevents them from overwriting our optimistic update
            await queryClient.cancelQueries({
                queryKey: projectKeys.tasks(projectId),
            });

            // Step 2: Snapshot current cache value
            // We need this to roll back if server fails
            const previousTasks = queryClient.getQueryData<Task[]>(
                projectKeys.tasks(projectId)
            );

            // Step 3: Optimistically update the cache RIGHT NOW
            queryClient.setQueryData<Task[]>(
                projectKeys.tasks(projectId),
                (oldTasks) =>
                    oldTasks?.map((task) => {
                        if (task._id !== taskId) return task;
                        const { assignedTo, removeFiles, ...safePayload } = payload;
                        return {
                            ...task,
                            ...safePayload, // ← only safe fields that match Task type
                        } as Task;        // ← explicit cast tells TypeScript "trust us"
                    }) ?? []
            );
            // Step 4: Return snapshot so onError can roll back
            return { previousTasks };
        },

        // ── Rollback on failure ──────────────────────────────────────────────────
        onError: (error, variables, context) => {
            // Server rejected — restore previous state
            if (context?.previousTasks) {
                queryClient.setQueryData(
                    projectKeys.tasks(projectId),
                    context.previousTasks
                );
            }
            console.error('Task update failed, rolled back:', error);
        },

        // ── Confirm with server data on success ──────────────────────────────────
        onSettled: () => {
            // Always sync with server after mutation settles
            // Ensures our optimistic update matches server reality
            queryClient.invalidateQueries({
                queryKey: projectKeys.tasks(projectId),
            });
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

// Fetch subtasks for a specific task
export function useGetSubTasksQuery(projectId: string, taskId: string) {
    return useQuery({
        queryKey: projectKeys.subtasks(projectId, taskId),
        queryFn: async () => {
            const response = await apiClient.get
                <ApiResponse<{ items: SubTask[]; meta: ProjectsMeta }>>
                (`/subtasks/${projectId}/tasks/${taskId}?limit=100`);
            return response.data.data.items;
        },
        enabled: !!projectId && !!taskId, // only run when both IDs exist
    });
}

// Create a new subtask
export function useCreateSubTaskMutation(projectId: string, taskId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: CreateSubTaskPayload) => {
            const response = await apiClient.post<ApiResponse<SubTask>>(
                `/subtasks/${projectId}/tasks/${taskId}`,
                payload
            );
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: projectKeys.subtasks(projectId, taskId),
            });
        },
    });
}

// Toggle subtask complete/incomplete
export function useUpdateSubTaskMutation(projectId: string, taskId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            subTaskId,
            title,
            isCompleted,
        }: {
            subTaskId: string;
            title: string;
            isCompleted: boolean;
        }) => {
            const response = await apiClient.patch<ApiResponse<SubTask>>(
                `/subtasks/${projectId}/${subTaskId}`,
                { title, isCompleted }
            );
            return response.data.data;
        },

        // ── Optimistic update ────────────────────────────────────────────────────
        onMutate: async ({ subTaskId, isCompleted, title }) => {
            await queryClient.cancelQueries({
                queryKey: projectKeys.subtasks(projectId, taskId),
            });

            const previousSubTasks = queryClient.getQueryData<SubTask[]>(
                projectKeys.subtasks(projectId, taskId)
            );

            // Flip the checkbox immediately
            queryClient.setQueryData<SubTask[]>(
                projectKeys.subtasks(projectId, taskId),
                (old) =>
                    old?.map((st) =>
                        st._id === subTaskId
                            ? { ...st, isCompleted, title }
                            : st
                    ) ?? []
            );

            return { previousSubTasks };
        },

        onError: (error, variables, context) => {
            if (context?.previousSubTasks) {
                queryClient.setQueryData(
                    projectKeys.subtasks(projectId, taskId),
                    context.previousSubTasks
                );
            }
        },

        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: projectKeys.subtasks(projectId, taskId),
            });
        },
    });
}

// Delete a subtask
export function useDeleteSubTaskMutation(projectId: string, taskId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (subTaskId: string) => {
            await apiClient.delete(`/subtasks/${projectId}/${subTaskId}`);
            return subTaskId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: projectKeys.subtasks(projectId, taskId),
            });
        },
    });
}