import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LeaderboardMember } from '../types';
import LeaderboardRow from './LeaderboardRow';

interface LeaderboardTableProps {
  leaders: LeaderboardMember[];
  page: number;
  limit: number;
}

export default function LeaderboardTable({
  leaders,
  page,
  limit,
}: LeaderboardTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Member Rankings</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[760px] border-collapse">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3 text-right">Credits</th>
                <th className="px-4 py-3 text-right">Tasks</th>
                <th className="px-4 py-3 text-right">On-Time</th>
                <th className="px-4 py-3 text-right">Updated</th>
              </tr>
            </thead>
            <tbody>
              {leaders.map((member, index) => (
                <LeaderboardRow
                  key={member._id}
                  member={member}
                  rank={(page - 1) * limit + index + 1}
                />
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 md:hidden">
          {leaders.map((member, index) => (
            <LeaderboardRow
              key={member._id}
              member={member}
              rank={(page - 1) * limit + index + 1}
              mobile
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}