import { Activity, CheckCircle2, Clock3, ListTodo, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { UserDashboardActivityItem, UserDashboardActivityType } from '../types/dashboard.types';

interface UserActivityFeedProps {
  activities: UserDashboardActivityItem[];
}

function formatRelativeTime(timestamp: string | null): string {
  if (!timestamp) {
    return 'just now';
  }

  const parsedTime = new Date(timestamp).getTime();
  if (Number.isNaN(parsedTime)) {
    return 'just now';
  }

  const deltaSeconds = Math.max(0, Math.floor((Date.now() - parsedTime) / 1000));

  if (deltaSeconds < 60) return 'just now';
  if (deltaSeconds < 3600) return `${Math.floor(deltaSeconds / 60)}m ago`;
  if (deltaSeconds < 86400) return `${Math.floor(deltaSeconds / 3600)}h ago`;
  if (deltaSeconds < 604800) return `${Math.floor(deltaSeconds / 86400)}d ago`;

  return new Date(parsedTime).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function getActivityMeta(type: UserDashboardActivityType): {
  label: string;
  icon: typeof ListTodo;
  iconClass: string;
} {
  if (type === 'task_approved') {
    return {
      label: 'Task approved',
      icon: CheckCircle2,
      iconClass: 'text-emerald-600 dark:text-emerald-400',
    };
  }

  if (type === 'task_rejected') {
    return {
      label: 'Task rejected',
      icon: XCircle,
      iconClass: 'text-destructive',
    };
  }

  if (type === 'task_submitted') {
    return {
      label: 'Task submitted',
      icon: Clock3,
      iconClass: 'text-amber-600 dark:text-amber-300',
    };
  }

  return {
    label: 'Task assigned',
    icon: ListTodo,
    iconClass: 'text-primary',
  };
}

export function UserActivityFeed({ activities }: UserActivityFeedProps) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-4 w-4 text-primary" aria-hidden="true" />
          Activity Feed
        </CardTitle>
        <CardDescription className="max-w-[42ch] leading-relaxed">Latest assignment, submission, and review events.</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {activities.length === 0 ? (
          <p className="rounded-md border border-dashed border-border/70 bg-muted/20 px-3 py-6 text-center text-sm text-muted-foreground">
            No activity yet
          </p>
        ) : (
          <ul className="space-y-3" aria-label="User activity feed">
            {activities.slice(0, 8).map((item, index) => {
              const meta = getActivityMeta(item.type);
              const Icon = meta.icon;

              return (
                <li
                  key={`${item.taskId}-${item.type}-${index}`}
                  className="flex gap-3 rounded-lg border border-border/60 bg-card/40 p-3 transition-colors hover:bg-muted/30"
                >
                  <div className={`rounded-md bg-muted/80 p-2 ${meta.iconClass}`}>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="line-clamp-1 text-sm font-medium leading-relaxed text-foreground">
                      {meta.label}: {item.taskTitle}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.project?.name ?? 'Unknown project'}</p>
                    {item.reason ? (
                      <p className="line-clamp-2 text-xs text-destructive">Reason: {item.reason}</p>
                    ) : null}
                    <p className="text-xs text-muted-foreground">{formatRelativeTime(item.timestamp)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
