import { apiClient as api } from "../../lib/axios";
import { useQuery } from "@tanstack/react-query";
import {
    CreateProjectPayload,
    UpdateProjectPayload,
    Project,
    ProjectsListResponse,
    ApiResponse,
} from "./types";

export const projectsApi = {
    createProject: async (payload: CreateProjectPayload): Promise<Project> => {
        const res = await api.post("/projects", payload);
        return res.data.data;
    },

    getProjects: async (
        page = 1,
        limit = 10
    ): Promise<ProjectsListResponse> => {
        const res = await api.get("/projects", { params: { page, limit } });
        return res.data.data;
    },

    updateProject: async (
        projectId: string,
        payload: UpdateProjectPayload
    ): Promise<Project> => {
        const res = await api.patch(`/projects/${projectId}`, payload);
        return res.data.data;
    },

    deleteProject: (projectId: string) =>
        api.delete(`/projects/${projectId}`),
};



export const useGetProjectsQuery = (page: number, limit: number) => {
    return useQuery({
        queryKey: ['projects', { page, limit }],
        queryFn: async (): Promise<ProjectsListResponse> => {
            const response = await api.get<ApiResponse<ProjectsListResponse>>(
                `/projects?page=${page}&limit=${limit}`
            );
            return response.data.data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
    });
};