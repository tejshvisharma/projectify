import { useState, useRef, useEffect } from 'react';
import { Loader2, Pencil, Trash2, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/auth.store';


import {
  useGetCommentsQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} from '../api';
import type { Comment } from '../types';

interface CommentsPanelProps {
  projectId: string;
  taskId: string;
}

function timeAgo(dateString: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / 1000
  );
  if (seconds < 60)    return 'just now';
  if (seconds < 3600)  return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
  });
}

export default function CommentsPanel({ projectId, taskId }: CommentsPanelProps) {
  const [newComment, setNewComment]   = useState('');
  const [editingId, setEditingId]     = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const bottomRef                     = useRef<HTMLDivElement>(null);

  const currentUser = useAuthStore((s) => s.user);

  const { data: comments = [], isLoading } = useGetCommentsQuery(projectId, taskId);
  const createComment = useCreateCommentMutation(projectId, taskId);
  const updateComment = useUpdateCommentMutation(projectId, taskId);
  const deleteComment = useDeleteCommentMutation(projectId, taskId);

  useEffect(() => {
    if (comments.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments.length]);

  const handlePost = async () => {
    const trimmed = newComment.trim();
    if (!trimmed) return;
    await createComment.mutateAsync({ content: trimmed });
    setNewComment('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handlePost();
  };

  const handleStartEdit = (comment: Comment) => {
    setEditingId(comment._id);
    setEditContent(comment.content);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editContent.trim()) return;
    await updateComment.mutateAsync({
      commentId: editingId,
      content: editContent.trim(),
    });
    setEditingId(null);
    setEditContent('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  return (
    <div className="space-y-4">

      {/* Header */}
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Comments
        {comments.length > 0 && (
          <span className="ml-2 text-xs font-normal normal-case">
            ({comments.length})
          </span>
        )}
      </h3>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && comments.length === 0 && (
        <p className="text-sm text-muted-foreground italic py-4 text-center">
          No comments yet. Be the first to comment.
        </p>
      )}

      {/* Comment thread */}
      {!isLoading && comments.length > 0 && (
        <div className="space-y-5">
          {comments.map((comment) => {
            const isOwn     = currentUser?._id === comment.user._id;
            const isEditing = editingId === comment._id;

            return (
              <div key={comment._id} className="flex gap-3 group">
                <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                  <AvatarImage src={comment.user.avatar?.url} />
                  <AvatarFallback className="text-xs">
                    {comment.user.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0 space-y-1">
                  {/* Username + time */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">
                      {comment.user.username}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {timeAgo(comment.createdAt)}
                    </span>
                    {comment.updatedAt !== comment.createdAt && (
                      <span className="text-xs text-muted-foreground italic">
                        (edited)
                      </span>
                    )}
                  </div>

                  {/* Body or edit input */}
                  {isEditing ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="text-sm min-h-[80px] resize-none"
                        autoFocus
                      />
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          className="h-7 px-3 text-xs"
                          onClick={handleSaveEdit}
                          disabled={!editContent.trim() || updateComment.isPending}
                        >
                          {updateComment.isPending ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <><Check className="h-3 w-3 mr-1" />Save</>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-3 text-xs"
                          onClick={handleCancelEdit}
                        >
                          <X className="h-3 w-3 mr-1" />Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm leading-relaxed break-words">
                        {comment.content}
                      </p>

                      {/* Own comment actions — visible on hover */}
                      {isOwn && (
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity pt-0.5">
                          <button
                            onClick={() => handleStartEdit(comment)}
                            aria-label="Edit comment"
                            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                          >
                            <Pencil className="h-3 w-3" />Edit
                          </button>
                          <button
                            onClick={() => deleteComment.mutate(comment._id)}
                            aria-label="Delete comment"
                            disabled={deleteComment.isPending}
                            className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="h-3 w-3" />Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      )}

      {/* New comment input */}
      <div className="space-y-2 pt-2 border-t">
        <div className="flex gap-3">
          <Avatar className="h-8 w-8 shrink-0 mt-1">
            <AvatarImage src={currentUser?.avatar?.url} />
            <AvatarFallback className="text-xs">
              {currentUser?.username?.slice(0, 2).toUpperCase() ?? '?'}
            </AvatarFallback>
          </Avatar>
          <Textarea
            placeholder="Write a comment... (Ctrl+Enter to post)"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
            className="text-sm min-h-[80px] resize-none flex-1"
          />
        </div>
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={handlePost}
            disabled={!newComment.trim() || createComment.isPending}
          >
            {createComment.isPending ? (
              <><Loader2 className="h-3 w-3 mr-2 animate-spin" />Posting...</>
            ) : (
              'Post Comment'
            )}
          </Button>
        </div>
      </div>

    </div>
  );
}