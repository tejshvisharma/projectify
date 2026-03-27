import { Calendar, User, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Task } from '../types';
import { cn } from '@/lib/utils';

// Theme-aware priority configurations
// Use Tailwind dark: variant for proper dark mode support
const PRIORITY_CONFIG: Record<Task['priority'], { 
  label: string; 
  className: string;
}> = {
  low: { 
    label: 'Low', 
    className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' 
  },
  medium: { 
    label: 'Medium', 
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-200' 
  },
  high: { 
    label: 'High', 
    className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/60 dark:text-orange-200' 
  },
  critical: { 
    label: 'Critical', 
    className: 'bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-200' 
  },
};

interface TaskCardProps {
  task: Task;
  projectId: string;
  onTaskClick: (task: Task) => void;
  isDragging?: boolean;
  columnId?: TaskStatus;
}

export default function TaskCard({
  task,
  projectId,
  onTaskClick,
  isDragging = false,
  columnId
}: TaskCardProps) {
  
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging: isSortableDragging,
  } = useSortable({
    id: task._id,
    data: {
      type: 'task',
      columnId,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0 : 1,
  };

  const priority = PRIORITY_CONFIG[task.priority];

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric',
    });
  };

  const isOverdue =
    task.dueDate &&
    task.status !== 'done' &&
    new Date(task.dueDate) < new Date();

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card
        className={cn(
          // Theme-aware background - use card background
          'bg-card dark:bg-card',
          'border border-border dark:border-border',
          'transition-all group',
          isDragging
            ? 'shadow-2xl scale-105 rotate-2'
            : 'hover:shadow-md dark:hover:shadow-lg'
        )}
        onClick={() => !isSortableDragging && onTaskClick(task)}
      >
        <CardContent className="p-3 space-y-2.5">

          {/* Top row: drag handle + title */}
          <div className="flex items-start gap-2">
            {/* Drag handle */}
            <div
              {...listeners}
              className={cn(
                'mt-0.5 shrink-0 cursor-grab active:cursor-grabbing',
                'text-muted-foreground/40 hover:text-muted-foreground',
                'dark:text-muted-foreground/30 dark:hover:text-muted-foreground/60',
                'transition-colors'
              )}
              aria-label="Drag to reorder"
            >
              <GripVertical className="h-4 w-4" />
            </div>

            {/* Title - theme aware */}
            <p className="text-sm font-medium leading-snug line-clamp-2 flex-1 text-foreground dark:text-foreground">
              {task.title}
            </p>

          </div>

          {/* Priority badge - theme aware */}
          <div className="flex items-center gap-2 pl-6">
            <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', priority.className)}>
              {priority.label}
            </span>

          </div>

          {/* Bottom row */}
          <div className="flex items-center justify-between pl-6">
            {task.dueDate ? (
              <span className={cn(
                'flex items-center gap-1 text-xs',
                isOverdue
                  ? 'text-destructive dark:text-red-400 font-medium'
                  : 'text-muted-foreground dark:text-muted-foreground/80'
              )}>
                <Calendar className="h-3 w-3" />
                {formatDate(task.dueDate)}
              </span>

            ) : <span />}

            {task.assignedTo ? (
              <Avatar className="h-6 w-6">
                <AvatarImage src={task.assignedTo.avatar?.url} />
                <AvatarFallback className="text-xs bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-foreground">
                  {task.assignedTo.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>

              </Avatar>

            ) : (
              <User className="h-4 w-4 text-muted-foreground/40 dark:text-muted-foreground/30" />
            )}

          </div>

        </CardContent>

      </Card>
    </div>
  );
}
