// src/services/user.service.ts
import {
  collection, doc, getDoc, getDocs, updateDoc,
  query, where, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../config/constants';
import { AppUser } from '../types';

const usersCol = () => collection(db, COLLECTIONS.USERS);

export const userService = {
  async getUser(userId: string): Promise<AppUser | null> {
    const snap = await getDoc(doc(usersCol(), userId));
    if (!snap.exists()) return null;
    return { userId: snap.id, ...snap.data() } as AppUser;
  },

  async getClubMembers(clubId: string): Promise<AppUser[]> {
    const q = query(usersCol(), where('clubId', '==', clubId), where('status', '==', 'active'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ userId: d.id, ...d.data() } as AppUser));
  },

  async getPendingMembers(clubId: string): Promise<AppUser[]> {
    const q = query(usersCol(), where('clubId', '==', clubId), where('status', '==', 'pending'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ userId: d.id, ...d.data() } as AppUser));
  },

  async updateUser(userId: string, updates: Partial<AppUser>): Promise<void> {
    const payload = Object.fromEntries(
      Object.entries({ ...updates, updatedAt: serverTimestamp() }).filter(([, v]) => v !== undefined),
    );
    await updateDoc(doc(usersCol(), userId), payload);
  },

  async approvePlayer(userId: string): Promise<void> {
    await updateDoc(doc(usersCol(), userId), {
      status: 'active',
      updatedAt: serverTimestamp(),
    });
  },

  async rejectPlayer(userId: string): Promise<void> {
    await updateDoc(doc(usersCol(), userId), {
      status: 'suspended',
      updatedAt: serverTimestamp(),
    });
  },

  async updateFcmToken(userId: string, token: string): Promise<void> {
    await updateDoc(doc(usersCol(), userId), { fcmToken: token });
  },
};
