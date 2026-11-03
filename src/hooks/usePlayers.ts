// src/hooks/usePlayers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/user.service';
import { useAuthStore } from '../stores/authStore';
import { AppUser } from '../types';

// ─── Query keys ───────────────────────────────────────────────────────────────
export const PLAYER_KEYS = {
  active:  (clubId: string) => ['players', clubId, 'active'] as const,
  pending: (clubId: string) => ['players', clubId, 'pending'] as const,
};

// ─── Active members ───────────────────────────────────────────────────────────
export function usePlayers() {
  const clubId = useAuthStore(s => s.club?.clubId ?? '');
  return useQuery({
    queryKey: PLAYER_KEYS.active(clubId),
    queryFn:  () => userService.getClubMembers(clubId),
    enabled:  !!clubId,
    staleTime: 60_000,
  });
}

// ─── Pending members ──────────────────────────────────────────────────────────
export function usePendingPlayers() {
  const clubId = useAuthStore(s => s.club?.clubId ?? '');
  return useQuery({
    queryKey: PLAYER_KEYS.pending(clubId),
    queryFn:  () => userService.getPendingMembers(clubId),
    enabled:  !!clubId,
    staleTime: 30_000,
  });
}

// ─── Approve player ───────────────────────────────────────────────────────────
export function useApprovePlayer() {
  const qc   = useQueryClient();
  const club = useAuthStore(s => s.club);
  return useMutation({
    mutationFn: (userId: string) => userService.approvePlayer(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['players', club!.clubId] });
    },
  });
}

// ─── Reject player ────────────────────────────────────────────────────────────
export function useRejectPlayer() {
  const qc   = useQueryClient();
  const club = useAuthStore(s => s.club);
  return useMutation({
    mutationFn: (userId: string) => userService.rejectPlayer(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['players', club!.clubId] });
    },
  });
}

// ─── Update player ────────────────────────────────────────────────────────────
export function useUpdatePlayer() {
  const qc   = useQueryClient();
  const club = useAuthStore(s => s.club);
  return useMutation({
    mutationFn: ({ userId, updates }: { userId: string; updates: Partial<AppUser> }) =>
      userService.updateUser(userId, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['players', club!.clubId] });
    },
  });
}
