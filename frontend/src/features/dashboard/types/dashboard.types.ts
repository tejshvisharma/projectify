import type { ApiResponse } from '@/features/projects/types';

export type DashboardTaskStatus = 'todo' | 'in_progress' | 'submitted' | 'done';

export interface DashboardAvatar {
    url?: string;
    localPath?: string;
    public_id?: string;
}

export interface DashboardKpi {
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    overdueTasks: number;
    totalCreditsEarned: number;
}

export interface DashboardStatusDistribution {
    status: DashboardTaskStatus;
    count: number;
}

export interface DashboardRecentActivityItem {
    type: string;
    taskTitle: string;
    user: {
        username: string;
        avatar: DashboardAvatar;
    };
    timestamp: string | null;
}

export interface DashboardSummaryData {
    kpi: DashboardKpi;
    statusDistribution: DashboardStatusDistribution[];
    recentActivity: DashboardRecentActivityItem[];
}

export type DashboardSummaryResponse = ApiResponse<DashboardSummaryData>;

export interface DashboardProjectRef {
    _id: string;
    name: string;
}

export interface UserDashboardTaskItem {
    _id: string;
    title: string;
    status: DashboardTaskStatus;
    dueDate?: string | null;
    createdAt: string;
    updatedAt: string;
    completionAt?: string | null;
    project: DashboardProjectRef;
}

export interface UserDashboardTaskBuckets {
    assigned: UserDashboardTaskItem[];
    inProgress: UserDashboardTaskItem[];
    submitted: UserDashboardTaskItem[];
    upcoming: UserDashboardTaskItem[];
    overdue: UserDashboardTaskItem[];
    recent: UserDashboardTaskItem[];
    completed: UserDashboardTaskItem[];
}

export interface UserDashboardMention {
    _id: string;
    content: string;
    createdAt: string;
    project: DashboardProjectRef;
    creator: {
        _id: string;
        username: string;
        avatar: DashboardAvatar;
    };
}

export type UserDashboardActivityType =
    | 'task_submitted'
    | 'task_approved'
    | 'task_rejected'
    | 'task_assigned';

export interface UserDashboardActivityItem {
    type: UserDashboardActivityType;
    taskId: string;
    taskTitle: string;
    project: DashboardProjectRef;
    timestamp: string | null;
    reason?: string;
}

export interface UserDashboardStats {
    totalAssigned: number;
    totalCompleted: number;
    totalPending: number;
    totalOverdue: number;
}

export interface UserDashboardData {
    tasks: UserDashboardTaskBuckets;
    mentions: UserDashboardMention[];
    stats: UserDashboardStats;
    activity: UserDashboardActivityItem[];
    suggestions: string[];
}

export type UserDashboardResponse = ApiResponse<UserDashboardData>;
