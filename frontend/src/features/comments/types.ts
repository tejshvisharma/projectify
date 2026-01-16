import api from "../../lib/axios";

export const commentsApi = {
    createComment: (projectId: string, taskId: string, payload: any) =>
        api.post(`/comments/${projectId}/tasks/${taskId}`, payload),

    getComments: async (projectId: string, taskId: string) => {
        const res = await api.get(`/comments/${projectId}/tasks/${taskId}`);
        return res.data.data;
    },

    updateComment: (projectId: string, commentId: string, payload: any) =>
        api.patch(`/comments/${projectId}/edit/${commentId}`, payload),

    deleteComment: (projectId: string, commentId: string) =>
        api.delete(`/comments/${projectId}/edit/${commentId}`),
};
