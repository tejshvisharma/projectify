import { lazy, Suspense, useMemo } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const TaskStatusChart = lazy(() => import('./TaskStatusChart'));

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

      <section
        className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12"
        aria-label="User dashboard content"
      >
        {/* LEFT SIDE */}
        <div className="space-y-6 xl:col-span-8">
          <TaskTabs tasks={dashboard.tasks} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <UpcomingList tasks={dashboard.tasks.upcoming} />
            <OverdueList tasks={dashboard.tasks.overdue} />
          </div>

          <RecentlyAssignedList tasks={dashboard.tasks.recent} />
        </div>

        {/* RIGHT SIDE */}
        <aside
          className="space-y-6 xl:col-span-4"
          aria-label="Insights and communication panels"
        >
          {/* ✅ CHART SKELETON */}
          <Suspense
            fallback={
              <Card className="h-full border-border/70 shadow-sm">
                <CardHeader>
                  <Skeleton className="h-6 w-44" />
                  <Skeleton className="h-4 w-64" />
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Chart area */}
                  <Skeleton className="h-[220px] w-full rounded-md" />

                  {/* Legend */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </CardContent>
              </Card>
            }
          >
            <TaskStatusChart
              compact
              statusDistribution={statusDistribution}
              createTaskHref="/projects"
              emptyActionLabel="Browse Projects"
            />
          </Suspense>

          {/* ✅ ACTIVITY FEED SKELETON WRAPPER */}
          <Suspense
            fallback={
              <Card className="border-border/70 shadow-sm">
                <CardHeader>
                  <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="space-y-2 w-full">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            }
          >
            <UserActivityFeed activities={dashboard.activity} />
          </Suspense>

          {/* ✅ MENTIONS SKELETON WRAPPER */}
          <Suspense
            fallback={
              <Card className="border-border/70 shadow-sm">
                <CardHeader>
                  <Skeleton className="h-6 w-36" />
                </CardHeader>
                <CardContent className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            }
          >
            <MentionsList mentions={dashboard.mentions} />
          </Suspense>
        </aside>
      </section>
    </div>
  );
}