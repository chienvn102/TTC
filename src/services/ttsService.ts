import Tts from 'react-native-tts';
import { getSettings } from '../storage/settingsStorage';

let isInitialized = false;

// Initialize TTS
export async function initTts(): Promise<void> {
    if (isInitialized) return;

    try {
        await Tts.setDefaultLanguage('vi-VN');
        await Tts.setDefaultRate(0.5);
        await Tts.setDefaultPitch(1.0);
        isInitialized = true;
    } catch (error) {
        console.error('Error initializing TTS:', error);
        // Try with default language
        try {
            await Tts.setDefaultLanguage('en-US');
            isInitialized = true;
        } catch (e) {
            console.error('TTS not available:', e);
        }
    }
}

// Speak notification content
export async function speakNotification(title: string, deadline: Date): Promise<void> {
    const settings = await getSettings();

    if (!settings.ttsEnabled) {
        return;
    }

    await initTts();

    const deadlineStr = deadline.toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
    });

    const message = `Nhắc việc: ${title}. Hạn hoàn thành: ${deadlineStr}.`;

    try {
        await Tts.stop();
        await Tts.speak(message);
    } catch (error) {
        console.error('Error speaking:', error);
    }
}

// Stop speaking
export async function stopSpeaking(): Promise<void> {
    try {
        await Tts.stop();
    } catch (error) {
        console.error('Error stopping TTS:', error);
    }
}
