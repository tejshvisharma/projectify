import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  User,
  Flag,
  Zap,
  Star,
  Clock,
} from 'lucide-react';
import type { Task } from '../types';
import SubTasksPanel from './SubTasksPanel';
import CommentsPanel from '@/features/comments/components/CommentsPanel';
import AttachmentsPanel from '@/features/tasks/components/AttachmentsPanel';
import { useGetProjectMembersQuery, useTaskFromCache } from '../api';
import { useAuthStore } from '@/stores/auth.store';
import { EditableText } from '@/components/ui/editable-text';
import EditableSelect from '@/components/ui/editable-select';
import { useUpdateTaskMutation } from '@/features/projects/api';
// ─── Visual config maps ────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  todo:        { label: 'To Do',       className: 'bg-slate-100 text-slate-700'  },
  in_progress: { label: 'In Progress', className: 'bg-blue-100 text-blue-700'    },
  done:        { label: 'Done',        className: 'bg-green-100 text-green-700'  },
};

const PRIORITY_CONFIG = {
  low:      { label: 'Low',      className: 'bg-gray-100 text-gray-600'    },
  medium:   { label: 'Medium',   className: 'bg-yellow-100 text-yellow-700' },
  high:     { label: 'High',     className: 'bg-orange-100 text-orange-700' },
  critical: { label: 'Critical', className: 'bg-red-100 text-red-700'      },
};

const DIFFICULTY_CONFIG = {
  easy:   { label: 'Easy',   className: 'bg-emerald-100 text-emerald-700' },
  medium: { label: 'Medium', className: 'bg-yellow-100 text-yellow-700'   },
  hard:   { label: 'Hard',   className: 'bg-orange-100 text-orange-700'   },
  expert: { label: 'Expert', className: 'bg-red-100 text-red-700'         },
};
// OPTIONS CONFIG :──────────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: 'todo',        label: 'To Do',       className: 'bg-slate-100 text-slate-700'   },
  { value: 'in_progress', label: 'In Progress',  className: 'bg-blue-100 text-blue-700'    },
  { value: 'done',        label: 'Done',         className: 'bg-green-100 text-green-700'  },
];

const PRIORITY_OPTIONS = [
  { value: 'low',      label: 'Low',      className: 'bg-gray-100 text-gray-600'    },
  { value: 'medium',   label: 'Medium',   className: 'bg-yellow-100 text-yellow-700' },
  { value: 'high',     label: 'High',     className: 'bg-orange-100 text-orange-700' },
  { value: 'critical', label: 'Critical', className: 'bg-red-100 text-red-700'      },
];

const DIFFICULTY_OPTIONS = [
  { value: 'easy',   label: 'Easy',   className: 'bg-emerald-100 text-emerald-700' },
  { value: 'medium', label: 'Medium', className: 'bg-yellow-100 text-yellow-700'   },
  { value: 'hard',   label: 'Hard',   className: 'bg-orange-100 text-orange-700'   },
  { value: 'expert', label: 'Expert', className: 'bg-red-100 text-red-700'         },
];

interface TaskDetailModalProps {
  task: Task | null;
  projectId: string;
  onClose: () => void;
}

