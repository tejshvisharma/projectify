// src/features/projects/pages/ProjectsListPage.tsx

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  Plus,
  Sparkles,
  Target,
} from 'lucide-react';
import { useGetProjectsQuery } from '../api';
import { apiClient } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Project, ApiResponse } from '../types';
import CreateProjectModal from '../components/CreateProjectModal';

export default function ProjectsListPage() {
  const [page, setPage] = useState(1);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const limit = 9;
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useGetProjectsQuery(page, limit);

  const projects = data?.projects ?? [];
  const meta = data?.meta;

  const handlePrefetch = (projectId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['project', projectId],
      queryFn: async () => {
        const response = await apiClient.get<ApiResponse<Project>>(
          `/projects/${projectId}`
        );
        return response.data.data;
      },
    });
  };

  const handlePrevPage = () => {
    if (meta?.hasPrevPage) {
      setPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (meta?.hasNextPage) {
      setPage((prev) => prev + 1);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="relative space-y-6">
      <div className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-4 h-52 w-52 rounded-full bg-accent/10 blur-3xl" />

      {/* Page Header */}
      <Card className="relative overflow-hidden border-border/70 bg-gradient-to-br from-card via-card to-primary/5 shadow-sm">
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />

        <CardContent className="relative flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:p-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <FolderKanban className="h-3.5 w-3.5" />
              Project Workspace
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-sm text-muted-foreground">
              Organize your initiatives with clear ownership, timelines, and delivery visibility.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-border bg-background/70">
                <Target className="mr-1 h-3.5 w-3.5 text-primary" />
                {meta?.totalItems ?? projects.length} total projects
              </Badge>
              <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Sparkles className="mr-1 h-3.5 w-3.5" />
                Live updates
              </Badge>
            </div>
          </div>

          <div className="shrink-0">
            <Button onClick={() => setCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: limit }).map((_, i) => (
            <Card key={i} className="border-border/70 shadow-sm">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/5 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-full bg-destructive/10 p-3 text-destructive">
              <FolderKanban className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Failed to load projects</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Please try again
            </p>
            <Button onClick={() => refetch()} variant="outline">
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !error && projects.length === 0 && (
        <Card className="border-dashed border-border/80 bg-card/70 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-full bg-muted p-3">
              <FolderKanban className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">No projects yet</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Get started by creating your first project
            </p>
            <Button variant="outline" onClick={() => setCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Projects Grid */}
      {!isLoading && !error && projects.length > 0 && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link
                key={project._id}
                to={`/projects/${project._id}`}
                onMouseEnter={() => handlePrefetch(project._id)}
              >
                <Card className="h-full cursor-pointer border-border/70 bg-card/90 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/15">
                        <FolderKanban className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">
                          {project.name}
                        </CardTitle>
                        <CardDescription className="line-clamp-1">
                          {project.description || 'No description'}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Tags */}
                    {project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {project.tags.slice(0, 3).map((tag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="border-primary/25 bg-primary/10 px-2 py-0.5 text-xs text-primary"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {project.tags.length > 3 && (
                          <Badge variant="outline" className="border-border bg-muted/70 px-2 py-0.5 text-xs text-muted-foreground">
                            +{project.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Created {formatDate(project.createdAt)}</span>
                      {project.endDate && (
                        <span>Due {formatDate(project.endDate)}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <Card className="border-border/70 bg-card/80 shadow-sm">
              <CardContent className="flex items-center justify-between p-4">
              <Button
                variant="outline"
                onClick={handlePrevPage}
                disabled={!meta.hasPrevPage}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              <span className="text-sm text-muted-foreground">
                Page {meta.page} of {meta.totalPages}
              </span>

              <Button
                variant="outline"
                onClick={handleNextPage}
                disabled={!meta.hasNextPage}
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
      <CreateProjectModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </div>
  );
}