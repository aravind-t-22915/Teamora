// src/stores/uiStore.ts
import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastConfig {
  type:     ToastType;
  message:  string;
  duration?: number;
}

interface UIState {
  theme:               'dark' | 'light';
  isCreateEventOpen:   boolean;
  selectedDate:        Date | null;
  toastMessage:        ToastConfig | null;
  isOffline:           boolean;

  setTheme:            (theme: 'dark' | 'light') => void;
  showToast:           (config: ToastConfig) => void;
  hideToast:           () => void;
  openCreateEvent:     () => void;
  closeCreateEvent:    () => void;
  setSelectedDate:     (date: Date | null) => void;
  setOffline:          (offline: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme:             'dark',
  isCreateEventOpen: false,
  selectedDate:      null,
  toastMessage:      null,
  isOffline:         false,

  setTheme:         (theme)   => set({ theme }),
  showToast:        (config)  => set({ toastMessage: config }),
  hideToast:        ()        => set({ toastMessage: null }),
  openCreateEvent:  ()        => set({ isCreateEventOpen: true }),
  closeCreateEvent: ()        => set({ isCreateEventOpen: false }),
  setSelectedDate:  (date)    => set({ selectedDate: date }),
  setOffline:       (offline) => set({ isOffline: offline }),
}));
