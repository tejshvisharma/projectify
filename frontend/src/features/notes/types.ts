import type { UserSummary } from '@/features/projects/types';

export interface NoteMention {
    user: UserSummary;
}

export interface Note {
    _id: string;
    project: string;
    content: string;
    createdBy: UserSummary;
    mentions: NoteMention[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateNotePayload {
    content: string;
}

export interface UpdateNotePayload {
    content: string;
}