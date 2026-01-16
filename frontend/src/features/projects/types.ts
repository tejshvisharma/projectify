export interface Project {
    _id: string;
    name: string;
    description: string;
    createdBy: string;
    endDate?: string;
    githubRepo?: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}

export interface ProjectMeta {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface ProjectsResponse {
    projects: Project[];
    meta: ProjectMeta;
}

export interface CreateProjectPayload {
    name: string;
    description: string;
    endDate?: string;
    githubRepo?: string;
    tags?: string[];
}

export type UpdateProjectPayload = Partial<CreateProjectPayload>;
