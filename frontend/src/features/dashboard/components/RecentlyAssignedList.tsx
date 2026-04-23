import { Clock3, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { UserDashboardTaskItem } from '../types/dashboard.types';

interface RecentlyAssignedListProps {
  tasks: UserDashboardTaskItem[];
}

function formatRelativeTime(timestamp?: string | null): string {
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

export function RecentlyAssignedList({ tasks }: RecentlyAssignedListProps) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
          Recently Assigned
        </CardTitle>
        <CardDescription className="max-w-[40ch] leading-relaxed">Freshly assigned work items in your queue.</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {tasks.length === 0 ? (
          <p className="rounded-md border border-dashed border-border/70 bg-muted/20 px-3 py-6 text-center text-sm text-muted-foreground">
            No tasks found
          </p>
        ) : (
          <ul className="space-y-3" aria-label="Recently assigned tasks">
            {tasks.slice(0, 6).map((task) => (
              <li key={task._id} className="rounded-lg border border-border/70 bg-card/50 p-3 transition-colors hover:bg-muted/30">
                <p className="line-clamp-1 text-sm font-medium">{task.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{task.project?.name ?? 'Unknown project'}</p>
                <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock3 className="h-3 w-3" aria-hidden="true" />
                  Assigned {formatRelativeTime(task.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
