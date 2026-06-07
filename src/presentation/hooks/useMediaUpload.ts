// ============================================================================
// useMediaUpload — Upload product images/videos to Supabase Storage
// ============================================================================

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@infrastructure/api/supabaseClient';
import type { ProductMedia, ProductMediaInsert } from '@core/entities';

const BUCKET = 'product-media';

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------

export const mediaKeys = {
  all: ['product-media'] as const,
  byProduct: (productId: string) => [...mediaKeys.all, productId] as const,
};

// ---------------------------------------------------------------------------
// Fetch media for a product
// ---------------------------------------------------------------------------

export function useProductMedia(productId: string | undefined) {
  return useQuery({
    queryKey: mediaKeys.byProduct(productId ?? ''),
    queryFn: async (): Promise<ProductMedia[]> => {
      const { data, error } = await supabase
        .from('product_media')
        .select('*')
        .eq('product_id', productId!)
        .order('sort_order', { ascending: true });

      if (error) throw new Error(error.message);
      return (data ?? []) as ProductMedia[];
    },
    enabled: !!productId,
  });
}

// ---------------------------------------------------------------------------
// Upload file to Supabase Storage + insert product_media row
// ---------------------------------------------------------------------------

export function useUploadMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      file,
      sortOrder = 0,
    }: {
      productId: string;
      file: File;
      sortOrder?: number;
    }): Promise<ProductMedia> => {
      // 1. Generate a unique file path
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
      const fileName = `${productId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      // 2. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      // 3. Get the public URL
      const { data: urlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;

      // 4. Determine media type
      const isVideo = ['mp4', 'webm', 'mov', 'avi'].includes(ext);
      const mediaType = isVideo ? 'video' : 'image';

      // 5. Insert into product_media table
      const insertPayload: ProductMediaInsert = {
        product_id: productId,
        media_url: publicUrl,
        media_type: mediaType as 'image',
        sort_order: sortOrder,
        alt_text: file.name,
      };

      const { data, error: insertError } = await supabase
        .from('product_media')
        .insert(insertPayload)
        .select('*')
        .single();

      if (insertError) throw new Error(`Failed to save media record: ${insertError.message}`);
      return data as ProductMedia;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.byProduct(variables.productId) });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// ---------------------------------------------------------------------------
// Delete media — removes from storage + database
// ---------------------------------------------------------------------------

export function useDeleteMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      media,
    }: {
      media: ProductMedia;
    }): Promise<void> => {
      // 1. Extract storage path from URL
      // URL format: https://<project>.supabase.co/storage/v1/object/public/product-media/<path>
      const url = media.media_url;
      const bucketPath = url.split(`/storage/v1/object/public/${BUCKET}/`)[1];

      if (bucketPath) {
        // Remove from storage (best effort — DB record is what matters)
        await supabase.storage.from(BUCKET).remove([bucketPath]);
      }

      // 2. Delete from database
      const { error } = await supabase
        .from('product_media')
        .delete()
        .eq('id', media.id);

      if (error) throw new Error(`Failed to delete media: ${error.message}`);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.byProduct(variables.media.product_id) });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// ---------------------------------------------------------------------------
// Simple progress tracker for multiple uploads
// ---------------------------------------------------------------------------

export function useMultiUpload() {
  const [progress, setProgress] = useState({ total: 0, completed: 0 });
  const uploadMedia = useUploadMedia();

  const uploadFiles = async (productId: string, files: File[]) => {
    setProgress({ total: files.length, completed: 0 });
    const results: ProductMedia[] = [];

    for (let i = 0; i < files.length; i++) {
      const result = await uploadMedia.mutateAsync({
        productId,
        file: files[i],
        sortOrder: i,
      });
      results.push(result);
      setProgress((prev) => ({ ...prev, completed: prev.completed + 1 }));
    }

    setProgress({ total: 0, completed: 0 });
    return results;
  };

  return {
    uploadFiles,
    progress,
    isUploading: progress.total > 0,
  };
}
