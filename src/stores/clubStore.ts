// src/stores/clubStore.ts
import { create } from 'zustand';

export interface ClubSettings {
  allowPlayerComments:      boolean;
  allowPlayerGalleryUpload: boolean;
  requireAttendanceConfirm: boolean;
  attendanceDeadlineHours:  number;
  timezone:                 string;
  currency:                 string;
  defaultEventReminder:     number;
}

interface ClubState {
  settings:      ClubSettings | null;
  setSettings:   (s: ClubSettings) => void;
  clearSettings: () => void;
}

export const useClubStore = create<ClubState>((set) => ({
  settings: null,

  setSettings: (s) => set({ settings: s }),

  clearSettings: () => set({ settings: null }),
}));
