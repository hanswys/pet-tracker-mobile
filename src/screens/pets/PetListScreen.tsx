import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { usePets } from '../../contexts/PetContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { PetsStackParamList } from '../../navigation/types';
import { Pet } from '../../types/database';

type NavigationProp = NativeStackNavigationProp<PetsStackParamList, 'PetList'>;

const PetCard = ({ pet, onPress }: { pet: Pet; onPress: () => void }) => {
  const getSpeciesEmoji = (species: string) => {
    return species === 'dog' ? '🐕' : '🐈';
  };

  const formatAge = (birthdate: string | null) => {
    if (!birthdate) return null;
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

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View className="flex-row items-center">
        {pet.photo_url ? (
          <Image
            source={{ uri: pet.photo_url }}
            className="w-20 h-20 rounded-xl mr-4"
            resizeMode="cover"
          />
        ) : (
          <View className="w-20 h-20 rounded-xl mr-4 bg-gradient-to-br from-indigo-100 to-purple-100 items-center justify-center">
            <Text style={{ fontSize: 36 }}>{getSpeciesEmoji(pet.species)}</Text>
          </View>
        )}
        
        <View className="flex-1">
          <Text className="text-xl font-bold text-gray-900 mb-1">{pet.name}</Text>
          <Text className="text-gray-500 text-sm mb-1">
            {pet.breed || (pet.species === 'dog' ? 'Dog' : 'Cat')}
          </Text>
          {pet.birthdate && (
            <Text className="text-gray-400 text-xs">{formatAge(pet.birthdate)}</Text>
          )}
        </View>
        
        <Text className="text-gray-300 text-2xl">›</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function PetListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { pets, loading, refreshPets, canAddMorePets } = usePets();
  const { isPro } = useSubscription();

  const handleAddPet = () => {
    navigation.navigate('AddPet');
  };

  const handlePetPress = (pet: Pet) => {
    navigation.navigate('PetDetail', { pet });
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header Stats */}
      <View className="bg-indigo-600 px-6 py-4 -mt-1">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-indigo-200 text-sm">Total Pets</Text>
            <Text className="text-white text-3xl font-bold">{pets.length}</Text>
          </View>
          {!isPro && (
            <View className="bg-indigo-500 rounded-full px-3 py-1">
              <Text className="text-indigo-100 text-xs">
                {pets.length}/2 Free Pets
              </Text>
            </View>
          )}
        </View>
      </View>

      {pets.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text style={{ fontSize: 64 }}>🐾</Text>
          <Text className="text-2xl font-bold text-gray-900 mt-4 text-center">
            No pets yet!
          </Text>
          <Text className="text-gray-500 mt-2 text-center">
            Add your first furry friend to get started
          </Text>
          <TouchableOpacity
            onPress={handleAddPet}
            className="bg-indigo-600 rounded-xl px-8 py-4 mt-6"
          >
            <Text className="text-white font-semibold text-lg">Add Your First Pet</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={pets}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PetCard pet={item} onPress={() => handlePetPress(item)} />
          )}
          contentContainerStyle={{ padding: 16 }}
          onRefresh={refreshPets}
          refreshing={loading}
          ListFooterComponent={
            canAddMorePets ? (
              <TouchableOpacity
                onPress={handleAddPet}
                className="bg-indigo-600 rounded-2xl p-4 items-center"
              >
                <Text className="text-white font-semibold text-base">+ Add Another Pet</Text>
              </TouchableOpacity>
            ) : (
              <View className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
                <Text className="text-amber-800 font-semibold text-center">
                  🌟 Upgrade to Pro for unlimited pets!
                </Text>
              </View>
            )
          }
        />
      )}
    </View>
  );
}
