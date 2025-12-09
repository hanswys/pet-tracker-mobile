import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/types';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { ArrowRight, Dog, Cat } from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<OnboardingStackParamList, 'QuizIdentity'>;

export default function QuizIdentityScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { setPetName, setSpecies, petName, species } = useOnboardingStore();
  const [nameError, setNameError] = useState(false);

  const handleNext = () => {
    if (!petName.trim()) {
        setNameError(true);
        return;
    }
    navigation.navigate('QuizEnergy');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 px-6 pt-10"
      >
        <View className="mb-8">
            <Text className="text-sm font-bold text-indigo-600 tracking-wider mb-2">STEP 1 OF 3</Text>
            <Text className="text-3xl font-bold text-gray-900">Who are we auditing?</Text>
        </View>

        {/* Species Selection */}
        <View className="flex-row gap-4 mb-8">
            <TouchableOpacity 
                onPress={() => setSpecies('dog')}
                className={`flex-1 p-6 rounded-2xl border-2 items-center ${
                    species === 'dog' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100 bg-gray-50'
                }`}
            >
                <Dog size={40} color={species === 'dog' ? '#4F46E5' : '#9CA3AF'} />
                <Text className={`mt-3 font-semibold ${species === 'dog' ? 'text-indigo-900' : 'text-gray-500'}`}>Dog</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                onPress={() => setSpecies('cat')}
                className={`flex-1 p-6 rounded-2xl border-2 items-center ${
                    species === 'cat' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100 bg-gray-50'
                }`}
            >
                <Cat size={40} color={species === 'cat' ? '#4F46E5' : '#9CA3AF'} />
                <Text className={`mt-3 font-semibold ${species === 'cat' ? 'text-indigo-900' : 'text-gray-500'}`}>Cat</Text>
            </TouchableOpacity>
        </View>

        {/* Name Input */}
        <View>
            <Text className="text-gray-700 font-medium mb-3">Pet's Name</Text>
            <TextInput
                value={petName}
                onChangeText={(text) => {
                    setPetName(text);
                    setNameError(false);
                }}
                placeholder="e.g. Luna"
                className={`w-full bg-gray-50 border p-4 rounded-xl text-lg ${nameError ? 'border-red-500' : 'border-gray-200'}`}
                autoFocus
            />
            {nameError && <Text className="text-red-500 text-sm mt-2">Please enter a name</Text>}
        </View>

        <View className="flex-1 justify-end mb-8">
            <TouchableOpacity
                onPress={handleNext}
                className="w-full bg-gray-900 py-4 rounded-xl items-center flex-row justify-center"
            >
                <Text className="text-white text-lg font-bold mr-2">Continue</Text>
                <ArrowRight color="white" size={20} />
            </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
