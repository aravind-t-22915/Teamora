// src/stores/authStore.ts
import { create } from 'zustand';
import { AppUser, Club, UserRole } from '../types';

type Permission =
  | 'create_event' | 'edit_event' | 'delete_event'
  | 'manage_squad' | 'approve_player' | 'create_group'
  | 'write_report' | 'view_coach_notes' | 'manage_attendance'
  | 'upload_gallery' | 'send_notification' | 'view_all_stats'
  | 'edit_lineup' | 'add_timeline' | 'rate_players'
  | 'view_events' | 'set_attendance' | 'comment'
  | 'view_gallery' | 'update_own_profile' | 'view_own_stats';

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  coach: [
    'create_event', 'edit_event', 'delete_event',
    'manage_squad', 'approve_player', 'create_group',
    'write_report', 'view_coach_notes', 'manage_attendance',
    'upload_gallery', 'send_notification', 'view_all_stats',
    'edit_lineup', 'add_timeline', 'rate_players',
    'view_events', 'set_attendance', 'comment', 'view_gallery',
    'update_own_profile', 'view_own_stats',
  ],
  assistant_coach: [
    'create_event', 'edit_event',
    'manage_attendance', 'upload_gallery',
    'write_report', 'view_coach_notes',
    'edit_lineup', 'add_timeline', 'rate_players',
    'view_all_stats', 'view_events', 'set_attendance',
    'comment', 'view_gallery', 'update_own_profile', 'view_own_stats',
  ],
  manager: [
    'create_event', 'manage_squad', 'approve_player',
    'upload_gallery', 'view_all_stats',
    'view_events', 'set_attendance', 'comment',
    'view_gallery', 'update_own_profile', 'view_own_stats',
  ],
  player: [
    'view_events', 'set_attendance', 'comment',
    'view_gallery', 'update_own_profile', 'view_own_stats',
  ],
};

interface AuthState {
  user:            AppUser | null;
  club:            Club | null;
  isLoading:       boolean;
  isAuthenticated: boolean;

  setUser:    (user: AppUser | null) => void;
  setClub:    (club: Club | null) => void;
  setLoading: (loading: boolean) => void;
  logout:     () => void;
  can:        (permission: Permission) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user:            null,
  club:            null,
  isLoading:       true,
  isAuthenticated: false,

  setUser: (user) =>
    set({ user, isAuthenticated: !!user, isLoading: false }),

  setClub: (club) => set({ club }),

  setLoading: (isLoading) => set({ isLoading }),

  logout: () =>
    set({ user: null, club: null, isAuthenticated: false, isLoading: false }),

  can: (permission) => {
    const role = get().user?.role;
    if (!role) return false;
    return ROLE_PERMISSIONS[role].includes(permission);
  },
}));
