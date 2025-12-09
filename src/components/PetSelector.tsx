import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { usePets } from '../contexts/PetContext';
import { Pet } from '../types/database';

interface PetSelectorProps {
  onSelect?: (pet: Pet) => void;
}

export default function PetSelector({ onSelect }: PetSelectorProps) {
  const { pets, selectedPet, selectPet } = usePets();

  const handleSelect = (pet: Pet) => {
    selectPet(pet);
    onSelect?.(pet);
  };

  if (pets.length <= 1) {
    return selectedPet ? (
      <View className="flex-row items-center">
        <Text style={{ fontSize: 20 }}>
          {selectedPet.species === 'dog' ? '🐕' : '🐈'}
        </Text>
        <Text className="text-white font-semibold ml-2">{selectedPet.name}</Text>
      </View>
    ) : null;
  }

  return (
    <View className="flex-row gap-2">
      {pets.map((pet) => (
        <TouchableOpacity
          key={pet.id}
          onPress={() => handleSelect(pet)}
          className={`flex-row items-center px-3 py-2 rounded-full ${
            selectedPet?.id === pet.id
              ? 'bg-white'
              : 'bg-white/20'
          }`}
        >
          <Text style={{ fontSize: 16 }}>
            {pet.species === 'dog' ? '🐕' : '🐈'}
          </Text>
          <Text
            className={`ml-1 font-medium ${
              selectedPet?.id === pet.id ? 'text-gray-900' : 'text-white'
            }`}
          >
            {pet.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
