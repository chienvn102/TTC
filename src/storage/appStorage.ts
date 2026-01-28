import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppItem } from '../types';

const APPS_KEY = '@apps_list';
const CURRENT_USER_KEY = '@current_user';
const INITIALIZED_KEY = '@app_initialized';

// Default website
export const DEFAULT_APP: AppItem = {
    id: 'default-1',
    name: 'Trung tâm CNTT Bắc Ninh',
    url: 'https://trungtamcntt.bn1.vn/',
    createdAt: 0,
};

// Initialize with default app on first launch
// Initialize with default app on first launch
export const initializeDefaultApps = async (): Promise<void> => {
    try {
        const apps = await getApps();

        // Check if default website is already in the list
        const defaultExists = apps.some(app => app.url === DEFAULT_APP.url);

        if (!defaultExists) {
            // Add default app to the beginning of the list
            const newApps = [DEFAULT_APP, ...apps];
            await saveApps(newApps);
            console.log('Default app added');
        }
    } catch (e) {
        console.error('Error initializing apps:', e);
    }
};

export const getApps = async (): Promise<AppItem[]> => {
    try {
        const jsonValue = await AsyncStorage.getItem(APPS_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
        console.error('Error reading apps:', e);
        return [];
    }
};

export const saveApps = async (apps: AppItem[]): Promise<void> => {
    try {
        const jsonValue = JSON.stringify(apps);
        await AsyncStorage.setItem(APPS_KEY, jsonValue);
    } catch (e) {
        console.error('Error saving apps:', e);
    }
};

export const addApp = async (name: string, url: string): Promise<AppItem> => {
    const apps = await getApps();
    const newApp: AppItem = {
        id: Date.now().toString(),
        name,
        url: url.startsWith('http') ? url : `https://${url}`,
        createdAt: Date.now(),
    };
    apps.push(newApp);
    await saveApps(apps);
    return newApp;
};

export const updateApp = async (id: string, name: string, url: string): Promise<void> => {
    const apps = await getApps();
    const index = apps.findIndex(app => app.id === id);
    if (index !== -1) {
        apps[index] = {
            ...apps[index],
            name,
            url: url.startsWith('http') ? url : `https://${url}`,
        };
        await saveApps(apps);
    }
};

export const deleteApp = async (id: string): Promise<void> => {
    const apps = await getApps();
    const filteredApps = apps.filter(app => app.id !== id);
    await saveApps(filteredApps);
};

export const getCurrentUser = async (): Promise<string> => {
    try {
        const value = await AsyncStorage.getItem(CURRENT_USER_KEY);
        return value || 'User 1';
    } catch (e) {
        return 'User 1';
    }
};

export const setCurrentUser = async (user: string): Promise<void> => {
    try {
        await AsyncStorage.setItem(CURRENT_USER_KEY, user);
    } catch (e) {
        console.error('Error saving user:', e);
    }
};
