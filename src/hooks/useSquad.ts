// src/hooks/useSquad.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { squadService } from '../services/squad.service';
import { useAuthStore } from '../stores/authStore';

export const SQUAD_KEYS = {
  all:    (clubId: string)                  => ['squad', clubId] as const,
  player: (clubId: string, userId: string)  => ['squad', clubId, userId] as const,
};

// ─── All club members ──────────────────────────────────────────────────────
export function useSquad() {
  const clubId = useAuthStore(s => s.club?.clubId ?? '');
  return useQuery({
    queryKey: SQUAD_KEYS.all(clubId),
    queryFn:  () => squadService.getClubPlayers(clubId),
    enabled:  !!clubId,
    staleTime: 60_000,
  });
}

// ─── Approve join request ─────────────────────────────────────────────────
export function useApprovePlayer() {
  const qc   = useQueryClient();
  const club = useAuthStore(s => s.club);
  return useMutation({
    mutationFn: (userId: string) => squadService.approvePlayer(userId),
    onSuccess:  () => qc.invalidateQueries({ queryKey: SQUAD_KEYS.all(club!.clubId) }),
  });
}

// ─── Reject / suspend player ─────────────────────────────────────────────
export function useRejectPlayer() {
  const qc   = useQueryClient();
  const club = useAuthStore(s => s.club);
  return useMutation({
    mutationFn: (userId: string) => squadService.rejectPlayer(userId),
    onSuccess:  () => qc.invalidateQueries({ queryKey: SQUAD_KEYS.all(club!.clubId) }),
  });
}
