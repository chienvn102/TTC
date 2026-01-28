import BackgroundFetch from 'react-native-background-fetch';
import { checkForNewReminders } from './pollingService';
import { updateForegroundNotification } from './foregroundService';

// Configure and start background fetch
export async function initBackgroundFetch(): Promise<void> {
    try {
        // Configure BackgroundFetch
        const status = await BackgroundFetch.configure(
            {
                minimumFetchInterval: 15, // Minimum 15 minutes for production
                stopOnTerminate: false,   // Keep running after app terminate
                startOnBoot: true,        // Start on device boot
                enableHeadless: true,     // Enable headless task
                forceAlarmManager: true,  // Force AlarmManager instead of JobScheduler
                requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
            },
            async (taskId) => {
                console.log('[BackgroundFetch] Task:', taskId);

                // Check for new reminders
                const result = await checkForNewReminders();
                const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                await updateForegroundNotification(`[BG] Checks: ${time} (${result.totalTasks} task)`);
                console.log('[BackgroundFetch] Result:', result.totalTasks, 'total,', result.newTasks.length, 'new');

                // Signal completion
                BackgroundFetch.finish(taskId);
            },
            async (taskId) => {
                // Timeout callback
                console.log('[BackgroundFetch] Timeout:', taskId);
                BackgroundFetch.finish(taskId);
            }
        );

        console.log('[BackgroundFetch] Status:', status);

        // Schedule a more frequent task for testing (every 1 minute)
        await BackgroundFetch.scheduleTask({
            taskId: 'com.trungtamcntt.poll',
            delay: 60000,           // 60 seconds
            periodic: true,
            forceAlarmManager: true,
            enableHeadless: true,
        });

        console.log('[BackgroundFetch] Scheduled 60s polling task');
    } catch (error) {
        console.error('[BackgroundFetch] Error:', error);
    }
}

// Headless task handler (runs when app is terminated)
export async function headlessTask(event: { taskId: string; timeout: boolean }): Promise<void> {
    const { taskId, timeout } = event;

    if (timeout) {
        console.log('[BackgroundFetch] Headless timeout:', taskId);
        BackgroundFetch.finish(taskId);
        return;
    }

    console.log('[BackgroundFetch] Headless task:', taskId);

    // Check for new reminders
    const result = await checkForNewReminders();
    const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    await updateForegroundNotification(`[Headless] Checks: ${time} (${result.totalTasks} task)`);
    console.log('[BackgroundFetch] Headless result:', result.totalTasks, 'total,', result.newTasks.length, 'new');

    BackgroundFetch.finish(taskId);
}

// Start background fetch
export async function startBackgroundPolling(): Promise<void> {
    await initBackgroundFetch();
    await BackgroundFetch.start();
}

// Stop background fetch
export async function stopBackgroundPolling(): Promise<void> {
    await BackgroundFetch.stop();
}
