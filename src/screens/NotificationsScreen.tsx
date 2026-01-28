import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    RefreshControl,
    SectionList,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { ReminderTask } from '../types/reminder';
import { getStoredTasks } from '../services/reminderService';
import { checkForNewReminders } from '../services/pollingService';

type NotificationsScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Notifications'>;
};

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ navigation }) => {
    const [tasks, setTasks] = useState<ReminderTask[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadTasks = async () => {
        const stored = await getStoredTasks();
        stored.sort((a, b) => b.reminderTime.getTime() - a.reminderTime.getTime());
        setTasks(stored);
    };

    useFocusEffect(
        useCallback(() => {
            loadTasks();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await checkForNewReminders();
        await loadTasks();
        setRefreshing(false);
    };

    const formatDate = (date: Date) => {
        return date.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const renderItem = ({ item }: { item: ReminderTask }) => {
        const isOverdue = item.deadline.getTime() < Date.now();
        const now = Date.now();
        const reminderPassed = item.reminderTime.getTime() < now;

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('NotificationDetail', { task: item })}
            >
                {/* Header row with tag */}
                <View style={styles.cardHeader}>
                    {isOverdue && (
                        <View style={styles.tagOverdue}>
                            <Text style={styles.tagOverdueText}>Quá hạn</Text>
                        </View>
                    )}
                    <Text style={styles.dateText}>{formatDate(item.deadline)}</Text>
                    {!isOverdue && !reminderPassed && (
                        <View style={styles.tagPending}>
                            <Text style={styles.tagPendingIcon}>!</Text>
                        </View>
                    )}
                </View>

                {/* Title */}
                <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>

                {/* Reminder time */}
                <View style={styles.reminderRow}>
                    <Text style={styles.reminderIcon}>⏰</Text>
                    <Text style={styles.reminderText}>
                        Giờ nhắc: {item.reminderTime.toLocaleString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#fff" barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Thông báo</Text>
                <View style={styles.headerRight}>
                    {tasks.length > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{tasks.length}</Text>
                        </View>
                    )}
                </View>
            </View>

            <FlatList
                data={tasks}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListHeaderComponent={
                    tasks.length > 0 ? (
                        <Text style={styles.sectionTitle}>HÔM NAY</Text>
                    ) : null
                }
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyText}>Không có thông báo</Text>
                        <Text style={styles.emptySubtext}>Kéo xuống để làm mới</Text>
                    </View>
                }
                ListFooterComponent={
                    tasks.length > 0 ? (
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Bạn đã xem hết thông báo</Text>
                        </View>
                    ) : null
                }
            />
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
    headerTitle: {
        color: '#111827',
        fontSize: 22,
        fontWeight: 'bold',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    badge: {
        backgroundColor: '#EF4444',
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    list: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
        letterSpacing: 0.5,
        marginBottom: 12,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        borderLeftWidth: 4,
        borderLeftColor: '#7C3AED',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    tagOverdue: {
        backgroundColor: '#FEE2E2',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
        marginRight: 8,
    },
    tagOverdueText: {
        color: '#DC2626',
        fontSize: 11,
        fontWeight: '600',
    },
    tagPending: {
        backgroundColor: '#FEF3C7',
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 'auto',
    },
    tagPendingIcon: {
        color: '#D97706',
        fontSize: 12,
        fontWeight: 'bold',
    },
    dateText: {
        fontSize: 13,
        color: '#6B7280',
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 10,
        lineHeight: 22,
    },
    reminderRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    reminderIcon: {
        fontSize: 12,
        marginRight: 6,
    },
    reminderText: {
        fontSize: 12,
        color: '#6B7280',
    },
    empty: {
        alignItems: 'center',
        paddingTop: 80,
    },
    emptyText: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 6,
    },
    emptySubtext: {
        fontSize: 13,
        color: '#9CA3AF',
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    footerText: {
        fontSize: 13,
        color: '#9CA3AF',
    },
});

export default NotificationsScreen;
