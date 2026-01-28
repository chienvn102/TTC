import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList, AppItem } from '../types';
import { getApps, addApp, updateApp, deleteApp, DEFAULT_APP } from '../storage/appStorage';
import AddAppModal from '../components/AddAppModal';

type HomeScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
    // Initialize with default app so it shows immediately
    const [apps, setApps] = useState<AppItem[]>([DEFAULT_APP]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingApp, setEditingApp] = useState<AppItem | null>(null);

    const loadApps = async () => {
        const loadedApps = await getApps();
        // If storage is empty, fallback to default app to avoid empty screen
        if (loadedApps.length === 0) {
            setApps([DEFAULT_APP]);
        } else {
            setApps(loadedApps);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadApps();
        }, [])
    );

    const handleAddApp = async (name: string, url: string) => {
        if (editingApp) {
            await updateApp(editingApp.id, name, url);
        } else {
            await addApp(name, url);
        }
        setModalVisible(false);
        setEditingApp(null);
        loadApps();
    };

    const handleEdit = (app: AppItem) => {
        setEditingApp(app);
        setModalVisible(true);
    };

    const handleDelete = (app: AppItem) => {
        Alert.alert('Xóa', `Xóa "${app.name}"?`, [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa',
                style: 'destructive',
                onPress: async () => {
                    await deleteApp(app.id);
                    loadApps();
                },
            },
        ]);
    };

    const handleOpenApp = (app: AppItem) => {
        navigation.navigate('WebView', { url: app.url, title: app.name });
    };

    const renderCard = ({ item }: { item: AppItem }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => handleOpenApp(item)}
            onLongPress={() => handleEdit(item)}
        >
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.cardUrl} numberOfLines={1}>
                    {item.url.replace(/^https?:\/\//, '')}
                </Text>
            </View>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
                <Text style={styles.deleteBtnText}>X</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#fff" barStyle="dark-content" />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Trung tâm CNTT</Text>
                <View style={styles.headerRight}>
                    <TouchableOpacity
                        style={styles.settingsBtn}
                        onPress={() => navigation.navigate('Settings' as never)}
                    >
                        <Text style={styles.settingsBtnText}>⚙</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.addBtn}
                        onPress={() => {
                            setEditingApp(null);
                            setModalVisible(true);
                        }}
                    >
                        <Text style={styles.addBtnText}>+</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>WEBSITES ĐÃ LƯU</Text>
                <Text style={styles.sectionCount}>{apps.length} trang</Text>
            </View>

            <FlatList
                data={apps}
                renderItem={renderCard}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyText}>Chưa có website</Text>
                        <Text style={styles.emptySubtext}>Nhấn + để thêm</Text>
                    </View>
                }
            />

            <AddAppModal
                visible={modalVisible}
                onClose={() => {
                    setModalVisible(false);
                    setEditingApp(null);
                }}
                onSave={handleAddApp}
                editMode={!!editingApp}
                initialName={editingApp?.name || ''}
                initialUrl={editingApp?.url || ''}
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
        gap: 8,
    },
    settingsBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingsBtnText: {
        fontSize: 18,
    },
    addBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#7C3AED',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addBtnText: {
        color: '#fff',
        fontSize: 26,
        fontWeight: '300',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
        letterSpacing: 0.5,
    },
    sectionCount: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    list: {
        paddingHorizontal: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 18,
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    cardUrl: {
        fontSize: 14,
        color: '#6B7280',
    },
    deleteBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteBtnText: {
        color: '#9CA3AF',
        fontSize: 12,
        fontWeight: 'bold',
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
});

export default HomeScreen;
