import { useState } from 'react';
import { StickyNote, AtSign } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth.store';
import { useGetProjectMembersQuery } from '@/features/members/api';
import {
  useGetNotesQuery,
  useGetMyMentionsQuery,
  useCreateNoteMutation,
} from '../api';
import NoteCard from './NoteCard';
import NoteEditor from './NoteEditor';
import type { ProjectRole } from '@/features/members/types';

interface NotesPanelProps {
  projectId: string;
}

export default function NotesPanel({ projectId }: NotesPanelProps) {
  // ── View toggle: All Notes vs My Mentions ─────────────────────────────────
  const [view, setView] = useState<'all' | 'mentions'>('all');

  const currentUser  = useAuthStore((s) => s.user);
  const { data: members = [] } = useGetProjectMembersQuery(projectId);

  const { data: notes = [],    isLoading: notesLoading }    = useGetNotesQuery(projectId);
  const { data: mentions = [], isLoading: mentionsLoading } = useGetMyMentionsQuery(projectId);
  const createNote = useCreateNoteMutation(projectId);

  // Derive current user role for canManage check
  const currentMember  = members.find((m) => m.user._id === currentUser?._id);
  const currentRole    = currentMember?.role as ProjectRole | undefined;
  const canManage      = ['owner', 'project_admin'].includes(currentRole ?? '');

  const displayNotes   = view === 'all' ? notes : mentions;
  const isLoading      = view === 'all' ? notesLoading : mentionsLoading;

  const handleCreateNote = async (content: string) => {
    await createNote.mutateAsync({ content });
  };

  return (
    <div className="max-w-3xl space-y-6">

      {/* Header + view toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Notes</h2>
          <p className="text-sm text-muted-foreground">
            Project-level notes visible to all members
          </p>
        </div>

        {/* Toggle: All Notes / My Mentions */}
        <div className="flex items-center rounded-lg border p-0.5 gap-0.5">
          <Button
            variant={view === 'all' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setView('all')}
          >
            <StickyNote className="mr-1.5 h-3.5 w-3.5" />
            All Notes
            {notes.length > 0 && (
              <span className="ml-1.5 bg-muted-foreground/20 rounded-full px-1.5 py-0.5 text-xs">
                {notes.length}
              </span>
            )}
          </Button>
          <Button
            variant={view === 'mentions' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setView('mentions')}
          >
            <AtSign className="mr-1.5 h-3.5 w-3.5" />
            My Mentions
            {mentions.length > 0 && (
              <span className="ml-1.5 bg-primary/20 text-primary rounded-full px-1.5 py-0.5 text-xs">
                {mentions.length}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Note composer — only admin/owner can create notes */}
      {canManage && view === 'all' && (
        <div className="border rounded-xl p-4 bg-muted/30">
          <NoteEditor
            members={members}
            onSubmit={handleCreateNote}
            isPending={createNote.isPending}
          />
        </div>
      )}

      {/* Loading skeletons */}
      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && displayNotes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-xl">
          {view === 'all' ? (
            <>
              <StickyNote className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">
                No notes yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {canManage
                  ? 'Write the first note above'
                  : 'Admins can add notes here'
                }
              </p>
            </>
          ) : (
            <>
              <AtSign className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">
                No mentions yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                You'll see notes here when someone @mentions you
              </p>
            </>
          )}
        </div>
      )}

      {/* Notes list */}
      {!isLoading && displayNotes.length > 0 && (
        <div className="space-y-4">
          {displayNotes.map((note) => (
            <NoteCard
              key={note._id}
              note={note}
              projectId={projectId}
              members={members}
              canManage={canManage}
            />
          ))}
        </div>
      )}

    </div>
  );
}