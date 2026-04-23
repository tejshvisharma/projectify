import { useMemo } from 'react';
import TaskStatusChart from './TaskStatusChart';
import { MentionsList } from './MentionsList';
import { OverdueList } from './OverdueList';
import { RecentlyAssignedList } from './RecentlyAssignedList';
import { StatsCards } from './StatsCards';
import { SuggestionsBanner } from './SuggestionsBanner';
import { TaskTabs } from './TaskTabs';
import { UpcomingList } from './UpcomingList';
import { UserActivityFeed } from './UserActivityFeed';
import type {
  DashboardStatusDistribution,
  DashboardTaskStatus,
  UserDashboardData,
} from '../types/dashboard.types';

interface UserDashboardLayoutProps {
  dashboard: UserDashboardData;
}

const STATUS_ORDER: DashboardTaskStatus[] = ['todo', 'in_progress', 'submitted', 'done'];

export function UserDashboardLayout({ dashboard }: UserDashboardLayoutProps) {
  const statusDistribution = useMemo<DashboardStatusDistribution[]>(() => {
    const counts: Record<DashboardTaskStatus, number> = {
      todo: 0,
      in_progress: 0,
      submitted: 0,
      done: 0,
    };

    dashboard.tasks.assigned.forEach((task) => {
      counts[task.status] += 1;
    });

    return STATUS_ORDER.map((status) => ({
      status,
      count: counts[status],
    }));
  }, [dashboard.tasks.assigned]);

  return (
    <div className="space-y-8">
      <StatsCards stats={dashboard.stats} />
      <SuggestionsBanner suggestions={dashboard.suggestions} />

      <section className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12" aria-label="User dashboard content">
        <div className="space-y-6 xl:col-span-8">
          <TaskTabs tasks={dashboard.tasks} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <UpcomingList tasks={dashboard.tasks.upcoming} />
            <OverdueList tasks={dashboard.tasks.overdue} />
          </div>

          <RecentlyAssignedList tasks={dashboard.tasks.recent} />
        </div>

        <aside className="space-y-6 xl:col-span-4" aria-label="Insights and communication panels">
          <TaskStatusChart
            compact
            statusDistribution={statusDistribution}
            createTaskHref="/projects"
            emptyActionLabel="Browse Projects"
          />
          <UserActivityFeed activities={dashboard.activity} />
          <MentionsList mentions={dashboard.mentions} />
        </aside>
      </section>
    </div>
  );
}
