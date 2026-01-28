/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { registerBackgroundHandler } from './src/services/foregroundService';

// Register foreground service handler before app starts
registerBackgroundHandler();

AppRegistry.registerComponent(appName, () => App);
