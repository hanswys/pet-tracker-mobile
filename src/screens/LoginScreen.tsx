import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { trackEvent } from '../services/analytics';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      trackEvent('user_signed_in', { method: 'email' });
    } catch (error: any) {
      Alert.alert('Sign In Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password);
      trackEvent('user_signed_up', { method: 'email' });
      Alert.alert('Success', 'Please check your email to verify your account');
    } catch (error: any) {
      Alert.alert('Sign Up Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white items-center justify-center px-6">
      <Text className="text-3xl font-bold text-gray-900 mb-2">Pet Care & Tracking</Text>
      <Text className="text-gray-600 mb-8">Sign in to continue</Text>

      <View className="w-full max-w-sm">
        <TextInput
          className="w-full bg-gray-100 rounded-lg px-4 py-3 mb-4 text-base"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        <TextInput
          className="w-full bg-gray-100 rounded-lg px-4 py-3 mb-6 text-base"
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="password"
        />

        <TouchableOpacity
          className="w-full bg-blue-600 rounded-lg py-3 mb-4 items-center"
          onPress={handleSignIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">Sign In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className="w-full bg-gray-200 rounded-lg py-3 items-center"
          onPress={handleSignUp}
          disabled={loading}
        >
          <Text className="text-gray-800 font-semibold text-base">Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

