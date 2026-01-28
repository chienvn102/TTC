import {
    fetchReminders,
    getStoredTasks,
    saveTasks,
    findNewTasks,
    markAsNotified,
    markAlarmScheduled,
} from './reminderService';
import {
    initializeNotifications,
    sendImmediateNotification,
    scheduleAlarm,
} from './notificationService';
import { ReminderTask } from '../types/reminder';

let pollingInterval: ReturnType<typeof setInterval> | null = null;
const POLL_INTERVAL_MS = 60 * 1000; // 60 seconds

// Initialize the polling service
export async function initPolling(): Promise<void> {
    // Initialize notification channels
    await initializeNotifications();

    // Do first check immediately
    await checkForNewReminders();

    // Start polling
    startPolling();
}

// Start polling interval
export function startPolling(): void {
    if (pollingInterval) {
        clearInterval(pollingInterval);
    }

    pollingInterval = setInterval(async () => {
        await checkForNewReminders();
    }, POLL_INTERVAL_MS);

    console.log('Polling started - checking every 60 seconds');
}

// Stop polling
export function stopPolling(): void {
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
    }
    console.log('Polling stopped');
}

// Main function to check for new reminders
export async function checkForNewReminders(): Promise<{
    newTasks: ReminderTask[];
    totalTasks: number;
}> {
    try {
        // Fetch from API
        const fetchedTasks = await fetchReminders();

        // Get stored tasks
        const storedTasks = await getStoredTasks();

        // Find new tasks
        const newTasks = findNewTasks(fetchedTasks, storedTasks);

        if (newTasks.length > 0) {
            console.log(`Found ${newTasks.length} new task(s)`);

            // Get settings
            const { getSettings } = await import('../storage/settingsStorage');
            const settings = await getSettings();

            // Process each new task
            for (const task of newTasks) {
                // Send immediate notification
                await sendImmediateNotification(task);
                task.notified = true;

                // Schedule alarm only if enabled
                if (settings.alarmEnabled) {
                    await scheduleAlarm(task);
                    task.alarmScheduled = true;
                }
            }

            // Merge and save all tasks
            const allTasks = [...storedTasks, ...newTasks];
            await saveTasks(allTasks);
        }

        return {
            newTasks,
            totalTasks: fetchedTasks.length,
        };
    } catch (error) {
        console.error('Error checking for reminders:', error);
        return { newTasks: [], totalTasks: 0 };
    }
}

// Force refresh - clear stored and re-fetch
export async function forceRefresh(): Promise<void> {
    const fetched = await fetchReminders();

    // Re-schedule alarms for tasks with future reminder times
    for (const task of fetched) {
        if (task.reminderTime.getTime() > Date.now()) {
            await scheduleAlarm(task);
            task.alarmScheduled = true;
        }
    }

    await saveTasks(fetched);
}
