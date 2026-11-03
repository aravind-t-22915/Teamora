// src/types/attendance.types.ts

import { Timestamp } from 'firebase/firestore';

export type AttendanceStatus =
  | 'going'
  | 'maybe'
  | 'not_going'
  | 'late'
  | 'need_pickup'
  | 'no_response';

export interface Attendance {
  attendanceId: string;
  eventId: string;
  userId: string;
  clubId: string;
  displayName: string;
  photoUrl: string;
  position: string;
  status: AttendanceStatus;
  note: string;
  respondedAt: Timestamp | null;
  updatedAt: Timestamp;
}

export interface AttendanceSummary {
  going: number;
  maybe: number;
  notGoing: number;
  late: number;
  needPickup: number;
  noResponse: number;
  total: number;
}

export interface SetAttendanceInput {
  eventId: string;
  userId: string;
  status: AttendanceStatus;
  note?: string;
}
