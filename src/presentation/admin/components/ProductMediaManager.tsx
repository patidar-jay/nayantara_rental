// ============================================================================
// ProductMediaManager — Upload, view, and delete product images/videos
// Shows inside the product form modal (only after product is created/saved)
// ============================================================================

import { useRef, useState } from 'react';
import { useProductMedia, useUploadMedia, useDeleteMedia } from '@hooks';
import { useToast } from '@presentation/shared/Toast';
import type { ProductMedia } from '@core/entities';
import { cn } from '@utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProductMediaManagerProps {
  productId: string;
}

// ---------------------------------------------------------------------------
// Accepted file types
// ---------------------------------------------------------------------------

const ACCEPTED_TYPES = 'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ProductMediaManager({ productId }: ProductMediaManagerProps) {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const { data: mediaList = [], isLoading } = useProductMedia(productId);
  const uploadMedia = useUploadMedia();
  const deleteMedia = useDeleteMedia();

  // ---- Upload Handler ----
  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`"${file.name}" is too large (max 10MB)`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setUploading(true);
    let successCount = 0;

    for (const file of validFiles) {
      try {
        await uploadMedia.mutateAsync({
          productId,
          file,
          sortOrder: mediaList.length + successCount,
        });
        successCount++;
      } catch (err) {
        toast.error(`Failed to upload "${file.name}": ${(err as Error).message}`);
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} file(s) uploaded`);
    }
    setUploading(false);

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ---- Delete Handler ----
  const handleDelete = async (media: ProductMedia) => {
    if (!confirm('Delete this media? This cannot be undone.')) return;
    try {
      await deleteMedia.mutateAsync({ media });
      toast.success('Media deleted');
    } catch (err) {
      toast.error((err as Error).message ?? 'Failed to delete');
    }
  };

  // ---- Drag & Drop ----
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text">Media ({mediaList.length})</h3>
        {uploading && (
          <span className="text-xs text-primary flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            Uploading…
          </span>
        )}
      </div>

      {/* Upload Area */}
      <div
        className={cn(
          'relative rounded-xl border-2 border-dashed p-6 text-center transition-all cursor-pointer',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/40 hover:bg-background',
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED_TYPES}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <svg className="h-8 w-8 mx-auto text-text-muted mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        <p className="text-sm text-text-muted">
          {isDragging ? (
            <span className="text-primary font-medium">Drop files here</span>
          ) : (
            <>
              <span className="text-primary font-medium">Click to upload</span> or drag & drop
            </>
          )}
        </p>
        <p className="text-xs text-text-muted mt-1">JPG, PNG, WebP, GIF, MP4, WebM — Max 10MB</p>
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-square rounded-xl skeleton" />
          ))}
        </div>
      ) : mediaList.length > 0 ? (
        <div className="grid grid-cols-3 gap-3">
          {mediaList.map((media, idx) => (
            <div
              key={media.id}
              className="group relative aspect-square rounded-xl overflow-hidden bg-background border border-border"
            >
              {media.media_url.match(/\.(mp4|webm|mov)$/i) ? (
                <video
                  src={media.media_url}
                  className="w-full h-full object-cover"
                  muted
                  preload="metadata"
                />
              ) : (
                <img
                  src={media.media_url}
                  alt={media.alt_text ?? `Product image ${idx + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              )}

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleDelete(media); }}
                  disabled={deleteMedia.isPending}
                  className="flex items-center gap-1.5 rounded-lg bg-red-500/80 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-500 transition-colors disabled:opacity-50"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                  Delete
                </button>
              </div>

              {/* Index badge */}
              <div className="absolute top-1.5 left-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-[10px] font-bold text-white">
                {idx + 1}
              </div>

              {/* Video badge */}
              {media.media_url.match(/\.(mp4|webm|mov)$/i) && (
                <div className="absolute top-1.5 right-1.5 flex items-center gap-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  Video
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-xs text-text-muted py-4">No media uploaded yet</p>
      )}
    </div>
  );
}
