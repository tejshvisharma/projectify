import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { ProjectRole, Task, TaskStatus } from '../types';
import TaskCard from './TaskCard';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';


// Theme-aware column color configurations
// Light mode: subtle tinted backgrounds
// Dark mode: darker, muted backgrounds
const COLUMN_STYLES: Record<TaskStatus, { light: string; dark: string }> = {
  todo: {
    light: 'bg-muted/40',
    dark: 'bg-slate-200 dark:peer-checked:bg-slate-800',
  },
  in_progress: {
    light: 'bg-blue-50/50 dark:bg-blue-950/20',
    dark: '',
  },
  submitted: {
    light: 'bg-amber-50/60 dark:bg-amber-950/20',
    dark: '',
  },
  done: {
    light: 'bg-emerald-50/60 dark:bg-emerald-950/20',
    dark: '',
  },
};

interface KanbanColumnProps {
  columnId: TaskStatus;
  label: string;
  tasks: Task[];
  isLoading: boolean;
  projectId: string;
  onAddTask: () => void;
  onTaskClick: (task: Task) => void;
  isOver: boolean;
  currentRole?: ProjectRole;
  currentUserId?: string;
}

export default function KanbanColumn({
  columnId, label, tasks,
  isLoading, projectId, onAddTask, onTaskClick,
  isOver,
  currentRole,
  currentUserId,
}: KanbanColumnProps) {
  const taskIds = tasks.map((t) => t._id);
  const columnStyle = COLUMN_STYLES[columnId];
  const { setNodeRef } = useDroppable({
    id: columnId,
    data: { type: 'column', columnId },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'rounded-xl border border-border p-3 min-h-[420px]',
        'transition-all duration-200',
        // Theme-aware background
        columnStyle.light,
        // Hover/over states
        isOver ? 'ring-2 ring-primary/40 ring-offset-1 ring-offset-background' : ''
      )}
    >
      {/* Column header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm dark:text-slate-100">{label}</h3>
          <Badge variant="secondary" className="text-xs">
            {isLoading ? '—' : tasks.length}
          </Badge>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onAddTask}
          aria-label={`Add task to ${label}`}
        >
          <Plus className="h-3 w-3" />
        </Button>

      </div>

      {/* Loading skeletons */}
      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      )}

      {/* Tasks */}
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="mt-2 flex min-h-[80px] flex-col gap-2">
          {!isLoading && tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              projectId={projectId}
              onTaskClick={onTaskClick}
              columnId={columnId}
              currentRole={currentRole}
              currentUserId={currentUserId}
            />
          ))}

          {!isLoading && tasks.length === 0 && (
            <button
              onClick={onAddTask}
              aria-label={`Add task to ${label}`}
              className={cn(
                'w-full h-16 rounded-lg border-2 border-dashed',
                'flex items-center justify-center gap-1',
                'text-xs transition-colors',
                // Theme-aware colors
                'border-muted-foreground/20 dark:border-muted-foreground/30',
                'text-muted-foreground dark:text-muted-foreground/70',
                'hover:border-muted-foreground/40 dark:hover:border-muted-foreground/50',
                'hover:bg-muted/30 dark:hover:bg-muted/20'
              )}
            >
              <Plus className="h-3 w-3" />
              Add a task
            </button>
          )}
        </div>
      </SortableContext>

    </div>
  );
}
