import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AppItem } from '../types';

interface AppListItemProps {
    item: AppItem;
    index: number;
    onPress: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

const AppListItem: React.FC<AppListItemProps> = ({
    item,
    index,
    onPress,
    onEdit,
    onDelete,
}) => {
    // Truncate URL for display
    const displayUrl = item.url.replace(/^https?:\/\//, '').substring(0, 20) +
        (item.url.length > 30 ? '...' : '');

    return (
        <View style={styles.container}>
            <Text style={styles.index}>{index + 1}</Text>

            <TouchableOpacity style={styles.nameContainer} onPress={onPress}>
                <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkContainer} onPress={onPress}>
                <Text style={styles.link} numberOfLines={1}>{displayUrl}</Text>
            </TouchableOpacity>

            <View style={styles.actions}>
                <TouchableOpacity style={styles.editButton} onPress={onEdit}>
                    <Text style={styles.buttonText}>Sửa</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
                    <Text style={styles.buttonText}>Xóa</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#fff',
    },
    index: {
        width: 30,
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    nameContainer: {
        flex: 1.5,
        paddingHorizontal: 8,
    },
    name: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    linkContainer: {
        flex: 1.5,
        paddingHorizontal: 8,
    },
    link: {
        fontSize: 13,
        color: '#2B5C7E',
        textDecorationLine: 'underline',
    },
    actions: {
        flexDirection: 'row',
        gap: 6,
    },
    editButton: {
        backgroundColor: '#F5A623',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 4,
    },
    deleteButton: {
        backgroundColor: '#F5A623',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 4,
    },
    buttonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
});

export default AppListItem;
