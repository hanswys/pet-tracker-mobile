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
import { AppointmentInsert } from '../../types/database';
import { trackEvent } from '../../services/analytics';

type RouteProps = RouteProp<HealthStackParamList, 'AddAppointment'>;

export default function AddAppointmentScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const { petId } = route.params;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(new Date());
  const [appointmentTime, setAppointmentTime] = useState(new Date());
  const [location, setLocation] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const quickReasons = [
    'Annual Checkup',
    'Vaccination',
    'Dental Cleaning',
    'Grooming',
    'Surgery',
    'Follow-up',
  ];

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setAppointmentDate(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setAppointmentTime(selectedTime);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatTimeForDB = (date: Date) => {
    return date.toTimeString().slice(0, 5); // HH:MM format
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Information', 'Please enter a reason for this appointment.');
      return;
    }

    setLoading(true);

    try {
      const appointmentData: AppointmentInsert = {
        pet_id: petId,
        title: title.trim(),
        description: description.trim() || null,
        appointment_date: appointmentDate.toISOString().split('T')[0],
        appointment_time: formatTimeForDB(appointmentTime),
        location: location.trim() || null,
      };

      const { error } = await supabase.from('appointments').insert(appointmentData);

      if (error) throw error;

      trackEvent('appointment_created');
      Alert.alert(
        'Appointment Scheduled',
        'You will receive a reminder before your appointment.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error adding appointment:', error);
      Alert.alert('Error', 'Failed to schedule appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6">
        {/* Quick Reasons */}
        <View className="mb-6">
          <Text className="text-gray-700 font-semibold mb-2">Quick Select Reason</Text>
          <View className="flex-row flex-wrap gap-2">
            {quickReasons.map((reason) => (
              <TouchableOpacity
                key={reason}
                onPress={() => setTitle(reason)}
                className={`px-4 py-2 rounded-full ${
                  title === reason
                    ? 'bg-emerald-600'
                    : 'bg-white border border-gray-200'
                }`}
              >
                <Text
                  className={`font-medium ${
                    title === reason ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {reason}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Title/Reason Input */}
        <View className="mb-6">
          <Text className="text-gray-700 font-semibold mb-2">Reason *</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="What's the appointment for?"
            className="bg-white rounded-xl px-4 py-4 text-base border border-gray-200"
          />
        </View>

        {/* Date Picker */}
        <View className="mb-6">
          <Text className="text-gray-700 font-semibold mb-2">Date *</Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="bg-white rounded-xl px-4 py-4 border border-gray-200"
          >
            <Text className="text-gray-900">{formatDate(appointmentDate)}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={appointmentDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>

        {/* Time Picker */}
        <View className="mb-6">
          <Text className="text-gray-700 font-semibold mb-2">Time *</Text>
          <TouchableOpacity
            onPress={() => setShowTimePicker(true)}
            className="bg-white rounded-xl px-4 py-4 border border-gray-200"
          >
            <Text className="text-gray-900">{formatTime(appointmentTime)}</Text>
          </TouchableOpacity>
          {showTimePicker && (
            <DateTimePicker
              value={appointmentTime}
              mode="time"
              display="default"
              onChange={handleTimeChange}
            />
          )}
        </View>

        {/* Location Input */}
        <View className="mb-6">
          <Text className="text-gray-700 font-semibold mb-2">Location</Text>
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="Vet clinic name or address"
            className="bg-white rounded-xl px-4 py-4 text-base border border-gray-200"
          />
        </View>

        {/* Description Input */}
        <View className="mb-8">
          <Text className="text-gray-700 font-semibold mb-2">Notes</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Any additional notes..."
            multiline
            numberOfLines={3}
            className="bg-white rounded-xl px-4 py-4 text-base border border-gray-200"
            style={{ textAlignVertical: 'top', minHeight: 80 }}
          />
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
            <Text className="text-white font-semibold text-lg">Schedule Appointment</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
