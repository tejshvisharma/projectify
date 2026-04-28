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
  canManage: boolean;
}

// ── File size formatter ────────────────────────────────────────────────────────
function formatBytes(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── File type → icon mapper (NEW SAFE VERSION) ─────────────────────────────────
function getFileIcon(file: any) {
  const mimeType = file?.mimeType || '';
  const ext = file?.extension || file?.format || '';

  if (mimeType.startsWith('image/'))
    return <ImageIcon className="h-5 w-5 text-blue-500" />;

  if (mimeType.startsWith('video/'))
    return <Film className="h-5 w-5 text-purple-500" />;

  if (ext === 'pdf' || mimeType === 'application/pdf')
    return <FileText className="h-5 w-5 text-red-500" />;

  return <File className="h-5 w-5 text-gray-500" />;
}

// ── Preview support ────────────────────────────────────────────────────────────
function isPreviewable(file: any): boolean {
  const mimeType = file?.mimeType || '';
  const ext = file?.extension || file?.format || '';

  return (
    mimeType.startsWith('image/') ||
    mimeType.startsWith('video/') ||
    ext === 'pdf' ||
    mimeType === 'application/pdf'
  );
}

export default function AttachmentsPanel({
  projectId,
  taskId,
  attachments,
  canManage,
}: AttachmentsPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addAttachment = useAddAttachmentMutation(projectId, taskId);
  const removeAttachment = useRemoveAttachmentMutation(projectId, taskId);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const allowed = files.slice(0, 5);
    try {
      await addAttachment.mutateAsync(allowed);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Upload failed');
    }

    e.target.value = '';
  };

  const handlePreview = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDownload = (url: string, filename: string) => {
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

        {canManage && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => fileInputRef.current?.click()}
              disabled={addAttachment.isPending}
              title="Upload attachments"
            >
              {addAttachment.isPending ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Paperclip className="h-3 w-3 mr-1" />
              )}
              {addAttachment.isPending ? 'Uploading...' : 'Add'}
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="*/*"
              className="hidden"
              onChange={handleFileChange}
              aria-label="Upload attachments"
            />
          </>
        )}
      </div>

      {/* Empty state */}
      {attachments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-muted rounded-lg">
          <Paperclip className="h-8 w-8 text-muted-foreground/40 mb-2" />
          <p className="text-xs text-muted-foreground">
            {canManage ? 'Click Add to upload files' : 'No attachments'}
          </p>
        </div>
      )}

      {/* Attachment list */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment) => {
            const fileName =
              attachment.originalName ||
              'file';

            const extension =
              attachment.extension || attachment.format || '';

            const size =
              attachment.size || 0;

            return (
              <div
                key={attachment.public_id}
                className="flex items-center gap-3 p-2.5 rounded-lg border bg-muted/30 group hover:bg-muted/60 transition-colors"
              >
                {/* Icon */}
                <div className="shrink-0">
                  {getFileIcon(attachment)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {extension ? `${fileName}` : fileName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatBytes(size)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">

                  {isPreviewable(attachment) && (
                    <button
                      type="button"
                      title="Preview"
                      onClick={() => handlePreview(attachment.url)}
                      className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    title="Download"
                    onClick={() =>
                      handleDownload(
                        attachment.url,
                        extension ? `${fileName}.${extension}` : fileName
                      )
                    }
                    className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>

                  {canManage && (
                    <button
                      type="button"
                      title="Remove"
                      onClick={() => handleRemove(attachment.public_id)}
                      disabled={removeAttachment.isPending}
                      className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-background transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}