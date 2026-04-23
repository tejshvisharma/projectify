import { LayoutDashboard, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface DashboardHeaderProps {
  username?: string;
  isFetching: boolean;
  dataUpdatedAt: number;
  onRefresh: () => void;
}

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

export function DashboardHeader({
  username,
  isFetching,
  dataUpdatedAt,
  onRefresh,
}: DashboardHeaderProps) {
  return (
    <Card className="relative overflow-hidden border-border/70 bg-gradient-to-br from-card via-card to-primary/[0.04] shadow-sm">
      <div
        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl"
        aria-hidden="true"
      />
      <CardContent className="relative flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2.5">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/[0.07] px-2.5 py-1 text-xs font-medium text-primary">
            <LayoutDashboard className="h-3.5 w-3.5" aria-hidden="true" />
            Personal workspace
          </div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">My Dashboard</h1>
          <p className="max-w-[60ch] text-sm leading-relaxed text-muted-foreground">
            Welcome back{username ? `, ${username}` : ''}. Your tasks, mentions, and activity at a glance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            onClick={onRefresh}
            disabled={isFetching}
            aria-label="Refresh my dashboard"
            className="h-9"
          >
            <RefreshCcw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <span
            className="rounded-md border border-border/70 bg-muted/30 px-2.5 py-1.5 text-xs text-muted-foreground"
            aria-live="polite"
          >
            Last updated {getRelativeUpdateTime(dataUpdatedAt)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
