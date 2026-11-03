// src/services/matchResult.service.ts
import {
  doc, setDoc, getDoc, updateDoc, Timestamp, collection, query, where, getDocs, orderBy,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { EventResult, MatchData } from '../types';
import { COLLECTIONS } from '../config/constants';
import { statsService } from './stats.service';

function buildMinutesMap(md: MatchData): Map<string, number> {
  const FULL_MATCH = 90;
  const minutes = new Map<string, number>();

  // All starters get full match time (adjusted by substitutions below)
  const endMinute = new Map<string, number>();
  const startMinute = new Map<string, number>();

  for (const p of md.startingLineup ?? []) {
    startMinute.set(p.userId, 0);
    endMinute.set(p.userId, FULL_MATCH);
  }
  for (const p of md.substitutes ?? []) {
    endMinute.set(p.userId, 0); // default: didn't play
  }

  // Process substitution events
  const subs = (md.timeline ?? []).filter(e => e.type === 'substitution');
  // Find match end minute from full_time event if available
  const ftEvent = (md.timeline ?? []).find(e => e.type === 'full_time');
  const matchEnd = ftEvent?.minute ?? FULL_MATCH;

  for (const sub of subs) {
    if (sub.substituteOutId) {
      endMinute.set(sub.substituteOutId, sub.minute);
    }
    if (sub.substituteInId) {
      startMinute.set(sub.substituteInId, sub.minute);
      endMinute.set(sub.substituteInId, matchEnd);
    }
  }

  // Combine into final minutes played
  for (const [userId, start] of startMinute.entries()) {
    const end = endMinute.get(userId) ?? matchEnd;
    const played = Math.max(0, end - start);
    if (played > 0) minutes.set(userId, played);
  }

  return minutes;
}

export interface MatchResultData {
  resultId: string;
  eventId: string;
  clubId: string;
  homeGoals: number;
  awayGoals: number;
  outcome: 'win' | 'loss' | 'draw' | null;
  scorers: GoalEntry[];
  assists: GoalEntry[];
  manOfTheMatch: string | null; // userId
  manOfTheMatchName: string | null;
  yellowCards: string[];
  redCards: string[];
  notes: string;
  enteredBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface GoalEntry {
  userId: string;
  playerName: string;
  minute: number | null;
}

export const matchResultService = {
  /**
   * Save or update a match result.
   * Uses eventId as the document ID so there's exactly one result per event.
   */
  async saveResult(
    clubId: string,
    eventId: string,
    userId: string,
    season: string,
    data: {
      homeGoals: number;
      awayGoals: number;
      scorers: GoalEntry[];
      assists: GoalEntry[];
      manOfTheMatch: string | null;
      manOfTheMatchName: string | null;
      yellowCards: string[];
      redCards: string[];
      notes: string;
    },
  ): Promise<void> {
    const outcome: 'win' | 'loss' | 'draw' =
      data.homeGoals > data.awayGoals ? 'win'
      : data.homeGoals < data.awayGoals ? 'loss'
      : 'draw';

    const resultRef = doc(db, COLLECTIONS.MATCH_RESULTS, eventId);
    const existingSnap = await getDoc(resultRef);
    const isNewResult = !existingSnap.exists();

    const payload: Omit<MatchResultData, 'resultId'> = {
      eventId,
      clubId,
      homeGoals: data.homeGoals,
      awayGoals: data.awayGoals,
      outcome,
      scorers: data.scorers,
      assists: data.assists,
      manOfTheMatch: data.manOfTheMatch,
      manOfTheMatchName: data.manOfTheMatchName,
      yellowCards: data.yellowCards,
      redCards: data.redCards,
      notes: data.notes,
      enteredBy: userId,
      createdAt: isNewResult ? Timestamp.now() : existingSnap.data()!.createdAt,
      updatedAt: Timestamp.now(),
    };

    await setDoc(resultRef, payload);

    // Update the result snapshot on the event itself
    const eventResult: EventResult = {
      homeGoals: data.homeGoals,
      awayGoals: data.awayGoals,
      outcome,
    };
    await updateDoc(doc(db, 'events', eventId), {
      result: eventResult,
      status: 'completed',
      updatedAt: Timestamp.now(),
    });

    // Apply player stats only once (on first save — re-saves would double-count)
    if (isNewResult) {
      // Try to read matchData for minutes-played calculation
      let minutesMap: Map<string, number> | undefined;
      try {
        const matchSnap = await getDoc(doc(db, COLLECTIONS.MATCH_DATA, eventId));
        if (matchSnap.exists()) {
          const md = matchSnap.data() as MatchData;
          minutesMap = buildMinutesMap(md);
        }
      } catch {
        // Non-critical — skip minutes if matchData unavailable
      }

      await statsService.applyMatchStats(
        clubId,
        season,
        eventId,
        data.scorers,
        data.assists,
        data.manOfTheMatch,
        data.manOfTheMatchName,
        data.yellowCards,
        data.redCards,
        minutesMap,
      );
    }
  },

  async getResult(eventId: string): Promise<MatchResultData | null> {
    const snap = await getDoc(doc(db, COLLECTIONS.MATCH_RESULTS, eventId));
    if (!snap.exists()) return null;
    return { resultId: snap.id, ...snap.data() } as MatchResultData;
  },

  async getClubResults(clubId: string): Promise<MatchResultData[]> {
    const q = query(
      collection(db, COLLECTIONS.MATCH_RESULTS),
      where('clubId', '==', clubId),
      orderBy('createdAt', 'desc'),
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ resultId: d.id, ...d.data() } as MatchResultData));
  },
};
