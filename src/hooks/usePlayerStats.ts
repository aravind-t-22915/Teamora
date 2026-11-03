// src/hooks/usePlayerStats.ts
import { useQuery } from '@tanstack/react-query';
import { statsService } from '../services/stats.service';
import { useAuthStore } from '../stores/authStore';
import { SEASON } from '../config/constants';

// ─── Query keys ───────────────────────────────────────────────────────────────
export const STATS_KEYS = {
  player: (userId: string, season: string) => ['stats', 'player', userId, season] as const,
  club:   (clubId: string, season: string) => ['stats', 'club', clubId, season] as const,
};

// ─── Single player stats ──────────────────────────────────────────────────────
export function usePlayerStats(userId: string, season = SEASON) {
  return useQuery({
    queryKey: STATS_KEYS.player(userId, season),
    queryFn:  () => statsService.getPlayerStats(userId, season),
    enabled:  !!userId,
    staleTime: 60_000,
  });
}

// ─── All club stats ───────────────────────────────────────────────────────────
export function useClubStats(season = SEASON) {
  const clubId = useAuthStore(s => s.club?.clubId ?? '');
  return useQuery({
    queryKey: STATS_KEYS.club(clubId, season),
    queryFn:  () => statsService.getClubStats(clubId, season),
    enabled:  !!clubId,
    staleTime: 60_000,
  });
}

// ─── Top scorers ──────────────────────────────────────────────────────────────
export function useTopScorers(limitCount = 10, season = SEASON) {
  const clubId = useAuthStore(s => s.club?.clubId ?? '');
  return useQuery({
    queryKey: ['stats', 'topScorers', clubId, season, limitCount],
    queryFn:  async () => {
      const stats = await statsService.getClubStats(clubId, season);
      return stats.sort((a, b) => b.goals - a.goals).slice(0, limitCount);
    },
    enabled:  !!clubId,
    staleTime: 60_000,
  });
}

// ─── Top assists ──────────────────────────────────────────────────────────────
export function useTopAssists(limitCount = 10, season = SEASON) {
  const clubId = useAuthStore(s => s.club?.clubId ?? '');
  return useQuery({
    queryKey: ['stats', 'topAssists', clubId, season, limitCount],
    queryFn:  async () => {
      const stats = await statsService.getClubStats(clubId, season);
      return stats.sort((a, b) => b.assists - a.assists).slice(0, limitCount);
    },
    enabled:  !!clubId,
    staleTime: 60_000,
  });
}

// ─── MOTM leaders ─────────────────────────────────────────────────────────────
export function useMotmLeaders(limitCount = 10, season = SEASON) {
  const clubId = useAuthStore(s => s.club?.clubId ?? '');
  return useQuery({
    queryKey: ['stats', 'motmLeaders', clubId, season, limitCount],
    queryFn:  async () => {
      const stats = await statsService.getClubStats(clubId, season);
      return stats.sort((a, b) => b.motmCount - a.motmCount).slice(0, limitCount);
    },
    enabled:  !!clubId,
    staleTime: 60_000,
  });
}

// ─── Attendance leaders ───────────────────────────────────────────────────────
export function useAttendanceLeaders(limitCount = 10, season = SEASON) {
  const clubId = useAuthStore(s => s.club?.clubId ?? '');
  return useQuery({
    queryKey: ['stats', 'attendanceLeaders', clubId, season, limitCount],
    queryFn:  async () => {
      const stats = await statsService.getClubStats(clubId, season);
      return stats.sort((a, b) => b.attendanceRate - a.attendanceRate).slice(0, limitCount);
    },
    enabled:  !!clubId,
    staleTime: 60_000,
  });
}
