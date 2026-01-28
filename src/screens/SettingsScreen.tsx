import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    Switch,
    TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { getSettings, saveSettings, AppSettings } from '../storage/settingsStorage';

type SettingsScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Settings'>;
};

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
    const [settings, setSettings] = useState<AppSettings>({
        alarmEnabled: true,
        ttsEnabled: true,
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        const s = await getSettings();
        setSettings(s);
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
                <View style={styles.section}>
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
});

export default SettingsScreen;
