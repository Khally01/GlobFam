import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { PaymentReminder } from './budgetingService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface ScheduledNotification {
  id: string;
  reminderId: string;
  scheduledDate: Date;
  notificationId: string;
}

export class NotificationService {
  private static STORAGE_KEY = '@globfam_scheduled_notifications';

  // Request permission for notifications
  static async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get notification permissions');
      return false;
    }

    return true;
  }

  // Schedule notifications for a payment reminder
  static async schedulePaymentReminder(reminder: PaymentReminder): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    // Cancel existing notifications for this reminder
    await this.cancelReminderNotifications(reminder.id);

    const scheduledNotifications: ScheduledNotification[] = [];

    // Schedule notification for each reminder day
    for (const daysBefore of reminder.reminderDays) {
      const notificationDate = new Date(reminder.dueDate);
      notificationDate.setDate(notificationDate.getDate() - daysBefore);

      // Skip if notification date is in the past
      if (notificationDate <= new Date()) continue;

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: this.getNotificationTitle(reminder, daysBefore),
          body: this.getNotificationBody(reminder, daysBefore),
          data: { 
            reminderId: reminder.id,
            type: reminder.type,
            amount: reminder.amount,
            dueDate: reminder.dueDate.toISOString()
          },
          categoryIdentifier: 'payment_reminder',
          badge: 1,
        },
        trigger: {
          date: notificationDate,
        },
      });

      scheduledNotifications.push({
        id: `${reminder.id}_${daysBefore}`,
        reminderId: reminder.id,
        scheduledDate: notificationDate,
        notificationId,
      });
    }

    // Save scheduled notifications
    await this.saveScheduledNotifications(scheduledNotifications);
  }

  // Get notification title based on reminder type and days
  private static getNotificationTitle(reminder: PaymentReminder, daysBefore: number): string {
    const urgency = daysBefore <= 3 ? '🚨 Urgent: ' : daysBefore <= 7 ? '⏰ ' : '';
    
    if (daysBefore === 0) {
      return `${urgency}${reminder.title} Due Today!`;
    } else if (daysBefore === 1) {
      return `${urgency}${reminder.title} Due Tomorrow`;
    } else {
      return `${urgency}${reminder.title} Due in ${daysBefore} Days`;
    }
  }

  // Get notification body based on reminder type
  private static getNotificationBody(reminder: PaymentReminder, daysBefore: number): string {
    const amount = `$${reminder.amount.toLocaleString()}`;
    
    switch (reminder.type) {
      case 'visa':
        if (daysBefore <= 7) {
          return `Critical: Your visa renewal payment of ${amount} is due soon. Missing this deadline may affect your visa status.`;
        }
        return `Remember to prepare ${amount} for your visa renewal. Start gathering required documents.`;
      
      case 'tuition':
        if (daysBefore <= 3) {
          return `Urgent: University tuition of ${amount} must be paid before census date to avoid enrollment cancellation.`;
        }
        return `University tuition payment of ${amount} is coming up. Ensure funds are ready.`;
      
      case 'school':
        return `School fees of ${amount} are due. Late payment may incur additional charges.`;
      
      case 'childcare':
        return `Weekly childcare fee of ${amount} is due. Maintain regular payments to keep your childcare spot.`;
      
      default:
        return `Payment of ${amount} is due. Tap to view details.`;
    }
  }

  // Cancel all notifications for a specific reminder
  static async cancelReminderNotifications(reminderId: string): Promise<void> {
    const scheduled = await this.getScheduledNotifications();
    const toCancel = scheduled.filter(n => n.reminderId === reminderId);
    
    for (const notification of toCancel) {
      await Notifications.cancelScheduledNotificationAsync(notification.notificationId);
    }
    
    // Update stored notifications
    const remaining = scheduled.filter(n => n.reminderId !== reminderId);
    await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(remaining));
  }

  // Schedule notifications for multiple reminders
  static async scheduleMultipleReminders(reminders: PaymentReminder[]): Promise<void> {
    for (const reminder of reminders) {
      await this.schedulePaymentReminder(reminder);
    }
  }

  // Get all scheduled notifications
  static async getScheduledNotifications(): Promise<ScheduledNotification[]> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  // Save scheduled notifications to storage
  private static async saveScheduledNotifications(notifications: ScheduledNotification[]): Promise<void> {
    const existing = await this.getScheduledNotifications();
    const updated = [...existing, ...notifications];
    await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
  }

  // Cancel all scheduled notifications
  static async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await AsyncStorage.removeItem(this.STORAGE_KEY);
  }

  // Check if notifications are enabled
  static async areNotificationsEnabled(): Promise<boolean> {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  }

  // Schedule a test notification
  static async scheduleTestNotification(): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'GlobFam Test Notification',
        body: 'Payment reminders are working correctly! You\'ll receive alerts before important payment dates.',
        categoryIdentifier: 'test',
      },
      trigger: {
        seconds: 5,
      },
    });
  }

  // Handle notification response (when user taps notification)
  static async handleNotificationResponse(response: Notifications.NotificationResponse): Promise<void> {
    const data = response.notification.request.content.data;
    
    if (data?.type === 'visa') {
      // Navigate to visa compliance screen
      // This would typically use navigation service
      console.log('Navigate to visa compliance screen');
    } else if (data?.type === 'tuition' || data?.type === 'school') {
      // Navigate to budget planner
      console.log('Navigate to budget planner');
    }
  }

  // Set up notification listeners
  static setupNotificationListeners(): () => void {
    // Handle notification received while app is in foreground
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Handle notification response (user interaction)
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      this.handleNotificationResponse(response);
    });

    // Return cleanup function
    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }

  // Get notification settings for display in app
  static async getNotificationSettings(): Promise<{
    enabled: boolean;
    sound: boolean;
    alert: boolean;
    badge: boolean;
  }> {
    const settings = await Notifications.getPermissionsAsync();
    
    return {
      enabled: settings.status === 'granted',
      sound: settings.ios?.allowsSound ?? true,
      alert: settings.ios?.allowsAlert ?? true,
      badge: settings.ios?.allowsBadge ?? true,
    };
  }
}

export default NotificationService;