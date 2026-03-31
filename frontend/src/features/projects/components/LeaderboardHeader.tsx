import { Trophy } from 'lucide-react';

interface LeaderboardHeaderProps {
  projectName?: string;
}

export default function LeaderboardHeader({ projectName }: LeaderboardHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
          <Trophy className="h-3.5 w-3.5 text-primary" />
          Leaderboard
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Project Leaderboard</h2>
        <p className="text-sm text-muted-foreground">
          {projectName
            ? `${projectName} rankings sorted by credits, completions, and on-time delivery.`
            : 'Rankings sorted by credits, completions, and on-time delivery.'}
        </p>
      </div>
    </div>
  );
}