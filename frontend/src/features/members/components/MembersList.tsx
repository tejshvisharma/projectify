import { UserMinus, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/auth.store';
import {
  useUpdateMemberRoleMutation,
  useRemoveMemberMutation,
} from '../api';
import { ROLE_CONFIG, type ProjectRole, type ProjectMember } from '../types';
import MemberRoleSelect from './MemberRoleSelect';

interface MembersListProps {
  projectId: string;
  members: ProjectMember[];
  isLoading: boolean;
  // current user's role — controls what actions are visible
  currentUserRole: ProjectRole | null;
}

export default function MembersList({
  projectId,
  members,
  isLoading,
  currentUserRole,
}: MembersListProps) {
  const currentUser     = useAuthStore((s) => s.user);
  const updateRole      = useUpdateMemberRoleMutation(projectId);
  const removeMember    = useRemoveMemberMutation(projectId);

  // Only owner and project_admin can manage members
  const canManage = currentUserRole === 'owner' ||
    currentUserRole === 'project_admin';

  const handleRoleChange = (memberId: string, newRole: ProjectRole) => {
    updateRole.mutate({ memberId, role: newRole });
  };

  const handleRemove = (memberId: string) => {
    removeMember.mutate(memberId);
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-7 w-24 rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-1">
      {members.map((member) => {
        const isCurrentUser = currentUser?._id === member.user._id;
        const isOwner       = member.role === 'owner';

        // Can't change your own role or change the owner's role
        const canEditThisMember = canManage && !isCurrentUser && !isOwner;

        return (
          <div
            key={member._id}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors group"
          >
            {/* Avatar */}
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarImage src={member.user.avatar?.url} />
              <AvatarFallback className="text-sm">
                {member.user.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Name + email */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium truncate">
                  {member.user.username}
                </p>
                {isCurrentUser && (
                  <span className="text-xs text-muted-foreground">
                    (you)
                  </span>
                )}
              </div>
              {member.user.email && (
                <p className="text-xs text-muted-foreground truncate">
                  {member.user.email}
                </p>
              )}
            </div>

            {/* Role — editable or static badge */}
            {canEditThisMember ? (
              <MemberRoleSelect
                currentRole={member.role}
                memberId={member._id}
                onRoleChange={handleRoleChange}
                disabled={updateRole.isPending}
              />
            ) : (
              <span
                className={`
                  text-xs font-medium px-2.5 py-1 rounded-full border
                  ${ROLE_CONFIG[member.role].className}
                `}
              >
                {ROLE_CONFIG[member.role].label}
              </span>
            )}

            {/* Remove button */}
            {canEditThisMember && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                onClick={() => handleRemove(member._id)}
                disabled={removeMember.isPending}
                aria-label={`Remove ${member.user.username}`}
              >
                {removeMember.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <UserMinus className="h-3.5 w-3.5" />
                )}
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}