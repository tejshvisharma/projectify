import { Suspense, lazy } from 'react';
import {
  CheckCircle2,
  Clock3,
  Layers3,
  Sparkles,
  Target,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ActivityFeed } from './ActivityFeed';
import { KpiCard } from './KpiCard';
import type { DashboardSummaryData } from '../types/dashboard.types';

interface DashboardLayoutProps {
  projectId: string;
  summary: DashboardSummaryData;
}

const TaskStatusChart = lazy(() => import('./TaskStatusChart'));

export function DashboardLayout({ projectId, summary }: DashboardLayoutProps) {
  const { kpi } = summary;

  const completionRate = Math.max(0, Math.min(100, kpi.completionRate));
  const openTasks = Math.max(0, kpi.totalTasks - kpi.completedTasks);
  const overdueRate = kpi.totalTasks > 0
    ? Math.round((kpi.overdueTasks / kpi.totalTasks) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5 lg:gap-6" aria-label="Project KPI cards">
        <KpiCard label="Total Tasks" value={kpi.totalTasks} icon={Layers3} />
        <KpiCard
          label="Completed Tasks"
          value={kpi.completedTasks}
          icon={CheckCircle2}
          trend={{ value: completionRate, label: 'completion' }}
        />
        <KpiCard label="Completion Rate (%)" value={completionRate} icon={Target} />
        <KpiCard label="Overdue Tasks" value={kpi.overdueTasks} icon={Clock3} />
        <KpiCard label="Credits Earned" value={kpi.totalCreditsEarned} icon={Sparkles} />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6" aria-label="Task analytics section">
        <Suspense
          fallback={
            <Card className="h-full border-border/70 shadow-sm">
              <CardHeader>
                <Skeleton className="h-6 w-44" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[260px] w-full" />
              </CardContent>
            </Card>
          }
        >
          <TaskStatusChart projectId={projectId} statusDistribution={summary.statusDistribution} />
        </Suspense>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Execution Pulse</CardTitle>
            <CardDescription>
              A snapshot of throughput, backlog pressure, and delivery risk.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">Overall completion</span>
                <span className="font-semibold">{completionRate}%</span>
              </div>
              <progress
                value={completionRate}
                max={100}
                className="h-2 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-value]:bg-primary [&::-moz-progress-bar]:bg-primary"
                aria-label="Project completion progress"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border/70 bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Open tasks</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">{openTasks}</p>
                <p className="mt-1 text-xs text-muted-foreground">Still in motion this cycle.</p>
              </div>

              <div className="rounded-lg border border-border/70 bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Overdue ratio</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">{overdueRate}%</p>
                <p className="mt-1 text-xs text-muted-foreground">Tasks requiring immediate attention.</p>
              </div>
            </div>

            <p className="rounded-md border border-border/70 bg-card px-3 py-2 text-sm text-muted-foreground">
              Keep overdue under 10% to maintain healthy sprint predictability.
            </p>
          </CardContent>
        </Card>
      </section>

      <section aria-label="Recent project activity section">
        <ActivityFeed projectId={projectId} activities={summary.recentActivity} />
      </section>
    </div>
  );
}
