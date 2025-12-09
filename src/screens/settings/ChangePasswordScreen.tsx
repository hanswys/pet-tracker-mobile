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
import { trackEvent } from '../../services/analytics';

export default function ChangePasswordScreen() {
  const navigation = useNavigation();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!newPassword.trim()) {
      Alert.alert('Error', 'Please enter a new password.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) throw error;

      trackEvent('password_changed');
      Alert.alert(
        'Password Updated',
        'Your password has been successfully changed.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      console.error('Error changing password:', error);
      Alert.alert('Error', error.message || 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50 p-6">
      <Text className="text-gray-700 font-semibold mb-2">New Password</Text>
      <TextInput
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="Enter new password"
        secureTextEntry
        autoCapitalize="none"
        className="bg-white rounded-xl px-4 py-4 text-base border border-gray-200 mb-6"
      />

      <Text className="text-gray-700 font-semibold mb-2">Confirm Password</Text>
      <TextInput
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Confirm new password"
        secureTextEntry
        autoCapitalize="none"
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
          <Text className="text-white font-semibold text-lg">Update Password</Text>
        )}
      </TouchableOpacity>

      <Text className="text-gray-500 text-sm text-center mt-4">
        Password must be at least 6 characters long.
      </Text>
    </View>
  );
}
