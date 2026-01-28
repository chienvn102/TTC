import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = '@app_settings';

export interface AppSettings {
    alarmEnabled: boolean;
    ttsEnabled: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
    alarmEnabled: true,
    ttsEnabled: true,
};

export async function getSettings(): Promise<AppSettings> {
    try {
        const json = await AsyncStorage.getItem(SETTINGS_KEY);
        if (json) {
            return { ...DEFAULT_SETTINGS, ...JSON.parse(json) };
        }
        return DEFAULT_SETTINGS;
    } catch (error) {
        console.error('Error getting settings:', error);
        return DEFAULT_SETTINGS;
    }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
    try {
        await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error('Error saving settings:', error);
    }
}

export async function setAlarmEnabled(enabled: boolean): Promise<void> {
    const settings = await getSettings();
    settings.alarmEnabled = enabled;
    await saveSettings(settings);
}

export async function setTtsEnabled(enabled: boolean): Promise<void> {
    const settings = await getSettings();
    settings.ttsEnabled = enabled;
    await saveSettings(settings);
}
