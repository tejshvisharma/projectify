import { apiClient } from '@/lib/axios';
import type {
    DashboardSummaryData,
    DashboardSummaryResponse,
    UserDashboardData,
    UserDashboardResponse,
} from '../types/dashboard.types';

export const dashboardKeys = {
    all: ['dashboard'] as const,
    summary: (projectId: string) => [...dashboardKeys.all, projectId, 'summary'] as const,
    user: () => ['user-dashboard'] as const,
};

export async function getDashboardSummary(
    projectId: string,
): Promise<DashboardSummaryData> {
    const response = await apiClient.get<DashboardSummaryResponse>(
        `/projects/${projectId}/dashboard/summary`,
    );
    return response.data.data;
}

export async function getUserDashboard(): Promise<UserDashboardData> {
    const response = await apiClient.get<UserDashboardResponse>('/dashboard/me');
    return response.data.data;
}
