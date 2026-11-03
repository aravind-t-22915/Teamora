// src/hooks/useAttendance.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceService } from '../services/attendance.service';
import { useAuthStore } from '../stores/authStore';
import { AttendanceStatus } from '../types';
import { EVENT_KEYS } from './useEvents';

export const ATT_KEYS = {
  mine:  (eventId: string, userId: string) => ['attendance', eventId, userId] as const,
  event: (eventId: string)                 => ['attendance', 'event', eventId] as const,
};

// ─── My RSVP for one event ─────────────────────────────────────────────────
export function useMyAttendance(eventId: string) {
  const userId = useAuthStore(s => s.user?.userId ?? '');
  return useQuery({
    queryKey: ATT_KEYS.mine(eventId, userId),
    queryFn:  () => attendanceService.getMyAttendance(eventId, userId),
    enabled:  !!eventId && !!userId,
    staleTime: 30_000,
  });
}

// ─── Set / change RSVP ────────────────────────────────────────────────────
export function useSetAttendance(eventId: string) {
  const qc             = useQueryClient();
  const { user, club } = useAuthStore();

  return useMutation({
    mutationFn: (status: AttendanceStatus) =>
      attendanceService.setAttendance(
        eventId,
        club!.clubId,
        user!.userId,
        user!.displayName,
        status,
        '',
        club!.season,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ATT_KEYS.mine(eventId, user!.userId) });
      // Refresh the event detail so attendanceCount updates live
      qc.invalidateQueries({ queryKey: EVENT_KEYS.detail(club!.clubId, eventId) });
      qc.invalidateQueries({ queryKey: EVENT_KEYS.all(club!.clubId) });
    },
  });
}

// ─── All responses for one event (roster view) ────────────────────────────
export function useEventAttendance(eventId: string) {
  return useQuery({
    queryKey: ATT_KEYS.event(eventId),
    queryFn:  () => attendanceService.getEventAttendance(eventId),
    enabled:  !!eventId,
    staleTime: 30_000,
  });
}
