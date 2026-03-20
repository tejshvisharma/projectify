import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, X, Plus, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useCreateProjectMutation } from '../api';

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateProjectModal({
  open,
  onClose,
}: CreateProjectModalProps) {
  // ── Form state ─────────────────────────────────────────────────────────────
  const [name, setName]             = useState('');
  const [description, setDescription] = useState('');
  const [endDate, setEndDate]       = useState<Date | undefined>(undefined);
  const [githubRepo, setGithubRepo] = useState('');
  const [tagInput, setTagInput]     = useState('');
  const [tags, setTags]             = useState<string[]>([]);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const createProject = useCreateProjectMutation();

  // ── Tag handlers ───────────────────────────────────────────────────────────

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    // Don't add empty, duplicate, or more than 10 tags
    if (!trimmed || tags.includes(trimmed) || tags.length >= 10) return;
    setTags((prev) => [...prev, trimmed]);
    setTagInput('');
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    // Enter or comma adds a tag
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!name.trim()) return;

    await createProject.mutateAsync({
      name: name.trim(),
      description: description.trim() || undefined,
      endDate: endDate?.toISOString(),
      githubRepo: githubRepo.trim() || undefined,
      tags,
    });

    handleClose();
  };

  // ── Reset form on close ────────────────────────────────────────────────────

  const handleClose = () => {
    setName('');
    setDescription('');
    setEndDate(undefined);
    setGithubRepo('');
    setTagInput('');
    setTags([]);
    onClose();
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Fill in the details below to create your project.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">

          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="project-name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="project-name"
              placeholder="My Awesome Project"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="project-description">Description</Label>
            <Textarea
              id="project-description"
              placeholder="What is this project about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Due Date + GitHub — side by side */}
          <div className="grid grid-cols-2 gap-4">

            {/* Due Date — Calendar Popover */}
            <div className="space-y-1.5">
              <Label>Due Date</Label>
              <Popover
                open={datePickerOpen}
                onOpenChange={setDatePickerOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !endDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate
                      ? format(endDate, 'MMM dd, yyyy')
                      : 'Pick a date'
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => {
                      setEndDate(date);
                      setDatePickerOpen(false); // close on select
                    }}
                    // Disable past dates
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* GitHub Repo */}
            <div className="space-y-1.5">
              <Label htmlFor="github-repo">GitHub Repo</Label>
              <Input
                id="github-repo"
                placeholder="https://github.com/..."
                value={githubRepo}
                onChange={(e) => setGithubRepo(e.target.value)}
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <Label htmlFor="project-tags">
              Tags
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                Press Enter or comma to add
              </span>
            </Label>

            {/* Tag chips */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      aria-label={`Remove tag ${tag}`}
                      className="hover:text-destructive transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Tag input */}
            <div className="flex gap-2">
              <Input
                id="project-tags"
                placeholder="react, nodejs, typescript..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                disabled={tags.length >= 10}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddTag}
                disabled={!tagInput.trim() || tags.length >= 10}
                aria-label="Add tag"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {tags.length >= 10 && (
              <p className="text-xs text-muted-foreground">
                Maximum 10 tags reached
              </p>
            )}
          </div>

        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={createProject.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || createProject.isPending}
          >
            {createProject.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Project'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}