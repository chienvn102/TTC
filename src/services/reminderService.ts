import AsyncStorage from '@react-native-async-storage/async-storage';
import { ReminderTask, ApiResponse } from '../types/reminder';

const API_URL = 'https://trungtamcntt.bn1.vn/api/nhacviec';
const TASKS_STORAGE_KEY = '@reminder_tasks';

// Parse HTML to extract datetime
function parseDateTime(html: string): Date {
    // Extract datetime from: <time datetime="2026-01-22T05:12:12Z">
    const match = html.match(/datetime="([^"]+)"/);
    if (match && match[1]) {
        return new Date(match[1]);
    }
    return new Date();
}

// Parse HTML to extract title text
function parseTitle(html: string): { title: string; nodeUrl: string } {
    // Extract from: <a href="/node/112">title text</a>
    const hrefMatch = html.match(/href="([^"]+)"/);
    const textMatch = html.match(/>([^<]+)</);

    return {
        title: textMatch ? textMatch[1] : html,
        nodeUrl: hrefMatch ? `https://trungtamcntt.bn1.vn${hrefMatch[1]}` : '',
    };
}

// Convert API response to ReminderTask
function apiToTask(item: ApiResponse): ReminderTask {
    const { title, nodeUrl } = parseTitle(item.title);

    // Extract node ID from URL (e.g., /node/115 -> 115)
    const nodeIdMatch = nodeUrl.match(/\/node\/(\d+)/);
    const nodeId = nodeIdMatch ? nodeIdMatch[1] : item.counter;

    return {
        id: nodeId,  // Use node ID as unique identifier
        title,
        nodeUrl,
        deadline: parseDateTime(item.field_han_hoan_thanh),
        reminderTime: parseDateTime(item.field_thoi_gian_nhac_viec),
        notified: false,
        alarmScheduled: false,
    };
}

// Fetch tasks from API
export async function fetchReminders(): Promise<ReminderTask[]> {
    try {
        console.log('Fetching from API:', API_URL);
        const response = await fetch(API_URL);
        const data: ApiResponse[] = await response.json();
        console.log('API response:', data.length, 'tasks');
        return data.map(apiToTask);
    } catch (error) {
        console.error('Error fetching reminders:', error);
        return [];
    }
}

// Get stored tasks
export async function getStoredTasks(): Promise<ReminderTask[]> {
    try {
        const json = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
        if (json) {
            const tasks = JSON.parse(json);
            // Convert date strings back to Date objects
            return tasks.map((t: any) => ({
                ...t,
                deadline: new Date(t.deadline),
                reminderTime: new Date(t.reminderTime),
            }));
        }
        return [];
    } catch (error) {
        console.error('Error getting stored tasks:', error);
        return [];
    }
}

// Save tasks
export async function saveTasks(tasks: ReminderTask[]): Promise<void> {
    try {
        await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
        console.error('Error saving tasks:', error);
    }
}

// Find new tasks (not in stored list)
export function findNewTasks(
    fetched: ReminderTask[],
    stored: ReminderTask[]
): ReminderTask[] {
    const storedIds = new Set(stored.map(t => t.id));
    return fetched.filter(t => !storedIds.has(t.id));
}

// Mark task as notified
export async function markAsNotified(taskId: string): Promise<void> {
    const tasks = await getStoredTasks();
    const updated = tasks.map(t =>
        t.id === taskId ? { ...t, notified: true } : t
    );
    await saveTasks(updated);
}

// Mark alarm as scheduled
export async function markAlarmScheduled(taskId: string): Promise<void> {
    const tasks = await getStoredTasks();
    const updated = tasks.map(t =>
        t.id === taskId ? { ...t, alarmScheduled: true } : t
    );
    await saveTasks(updated);
}
