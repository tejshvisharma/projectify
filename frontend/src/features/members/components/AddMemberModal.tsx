import { useState } from 'react';
import { Loader2, Search } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiClient } from '@/lib/axios';
import type { ApiResponse, UserSummary } from '@/features/projects/types';
import { useAddMemberMutation } from '../api';
import { ASSIGNABLE_ROLES, ROLE_CONFIG, type ProjectRole } from '../types';

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
  const [searchQuery, setSearchQuery]     = useState('');
  const [searchResults, setSearchResults] = useState<UserSummary[]>([]);
  const [selectedUser, setSelectedUser]   = useState<UserSummary | null>(null);
  const [role, setRole]                   = useState<ProjectRole>('member');
  const [isSearching, setIsSearching]     = useState(false);
  const [searchError, setSearchError]     = useState('');

  const addMember = useAddMemberMutation(projectId);

  // ── Search users by username ───────────────────────────────────────────────
  const handleSearch = async () => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    setIsSearching(true);
    setSearchError('');
    setSearchResults([]);
    setSelectedUser(null);

    try {
      // Uses the auth profile endpoint pattern — adjust if your backend
      // has a dedicated user search endpoint
      const response = await apiClient.get<ApiResponse<UserSummary[]>>(
        `/users/search?query=${encodeURIComponent(trimmed)}`
      );
      const results = response.data.data;

      // Filter out users already in the project
      const filtered = results.filter(
        (u) => !existingMemberIds.includes(u._id)
      );

      if (filtered.length === 0) {
        setSearchError('No users found or all results are already members.');
      }

      setSearchResults(filtered);
    } catch {
      setSearchError('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleSubmit = async () => {
    if (!selectedUser) return;

    await addMember.mutateAsync({
      userId: selectedUser._id,
      role,
    });

    handleClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedUser(null);
    setRole('member');
    setSearchError('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Member</DialogTitle>
          <DialogDescription>
            Search for a user and assign them a role in this project.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">

          {/* Search input */}
          <div className="space-y-1.5">
            <Label>Search by username</Label>
            <div className="flex gap-2">
              <Input
                placeholder="johndoe"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleSearch}
                disabled={!searchQuery.trim() || isSearching}
                aria-label="Search users"
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Search error */}
          {searchError && (
            <p className="text-sm text-destructive">{searchError}</p>
          )}

          {/* Search results */}
          {searchResults.length > 0 && (
            <div className="space-y-1.5">
              <Label>Select user</Label>
              <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
                {searchResults.map((user) => (
                  <button
                    key={user._id}
                    onClick={() => setSelectedUser(user)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5
                      hover:bg-muted/50 transition-colors text-left
                      ${selectedUser?._id === user._id
                        ? 'bg-primary/5 border-l-2 border-l-primary'
                        : ''
                      }
                    `}
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={user.avatar?.url} />
                      <AvatarFallback className="text-xs">
                        {user.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        {user.username}
                      </p>
                      {user.email && (
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Role selector — only show after user is selected */}
          {selectedUser && (
            <div className="space-y-1.5">
              <Label>Assign role</Label>
              <Select
                value={role}
                onValueChange={(v) => setRole(v as ProjectRole)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASSIGNABLE_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      <span className={`
                        text-xs font-medium px-2 py-0.5 rounded-full border
                        ${ROLE_CONFIG[r].className}
                      `}>
                        {ROLE_CONFIG[r].label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={addMember.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedUser || addMember.isPending}
          >
            {addMember.isPending ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Member'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}