import { apiClient as api } from "../../lib/axios";
import {
    CreateProjectPayload,
    UpdateProjectPayload,
    Project,
    ProjectsResponse,
} from "./types";

export const projectsApi = {
    createProject: async (payload: CreateProjectPayload): Promise<Project> => {
        const res = await api.post("/projects", payload);
        return res.data.data;
    },

    getProjects: async (
        page = 1,
        limit = 10
    ): Promise<ProjectsResponse> => {
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
