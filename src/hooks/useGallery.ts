// src/hooks/useGallery.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { galleryService } from '../services/gallery.service';
import { storageService } from '../services/storage.service';
import { useAuthStore } from '../stores/authStore';
import { MediaType } from '../types';
import { PAGINATION } from '../config/constants';

// ─── Query keys ───────────────────────────────────────────────────────────────
export const GALLERY_KEYS = {
  event: (eventId: string) => ['gallery', 'event', eventId] as const,
  club:  (clubId: string)  => ['gallery', 'club', clubId] as const,
};

// ─── Event gallery ────────────────────────────────────────────────────────────
export function useEventGallery(eventId: string) {
  return useQuery({
    queryKey: GALLERY_KEYS.event(eventId),
    queryFn:  () => galleryService.getEventGallery(eventId),
    enabled:  !!eventId,
    staleTime: 30_000,
  });
}

// ─── Club gallery ─────────────────────────────────────────────────────────────
export function useClubGallery(limitCount = PAGINATION.GALLERY_PER_PAGE) {
  const clubId = useAuthStore(s => s.club?.clubId ?? '');
  return useQuery({
    queryKey: GALLERY_KEYS.club(clubId),
    queryFn:  () => galleryService.getClubGallery(clubId, limitCount),
    enabled:  !!clubId,
    staleTime: 30_000,
  });
}

// ─── Upload media ─────────────────────────────────────────────────────────────
interface UploadMediaInput {
  localUri:  string;
  eventId:   string;
  type:      MediaType;
  caption:   string;
  width:     number;
  height:    number;
  fileSize:  number;
}

export function useUploadMedia() {
  const qc             = useQueryClient();
  const { club, user } = useAuthStore();
  return useMutation({
    mutationFn: async (input: UploadMediaInput) => {
      const { localUri, eventId, type, caption, width, height, fileSize } = input;
      const timestamp = Date.now();
      const basePath  = `gallery/${club!.clubId}/${eventId}/${timestamp}`;
      const [url, thumbnailUrl] = await Promise.all([
        storageService.uploadImage(localUri, `${basePath}/original`),
        storageService.uploadThumbnail(localUri, `${basePath}/thumb`),
      ]);
      return galleryService.addMedia({
        eventId,
        clubId:       club!.clubId,
        uploadedBy:   user!.userId,
        uploaderName: user!.displayName,
        type,
        url,
        thumbnailUrl,
        caption,
        width,
        height,
        fileSize,
        isHighlight:  false,
        likes:        [],
        likeCount:    0,
      });
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: GALLERY_KEYS.event(vars.eventId) });
      qc.invalidateQueries({ queryKey: GALLERY_KEYS.club(club!.clubId) });
    },
  });
}

// ─── Delete media ─────────────────────────────────────────────────────────────
export function useDeleteMedia() {
  const qc   = useQueryClient();
  const club = useAuthStore(s => s.club);
  return useMutation({
    mutationFn: async ({
      mediaId,
      eventId,
      url,
    }: {
      mediaId: string;
      eventId: string;
      url: string;
    }) => {
      await storageService.deleteFile(url);
      return galleryService.deleteMedia(mediaId, eventId);
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: GALLERY_KEYS.event(vars.eventId) });
      qc.invalidateQueries({ queryKey: GALLERY_KEYS.club(club!.clubId) });
    },
  });
}

// ─── Toggle media like ────────────────────────────────────────────────────────
export function useToggleMediaLike() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ mediaId, userId }: { mediaId: string; userId: string }) =>
      galleryService.toggleLike(mediaId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gallery'] });
    },
  });
}
