import { Link } from 'react-router-dom';
import { CalendarDays, ClipboardList, ListTodo } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { DashboardTaskStatus, UserDashboardTaskBuckets, UserDashboardTaskItem } from '../types/dashboard.types';
import { cn } from '@/lib/utils';

const MAX_VISIBLE_TASKS = 8;

const STATUS_META: Record<DashboardTaskStatus, { label: string; className: string }> = {
  todo: {
    label: 'To Do',
    className: 'border-border text-muted-foreground bg-muted/50',
  },
  in_progress: {
    label: 'In Progress',
    className: 'border-blue-200 text-blue-700 bg-blue-100/70 dark:border-blue-900 dark:text-blue-300 dark:bg-blue-950/40',
  },
  submitted: {
    label: 'Submitted',
    className: 'border-amber-200 text-amber-700 bg-amber-100/80 dark:border-amber-900 dark:text-amber-300 dark:bg-amber-950/40',
  },
  done: {
    label: 'Completed',
    className: 'border-emerald-200 text-emerald-700 bg-emerald-100/80 dark:border-emerald-900 dark:text-emerald-300 dark:bg-emerald-950/40',
  },
};

function formatDate(dateString?: string | null): string {
  if (!dateString) {
    return 'No due date';
  }

  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function isOverdue(task: UserDashboardTaskItem): boolean {
  return Boolean(task.dueDate && task.status !== 'done' && new Date(task.dueDate) < new Date());
}

interface TaskListProps {
  items: UserDashboardTaskItem[];
}

function TaskList({ items }: TaskListProps) {
  if (!items.length) {
    return (
      <div className="flex h-44 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/70 bg-muted/20 text-center">
        <ClipboardList className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
        <div>
          <p className="text-sm font-medium">No tasks found</p>
          <p className="text-xs text-muted-foreground">You are all caught up in this section.</p>
        </div>
      </div>
    );
  }

  return (
    <ul className="space-y-3" aria-label="Task list">
      {items.slice(0, MAX_VISIBLE_TASKS).map((task) => {
        const statusMeta = STATUS_META[task.status];

        return (
          <li key={task._id} className="rounded-lg border border-border/70 bg-card/60 p-3 transition-all duration-200 hover:border-border hover:bg-card hover:shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0 space-y-1">
                <p className="truncate text-sm font-medium text-foreground">{task.title}</p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="truncate rounded-full bg-muted px-2 py-0.5">{task.project?.name ?? 'Unknown project'}</span>
                  <span aria-hidden="true">•</span>
                  <span className={cn('inline-flex items-center gap-1', isOverdue(task) ? 'font-medium text-destructive' : '')}>
                    <CalendarDays className="h-3 w-3" aria-hidden="true" />
                    {formatDate(task.dueDate)}
                  </span>
                </div>
              </div>

              <Badge variant="outline" className={cn('shrink-0 text-[10px] font-medium', statusMeta.className)}>
                {statusMeta.label}
              </Badge>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

interface TaskTabsProps {
  tasks: UserDashboardTaskBuckets;
}

export function TaskTabs({ tasks }: TaskTabsProps) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ListTodo className="h-4 w-4 text-primary" aria-hidden="true" />
            My Tasks
          </CardTitle>
          <CardDescription className="max-w-[52ch] leading-relaxed">Track active work, submissions, and due dates.</CardDescription>
        </div>
        <Button asChild size="sm" variant="outline" className="h-8 px-3">
          <Link to="/projects">View Projects</Link>
        </Button>
      </CardHeader>

      <CardContent className="pt-0">
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="grid h-auto w-full grid-cols-3 gap-2 rounded-xl border border-border/70 bg-muted/50 p-1.5">
            <TabsTrigger
              value="all"
              className="h-9 rounded-md text-xs font-medium transition-all duration-200 sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              All ({tasks.assigned.length})
            </TabsTrigger>
            <TabsTrigger
              value="in_progress"
              className="h-9 rounded-md text-xs font-medium transition-all duration-200 sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              In Progress ({tasks.inProgress.length})
            </TabsTrigger>
            <TabsTrigger
              value="submitted"
              className="h-9 rounded-md text-xs font-medium transition-all duration-200 sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Submitted ({tasks.submitted.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <TaskList items={tasks.assigned} />
          </TabsContent>
          <TabsContent value="in_progress" className="mt-0">
            <TaskList items={tasks.inProgress} />
          </TabsContent>
          <TabsContent value="submitted" className="mt-0">
            <TaskList items={tasks.submitted} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
