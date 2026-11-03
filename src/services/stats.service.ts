// src/services/stats.service.ts
import {
  collection, doc, getDoc, getDocs,
  query, where, orderBy, setDoc, updateDoc,
  serverTimestamp, increment, arrayUnion,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../config/constants';
import { PlayerStats } from '../types';

const statsCol = () => collection(db, COLLECTIONS.PLAYER_STATS);

const statsDocId = (userId: string, season: string): string => `${userId}_${season}`;

export const statsService = {
  async getPlayerStats(userId: string, season: string): Promise<PlayerStats | null> {
    const snap = await getDoc(doc(statsCol(), statsDocId(userId, season)));
    if (!snap.exists()) return null;
    return { statsId: snap.id, ...snap.data() } as PlayerStats;
  },

  async getClubStats(clubId: string, season: string): Promise<PlayerStats[]> {
    const q = query(
      statsCol(),
      where('clubId', '==', clubId),
      where('season', '==', season),
      orderBy('goals', 'desc'),
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ statsId: d.id, ...d.data() } as PlayerStats));
  },

  async upsertPlayerStats(
    userId: string,
    clubId: string,
    season: string,
    updates: Partial<PlayerStats>,
  ): Promise<void> {
    const docId = statsDocId(userId, season);
    await setDoc(doc(statsCol(), docId), {
      ...updates,
      statsId: docId,
      userId,
      clubId,
      season,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  },

  async incrementGoal(userId: string, season: string, isOwnGoal = false): Promise<void> {
    const docId = statsDocId(userId, season);
    await updateDoc(doc(statsCol(), docId), {
      ...(isOwnGoal ? {} : { goals: increment(1) }),
      shots:          increment(1),
      shotsOnTarget:  increment(1),
      updatedAt:      serverTimestamp(),
    });
  },

  async incrementStat(
    userId: string,
    season: string,
    field: keyof PlayerStats,
    amount = 1,
  ): Promise<void> {
    const docId = statsDocId(userId, season);
    await updateDoc(doc(statsCol(), docId), {
      [field as string]: increment(amount),
      updatedAt:         serverTimestamp(),
    });
  },

  /**
   * Atomically apply all stat contributions from a single match result.
   * Uses setDoc+merge so docs are created on first entry.
   * Call only once per result (on first save, not on re-saves).
   */
  async applyMatchStats(
    clubId: string,
    season: string,
    eventId: string,
    scorers:    { userId: string; playerName: string }[],
    assists:    { userId: string; playerName: string }[],
    motmId:     string | null,
    motmName:   string | null,
    yellowIds:  string[],
    redIds:     string[],
    minutesMap?: Map<string, number>,
  ): Promise<void> {
    // Build a map of userId → displayName from all named sources
    const nameMap = new Map<string, string>();
    for (const s of scorers) nameMap.set(s.userId, s.playerName);
    for (const a of assists) nameMap.set(a.userId, a.playerName);
    if (motmId && motmName) nameMap.set(motmId, motmName);

    // Collect per-player increments
    const deltas = new Map<string, Record<string, unknown>>();

    const getOrInit = (uid: string): Record<string, unknown> => {
      if (!deltas.has(uid)) deltas.set(uid, { appearances: increment(1) });
      return deltas.get(uid)!;
    };

    for (const { userId } of scorers) {
      const d = getOrInit(userId);
      d.goals          = increment(1);
      d.shots          = increment(1);
      d.shotsOnTarget  = increment(1);
    }
    for (const { userId } of assists) {
      const d = getOrInit(userId);
      d.assists = increment(1);
    }
    if (motmId) {
      const d = getOrInit(motmId);
      d.motmCount  = increment(1);
      d.motmEvents = arrayUnion(eventId);
    }
    for (const uid of yellowIds) {
      const d = getOrInit(uid);
      d.yellowCards = increment(1);
    }
    for (const uid of redIds) {
      const d = getOrInit(uid);
      d.redCards = increment(1);
    }

    const writes = Array.from(deltas.entries()).map(([userId, fields]) => {
      const docId   = statsDocId(userId, season);
      const docRef  = doc(statsCol(), docId);
      const payload: Record<string, unknown> = {
        ...fields,
        statsId:     docId,
        userId,
        clubId,
        season,
        updatedAt:   serverTimestamp(),
      };
      if (nameMap.has(userId)) payload.displayName = nameMap.get(userId);
      if (minutesMap?.has(userId)) payload.minutesPlayed = increment(minutesMap.get(userId)!);
      return setDoc(docRef, payload, { merge: true });
    });

    await Promise.all(writes);
  },

  async updateAttendanceStats(
    userId: string,
    clubId: string,
    season: string,
    prevStatus: string | null,
    newStatus: string,
  ): Promise<void> {
    const isAttending = (s: string | null) => s === 'going' || s === 'late';
    const docId  = statsDocId(userId, season);
    const docRef = doc(statsCol(), docId);

    const payload: Record<string, unknown> = { updatedAt: serverTimestamp() };

    // First response for this event increments totalInvited
    if (!prevStatus) payload.totalInvited = increment(1);

    if (isAttending(prevStatus) && !isAttending(newStatus)) {
      payload.totalAttended = increment(-1);
    } else if (!isAttending(prevStatus) && isAttending(newStatus)) {
      payload.totalAttended = increment(1);
    }

    // Only write if there are actual changes
    if (Object.keys(payload).length <= 1) return; // only updatedAt

    await setDoc(docRef, {
      ...payload,
      statsId: docId,
      userId,
      clubId,
      season,
    }, { merge: true });

    // Read back to compute fresh attendanceRate
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const d = snap.data();
      const invited  = (d.totalInvited  as number) ?? 0;
      const attended = (d.totalAttended as number) ?? 0;
      if (invited > 0) {
        await updateDoc(docRef, {
          attendanceRate: Math.round((attended / invited) * 100),
          updatedAt: serverTimestamp(),
        });
      }
    }
  },
};
