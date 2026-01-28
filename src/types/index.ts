// Types for the app
import { ReminderTask } from './reminder';

export interface AppItem {
    id: string;
    name: string;
    url: string;
    createdAt: number;
}

export type RootStackParamList = {
    MainTabs: undefined;
    Home: undefined;
    Notifications: undefined;
    Settings: undefined;
    WebView: { url: string; title: string };
    NotificationDetail: { task: ReminderTask };
};
