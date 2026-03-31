

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
      <div className="space-y-6">
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
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Trophy className="mb-4 h-12 w-12 text-muted-foreground" />
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
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <LeaderboardHeader projectName={project?.name} />

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
  );
}