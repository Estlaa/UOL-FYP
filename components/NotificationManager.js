import * as Notifications from 'expo-notifications';

export async function requestNotificationPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    alert('Notification permissions not granted!');
    return false;
  }
  return true;
}

// Schedule a new notification 1 week before the task's due date
export async function scheduleTaskNotification(taskTitle, dueDate) {
  // 1 week before
  const triggerTime = new Date(dueDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Task Reminder',
        body: `Your task "${taskTitle}" is due soon!`,
        sound: true,
      },
      trigger: triggerTime,
    });
    return notificationId;
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
}

// Update an existing notification: cancel the old one and schedule a new one
export async function updateTaskNotification(existingNotificationId, taskTitle, dueDate) {
  if (existingNotificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(existingNotificationId);
    } catch (error) {
      console.warn('Error cancelling old notification:', error);
    }
  }
  return await scheduleTaskNotification(taskTitle, dueDate);
}

// Cancel a notification when a task is deleted
export async function cancelTaskNotification(notificationId) {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Error cancelling notification:', error);
  }
}
