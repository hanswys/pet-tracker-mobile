import React from 'react';
import { View, Text, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/types';
import { PawPrint } from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<OnboardingStackParamList, 'Welcome'>;

export default function WelcomeScreen() {
  const navigation = useNavigation<NavigationProp>();

  const handleStart = () => {
    navigation.navigate('QuizIdentity');
  };

  const handleLogin = () => {
    // Navigate to Login screen (outside of onboarding stack)
    // We'll handle this in the navigator structure
    // For now assuming we have a way to get there, or we can replace the current stack
    // But since Onboarding is conditional, maybe we just set a global state? 
    // Actually, let's just use the parent navigator if possible or a reset.
    // For MVP, assuming "Login" is just for existing users, we can navigate to a "Auth" stack or screen.
    // Let's assume we can navigate to 'Login' if it's registered in the parent/root navigator.
    (navigation as any).navigate('Login');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-8 justify-center items-center">
        {/* Hero Icon/Image */}
        <View className="mb-10 bg-indigo-50 p-6 rounded-full">
            <PawPrint size={64} color="#6366F1" />
        </View>

        {/* Headline */}
        <Text className="text-3xl font-bold text-center text-gray-900 mb-4">
          Does your pet have a perfect daily routine?
        </Text>

        {/* Subheader */}
        <Text className="text-lg text-center text-gray-500 mb-12 leading-relaxed">
            Stop guessing on vaccines, weight, and walks. Build their perfect health plan in 60 seconds.
        </Text>

        {/* Primary Action */}
        <TouchableOpacity
          onPress={handleStart}
          className="w-full bg-indigo-600 py-4 rounded-xl items-center shadow-lg shadow-indigo-200"
        >
          <Text className="text-white text-lg font-bold">Start Health Audit</Text>
        </TouchableOpacity>

         {/* Login Link */}
         <TouchableOpacity onPress={handleLogin} className="mt-6">
            <Text className="text-indigo-600 font-medium">I already have an account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
