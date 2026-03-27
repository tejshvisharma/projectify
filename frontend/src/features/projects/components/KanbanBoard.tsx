import { useMemo, useState, useCallback  } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { useGetProjectTasksQuery, useUpdateTaskMutation } from '../api';
import type { KanbanData, Task, TaskStatus } from '../types';
import KanbanColumn from './KanbanColumn';
import TaskCreateModal from '@/features/tasks/components/TaskCreateModal';
import TaskDetailModal from './TaskDetailModal';
import TaskCard from './TaskCard';

// Column configuration — order and display names
// Use Tailwind dark: variant classes for theme-aware colors
const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: 'todo', label: 'To Do' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'done', label: 'Done' },
];

interface KanbanBoardProps {
  projectId: string;
  projectEndDate?: string;
}

export default function KanbanBoard({ projectId, projectEndDate }: KanbanBoardProps) {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [defaultStatus, setDefaultStatus]     = useState<TaskStatus>('todo');
  const [selectedTask, setSelectedTask]       = useState<Task | null>(null);
  const [activeTask, setActiveTask]           = useState<Task | null>(null);
  const [localTasks, setLocalTasks]           = useState<Task[]>([]);

  // ── Track which column is currently being dragged over ────────────────────
  const [overColumnId, setOverColumnId]       = useState<TaskStatus | null>(null);

  const { data: tasks = [], isLoading, error } = useGetProjectTasksQuery(projectId);
  const updateTask = useUpdateTaskMutation(projectId);

  const displayTasks = activeTask ? localTasks : tasks;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const kanbanData: KanbanData = useMemo(() => ({
    todo:        displayTasks.filter((t) => t.status === 'todo'),
    in_progress: displayTasks.filter((t) => t.status === 'in_progress'),
    done:        displayTasks.filter((t) => t.status === 'done'),
  }), [displayTasks]);

  // ── Get column ID from a drag event's over object ─────────────────────────
  const getTargetColumn = (over: DragEndEvent['over']): TaskStatus | null => {
    if (!over) return null;

    const overId = over.id as string;

    if (COLUMNS.find((c) => c.id === overId)) {
      return overId as TaskStatus;
    }

    const columnId = over.data?.current?.columnId as TaskStatus | undefined;
    return columnId ?? null;
  };

  // ── Drag Start ─────────────────────────────────────────────────────────────
  const handleDragStart = (event: DragStartEvent) => {
    const dragged = tasks.find((t) => t._id === event.active.id);
    if (!dragged) return;
    setActiveTask(dragged);
    setLocalTasks([...tasks]);
  };

  // ── Drag Over ─────────────────────────────────────────────────────────────
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) {
      setOverColumnId(null);
      return;
    }

    const activeId     = active.id as string;
    const targetColumn = getTargetColumn(over);

    if (!targetColumn) return;

    setOverColumnId(targetColumn);

    const activeTask = localTasks.find((t) => t._id === activeId);
    if (!activeTask) return;
    if (activeTask.status === targetColumn) return;

    setLocalTasks((prev) =>
      prev.map((t) =>
        t._id === activeId
          ? { ...t, status: targetColumn }
          : t
      )
    );
  };

  // ── Drag End ───────────────────────────────────────────────────────────────
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveTask(null);
    setOverColumnId(null);

    if (!over) {
      setLocalTasks([...tasks]);
      return;
    }

    const taskId       = active.id as string;
    const originalTask = tasks.find((t) => t._id === taskId);
    const localTask    = localTasks.find((t) => t._id === taskId);

    if (!originalTask || !localTask) return;

    if (originalTask.status !== localTask.status) {
      updateTask.mutate({
        taskId,
        payload: { status: localTask.status },
      });
    }
  };

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        Failed to load tasks. Please refresh.
      </div>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {/* Responsive grid: 1 column on mobile, 3 columns on md+ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              columnId={col.id}
              label={col.label}
              tasks={kanbanData[col.id]}
              isLoading={isLoading}
              projectId={projectId}
              onAddTask={() => handleAddTask(col.id)}
              onTaskClick={setSelectedTask}
              isOver={overColumnId === col.id}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={{
          duration: 150,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
        }}>
          {activeTask ? (
            <div className="rotate-2 opacity-95">
              <TaskCard
                task={activeTask}
                projectId={projectId}
                onTaskClick={() => {}}
                isDragging
              />
            </div>

          ) : null}
        </DragOverlay>
      </DndContext>

      <TaskCreateModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        projectId={projectId}
        projectEndDate={projectEndDate}
        defaultStatus={defaultStatus}
      />

      <TaskDetailModal
        task={selectedTask}
        projectId={projectId}
        onClose={() => setSelectedTask(null)}
      />
    </>
  );

  function handleAddTask(status: TaskStatus) {
    setDefaultStatus(status);
    setCreateModalOpen(true);
  }
}
