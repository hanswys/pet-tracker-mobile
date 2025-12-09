import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../../lib/supabase';
import { usePets } from '../../contexts/PetContext';
import { HealthStackParamList } from '../../navigation/types';
import { Appointment } from '../../types/database';
import PetSelector from '../../components/PetSelector';

type NavigationProp = NativeStackNavigationProp<HealthStackParamList, 'AppointmentList'>;

const AppointmentCard = ({ appointment, isPast }: { appointment: Appointment; isPast: boolean }) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <View
      className={`bg-white rounded-xl p-4 mb-3 border ${
        isPast ? 'border-gray-200 opacity-60' : 'border-emerald-200'
      }`}
    >
      <View className="flex-row items-start">
        <View
          className={`w-14 h-14 rounded-xl items-center justify-center mr-3 ${
            isPast ? 'bg-gray-100' : 'bg-emerald-100'
          }`}
        >
          <Text style={{ fontSize: 24 }}>🏥</Text>
        </View>
        <View className="flex-1">
          <Text className="text-gray-900 font-semibold text-base">{appointment.title}</Text>
          <View className="flex-row items-center mt-1">
            <Text className={isPast ? 'text-gray-400' : 'text-emerald-600'}>
              {formatDate(appointment.appointment_date)}
            </Text>
            <Text className="text-gray-400 mx-2">•</Text>
            <Text className="text-gray-500">{formatTime(appointment.appointment_time)}</Text>
          </View>
          {appointment.location && (
            <Text className="text-gray-500 text-sm mt-1">📍 {appointment.location}</Text>
          )}
        </View>
      </View>
      {appointment.description && (
        <Text className="text-gray-600 text-sm mt-2 ml-17">{appointment.description}</Text>
      )}
    </View>
  );
};

export default function AppointmentListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { selectedPet, pets } = usePets();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAppointments = useCallback(async () => {
    if (!selectedPet) {
      setAppointments([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('pet_id', selectedPet.id)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedPet]);

  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
    }, [fetchAppointments])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
  };

  const handleAddAppointment = () => {
    if (selectedPet) {
      navigation.navigate('AddAppointment', { petId: selectedPet.id });
    }
  };

  const isAppointmentPast = (date: string, time: string) => {
    const appointmentDateTime = new Date(`${date}T${time}`);
    return appointmentDateTime < new Date();
  };

  const upcomingAppointments = appointments.filter(
    (apt) => !isAppointmentPast(apt.appointment_date, apt.appointment_time)
  );
  const pastAppointments = appointments.filter((apt) =>
    isAppointmentPast(apt.appointment_date, apt.appointment_time)
  );

  if (pets.length === 0) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center px-6">
        <Text style={{ fontSize: 64 }}>📅</Text>
        <Text className="text-xl font-bold text-gray-900 mt-4 text-center">
          Add a pet first
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Pet Selector */}
      <View className="bg-emerald-600 px-4 py-3">
        <PetSelector />
      </View>

      {/* Add Button */}
      <View className="px-4 py-4">
        <TouchableOpacity
          onPress={handleAddAppointment}
          className="bg-emerald-600 rounded-xl py-3 items-center"
        >
          <Text className="text-white font-semibold">+ Schedule Appointment</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      ) : appointments.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text style={{ fontSize: 48 }}>📅</Text>
          <Text className="text-lg font-semibold text-gray-900 mt-4 text-center">
            No appointments scheduled
          </Text>
          <Text className="text-gray-500 mt-2 text-center">
            Schedule vet visits and checkups for {selectedPet?.name}.
          </Text>
        </View>
      ) : (
        <FlatList
          data={[...upcomingAppointments, ...pastAppointments]}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AppointmentCard
              appointment={item}
              isPast={isAppointmentPast(item.appointment_date, item.appointment_time)}
            />
          )}
          contentContainerStyle={{ padding: 16, paddingTop: 0 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListHeaderComponent={
            upcomingAppointments.length > 0 ? (
              <Text className="text-sm font-semibold text-gray-500 mb-2">
                UPCOMING ({upcomingAppointments.length})
              </Text>
            ) : null
          }
        />
      )}
    </View>
  );
}
