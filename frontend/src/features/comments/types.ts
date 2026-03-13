import type { UserSummary } from '@/features/projects/types';

export interface Comment {
    _id: string;
    content: string;
    task: string;
    user: UserSummary;
    attachments: string[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateCommentPayload {
    content: string;
}

export interface UpdateCommentPayload {
    content: string;
}
