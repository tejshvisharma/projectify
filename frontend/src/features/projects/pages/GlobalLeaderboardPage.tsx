import { useEffect, useState } from 'react';
import { AlertCircle, Trophy } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
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
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </CardContent>
        </Card>

        <Card>
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
      <Card className="border-destructive">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
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
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Global Leaderboard</h1>
          <p className="text-sm text-muted-foreground">
            Rankings across all users based on credits and verified task delivery.
          </p>
        </div>

        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Trophy className="mb-4 h-12 w-12 text-muted-foreground" />
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
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Global Leaderboard</h1>
        <p className="text-sm text-muted-foreground">
          Rankings across all users based on credits and verified task delivery.
        </p>
      </div>

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