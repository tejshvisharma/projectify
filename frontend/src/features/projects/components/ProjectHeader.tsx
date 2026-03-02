import { Link } from 'react-router-dom';
import { Calendar, ExternalLink, Users } from 'lucide-react';
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
  owner: 'bg-purple-100 text-purple-700 border-purple-200',
  project_admin: 'bg-blue-100 text-blue-700 border-blue-200',
  member: 'bg-green-100 text-green-700 border-green-200',
  viewer: 'bg-gray-100 text-gray-700 border-gray-200',
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
    <div className="space-y-4">
      {/* Top row: name + actions */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <h1 className="text-3xl font-bold tracking-tight truncate">
            {project.name}
          </h1>
          {project.description && (
            <p className="text-muted-foreground text-sm max-w-2xl">
              {project.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {project.githubRepo && (
            <Button variant="outline" size="sm" asChild>
              <a href={project.githubRepo} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-1 h-3 w-3" />
                GitHub
              </a>
            </Button>
          )}
          <Button size="sm">Edit Project</Button>
        </div>
      </div>

      {/* Tags */}
      {project.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Meta row: date + members */}
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        {/* Due date */}
        {endDate && (
          <div
            className={`flex items-center gap-1.5 ${
              isOverdue ? 'text-destructive font-medium' : ''
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>{isOverdue ? 'Overdue · ' : 'Due · '}{endDate}</span>
          </div>
        )}

        {/* Members avatars */}
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
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
                      <Avatar className="h-7 w-7 border-2 border-background cursor-pointer">
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
                          className={`text-xs px-1.5 py-0.5 rounded-full border ${
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
                  <div className="h-7 w-7 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium">
                    +{members.length - 5}
                  </div>
                )}
              </div>
            </TooltipProvider>
          )}
          <span>{members.length} member{members.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  );
}