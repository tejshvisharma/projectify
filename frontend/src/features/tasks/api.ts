import api from "../../lib/axios";
import { TasksResponse, Task } from "./types";

export const tasksApi = {
    getTasks: async (
        projectId: string,
        page = 1,
        limit = 10
    ): Promise<TasksResponse> => {
        const res = await api.get(`/projects/${projectId}/tasks`, {
            params: { page, limit },
        });
        return res.data.data;
    },

    createTask: async (projectId: string, formData: FormData): Promise<Task> => {
        const res = await api.post(
            `/projects/${projectId}/tasks`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
        );
        return res.data.data;
    },

    updateTask: async (
        projectId: string,
        taskId: string,
        formData: FormData
    ): Promise<Task> => {
        const res = await api.patch(
            `/projects/${projectId}/tasks/${taskId}`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
        );
        return res.data.data;
    },

    deleteTask: (projectId: string, taskId: string) =>
        api.delete(`/projects/${projectId}/tasks/${taskId}`),
};
