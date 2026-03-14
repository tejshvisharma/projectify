export interface TaskAttachment {
    url: string;
    public_id: string;
    resource_type: 'image' | 'video' | 'raw' | string;
    bytes: number;
    format: string;
    original_filename: string;
    mimeType: string;
}

export interface Task {
    _id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    difficulty: string;
    credits: number;
    dueDate?: string;
    attachments: TaskAttachment[];
    createdBy: any;
    assignedTo: any;
    createdAt: string;
    updatedAt: string;
}

export interface TasksResponse {
    tasks: Task[];
    meta: {
        page: number;
        limit: number;
        totalItems: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

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