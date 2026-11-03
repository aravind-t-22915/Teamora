// src/services/squad.service.ts
import {
  collection, doc, getDocs, updateDoc, query, where,
  serverTimestamp, onSnapshot, type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../config/constants';
import { AppUser, UserStatus } from '../types';

const usersCol = () => collection(db, COLLECTIONS.USERS);

export const squadService = {
  // ─── Fetch all club members ────────────────────────────────────────────────
  async getClubPlayers(clubId: string): Promise<AppUser[]> {
    const q    = query(usersCol(), where('clubId', '==', clubId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ userId: d.id, ...d.data() } as AppUser));
  },

  // ─── Real-time subscription ────────────────────────────────────────────────
  subscribeClubPlayers(clubId: string, cb: (players: AppUser[]) => void): Unsubscribe {
    const q = query(usersCol(), where('clubId', '==', clubId));
    return onSnapshot(q, snap =>
      cb(snap.docs.map(d => ({ userId: d.id, ...d.data() } as AppUser))),
    );
  },

  // ─── Approve / Reject player ──────────────────────────────────────────────
  async approvePlayer(userId: string): Promise<void> {
    await updateDoc(doc(usersCol(), userId), {
      status: 'active' as UserStatus,
      updatedAt: serverTimestamp(),
    });
  },

  async rejectPlayer(userId: string): Promise<void> {
    await updateDoc(doc(usersCol(), userId), {
      status: 'suspended' as UserStatus,
      updatedAt: serverTimestamp(),
    });
  },

  // ─── Update player profile fields ─────────────────────────────────────────
  async updatePlayerProfile(
    userId:  string,
    updates: Partial<Pick<AppUser,
      'position' | 'preferredFoot' | 'jerseyNumber' |
      'phone' | 'height' | 'weight' | 'firstName' | 'lastName' | 'displayName'
    >>,
  ): Promise<void> {
    await updateDoc(doc(usersCol(), userId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },
};
