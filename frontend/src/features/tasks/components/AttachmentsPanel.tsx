import { useRef } from 'react';
import {
  ImageIcon,
  FileText,
  Film,
  File,
  Download,
  Eye,
  Trash2,
  Paperclip,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAddAttachmentMutation, useRemoveAttachmentMutation } from '../api';
import type { TaskAttachment } from '../types';

interface AttachmentsPanelProps {
  projectId: string;
  taskId: string;
  attachments: TaskAttachment[];
  canManage: boolean; // only project_admin or owner can add/remove
}

// ── File size formatter ────────────────────────────────────────────────────────
// Turns 12345 bytes into "12.1 KB"
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── File type → icon mapper ────────────────────────────────────────────────────
// Returns the right icon based on mimeType
function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/'))
    return <ImageIcon className="h-5 w-5 text-blue-500" />;
  if (mimeType.startsWith('video/'))
    return <Film className="h-5 w-5 text-purple-500" />;
  if (mimeType === 'application/pdf')
    return <FileText className="h-5 w-5 text-red-500" />;
  return <File className="h-5 w-5 text-gray-500" />;
}

// ── Is this file previewable in browser? ──────────────────────────────────────
function isPreviewable(mimeType: string): boolean {
  return (
    mimeType.startsWith('image/') ||
    mimeType === 'application/pdf' ||
    mimeType.startsWith('video/')
  );
}

export default function AttachmentsPanel({
  projectId,
  taskId,
  attachments,
  canManage,
}: AttachmentsPanelProps) {
  // Hidden file input — triggered by the Add Attachment button
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addAttachment    = useAddAttachmentMutation(projectId, taskId);
  const removeAttachment = useRemoveAttachmentMutation(projectId, taskId);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    // Max 5 files per API docs
    const allowed = files.slice(0, 5);
    await addAttachment.mutateAsync(allowed);

    // Reset the input so same file can be re-uploaded if needed
    e.target.value = '';
  };

  const handlePreview = (url: string) => {
    // Open in new tab — browser handles image/pdf/video natively
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDownload = (url: string, filename: string) => {
    // Create invisible anchor, click it, remove it
    // This forces a download instead of opening in browser
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleRemove = (publicId: string) => {
    removeAttachment.mutate(publicId);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-3">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Attachments
          {attachments.length > 0 && (
            <span className="ml-2 text-xs font-normal normal-case">
              ({attachments.length})
            </span>
          )}
        </h3>

        {/* Add button — only for admin/owner */}
        {canManage && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => fileInputRef.current?.click()}
            //disabled={addAttachment.isPending}
              disabled={true} // ← disabled until Cloudinary is configured
              title="File uploads coming soon"

            >
              {addAttachment.isPending ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Paperclip className="h-3 w-3 mr-1" />
              )}
              {addAttachment.isPending ? 'Uploading...' : 'Add'}
            </Button>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,application/pdf"
              className="hidden"
              onChange={handleFileChange}
              aria-label="Upload attachments"
            />
          </>
        )}
      </div>

      {/* Empty state
      {attachments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-muted rounded-lg">
          <Paperclip className="h-8 w-8 text-muted-foreground/40 mb-2" />
          <p className="text-xs text-muted-foreground">
            {canManage ? 'Click Add to upload files' : 'No attachments'}
          </p>
        </div>
      )} */}

        {/* Empty state */}
    {attachments.length === 0 && (
    <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-muted rounded-lg">
        <Paperclip className="h-8 w-8 text-muted-foreground/40 mb-2" />
        <p className="text-xs text-muted-foreground">No attachments</p>
        {canManage && (
        <p className="text-xs text-muted-foreground/60 mt-1">
            File uploads coming soon
        </p>
        )}
    </div>
    )}

      {/* Attachment grid */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.public_id}
              className="flex items-center gap-3 p-2.5 rounded-lg border bg-muted/30 group hover:bg-muted/60 transition-colors"
            >
              {/* File type icon */}
              <div className="shrink-0">
                {getFileIcon(attachment.mimeType)}
              </div>

              {/* File info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {attachment.original_filename}.{attachment.format}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(attachment.bytes)}
                </p>
              </div>

              {/* Action buttons — visible on hover */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">

                {/* Preview — only for previewable types */}
                {isPreviewable(attachment.mimeType) && (
                  <button
                    onClick={() => handlePreview(attachment.url)}
                    aria-label="Preview file"
                    className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                )}

                {/* Download */}
                <button
                  onClick={() =>
                    handleDownload(
                      attachment.url,
                      `${attachment.original_filename}.${attachment.format}`
                    )
                  }
                  aria-label="Download file"
                  className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                </button>

                {/* Remove — only for admin/owner */}
                {canManage && (
                  <button
                    onClick={() => handleRemove(attachment.public_id)}
                    aria-label="Remove attachment"
                    disabled={removeAttachment.isPending}
                    className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-background transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}