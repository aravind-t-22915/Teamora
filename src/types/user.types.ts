// src/types/user.types.ts

import { Timestamp } from 'firebase/firestore';

export type UserRole = 'coach' | 'assistant_coach' | 'manager' | 'player';
export type UserStatus = 'pending' | 'active' | 'suspended';
export type Position = 'goalkeeper' | 'defender' | 'midfielder' | 'forward' | 'unassigned';
export type PreferredFoot = 'left' | 'right' | 'both';

export interface NotificationPreferences {
  practiceReminder: boolean;
  matchReminder: boolean;
  venueChange: boolean;
  newReport: boolean;
  newAnnouncement: boolean;
  paymentReminder: boolean;
  attendanceReminder: boolean;
}

export interface AppUser {
  userId: string;
  clubId: string;
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
  role: UserRole;
  status: UserStatus;
  position: Position;
  preferredFoot: PreferredFoot;
  jerseyNumber: number | null;
  height: number | null;
  weight: number | null;
  dateOfBirth: Timestamp | null;
  phone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  groupIds: string[];
  joinedClubAt: Timestamp;
  lastActiveAt: Timestamp;
  fcmToken: string;
  notificationPreferences: NotificationPreferences;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Club {
  clubId: string;
  name: string;
  slug: string;
  inviteCode: string;
  logoUrl: string;
  primaryColor: string;
  homeVenue: string;
  city: string;
  country: string;
  adminIds: string[];
  memberCount: number;
  season: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
