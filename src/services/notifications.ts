/**
 * Notification scheduling service
 * Opt-in, highly controllable, playful copy.
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getPreferences } from '../engine/personalization';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleNextStepNudge(): Promise<string | null> {
  const prefs = await getPreferences();
  if (!prefs.notificationEnabled || !prefs.nudgeTimes?.length) return null;

  const hour = prefs.nudgeTimes[0];
  const [h, m] = hour.split(':').map(Number);
  const trigger = {
    hour: h,
    minute: m,
    repeats: true,
  };

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'One tiny task?',
      body: "Brain says no? Let's give it a 60-second starter instead.",
      data: { type: 'nudge' },
    },
    trigger,
  });
  return id;
}

export async function scheduleSessionReminder(taskTitle: string, at: Date): Promise<string | null> {
  const prefs = await getPreferences();
  if (!prefs.notificationEnabled) return null;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Ready when you are',
      body: `"${taskTitle}" – tap to do the next step.`,
      data: { type: 'session_reminder', taskTitle },
    },
    trigger: at,
  });
  return id;
}

export async function scheduleEnergyCheck(): Promise<string | null> {
  const prefs = await getPreferences();
  if (!prefs.notificationEnabled || !prefs.nudgeTimes?.length) return null;

  const hour = prefs.nudgeTimes[1] ?? prefs.nudgeTimes[0];
  const [h, m] = hour.split(':').map(Number);
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Pick one 2-minute win?',
      body: 'No pressure. Just one tiny thing if you feel like it.',
      data: { type: 'energy_check' },
    },
    trigger: { hour: h, minute: m, repeats: true },
  });
  return id;
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
