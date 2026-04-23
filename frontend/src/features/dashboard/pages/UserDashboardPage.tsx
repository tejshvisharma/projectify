import { AxiosError } from 'axios';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth.store';
import { DashboardHeader } from '../components/DashboardHeader';
import { DashboardSkeleton } from '../components/DashboardSkeleton';
import { UserDashboardLayout } from '../components/UserDashboardLayout';
import { useUserDashboard } from '../hooks/useUserDashboard';

export default function UserDashboardPage() {
  const user = useAuthStore((state) => state.user);

  const {
    data,
    error,
    isError,
    isFetching,
    isLoading,
    refetch,
    dataUpdatedAt,
  } = useUserDashboard();

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1320px] space-y-8 pb-2">
        <DashboardSkeleton />
      </div>
    );
  }

  if (isError || !data) {
    const statusCode = error instanceof AxiosError ? error.response?.status : undefined;

    const heading = statusCode === 401
      ? 'Session expired'
      : 'Failed to load dashboard';

    const description = statusCode === 401
      ? 'Please log in again to load your personalized dashboard.'
      : 'Please try again. If the issue persists, verify backend API health and your network connection.';

    return (
      <div className="mx-auto w-full max-w-[1320px] space-y-8 pb-2">
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
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1320px] space-y-8 pb-2">
      <DashboardHeader
        username={user?.username}
        isFetching={isFetching}
        dataUpdatedAt={dataUpdatedAt}
        onRefresh={() => {
          void refetch();
        }}
      />

      <UserDashboardLayout dashboard={data} />
    </div>
  );
}
