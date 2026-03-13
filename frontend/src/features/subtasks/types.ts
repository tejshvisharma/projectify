import type { UserSummary } from '@/features/projects/types';

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