export default function TaskDetailModal({
  task,
  projectId,
  onClose,
}: TaskDetailModalProps) {

  const updateTask             = useUpdateTaskMutation(projectId);
  const currentUser            = useAuthStore((s) => s.user);
  const { data: members = [] } = useGetProjectMembersQuery(projectId);
  const { data: liveTask }     = useTaskFromCache(projectId, task?._id ?? '');

  const currentTask   = liveTask ?? task;
  const currentMember = members.find((m) => m.user._id === currentUser?._id);
  const canManage     = ['owner', 'project_admin'].includes(
    currentMember?.role ?? ''
  );

  if (!currentTask) return null;

  const handleFieldUpdate = (field: string, value: string) => {
    updateTask.mutate({
      taskId: currentTask._id,
      payload: { [field]: value },
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const isOverdue =
    currentTask.dueDate &&
    currentTask.status !== 'done' &&
    new Date(currentTask.dueDate) < new Date();

  const status     = STATUS_CONFIG[currentTask.status];
  const priority   = PRIORITY_CONFIG[currentTask.priority];
  const difficulty = DIFFICULTY_CONFIG[currentTask.difficulty];


  return (
    <Dialog open={!!task} onOpenChange={onClose}>
      {/*
        max-w-4xl  → wide enough for two panels
        p-0        → we control padding ourselves per panel
        overflow-hidden → keeps rounded corners clean
      */}
      <DialogContent className="max-w-4xl p-0 overflow-hidden gap-0">

        {/* ── Modal Header (spans full width) ─────────────────────────────── */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-start gap-3 pr-8">
            {/* pr-8 stops title overlapping the X close button */}
            <DialogTitle className="text-xl font-semibold leading-snug pr-8">
              <EditableText
               value={currentTask.title}
              onSave={(val: string) => handleFieldUpdate('title', val)}
               className="text-xl font-semibold leading-snug"
               disabled={!canManage}
              />
            </DialogTitle>
            <DialogDescription className="sr-only">
              Task details for {currentTask.title}
            </DialogDescription>
          </div>

          {/* Status + Priority + Difficulty badges row */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <EditableSelect
              value={currentTask.status}
              options={STATUS_OPTIONS}
              onSave={(val) => handleFieldUpdate('status', val)}
              disabled={!canManage}
            />
            <Flag className="h-3 w-3 inline mr-1" />
            <EditableSelect
              value={currentTask.priority}
              options={PRIORITY_OPTIONS}
              onSave={(val) => handleFieldUpdate('priority', val)}
              disabled={!canManage}
            />
            <Zap className="h-3 w-3 inline mr-1" />
            <EditableSelect
              value={currentTask.difficulty}
              options={DIFFICULTY_OPTIONS}
              onSave={(val) => handleFieldUpdate('difficulty', val)}
              disabled={!canManage}
            />
</div>
        </DialogHeader>

        {/*
          ── Two Panel Body ───────────────────────────────────────────────────
          flex row → left panel + right panel side by side
          max-h-[70vh] + overflow-y-auto → panels scroll independently
        */}
        <div className="flex divide-x divide-border">

          {/* ── LEFT PANEL (main content) ──────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto max-h-[70vh] p-6 space-y-6">

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Description
              </h3>
              <EditableText
                value={currentTask.description ?? ''}
                onSave={(val: string) => handleFieldUpdate('description', val)}
                placeholder="Click to add a description..."
                multiline={true}
                className="text-sm leading-relaxed"
                disabled={!canManage}
              />
            </div>

            <Separator />

            {/* Attachments placeholder — Block 5 will fill this */}
            <div className="space-y-2">
              <AttachmentsPanel
                projectId={projectId}
                taskId={currentTask._id}
                attachments={currentTask.attachments}
                canManage={canManage}
              />
              
            </div>

            <Separator />

            {/* Comments placeholder */}
            <div className="space-y-2">
              <CommentsPanel
                projectId={projectId}
                taskId={currentTask._id}
              />
            </div>

          </div>

          {/* ── RIGHT PANEL (metadata sidebar) ─────────────────────────────── */}
          <div className="w-72 shrink-0 overflow-y-auto max-h-[70vh] p-5 space-y-5 bg-muted/30">

            {/* Assignee */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Assignee
              </p>
              {currentTask.assignedTo ? (
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={currentTask.assignedTo.avatar?.url} />
                    <AvatarFallback className="text-xs">
                      {currentTask.assignedTo.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {currentTask.assignedTo.username}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span className="text-sm">Unassigned</span>
                </div>
              )}
            </div>

            <Separator />

            {/* Created By */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Created By
              </p>
              <div className="flex items-center gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={currentTask.createdBy.avatar?.url} />
                  <AvatarFallback className="text-xs">
                    {currentTask.createdBy.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">
                  {currentTask.createdBy.username}
                </span>
              </div>
            </div>

            <Separator />

            {/* Due Date */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Due Date
              </p>
              <div className={`flex items-center gap-2 text-sm ${
                isOverdue ? 'text-destructive font-medium' : 'text-foreground'
              }`}>
                <Calendar className="h-4 w-4" />
                <span>{formatDate(currentTask.dueDate)}</span>
                {isOverdue && (
                  <span className="text-xs bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-full">
                    Overdue
                  </span>
                )}
              </div>
            </div>

            <Separator />

            {/* Credits */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Credits
              </p>
              <div className="flex items-center gap-2 text-sm">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>{currentTask.credits ?? 0} credits</span>
              </div>
            </div>

            <Separator />

            {/* Created At */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Created
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{formatDate(currentTask.createdAt)}</span>
              </div>
            </div>

            <Separator />

            {/* SubTasks placeholder — Block 3 will fill this */}
            <div className="space-y-2">
              <SubTasksPanel
                projectId={projectId}
                taskId={currentTask._id}
              />
            </div>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}