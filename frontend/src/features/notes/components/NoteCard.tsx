import { useState } from 'react';
import { Pencil, Trash2, AtSign } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/stores/auth.store';
import { useUpdateNoteMutation, useDeleteNoteMutation } from '../api';
import type { Note } from '../types';

import type { ProjectMember } from '@/features/members/types';
import NoteEditor from './NoteEditor';

interface NoteCardProps {
  note: Note;
  projectId: string;
  members: ProjectMember[];
  canManage: boolean;
}

// ── Relative time ─────────────────────────────────────────────────────────────
function timeAgo(dateString: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / 1000
  );
  if (seconds < 60)    return 'just now';
  if (seconds < 3600)  return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

// ── Highlight @mentions in note content ──────────────────────────────────────
// Turns "@johndoe" into a styled blue span
function renderContent(content: string) {
  const parts = content.split(/(@\w+)/g);
  return parts.map((part, i) =>
    part.startsWith('@') ? (
      <span
        key={i}
        className="text-primary font-medium bg-primary/10 rounded px-0.5"
      >
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export default function NoteCard({
  note,
  projectId,
  members,
  canManage,
}: NoteCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const currentUser  = useAuthStore((s) => s.user);
  const updateNote   = useUpdateNoteMutation(projectId);
  const deleteNote   = useDeleteNoteMutation(projectId);

  const isOwn = currentUser?._id === note.createdBy._id;

  const handleSaveEdit = async (content: string) => {
    await updateNote.mutateAsync({ noteId: note._id, content });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="border rounded-xl p-4 bg-background space-y-3">
        <NoteEditor
          initialValue={note.content}
          members={members}
          onSubmit={handleSaveEdit}
          onCancel={() => setIsEditing(false)}
          submitLabel="Save"
          isPending={updateNote.isPending}
        />
      </div>
    );
  }

  return (
    <div className="border rounded-xl p-4 bg-background group hover:shadow-sm transition-shadow">
      {/* Header: avatar + name + time */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={note.createdBy.avatar?.url} />
            <AvatarFallback className="text-xs">
              {note.createdBy.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <span className="text-sm font-semibold">
              {note.createdBy.username}
            </span>
            <span className="text-xs text-muted-foreground ml-2">
              {timeAgo(note.createdAt)}
            </span>
            {note.updatedAt !== note.createdAt && (
              <span className="text-xs text-muted-foreground ml-1 italic">
                (edited)
              </span>
            )}
          </div>
        </div>

        {/* Actions — own notes only, visible on hover */}
        {(isOwn && canManage) && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setIsEditing(true)}
              aria-label="Edit note"
              className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => deleteNote.mutate(note._id)}
              aria-label="Delete note"
              disabled={deleteNote.isPending}
              className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-muted transition-colors disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Content with highlighted @mentions */}
      <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap">
        {renderContent(note.content)}
      </p>

      {/* Mentions list — shows who was tagged */}
      {note.mentions.length > 0 && (
        <div className="mt-3 flex items-center gap-1.5 flex-wrap">
          <AtSign className="h-3.5 w-3.5 text-muted-foreground" />
          {note.mentions.map((mention) => (
            <div
              key={mention.user._id}
              className="flex items-center gap-1"
            >
              <Avatar className="h-5 w-5">
                <AvatarImage src={mention.user.avatar?.url} />
                <AvatarFallback className="text-xs">
                  {mention.user.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">
                {mention.user.username}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}