import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    Switch,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { getSettings, saveSettings, AppSettings } from '../storage/settingsStorage';
import { 
    getServiceStats, 
    isServiceRunning,
    startService,
    stopService 
} from '../services/robustPollingService';
import notifee from '@notifee/react-native';

type SettingsScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Settings'>;
};

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
    const [settings, setSettings] = useState<AppSettings>({
        alarmEnabled: true,
        ttsEnabled: true,
    });
    const [serviceActive, setServiceActive] = useState(false);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        loadSettings();
        updateServiceStatus();
        
        // Update stats every second
        const interval = setInterval(updateServiceStatus, 1000);
        return () => clearInterval(interval);
    }, []);

    const loadSettings = async () => {
        const s = await getSettings();
        setSettings(s);
    };

    const updateServiceStatus = () => {
        setServiceActive(isServiceRunning());
        setStats(getServiceStats());
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

    const handleRequestBatteryOptimization = async () => {
        try {
            const batteryOptimizationEnabled = await notifee.isBatteryOptimizationEnabled();
            if (batteryOptimizationEnabled) {
                Alert.alert(
                    'Tối ưu hoá pin',
                    'Để service hoạt động ổn định 24/7, vui lòng tắt tối ưu hoá pin cho app này.',
                    [
                        { text: 'Để sau', style: 'cancel' },
                        {
                            text: 'Mở cài đặt',
                            onPress: () => notifee.openBatteryOptimizationSettings()
                        },
                    ]
                );
            } else {
                Alert.alert('Thông báo', 'Tối ưu hoá pin đã được tắt ✓');
            }
        } catch (error) {
            console.error('Error checking battery optimization:', error);
        }
    };

    const handleRestartService = async () => {
        Alert.alert(
            'Khởi động lại service',
            'Bạn có chắc muốn khởi động lại service không?',
            [
                { text: 'Huỷ', style: 'cancel' },
                {
                    text: 'Khởi động lại',
                    onPress: async () => {
                        await stopService();
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        await startService();
                        updateServiceStatus();
                        Alert.alert('Thành công', 'Service đã được khởi động lại');
                    }
                },
            ]
        );
    };

    const formatTimeSince = (ms: number) => {
        if (!ms) return 'N/A';
        const seconds = Math.floor(ms / 1000);
        if (seconds < 60) return `${seconds}s trước`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m trước`;
        const hours = Math.floor(minutes / 60);
        return `${hours}h ${minutes % 60}m trước`;
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

            <ScrollView style={styles.content}>
                {/* Service Status */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>TRẠNG THÁI DỊCH VỤ</Text>

                    <View style={styles.statusCard}>
                        <View style={styles.statusRow}>
                            <Text style={styles.statusLabel}>Trạng thái:</Text>
                            <View style={[styles.statusBadge, serviceActive && styles.statusBadgeActive]}>
                                <View style={[styles.statusDot, serviceActive && styles.statusDotActive]} />
                                <Text style={[styles.statusText, serviceActive && styles.statusTextActive]}>
                                    {serviceActive ? 'Đang chạy' : 'Đã dừng'}
                                </Text>
                            </View>
                        </View>

                        {serviceActive && stats && (
                            <>
                                <View style={styles.statusRow}>
                                    <Text style={styles.statusLabel}>Số lần kiểm tra:</Text>
                                    <Text style={styles.statusValue}>{stats.checkCount}</Text>
                                </View>
                                <View style={styles.statusRow}>
                                    <Text style={styles.statusLabel}>Lần cuối:</Text>
                                    <Text style={styles.statusValue}>
                                        {formatTimeSince(stats.timeSinceLastCheck)}
                                    </Text>
                                </View>
                            </>
                        )}

                        <TouchableOpacity 
                            style={styles.restartBtn}
                            onPress={handleRestartService}
                        >
                            <Text style={styles.restartBtnText}>🔄 Khởi động lại service</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* System Settings */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>CÀI ĐẶT HỆ THỐNG</Text>

                    <TouchableOpacity 
                        style={styles.systemRow}
                        onPress={handleRequestBatteryOptimization}
                    >
                        <View style={styles.systemContent}>
                            <Text style={styles.systemTitle}>Tối ưu hoá pin</Text>
                            <Text style={styles.systemSubtitle}>
                                Tắt để service hoạt động 24/7
                            </Text>
                        </View>
                        <Text style={styles.systemArrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.systemRow}
                        onPress={() => notifee.openAlarmPermissionSettings()}
                    >
                        <View style={styles.systemContent}>
                            <Text style={styles.systemTitle}>Báo thức & Nhắc nhở</Text>
                            <Text style={styles.systemSubtitle}>
                                Cần cho Android 12+
                            </Text>
                        </View>
                        <Text style={styles.systemArrow}>›</Text>
                    </TouchableOpacity>
                </View>

                {/* App Settings */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>CÀI ĐẶT ỨNG DỤNG</Text>

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

                {/* Info */}
                <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>💡 Mẹo</Text>
                    <Text style={styles.infoText}>
                        • Để service chạy ổn định nhất, hãy tắt "Tối ưu hoá pin"{'\n'}
                        • Nếu service bị dừng, hãy kiểm tra cài đặt pin của điện thoại{'\n'}
                        • Một số hãng (Xiaomi, Oppo) cần thêm quyền "Autostart"
                    </Text>
                </View>
            </ScrollView>
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
    },
    section: {
        marginTop: 24,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    statusCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
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
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: '#FEE2E2',
    },
    statusBadgeActive: {
        backgroundColor: '#D1FAE5',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#DC2626',
        marginRight: 6,
    },
    statusDotActive: {
        backgroundColor: '#10B981',
    },
    statusText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#DC2626',
    },
    statusTextActive: {
        color: '#059669',
    },
    restartBtn: {
        marginTop: 4,
        paddingVertical: 12,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        alignItems: 'center',
    },
    restartBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    systemRow: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    systemContent: {
        flex: 1,
    },
    systemTitle: {
        fontSize: 15,
        fontWeight: '500',
        color: '#111827',
        marginBottom: 2,
    },
    systemSubtitle: {
        fontSize: 13,
        color: '#6B7280',
    },
    systemArrow: {
        fontSize: 24,
        color: '#9CA3AF',
    },
    row: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
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
    infoBox: {
        margin: 16,
        padding: 16,
        backgroundColor: '#EEF2FF',
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#7C3AED',
    },
    infoTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 13,
        color: '#6B7280',
        lineHeight: 20,
    },
});

export default SettingsScreen;
