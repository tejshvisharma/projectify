import { AtSign, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { UserDashboardMention } from '../types/dashboard.types';

interface MentionsListProps {
  mentions: UserDashboardMention[];
}

function formatRelativeTime(timestamp: string): string {
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

export function MentionsList({ mentions }: MentionsListProps) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="h-4 w-4 text-primary" aria-hidden="true" />
          Recent Mentions
        </CardTitle>
        <CardDescription className="max-w-[40ch] leading-relaxed">Notes where teammates mentioned you.</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {mentions.length === 0 ? (
          <div className="flex h-44 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/70 bg-muted/20 text-center">
            <AtSign className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium">No mentions yet</p>
              <p className="text-xs text-muted-foreground">You'll see notes here when someone tags you.</p>
            </div>
          </div>
        ) : (
          <ul className="space-y-3" aria-label="Recent mentions">
            {mentions.slice(0, 6).map((mention) => {
              const username = mention.creator?.username ?? 'Unknown user';

              return (
                <li key={mention._id} className="rounded-lg border border-border/70 bg-card/50 p-3 transition-colors hover:bg-muted/30">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8 border border-border/70">
                      <AvatarImage src={mention.creator?.avatar?.url} />
                      <AvatarFallback className="text-xs font-medium">
                        {username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        <span className="font-medium text-foreground">{username}</span> in {mention.project?.name ?? 'Unknown project'}
                      </p>
                      <p className="line-clamp-2 text-sm leading-relaxed text-foreground">{mention.content}</p>
                      <p className="text-xs text-muted-foreground">{formatRelativeTime(mention.createdAt)}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
