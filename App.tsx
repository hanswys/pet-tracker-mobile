import 'react-native-get-random-values';
import 'react-native-gesture-handler';
import './global.css';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { SubscriptionProvider } from './src/contexts/SubscriptionContext';
import { PetProvider } from './src/contexts/PetContext';
import LoginScreen from './src/screens/LoginScreen';
import AppNavigator, { OnboardingStackNavigator } from './src/navigation/AppNavigator';
import { initErrorTracking } from './src/services/error-tracking';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';

// Initialize error tracking
initErrorTracking();

function AppContent() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  // If no session, show Onboarding Flow (which includes Login)
  // If session exists, AppNavigator (Main Tabs) handles the NavigationContainer internally?
  // Wait, AppNavigator exports NavigationContainer wrapping MainTabNavigator.
  // We should probably pull NavigationContainer OUT to here so we can switch stacks.
  
  if (!session) {
    return (
        <NavigationContainer>
            <OnboardingStackNavigator />
        </NavigationContainer>
    );
  }

  // AppNavigator already has NavigationContainer, so just return it
  return <AppNavigator />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <SubscriptionProvider>
            <PetProvider>
              <AppContent />
            </PetProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

