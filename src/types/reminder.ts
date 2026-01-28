// Types for notification/reminder system

export interface ReminderTask {
    id: string;           // counter from API
    title: string;        // clean title (stripped HTML)
    nodeUrl: string;      // extracted URL from title
    deadline: Date;       // field_han_hoan_thanh
    reminderTime: Date;   // field_thoi_gian_nhac_viec
    notified: boolean;    // has been notified?
    alarmScheduled: boolean;
}

export interface ApiResponse {
    counter: string;
    title: string;
    field_han_hoan_thanh: string;
    field_thoi_gian_nhac_viec: string;
}
