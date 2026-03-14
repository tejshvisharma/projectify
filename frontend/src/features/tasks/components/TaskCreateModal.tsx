import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { AlertCircle, CalendarIcon, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useCreateTaskMutation } from '@/features/projects/api';
import { useGetProjectMembersQuery } from '@/features/projects/api';
import type { TaskStatus, TaskPriority, TaskDifficulty } from '@/features/tasks/types';

interface TaskCreateModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  defaultStatus: TaskStatus;
  projectEndDate?: string;
}

// ── Initial form state ─────────────────────────────────────────────────────────
// Extracted so we can reset easily
const getInitialState = (status: TaskStatus) => ({
  title:       '',
  description: '',
  assignedTo:  '',
  priority:    'medium' as TaskPriority,
  difficulty:  'medium' as TaskDifficulty,
  status,
  credits:     0,
  dueDate:     undefined as Date | undefined,
});

const getErrorMessage = (error: any): string => {
  const data = error.response?.data;
  if (!data) return 'Something went wrong. Please try again.';

  // Your API returns { message: "..." } at the top level
  if (data.message) return data.message;

  // Fallback for unexpected shapes
  return 'Something went wrong. Please try again.';
};

export default function TaskCreateModal({
  open,
  onClose,
  projectId,
  defaultStatus,
  projectEndDate
}: TaskCreateModalProps) {
  const [form, setForm]           = useState(getInitialState(defaultStatus));
  const [errors, setErrors]       = useState<Record<string, string>>({});
  const [dateOpen, setDateOpen]   = useState(false);
    const [serverError, setServerError] = useState('');
  const { data: members = [], isLoading: membersLoading } =
    useGetProjectMembersQuery(projectId);

  const createTask = useCreateTaskMutation(projectId);

  // ── Reset form when defaultStatus changes ─────────────────────────────────
  // Without this, opening "Add task" in Done column still shows Todo status
  useEffect(() => {
    if (open) {
      setForm(getInitialState(defaultStatus));
      setErrors({});
    }
  }, [open, defaultStatus]);

  // ── Field updater helper ───────────────────────────────────────────────────

  const update = <K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Clear error for this field when user starts typing
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: '' }));
    }
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (form.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!form.assignedTo) {
      newErrors.assignedTo = 'Please assign this task to a team member';
    }

    if (form.credits < 0) {
      newErrors.credits = 'Credits cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
  if (!validate()) return;
  setServerError(''); // clear previous server error

  try {
    await createTask.mutateAsync({
      title:       form.title.trim(),
      description: form.description.trim(),
      assignedTo:  form.assignedTo,
      priority:    form.priority,
      difficulty:  form.difficulty,
      status:      form.status,
      credits:     form.credits,
      dueDate:     form.dueDate?.toISOString(),
    });
    onClose();
  } catch (error: any) {
    // Show backend error message directly to user
    setServerError(
      getErrorMessage(error)
    );
  }
};

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="What needs to be done?"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              autoFocus
              className={cn(errors.title && 'border-destructive')}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add more details..."
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => update('status', v as TaskStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select
                value={form.priority}
                onValueChange={(v) => update('priority', v as TaskPriority)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Difficulty + Credits */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Difficulty</Label>
              <Select
                value={form.difficulty}
                onValueChange={(v) => update('difficulty', v as TaskDifficulty)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="credits">Credits</Label>
              <Input
                id="credits"
                type="number"
                min={0}
                placeholder="0"
                value={form.credits}
                onChange={(e) => update('credits', Number(e.target.value))}
                className={cn(errors.credits && 'border-destructive')}
              />
              {errors.credits && (
                <p className="text-xs text-destructive">{errors.credits}</p>
              )}
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-1.5">
            <Label>Due Date</Label>
            <Popover open={dateOpen} onOpenChange={setDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !form.dueDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.dueDate
                    ? format(form.dueDate, 'PPP') // "Dec 24, 2025"
                    : 'Pick a due date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                mode="single"
                selected={form.dueDate}
                onSelect={(date) => {
                    update('dueDate', date);
                    setDateOpen(false);
                }}
                disabled={(date) => {
                    const today = new Date(new Date().setHours(0, 0, 0, 0));
                    const isBeforeToday = date < today;

                    // Also disable dates after project end date
                    const isAfterProjectEnd = projectEndDate
                    ? date > new Date(projectEndDate)
                    : false;

                    return isBeforeToday || isAfterProjectEnd;
                }}
                initialFocus
                />
                {/* Clear date option */}
                {form.dueDate && (
                  <div className="p-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => {
                        update('dueDate', undefined);
                        setDateOpen(false);
                      }}
                    >
                      Clear date
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>

          {/* Assign To */}
          <div className="space-y-1.5">
            <Label>
              Assign To <span className="text-destructive">*</span>
            </Label>
            {membersLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground h-10 px-3 border rounded-md">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading members...
              </div>
            ) : (
              <Select
                value={form.assignedTo}
                onValueChange={(v) => update('assignedTo', v)}
              >
                <SelectTrigger
                  className={cn(errors.assignedTo && 'border-destructive')}
                >
                  <SelectValue placeholder="Select a team member" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem
                      key={member._id}
                      value={member.user._id}
                    >
                      {/* Avatar + username in dropdown */}
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={member.user.avatar?.url} />
                          <AvatarFallback className="text-xs">
                            {member.user.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{member.user.username}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors.assignedTo && (
              <p className="text-xs text-destructive">{errors.assignedTo}</p>
            )}
          </div>

        </div>

        {serverError && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
            <p className="text-sm text-destructive">{serverError}</p>
        </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={createTask.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createTask.isPending}
          >
            {createTask.isPending ? (
              <>
                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Task'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}