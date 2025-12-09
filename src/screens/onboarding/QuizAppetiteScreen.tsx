import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/types';
import { useOnboardingStore, Appetite } from '../../stores/onboardingStore';
import { ArrowRight, Sparkles } from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<OnboardingStackParamList, 'QuizAppetite'>;

export default function QuizAppetiteScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { appetite, setAppetite, petName } = useOnboardingStore();

  const handleNext = () => {
    navigation.navigate('Analysis');
  };

  const AppetiteOption = ({ value, emoji, title, desc }: { value: Appetite, emoji: string, title: string, desc: string }) => (
    <TouchableOpacity
        onPress={() => setAppetite(value)}
        className={`w-full p-5 mb-4 rounded-2xl border-2 flex-row items-center ${
            appetite === value ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100 bg-white'
        }`}
    >
        <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${appetite === value ? 'bg-indigo-100' : 'bg-gray-100'}`}>
            <Text style={{ fontSize: 24 }}>{emoji}</Text>
        </View>
        <View className="flex-1">
            <Text className={`font-bold text-lg ${appetite === value ? 'text-indigo-900' : 'text-gray-900'}`}>{title}</Text>
            <Text className="text-gray-500 text-sm mt-1">{desc}</Text>
        </View>
        {appetite === value && (
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
            <Text className="text-sm font-bold text-indigo-600 tracking-wider mb-2">STEP 3 OF 3</Text>
            <Text className="text-3xl font-bold text-gray-900">How's the appetite?</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
            <AppetiteOption 
                value="picky" 
                emoji="🍽️" 
                title="Picky Eater" 
                desc="Needs gourmet persuasion."
            />
            <AppetiteOption 
                value="normal" 
                emoji="😋" 
                title="Normal" 
                desc="Enjoys food but has manners."
            />
             <AppetiteOption 
                value="high" 
                emoji="🗑️" 
                title="Human Vacuum" 
                desc="Will eat anything not nailed down."
            />
        </ScrollView>

        <View className="pt-4 mb-8">
            <TouchableOpacity
                onPress={handleNext}
                className="w-full bg-gray-900 py-4 rounded-xl items-center flex-row justify-center"
            >
                <Text className="text-white text-lg font-bold mr-2">Generate Plan</Text>
                <Sparkles color="white" size={20} />
            </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
