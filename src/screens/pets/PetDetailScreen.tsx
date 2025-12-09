import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { usePets } from '../../contexts/PetContext';
import { PetsStackParamList } from '../../navigation/types';
import { trackEvent } from '../../services/analytics';

type DetailRouteProp = RouteProp<PetsStackParamList, 'PetDetail'>;
type NavigationProp = NativeStackNavigationProp<PetsStackParamList, 'PetDetail'>;

export default function PetDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<DetailRouteProp>();
  const { deletePet, selectPet } = usePets();
  const { pet } = route.params;

  const formatAge = (birthdate: string | null) => {
    if (!birthdate) return 'Unknown age';
    const birth = new Date(birthdate);
    const now = new Date();
    const years = now.getFullYear() - birth.getFullYear();
    const months = now.getMonth() - birth.getMonth();
    
    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''} old`;
    } else if (months > 0) {
      return `${months} month${months > 1 ? 's' : ''} old`;
    }
    return 'Less than a month old';
  };

  const formatBirthdate = (birthdate: string | null) => {
    if (!birthdate) return 'Not specified';
    return new Date(birthdate).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Pet',
      `Are you sure you want to delete ${pet.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deletePet(pet.id);
            if (success) {
              trackEvent('pet_deleted', { species: pet.species });
              navigation.goBack();
            }
          },
        },
      ]
    );
  };

  const handleSetActive = () => {
    selectPet(pet);
    Alert.alert('Pet Selected', `${pet.name} is now your active pet for tracking.`);
  };

  const getSpeciesEmoji = (species: string) => {
    return species === 'dog' ? '🐕' : '🐈';
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header with Photo */}
      <View className="bg-indigo-600 items-center pt-6 pb-12">
        {pet.photo_url ? (
          <Image
            source={{ uri: pet.photo_url }}
            className="w-32 h-32 rounded-full border-4 border-white"
            resizeMode="cover"
          />
        ) : (
          <View className="w-32 h-32 rounded-full bg-indigo-400 items-center justify-center border-4 border-white">
            <Text style={{ fontSize: 56 }}>{getSpeciesEmoji(pet.species)}</Text>
          </View>
        )}
        <Text className="text-white text-2xl font-bold mt-4">{pet.name}</Text>
        <Text className="text-indigo-200 mt-1">{formatAge(pet.birthdate)}</Text>
      </View>

      {/* Details Card */}
      <View className="mx-4 -mt-6 bg-white rounded-2xl p-6 shadow-sm">
        <Text className="text-lg font-bold text-gray-900 mb-4">Pet Information</Text>
        
        <View className="space-y-4">
          <View className="flex-row justify-between py-3 border-b border-gray-100">
            <Text className="text-gray-500">Species</Text>
            <Text className="text-gray-900 font-medium capitalize">{pet.species}</Text>
          </View>
          
          <View className="flex-row justify-between py-3 border-b border-gray-100">
            <Text className="text-gray-500">Breed</Text>
            <Text className="text-gray-900 font-medium">{pet.breed || 'Not specified'}</Text>
          </View>
          
          <View className="flex-row justify-between py-3 border-b border-gray-100">
            <Text className="text-gray-500">Birthdate</Text>
            <Text className="text-gray-900 font-medium">{formatBirthdate(pet.birthdate)}</Text>
          </View>
          
          <View className="flex-row justify-between py-3">
            <Text className="text-gray-500">Weight</Text>
            <Text className="text-gray-900 font-medium">
              {pet.weight ? `${pet.weight} lbs` : 'Not specified'}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="px-4 mt-6 space-y-3">
        <TouchableOpacity
          onPress={handleSetActive}
          className="bg-indigo-600 rounded-xl py-4 items-center"
        >
          <Text className="text-white font-semibold text-base">
            📍 Set as Active Pet for Tracking
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={handleDelete}
          className="bg-red-50 rounded-xl py-4 items-center border border-red-200"
        >
          <Text className="text-red-600 font-semibold text-base">
            Delete Pet
          </Text>
        </TouchableOpacity>
      </View>

      {/* Spacing at bottom */}
      <View className="h-8" />
    </ScrollView>
  );
}
