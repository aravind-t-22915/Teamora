// src/services/attendance.service.ts
import {
  collection, doc, setDoc, getDoc, getDocs, query, where,
  onSnapshot, serverTimestamp, runTransaction,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../config/constants';
import { Attendance, AttendanceStatus } from '../types';
import { statsService } from './stats.service';

const attendanceCol = () => collection(db, COLLECTIONS.ATTENDANCE);
const eventsCol     = () => collection(db, COLLECTIONS.EVENTS);

// Deterministic doc ID — O(1) lookup, no composite index needed
const attDocId = (eventId: string, userId: string) => `${eventId}_${userId}`;

// Map AttendanceStatus → attendanceCount key
function statusKey(s: AttendanceStatus): keyof {
  going: number; maybe: number; notGoing: number;
  late: number; needPickup: number; noResponse: number;
} {
  switch (s) {
    case 'going':       return 'going';
    case 'maybe':       return 'maybe';
    case 'not_going':   return 'notGoing';
    case 'late':        return 'late';
    case 'need_pickup': return 'needPickup';
    default:            return 'noResponse';
  }
}

export const attendanceService = {
  // ─── Set / update RSVP ────────────────────────────────────────────────────
  async setAttendance(
    eventId:     string,
    clubId:      string,
    userId:      string,
    displayName: string,
    status:      AttendanceStatus,
    note = '',
    season?: string,
  ): Promise<void> {
    const id     = attDocId(eventId, userId);
    const attRef = doc(attendanceCol(), id);
    const eventRef = doc(eventsCol(), eventId);

    let prevStatus: AttendanceStatus | null = null;

    await runTransaction(db, async (tx) => {
      const [attSnap, eventSnap] = await Promise.all([tx.get(attRef), tx.get(eventRef)]);
      if (!eventSnap.exists()) throw new Error('Event not found');

      prevStatus = attSnap.exists()
        ? (attSnap.data().status as AttendanceStatus)
        : null;

      const counts = {
        going: 0, maybe: 0, notGoing: 0, late: 0, needPickup: 0, noResponse: 0,
        ...(eventSnap.data().attendanceCount ?? {}),
      };

      // Decrement previous bucket
      if (prevStatus) {
        const prev = statusKey(prevStatus);
        counts[prev] = Math.max(0, (counts[prev] ?? 0) - 1);
      } else {
        // First-time response: decrement noResponse placeholder
        counts.noResponse = Math.max(0, (counts.noResponse ?? 0) - 1);
      }

      // Increment new bucket
      const next = statusKey(status);
      counts[next] = (counts[next] ?? 0) + 1;

      tx.update(eventRef, { attendanceCount: counts, updatedAt: serverTimestamp() });
      tx.set(attRef, {
        attendanceId: id,
        eventId, clubId, userId, displayName,
        status, note,
        respondedAt: serverTimestamp(),
        updatedAt:   serverTimestamp(),
      });
    });

    // Update player attendance stats after successful RSVP
    if (season) {
      try {
        await statsService.updateAttendanceStats(userId, clubId, season, prevStatus, status);
      } catch {
        // Non-critical — stats update failure shouldn't block RSVP
      }
    }
  },

  // ─── Get own response (single doc lookup) ─────────────────────────────────
  async getMyAttendance(eventId: string, userId: string): Promise<Attendance | null> {
    const snap = await getDoc(doc(attendanceCol(), attDocId(eventId, userId)));
    return snap.exists() ? (snap.data() as Attendance) : null;
  },

  // ─── Real-time listener for own response ──────────────────────────────────
  subscribeMyAttendance(
    eventId: string,
    userId:  string,
    cb:      (att: Attendance | null) => void,
  ): Unsubscribe {
    return onSnapshot(
      doc(attendanceCol(), attDocId(eventId, userId)),
      snap => cb(snap.exists() ? (snap.data() as Attendance) : null),
    );
  },

  // ─── Get all responses for an event ───────────────────────────────────────
  async getEventAttendance(eventId: string): Promise<Attendance[]> {
    const q    = query(attendanceCol(), where('eventId', '==', eventId));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as Attendance);
  },
};
