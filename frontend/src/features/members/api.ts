import { apiClient as api } from "../../lib/axios";
import { ProjectMember } from "./types";

export const membersApi = {
    getMembers: async (projectId: string): Promise<ProjectMember[]> => {
        const res = await api.get(`/projects/${projectId}/members`);
        return res.data.data;
    },

    addMember: async (
        projectId: string,
        payload: { userId: string; role: string }
    ) => {
        const res = await api.post(`/projects/${projectId}/members`, payload);
        return res.data.data;
    },

    updateMemberRole: async (
        projectId: string,
        memberId: string,
        role: string
    ) => {
        const res = await api.patch(
            `/projects/${projectId}/members/${memberId}`,
            { role }
        );
        return res.data.data;
    },

    removeMember: (projectId: string, memberId: string) =>
        api.delete(`/projects/${projectId}/members/${memberId}`),
};
