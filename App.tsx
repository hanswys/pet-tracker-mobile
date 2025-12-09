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
import AppNavigator from './src/navigation/AppNavigator';
import { initErrorTracking } from './src/services/error-tracking';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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

  if (!session) {
    return (
      <>
        <StatusBar style="auto" />
        <LoginScreen />
      </>
    );
  }

  return (
    <SubscriptionProvider>
      <PetProvider>
        <StatusBar style="auto" />
        <AppNavigator />
      </PetProvider>
    </SubscriptionProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

