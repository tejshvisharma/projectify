
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AlertCircle, Sparkles, Trophy, Users } from 'lucide-react';
import { toast } from 'sonner';

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

import { useGetProjectLeaderboardQuery, useGetProjectQuery } from '../api';
import CurrentUserRankCard from './CurrentUserRankCard';
import LeaderboardHeader from './LeaderboardHeader';
import LeaderboardPagination from './LeaderboardPagination';
import LeaderboardTable from './LeaderboardTable';

const LIMIT = 10;

export default function ProjectLeaderboardTab() {
  const { projectId } = useParams<{ projectId: string }>();
  const [page, setPage] = useState(1);

  const { data: project } = useGetProjectQuery(projectId ?? '');

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useGetProjectLeaderboardQuery(projectId ?? '', page, LIMIT);

  useEffect(() => {
    if (error) {
      toast.error('Failed to load leaderboard');
    }
  }, [error]);

  const leaders = data?.leaders ?? [];
  const pagination = data?.pagination;
  const currentUser = data?.currentUser;
  const totalPages = pagination
    ? Math.max(1, Math.ceil(pagination.total / pagination.limit))
    : 1;

  const handlePrevPage = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    if (!pagination) return;
    const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.limit));
    setPage((prev) => (prev < totalPages ? prev + 1 : prev));
  };

  if (isLoading) {
    return (
      <div className="relative space-y-6 overflow-hidden rounded-2xl">
        <div className="pointer-events-none absolute -left-14 -top-14 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 top-16 h-44 w-44 rounded-full bg-amber-400/10 blur-3xl" />

        <Card className="border-border/70 shadow-sm">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-7 w-28 rounded-full" />
            </div>
            <Skeleton className="h-4 w-[28rem] max-w-full" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-7 w-28 rounded-full" />
              <Skeleton className="h-7 w-24 rounded-full" />
              <Skeleton className="h-7 w-24 rounded-full" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardContent className="p-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: LIMIT }).map((_, index) => (
              <Skeleton key={index} className="h-14 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50 bg-destructive/5 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">Failed to load leaderboard</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Please try again
          </p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!leaders.length || !pagination || !currentUser) {
    return (
      <div className="space-y-6">
        <LeaderboardHeader projectName={project?.name} />

        <Card className="border-dashed border-border/70 bg-card/70 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Trophy className="h-7 w-7 text-muted-foreground" />
            </div>
            <CardTitle className="mb-2 text-lg">No leaderboard data yet</CardTitle>
            <CardDescription>
              Rankings will appear when members start completing work.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-6xl space-y-6">
      <div className="pointer-events-none absolute -left-20 -top-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-12 h-52 w-52 rounded-full bg-amber-400/10 blur-3xl dark:bg-amber-500/10" />

      <Card className="relative overflow-hidden border-border/70 bg-gradient-to-br from-card via-card to-primary/5 shadow-sm">
        <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <CardContent className="relative space-y-4 p-6">
          <LeaderboardHeader projectName={project?.name} />

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
              <Users className="mr-1 h-3.5 w-3.5" />
              {pagination.total} members
            </Badge>
            <Badge variant="outline" className="border-border bg-background/70">
              <Trophy className="mr-1 h-3.5 w-3.5 text-amber-500" />
              Page {pagination.page} of {totalPages}
            </Badge>
            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="mr-1 h-3.5 w-3.5" />
              Live ranking
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="animate-in fade-in-50 space-y-6 duration-300">
        <CurrentUserRankCard
          currentUser={currentUser}
          totalMembers={pagination.total}
        />

        <LeaderboardTable
          leaders={leaders}
          page={pagination.page}
          limit={pagination.limit}
        />

        <LeaderboardPagination
          page={pagination.page}
          limit={pagination.limit}
          total={pagination.total}
          onPrev={handlePrevPage}
          onNext={handleNextPage}
        />
      </div>
    </div>
  );
}