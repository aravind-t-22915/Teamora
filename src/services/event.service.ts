// src/services/event.service.ts
import {
  collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc,
  query, where, Timestamp, serverTimestamp, onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../config/constants';
import { AppEvent, CreateEventInput } from '../types';

// Helper: safely get milliseconds from a Firestore Timestamp or serialised form
function toMs(val: unknown): number {
  try {
    if (!val) return 0;
    if (typeof val === 'object' && val !== null) {
      if ('toMillis' in val && typeof (val as { toMillis: unknown }).toMillis === 'function')
        return (val as { toMillis: () => number }).toMillis();
      if ('toDate' in val && typeof (val as { toDate: unknown }).toDate === 'function')
        return (val as { toDate: () => Date }).toDate().getTime();
      if ('seconds' in val && typeof (val as { seconds: unknown }).seconds === 'number')
        return (val as { seconds: number }).seconds * 1000;
      if ('_seconds' in val && typeof (val as { _seconds: unknown })._seconds === 'number')
        return (val as { _seconds: number })._seconds * 1000;
    }
    return new Date(val as string).getTime() || 0;
  } catch { return 0; }
}

const eventsCol = () => collection(db, COLLECTIONS.EVENTS);

export const eventService = {
  // ─── Create ───────────────────────────────────────────────────────────────
  async createEvent(clubId: string, createdBy: string, input: CreateEventInput): Promise<AppEvent> {
    // Firestore rejects undefined — strip all undefined fields before writing
    const clean = Object.fromEntries(
      Object.entries(input).filter(([, v]) => v !== undefined),
    );
    const ref = await addDoc(eventsCol(), {
      ...clean,
      clubId,
      createdBy,
      status: 'scheduled',
      date: Timestamp.fromDate(input.date),
      isMatch: ['league_match', 'tournament_match', 'friendly_match', 'practice_match'].includes(input.type),
      result: null,
      coverImageUrl: null,
      attendanceCount: { going: 0, maybe: 0, notGoing: 0, late: 0, needPickup: 0, noResponse: 0 },
      commentCount: 0,
      galleryCount: 0,
      notificationSentAt: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    const snap = await getDoc(ref);
    return { eventId: ref.id, ...snap.data() } as AppEvent;
  },

  // ─── Read list ────────────────────────────────────────────────────────────
  async getUpcomingEvents(clubId: string, count = 5): Promise<AppEvent[]> {
    const now = Timestamp.now();
    // Single-field query to avoid composite index requirement; filter client-side
    const q = query(eventsCol(), where('clubId', '==', clubId));
    const snap = await getDocs(q);
    return snap.docs
      .map(d => ({ eventId: d.id, ...d.data() } as AppEvent))
      .filter(e => {
        return toMs(e.date) >= now.toMillis() && e.status !== 'cancelled';
      })
      .sort((a, b) => toMs(a.date) - toMs(b.date))
      .slice(0, count);
  },

  async getEventsByMonth(clubId: string, year: number, month: number): Promise<AppEvent[]> {
    const start = new Date(year, month - 1, 1).getTime();
    const end   = new Date(year, month, 1).getTime();
    const q = query(eventsCol(), where('clubId', '==', clubId));
    const snap = await getDocs(q);
    return snap.docs
      .map(d => ({ eventId: d.id, ...d.data() } as AppEvent))
      .filter(e => {
        const ms = toMs(e.date);
        return ms >= start && ms < end;
      })
      .sort((a, b) => toMs(a.date) - toMs(b.date));
  },

  async getAllEvents(clubId: string): Promise<AppEvent[]> {
    const q = query(eventsCol(), where('clubId', '==', clubId));
    const snap = await getDocs(q);
    return snap.docs
      .map(d => ({ eventId: d.id, ...d.data() } as AppEvent))
      .sort((a, b) => toMs(a.date) - toMs(b.date));
  },

  // ─── Read single ──────────────────────────────────────────────────────────
  async getEvent(_clubId: string, eventId: string): Promise<AppEvent | null> {
    const snap = await getDoc(doc(eventsCol(), eventId));
    if (!snap.exists()) return null;
    return { eventId: snap.id, ...snap.data() } as AppEvent;
  },

  // ─── Real-time single ────────────────────────────────────────────────────
  subscribeEvent(
    _clubId: string,
    eventId: string,
    cb: (event: AppEvent | null) => void,
  ): Unsubscribe {
    return onSnapshot(doc(eventsCol(), eventId), snap => {
      cb(snap.exists() ? ({ eventId: snap.id, ...snap.data() } as AppEvent) : null);
    });
  },

  // ─── Update ───────────────────────────────────────────────────────────────
  async updateEvent(
    clubId: string,
    eventId: string,
    updates: Partial<CreateEventInput & { status: AppEvent['status'] }>,
  ): Promise<void> {
    const payload: Record<string, unknown> = Object.fromEntries(
      Object.entries({ ...updates, updatedAt: serverTimestamp() }).filter(([, v]) => v !== undefined),
    );
    if (updates.date) payload['date'] = Timestamp.fromDate(updates.date);
    await updateDoc(doc(eventsCol(), eventId), payload);
  },

  // ─── Delete ───────────────────────────────────────────────────────────────
  async deleteEvent(_clubId: string, eventId: string): Promise<void> {
    await deleteDoc(doc(eventsCol(), eventId));
  },
};
