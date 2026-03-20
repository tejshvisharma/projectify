import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, X, Plus, Loader2 } from 'lucide-react';
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
import { useUpdateProjectMutation } from '../api';
import type { Project } from '../types';

interface EditProjectFormProps {
  project: Project;
}

export default function EditProjectForm({ project }: EditProjectFormProps) {
  const [name, setName]               = useState(project.name);
  const [description, setDescription] = useState(project.description ?? '');
  const [endDate, setEndDate]         = useState<Date | undefined>(
    project.endDate ? new Date(project.endDate) : undefined
  );
  const [githubRepo, setGithubRepo]   = useState(project.githubRepo ?? '');
  const [tagInput, setTagInput]       = useState('');
  const [tags, setTags]               = useState<string[]>(project.tags);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const updateProject = useUpdateProjectMutation(project._id);

  // Sync if project prop changes
  useEffect(() => {
    setName(project.name);
    setDescription(project.description ?? '');
    setEndDate(project.endDate ? new Date(project.endDate) : undefined);
    setGithubRepo(project.githubRepo ?? '');
    setTags(project.tags);
  }, [project]);

  // ── Tag handlers ───────────────────────────────────────────────────────────
  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (!trimmed || tags.includes(trimmed) || tags.length >= 10) return;
    setTags((prev) => [...prev, trimmed]);
    setTagInput('');
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSave = () => {
    if (!name.trim()) return;
    updateProject.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
      endDate: endDate?.toISOString(),
      githubRepo: githubRepo.trim() || undefined,
      tags,
    });
  };

  // Check if anything actually changed
  const isDirty =
    name !== project.name ||
    description !== (project.description ?? '') ||
    endDate?.toISOString() !== project.endDate ||
    githubRepo !== (project.githubRepo ?? '') ||
    JSON.stringify(tags) !== JSON.stringify(project.tags);

  return (
    <div className="space-y-5">

      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="edit-name">
          Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="edit-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="edit-description">Description</Label>
        <Textarea
          id="edit-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="resize-none"
        />
      </div>

      {/* Due Date + GitHub */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Due Date</Label>
          <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !endDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, 'MMM dd, yyyy') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => {
                  setEndDate(date);
                  setDatePickerOpen(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="edit-github">GitHub Repo</Label>
          <Input
            id="edit-github"
            value={githubRepo}
            onChange={(e) => setGithubRepo(e.target.value)}
            placeholder="https://github.com/..."
          />
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-1.5">
        <Label>Tags</Label>
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
        <div className="flex gap-2">
          <Input
            placeholder="Add a tag..."
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
      </div>

      {/* Save button */}
      <div className="flex justify-end pt-2">
        <Button
          onClick={handleSave}
          disabled={!name.trim() || !isDirty || updateProject.isPending}
        >
          {updateProject.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>

    </div>
  );
}