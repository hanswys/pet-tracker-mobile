import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../../lib/supabase';
import { HealthStackParamList } from '../../navigation/types';
import { RecordType, HealthRecordInsert } from '../../types/database';
import { trackEvent } from '../../services/analytics';

type RouteProps = RouteProp<HealthStackParamList, 'AddHealthRecord'>;

export default function AddHealthRecordScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const { petId } = route.params;

  const [recordType, setRecordType] = useState<RecordType>('vaccination');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [recordDate, setRecordDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [nextDueDate, setNextDueDate] = useState<Date | null>(null);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const quickOptions = {
    vaccination: ['Rabies', 'Distemper', 'Bordetella', 'Parvo', 'Leptospirosis'],
    medication: ['Flea & Tick', 'Heartworm', 'Dewormer', 'Antibiotic', 'Pain Relief'],
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setRecordDate(selectedDate);
    }
  };

  const handleDueDateChange = (event: any, selectedDate?: Date) => {
    setShowDueDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setNextDueDate(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleQuickSelect = (option: string) => {
    setTitle(option);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Information', 'Please enter a title for this record.');
      return;
    }

    setLoading(true);

    try {
      const recordData: HealthRecordInsert = {
        pet_id: petId,
        record_type: recordType,
        title: title.trim(),
        description: description.trim() || null,
        record_date: recordDate.toISOString().split('T')[0],
        next_due_date: nextDueDate ? nextDueDate.toISOString().split('T')[0] : null,
        is_recurring: !!nextDueDate,
      };

      const { error } = await supabase.from('health_records').insert(recordData);

      if (error) throw error;

      trackEvent('health_record_created', { type: recordType });
      navigation.goBack();
    } catch (error) {
      console.error('Error adding health record:', error);
      Alert.alert('Error', 'Failed to add record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6">
        {/* Record Type Selection */}
        <View className="mb-6">
          <Text className="text-gray-700 font-semibold mb-2">Record Type</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => setRecordType('vaccination')}
              className={`flex-1 rounded-xl py-4 items-center border-2 ${
                recordType === 'vaccination'
                  ? 'bg-emerald-50 border-emerald-500'
                  : 'bg-white border-gray-200'
              }`}
            >
              <Text style={{ fontSize: 28 }}>💉</Text>
              <Text
                className={`mt-1 font-medium ${
                  recordType === 'vaccination' ? 'text-emerald-600' : 'text-gray-600'
                }`}
              >
                Vaccination
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setRecordType('medication')}
              className={`flex-1 rounded-xl py-4 items-center border-2 ${
                recordType === 'medication'
                  ? 'bg-emerald-50 border-emerald-500'
                  : 'bg-white border-gray-200'
              }`}
            >
              <Text style={{ fontSize: 28 }}>💊</Text>
              <Text
                className={`mt-1 font-medium ${
                  recordType === 'medication' ? 'text-emerald-600' : 'text-gray-600'
                }`}
              >
                Medication
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Options */}
        <View className="mb-6">
          <Text className="text-gray-700 font-semibold mb-2">Quick Select</Text>
          <View className="flex-row flex-wrap gap-2">
            {quickOptions[recordType].map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => handleQuickSelect(option)}
                className={`px-4 py-2 rounded-full ${
                  title === option
                    ? 'bg-emerald-600'
                    : 'bg-white border border-gray-200'
                }`}
              >
                <Text
                  className={`font-medium ${
                    title === option ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Title Input */}
        <View className="mb-6">
          <Text className="text-gray-700 font-semibold mb-2">Title *</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g., Rabies Vaccine, Flea Treatment"
            className="bg-white rounded-xl px-4 py-4 text-base border border-gray-200"
          />
        </View>

        {/* Description Input */}
        <View className="mb-6">
          <Text className="text-gray-700 font-semibold mb-2">Notes</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Add any additional notes..."
            multiline
            numberOfLines={3}
            className="bg-white rounded-xl px-4 py-4 text-base border border-gray-200"
            style={{ textAlignVertical: 'top', minHeight: 80 }}
          />
        </View>

        {/* Record Date */}
        <View className="mb-6">
          <Text className="text-gray-700 font-semibold mb-2">Date Given *</Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="bg-white rounded-xl px-4 py-4 border border-gray-200"
          >
            <Text className="text-gray-900">{formatDate(recordDate)}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={recordDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>

        {/* Next Due Date */}
        <View className="mb-8">
          <Text className="text-gray-700 font-semibold mb-2">Next Due Date (Optional)</Text>
          <TouchableOpacity
            onPress={() => setShowDueDatePicker(true)}
            className="bg-white rounded-xl px-4 py-4 border border-gray-200"
          >
            <Text className={nextDueDate ? 'text-gray-900' : 'text-gray-400'}>
              {nextDueDate ? formatDate(nextDueDate) : 'Set reminder for next dose'}
            </Text>
          </TouchableOpacity>
          {showDueDatePicker && (
            <DateTimePicker
              value={nextDueDate || new Date()}
              mode="date"
              display="default"
              onChange={handleDueDateChange}
              minimumDate={new Date()}
            />
          )}
          {nextDueDate && (
            <TouchableOpacity
              onPress={() => setNextDueDate(null)}
              className="mt-2"
            >
              <Text className="text-red-500 text-sm">Clear due date</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          className={`rounded-xl py-4 items-center ${
            loading ? 'bg-emerald-400' : 'bg-emerald-600'
          }`}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-semibold text-lg">Save Record</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
