import { useEffect, useMemo, useState } from 'react';
import { Loader2, Search, UserPlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import type { UserSummary } from '@/features/projects/types';
import { useAddMemberMutation, useSearchUsersQuery } from '../api';
import { ASSIGNABLE_ROLES, ROLE_CONFIG, type ProjectRole } from '../types';

const SEARCH_DEBOUNCE_MS = 300;
const SEARCH_LIMIT = 10;

interface AddMemberModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  // existing member user IDs — to prevent adding duplicates
  existingMemberIds: string[];
}

export default function AddMemberModal({
  open,
  onClose,
  projectId,
  existingMemberIds,
}: AddMemberModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchPage, setSearchPage] = useState(1);
  const [searchResults, setSearchResults] = useState<UserSummary[]>([]);
  const [locallyAddedIds, setLocallyAddedIds] = useState<string[]>([]);
  const [role, setRole] = useState<ProjectRole>('member');
  const [addingUserId, setAddingUserId] = useState<string | null>(null);

  const addMember = useAddMemberMutation(projectId);
  const {
    data: searchData,
    isLoading: isSearchLoading,
    isFetching: isSearchFetching,
    isPlaceholderData,
    error: searchError,
  } = useSearchUsersQuery({
    query: debouncedQuery,
    page: searchPage,
    limit: SEARCH_LIMIT,
    enabled: open,
  });

  const addedMemberIds = useMemo(
    () => new Set([...existingMemberIds, ...locallyAddedIds]),
    [existingMemberIds, locallyAddedIds]
  );

  const hasSearched = debouncedQuery.length > 0;
  const hasResults = searchResults.length > 0;
  const canLoadMore = Boolean(searchData?.meta?.hasNextPage);

  useEffect(() => {
    if (!open) return;

    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [searchQuery, open]);

  useEffect(() => {
    setSearchPage(1);
    setSearchResults([]);
  }, [debouncedQuery]);

  useEffect(() => {
    if (!searchData || isPlaceholderData) return;

    setSearchResults((previous) => {
      if (searchPage === 1) {
        return searchData.users;
      }

      const previousIds = new Set(previous.map((user) => user._id));
      const nextUsers = searchData.users.filter(
        (user) => !previousIds.has(user._id)
      );
      return [...previous, ...nextUsers];
    });
  }, [searchData, searchPage, isPlaceholderData]);

  const handleAddMember = async (user: UserSummary) => {
    if (addedMemberIds.has(user._id) || addMember.isPending) return;

    setAddingUserId(user._id);

    try {
      await addMember.mutateAsync({
        userId: user._id,
        role,
      });

      setLocallyAddedIds((previous) =>
        previous.includes(user._id) ? previous : [...previous, user._id]
      );
      toast.success(`${user.username} added to project`);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ?? 'Failed to add member. Please try again.';
      toast.error(message);
    } finally {
      setAddingUserId(null);
    }
  };

  const handleLoadMore = () => {
    if (!canLoadMore || isSearchFetching) return;
    setSearchPage((previous) => previous + 1);
  };

  const handleClose = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    setSearchPage(1);
    setSearchResults([]);
    setLocallyAddedIds([]);
    setRole('member');
    setAddingUserId(null);
    onClose();
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      handleClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Member</DialogTitle>
          <DialogDescription>
            Search for a user and assign them a role in this project.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="member-search">Search users</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="member-search"
                placeholder="johndoe"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9"
                autoFocus
              />
              {isSearchFetching && (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Assign role</Label>
            <Select
              value={role}
              onValueChange={(value) => setRole(value as ProjectRole)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASSIGNABLE_ROLES.map((assignableRole) => (
                  <SelectItem key={assignableRole} value={assignableRole}>
                    <span
                      className={`
                        text-xs font-medium px-2 py-0.5 rounded-full border
                        ${ROLE_CONFIG[assignableRole].className}
                      `}
                    >
                      {ROLE_CONFIG[assignableRole].label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Search results</Label>

            {!hasSearched && (
              <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                Start typing to search users by username or email.
              </div>
            )}

            {hasSearched && isSearchLoading && !hasResults && (
              <div className="space-y-2 rounded-lg border p-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-24" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            )}

            {hasSearched && !isSearchLoading && !hasResults && !searchError && (
              <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                No users found.
              </div>
            )}

            {searchError && hasSearched && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                Search failed. Please try again.
              </div>
            )}

            {hasResults && (
              <div className="rounded-lg border divide-y max-h-64 overflow-y-auto">
                {searchResults.map((user) => {
                  const isAdded = addedMemberIds.has(user._id);
                  const isAddingThisUser =
                    addMember.isPending && addingUserId === user._id;

                  return (
                    <div
                      key={user._id}
                      className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted/50 focus-within:bg-muted/50"
                    >
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={user.avatar?.url} />
                        <AvatarFallback className="text-xs">
                          {user.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{user.username}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email || 'No email available'}
                        </p>
                      </div>

                      <Button
                        type="button"
                        size="sm"
                        variant={isAdded ? 'secondary' : 'outline'}
                        onClick={() => void handleAddMember(user)}
                        disabled={isAdded || addMember.isPending}
                        aria-label={
                          isAdded
                            ? `${user.username} is already in this project`
                            : `Add ${user.username} as ${ROLE_CONFIG[role].label}`
                        }
                      >
                        {isAddingThisUser ? (
                          <>
                            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                            Adding...
                          </>
                        ) : isAdded ? (
                          'Added'
                        ) : (
                          <>
                            <UserPlus className="mr-2 h-3.5 w-3.5" />
                            Add
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}

            {hasResults && canLoadMore && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleLoadMore}
                disabled={isSearchFetching}
              >
                {isSearchFetching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </Button>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={addMember.isPending}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}