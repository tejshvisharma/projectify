import { useMemo, useState, useCallback  } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  pointerWithin,
  type CollisionDetection,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { useGetProjectMembersQuery, useGetProjectTasksQuery } from '../api';
import type { KanbanData, ProjectRole, Task, TaskStatus } from '../types';
import KanbanColumn from './KanbanColumn';
import TaskCreateModal from '@/features/tasks/components/TaskCreateModal';
import TaskDetailModal from './TaskDetailModal';
import TaskCard from './TaskCard';
import SubmitTaskModal from '@/features/tasks/components/SubmitTaskModal';
import {
  useUpdateTaskStatusMutation,
  useVerifyTaskMutation,
} from '@/features/tasks/api';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';

// Column configuration — order and display names
// Use Tailwind dark: variant classes for theme-aware colors
const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: 'todo', label: 'To Do' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'submitted', label: 'Submitted' },
  { id: 'done', label: 'Done' },
];

const MANAGEMENT_ROLES: ProjectRole[] = ['owner', 'project_admin'];

const collisionDetectionStrategy: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);

  // Prefer column hits first so empty columns are valid drop zones.
  const columnCollisions = pointerCollisions.filter((collision) => {
    const container = args.droppableContainers.find((d) => d.id === collision.id);
    return container?.data.current?.type === 'column';
  });

  if (columnCollisions.length > 0) {
    return columnCollisions;
  }

  if (pointerCollisions.length > 0) {
    return pointerCollisions;
  }

  return closestCorners(args);
};

interface KanbanBoardProps {
  projectId: string;
  projectEndDate?: string;
}

export default function KanbanBoard({ projectId, projectEndDate }: KanbanBoardProps) {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [defaultStatus, setDefaultStatus]     = useState<TaskStatus>('todo');
  const [selectedTask, setSelectedTask]       = useState<Task | null>(null);
  const [dragSubmitTask, setDragSubmitTask]   = useState<Task | null>(null);
  const [activeTask, setActiveTask]           = useState<Task | null>(null);
  const [localTasks, setLocalTasks]           = useState<Task[]>([]);

  // ── Track which column is currently being dragged over ────────────────────
  const [overColumnId, setOverColumnId]       = useState<TaskStatus | null>(null);

  const { data: tasks = [], isLoading, error } = useGetProjectTasksQuery(projectId);
  const { data: members = [] } = useGetProjectMembersQuery(projectId);
  const currentUser = useAuthStore((state) => state.user);
  const updateTaskStatusMutation = useUpdateTaskStatusMutation(projectId);
  const verifyTaskMutation = useVerifyTaskMutation(projectId);

  const currentMember = members.find((member) => member.user._id === currentUser?._id);
  const currentRole = currentMember?.role;
  const isManagement = !!currentRole && MANAGEMENT_ROLES.includes(currentRole);

  const displayTasks = activeTask ? localTasks : tasks;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const kanbanData: KanbanData = useMemo(() => ({
    todo:        displayTasks.filter((t) => t.status === 'todo'),
    in_progress: displayTasks.filter((t) => t.status === 'in_progress'),
    submitted:   displayTasks.filter((t) => t.status === 'submitted'),
    done:        displayTasks.filter((t) => t.status === 'done'),
  }), [displayTasks]);

  const canTransitionByDrag = useCallback((task: Task, target: TaskStatus) => {
    if (task.status === target) return true;
    if (task.status === 'done') return false;

    if (target === 'submitted') {
      return task.status === 'in_progress' && task.assignedTo?._id === currentUser?._id;
    }

    if (task.status === 'submitted') {
      return isManagement && target === 'done';
    }

    if (target === 'done') {
      return false;
    }

    return true;
  }, [currentUser?._id, isManagement]);

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
    if (!canTransitionByDrag(activeTask, targetColumn)) return;
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
  const handleDragEnd = async (event: DragEndEvent) => {
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

    if (originalTask.status === localTask.status) {
      return;
    }

    if (!canTransitionByDrag(originalTask, localTask.status)) {
      setLocalTasks([...tasks]);
      if (localTask.status === 'submitted') {
        toast.error('Only the assignee can submit this task');
      } else {
        toast.error('This move is not allowed');
      }
      return;
    }

    try {
      if (originalTask.status === 'in_progress' && localTask.status === 'submitted') {
        setLocalTasks([...tasks]);
        setDragSubmitTask(originalTask);
        toast.info('Add submission details to continue');
        return;
      }

      if (originalTask.status === 'submitted' && localTask.status === 'done') {
        await verifyTaskMutation.mutateAsync({
          taskId,
          payload: { action: 'approve' },
        });
        toast.success('Task approved');
        return;
      }

      await updateTaskStatusMutation.mutateAsync({
        taskId,
        status: localTask.status,
      });
      toast.success('Task status updated');
    } catch (dragError: any) {
      setLocalTasks([...tasks]);
      toast.error(dragError?.response?.data?.message ?? 'Unable to update task status');
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
        collisionDetection={collisionDetectionStrategy}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {/* Responsive grid: 1 column on mobile, 4 columns on lg+ */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
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
              currentRole={currentRole}
              currentUserId={currentUser?._id}
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
                currentRole={currentRole}
                currentUserId={currentUser?._id}
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

      {dragSubmitTask && (
        <SubmitTaskModal
          open={!!dragSubmitTask}
          onOpenChange={(open) => {
            if (!open) setDragSubmitTask(null);
          }}
          projectId={projectId}
          taskId={dragSubmitTask._id}
          taskTitle={dragSubmitTask.title}
        />
      )}
    </>
  );

  function handleAddTask(status: TaskStatus) {
    setDefaultStatus(status);
    setCreateModalOpen(true);
  }
}
