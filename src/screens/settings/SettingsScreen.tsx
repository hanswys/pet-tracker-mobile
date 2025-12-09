import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { SettingsStackParamList } from '../../navigation/types';
import { trackEvent } from '../../services/analytics';

type NavigationProp = NativeStackNavigationProp<SettingsStackParamList, 'SettingsMain'>;

const SettingsRow = ({
  icon,
  title,
  subtitle,
  onPress,
  showChevron = true,
  danger = false,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showChevron?: boolean;
  danger?: boolean;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-row items-center py-4 px-4 bg-white border-b border-gray-100"
  >
    <Text style={{ fontSize: 24 }} className="mr-4">
      {icon}
    </Text>
    <View className="flex-1">
      <Text className={`font-medium ${danger ? 'text-red-600' : 'text-gray-900'}`}>
        {title}
      </Text>
      {subtitle && <Text className="text-gray-500 text-sm">{subtitle}</Text>}
    </View>
    {showChevron && <Text className="text-gray-300 text-xl">›</Text>}
  </TouchableOpacity>
);

export default function SettingsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, signOut } = useAuth();
  const { isPro } = useSubscription();

  const handleChangeEmail = () => {
    navigation.navigate('ChangeEmail');
  };

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  const handlePremium = () => {
    navigation.navigate('Premium');
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              trackEvent('user_signed_out');
            } catch (error) {
              console.error('Sign out error:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* User Info Header */}
      <View className="bg-gray-600 px-6 py-6">
        <Text className="text-white text-lg font-semibold">{user?.email}</Text>
        {isPro ? (
          <View className="flex-row items-center mt-2">
            <Text className="text-yellow-400 mr-1">⭐</Text>
            <Text className="text-yellow-400 font-medium">Pro Member</Text>
          </View>
        ) : (
          <Text className="text-gray-300 text-sm mt-1">Free Plan</Text>
        )}
      </View>

      {/* Premium Section */}
      {!isPro && (
        <View className="mx-4 mt-4">
          <TouchableOpacity
            onPress={handlePremium}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-4"
            style={{ backgroundColor: '#6366F1' }}
          >
            <View className="flex-row items-center">
              <Text style={{ fontSize: 32 }}>✨</Text>
              <View className="flex-1 ml-3">
                <Text className="text-white font-bold text-lg">Upgrade to Pro</Text>
                <Text className="text-indigo-200 text-sm">Unlimited pets & more!</Text>
              </View>
              <Text className="text-white text-xl">›</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Account Section */}
      <View className="mt-6">
        <Text className="px-4 pb-2 text-gray-500 font-semibold text-sm">ACCOUNT</Text>
        <View className="bg-white rounded-xl mx-4 overflow-hidden">
          <SettingsRow
            icon="📧"
            title="Change Email"
            subtitle={user?.email}
            onPress={handleChangeEmail}
          />
          <SettingsRow
            icon="🔒"
            title="Change Password"
            subtitle="Update your password"
            onPress={handleChangePassword}
          />
        </View>
      </View>

      {/* Subscription Section */}
      <View className="mt-6">
        <Text className="px-4 pb-2 text-gray-500 font-semibold text-sm">SUBSCRIPTION</Text>
        <View className="bg-white rounded-xl mx-4 overflow-hidden">
          <SettingsRow
            icon="💎"
            title="Premium Features"
            subtitle={isPro ? 'Manage your subscription' : 'See what\'s included'}
            onPress={handlePremium}
          />
        </View>
      </View>

      {/* Sign Out Section */}
      <View className="mt-6 mb-8">
        <View className="bg-white rounded-xl mx-4 overflow-hidden">
          <SettingsRow
            icon="🚪"
            title="Sign Out"
            onPress={handleSignOut}
            showChevron={false}
            danger
          />
        </View>
      </View>

      {/* App Version */}
      <View className="items-center pb-8">
        <Text className="text-gray-400 text-sm">Pet Tracker v1.0.0</Text>
      </View>
    </ScrollView>
  );
}
