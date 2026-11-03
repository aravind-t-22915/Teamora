// src/types/gallery.types.ts

import { Timestamp } from 'firebase/firestore';

export type MediaType = 'photo' | 'video';

export interface GalleryMedia {
  mediaId: string;
  eventId: string;
  clubId: string;
  uploadedBy: string;
  uploaderName: string;
  type: MediaType;
  url: string;
  thumbnailUrl: string;
  caption: string;
  width: number;
  height: number;
  fileSize: number;
  isHighlight: boolean;
  likes: string[];
  likeCount: number;
  createdAt: Timestamp;
}
