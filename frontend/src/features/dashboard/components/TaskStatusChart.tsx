import { Link } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';
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
  projectId: string;
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
  statusDistribution,
}: TaskStatusChartProps) {
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
        <CardHeader>
          <CardTitle className="text-lg">Task Status Distribution</CardTitle>
          <CardDescription>Track where project work is currently blocked or flowing.</CardDescription>
        </CardHeader>
        <CardContent className="flex h-[300px] flex-col items-center justify-center gap-4 text-center">
          <div className="rounded-full bg-muted p-3">
            <ClipboardList className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-medium">No tasks yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Create your first task to unlock status analytics and sprint flow visibility.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to={`/projects/${projectId}`}>Create First Task</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Task Status Distribution</CardTitle>
        <CardDescription>{totalTasks} total tasks across workflow states.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="h-[260px]" role="img" aria-label="Donut chart showing task statuses">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="name"
                innerRadius={65}
                outerRadius={95}
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

        <ul className="space-y-3" aria-label="Task status legend">
          {chartData.map((item) => {
            const percentage = totalTasks ? Math.round((item.count / totalTasks) * 100) : 0;

            return (
              <li
                key={item.status}
                className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${STATUS_META[item.status].dotClass}`}
                    aria-hidden="true"
                  />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{item.count}</p>
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
