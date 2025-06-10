#!/bin/bash

# GlobFam iOS Project Setup Script

echo "🚀 Setting up GlobFam iOS project..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Create React Native project with Expo
echo "📱 Creating React Native project..."
npx create-expo-app globfam-mobile --template blank-typescript

cd globfam-mobile

# Install dependencies
echo "📦 Installing dependencies..."
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
npm install react-native-paper react-native-vector-icons
npm install @reduxjs/toolkit react-redux
npm install react-native-chart-kit react-native-svg
npm install firebase
npm install react-native-dotenv

# Create project structure
echo "🏗️ Creating project structure..."
mkdir -p src/{screens,components,services,store/slices,utils,types}

# Create basic TypeScript config
cat > tsconfig.json << 'EOF'
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
EOF

# Create basic App.tsx
cat > App.tsx << 'EOF'
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from './src/store/store';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <ReduxProvider store={store}>
      <PaperProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </PaperProvider>
    </ReduxProvider>
  );
}
EOF

# Create store setup
cat > src/store/store.ts << 'EOF'
import { configureStore } from '@reduxjs/toolkit';

export const store = configureStore({
  reducer: {
    // Add your reducers here
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
EOF

# Create basic navigation
cat > src/navigation/AppNavigator.tsx << 'EOF'
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { DashboardScreen } from '../screens/DashboardScreen';

const Stack = createStackNavigator();

export const AppNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ title: 'GlobFam' }}
      />
    </Stack.Navigator>
  );
};
EOF

# Create basic Dashboard screen
cat > src/screens/DashboardScreen.tsx << 'EOF'
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';

export const DashboardScreen = () => {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Welcome to GlobFam</Title>
          <Paragraph>Your multi-currency family finance dashboard</Paragraph>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    marginBottom: 16,
  },
});
EOF

echo "✅ Project setup complete!"
echo ""
echo "Next steps:"
echo "1. cd globfam-mobile"
echo "2. npm start"
echo "3. Press 'i' to open iOS simulator"
echo ""
echo "Happy coding! 🎉"