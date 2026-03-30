import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useUpdateTaskStatusMutation, useVerifyTaskMutation } from '@/features/tasks/api';
import type { ProjectRole, Task, TaskStatus } from '@/features/projects/types';

interface TaskStatusDropdownProps {
  task: Task;
  projectId: string;
  role?: ProjectRole;
  isAssignee: boolean;
  onRequestSubmit: () => void;
}

const MANAGEMENT_ROLES: ProjectRole[] = ['owner', 'project_admin'];

export default function TaskStatusDropdown({
  task,
  projectId,
  role,
  isAssignee,
  onRequestSubmit,
}: TaskStatusDropdownProps) {
  const updateStatusMutation = useUpdateTaskStatusMutation(projectId);
  const verifyTaskMutation = useVerifyTaskMutation(projectId);

  const isManagement = !!role && MANAGEMENT_ROLES.includes(role);
  const isDone = task.status === 'done';
  const isSubmitted = task.status === 'submitted';
  const isBusy = updateStatusMutation.isPending || verifyTaskMutation.isPending;

  const handleStatusChange = async (nextStatus: TaskStatus) => {
    if (nextStatus === task.status) return;

    if (nextStatus === 'submitted') {
      if (!isAssignee || task.status !== 'in_progress') {
        toast.error('Only the assignee can submit an in-progress task');
        return;
      }
      onRequestSubmit();
      return;
    }

    if (nextStatus === 'done') {
      if (!isManagement || !isSubmitted) {
        toast.error('Only admin/owner can approve submitted tasks');
        return;
      }

      try {
        await verifyTaskMutation.mutateAsync({
          taskId: task._id,
          payload: { action: 'approve' },
        });
        toast.success('Task approved');
      } catch (error: any) {
        toast.error(error?.response?.data?.message ?? 'Failed to approve task');
      }
      return;
    }

    try {
      await updateStatusMutation.mutateAsync({
        taskId: task._id,
        status: nextStatus,
      });
      toast.success('Task status updated');
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Failed to update task status');
    }
  };

  return (
    <Select
      value={task.status}
      onValueChange={(value) => void handleStatusChange(value as TaskStatus)}
      disabled={isDone || isBusy}
    >
      <SelectTrigger className="h-8 w-[170px] text-xs">
        <SelectValue placeholder="Set status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="todo">To Do</SelectItem>
        <SelectItem value="in_progress">In Progress</SelectItem>
        <SelectItem value="submitted" disabled={!isAssignee || task.status !== 'in_progress'}>
          Submitted
        </SelectItem>
        <SelectItem value="done" disabled={!isManagement || !isSubmitted}>
          Done (Approve)
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
