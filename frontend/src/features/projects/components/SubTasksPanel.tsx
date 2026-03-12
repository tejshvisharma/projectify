import { useState, useRef } from 'react';
import { Loader2, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useGetSubTasksQuery,
  useCreateSubTaskMutation,
  useUpdateSubTaskMutation,
  useDeleteSubTaskMutation,
} from '../api';

interface SubTasksPanelProps {
  projectId: string;
  taskId: string;
}

export default function SubTasksPanel({ projectId, taskId }: SubTasksPanelProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: subtasks = [], isLoading } = useGetSubTasksQuery(projectId, taskId);
  const createSubTask = useCreateSubTaskMutation(projectId, taskId);
  const updateSubTask = useUpdateSubTaskMutation(projectId, taskId);
  const deleteSubTask = useDeleteSubTaskMutation(projectId, taskId);

  // ── Progress calculation ──────────────────────────────────────────────────
  // Shows "2 of 5 completed" and a progress bar
  const completedCount = subtasks.filter((s) => s.isCompleted).length;
  const totalCount = subtasks.length;
  const progressPercent = totalCount > 0
    ? Math.round((completedCount / totalCount) * 100)
    : 0;

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleStartAdding = () => {
    setIsAdding(true);
    // Focus the input after React renders it
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleCreate = async () => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;

    await createSubTask.mutateAsync({ title: trimmed });
    setNewTitle('');
    setIsAdding(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCreate();       // Enter = save
    if (e.key === 'Escape') {                    // Escape = cancel
      setIsAdding(false);
      setNewTitle('');
    }
  };

  const handleToggle = (subTaskId: string, currentValue: boolean) => {
    updateSubTask.mutate({
      subTaskId,
      isCompleted: !currentValue, // flip the boolean
    });
  };

  const handleDelete = (subTaskId: string) => {
    deleteSubTask.mutate(subTaskId);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3">

      {/* Header row with progress count */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Subtasks
        </p>
        {totalCount > 0 && (
          <span className="text-xs text-muted-foreground">
            {completedCount}/{totalCount}
          </span>
        )}
      </div>

      {/* Progress bar — only shows when there are subtasks */}
      {totalCount > 0 && (
        <div className="w-full bg-muted rounded-full h-1.5">
          <div
            className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Loading skeletons */}
      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full rounded" />
          ))}
        </div>
      )}

      {/* Subtask list */}
      {!isLoading && (
        <div className="space-y-1">
          {subtasks.map((subtask) => (
            <div
              key={subtask._id}
              className="flex items-center gap-2 group rounded-md px-1 py-1 hover:bg-muted/50 transition-colors"
            >
              {/* Toggle checkbox button */}
              <button
                onClick={() => handleToggle(subtask._id, subtask.isCompleted)}
                disabled={updateSubTask.isPending}
                className="shrink-0 text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
              >
                {subtask.isCompleted ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
              </button>

              {/* Subtask title — strikethrough when completed */}
              <span className={`flex-1 text-sm leading-snug ${
                subtask.isCompleted
                  ? 'line-through text-muted-foreground'
                  : 'text-foreground'
              }`}>
                {subtask.title}
              </span>

              {/* Delete button — only visible on hover */}
              <button
                onClick={() => handleDelete(subtask._id)}
                disabled={deleteSubTask.isPending}
                className="shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Inline add input — appears when isAdding is true */}
      {isAdding && (
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Subtask title..."
            className="h-8 text-sm"
          />
          <Button
            size="sm"
            className="h-8 px-3"
            onClick={handleCreate}
            disabled={!newTitle.trim() || createSubTask.isPending}
          >
            {createSubTask.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              'Add'
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-3"
            onClick={() => {
              setIsAdding(false);
              setNewTitle('');
            }}
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Add subtask button — hidden while input is open */}
      {!isAdding && (
        <button
          onClick={handleStartAdding}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-full py-1"
        >
          <Plus className="h-3.5 w-3.5" />
          Add subtask
        </button>
      )}
    </div>
  );
}