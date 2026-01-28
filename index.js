/**
 * @format
 */

import { AppRegistry } from 'react-native';
import notifee, { EventType } from '@notifee/react-native';
import BackgroundFetch from 'react-native-background-fetch';
import App from './App';
import { name as appName } from './app.json';
import { registerRobustHandler } from './src/services/robustPollingService';

// Register robust handler
registerRobustHandler();

// Register BackgroundFetch headless task
BackgroundFetch.registerHeadlessTask(async (event) => {
    const { taskId, timeout } = event;

    console.log('[BackgroundFetch] Headless task:', taskId, 'timeout:', timeout);

    if (timeout) {
        BackgroundFetch.finish(taskId);
        return;
    }

    try {
        // Import and run check
        const { checkForNewReminders } = await import('./src/services/pollingService');
        const result = await checkForNewReminders();

        console.log('[BackgroundFetch] Headless check complete:', result.totalTasks, 'tasks');
    } catch (error) {
        console.error('[BackgroundFetch] Headless error:', error);
    }

    BackgroundFetch.finish(taskId);
});

// Handle notification events (background and quit state)
notifee.onBackgroundEvent(async ({ type, detail }) => {
    const { notification, pressAction } = detail;

    if (type === EventType.ACTION_PRESS) {
        if (pressAction?.id === 'dismiss') {
            if (notification?.id) {
                await notifee.cancelNotification(notification.id);
            }
        } else if (pressAction?.id === 'check_now') {
            // Manual check triggered from notification
            try {
                const { checkForNewReminders } = await import('./src/services/pollingService');
                await checkForNewReminders();
            } catch (error) {
                console.error('[Notifee] Manual check error:', error);
            }
        }
    }

    if (type === EventType.DISMISSED) {
        if (notification?.id) {
            await notifee.cancelNotification(notification.id);
        }
    }
});

AppRegistry.registerComponent(appName, () => App);

