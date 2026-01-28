import notifee, {
    AndroidImportance,
    AndroidCategory,
    TriggerType,
    TimestampTrigger,
    AuthorizationStatus,
    AlarmType,
    AndroidNotificationSetting,
} from '@notifee/react-native';
import { Alert, Linking, Platform } from 'react-native';
import { ReminderTask } from '../types/reminder';

// Channel IDs
const IMMEDIATE_CHANNEL = 'immediate-notifications';
const ALARM_CHANNEL = 'alarm-notifications';

// Initialize notification channels with custom sound
export async function initializeNotifications(): Promise<void> {
    // Channel for immediate notifications
    await notifee.createChannel({
        id: IMMEDIATE_CHANNEL,
        name: 'Thông báo nhắc việc',
        importance: AndroidImportance.HIGH,
        sound: 'noti_sound',
    });

    // Channel for alarm (with custom sound)
    await notifee.createChannel({
        id: ALARM_CHANNEL,
        name: 'Báo thức nhắc việc',
        importance: AndroidImportance.HIGH,
        sound: 'noti_sound',
        vibration: true,
        vibrationPattern: [500, 200, 500, 200],
    });
}

// Request permissions on first launch
export async function requestPermissions(): Promise<boolean> {
    const settings = await notifee.requestPermission();

    if (settings.authorizationStatus === AuthorizationStatus.DENIED) {
        Alert.alert(
            'Quyền thông báo',
            'App cần quyền thông báo để nhắc việc. Vui lòng bật trong Cài đặt.',
            [
                { text: 'Hủy', style: 'cancel' },
                { text: 'Mở Cài đặt', onPress: () => Linking.openSettings() },
            ]
        );
        return false;
    }

    // Check battery optimization (Android)
    if (Platform.OS === 'android') {
        // 1. Check Battery Optimization
        const batteryOptimizationEnabled = await notifee.isBatteryOptimizationEnabled();
        if (batteryOptimizationEnabled) {
            Alert.alert(
                'Cho phép chạy nền',
                'Để báo thức hoạt động chính xác, vui lòng chọn "Không tối ưu" (hoặc Không hạn chế) trong cài đặt Pin.',
                [
                    { text: 'Để sau', style: 'cancel' },
                    {
                        text: 'Mở Cài đặt',
                        onPress: () => notifee.openBatteryOptimizationSettings()
                    },
                ]
            );
        }

        // 2. Check Alarm Permission (Android 12+)
        if (Platform.Version >= 31) {
            const alarmSettings = await notifee.getNotificationSettings();
            if (alarmSettings.android.alarm !== AndroidNotificationSetting.ENABLED) {
                Alert.alert(
                    'Quyền báo thức',
                    'Vui lòng cấp quyền "Báo thức & Nhắc nhở" để ứng dụng có thể báo thức đúng giờ.',
                    [
                        { text: 'Để sau', style: 'cancel' },
                        {
                            text: 'Mở Cài đặt',
                            onPress: () => notifee.openAlarmPermissionSettings()
                        },
                    ]
                );
            }
        }
    }

    return true;
}

// Send immediate notification when new task detected
export async function sendImmediateNotification(task: ReminderTask): Promise<void> {
    const deadlineTime = task.deadline.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const deadlineDate = task.deadline.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

    await notifee.displayNotification({
        id: `immediate-${task.id}`,
        title: 'Bạn có nhắc việc mới',
        body: `${task.title}\nHạn: ${deadlineTime} ngày ${deadlineDate}`,
        android: {
            channelId: IMMEDIATE_CHANNEL,
            pressAction: { id: 'default' },
            smallIcon: 'ic_launcher',
            sound: 'noti_sound',
        },
    });
}

// Schedule alarm for reminder time
export async function scheduleAlarm(task: ReminderTask): Promise<void> {
    const now = Date.now();
    const reminderMs = task.reminderTime.getTime();

    // Only schedule if reminder time is in the future
    if (reminderMs <= now) {
        console.log(`Skipping alarm for task ${task.id} - reminder time has passed`);
        return;
    }

    const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: reminderMs,
        alarmManager: {
            type: AlarmType.SET_ALARM_CLOCK,
            allowWhileIdle: true,
        },
    };

    const deadlineStr = task.deadline.toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
    });

    await notifee.createTriggerNotification(
        {
            id: `alarm-${task.id}`,
            title: 'ĐẾN GIỜ NHẮC VIỆC!',
            body: `${task.title}\nHạn hoàn thành: ${deadlineStr}`,
            android: {
                channelId: ALARM_CHANNEL,
                category: AndroidCategory.ALARM,
                // Critical for full screen alarm behavior
                pressAction: { id: 'default', launchActivity: 'default' },
                fullScreenAction: { id: 'default', launchActivity: 'default' },
                smallIcon: 'ic_launcher',
                importance: AndroidImportance.HIGH,
                autoCancel: false,
                ongoing: true,
                loopSound: true, // Loop sound until dismissed
                sound: 'noti_sound',
                actions: [
                    { title: 'Tắt', pressAction: { id: 'dismiss' } },
                    { title: 'Xem chi tiết', pressAction: { id: 'view', launchActivity: 'default' } },
                ],
            },
        },
        trigger
    );

    console.log(`Scheduled alarm for task ${task.id} at ${task.reminderTime}`);
}

// Cancel a scheduled alarm
export async function cancelAlarm(taskId: string): Promise<void> {
    await notifee.cancelNotification(`alarm-${taskId}`);
}

// Get all scheduled notifications
export async function getScheduledNotifications() {
    return await notifee.getTriggerNotifications();
}
