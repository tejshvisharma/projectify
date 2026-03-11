import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGetProjectTasksQuery } from '../api';
import type { KanbanData, Task, TaskStatus } from '../types';
import KanbanColumn from './KanbanColumn';
import TaskCreateModal from './TaskCreateModal';
import TaskDetailModal from './TaskDetailModal';

// Column configuration — order and display names
const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'todo', label: 'To Do', color: 'bg-slate-100' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-blue-50' },
  { id: 'done', label: 'Done', color: 'bg-green-50' },
];

interface KanbanBoardProps {
  projectId: string;
}

export default function KanbanBoard({ projectId }: KanbanBoardProps) {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('todo');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const { data: tasks = [], isLoading, error } = useGetProjectTasksQuery(projectId);

  // Group flat tasks array into columns by status
  // useMemo = only re-compute when tasks array changes (performance)
  const kanbanData: KanbanData = useMemo(() => {
    return {
      todo: tasks.filter((t) => t.status === 'todo'),
      in_progress: tasks.filter((t) => t.status === 'in_progress'),
      done: tasks.filter((t) => t.status === 'done'),
    };
  }, [tasks]);

  const handleAddTask = (status: TaskStatus) => {
    setDefaultStatus(status);
    setCreateModalOpen(true);
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
      {/* Board: 3 columns side by side */}
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
          />
        ))}
      </div>

      {/* Create Task Modal */}
      <TaskCreateModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        projectId={projectId}
        defaultStatus={defaultStatus}
      />

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        projectId={projectId}
        onClose={() => setSelectedTask(null)}
      />
    </>
  );
}