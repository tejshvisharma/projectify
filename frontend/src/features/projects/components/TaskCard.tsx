import { Calendar, User, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Task } from '../types';

// Visual config for priority badges
const PRIORITY_CONFIG = {
  low: { label: 'Low', className: 'bg-gray-100 text-gray-600' },
  medium: { label: 'Medium', className: 'bg-yellow-100 text-yellow-700' },
  high: { label: 'High', className: 'bg-orange-100 text-orange-700' },
  critical: { label: 'Critical', className: 'bg-red-100 text-red-700' },
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
    // ✅ Attach column info to each sortable item
    // This is readable via over.data.current.columnId in drag events
    data: {
      type: 'task',
      columnId,    // ← dnd-kit carries this in over.data.current
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
        className={`
          bg-white transition-all group
          ${isDragging
            ? 'shadow-2xl scale-105 rotate-2'
            : 'hover:shadow-md'
          }
        `}
        // ✅ Fix 2: onClick on card body, listeners only on drag handle
        onClick={() => !isSortableDragging && onTaskClick(task)}
      >
        <CardContent className="p-3 space-y-2.5">

          {/* Top row: drag handle + title */}
          <div className="flex items-start gap-2">
            {/* ✅ Fix 2: Visible drag handle — only this area initiates drag */}
            <div
              {...listeners}  // ← drag listeners ONLY on the handle
              className="mt-0.5 shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors"
              aria-label="Drag to reorder"
            >
              <GripVertical className="h-4 w-4" />
            </div>

            {/* Title */}
            <p className="text-sm font-medium leading-snug line-clamp-2 flex-1">
              {task.title}
            </p>
          </div>

          {/* Priority badge */}
          <div className="flex items-center gap-2 pl-6">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priority.className}`}>
              {priority.label}
            </span>
          </div>

          {/* Bottom row */}
          <div className="flex items-center justify-between pl-6">
            {task.dueDate ? (
              <span className={`flex items-center gap-1 text-xs ${
                isOverdue
                  ? 'text-destructive font-medium'
                  : 'text-muted-foreground'
              }`}>
                <Calendar className="h-3 w-3" />
                {formatDate(task.dueDate)}
              </span>
            ) : <span />}

            {task.assignedTo ? (
              <Avatar className="h-6 w-6">
                <AvatarImage src={task.assignedTo.avatar?.url} />
                <AvatarFallback className="text-xs">
                  {task.assignedTo.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ) : (
              <User className="h-4 w-4 text-muted-foreground/40" />
            )}
          </div>

        </CardContent>
      </Card>
    </div>
  );
}