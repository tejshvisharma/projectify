import { Calendar, ExternalLink, FolderKanban, Tag, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Project, ProjectMember } from '../types';

interface ProjectHeaderProps {
  project: Project;
  members: ProjectMember[];
  membersLoading: boolean;
}

// Priority color mapping for role badges
const ROLE_COLORS: Record<string, string> = {
  owner:
    'border-violet-300 bg-violet-100 text-violet-700 dark:border-violet-500/40 dark:bg-violet-500/15 dark:text-violet-300',
  project_admin:
    'border-blue-300 bg-blue-100 text-blue-700 dark:border-blue-500/40 dark:bg-blue-500/15 dark:text-blue-300',
  member:
    'border-emerald-300 bg-emerald-100 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-300',
  viewer:
    'border-gray-300 bg-gray-100 text-gray-700 dark:border-gray-500/40 dark:bg-gray-500/15 dark:text-gray-300',
};

export default function ProjectHeader({
  project,
  members,
  membersLoading,
}: ProjectHeaderProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const endDate = formatDate(project.endDate);
  const isOverdue =
    project.endDate && new Date(project.endDate) < new Date();

  return (
    <div className="space-y-5">
      {/* Top row: name + actions */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary dark:border-primary/35 dark:bg-primary/15">
            <FolderKanban className="h-3.5 w-3.5" />
            Active Project
          </div>

          <h1 className="truncate text-3xl font-bold tracking-tight md:text-4xl">
            {project.name}
          </h1>

          {project.description && (
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-[15px]">
              {project.description}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {project.githubRepo && (
            <Button
              variant="outline"
              size="sm"
              className="border-primary/25 bg-background/70 transition-all duration-200 hover:border-primary/40 hover:bg-primary/10"
              asChild
            >
              <a href={project.githubRepo} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-1 h-3 w-3" />
                GitHub
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Tags */}
      {project.tags.length > 0 && (
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <Tag className="h-3.5 w-3.5" />
            Project Tags
          </div>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="border border-border/70 bg-muted/60 px-2.5 py-1 text-xs transition-colors hover:bg-muted"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Meta row: date + members */}
      <div className="grid gap-3 sm:grid-cols-2">
        {/* Due date */}
        <div className="rounded-xl border border-border/70 bg-background/60 p-3 text-sm text-muted-foreground">
          <div className="mb-1.5 inline-flex items-center gap-1.5 text-xs uppercase tracking-wide">
            <Calendar className="h-3.5 w-3.5" />
            Timeline
          </div>

          <div
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${
              isOverdue
                ? 'border-destructive/30 bg-destructive/10 font-medium text-destructive'
                : 'border-border bg-muted/40 text-foreground'
            }`}
          >
            <span>{isOverdue ? 'Overdue' : 'Due'}</span>
            <span>·</span>
            <span>{endDate ?? 'Not set'}</span>
          </div>
        </div>

        {/* Members avatars */}
        <div className="rounded-xl border border-border/70 bg-background/60 p-3 text-sm text-muted-foreground">
          <div className="mb-1.5 inline-flex items-center gap-1.5 text-xs uppercase tracking-wide">
            <Users className="h-3.5 w-3.5" />
            Team Members
          </div>
          <div className="flex items-center gap-2">
            {membersLoading ? (
              <div className="flex -space-x-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-7 w-7 rounded-full" />
                ))}
              </div>
            ) : (
              <TooltipProvider>
                <div className="flex -space-x-2">
                  {members.slice(0, 5).map((member) => (
                    <Tooltip key={member._id}>
                      <TooltipTrigger asChild>
                        <Avatar className="h-7 w-7 cursor-pointer border-2 border-background transition-transform duration-200 hover:-translate-y-0.5">
                          <AvatarImage src={member.user.avatar?.url} />
                          <AvatarFallback className="text-xs">
                            {member.user.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{member.user.username}</span>
                          <span
                            className={`rounded-full border px-1.5 py-0.5 text-xs ${
                              ROLE_COLORS[member.role] ?? ''
                            }`}
                          >
                            {member.role}
                          </span>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}

                  {members.length > 5 && (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
                      +{members.length - 5}
                    </div>
                  )}
                </div>
              </TooltipProvider>
            )}

            <span className="text-xs">
              {members.length} member{members.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
