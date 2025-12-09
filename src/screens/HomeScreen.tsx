import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { trackEvent } from '../services/analytics';

export default function HomeScreen() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      trackEvent('user_signed_out');
    } catch (error: any) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <View className="flex-1 bg-white items-center justify-center px-6">
      <Text className="text-3xl font-bold text-gray-900 mb-4">Welcome!</Text>
      <Text className="text-gray-600 mb-8">
        {user?.email ? `Logged in as ${user.email}` : 'Welcome to Pet Care & Tracking'}
      </Text>

      <TouchableOpacity
        className="bg-red-600 rounded-lg px-6 py-3"
        onPress={handleSignOut}
      >
        <Text className="text-white font-semibold text-base">Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

