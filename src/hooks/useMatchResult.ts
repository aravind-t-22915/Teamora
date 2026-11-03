// src/hooks/useMatchResult.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { matchResultService, GoalEntry } from '../services/matchResult.service';
import { useAuthStore } from '../stores/authStore';
import { EVENT_KEYS } from './useEvents';

const RESULT_KEY = (eventId: string) => ['matchResult', eventId] as const;

export function useMatchResult(eventId: string) {
  return useQuery({
    queryKey: RESULT_KEY(eventId),
    queryFn: () => matchResultService.getResult(eventId),
    enabled: !!eventId,
    staleTime: 60_000,
  });
}

export function useSaveMatchResult(eventId: string) {
  const qc = useQueryClient();
  const { user, club } = useAuthStore();
  return useMutation({
    mutationFn: (data: {
      homeGoals: number;
      awayGoals: number;
      scorers: GoalEntry[];
      assists: GoalEntry[];
      manOfTheMatch: string | null;
      manOfTheMatchName: string | null;
      yellowCards: string[];
      redCards: string[];
      notes: string;
    }) => matchResultService.saveResult(club!.clubId, eventId, user!.userId, club!.season, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RESULT_KEY(eventId) });
      qc.invalidateQueries({ queryKey: EVENT_KEYS.detail(club!.clubId, eventId) });
      qc.invalidateQueries({ queryKey: EVENT_KEYS.all(club!.clubId) });
    },
  });
}
