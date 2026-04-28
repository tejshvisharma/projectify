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
    description?: string;
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
export type TaskStatus = 'todo' | 'in_progress' | 'submitted' | 'done';
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
    resourceType: "image" | "video" | "raw";
    mimeType: string;
    format?: string;
    extension?: string;
    size?: number;
    originalName?: string;
}

export interface TaskSubmission {
    comment: string;
    attachments: TaskAttachment[];
    submittedAt?: string;
}

export interface TaskVerification {
    status: 'pending' | 'approved' | 'rejected';
    verifiedBy?: string;
    verifiedAt?: string;
}

export interface TaskRejection {
    reason?: string;
    rejectedAt?: string;
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
    submission?: TaskSubmission;
    verification?: TaskVerification;
    rejection?: TaskRejection;
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
    submitted: Task[];
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

export interface LeaderboardStats {
    totalCredits: number;
    tasksCompleted: number;
    onTimeTasks: number;
}

export interface LeaderboardMember {
    _id: string;
    user: UserSummary;
    role: ProjectRole;
    stats: LeaderboardStats;
    updatedAt: string;
}

export interface LeaderboardPagination {
    page: number;
    limit: number;
    total: number;
}

export interface LeaderboardCurrentUser {
    rank: number | null;
    totalCredits: number;
}

export interface ProjectLeaderboardResponse {
    leaders: LeaderboardMember[];
    pagination: LeaderboardPagination;
    currentUser: LeaderboardCurrentUser;
}

export interface GlobalLeaderboardStats {
    totalCredits: number;
    totalTasksCompleted: number;
    onTimeTasks: number;
}

export interface GlobalLeaderboardUser {
    _id: string;
    username: string;
    avatar: UserSummary['avatar'];
    stats: GlobalLeaderboardStats;
    updatedAt: string;
}

export interface GlobalLeaderboardResponse {
    leaders: GlobalLeaderboardUser[];
    pagination: LeaderboardPagination;
    currentUser: LeaderboardCurrentUser;
}