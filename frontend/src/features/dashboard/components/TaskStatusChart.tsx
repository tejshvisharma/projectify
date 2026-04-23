import { Link } from 'react-router-dom';
import { BarChart3, ClipboardList } from 'lucide-react';
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type {
  DashboardStatusDistribution,
  DashboardTaskStatus,
} from '../types/dashboard.types';

interface TaskStatusChartProps {
  projectId?: string;
  createTaskHref?: string;
  emptyActionLabel?: string;
  compact?: boolean;
  statusDistribution: DashboardStatusDistribution[];
}

interface StatusMeta {
  label: string;
  color: string;
  dotClass: string;
}

const STATUS_META: Record<DashboardTaskStatus, StatusMeta> = {
  todo: {
    label: 'To do',
    color: 'hsl(var(--status-todo))',
    dotClass: 'bg-[hsl(var(--status-todo))]',
  },
  in_progress: {
    label: 'In Progress',
    color: 'hsl(var(--status-in-progress))',
    dotClass: 'bg-[hsl(var(--status-in-progress))]',
  },
  submitted: {
    label: 'Submitted',
    color: 'hsl(var(--status-submitted))',
    dotClass: 'bg-[hsl(var(--status-submitted))]',
  },
  done: {
    label: 'Done',
    color: 'hsl(var(--status-done))',
    dotClass: 'bg-[hsl(var(--status-done))]',
  },
};

const ORDERED_STATUSES: DashboardTaskStatus[] = [
  'todo',
  'in_progress',
  'submitted',
  'done',
];

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number | string }>;
}

function CustomTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0];
  const count = Number(item?.value ?? 0);

  return (
    <div className="rounded-md border border-border bg-background px-3 py-2 text-xs shadow-sm">
      <p className="font-medium text-foreground">{item.name}</p>
      <p className="text-muted-foreground">{count} tasks</p>
    </div>
  );
}

export default function TaskStatusChart({
  projectId,
  createTaskHref,
  emptyActionLabel = 'Create First Task',
  compact = false,
  statusDistribution,
}: TaskStatusChartProps) {
  const emptyActionHref = createTaskHref ?? (projectId ? `/projects/${projectId}` : '/projects');
  const chartHeightClass = compact ? 'h-[185px]' : 'h-[260px]';
  const emptyStateHeightClass = compact ? 'h-[220px]' : 'h-[300px]';

  const chartData = ORDERED_STATUSES.map((status) => {
    const count = statusDistribution.find((item) => item.status === status)?.count ?? 0;

    return {
      status,
      name: STATUS_META[status].label,
      count,
      color: STATUS_META[status].color,
    };
  });

  const totalTasks = chartData.reduce((sum, item) => sum + item.count, 0);
  const hasTaskData = totalTasks > 0;

  if (!hasTaskData) {
    return (
      <Card className="h-full border-dashed border-border/80">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-4 w-4 text-primary" aria-hidden="true" />
            Task Status Distribution
          </CardTitle>
          <CardDescription className="max-w-[46ch] leading-relaxed">Track where project work is currently blocked or flowing.</CardDescription>
        </CardHeader>
        <CardContent className={`flex ${emptyStateHeightClass} flex-col items-center justify-center gap-4 text-center`}>
          <div className="rounded-full bg-muted p-3">
            <ClipboardList className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-medium">No tasks yet</p>
            <p className="max-w-[40ch] text-sm leading-relaxed text-muted-foreground">
              Create your first task to unlock status analytics and sprint flow visibility.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to={emptyActionHref}>{emptyActionLabel}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border-border/70 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="h-4 w-4 text-primary" aria-hidden="true" />
          Task Status Distribution
        </CardTitle>
        <CardDescription className="max-w-[46ch] leading-relaxed">{totalTasks} total tasks across workflow states.</CardDescription>
      </CardHeader>
      <CardContent className={compact ? 'space-y-4' : 'grid gap-4 lg:grid-cols-[1.1fr_0.9fr]'}>
        <div className={chartHeightClass} role="img" aria-label="Donut chart showing task statuses">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="name"
                innerRadius={compact ? 48 : 65}
                outerRadius={compact ? 74 : 95}
                paddingAngle={2}
                stroke="hsl(var(--background))"
                strokeWidth={2}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.status} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <ul className={compact ? 'grid grid-cols-2 gap-2' : 'space-y-3'} aria-label="Task status legend">
          {chartData.map((item) => {
            const percentage = totalTasks ? Math.round((item.count / totalTasks) * 100) : 0;

            return (
              <li
                key={item.status}
                className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2 transition-colors hover:bg-muted/35"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${STATUS_META[item.status].dotClass}`}
                    aria-hidden="true"
                  />
                  <span className="text-xs font-medium sm:text-sm">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium sm:text-sm">{item.count}</p>
                  <p className="text-xs text-muted-foreground">{percentage}%</p>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
