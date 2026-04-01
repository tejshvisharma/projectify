import { Calendar, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Task, TaskStatus } from '../types';
import { cn } from '@/lib/utils';

const PRIORITY_CONFIG: Record<Task['priority'], { label: string; className: string }> = {
  low: {
    label: 'Low',
    className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  },
  medium: {
    label: 'Medium',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-200',
  },
  high: {
    label: 'High',
    className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/60 dark:text-orange-200',
  },
  critical: {
    label: 'Critical',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-200',
  },
};

const STATUS_CONFIG: Record<TaskStatus, { label: string; className: string }> = {
  todo: {
    label: 'To Do',
    className: 'border-border text-muted-foreground bg-muted/50',
  },
  in_progress: {
    label: 'In Progress',
    className:
      'border-blue-200 text-blue-700 bg-blue-100/70 dark:border-blue-900 dark:text-blue-300 dark:bg-blue-950/40',
  },
  submitted: {
    label: 'Submitted',
    className:
      'border-amber-200 text-amber-700 bg-amber-100/80 dark:border-amber-900 dark:text-amber-300 dark:bg-amber-950/40',
  },
  done: {
    label: 'Approved',
    className:
      'border-emerald-200 text-emerald-700 bg-emerald-100/80 dark:border-emerald-900 dark:text-emerald-300 dark:bg-emerald-950/40',
  },
};

function formatDate(dateString?: string) {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

interface TaskCardDragPreviewProps {
  task: Task;
}

export default function TaskCardDragPreview({ task }: TaskCardDragPreviewProps) {
  const priority = PRIORITY_CONFIG[task.priority];
  const showRejected = task.verification?.status === 'rejected';

  const statusBadge = showRejected
    ? {
        label: 'Changes Requested',
        className:
          'border-red-200 text-red-700 bg-red-100/80 dark:border-red-900 dark:text-red-300 dark:bg-red-950/40',
      }
    : STATUS_CONFIG[task.status];

  return (
    <Card className="w-[320px] max-w-[calc(100vw-2rem)] border-border bg-card shadow-2xl ring-1 ring-primary/25">
      <CardContent className="p-3">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
              {task.title}
            </p>
            <Badge variant="outline" className={cn('shrink-0 text-[10px] font-medium', statusBadge.className)}>
              {statusBadge.label}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', priority.className)}>
              {priority.label}
            </span>

            {task.dueDate && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(task.dueDate)}
              </span>
            )}

            {task.assignedTo ? (
              <span className="inline-flex items-center gap-1">
                <Avatar className="h-4 w-4">
                  <AvatarImage src={task.assignedTo.avatar?.url} />
                  <AvatarFallback className="bg-primary/10 text-[9px] text-primary">
                    {task.assignedTo.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="max-w-[90px] truncate">{task.assignedTo.username}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1">
                <User className="h-3 w-3" />
                Unassigned
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
