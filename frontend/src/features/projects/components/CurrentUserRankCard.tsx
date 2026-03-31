import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { LeaderboardCurrentUser } from '../types';

interface CurrentUserRankCardProps {
  currentUser: LeaderboardCurrentUser;
  totalMembers: number;
  scopeLabel?: string;
}

export default function CurrentUserRankCard({
  currentUser,
  totalMembers,
  scopeLabel = 'Project',
}: CurrentUserRankCardProps) {
  const rankLabel =
    currentUser.rank === null ? 'No rank yet' : `#${currentUser.rank}`;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Your Standing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Rank</p>
            <p className="text-3xl font-bold tracking-tight">{rankLabel}</p>
          </div>
          <Badge variant="secondary" className="text-xs">
            {totalMembers} members
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground">Total Credits</p>
            <p className="text-lg font-semibold">{currentUser.totalCredits}</p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground">Leaderboard Scope</p>
            <p className="text-lg font-semibold">{scopeLabel}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}