// src/types/match.types.ts

export interface LineupPlayer {
  userId: string;
  displayName: string;
  jerseyNumber: number;
  position: string;
  positionIndex: number;
  isCaptain: boolean;
  rating: number | null;
}

export type TimelineEventType =
  | 'kickoff'
  | 'goal'
  | 'yellow_card'
  | 'red_card'
  | 'substitution'
  | 'half_time'
  | 'full_time';

export interface TimelineEvent {
  id: string;
  minute: number;
  type: TimelineEventType;
  playerId: string | null;
  playerName: string | null;
  assistId: string | null;
  assistName: string | null;
  substituteInId: string | null;
  substituteOutId: string | null;
  isOwnGoal: boolean;
  isPenalty: boolean;
  note: string;
}

export interface MatchStatsData {
  possession: number;
  shots: number;
  shotsOnTarget: number;
  corners: number;
  fouls: number;
  offsides: number;
  yellowCards: number;
  redCards: number;
}

export interface MatchData {
  matchId: string;
  clubId: string;
  formation: string;
  startingLineup: LineupPlayer[];
  substitutes: LineupPlayer[];
  unavailable: string[];
  timeline: TimelineEvent[];
  stats: {
    home: MatchStatsData;
    away: MatchStatsData;
  };
  motm: string | null;
  updatedAt: import('firebase/firestore').Timestamp;
}
