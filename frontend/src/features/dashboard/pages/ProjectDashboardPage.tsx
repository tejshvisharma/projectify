import { useMemo } from 'react';
import { AxiosError } from 'axios';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, RefreshCcw, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useGetProjectQuery } from '@/features/projects/api';
import { DashboardLayout } from '../components/DashboardLayout';
import { DashboardSkeleton } from '../components/DashboardSkeleton';
import { useDashboardSummary } from '../hooks/useDashboardSummary';

function getRelativeUpdateTime(timestamp: number): string {
  if (!timestamp) {
    return 'just now';
  }

  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));

  if (elapsedSeconds < 60) return 'just now';
  if (elapsedSeconds < 3600) return `${Math.floor(elapsedSeconds / 60)}m ago`;
  if (elapsedSeconds < 86400) return `${Math.floor(elapsedSeconds / 3600)}h ago`;
  return `${Math.floor(elapsedSeconds / 86400)}d ago`;
}

export default function ProjectDashboardPage() {
  const { projectId } = useParams<{ projectId: string }>();

  const isValidProjectId = useMemo(
    () => Boolean(projectId && /^[a-f\d]{24}$/i.test(projectId)),
    [projectId],
  );

  if (!isValidProjectId || !projectId) {
    return <Navigate to="/projects" replace />;
  }

  const { data: project } = useGetProjectQuery(projectId);

  const {
    data,
    error,
    isError,
    isFetching,
    isLoading,
    refetch,
    dataUpdatedAt,
  } = useDashboardSummary(projectId);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError || !data) {
    const statusCode = error instanceof AxiosError ? error.response?.status : undefined;

    const heading = statusCode === 403
      ? 'Insufficient permissions'
      : statusCode === 404
        ? 'Dashboard not found'
        : 'Failed to load dashboard';

    const description = statusCode === 403
      ? 'You are not allowed to view this project dashboard. Contact a project admin for access.'
      : statusCode === 404
        ? 'This project may not exist anymore or was moved.'
        : 'Please try again. If the issue persists, verify your connection and backend API status.';

    return (
      <Card className="border-destructive/60">
        <CardHeader>
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ShieldAlert className="h-5 w-5" aria-hidden="true" />
          </div>
          <CardTitle>{heading}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={() => void refetch()}>
            Retry
          </Button>
          <Button asChild variant="ghost">
            <Link to="/projects">Back to Projects</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden border-border/70 bg-gradient-to-br from-card via-card to-primary/5 shadow-sm">
        <div className="pointer-events-none absolute -right-14 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
        <CardContent className="relative flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-foreground">
              <Link to={`/projects/${projectId}`}>
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                Back to Project
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">{project?.name ?? 'Project'} Dashboard</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Unified view of delivery metrics, task flow analytics, and verification activity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() => void refetch()}
              disabled={isFetching}
              aria-label="Refresh dashboard metrics"
            >
              <RefreshCcw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <span className="rounded-md border border-border/70 bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground" aria-live="polite">
              Last updated {getRelativeUpdateTime(dataUpdatedAt)}
            </span>
          </div>
        </CardContent>
      </Card>

      <DashboardLayout projectId={projectId} summary={data} />
    </div>
  );
}
