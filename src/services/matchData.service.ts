// src/services/matchData.service.ts
import {
  collection, doc, getDoc, setDoc, updateDoc,
  serverTimestamp, arrayUnion,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../config/constants';
import { MatchData, LineupPlayer, TimelineEvent, MatchStatsData } from '../types';

const matchDataCol = () => collection(db, COLLECTIONS.MATCH_DATA);

export const matchDataService = {
  async getMatchData(eventId: string): Promise<MatchData | null> {
    const snap = await getDoc(doc(matchDataCol(), eventId));
    if (!snap.exists()) return null;
    return { matchId: snap.id, ...snap.data() } as MatchData;
  },

  async saveLineup(
    eventId: string,
    clubId: string,
    formation: string,
    startingLineup: LineupPlayer[],
    substitutes: LineupPlayer[],
  ): Promise<void> {
    await setDoc(doc(matchDataCol(), eventId), {
      matchId: eventId,
      clubId,
      formation,
      startingLineup,
      substitutes,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  },

  async addTimelineEvent(eventId: string, event: TimelineEvent): Promise<void> {
    await updateDoc(doc(matchDataCol(), eventId), {
      timeline:  arrayUnion(event),
      updatedAt: serverTimestamp(),
    });
  },

  async removeTimelineEvent(eventId: string, timelineEventId: string): Promise<void> {
    const snap = await getDoc(doc(matchDataCol(), eventId));
    if (!snap.exists()) return;
    const data = snap.data() as MatchData;
    const updatedTimeline = (data.timeline ?? []).filter(e => e.id !== timelineEventId);
    await updateDoc(doc(matchDataCol(), eventId), {
      timeline:  updatedTimeline,
      updatedAt: serverTimestamp(),
    });
  },

  async updateTimelineEvent(eventId: string, updatedEvent: TimelineEvent): Promise<void> {
    const snap = await getDoc(doc(matchDataCol(), eventId));
    if (!snap.exists()) return;
    const data = snap.data() as MatchData;
    const updatedTimeline = (data.timeline ?? []).map(e =>
      e.id === updatedEvent.id ? updatedEvent : e,
    );
    await updateDoc(doc(matchDataCol(), eventId), {
      timeline:  updatedTimeline,
      updatedAt: serverTimestamp(),
    });
  },

  async setMotm(eventId: string, userId: string | null): Promise<void> {
    await updateDoc(doc(matchDataCol(), eventId), {
      motm:      userId,
      updatedAt: serverTimestamp(),
    });
  },

  async updateMatchStats(
    eventId: string,
    side: 'home' | 'away',
    stats: MatchStatsData,
  ): Promise<void> {
    await updateDoc(doc(matchDataCol(), eventId), {
      [`stats.${side}`]: stats,
      updatedAt:         serverTimestamp(),
    });
  },

  async setPlayerRating(
    eventId: string,
    userId: string,
    rating: number,
    isStarting: boolean,
  ): Promise<void> {
    const snap = await getDoc(doc(matchDataCol(), eventId));
    if (!snap.exists()) return;
    const data = snap.data() as MatchData;
    const field = isStarting ? 'startingLineup' : 'substitutes';
    const updatedLineup = (data[field] ?? []).map((p: LineupPlayer) =>
      p.userId === userId ? { ...p, rating } : p,
    );
    await updateDoc(doc(matchDataCol(), eventId), {
      [field]:   updatedLineup,
      updatedAt: serverTimestamp(),
    });
  },
};
