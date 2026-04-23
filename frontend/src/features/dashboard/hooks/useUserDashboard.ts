import { useQuery } from '@tanstack/react-query';
import { dashboardKeys, getUserDashboard } from '../api/dashboardApi';

export function useUserDashboard() {
    return useQuery({
        queryKey: dashboardKeys.user(),
        queryFn: getUserDashboard,
        staleTime: 1000 * 60,
    });
}
