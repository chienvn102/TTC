import notifee, { AndroidImportance } from '@notifee/react-native';
import { checkForNewReminders } from './pollingService';

const FOREGROUND_CHANNEL = 'foreground-service';
const POLL_INTERVAL_MS = 60 * 1000; // 60 seconds

let isRunning = false;

// Create notification channel for foreground service
async function createForegroundChannel() {
    await notifee.createChannel({
        id: FOREGROUND_CHANNEL,
        name: 'Dịch vụ nền',
        importance: AndroidImportance.LOW,
        sound: undefined,
    });
}

// Update foreground notification with status
export async function updateForegroundNotification(message: string) {
    await notifee.displayNotification({
        id: 'foreground-service',
        title: 'Trung tâm CNTT',
        body: message,
        android: {
            channelId: FOREGROUND_CHANNEL,
            asForegroundService: true,
            ongoing: true,
            smallIcon: 'ic_launcher',
            pressAction: {
                id: 'default',
            },
        },
    });
}

// Register background event handler
export function registerBackgroundHandler() {
    notifee.registerForegroundService((notification) => {
        return new Promise(async () => {
            isRunning = true;
            console.log('Foreground service started');

            // Initial check
            const result = await checkForNewReminders();
            const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            await updateForegroundNotification(`Lần kiểm tra cuối: ${now} (${result.totalTasks} task)`);

            // Polling loop
            while (isRunning) {
                await new Promise<void>(resolve => setTimeout(() => resolve(), POLL_INTERVAL_MS));
                if (isRunning) {
                    try {
                        const r = await checkForNewReminders();
                        const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                        await updateForegroundNotification(`Lần kiểm tra cuối: ${time} (${r.totalTasks} task, ${r.newTasks.length} mới)`);
                        console.log('Poll check:', r.totalTasks, 'total,', r.newTasks.length, 'new');
                    } catch (error) {
                        console.error('Poll error:', error);
                        await updateForegroundNotification('Lỗi kết nối API');
                    }
                }
            }
        });
    });
}

// Start foreground service
export async function startForegroundService() {
    if (isRunning) return;

    await createForegroundChannel();
    await updateForegroundNotification('Đang khởi động...');
}

// Stop foreground service
export async function stopForegroundService() {
    isRunning = false;
    await notifee.stopForegroundService();
}

// Check if service is running
export function isServiceRunning() {
    return isRunning;
}
