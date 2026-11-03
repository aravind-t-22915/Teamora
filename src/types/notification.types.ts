// src/types/notification.types.ts

import { Timestamp } from 'firebase/firestore';

export type NotificationType =
  | 'practice_reminder'
  | 'match_reminder'
  | 'venue_changed'
  | 'time_changed'
  | 'new_report'
  | 'new_announcement'
  | 'payment_reminder'
  | 'tournament_reminder'
  | 'attendance_reminder'
  | 'join_request'
  | 'join_approved'
  | 'join_rejected';

export interface AppNotification {
  notificationId: string;
  clubId: string;
  targetUserIds: string[];
  targetGroupIds: string[];
  type: NotificationType;
  title: string;
  body: string;
  data: {
    screen: string;
    params: Record<string, string>;
  };
  sentAt: Timestamp;
  readBy: string[];
  createdBy: string;
}
