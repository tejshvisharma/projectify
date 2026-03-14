import {
  Dialog,
  DialogContent,
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
import { useGetProjectMembersQuery } from '../api';
import { useAuthStore } from '@/stores/auth.store';
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
  if (!task) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const isOverdue =
    task.dueDate &&
    task.status !== 'done' &&
    new Date(task.dueDate) < new Date();

  const status     = STATUS_CONFIG[task.status];
  const priority   = PRIORITY_CONFIG[task.priority];
  const difficulty = DIFFICULTY_CONFIG[task.difficulty];

  const currentUser = useAuthStore((s) => s.user);
  const { data: members = [] } = useGetProjectMembersQuery(projectId);

  const currentMember = members.find((m) => m.user._id === currentUser?._id);
  const canManage = ['owner', 'project_admin'].includes(
  currentMember?.role ?? ''
);

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
            <DialogTitle className="text-xl font-semibold leading-snug">
              {task.title}
            </DialogTitle>
          </div>

          {/* Status + Priority + Difficulty badges row */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${status.className}`}>
              {status.label}
            </span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${priority.className}`}>
              <Flag className="h-3 w-3 inline mr-1" />
              {priority.label}
            </span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${difficulty.className}`}>
              <Zap className="h-3 w-3 inline mr-1" />
              {difficulty.label}
            </span>
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
              <p className="text-sm leading-relaxed text-foreground">
                {task.description || (
                  <span className="text-muted-foreground italic">
                    No description provided
                  </span>
                )}
              </p>
            </div>

            <Separator />

            {/* Attachments placeholder — Block 5 will fill this */}
            <div className="space-y-2">
              <AttachmentsPanel
                projectId={projectId}
                taskId={task._id}
                attachments={task.attachments}
                canManage={canManage}
              />
              
            </div>

            <Separator />

            {/* Comments placeholder */}
            <div className="space-y-2">
              <CommentsPanel
                projectId={projectId}
                taskId={task._id}
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
              {task.assignedTo ? (
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={task.assignedTo.avatar?.url} />
                    <AvatarFallback className="text-xs">
                      {task.assignedTo.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {task.assignedTo.username}
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
                  <AvatarImage src={task.createdBy.avatar?.url} />
                  <AvatarFallback className="text-xs">
                    {task.createdBy.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">
                  {task.createdBy.username}
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
                <span>{formatDate(task.dueDate)}</span>
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
                <span>{task.credits ?? 0} credits</span>
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
                <span>{formatDate(task.createdAt)}</span>
              </div>
            </div>

            <Separator />

            {/* SubTasks placeholder — Block 3 will fill this */}
            <div className="space-y-2">
              <SubTasksPanel
                projectId={projectId}
                taskId={task._id}
              />
            </div>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}