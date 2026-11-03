// src/hooks/useMatch.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { matchDataService } from '../services/matchData.service';
import { useAuthStore } from '../stores/authStore';
import { LineupPlayer, TimelineEvent, MatchStatsData } from '../types';

// ─── Query keys ──────────────────────────────────────────────────────────────
export const MATCH_KEYS = {
  detail: (eventId: string) => ['matchData', eventId] as const,
};

// ─── Query ───────────────────────────────────────────────────────────────────
export function useMatchData(eventId: string) {
  return useQuery({
    queryKey: MATCH_KEYS.detail(eventId),
    queryFn:  () => matchDataService.getMatchData(eventId),
    enabled:  !!eventId,
    staleTime: 30_000,
  });
}

// ─── Save lineup + formation ─────────────────────────────────────────────────
export function useSaveLineup() {
  const qc   = useQueryClient();
  const club = useAuthStore(s => s.club);
  return useMutation({
    mutationFn: ({
      eventId,
      formation,
      startingLineup,
      substitutes,
    }: {
      eventId: string;
      formation: string;
      startingLineup: LineupPlayer[];
      substitutes: LineupPlayer[];
    }) =>
      matchDataService.saveLineup(eventId, club!.clubId, formation, startingLineup, substitutes),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: MATCH_KEYS.detail(vars.eventId) });
    },
  });
}

// ─── Add timeline event ───────────────────────────────────────────────────────
export function useAddTimelineEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, event }: { eventId: string; event: TimelineEvent }) =>
      matchDataService.addTimelineEvent(eventId, event),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: MATCH_KEYS.detail(vars.eventId) });
    },
  });
}

// ─── Update timeline event ────────────────────────────────────────────────────
export function useUpdateTimelineEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, event }: { eventId: string; event: TimelineEvent }) =>
      matchDataService.updateTimelineEvent(eventId, event),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: MATCH_KEYS.detail(vars.eventId) });
    },
  });
}

// ─── Remove timeline event ────────────────────────────────────────────────────
export function useRemoveTimelineEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, timelineEventId }: { eventId: string; timelineEventId: string }) =>
      matchDataService.removeTimelineEvent(eventId, timelineEventId),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: MATCH_KEYS.detail(vars.eventId) });
    },
  });
}

// ─── Set man of the match ─────────────────────────────────────────────────────
export function useSetMotm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, userId }: { eventId: string; userId: string | null }) =>
      matchDataService.setMotm(eventId, userId),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: MATCH_KEYS.detail(vars.eventId) });
    },
  });
}

// ─── Update match stats ───────────────────────────────────────────────────────
export function useUpdateMatchStats() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      side,
      stats,
    }: {
      eventId: string;
      side: 'home' | 'away';
      stats: MatchStatsData;
    }) => matchDataService.updateMatchStats(eventId, side, stats),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: MATCH_KEYS.detail(vars.eventId) });
    },
  });
}

// ─── Set player rating ────────────────────────────────────────────────────────
export function useSetPlayerRating() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      userId,
      rating,
      isStarting,
    }: {
      eventId: string;
      userId: string;
      rating: number;
      isStarting: boolean;
    }) => matchDataService.setPlayerRating(eventId, userId, rating, isStarting),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: MATCH_KEYS.detail(vars.eventId) });
    },
  });
}
