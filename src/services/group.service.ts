// src/services/group.service.ts
import {
  collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc,
  query, where, serverTimestamp, onSnapshot,
  arrayUnion, arrayRemove, increment,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../config/constants';
import { Group } from '../types';

const groupsCol = () => collection(db, COLLECTIONS.GROUPS);

export const groupService = {
  async getClubGroups(clubId: string): Promise<Group[]> {
    const q = query(groupsCol(), where('clubId', '==', clubId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ groupId: d.id, ...d.data() } as Group));
  },

  async createGroup(
    clubId: string,
    createdBy: string,
    data: Pick<Group, 'name' | 'description' | 'color' | 'emoji'>,
  ): Promise<Group> {
    const ref = await addDoc(groupsCol(), {
      ...data,
      clubId,
      createdBy,
      memberIds: [],
      memberCount: 0,
      isDefault: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    const snap = await getDoc(ref);
    return { groupId: ref.id, ...snap.data() } as Group;
  },

  async updateGroup(
    groupId: string,
    data: Partial<Omit<Group, 'groupId' | 'clubId' | 'createdBy' | 'createdAt'>>,
  ): Promise<void> {
    const payload = Object.fromEntries(
      Object.entries({ ...data, updatedAt: serverTimestamp() }).filter(([, v]) => v !== undefined),
    );
    await updateDoc(doc(groupsCol(), groupId), payload);
  },

  async deleteGroup(groupId: string): Promise<void> {
    await deleteDoc(doc(groupsCol(), groupId));
  },

  async addMemberToGroup(groupId: string, userId: string): Promise<void> {
    await updateDoc(doc(groupsCol(), groupId), {
      memberIds: arrayUnion(userId),
      memberCount: increment(1),
      updatedAt: serverTimestamp(),
    });
  },

  async removeMemberFromGroup(groupId: string, userId: string): Promise<void> {
    await updateDoc(doc(groupsCol(), groupId), {
      memberIds: arrayRemove(userId),
      memberCount: increment(-1),
      updatedAt: serverTimestamp(),
    });
  },

  subscribeGroups(clubId: string, cb: (groups: Group[]) => void): Unsubscribe {
    const q = query(groupsCol(), where('clubId', '==', clubId));
    return onSnapshot(q, snap => {
      cb(snap.docs.map(d => ({ groupId: d.id, ...d.data() } as Group)));
    });
  },
};
