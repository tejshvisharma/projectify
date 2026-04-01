import { useQuery } from '@tanstack/react-query';
import { dashboardKeys, getDashboardSummary } from '../api/dashboardApi';

interface UseDashboardSummaryOptions {
    enabled?: boolean;
}

export function useDashboardSummary(
    projectId: string,
    options: UseDashboardSummaryOptions = {},
) {
    const { enabled = true } = options;

    return useQuery({
        queryKey: dashboardKeys.summary(projectId),
        queryFn: () => getDashboardSummary(projectId),
        enabled: Boolean(projectId) && enabled,
        staleTime: 1000 * 60,
    });
}
