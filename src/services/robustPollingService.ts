import notifee, { AndroidImportance } from '@notifee/react-native';
import BackgroundFetch from 'react-native-background-fetch';
import { checkForNewReminders } from './pollingService';

const FOREGROUND_CHANNEL = 'robust-foreground-service';
const POLL_INTERVAL_MS = 60 * 1000; // 60 seconds
const HEALTH_CHECK_INTERVAL = 30 * 1000; // 30 seconds

let isServiceActive = false;
let lastCheckTime = 0;
let checkCount = 0;
let healthCheckInterval: ReturnType<typeof setInterval> | null = null;

// Create notification channel
async function createChannel() {
    await notifee.createChannel({
        id: FOREGROUND_CHANNEL,
        name: 'Dịch vụ kiểm tra nhắc việc',
        importance: AndroidImportance.LOW,
        sound: undefined,
    });
}

// Update notification with detailed status
async function updateNotification(status: string, details?: string) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    let body = `${status}\n`;
    body += `Lần kiểm tra: ${checkCount}\n`;
    body += `Thời gian: ${timeStr}`;

    if (details) {
        body += `\n${details}`;
    }

    await notifee.displayNotification({
        id: 'robust-service',
        title: '🔄 Trung tâm CNTT - Đang hoạt động',
        body,
        android: {
            channelId: FOREGROUND_CHANNEL,
            asForegroundService: true,
            ongoing: true,
            smallIcon: 'ic_launcher',
            color: '#7C3AED',
            pressAction: { id: 'default' },
            actions: [
                {
                    title: 'Kiểm tra ngay',
                    pressAction: { id: 'check_now' },
                },
            ],
        },
    });
}

// Main check function
async function performCheck() {
    try {
        checkCount++;
        lastCheckTime = Date.now();

        await updateNotification('Đang kiểm tra...', 'Đang kết nối API');

        const result = await checkForNewReminders();

        const details = `✓ ${result.totalTasks} task, ${result.newTasks.length} mới`;
        await updateNotification('Hoạt động bình thường', details);

        console.log('[RobustPolling] Check completed:', details);
    } catch (error) {
        console.error('[RobustPolling] Check error:', error);
        await updateNotification('Lỗi kết nối', 'Sẽ thử lại sau 60s');
    }
}

// Health check - ensure service is still running
function startHealthCheck() {
    if (healthCheckInterval) {
        clearInterval(healthCheckInterval);
    }

    healthCheckInterval = setInterval(() => {
        const timeSinceLastCheck = Date.now() - lastCheckTime;

        // If > 90s since last check, restart service
        if (timeSinceLastCheck > 90000) {
            console.warn('[RobustPolling] Service appears frozen, restarting...');
            restartService();
        }
    }, HEALTH_CHECK_INTERVAL);
}

// Restart service
async function restartService() {
    console.log('[RobustPolling] Restarting service...');
    await stopService();
    await startService();
}

// Configure BackgroundFetch with optimal settings
async function configureBackgroundFetch() {
    try {
        await BackgroundFetch.configure(
            {
                minimumFetchInterval: 15, // 15 minutes
                stopOnTerminate: false,   // Continue after app closes
                startOnBoot: true,        // Auto-start on device boot
                enableHeadless: true,     // Run when app not open
                forceAlarmManager: true,  // Use AlarmManager (more reliable)
                requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
            },
            async (taskId) => {
                console.log('[BackgroundFetch] Task triggered:', taskId);

                // Ensure notification is showing
                if (!isServiceActive) {
                    await startService();
                }

                await performCheck();
                BackgroundFetch.finish(taskId);
            },
            async (taskId) => {
                console.log('[BackgroundFetch] Task timeout:', taskId);
                BackgroundFetch.finish(taskId);
            }
        );

        // Schedule periodic task (60 seconds)
        await BackgroundFetch.scheduleTask({
            taskId: 'com.trungtamcntt.robust-poll',
            delay: 0,               // Run immediately
            periodic: true,
            forceAlarmManager: true,
            enableHeadless: true,
            stopOnTerminate: false,
        });

        console.log('[RobustPolling] BackgroundFetch configured');
    } catch (error) {
        console.error('[RobustPolling] BackgroundFetch error:', error);
    }
}

// Register foreground service handler
export function registerRobustHandler() {
    notifee.registerForegroundService(async (notification) => {
        console.log('[RobustPolling] Foreground service started');

        isServiceActive = true;
        lastCheckTime = Date.now();

        // Immediate check
        await performCheck();

        // Start health check
        startHealthCheck();

        // Setup interval for periodic checks
        const intervalId = setInterval(async () => {
            if (isServiceActive) {
                await performCheck();
            } else {
                clearInterval(intervalId);
            }
        }, POLL_INTERVAL_MS);

        // Cleanup when service stops
        return new Promise(() => {
            // Service runs indefinitely
        });
    });

    // Handle notification actions
    notifee.onForegroundEvent(async ({ type, detail }) => {
        if (type === 1 && detail.pressAction?.id === 'check_now') {
            console.log('[RobustPolling] Manual check triggered');
            await performCheck();
        }
    });
}

// Start service
export async function startService() {
    if (isServiceActive) {
        console.log('[RobustPolling] Service already running');
        return;
    }

    try {
        await createChannel();
        await configureBackgroundFetch();

        isServiceActive = true;
        checkCount = 0;

        await updateNotification('Khởi động...', 'Đang chuẩn bị');

        // Start BackgroundFetch
        await BackgroundFetch.start();

        console.log('[RobustPolling] Service started successfully');
    } catch (error) {
        console.error('[RobustPolling] Start error:', error);
        isServiceActive = false;
    }
}

// Stop service
export async function stopService() {
    isServiceActive = false;

    if (healthCheckInterval) {
        clearInterval(healthCheckInterval);
        healthCheckInterval = null;
    }

    try {
        await BackgroundFetch.stop();
        await notifee.stopForegroundService();
        console.log('[RobustPolling] Service stopped');
    } catch (error) {
        console.error('[RobustPolling] Stop error:', error);
    }
}

// Check if service is running
export function isServiceRunning(): boolean {
    return isServiceActive;
}

// Get service stats
export function getServiceStats() {
    return {
        isActive: isServiceActive,
        checkCount,
        lastCheckTime: new Date(lastCheckTime),
        timeSinceLastCheck: Date.now() - lastCheckTime,
    };
}
