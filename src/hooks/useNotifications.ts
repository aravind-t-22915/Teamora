// src/hooks/useNotifications.ts
import { useEffect, useRef, useCallback } from 'react';
import Constants from 'expo-constants';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notification.service';
import { useAuthStore } from '../stores/authStore';

// expo-notifications must NOT be statically imported — its module-level code
// (DevicePushTokenAutoRegistration.fx.js) calls addPushTokenListener which throws in Expo Go.
// Use dynamic require only in real builds.
const isExpoGo = Constants.executionEnvironment === 'storeClient';

// ─── Register push token on mount ────────────────────────────────────────────
export function useRegisterPushToken() {
  const user = useAuthStore(s => s.user);

  useEffect(() => {
    if (!user?.userId) return;
    notificationService.registerPushToken(user.userId).catch(console.error);
  }, [user?.userId]);
}

// ─── Handle navigation when user taps a notification ────────────────────────
export function useNotificationNavigation() {
  const navigation = useNavigation<any>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const notificationListener = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const responseListener = useRef<any>(null);

  useEffect(() => {
    if (isExpoGo) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const EN: any = require('expo-notifications');

    notificationListener.current = EN.addNotificationReceivedListener(() => {
      // Could show an in-app toast here
    });

    responseListener.current = EN.addNotificationResponseReceivedListener((response: any) => {
      const data = response.notification.request.content.data as {
        screen?: string;
        params?: Record<string, string>;
      };
      if (data?.screen) {
        try {
          navigation.navigate(data.screen as never, data.params as never);
        } catch {
          // Navigation may not be ready
        }
      }
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [navigation]);
}

// ─── Fetch in-app notifications ──────────────────────────────────────────────
export function useNotifications() {
  const { user, club } = useAuthStore();
  return useQuery({
    queryKey: ['notifications', club?.clubId, user?.userId],
    queryFn: () => notificationService.getNotifications(club!.clubId, user!.userId),
    enabled: !!club?.clubId && !!user?.userId,
    staleTime: 30_000,
  });
}

// ─── Mark as read ─────────────────────────────────────────────────────────────
export function useMarkNotificationRead() {
  const qc = useQueryClient();
  const { user, club } = useAuthStore();
  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationService.markRead(notificationId, user!.userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications', club?.clubId] });
    },
  });
}

// ─── Send notification (coaches) ──────────────────────────────────────────────
export function useSendNotification() {
  const qc = useQueryClient();
  const { user, club } = useAuthStore();
  return useMutation({
    mutationFn: ({
      type,
      title,
      body,
      targetUserIds,
      data,
    }: {
      type: Parameters<typeof notificationService.createNotification>[2];
      title: string;
      body: string;
      targetUserIds: string[];
      data?: { screen: string; params: Record<string, string> };
    }) =>
      notificationService.createNotification(
        club!.clubId,
        user!.userId,
        type,
        title,
        body,
        targetUserIds,
        data,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications', club?.clubId] });
    },
  });
}

// ─── Schedule a local event reminder ─────────────────────────────────────────
export function useScheduleEventReminder() {
  const schedule = useCallback(
    (eventTitle: string, eventDate: Date) => {
      const reminderDate = new Date(eventDate.getTime() - 60 * 60 * 1000);
      if (reminderDate <= new Date()) return;
      notificationService.scheduleLocalReminder(
        `⚽ ${eventTitle}`,
        'Reminder: starts in 1 hour',
        reminderDate,
      ).catch(console.error);
    },
    [],
  );
  return { scheduleReminder: schedule };
}
