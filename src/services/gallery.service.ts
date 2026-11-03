// src/services/gallery.service.ts
import {
  collection, doc, addDoc, getDoc, getDocs, deleteDoc, updateDoc,
  query, where, orderBy, limit as firestoreLimit,
  serverTimestamp, arrayUnion, arrayRemove, increment,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../config/constants';
import { GalleryMedia } from '../types';

const galleryCol = () => collection(db, COLLECTIONS.GALLERY);
const eventsCol  = () => collection(db, COLLECTIONS.EVENTS);

export const galleryService = {
  async getEventGallery(eventId: string): Promise<GalleryMedia[]> {
    const q = query(
      galleryCol(),
      where('eventId', '==', eventId),
      orderBy('createdAt', 'desc'),
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ mediaId: d.id, ...d.data() } as GalleryMedia));
  },

  async getClubGallery(clubId: string, limitCount = 50): Promise<GalleryMedia[]> {
    const q = query(
      galleryCol(),
      where('clubId', '==', clubId),
      orderBy('createdAt', 'desc'),
      firestoreLimit(limitCount),
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ mediaId: d.id, ...d.data() } as GalleryMedia));
  },

  async addMedia(data: Omit<GalleryMedia, 'mediaId' | 'createdAt'>): Promise<GalleryMedia> {
    const ref = await addDoc(galleryCol(), {
      ...data,
      createdAt: serverTimestamp(),
    });
    await updateDoc(doc(eventsCol(), data.eventId), {
      galleryCount: increment(1),
    });
    const snap = await getDoc(ref);
    return { mediaId: snap.id, ...snap.data() } as GalleryMedia;
  },

  async deleteMedia(mediaId: string, eventId: string): Promise<void> {
    await deleteDoc(doc(galleryCol(), mediaId));
    await updateDoc(doc(eventsCol(), eventId), {
      galleryCount: increment(-1),
    });
  },

  async toggleLike(mediaId: string, userId: string): Promise<void> {
    const snap = await getDoc(doc(galleryCol(), mediaId));
    if (!snap.exists()) return;
    const data = snap.data() as GalleryMedia;
    const hasLiked = (data.likes ?? []).includes(userId);
    await updateDoc(doc(galleryCol(), mediaId), {
      likes:     hasLiked ? arrayRemove(userId) : arrayUnion(userId),
      likeCount: increment(hasLiked ? -1 : 1),
    });
  },

  async toggleHighlight(mediaId: string, isHighlight: boolean): Promise<void> {
    await updateDoc(doc(galleryCol(), mediaId), { isHighlight });
  },
};
