export interface ProjectMember {
    _id: string;
    project: string;
    role: "viewer" | "member" | "project_admin" | "owner";
    user: {
        _id: string;
        username: string;
        email?: string;
        avatar?: { url: string };
    };
    createdAt: string;
    updatedAt: string;
}
