import { AlertTriangle, CalendarX2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { UserDashboardTaskItem } from '../types/dashboard.types';

interface OverdueListProps {
  tasks: UserDashboardTaskItem[];
}

function getOverdueLabel(dateString?: string | null): string {
  if (!dateString) {
    return 'Past due';
  }

  const due = new Date(dateString);
  const now = new Date();
  const dayMs = 1000 * 60 * 60 * 24;
  const days = Math.max(1, Math.ceil((now.getTime() - due.getTime()) / dayMs));

  if (days === 1) return 'Overdue by 1 day';
  return `Overdue by ${days} days`;
}

export function OverdueList({ tasks }: OverdueListProps) {
  return (
    <Card className="border-destructive/25 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-destructive">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          Overdue Tasks
        </CardTitle>
        <CardDescription className="max-w-[40ch] leading-relaxed text-destructive/85">
          Tasks requiring immediate attention.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {tasks.length === 0 ? (
          <p className="rounded-md border border-dashed border-destructive/40 bg-background/60 px-3 py-6 text-center text-sm text-muted-foreground">
            No overdue tasks
          </p>
        ) : (
          <ul className="space-y-3" aria-label="Overdue tasks">
            {tasks.slice(0, 6).map((task) => (
              <li key={task._id} className="rounded-lg border border-destructive/30 bg-destructive/[0.04] p-3 transition-colors hover:bg-destructive/[0.07]">
                <p className="line-clamp-1 text-sm font-medium">{task.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{task.project?.name ?? 'Unknown project'}</p>
                <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-destructive">
                  <CalendarX2 className="h-3 w-3" aria-hidden="true" />
                  {getOverdueLabel(task.dueDate)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
