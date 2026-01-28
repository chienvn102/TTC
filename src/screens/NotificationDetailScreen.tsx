import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    ScrollView,
    Alert,
    ImageBackground,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { scheduleAlarm } from '../services/notificationService';

type NotificationDetailScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'NotificationDetail'>;
    route: RouteProp<RootStackParamList, 'NotificationDetail'>;
};

const NotificationDetailScreen: React.FC<NotificationDetailScreenProps> = ({
    navigation,
    route,
}) => {
    const { task } = route.params;
    const isOverdue = task.deadline.getTime() < Date.now();

    const formatDate = (date: Date) => {
        return date.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleOpenWeb = () => {
        if (task.nodeUrl) {
            navigation.navigate('WebView', { url: task.nodeUrl, title: task.title });
        }
    };

    const handleSetReminder = async () => {
        await scheduleAlarm(task);
        Alert.alert('Thành công', 'Đã đặt nhắc nhở!');
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#2D1B4E" barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.backBtnText}>{'<'}</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chi tiết Thông báo</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content}>
                {/* Hero section */}
                <View style={styles.hero}>
                    <View style={styles.heroGradient}>
                        {isOverdue && (
                            <View style={styles.overdueTag}>
                                <Text style={styles.overdueTagText}>QUÁ HẠN</Text>
                            </View>
                        )}
                        <Text style={styles.heroTitle}>{task.title}</Text>
                        <Text style={styles.heroDate}>Hạn chót: {formatDate(new Date(task.deadline))}</Text>
                    </View>
                </View>

                {/* Info cards */}
                <View style={styles.infoSection}>
                    <View style={styles.infoCard}>
                        <View style={styles.infoIcon}>
                            <Text style={styles.infoIconText}>📅</Text>
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>HẠN CHÓT</Text>
                            <Text style={styles.infoValue}>{formatDate(new Date(task.deadline))}</Text>
                        </View>
                    </View>

                    <View style={styles.infoCard}>
                        <View style={styles.infoIcon}>
                            <Text style={styles.infoIconText}>⏰</Text>
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>NHẮC NHỞ</Text>
                            <Text style={styles.infoValue}>{formatDate(new Date(task.reminderTime))}</Text>
                        </View>
                    </View>

                    {task.nodeUrl && (
                        <View style={styles.infoCard}>
                            <View style={styles.infoIcon}>
                                <Text style={styles.infoIconText}>🔗</Text>
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>NGUỒN</Text>
                                <Text style={styles.infoValueLink} numberOfLines={1}>{task.nodeUrl}</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Buttons */}
                <View style={styles.actions}>
                    {task.nodeUrl && (
                        <TouchableOpacity style={styles.btnPrimary} onPress={handleOpenWeb}>
                            <Text style={styles.btnPrimaryText}>Mở trang web</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity style={styles.btnSecondary} onPress={handleSetReminder}>
                        <Text style={styles.btnSecondaryText}>Đặt nhắc nhở</Text>
                    </TouchableOpacity>
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
        paddingVertical: 14,
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backBtnText: {
        color: '#374151',
        fontSize: 18,
        fontWeight: '500',
    },
    headerTitle: {
        color: '#111827',
        fontSize: 17,
        fontWeight: '600',
    },
    content: {
        flex: 1,
    },
    hero: {
        height: 180,
        backgroundColor: '#2D1B4E',
    },
    heroGradient: {
        flex: 1,
        padding: 20,
        justifyContent: 'flex-end',
    },
    overdueTag: {
        backgroundColor: '#EF4444',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 4,
        marginBottom: 12,
    },
    overdueTagText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '700',
    },
    heroTitle: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    heroDate: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
    },
    infoSection: {
        padding: 16,
    },
    infoCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    infoIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    infoIconText: {
        fontSize: 18,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#6B7280',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 15,
        color: '#111827',
        fontWeight: '500',
    },
    infoValueLink: {
        fontSize: 14,
        color: '#7C3AED',
    },
    actions: {
        padding: 16,
        gap: 12,
    },
    btnPrimary: {
        backgroundColor: '#2D1B4E',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    btnPrimaryText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    btnSecondary: {
        backgroundColor: '#fff',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#7C3AED',
    },
    btnSecondaryText: {
        color: '#7C3AED',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default NotificationDetailScreen;
