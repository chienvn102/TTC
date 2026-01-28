import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';

type WebViewScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'WebView'>;
    route: RouteProp<RootStackParamList, 'WebView'>;
};

const WebViewScreen: React.FC<WebViewScreenProps> = ({ navigation, route }) => {
    const { url, title } = route.params;
    const [loading, setLoading] = useState(true);
    const webViewRef = useRef<WebView>(null);

    // Javascript to force viewport scaling
    const INJECTED_JAVASCRIPT = `
        const meta = document.createElement('meta'); 
        meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=yes'); 
        meta.setAttribute('name', 'viewport'); 
        document.getElementsByTagName('head')[0].appendChild(meta);
        true;
    `;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#fff" barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backBtnText}>{'<'}</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>
                    {title || 'Đang tải...'}
                </Text>
                <TouchableOpacity onPress={() => webViewRef.current?.reload()} style={styles.refreshBtn}>
                    <Text style={styles.refreshBtnText}>↻</Text>
                </TouchableOpacity>
            </View>

            {/* WebView */}
            <View style={styles.webViewContainer}>
                <WebView
                    ref={webViewRef}
                    source={{ uri: url }}
                    style={styles.webview}
                    onLoadStart={() => setLoading(true)}
                    onLoadEnd={() => setLoading(false)}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    startInLoadingState={true}
                    scalesPageToFit={true}
                    mixedContentMode="compatibility"
                    injectedJavaScript={INJECTED_JAVASCRIPT}
                    renderLoading={() => (
                        <View style={styles.loading}>
                            <ActivityIndicator size="large" color="#7C3AED" />
                            <Text style={styles.loadingText}>Đang tải trang...</Text>
                        </View>
                    )}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 40, // Status bar padding
        paddingBottom: 12,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        zIndex: 1,
    },
    backBtn: {
        padding: 8,
    },
    backBtnText: {
        fontSize: 24,
        color: '#374151',
        fontWeight: 'bold',
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginHorizontal: 16,
    },
    refreshBtn: {
        padding: 8,
    },
    refreshBtnText: {
        fontSize: 24,
        color: '#374151',
        fontWeight: 'bold',
    },
    webViewContainer: {
        flex: 1,
        overflow: 'hidden',
    },
    webview: {
        flex: 1,
    },
    loading: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#6B7280',
    },
});

export default WebViewScreen;
