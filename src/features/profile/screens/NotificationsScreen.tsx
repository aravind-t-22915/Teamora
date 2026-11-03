// src/features/profile/screens/NotificationsScreen.tsx
import React from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useNotifications, useMarkNotificationRead } from '../../../hooks/useNotifications';
import { colors, typography, spacing, radius, glassCardStyle } from '../../../config/theme';
import { AppNotification } from '../../../types';
import { format } from 'date-fns';

function toDate(val: unknown): Date {
  try {
    if (!val) return new Date();
    if (typeof val === 'object' && val !== null) {
      if ('toDate' in val && typeof (val as any).toDate === 'function') return (val as any).toDate();
      if ('seconds' in val) return new Date((val as any).seconds * 1000);
      if ('_seconds' in val) return new Date((val as any)._seconds * 1000);
    }
    return new Date(val as string);
  } catch { return new Date(); }
}

const TYPE_ICON: Record<string, string> = {
  practice_reminder:   '⚽',
  match_reminder:      '🏆',
  venue_changed:       '📍',
  time_changed:        '🕐',
  new_report:          '📋',
  new_announcement:    '📢',
  payment_reminder:    '💰',
  tournament_reminder: '🥇',
  attendance_reminder: '✅',
  join_request:        '👤',
  join_approved:       '✅',
  join_rejected:       '❌',
};

function NotificationItem({
  item,
  onRead,
  userId,
}: {
  item: AppNotification;
  onRead: (id: string) => void;
  userId: string;
}) {
  const isRead = item.readBy.includes(userId);
  return (
    <TouchableOpacity
      style={[glassCardStyle, s.item, isRead && s.itemRead]}
      onPress={() => !isRead && onRead(item.notificationId)}
      activeOpacity={0.7}
    >
      <View style={s.iconBox}>
        <Text style={s.icon}>{TYPE_ICON[item.type] ?? '🔔'}</Text>
      </View>
      <View style={s.content}>
        <Text style={[s.title, isRead && s.titleRead]}>{item.title}</Text>
        <Text style={s.body} numberOfLines={2}>{item.body}</Text>
        <Text style={s.time}>{format(toDate(item.sentAt), 'd MMM · HH:mm')}</Text>
      </View>
      {!isRead && <View style={s.dot} />}
    </TouchableOpacity>
  );
}

export function NotificationsScreen({ navigation }: { navigation: any }) {
  const { data: notifications = [], isLoading } = useNotifications();
  const { mutate: markRead } = useMarkNotificationRead();
  const userId = ''; // will be filled by hook internally

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.heading}>Notifications</Text>
        <View style={{ width: 60 }} />
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.accent.primary} style={{ marginTop: 40 }} />
      ) : notifications.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyIcon}>🔔</Text>
          <Text style={s.emptyText}>No notifications yet</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={n => n.notificationId}
          contentContainerStyle={s.list}
          renderItem={({ item }) => (
            <NotificationItem
              item={item}
              onRead={markRead}
              userId={userId}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing[5], paddingVertical: spacing[4],
    borderBottomWidth: 1, borderBottomColor: colors.divider,
  },
  back:    { color: colors.accent.primary, fontSize: typography.size.md },
  heading: { fontSize: typography.size.xl, color: colors.text.primary, fontWeight: '700' },
  list:    { padding: spacing[5], gap: spacing[3] },
  item: {
    flexDirection: 'row', alignItems: 'flex-start', padding: spacing[4],
    gap: spacing[3],
  },
  itemRead: { opacity: 0.55 },
  iconBox: {
    width: 40, height: 40, borderRadius: radius.full,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center', justifyContent: 'center',
  },
  icon:      { fontSize: 18 },
  content:   { flex: 1, gap: 3 },
  title:     { fontSize: typography.size.md, color: colors.text.primary, fontWeight: '600' },
  titleRead: { fontWeight: '400' },
  body:      { fontSize: typography.size.sm, color: colors.text.secondary },
  time:      { fontSize: typography.size.xs, color: colors.text.muted, marginTop: 2 },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.accent.primary, marginTop: 6,
  },
  empty:     { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing[3] },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: typography.size.lg, color: colors.text.secondary },
});
