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
