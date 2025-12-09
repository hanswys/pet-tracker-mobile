import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/types';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { PawPrint } from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<OnboardingStackParamList, 'Analysis'>;

export default function AnalysisScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { petName, species } = useOnboardingStore();
  const [loadingText, setLoadingText] = useState(`Analyzing ${species} health data...`);

  // Animation for pulsation
  const [scale] = useState(new Animated.Value(1));

  useEffect(() => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Text cycling
    const texts = [
      `Analyzing ${species} health data...`,
      'Calculating optimal calorie limits...',
      `Building ${petName}'s daily schedule...`,
    ];

    let currentIndex = 0;
    const interval = setInterval(() => {
        currentIndex = (currentIndex + 1) % texts.length;
        setLoadingText(texts[currentIndex]);
    }, 1500);

    // Navigate away after 4.5 seconds
    const timeout = setTimeout(() => {
        navigation.replace('PerfectDay');
    }, 4500);

    return () => {
        clearInterval(interval);
        clearTimeout(timeout);
    };
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <View className="items-center">
            <Animated.View style={{ transform: [{ scale }] }} className="mb-8 bg-indigo-50 p-8 rounded-full">
                <PawPrint size={64} color="#6366F1" />
            </Animated.View>
            
            <Text className="text-xl font-medium text-gray-700 text-center px-8">
                {loadingText}
            </Text>
        </View>
    </SafeAreaView>
  );
}
