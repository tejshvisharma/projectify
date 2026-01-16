import api from "../../lib/axios";

export const subTasksApi = {
    createSubTask: (projectId: string, taskId: string, payload: any) =>
        api.post(`/subtasks/${projectId}/tasks/${taskId}`, payload),

    getSubTasks: async (
        projectId: string,
        taskId: string,
        page = 1,
        limit = 10
    ) => {
        const res = await api.get(`/subtasks/${projectId}/tasks/${taskId}`, {
            params: { page, limit },
        });
        return res.data.data;
    },

    updateSubTask: (projectId: string, subTaskId: string, payload: any) =>
        api.patch(`/subtasks/${projectId}/${subTaskId}`, payload),

    deleteSubTask: (projectId: string, subTaskId: string) =>
        api.delete(`/subtasks/${projectId}/${subTaskId}`),
};
