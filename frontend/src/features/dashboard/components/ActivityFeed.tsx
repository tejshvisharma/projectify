import { Link } from 'react-router-dom';
import { Activity, ClipboardCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { DashboardRecentActivityItem } from '../types/dashboard.types';

interface ActivityFeedProps {
  projectId: string;
  activities: DashboardRecentActivityItem[];
}

const MAX_VISIBLE_ITEMS = 8;

function formatRelativeTime(timestamp: string | null): string {
  if (!timestamp) {
    return 'just now';
  }

  const parsedTime = new Date(timestamp).getTime();
  if (Number.isNaN(parsedTime)) {
    return 'just now';
  }

  const deltaSeconds = Math.max(0, Math.floor((Date.now() - parsedTime) / 1000));

  if (deltaSeconds < 60) return 'just now';
  if (deltaSeconds < 3600) return `${Math.floor(deltaSeconds / 60)}m ago`;
  if (deltaSeconds < 86400) return `${Math.floor(deltaSeconds / 3600)}h ago`;
  if (deltaSeconds < 604800) return `${Math.floor(deltaSeconds / 86400)}d ago`;

  return new Date(parsedTime).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function getActivityAction(type: string): string {
  if (type.includes('approved')) return 'approved';
  if (type.includes('rejected')) return 'rejected';
  if (type.includes('submitted')) return 'submitted';
  return 'updated';
}

export function ActivityFeed({ projectId, activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <Card className="border-dashed border-border/80">
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
          <CardDescription>Team updates will appear here as tasks are verified.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4 py-10 text-center">
          <div className="rounded-full bg-muted p-3">
            <Activity className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-medium">No activity yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Contributions and approvals from your team will stream in here.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to={`/projects/${projectId}`}>Create First Task</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const visibleItems = activities.slice(0, MAX_VISIBLE_ITEMS);

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-lg">Recent Activity</CardTitle>
          <CardDescription>Latest approvals, submissions, and delivery actions.</CardDescription>
        </div>
        <Button asChild size="sm" variant="ghost" className="h-8 px-3">
          <Link to={`/projects/${projectId}`}>View All</Link>
        </Button>
      </CardHeader>

      <CardContent>
        <ul className="space-y-4" aria-label="Recent project activity timeline">
          {visibleItems.map((item, index) => {
            const username = item.user.username || 'Unknown user';
            const taskTitle = item.taskTitle || 'Untitled task';
            const action = getActivityAction(item.type);

            return (
              <li key={`${item.type}-${taskTitle}-${index}`} className="flex gap-3">
                <div className="relative">
                  <Avatar className="h-9 w-9 border border-border/70">
                    <AvatarImage src={item.user.avatar?.url} />
                    <AvatarFallback className="text-xs font-medium">
                      {username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {index < visibleItems.length - 1 ? (
                    <span className="absolute left-1/2 top-10 h-8 w-px -translate-x-1/2 bg-border" aria-hidden="true" />
                  ) : null}
                </div>

                <div className="min-w-0 flex-1 space-y-1 pb-1">
                  <p className="truncate text-sm leading-5 text-foreground">
                    <span className="font-semibold">{username}</span>{' '}
                    <span className="text-muted-foreground">{action} task</span>{' '}
                    <span className="inline-flex max-w-[65%] items-center gap-1 truncate rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-foreground">
                      <ClipboardCheck className="h-3 w-3 shrink-0" aria-hidden="true" />
                      <span className="truncate">{taskTitle}</span>
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatRelativeTime(item.timestamp)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
