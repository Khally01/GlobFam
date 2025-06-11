import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as ReduxProvider } from 'react-redux';
import { Provider as PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from './src/store';
import RootNavigator from './src/navigation/RootNavigator';

// Custom theme configuration
const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2196F3',
    secondary: '#4CAF50',
    tertiary: '#FF9800',
    error: '#F44336',
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#2196F3',
    secondary: '#4CAF50',
    tertiary: '#FF9800',
    error: '#F44336',
  },
};

export default function App() {
  // You can implement theme switching logic here
  const isDarkMode = false; // This can be connected to device settings or user preference

  return (
    <SafeAreaProvider>
      <ReduxProvider store={store}>
        <PaperProvider theme={isDarkMode ? darkTheme : lightTheme}>
          <StatusBar style={isDarkMode ? 'light' : 'dark'} />
          <RootNavigator />
        </PaperProvider>
      </ReduxProvider>
    </SafeAreaProvider>
  );
}
