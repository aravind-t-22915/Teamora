// src/types/group.types.ts

import { Timestamp } from 'firebase/firestore';

export interface Group {
  groupId: string;
  clubId: string;
  name: string;
  description: string;
  color: string;
  emoji: string;
  memberIds: string[];
  memberCount: number;
  createdBy: string;
  isDefault: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
