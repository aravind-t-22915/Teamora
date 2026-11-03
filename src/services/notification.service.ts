// src/services/notification.service.ts
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { doc, updateDoc, collection, addDoc, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { AppNotification, NotificationType } from '../types';

// expo-notifications' DevicePushTokenAutoRegistration.fx.js calls addPushTokenListener
// at module level, which throws in Expo Go SDK 53+. The STATIC import alone triggers this.
// Solution: never import expo-notifications in Expo Go — use dynamic require only in real builds.
const isExpoGo = Constants.executionEnvironment === 'storeClient';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EN: any = isExpoGo ? null : require('expo-notifications');

if (EN) {
  EN.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export const notificationService = {
  async registerPushToken(userId: string): Promise<string | null> {
    if (!EN) return null;
    try {
      const { status: existingStatus } = await EN.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await EN.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('[Notifications] Permission not granted');
        return null;
      }

      const tokenData = await EN.getExpoPushTokenAsync();
      const token = tokenData.data;

      await updateDoc(doc(db, 'users', userId), { fcmToken: token });

      if (Platform.OS === 'android') {
        await EN.setNotificationChannelAsync('default', {
          name: 'Teamora',
          importance: EN.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#22C55E',
          sound: 'default',
        });
      }

      return token;
    } catch (err) {
      console.error('[Notifications] registerPushToken error:', err);
      return null;
    }
  },

  async createNotification(
    clubId: string,
    createdBy: string,
    type: NotificationType,
    title: string,
    body: string,
    targetUserIds: string[],
    data: { screen: string; params: Record<string, string> } = { screen: '', params: {} },
  ): Promise<string> {
    const ref = await addDoc(collection(db, 'notifications'), {
      clubId,
      createdBy,
      type,
      title,
      body,
      targetUserIds,
      targetGroupIds: [],
      data,
      sentAt: Timestamp.now(),
      readBy: [],
    } satisfies Omit<AppNotification, 'notificationId'>);
    return ref.id;
  },

  async getNotifications(clubId: string, userId: string): Promise<AppNotification[]> {
    const q = query(
      collection(db, 'notifications'),
      where('clubId', '==', clubId),
      orderBy('sentAt', 'desc'),
    );
    const snap = await getDocs(q);
    return snap.docs
      .map(d => ({ notificationId: d.id, ...d.data() } as AppNotification))
      .filter(n => n.targetUserIds.length === 0 || n.targetUserIds.includes(userId))
      .slice(0, 50);
  },

  async markRead(notificationId: string, userId: string): Promise<void> {
    const ref = doc(db, 'notifications', notificationId);
    const snap = await getDocs(query(collection(db, 'notifications'), where('__name__', '==', notificationId)));
    if (snap.empty) return;
    const current: string[] = snap.docs[0].data().readBy ?? [];
    if (!current.includes(userId)) {
      await updateDoc(ref, { readBy: [...current, userId] });
    }
  },

  async scheduleLocalReminder(title: string, body: string, triggerDate: Date): Promise<string> {
    if (!EN) return '';
    return EN.scheduleNotificationAsync({
      content: { title, body, sound: 'default' },
      trigger: { type: EN.SchedulableTriggerInputTypes.DATE, date: triggerDate },
    });
  },

  async cancelAllLocalNotifications(): Promise<void> {
    if (!EN) return;
    await EN.cancelAllScheduledNotificationsAsync();
  },
};
