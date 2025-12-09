import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Modal, Alert, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/types';
import { useOnboardingStore, ScheduleItem } from '../../stores/onboardingStore';
import { CheckCircle2, Circle, Lock, X } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { PetInsert, Species } from '../../types/database';

type NavigationProp = NativeStackNavigationProp<OnboardingStackParamList, 'PerfectDay'>;

export default function PerfectDayScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { petName, species, breed, getPerfectDaySchedule, completeOnboarding, reset } = useOnboardingStore();
  const schedule = getPerfectDaySchedule();
  const { signUp, signIn } = useAuth();
  
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [showSaveWall, setShowSaveWall] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');
  const [loading, setLoading] = useState(false);

  const handleToggleItem = (itemId: string) => {
    // Show save wall on second interaction
    if (checkedItems.length >= 1 && !checkedItems.includes(itemId)) {
        setShowSaveWall(true);
        return;
    }

    if (checkedItems.includes(itemId)) {
        setCheckedItems(prev => prev.filter(id => id !== itemId));
    } else {
        setCheckedItems(prev => [...prev, itemId]);
    }
  };

  const savePetToDatabase = async (userId: string) => {
    try {
        const petData: PetInsert = {
            user_id: userId,
            name: petName,
            species: species as Species,
            breed: breed || null,
            birthdate: null, 
            weight: null,
            photo_url: null,
        };

        const { error } = await supabase.from('pets').insert(petData);
        if (error) throw error;

        completeOnboarding();
        reset();
    } catch (error) {
        console.error("Failed to save pet:", error);
        Alert.alert('Error', 'Failed to save your pet plan. Please try again.');
    }
  };

  const handleAuth = async () => {
    if (!email || !password) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
    }

    setLoading(true);
    try {
        if (authMode === 'signup') {
            await signUp(email, password);
             // Note: In a real app, you might need to wait for session establishment 
             // here or handle email verification flow. 
             // For MVP, we assume we might get a session or need to prompt.
             const { data: { user } } = await supabase.auth.getUser();
             if (user) {
                 await savePetToDatabase(user.id);
             } else {
                 Alert.alert('Check your email', 'Please verify your email to continue.');
                 setAuthMode('login'); // Switch to login so they can sign in after verify
             }
        } else {
            await signIn(email, password);
            const { data: { user } } = await supabase.auth.getUser();
            if (user) await savePetToDatabase(user.id);
        }
    } catch (error: any) {
        Alert.alert('Authentication Error', error.message);
    } finally {
        setLoading(false);
    }
  };

  const ScheduleRow = ({ item }: { item: ScheduleItem }) => {
    const isChecked = checkedItems.includes(item.id);
    return (
        <TouchableOpacity 
            onPress={() => handleToggleItem(item.id)}
            className={`flex-row items-center p-4 mb-3 rounded-xl border ${isChecked ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-100'}`}
        >
            <View className="mr-4 w-20">
                <Text className="text-xs font-bold text-gray-400 uppercase">{item.time}</Text>
            </View>
            <View className="flex-1">
                <Text className={`font-semibold text-lg ${isChecked ? 'text-indigo-900 line-through' : 'text-gray-900'}`}>{item.title}</Text>
                {item.isOverdue && !isChecked && (
                    <Text className="text-red-500 text-xs font-bold mt-1">⚠️ OVERDUE</Text>
                )}
            </View>
            <View>
                {isChecked ? (
                    <CheckCircle2 color="#4F46E5" size={28} />
                ) : (
                    <Circle color="#E5E7EB" size={28} />
                )}
            </View>
        </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
        <ScrollView className="flex-1 px-6 pt-8">
            <View className="mb-8">
                <Text className="text-gray-500 font-bold tracking-wider uppercase text-sm mb-2">🎉 PLAN READY</Text>
                <Text className="text-3xl font-bold text-gray-900">{petName}'s Perfect Day</Text>
            </View>

            <View className="mb-8">
                {schedule.map(item => (
                    <ScheduleRow key={item.id} item={item} />
                ))}
            </View>

            <TouchableOpacity
                onPress={() => setShowSaveWall(true)}
                className="w-full bg-indigo-600 py-4 rounded-xl items-center shadow-lg shadow-indigo-200 mb-10"
            >
                <Text className="text-white text-lg font-bold">Save My Plan</Text>
            </TouchableOpacity>
        </ScrollView>

        <Modal 
            visible={showSaveWall} 
            animationType="slide" 
            transparent={true}
            onRequestClose={() => setShowSaveWall(false)}
        >
             <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1 justify-end bg-black/50"
            >
                <View className="bg-white rounded-t-3xl p-8">
                    <View className="items-end">
                        <TouchableOpacity onPress={() => setShowSaveWall(false)} className="p-2">
                             <X color="#9CA3AF" size={24} />
                        </TouchableOpacity>
                    </View>
                    
                    <View className="items-center mb-6">
                        <View className="bg-indigo-100 p-3 rounded-full mb-4">
                            <Lock color="#4F46E5" size={32} />
                        </View>
                         <Text className="text-2xl font-bold text-gray-900 mb-2 text-center">
                            Save {petName}'s Plan
                        </Text>
                        <Text className="text-gray-500 text-center">
                            Create a free account to keep this schedule.
                        </Text>
                    </View>

                    <TextInput
                        className="bg-gray-100 rounded-xl px-4 py-3 mb-4 text-base"
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                     <TextInput
                        className="bg-gray-100 rounded-xl px-4 py-3 mb-6 text-base"
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <TouchableOpacity
                        onPress={handleAuth}
                        disabled={loading}
                        className="w-full bg-indigo-600 py-4 rounded-xl items-center mb-4"
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white text-lg font-bold">
                                {authMode === 'signup' ? 'Create Account & Save' : 'Sign In & Save'}
                            </Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={() => setAuthMode(prev => prev === 'signup' ? 'login' : 'signup')}
                        className="items-center"
                    >
                        <Text className="text-indigo-600 font-medium">
                             {authMode === 'signup' ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    </SafeAreaView>
  );
}
