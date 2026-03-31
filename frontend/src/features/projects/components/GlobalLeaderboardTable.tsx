import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { GlobalLeaderboardUser } from '../types';

interface GlobalLeaderboardTableProps {
  leaders: GlobalLeaderboardUser[];
  page: number;
  limit: number;
}

function formatUpdatedAt(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getInitials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

function getOnTimeRate(onTimeTasks: number, tasksCompleted: number) {
  if (!tasksCompleted) return '0%';
  const value = (onTimeTasks / tasksCompleted) * 100;
  return `${value.toFixed(1)}%`;
}

export default function GlobalLeaderboardTable({
  leaders,
  page,
  limit,
}: GlobalLeaderboardTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Global Rankings</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[700px] border-collapse">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3 text-right">Credits</th>
                <th className="px-4 py-3 text-right">Tasks</th>
                <th className="px-4 py-3 text-right">On-Time</th>
                <th className="px-4 py-3 text-right">Updated</th>
              </tr>
            </thead>
            <tbody>
              {leaders.map((leader, index) => {
                const rank = (page - 1) * limit + index + 1;
                return (
                  <tr key={leader._id} className="border-b border-border/60 transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3 text-sm font-bold text-muted-foreground">#{rank}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={leader.avatar?.url} alt={leader.username} />
                          <AvatarFallback>{getInitials(leader.username)}</AvatarFallback>
                        </Avatar>
                        <p className="text-sm font-semibold">{leader.username}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-primary">
                      {leader.stats.totalCredits}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">{leader.stats.totalTasksCompleted}</td>
                    <td className="px-4 py-3 text-right text-sm">
                      {getOnTimeRate(leader.stats.onTimeTasks, leader.stats.totalTasksCompleted)}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                      {formatUpdatedAt(leader.updatedAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 md:hidden">
          {leaders.map((leader, index) => {
            const rank = (page - 1) * limit + index + 1;

            return (
              <div key={leader._id} className="rounded-lg border bg-card p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="min-w-8 text-sm font-bold text-muted-foreground">#{rank}</div>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={leader.avatar?.url} alt={leader.username} />
                      <AvatarFallback>{getInitials(leader.username)}</AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-semibold">{leader.username}</p>
                  </div>
                  <p className="text-lg font-bold text-primary">{leader.stats.totalCredits}</p>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-md bg-muted/40 p-2">
                    <p className="text-[10px] uppercase text-muted-foreground">Tasks</p>
                    <p className="text-sm font-semibold">{leader.stats.totalTasksCompleted}</p>
                  </div>
                  <div className="rounded-md bg-muted/40 p-2">
                    <p className="text-[10px] uppercase text-muted-foreground">On-Time</p>
                    <p className="text-sm font-semibold">
                      {getOnTimeRate(leader.stats.onTimeTasks, leader.stats.totalTasksCompleted)}
                    </p>
                  </div>
                  <div className="rounded-md bg-muted/40 p-2">
                    <p className="text-[10px] uppercase text-muted-foreground">Updated</p>
                    <p className="text-xs font-semibold">{formatUpdatedAt(leader.updatedAt)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}