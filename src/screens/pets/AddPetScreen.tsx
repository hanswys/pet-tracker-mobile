import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { usePets } from '../../contexts/PetContext';
import { Species, PetInsert } from '../../types/database';
import { trackEvent } from '../../services/analytics';

export default function AddPetScreen() {
  const navigation = useNavigation();
  const { addPet } = usePets();

  const [name, setName] = useState('');
  const [species, setSpecies] = useState<Species>('dog');
  const [breed, setBreed] = useState('');
  const [birthdate, setBirthdate] = useState<Date | null>(null);
  const [weight, setWeight] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photo library to add a pet photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setBirthdate(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Missing Information', 'Please enter your pet\'s name.');
      return;
    }

    setLoading(true);

    try {
      const petData: PetInsert = {
        name: name.trim(),
        species,
        breed: breed.trim() || null,
        birthdate: birthdate ? birthdate.toISOString().split('T')[0] : null,
        weight: weight ? parseFloat(weight) : null,
        photo_url: photoUri, // In production, upload to Supabase Storage first
      };

      const newPet = await addPet(petData);
      
      if (newPet) {
        trackEvent('pet_created', { species, has_photo: !!photoUri });
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error adding pet:', error);
      Alert.alert('Error', 'Failed to add pet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6">
        {/* Photo Picker */}
        <TouchableOpacity
          onPress={handlePickImage}
          className="items-center mb-8"
        >
          {photoUri ? (
            <Image
              source={{ uri: photoUri }}
              className="w-32 h-32 rounded-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-32 h-32 rounded-full bg-indigo-100 items-center justify-center">
              <Text style={{ fontSize: 48 }}>📷</Text>
            </View>
          )}
          <Text className="text-indigo-600 font-medium mt-2">
            {photoUri ? 'Change Photo' : 'Add Photo'}
          </Text>
        </TouchableOpacity>

        {/* Name Input */}
        <View className="mb-6">
          <Text className="text-gray-700 font-semibold mb-2">Name *</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="What's your pet's name?"
            className="bg-white rounded-xl px-4 py-4 text-base border border-gray-200"
          />
        </View>

        {/* Species Selection */}
        <View className="mb-6">
          <Text className="text-gray-700 font-semibold mb-2">Species *</Text>
          <View className="flex-row gap-4">
            <TouchableOpacity
              onPress={() => setSpecies('dog')}
              className={`flex-1 rounded-xl py-4 items-center border-2 ${
                species === 'dog'
                  ? 'bg-indigo-50 border-indigo-500'
                  : 'bg-white border-gray-200'
              }`}
            >
              <Text style={{ fontSize: 32 }}>🐕</Text>
              <Text
                className={`mt-1 font-medium ${
                  species === 'dog' ? 'text-indigo-600' : 'text-gray-600'
                }`}
              >
                Dog
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSpecies('cat')}
              className={`flex-1 rounded-xl py-4 items-center border-2 ${
                species === 'cat'
                  ? 'bg-indigo-50 border-indigo-500'
                  : 'bg-white border-gray-200'
              }`}
            >
              <Text style={{ fontSize: 32 }}>🐈</Text>
              <Text
                className={`mt-1 font-medium ${
                  species === 'cat' ? 'text-indigo-600' : 'text-gray-600'
                }`}
              >
                Cat
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Breed Input */}
        <View className="mb-6">
          <Text className="text-gray-700 font-semibold mb-2">Breed</Text>
          <TextInput
            value={breed}
            onChangeText={setBreed}
            placeholder="e.g., Golden Retriever, Maine Coon"
            className="bg-white rounded-xl px-4 py-4 text-base border border-gray-200"
          />
        </View>

        {/* Birthdate Picker */}
        <View className="mb-6">
          <Text className="text-gray-700 font-semibold mb-2">Birthdate</Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="bg-white rounded-xl px-4 py-4 border border-gray-200"
          >
            <Text className={birthdate ? 'text-gray-900' : 'text-gray-400'}>
              {birthdate ? formatDate(birthdate) : 'Select birthdate'}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={birthdate || new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>

        {/* Weight Input */}
        <View className="mb-8">
          <Text className="text-gray-700 font-semibold mb-2">Weight (lbs)</Text>
          <TextInput
            value={weight}
            onChangeText={setWeight}
            placeholder="e.g., 25.5"
            keyboardType="decimal-pad"
            className="bg-white rounded-xl px-4 py-4 text-base border border-gray-200"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          className={`rounded-xl py-4 items-center ${
            loading ? 'bg-indigo-400' : 'bg-indigo-600'
          }`}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-semibold text-lg">Add Pet</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
