import { apiClient as api } from "../../lib/axios";

export const notesApi = {
    createNote: (projectId: string, payload: { content: string }) =>
        api.post(`/projects/${projectId}/notes`, payload),

    getProjectNotes: async (projectId: string) => {
        const res = await api.get(`/projects/${projectId}/notes`);
        return res.data.data;
    },

    getNoteById: async (projectId: string, noteId: string) => {
        const res = await api.get(`/projects/${projectId}/notes/${noteId}`);
        return res.data.data;
    },

    updateNote: (projectId: string, noteId: string, payload: { content: string }) =>
        api.patch(`/projects/${projectId}/notes/${noteId}`, payload),

    deleteNote: (projectId: string, noteId: string) =>
        api.delete(`/projects/${projectId}/notes/${noteId}`),

    getMyMentions: async (projectId: string) => {
        const res = await api.get(`/projects/${projectId}/notes/mentions/me`);
        return res.data.data;
    },
};
