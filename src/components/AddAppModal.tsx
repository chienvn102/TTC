import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    TextInput,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';

interface AddAppModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (name: string, url: string) => void;
    editMode?: boolean;
    initialName?: string;
    initialUrl?: string;
}

const AddAppModal: React.FC<AddAppModalProps> = ({
    visible,
    onClose,
    onSave,
    editMode = false,
    initialName = '',
    initialUrl = '',
}) => {
    const [name, setName] = useState(initialName);
    const [url, setUrl] = useState(initialUrl);

    useEffect(() => {
        setName(initialName);
        setUrl(initialUrl);
    }, [initialName, initialUrl, visible]);

    const handleSave = () => {
        if (!name.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập tên website');
            return;
        }
        if (!url.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập URL');
            return;
        }
        onSave(name.trim(), url.trim());
        setName('');
        setUrl('');
    };

    const handleClose = () => {
        setName('');
        setUrl('');
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <KeyboardAvoidingView
                style={styles.overlay}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.backdrop} />
                <View style={styles.modalContainer}>
                    <View style={styles.handle} />

                    <Text style={styles.title}>Thêm Website Mới</Text>
                    <Text style={styles.subtitle}>Lưu lại trang web quan trọng để truy cập nhanh</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Tên website</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="Nhập tên hiển thị..."
                                value={name}
                                onChangeText={setName}
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>URL</Text>
                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputIcon}>🔗</Text>
                            <TextInput
                                style={[styles.input, { paddingLeft: 36 }]}
                                placeholder="https://example.com"
                                value={url}
                                onChangeText={setUrl}
                                autoCapitalize="none"
                                keyboardType="url"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>
                    </View>

                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                            <Text style={styles.cancelButtonText}>Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                            <Text style={styles.saveButtonText}>Lưu</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 36,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    inputWrapper: {
        position: 'relative',
    },
    inputIcon: {
        position: 'absolute',
        left: 12,
        top: 14,
        fontSize: 14,
        zIndex: 1,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
        color: '#111827',
        backgroundColor: '#F9FAFB',
    },
    buttonRow: {
        flexDirection: 'row',
        marginTop: 8,
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#374151',
        fontSize: 16,
        fontWeight: '600',
    },
    saveButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#7C3AED',
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default AddAppModal;
