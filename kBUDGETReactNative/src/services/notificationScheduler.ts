import * as Notifications from 'expo-notifications';

export interface ReminderScheduler {
  ensurePermission(): Promise<void>;
  scheduleDailyReminder(hour: number, minute: number): Promise<void>;
  cancelReminder(): Promise<void>;
}

const REMINDER_ID = 'kbudget-daily-reminder';

export class NotificationScheduler implements ReminderScheduler {
  async ensurePermission(): Promise<void> {
    const settings = await Notifications.getPermissionsAsync();
    if (settings.granted) {
      return;
    }

    const result = await Notifications.requestPermissionsAsync();
    if (!result.granted) {
      throw new Error('Notifications not authorized');
    }
  }

  async scheduleDailyReminder(hour: number, minute: number): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(REMINDER_ID).catch(() => undefined);

    await Notifications.scheduleNotificationAsync({
      identifier: REMINDER_ID,
      content: {
        title: "Log today's spending",
        body: 'Capture your expenses to stay on track for Southeast Asia.'
      },
      trigger: {
        hour,
        minute,
        repeats: true
      }
    });
  }

  async cancelReminder(): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(REMINDER_ID);
  }
}
