import React, { useEffect } from 'react';
import { StyleSheet, AppState, AppStateStatus } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList } from './src/types';
import HomeScreen from './src/screens/HomeScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import NotificationDetailScreen from './src/screens/NotificationDetailScreen';
import WebViewScreen from './src/screens/WebViewScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { initializeDefaultApps } from './src/storage/appStorage';
import { startForegroundService, stopForegroundService } from './src/services/foregroundService';
import { startBackgroundPolling } from './src/services/backgroundFetchService';
import { initializeNotifications, requestPermissions } from './src/services/notificationService';
import notifee, { EventType } from '@notifee/react-native';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#7C3AED',
        tabBarInactiveTintColor: '#6B7280',
        tabBarLabelStyle: styles.tabLabel,
        tabBarIconStyle: { display: 'none' },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Trang chủ' }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ tabBarLabel: 'Thông báo' }}
      />
    </Tab.Navigator>
  );
}

function App(): React.JSX.Element {
  useEffect(() => {
    const init = async () => {
      await initializeDefaultApps();
      await initializeNotifications();
      await requestPermissions();
      await startForegroundService();
      await startBackgroundPolling();
    };
    init();

    // Handle app state changes
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App came to foreground - service should already be running
      }
    });

    // Handle foreground notification events
    const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
      const { notification, pressAction } = detail;

      if (type === EventType.ACTION_PRESS) {
        if (pressAction?.id === 'dismiss') {
          // Cancel the notification
          if (notification?.id) {
            notifee.cancelNotification(notification.id);
          }
        }
      }
    });

    return () => {
      subscription.remove();
      unsubscribe();
    };
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="WebView" component={WebViewScreen} />
        <Stack.Screen name="NotificationDetail" component={NotificationDetailScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 60,
    paddingBottom: 10,
    paddingTop: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default App;
