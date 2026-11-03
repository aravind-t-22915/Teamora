// src/hooks/useGroups.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupService } from '../services/group.service';
import { useAuthStore } from '../stores/authStore';
import { Group } from '../types';

// ─── Query keys ───────────────────────────────────────────────────────────────
export const GROUP_KEYS = {
  all: (clubId: string) => ['groups', clubId] as const,
};

// ─── All club groups ──────────────────────────────────────────────────────────
export function useGroups() {
  const clubId = useAuthStore(s => s.club?.clubId ?? '');
  return useQuery({
    queryKey: GROUP_KEYS.all(clubId),
    queryFn:  () => groupService.getClubGroups(clubId),
    enabled:  !!clubId,
    staleTime: 60_000,
  });
}

// ─── Create group ─────────────────────────────────────────────────────────────
export function useCreateGroup() {
  const qc           = useQueryClient();
  const { club, user } = useAuthStore();
  return useMutation({
    mutationFn: (data: Pick<Group, 'name' | 'description' | 'color' | 'emoji'>) =>
      groupService.createGroup(club!.clubId, user!.userId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: GROUP_KEYS.all(club!.clubId) });
    },
  });
}

// ─── Update group ─────────────────────────────────────────────────────────────
export function useUpdateGroup() {
  const qc   = useQueryClient();
  const club = useAuthStore(s => s.club);
  return useMutation({
    mutationFn: ({
      groupId,
      data,
    }: {
      groupId: string;
      data: Partial<Omit<Group, 'groupId' | 'clubId' | 'createdBy' | 'createdAt'>>;
    }) => groupService.updateGroup(groupId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: GROUP_KEYS.all(club!.clubId) });
    },
  });
}

// ─── Delete group ─────────────────────────────────────────────────────────────
export function useDeleteGroup() {
  const qc   = useQueryClient();
  const club = useAuthStore(s => s.club);
  return useMutation({
    mutationFn: (groupId: string) => groupService.deleteGroup(groupId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: GROUP_KEYS.all(club!.clubId) });
    },
  });
}

// ─── Add member to group ──────────────────────────────────────────────────────
export function useAddGroupMember() {
  const qc   = useQueryClient();
  const club = useAuthStore(s => s.club);
  return useMutation({
    mutationFn: ({ groupId, userId }: { groupId: string; userId: string }) =>
      groupService.addMemberToGroup(groupId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: GROUP_KEYS.all(club!.clubId) });
    },
  });
}

// ─── Remove member from group ─────────────────────────────────────────────────
export function useRemoveGroupMember() {
  const qc   = useQueryClient();
  const club = useAuthStore(s => s.club);
  return useMutation({
    mutationFn: ({ groupId, userId }: { groupId: string; userId: string }) =>
      groupService.removeMemberFromGroup(groupId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: GROUP_KEYS.all(club!.clubId) });
    },
  });
}
