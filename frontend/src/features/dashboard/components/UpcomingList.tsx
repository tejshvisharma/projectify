import { CalendarClock, TimerReset } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { UserDashboardTaskItem } from '../types/dashboard.types';
import { cn } from '@/lib/utils';

interface UpcomingListProps {
  tasks: UserDashboardTaskItem[];
}

function getDueLabel(dateString?: string | null): string {
  if (!dateString) {
    return 'No due date';
  }

  const due = new Date(dateString);
  const now = new Date();
  const dayMs = 1000 * 60 * 60 * 24;
  const days = Math.ceil((due.getTime() - now.getTime()) / dayMs);

  if (days <= 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  return `In ${days} days`;
}

export function UpcomingList({ tasks }: UpcomingListProps) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TimerReset className="h-4 w-4 text-amber-600 dark:text-amber-300" aria-hidden="true" />
          Upcoming Deadlines
        </CardTitle>
        <CardDescription className="max-w-[40ch] leading-relaxed">Priority tasks due in the next few days.</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {tasks.length === 0 ? (
          <p className="rounded-md border border-dashed border-border/70 bg-muted/20 px-3 py-6 text-center text-sm text-muted-foreground">
            No tasks found
          </p>
        ) : (
          <ul className="space-y-3" aria-label="Upcoming deadlines">
            {tasks.slice(0, 6).map((task) => (
              <li key={task._id} className="rounded-lg border border-border/70 bg-card/50 p-3 transition-colors hover:bg-muted/30">
                <p className="line-clamp-1 text-sm font-medium">{task.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{task.project?.name ?? 'Unknown project'}</p>
                <p
                  className={cn(
                    'mt-2 inline-flex items-center gap-1 text-xs font-medium',
                    getDueLabel(task.dueDate) === 'Due today'
                      ? 'text-destructive'
                      : 'text-amber-700 dark:text-amber-300',
                  )}
                >
                  <CalendarClock className="h-3 w-3" aria-hidden="true" />
                  {getDueLabel(task.dueDate)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
