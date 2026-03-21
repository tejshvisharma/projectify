import { useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { ProjectMember } from '@/features/members/types';

interface NoteEditorProps {
  initialValue?: string;
  members: ProjectMember[];
  onSubmit: (content: string) => void;
  onCancel?: () => void;
  submitLabel?: string;
  isPending?: boolean;
  placeholder?: string;
}

export default function NoteEditor({
  initialValue = '',
  members,
  onSubmit,
  onCancel,
  submitLabel = 'Post Note',
  isPending = false,
  placeholder = 'Write a note... type @ to mention someone',
}: NoteEditorProps) {
  const [content, setContent]               = useState(initialValue);
  const [showMentions, setShowMentions]     = useState(false);
  const [mentionQuery, setMentionQuery]     = useState('');
  const [mentionIndex, setMentionIndex]     = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef                         = useRef<HTMLTextAreaElement>(null);

  // ── Filter members by what user typed after @ ─────────────────────────────
  const filteredMembers = members.filter((m) =>
    m.user.username.toLowerCase().startsWith(mentionQuery.toLowerCase())
  );

  // ── Handle typing ─────────────────────────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value    = e.target.value;
    const cursor   = e.target.selectionStart;

    setContent(value);
    setCursorPosition(cursor);

    // Find if cursor is inside a @mention
    // Look backwards from cursor for @ symbol
    const textBeforeCursor = value.slice(0, cursor);
    const mentionMatch     = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]); // text after @
      setShowMentions(true);
      setMentionIndex(0);
    } else {
      setShowMentions(false);
      setMentionQuery('');
    }
  };

  // ── Handle keyboard in mention dropdown ───────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentions && filteredMembers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionIndex((i) =>
          Math.min(i + 1, filteredMembers.length - 1)
        );
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertMention(filteredMembers[mentionIndex].user.username);
        return;
      }
      if (e.key === 'Escape') {
        setShowMentions(false);
        return;
      }
    }

    // Ctrl+Enter submits
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit();
    }
  };

  // ── Insert selected mention into content ──────────────────────────────────
  const insertMention = (username: string) => {
    const textBeforeCursor = content.slice(0, cursorPosition);
    const textAfterCursor  = content.slice(cursorPosition);

    // Replace the @query with @username + space
    const newText =
      textBeforeCursor.replace(/@(\w*)$/, `@${username} `) +
      textAfterCursor;

    setContent(newText);
    setShowMentions(false);
    setMentionQuery('');

    // Refocus textarea after mention insert
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const handleSubmit = () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    if (!initialValue) setContent(''); // only clear if new note, not edit
  };

  return (
    <div className="space-y-2">

      {/* Textarea + mention dropdown wrapper */}
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="min-h-[100px] resize-none text-sm"
          autoFocus={!!initialValue} // autofocus when editing
        />

        {/* @mention dropdown */}
        {showMentions && filteredMembers.length > 0 && (
          <div className="absolute bottom-full left-0 mb-1 w-56 bg-popover border rounded-lg shadow-lg overflow-hidden z-50">
            <div className="px-2 py-1.5 text-xs text-muted-foreground border-b">
              Members
            </div>
            {filteredMembers.map((member, index) => (
              <button
                key={member._id}
                onClick={() => insertMention(member.user.username)}
                className={`
                  w-full flex items-center gap-2 px-3 py-2
                  text-sm hover:bg-muted transition-colors text-left
                  ${index === mentionIndex ? 'bg-muted' : ''}
                `}
              >
                <Avatar className="h-6 w-6 shrink-0">
                  <AvatarImage src={member.user.avatar?.url} />
                  <AvatarFallback className="text-xs">
                    {member.user.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{member.user.username}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Hint text */}
      <p className="text-xs text-muted-foreground">
        Type @ to mention a team member · Ctrl+Enter to post
      </p>

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
        )}
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!content.trim() || isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              Saving...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </div>
  );
}