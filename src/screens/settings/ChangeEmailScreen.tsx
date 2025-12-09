import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { trackEvent } from '../../services/analytics';

export default function ChangeEmailScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter a new email address.');
      return;
    }

    if (email === user?.email) {
      Alert.alert('Error', 'Please enter a different email address.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ email: email.trim() });

      if (error) throw error;

      trackEvent('email_changed');
      Alert.alert(
        'Verification Email Sent',
        'Please check your new email address and click the verification link to complete the change.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      console.error('Error changing email:', error);
      Alert.alert('Error', error.message || 'Failed to change email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50 p-6">
      <Text className="text-gray-700 font-semibold mb-2">Current Email</Text>
      <View className="bg-gray-200 rounded-xl px-4 py-4 mb-6">
        <Text className="text-gray-500">{user?.email}</Text>
      </View>

      <Text className="text-gray-700 font-semibold mb-2">New Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Enter new email address"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        className="bg-white rounded-xl px-4 py-4 text-base border border-gray-200 mb-8"
      />

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={loading}
        className={`rounded-xl py-4 items-center ${
          loading ? 'bg-gray-400' : 'bg-gray-700'
        }`}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-semibold text-lg">Update Email</Text>
        )}
      </TouchableOpacity>

      <Text className="text-gray-500 text-sm text-center mt-4">
        You will receive a verification email at both your old and new email addresses.
      </Text>
    </View>
  );
}
