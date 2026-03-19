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
const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'todo', label: 'To Do', color: 'bg-slate-100' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-blue-50' },
  { id: 'done', label: 'Done', color: 'bg-green-50' },
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
  // We compute this in the board and pass down as prop (fixes bug 1)
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
  // Checks both column IDs and task's attached columnId data
  const getTargetColumn = (over: DragEndEvent['over']): TaskStatus | null => {
    if (!over) return null;

    const overId = over.id as string;

    // Dropped directly on a column (empty column case)
    if (COLUMNS.find((c) => c.id === overId)) {
      return overId as TaskStatus;
    }

    // Dropped on a task — read the columnId from the task's sortable data
    // This is what we attached in useSortable({ data: { columnId } })
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

    // ✅ Fix 1: track which column we're over → passed as isOver prop
    setOverColumnId(targetColumn);

    // ✅ Fix 3: move task to new column in local state immediately
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
    setOverColumnId(null); // ← clear column highlight

    if (!over) {
      setLocalTasks([...tasks]); // reset on cancel
      return;
    }

    const taskId       = active.id as string;
    const originalTask = tasks.find((t) => t._id === taskId);
    const localTask    = localTasks.find((t) => t._id === taskId);

    if (!originalTask || !localTask) return;

    // ✅ Fix 4: status already correct in localTasks from dragOver
    // fire mutation only if actually changed
    if (originalTask.status !== localTask.status) {
      updateTask.mutate({
        taskId,
        payload: { status: localTask.status },
      });
    }
    // Do NOT reset localTasks here — keeps card in place (no flicker)
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              columnId={col.id}
              label={col.label}
              colorClass={col.color}
              tasks={kanbanData[col.id]}
              isLoading={isLoading}
              projectId={projectId}
              onAddTask={() => handleAddTask(col.id)}
              onTaskClick={setSelectedTask}
              isOver={overColumnId === col.id} // ✅ Fix 1
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