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
