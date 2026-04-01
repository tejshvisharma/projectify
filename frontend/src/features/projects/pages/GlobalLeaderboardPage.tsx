import { useEffect, useState } from 'react';
import { AlertCircle, Globe2, Sparkles, Trophy, Users } from 'lucide-react';
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

import { useGetGlobalLeaderboardQuery } from '../api';
import CurrentUserRankCard from '../components/CurrentUserRankCard';
import LeaderboardPagination from '../components/LeaderboardPagination';
import GlobalLeaderboardTable from '../components/GlobalLeaderboardTable';

const LIMIT = 10;

export default function GlobalLeaderboardPage() {
  const [page, setPage] = useState(1);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useGetGlobalLeaderboardQuery(page, LIMIT);

  useEffect(() => {
    if (error) {
      toast.error('Failed to load global leaderboard');
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
      <div className="relative mx-auto w-full max-w-6xl space-y-6 overflow-hidden rounded-2xl">
        <div className="pointer-events-none absolute -left-12 -top-12 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-14 top-10 h-44 w-44 rounded-full bg-amber-400/10 blur-3xl" />

        <Card className="border-border/70 shadow-sm">
          <CardContent className="space-y-3 p-6">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-4 w-[30rem] max-w-full" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-7 w-28 rounded-full" />
              <Skeleton className="h-7 w-32 rounded-full" />
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
          <div className="mb-4 rounded-full bg-destructive/10 p-3 text-destructive">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">Failed to load global leaderboard</h3>
          <p className="mb-4 text-sm text-muted-foreground">Please try again</p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!leaders.length || !pagination || !currentUser) {
    return (
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Global Leaderboard</h1>
          <p className="text-sm text-muted-foreground">
            Rankings across all users based on credits and verified task delivery.
          </p>
        </div>

        <Card className="border-dashed border-border/80 bg-card/70 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-full bg-muted p-3">
              <Trophy className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle className="mb-2 text-lg">No leaderboard data yet</CardTitle>
            <CardDescription>
              Global rankings will appear when users complete verified tasks.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-6xl space-y-6">
      <div className="pointer-events-none absolute -left-14 -top-12 h-52 w-52 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-8 h-48 w-48 rounded-full bg-amber-400/10 blur-3xl dark:bg-amber-500/10" />

      <Card className="relative overflow-hidden border-border/70 bg-gradient-to-br from-card via-card to-primary/5 shadow-sm">
        <div className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-primary/10 blur-3xl" />
        <CardContent className="relative space-y-3 p-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Globe2 className="h-3.5 w-3.5" />
            Cross-Project Rankings
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Global Leaderboard</h1>
            <p className="text-sm text-muted-foreground">
              Rankings across all users based on credits and verified task delivery.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-border bg-background/70">
              <Users className="mr-1 h-3.5 w-3.5 text-primary" />
              {pagination.total} ranked users
            </Badge>
            <Badge variant="outline" className="border-border bg-background/70">
              <Trophy className="mr-1 h-3.5 w-3.5 text-amber-500" />
              Page {pagination.page} of {totalPages}
            </Badge>
            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="mr-1 h-3.5 w-3.5" />
              Live standings
            </Badge>
          </div>
        </CardContent>
      </Card>

      <CurrentUserRankCard
        currentUser={currentUser}
        totalMembers={pagination.total}
        scopeLabel="Global"
      />

      <GlobalLeaderboardTable
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
  );
}