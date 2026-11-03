// src/types/stats.types.ts

import { Timestamp } from 'firebase/firestore';

export interface PlayerStats {
  statsId: string;
  userId: string;
  clubId: string;
  season: string;
  displayName: string;
  goals: number;
  assists: number;
  shots: number;
  shotsOnTarget: number;
  yellowCards: number;
  redCards: number;
  appearances: number;
  starts: number;
  substitutions: number;
  minutesPlayed: number;
  cleanSheets: number;
  savesMade: number;
  motmCount: number;
  motmEvents: string[];
  totalInvited: number;
  totalAttended: number;
  attendanceRate: number;
  averageRating: number;
  ratingCount: number;
  updatedAt: Timestamp;
}
