import { useState, type MouseEvent } from 'react';
import { Calendar, User, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { ProjectRole, Task, TaskStatus } from '../types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import SubmitTaskModal from '@/features/tasks/components/SubmitTaskModal';
import {
  useUpdateTaskStatusMutation,
  useVerifyTaskMutation,
} from '@/features/tasks/api';

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

const STATUS_CONFIG: Record<TaskStatus, { label: string; className: string }> = {
  todo: {
    label: 'To Do',
    className: 'border-border text-muted-foreground bg-muted/50',
  },
  in_progress: {
    label: 'In Progress',
    className: 'border-blue-200 text-blue-700 bg-blue-100/70 dark:border-blue-900 dark:text-blue-300 dark:bg-blue-950/40',
  },
  submitted: {
    label: 'Submitted',
    className: 'border-amber-200 text-amber-700 bg-amber-100/80 dark:border-amber-900 dark:text-amber-300 dark:bg-amber-950/40',
  },
  done: {
    label: 'Approved',
    className: 'border-emerald-200 text-emerald-700 bg-emerald-100/80 dark:border-emerald-900 dark:text-emerald-300 dark:bg-emerald-950/40',
  },
};

interface TaskCardProps {
  task: Task;
  projectId: string;
  onTaskClick: (task: Task) => void;
  isDragging?: boolean;
  columnId?: TaskStatus;
  currentRole?: ProjectRole;
  currentUserId?: string;
}

const MANAGEMENT_ROLES: ProjectRole[] = ['owner', 'project_admin'];

export default function TaskCard({
  task,
  projectId,
  onTaskClick,
  isDragging = false,
  columnId,
  currentRole,
  currentUserId,
}: TaskCardProps) {
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const updateTaskStatusMutation = useUpdateTaskStatusMutation(projectId);
  const verifyTaskMutation = useVerifyTaskMutation(projectId);

  const {
    attributes, listeners, setNodeRef,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task._id,
    data: {
      type: 'task',
      columnId,
    },
  });

  const priority = PRIORITY_CONFIG[task.priority];
  const isManagement = !!currentRole && MANAGEMENT_ROLES.includes(currentRole);
  const isAssignee = task.assignedTo?._id === currentUserId;
  const isDone = task.status === 'done';
  const canStartTask = isAssignee && task.status === 'todo';
  const canSubmitTask = isAssignee && task.status === 'in_progress';
  const canReviewTask = isManagement && task.status === 'submitted';
  const showRejected = task.verification?.status === 'rejected';
  const submittedAt = task.submission?.submittedAt;
  const statusBadge = showRejected
    ? {
        label: 'Changes Requested',
        className:
          'border-red-200 text-red-700 bg-red-100/80 dark:border-red-900 dark:text-red-300 dark:bg-red-950/40',
      }
    : STATUS_CONFIG[task.status];

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

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const handleStartTask = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    try {
      await updateTaskStatusMutation.mutateAsync({
        taskId: task._id,
        status: 'in_progress',
      });
      toast.success('Task moved to in progress');
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Unable to update task status');
    }
  };

  const handleApprove = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    try {
      await verifyTaskMutation.mutateAsync({
        taskId: task._id,
        payload: { action: 'approve' },
      });
      toast.success('Task approved');
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Unable to approve task');
    }
  };

  const handleReject = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    const reason = rejectReason.trim();
    if (!reason) {
      toast.error('Rejection reason is required');
      return;
    }

    try {
      await verifyTaskMutation.mutateAsync({
        taskId: task._id,
        payload: { action: 'reject', reason },
      });
      toast.success('Task rejected');
      setRejectModalOpen(false);
      setRejectReason('');
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Unable to reject task');
    }
  };

  return (
    <>
      <div
        ref={setNodeRef}
        {...attributes}
        className={cn('w-full transition-opacity duration-150', isSortableDragging ? 'opacity-0' : 'opacity-100')}
      >
        <Card
          className={cn(
            'w-full rounded-lg border border-border bg-card shadow-sm',
            'transition-all group',
            isDragging
              ? 'shadow-2xl ring-1 ring-primary/25'
              : 'hover:shadow-md'
          )}
          onClick={() => !isSortableDragging && onTaskClick(task)}
        >
          <CardContent className="w-full p-3">

            {/* Header */}
            <div className="flex items-start gap-2">
              {/* Drag handle */}
              <div
                {...listeners}
                className={cn(
                  'mt-0.5 shrink-0 cursor-grab active:cursor-grabbing touch-none',
                  'text-muted-foreground/50 hover:text-foreground/70',
                  'transition-colors'
                )}
                aria-label="Drag to reorder"
              >
                <GripVertical className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold leading-snug line-clamp-2 text-foreground">
                    {task.title}
                  </p>
                  <Badge variant="outline" className={cn('shrink-0 text-[10px] font-medium', statusBadge.className)}>
                    {statusBadge.label}
                  </Badge>
                </div>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', priority.className)}>
                    {priority.label}
                  </span>

                  {task.dueDate && (
                    <span className={cn(
                      'inline-flex items-center gap-1',
                      isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'
                    )}>
                      <Calendar className="h-3 w-3" />
                      {formatDate(task.dueDate)}
                    </span>
                  )}

                  {task.assignedTo ? (
                    <span className="inline-flex items-center gap-1">
                      <Avatar className="h-4 w-4">
                        <AvatarImage src={task.assignedTo.avatar?.url} />
                        <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
                          {task.assignedTo.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="max-w-[90px] truncate">{task.assignedTo.username}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Unassigned
                    </span>
                  )}
                </div>

                {(task.submission?.comment || submittedAt) && (
                  <div className="space-y-1">
                    {task.submission?.comment && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {task.submission.comment}
                      </p>
                    )}
                    {submittedAt && (
                      <p className="text-[11px] text-muted-foreground">
                        Submitted {formatDateTime(submittedAt)}
                      </p>
                    )}
                  </div>
                )}

                {task.rejection?.reason && (
                  <p className="text-xs text-red-700 dark:text-red-300 line-clamp-2">
                    Rejection: {task.rejection.reason}
                  </p>
                )}

                {/* Actions */}
                <div className="pt-1 flex flex-wrap items-center justify-end gap-2" onClick={(event) => event.stopPropagation()}>
                  {canStartTask && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      onClick={handleStartTask}
                      disabled={updateTaskStatusMutation.isPending || isDone}
                    >
                      Start Task
                    </Button>
                  )}

                  {canSubmitTask && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      onClick={(event) => {
                        event.stopPropagation();
                        setSubmitModalOpen(true);
                      }}
                      disabled={isDone}
                    >
                      Submit Task
                    </Button>
                  )}

                  {canReviewTask && (
                    <>
                      <Button
                        size="sm"
                        className="h-8"
                        onClick={handleApprove}
                        disabled={verifyTaskMutation.isPending}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-8"
                        onClick={handleReject}
                        disabled={verifyTaskMutation.isPending}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

          </CardContent>

        </Card>
      </div>

      <SubmitTaskModal
        open={submitModalOpen}
        onOpenChange={setSubmitModalOpen}
        projectId={projectId}
        taskId={task._id}
        taskTitle={task.title}
      />

      <Dialog
        open={rejectModalOpen}
        onOpenChange={(open) => {
          setRejectModalOpen(open);
          if (!open) setRejectReason('');
        }}
      >
        <DialogContent onClick={(event) => event.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Reject Task Submission</DialogTitle>
            <DialogDescription>
              Provide clear feedback so the assignee can update the work.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor={`reject-reason-${task._id}`}>Reason</Label>
            <Textarea
              id={`reject-reason-${task._id}`}
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              placeholder="Explain what still needs to be improved"
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmReject}
              disabled={verifyTaskMutation.isPending || rejectReason.trim().length === 0}
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
