import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    Switch,
    TouchableOpacity,
    Linking,
    Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { getSettings, saveSettings, AppSettings } from '../storage/settingsStorage';
import { getServiceStats, isServiceRunning, startService, stopService } from '../services/robustPollingService';
import { checkForNewReminders } from '../services/pollingService';

type SettingsScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Settings'>;
};

interface ServiceStats {
    isActive: boolean;
    checkCount: number;
    lastCheckTime: Date;
    timeSinceLastCheck: number;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
    const [settings, setSettings] = useState<AppSettings>({
        alarmEnabled: true,
        ttsEnabled: true,
    });
    const [serviceStats, setServiceStats] = useState<ServiceStats | null>(null);
    const [isChecking, setIsChecking] = useState(false);

    useEffect(() => {
        loadSettings();
        updateStats();

        // Update stats every 5 seconds
        const interval = setInterval(updateStats, 5000);
        return () => clearInterval(interval);
    }, []);

    const loadSettings = async () => {
        const s = await getSettings();
        setSettings(s);
    };

    const updateStats = () => {
        const stats = getServiceStats();
        setServiceStats(stats);
    };

    const toggleAlarm = async () => {
        const newSettings = { ...settings, alarmEnabled: !settings.alarmEnabled };
        setSettings(newSettings);
        await saveSettings(newSettings);
    };

    const toggleTts = async () => {
        const newSettings = { ...settings, ttsEnabled: !settings.ttsEnabled };
        setSettings(newSettings);
        await saveSettings(newSettings);
    };

    const handleCheckNow = async () => {
        setIsChecking(true);
        try {
            const result = await checkForNewReminders();
            Alert.alert(
                'Kết quả kiểm tra',
                `Tổng: ${result.totalTasks} task\nMới: ${result.newTasks.length} task`,
            );
            updateStats();
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể kết nối API');
        }
        setIsChecking(false);
    };

    const handleRestartService = async () => {
        await stopService();
        await startService();
        updateStats();
        Alert.alert('Đã khởi động lại', 'Service đã được khởi động lại.');
    };

    const handleOpenBatterySettings = () => {
        Linking.openSettings();
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    const formatTimeSince = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        return `${minutes}m ${seconds % 60}s`;
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#fff" barStyle="dark-content" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backBtn}>{'<'}</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Cài đặt</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                {/* Service Status */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>TRẠNG THÁI DỊCH VỤ</Text>

                    <View style={styles.statusCard}>
                        <View style={styles.statusRow}>
                            <Text style={styles.statusLabel}>Trạng thái:</Text>
                            <View style={[
                                styles.statusBadge,
                                serviceStats?.isActive ? styles.badgeActive : styles.badgeInactive
                            ]}>
                                <Text style={styles.badgeText}>
                                    {serviceStats?.isActive ? '✓ Đang chạy' : '✗ Dừng'}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.statusRow}>
                            <Text style={styles.statusLabel}>Tổng lần kiểm tra:</Text>
                            <Text style={styles.statusValue}>{serviceStats?.checkCount ?? 0}</Text>
                        </View>

                        <View style={styles.statusRow}>
                            <Text style={styles.statusLabel}>Lần kiểm tra cuối:</Text>
                            <Text style={styles.statusValue}>
                                {serviceStats?.lastCheckTime ? formatTime(serviceStats.lastCheckTime) : '--:--:--'}
                            </Text>
                        </View>

                        <View style={styles.statusRow}>
                            <Text style={styles.statusLabel}>Thời gian trước:</Text>
                            <Text style={styles.statusValue}>
                                {serviceStats?.timeSinceLastCheck
                                    ? formatTimeSince(serviceStats.timeSinceLastCheck)
                                    : '--'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[styles.button, styles.primaryButton]}
                            onPress={handleCheckNow}
                            disabled={isChecking}
                        >
                            <Text style={styles.primaryButtonText}>
                                {isChecking ? 'Đang kiểm tra...' : 'Kiểm tra ngay'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.secondaryButton]}
                            onPress={handleRestartService}
                        >
                            <Text style={styles.secondaryButtonText}>Khởi động lại</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Battery Settings */}
                <View style={[styles.section, { marginTop: 16 }]}>
                    <Text style={styles.sectionTitle}>TỐI ƯU PIN</Text>

                    <TouchableOpacity style={styles.row} onPress={handleOpenBatterySettings}>
                        <View style={styles.rowText}>
                            <Text style={styles.rowTitle}>Cài đặt pin</Text>
                            <Text style={styles.rowSubtitle}>
                                Tắt tối ưu pin để service hoạt động ổn định
                            </Text>
                        </View>
                        <Text style={styles.arrow}>{'>'}</Text>
                    </TouchableOpacity>
                </View>

                {/* Notification Settings */}
                <View style={[styles.section, { marginTop: 16 }]}>
                    <Text style={styles.sectionTitle}>THÔNG BÁO</Text>

                    <View style={styles.row}>
                        <View style={styles.rowText}>
                            <Text style={styles.rowTitle}>Báo thức tự động</Text>
                            <Text style={styles.rowSubtitle}>
                                Tự động đặt báo thức cho mỗi nhắc việc mới
                            </Text>
                        </View>
                        <Switch
                            value={settings.alarmEnabled}
                            onValueChange={toggleAlarm}
                            trackColor={{ false: '#D1D5DB', true: '#7C3AED' }}
                            thumbColor="#fff"
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={styles.rowText}>
                            <Text style={styles.rowTitle}>Đọc nội dung</Text>
                            <Text style={styles.rowSubtitle}>
                                Đọc to nội dung nhắc việc khi báo thức kêu
                            </Text>
                        </View>
                        <Switch
                            value={settings.ttsEnabled}
                            onValueChange={toggleTts}
                            trackColor={{ false: '#D1D5DB', true: '#7C3AED' }}
                            thumbColor="#fff"
                        />
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        backgroundColor: '#fff',
        paddingTop: 40,
        paddingBottom: 16,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backBtn: {
        fontSize: 24,
        color: '#374151',
    },
    headerTitle: {
        color: '#111827',
        fontSize: 18,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
        letterSpacing: 0.5,
        padding: 16,
        paddingBottom: 8,
    },
    statusCard: {
        padding: 16,
        paddingTop: 0,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    statusLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    statusValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeActive: {
        backgroundColor: '#D1FAE5',
    },
    badgeInactive: {
        backgroundColor: '#FEE2E2',
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#111827',
    },
    buttonRow: {
        flexDirection: 'row',
        padding: 16,
        paddingTop: 8,
        gap: 10,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    primaryButton: {
        backgroundColor: '#7C3AED',
    },
    primaryButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    secondaryButton: {
        backgroundColor: '#F3F4F6',
    },
    secondaryButtonText: {
        color: '#374151',
        fontWeight: '600',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    rowText: {
        flex: 1,
    },
    rowTitle: {
        fontSize: 15,
        fontWeight: '500',
        color: '#111827',
        marginBottom: 2,
    },
    rowSubtitle: {
        fontSize: 13,
        color: '#6B7280',
    },
    arrow: {
        fontSize: 18,
        color: '#9CA3AF',
    },
});

export default SettingsScreen;
