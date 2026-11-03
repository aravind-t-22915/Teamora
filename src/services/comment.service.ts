// src/services/comment.service.ts
import {
  collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp, onSnapshot,
  arrayUnion, arrayRemove, increment,
  Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../config/constants';

export interface Comment {
  commentId: string;
  eventId: string;
  clubId: string;
  userId: string;
  displayName: string;
  photoUrl: string;
  text: string;
  likes: string[];
  likeCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const commentsCol = () => collection(db, COLLECTIONS.COMMENTS);
const eventsCol  = () => collection(db, COLLECTIONS.EVENTS);

export const commentService = {
  async getComments(eventId: string): Promise<Comment[]> {
    const q = query(
      commentsCol(),
      where('eventId', '==', eventId),
      orderBy('createdAt', 'asc'),
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ commentId: d.id, ...d.data() } as Comment));
  },

  async addComment(
    eventId: string,
    clubId: string,
    userId: string,
    displayName: string,
    photoUrl: string,
    text: string,
  ): Promise<Comment> {
    const ref = await addDoc(commentsCol(), {
      eventId,
      clubId,
      userId,
      displayName,
      photoUrl,
      text,
      likes: [],
      likeCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await updateDoc(doc(eventsCol(), eventId), {
      commentCount: increment(1),
    });
    const snap = await getDoc(ref);
    return { commentId: snap.id, ...snap.data() } as Comment;
  },

  async deleteComment(commentId: string, eventId: string): Promise<void> {
    await deleteDoc(doc(commentsCol(), commentId));
    await updateDoc(doc(eventsCol(), eventId), {
      commentCount: increment(-1),
    });
  },

  async toggleLike(commentId: string, userId: string): Promise<void> {
    const snap = await getDoc(doc(commentsCol(), commentId));
    if (!snap.exists()) return;
    const data = snap.data() as Comment;
    const hasLiked = (data.likes ?? []).includes(userId);
    await updateDoc(doc(commentsCol(), commentId), {
      likes:     hasLiked ? arrayRemove(userId) : arrayUnion(userId),
      likeCount: increment(hasLiked ? -1 : 1),
      updatedAt: serverTimestamp(),
    });
  },

  subscribeComments(eventId: string, cb: (comments: Comment[]) => void): Unsubscribe {
    const q = query(
      commentsCol(),
      where('eventId', '==', eventId),
      orderBy('createdAt', 'asc'),
    );
    return onSnapshot(q, snap => {
      cb(snap.docs.map(d => ({ commentId: d.id, ...d.data() } as Comment)));
    });
  },
};
