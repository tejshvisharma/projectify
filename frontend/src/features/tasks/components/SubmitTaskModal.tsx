import { useMemo, useState, type ChangeEvent } from 'react';
import { Loader2, Paperclip, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useSubmitTaskMutation } from '@/features/tasks/api';

interface SubmitTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  taskId: string;
  taskTitle: string;
}

export default function SubmitTaskModal({
  open,
  onOpenChange,
  projectId,
  taskId,
  taskTitle,
}: SubmitTaskModalProps) {
  const [comment, setComment] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);

  const submitTaskMutation = useSubmitTaskMutation(projectId);

  const canSubmit = useMemo(() => comment.trim().length > 0, [comment]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFiles = Array.from(event.target.files ?? []);
    setAttachments(nextFiles);
  };

  const removeFile = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const resetState = () => {
    setComment('');
    setAttachments([]);
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetState();
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      toast.error('Please add a submission comment');
      return;
    }

    try {
      await submitTaskMutation.mutateAsync({
        taskId,
        data: {
          comment: comment.trim(),
          attachments,
        },
      });

      toast.success('Task submitted');
      handleClose(false);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ?? 'Failed to submit task. Please try again.';
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Submit Task for Review</DialogTitle>
          <DialogDescription>
            Share what you completed for {taskTitle} so admins can review your work.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="submission-comment">Comment</Label>
            <Textarea
              id="submission-comment"
              placeholder="Summarize what was implemented and any important notes"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={5}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="submission-attachments">Attachments (optional)</Label>
            <Input
              id="submission-attachments"
              type="file"
              multiple
              onChange={handleFileChange}
            />

            {attachments.length > 0 && (
              <div className="space-y-2 rounded-md border p-3">
                {attachments.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
                      <Paperclip className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{file.name}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={submitTaskMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || submitTaskMutation.isPending}
          >
            {submitTaskMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Task'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
