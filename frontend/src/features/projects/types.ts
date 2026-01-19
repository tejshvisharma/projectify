export interface Project {
    _id: string;
    name: string;
    description?: string;
    createdBy: string;
    endDate?: string;
    githubRepo?: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}

export interface ProjectsMeta {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface ProjectsListResponse {
    projects: Project[];
    meta: ProjectsMeta;
}

export interface CreateProjectPayload {
    name: string;
    description: string;
    endDate?: string;
    githubRepo?: string;
    tags?: string[];
}
export interface ApiResponse<T> {
    statuscode: number;
    success: boolean;
    message: string;
    data: T;
}
export type UpdateProjectPayload = Partial<CreateProjectPayload>;
