// src/hooks/useEvents.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventService } from '../services/event.service';
import { useAuthStore } from '../stores/authStore';
import { CreateEventInput } from '../types';

// ─── Query keys ────────────────────────────────────────────────────────────
export const EVENT_KEYS = {
  all:      (clubId: string) => ['events', clubId] as const,
  upcoming: (clubId: string, n: number) => ['events', clubId, 'upcoming', n] as const,
  month:    (clubId: string, y: number, m: number) => ['events', clubId, 'month', y, m] as const,
  detail:   (clubId: string, eventId: string) => ['events', clubId, eventId] as const,
};

// ─── All events ──────────────────────────────────────────────────────────────
export function useAllEvents() {
  const clubId = useAuthStore(s => s.club?.clubId ?? '');
  return useQuery({
    queryKey: EVENT_KEYS.all(clubId),
    queryFn:  () => eventService.getAllEvents(clubId),
    enabled:  !!clubId,
    staleTime: 60_000,
  });
}

// ─── Upcoming events ────────────────────────────────────────────────────────
export function useUpcomingEvents(count = 5) {
  const clubId = useAuthStore(s => s.club?.clubId ?? '');
  return useQuery({
    queryKey: EVENT_KEYS.upcoming(clubId, count),
    queryFn:  () => eventService.getUpcomingEvents(clubId, count),
    enabled:  !!clubId,
    staleTime: 60_000,
  });
}

// ─── Events by month ─────────────────────────────────────────────────────────
export function useMonthEvents(year: number, month: number) {
  const clubId = useAuthStore(s => s.club?.clubId ?? '');
  return useQuery({
    queryKey: EVENT_KEYS.month(clubId, year, month),
    queryFn:  () => eventService.getEventsByMonth(clubId, year, month),
    enabled:  !!clubId,
    staleTime: 60_000,
  });
}

// ─── Single event ────────────────────────────────────────────────────────────
export function useEvent(eventId: string) {
  const clubId = useAuthStore(s => s.club?.clubId ?? '');
  return useQuery({
    queryKey: EVENT_KEYS.detail(clubId, eventId),
    queryFn:  () => eventService.getEvent(clubId, eventId),
    enabled:  !!clubId && !!eventId,
    staleTime: 30_000,
  });
}

// ─── Create event ────────────────────────────────────────────────────────────
export function useCreateEvent() {
  const qc     = useQueryClient();
  const { club, user } = useAuthStore();
  return useMutation({
    mutationFn: (input: CreateEventInput) =>
      eventService.createEvent(club!.clubId, user!.userId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EVENT_KEYS.all(club!.clubId) });
      qc.invalidateQueries({ queryKey: ['events', club!.clubId, 'upcoming'] });
      qc.invalidateQueries({ queryKey: ['events', club!.clubId, 'month'] });
    },
  });
}

// ─── Update event ────────────────────────────────────────────────────────────
export function useUpdateEvent(eventId: string) {
  const qc   = useQueryClient();
  const club = useAuthStore(s => s.club);
  return useMutation({
    mutationFn: (updates: Partial<CreateEventInput>) =>
      eventService.updateEvent(club!.clubId, eventId, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EVENT_KEYS.all(club!.clubId) });
      qc.invalidateQueries({ queryKey: EVENT_KEYS.detail(club!.clubId, eventId) });
    },
  });
}

// ─── Delete event ────────────────────────────────────────────────────────────
export function useDeleteEvent() {
  const qc   = useQueryClient();
  const club = useAuthStore(s => s.club);
  return useMutation({
    mutationFn: (eventId: string) => eventService.deleteEvent(club!.clubId, eventId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EVENT_KEYS.all(club!.clubId) });
    },
  });
}
