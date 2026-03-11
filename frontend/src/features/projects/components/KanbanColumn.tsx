import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Task, TaskStatus } from '../types';
import TaskCard from './TaskCard';

interface KanbanColumnProps {
  columnId: TaskStatus;
  label: string;
  colorClass: string;
  tasks: Task[];
  isLoading: boolean;
  projectId: string;
  onAddTask: () => void;
  onTaskClick: (task: Task) => void;
}

export default function KanbanColumn({
  columnId,
  label,
  colorClass,
  tasks,
  isLoading,
  projectId,
  onAddTask,
  onTaskClick,
}: KanbanColumnProps) {
  return (
    <div className={`rounded-xl p-4 space-y-3 min-h-[400px] ${colorClass}`}>
      {/* Column header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">{label}</h3>
          <Badge variant="secondary" className="text-xs">
            {isLoading ? '—' : tasks.length}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onAddTask}
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

      {/* Task cards */}
      {!isLoading && tasks.map((task) => (
        <TaskCard
          key={task._id}
          task={task}
          projectId={projectId}
          onTaskClick={onTaskClick}
        />
      ))}

      {/* Empty column hint */}
      {!isLoading && tasks.length === 0 && (
        <button
          onClick={onAddTask}
          className="w-full h-16 rounded-lg border-2 border-dashed border-muted-foreground/20 text-xs text-muted-foreground hover:border-muted-foreground/40 hover:text-muted-foreground transition-colors flex items-center justify-center gap-1"
        >
          <Plus className="h-3 w-3" />
          Add a task
        </button>
      )}
    </div>
  );
}