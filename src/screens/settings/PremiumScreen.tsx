import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { purchasePackage, restorePurchases } from '../../services/payments';
import { trackEvent } from '../../services/analytics';

const FeatureItem = ({ text }: { text: string }) => (
  <View className="flex-row items-center mb-3">
    <Text className="text-green-500 mr-3">✓</Text>
    <Text className="text-gray-700">{text}</Text>
  </View>
);

export default function PremiumScreen() {
  const { isPro, offering, refreshSubscription } = useSubscription();
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const proPackage = offering?.availablePackages?.[0];
  const priceString = proPackage?.product?.priceString || '$4.99/mo';

  const handlePurchase = async () => {
    if (!proPackage) {
      Alert.alert('Error', 'No subscription package available.');
      return;
    }

    setPurchasing(true);

    try {
      await purchasePackage(proPackage);
      trackEvent('subscription_purchased');
      await refreshSubscription();
      Alert.alert('Welcome to Pro! 🎉', 'You now have access to all premium features.');
    } catch (error: any) {
      if (!error.userCancelled) {
        console.error('Purchase error:', error);
        Alert.alert('Purchase Failed', error.message || 'Please try again.');
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);

    try {
      await restorePurchases();
      await refreshSubscription();
      trackEvent('purchases_restored');
      Alert.alert('Purchases Restored', 'Your purchases have been restored.');
    } catch (error: any) {
      console.error('Restore error:', error);
      Alert.alert('Restore Failed', error.message || 'Please try again.');
    } finally {
      setRestoring(false);
    }
  };

  if (isPro) {
    return (
      <ScrollView className="flex-1 bg-gray-50">
        <View className="items-center py-12 px-6">
          <Text style={{ fontSize: 64 }}>⭐</Text>
          <Text className="text-2xl font-bold text-gray-900 mt-4">You're a Pro!</Text>
          <Text className="text-gray-500 text-center mt-2">
            Thank you for supporting Pet Tracker. You have access to all premium features.
          </Text>
        </View>

        <View className="mx-6 bg-white rounded-xl p-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">Your Benefits</Text>
          <FeatureItem text="Unlimited pet profiles" />
          <FeatureItem text="Priority support" />
          <FeatureItem text="Early access to new features" />
          <FeatureItem text="Ad-free experience" />
        </View>

        <View className="px-6 mt-6">
          <Text className="text-gray-400 text-center text-sm">
            Manage your subscription in your device's Settings app.
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-indigo-600 items-center py-12 px-6">
        <Text style={{ fontSize: 64 }}>✨</Text>
        <Text className="text-white text-2xl font-bold mt-4">Upgrade to Pro</Text>
        <Text className="text-indigo-200 text-center mt-2">
          Unlock the full potential of Pet Tracker
        </Text>
      </View>

      {/* Features */}
      <View className="mx-6 -mt-6 bg-white rounded-xl p-6 shadow-sm">
        <Text className="text-lg font-bold text-gray-900 mb-4">Pro Features</Text>
        <FeatureItem text="Unlimited pet profiles" />
        <FeatureItem text="Priority customer support" />
        <FeatureItem text="Early access to new features" />
        <FeatureItem text="Ad-free experience" />
        <FeatureItem text="Extended activity history" />
      </View>

      {/* Pricing */}
      <View className="mx-6 mt-6 bg-white rounded-xl p-6">
        <View className="items-center">
          <Text className="text-gray-500 text-sm">Monthly</Text>
          <Text className="text-4xl font-bold text-gray-900">{priceString}</Text>
          <Text className="text-gray-500 text-sm mt-1">Cancel anytime</Text>
        </View>
      </View>

      {/* Purchase Button */}
      <View className="px-6 mt-6">
        <TouchableOpacity
          onPress={handlePurchase}
          disabled={purchasing || !proPackage}
          className={`rounded-xl py-4 items-center ${
            purchasing ? 'bg-indigo-400' : 'bg-indigo-600'
          }`}
        >
          {purchasing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-lg">Subscribe Now</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleRestore}
          disabled={restoring}
          className="py-4 items-center mt-2"
        >
          {restoring ? (
            <ActivityIndicator color="#6366F1" />
          ) : (
            <Text className="text-indigo-600 font-medium">Restore Purchases</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Terms */}
      <View className="px-6 py-8">
        <Text className="text-gray-400 text-center text-xs">
          Payment will be charged to your App Store account. Subscription automatically renews
          unless cancelled at least 24 hours before the end of the current period.
        </Text>
      </View>
    </ScrollView>
  );
}
