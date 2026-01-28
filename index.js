/**
 * @format
 */

import { AppRegistry } from 'react-native';
import notifee, { EventType } from '@notifee/react-native';
import BackgroundFetch from 'react-native-background-fetch';
import App from './App';
import { name as appName } from './app.json';
import { registerBackgroundHandler } from './src/services/foregroundService';
import { headlessTask } from './src/services/backgroundFetchService';

// Register foreground service handler
registerBackgroundHandler();

// Register BackgroundFetch headless task
BackgroundFetch.registerHeadlessTask(headlessTask);

// Handle notification events (background and quit state)
notifee.onBackgroundEvent(async ({ type, detail }) => {
    const { notification, pressAction } = detail;

    if (type === EventType.ACTION_PRESS) {
        if (pressAction?.id === 'dismiss') {
            // Cancel the notification
            if (notification?.id) {
                await notifee.cancelNotification(notification.id);
            }
        } else if (pressAction?.id === 'view') {
            // Will open app - handle in foreground
        }
    }

    if (type === EventType.DISMISSED) {
        // Notification was dismissed by user
        if (notification?.id) {
            await notifee.cancelNotification(notification.id);
        }
    }
});

AppRegistry.registerComponent(appName, () => App);
