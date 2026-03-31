import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { LeaderboardMember, ProjectRole } from '../types';

interface LeaderboardRowProps {
  member: LeaderboardMember;
  rank: number;
  mobile?: boolean;
}

const roleBadgeClassMap: Record<ProjectRole, string> = {
  owner: 'bg-primary/10 text-primary border-primary/20',
  project_admin: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  member: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  viewer: 'bg-muted text-muted-foreground border-border',
};

const roleLabelMap: Record<ProjectRole, string> = {
  owner: 'Owner',
  project_admin: 'Admin',
  member: 'Member',
  viewer: 'Viewer',
};

function formatUpdatedAt(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getOnTimeRate(onTimeTasks: number, tasksCompleted: number) {
  if (!tasksCompleted) return '0%';
  const value = (onTimeTasks / tasksCompleted) * 100;
  return `${value.toFixed(1)}%`;
}

function getInitials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

export default function LeaderboardRow({
  member,
  rank,
  mobile = false,
}: LeaderboardRowProps) {
  if (mobile) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="min-w-8 text-sm font-bold text-muted-foreground">#{rank}</div>
            <Avatar className="h-10 w-10">
              <AvatarImage src={member.user.avatar?.url} alt={member.user.username} />
              <AvatarFallback>{getInitials(member.user.username)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold">{member.user.username}</p>
              <Badge variant="outline" className={cn('mt-1 text-[10px]', roleBadgeClassMap[member.role])}>
                {roleLabelMap[member.role]}
              </Badge>
            </div>
          </div>
          <p className="text-lg font-bold text-primary">{member.stats.totalCredits}</p>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-md bg-muted/40 p-2">
            <p className="text-[10px] uppercase text-muted-foreground">Tasks</p>
            <p className="text-sm font-semibold">{member.stats.tasksCompleted}</p>
          </div>
          <div className="rounded-md bg-muted/40 p-2">
            <p className="text-[10px] uppercase text-muted-foreground">On-Time</p>
            <p className="text-sm font-semibold">
              {getOnTimeRate(member.stats.onTimeTasks, member.stats.tasksCompleted)}
            </p>
          </div>
          <div className="rounded-md bg-muted/40 p-2">
            <p className="text-[10px] uppercase text-muted-foreground">Updated</p>
            <p className="text-xs font-semibold">{formatUpdatedAt(member.updatedAt)}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <tr className="border-b border-border/60 transition-colors hover:bg-muted/30">
      <td className="px-4 py-3 text-sm font-bold text-muted-foreground">#{rank}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={member.user.avatar?.url} alt={member.user.username} />
            <AvatarFallback>{getInitials(member.user.username)}</AvatarFallback>
          </Avatar>
          <p className="text-sm font-semibold">{member.user.username}</p>
        </div>
      </td>
      <td className="px-4 py-3">
        <Badge variant="outline" className={cn('text-[10px]', roleBadgeClassMap[member.role])}>
          {roleLabelMap[member.role]}
        </Badge>
      </td>
      <td className="px-4 py-3 text-right text-sm font-semibold text-primary">
        {member.stats.totalCredits}
      </td>
      <td className="px-4 py-3 text-right text-sm">{member.stats.tasksCompleted}</td>
      <td className="px-4 py-3 text-right text-sm">
        {getOnTimeRate(member.stats.onTimeTasks, member.stats.tasksCompleted)}
      </td>
      <td className="px-4 py-3 text-right text-xs text-muted-foreground">
        {formatUpdatedAt(member.updatedAt)}
      </td>
    </tr>
  );
}