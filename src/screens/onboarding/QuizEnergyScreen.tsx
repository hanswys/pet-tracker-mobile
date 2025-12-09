import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/types';
import { useOnboardingStore, EnergyLevel } from '../../stores/onboardingStore';
import { ArrowRight, Battery, BatteryMedium, Zap } from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<OnboardingStackParamList, 'QuizEnergy'>;

export default function QuizEnergyScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { energyLevel, setEnergyLevel, petName } = useOnboardingStore();

  const handleNext = () => {
    navigation.navigate('QuizAppetite');
  };

  const EnergyOption = ({ level, emoji, title, desc, icon: Icon }: { level: EnergyLevel, emoji: string, title: string, desc: string, icon: any }) => (
    <TouchableOpacity
        onPress={() => setEnergyLevel(level)}
        className={`w-full p-5 mb-4 rounded-2xl border-2 flex-row items-center ${
            energyLevel === level ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100 bg-white'
        }`}
    >
        <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${energyLevel === level ? 'bg-indigo-100' : 'bg-gray-100'}`}>
            <Text style={{ fontSize: 24 }}>{emoji}</Text>
        </View>
        <View className="flex-1">
            <Text className={`font-bold text-lg ${energyLevel === level ? 'text-indigo-900' : 'text-gray-900'}`}>{title}</Text>
            <Text className="text-gray-500 text-sm mt-1">{desc}</Text>
        </View>
        {energyLevel === level && (
             <View className="w-6 h-6 bg-indigo-600 rounded-full items-center justify-center">
                 <View className="w-2 h-2 bg-white rounded-full" />
             </View>
        )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-10">
        <View className="mb-8">
            <Text className="text-sm font-bold text-indigo-600 tracking-wider mb-2">STEP 2 OF 3</Text>
            <Text className="text-3xl font-bold text-gray-900">What's {petName}'s vibe?</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
            <EnergyOption 
                level="low" 
                emoji="🥔" 
                title="Couch Potato" 
                desc="Most active when dreaming."
                icon={Battery}
            />
            <EnergyOption 
                level="medium" 
                emoji="⚡" 
                title="Zoomies Expert" 
                desc="Needs a good play session daily."
                icon={BatteryMedium}
            />
            <EnergyOption 
                level="high" 
                emoji="🏃" 
                title="Marathon Runner" 
                desc="Please send help (and running shoes)."
                icon={Zap}
            />
        </ScrollView>

        <View className="pt-4 mb-8">
            <TouchableOpacity
                onPress={handleNext}
                className="w-full bg-gray-900 py-4 rounded-xl items-center flex-row justify-center"
            >
                <Text className="text-white text-lg font-bold mr-2">Continue</Text>
                <ArrowRight color="white" size={20} />
            </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
