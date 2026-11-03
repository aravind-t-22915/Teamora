// src/types/event.types.ts

import { Timestamp } from 'firebase/firestore';

export type EventType =
  | 'practice'
  | 'practice_match'
  | 'league_match'
  | 'tournament_match'
  | 'friendly_match'
  | 'meeting'
  | 'recovery_session'
  | 'gym_session'
  | 'announcement'
  | 'payment_deadline'
  | 'birthday';

export type EventStatus = 'scheduled' | 'live' | 'completed' | 'cancelled' | 'postponed';

export interface EventCoordinates {
  lat: number;
  lng: number;
}

export interface EventResult {
  homeGoals: number;
  awayGoals: number;
  outcome: 'win' | 'loss' | 'draw' | null;
}

export interface AttendanceCount {
  going: number;
  maybe: number;
  notGoing: number;
  late: number;
  needPickup: number;
  noResponse: number;
}

export interface AppEvent {
  eventId: string;
  clubId: string;
  type: EventType;
  title: string;
  description: string;
  status: EventStatus;
  date: Timestamp;
  startTime: string;
  endTime: string;
  allDay: boolean;
  venueName: string;
  venueAddress: string;
  coordinates: EventCoordinates | null;
  isMatch: boolean;
  opponent: string | null;
  competition: string | null;
  isHomeGame: boolean | null;
  result: EventResult | null;
  targetGroups: string[];
  visibleToAll: boolean;
  coachNotes: string;
  weatherPlaceholder: string;
  coverImageUrl: string | null;
  attendanceCount: AttendanceCount;
  commentCount: number;
  galleryCount: number;
  notificationsEnabled: boolean;
  notificationSentAt: Timestamp | null;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateEventInput {
  type: EventType;
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  allDay: boolean;
  venueName: string;
  venueAddress: string;
  coordinates: EventCoordinates | null;
  isMatch: boolean;
  opponent?: string;
  competition?: string;
  isHomeGame?: boolean;
  targetGroups: string[];
  visibleToAll: boolean;
  coachNotes: string;
  weatherPlaceholder: string;
  notificationsEnabled: boolean;
}

export interface EventTypeConfig {
  label: string;
  color: string;
  icon: string;
  gradient: [string, string];
}
