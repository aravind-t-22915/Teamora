// src/services/report.service.ts
import {
  doc, setDoc, getDoc, Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface PlayerFeedback {
  userId: string;
  displayName: string;
  note: string;
  rating: number; // 1–5
}

export interface MatchReport {
  reportId: string;
  eventId: string;
  clubId: string;
  summary: string;
  strengths: string;
  weaknesses: string;
  nextFocus: string;
  playerFeedback: PlayerFeedback[];
  isPublished: boolean;
  authorId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type MatchReportInput = Omit<MatchReport, 'reportId' | 'createdAt' | 'updatedAt'>;

export const reportService = {
  async getReport(eventId: string): Promise<MatchReport | null> {
    const ref = doc(db, 'matchReports', eventId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { reportId: snap.id, ...snap.data() } as MatchReport;
  },

  async saveDraft(eventId: string, data: MatchReportInput): Promise<void> {
    const ref = doc(db, 'matchReports', eventId);
    const existing = await getDoc(ref);
    const now = Timestamp.now();

    const payload = {
      ...data,
      isPublished: false,
      updatedAt: now,
      createdAt: existing.exists() ? existing.data().createdAt : now,
    };

    await setDoc(ref, payload, { merge: true });
  },

  async publishReport(eventId: string, data: MatchReportInput): Promise<void> {
    const ref = doc(db, 'matchReports', eventId);
    const existing = await getDoc(ref);
    const now = Timestamp.now();

    const payload = {
      ...data,
      isPublished: true,
      updatedAt: now,
      createdAt: existing.exists() ? existing.data().createdAt : now,
    };

    await setDoc(ref, payload, { merge: true });
  },
};
