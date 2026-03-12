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
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskDifficulty = 'easy' | 'medium' | 'hard' | 'expert';
export type ProjectRole = 'viewer' | 'member' | 'project_admin' | 'owner';

export interface UserSummary {
    _id: string;
    username: string;
    email?: string;
    avatar: {
        url: string;
        localPath?: string;
    };
}

export interface TaskAttachment {
    url: string;
    public_id: string;
    resource_type: string;
    bytes: number;
    format: string;
    original_filename: string;
    mimeType: string;
}

export interface Task {
    _id: string;
    title: string;
    description?: string;
    project: string;
    createdBy: UserSummary;
    assignedTo?: UserSummary;
    status: TaskStatus;
    priority: TaskPriority;
    difficulty: TaskDifficulty;
    credits: number;
    dueDate?: string;
    attachments: TaskAttachment[];
    createdAt: string;
    updatedAt: string;
}

export interface ProjectMember {
    _id: string;
    user: UserSummary;
    project: string;
    role: ProjectRole;
    createdAt: string;
    updatedAt: string;
}

// Grouped tasks by status — this is what KanbanBoard consumes
export interface KanbanData {
    todo: Task[];
    in_progress: Task[];
    done: Task[];
}

// Form types for creating/updating tasks
export interface CreateTaskPayload {
    title: string;
    description: string;
    assignedTo: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    difficulty?: TaskDifficulty;
    credits?: number;
    dueDate?: string;
}

export interface UpdateTaskPayload extends Partial<CreateTaskPayload> {
    removeFiles?: string[];
}

export interface SubTask {
    _id: string;
    title: string;
    task: string;
    isCompleted: boolean;
    createdBy: UserSummary;
    createdAt: string;
    updatedAt: string;
}

export interface CreateSubTaskPayload {
    title: string;
    isCompleted?: boolean;
}