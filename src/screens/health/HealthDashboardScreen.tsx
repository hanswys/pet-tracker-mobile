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
import { HealthRecord } from '../../types/database';
import PetSelector from '../../components/PetSelector';

type NavigationProp = NativeStackNavigationProp<HealthStackParamList, 'HealthDashboard'>;

const RecordCard = ({ record }: { record: HealthRecord }) => {
  const getIcon = (type: string) => {
    return type === 'vaccination' ? '💉' : '💊';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <View className="bg-white rounded-xl p-4 mb-3 border border-gray-100">
      <View className="flex-row items-center">
        <View className="w-12 h-12 rounded-full bg-green-100 items-center justify-center mr-3">
          <Text style={{ fontSize: 24 }}>{getIcon(record.record_type)}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-gray-900 font-semibold text-base">{record.title}</Text>
          <Text className="text-gray-500 text-sm capitalize">{record.record_type}</Text>
        </View>
        <View className="items-end">
          <Text className="text-gray-900 text-sm">{formatDate(record.record_date)}</Text>
          {record.next_due_date && (
            <Text className="text-orange-500 text-xs mt-1">
              Due: {formatDate(record.next_due_date)}
            </Text>
          )}
        </View>
      </View>
      {record.description && (
        <Text className="text-gray-600 text-sm mt-2">{record.description}</Text>
      )}
    </View>
  );
};

export default function HealthDashboardScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { selectedPet, pets } = usePets();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRecords = useCallback(async () => {
    if (!selectedPet) {
      setRecords([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('health_records')
        .select('*')
        .eq('pet_id', selectedPet.id)
        .order('record_date', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error('Error fetching health records:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedPet]);

  useFocusEffect(
    useCallback(() => {
      fetchRecords();
    }, [fetchRecords])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRecords();
  };

  const handleAddRecord = () => {
    if (selectedPet) {
      navigation.navigate('AddHealthRecord', { petId: selectedPet.id });
    }
  };

  const handleViewAppointments = () => {
    navigation.navigate('AppointmentList');
  };

  if (pets.length === 0) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center px-6">
        <Text style={{ fontSize: 64 }}>🏥</Text>
        <Text className="text-xl font-bold text-gray-900 mt-4 text-center">
          Add a pet first
        </Text>
        <Text className="text-gray-500 mt-2 text-center">
          You need to add a pet before you can track health records.
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

      {/* Quick Actions */}
      <View className="flex-row px-4 py-4 gap-3">
        <TouchableOpacity
          onPress={handleAddRecord}
          className="flex-1 bg-emerald-600 rounded-xl py-3 items-center"
        >
          <Text className="text-white font-semibold">+ Add Record</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleViewAppointments}
          className="flex-1 bg-white rounded-xl py-3 items-center border border-emerald-600"
        >
          <Text className="text-emerald-600 font-semibold">📅 Appointments</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      ) : records.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text style={{ fontSize: 48 }}>📋</Text>
          <Text className="text-lg font-semibold text-gray-900 mt-4 text-center">
            No health records yet
          </Text>
          <Text className="text-gray-500 mt-2 text-center">
            Add vaccinations, medications, and other health records for {selectedPet?.name}.
          </Text>
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <RecordCard record={item} />}
          contentContainerStyle={{ padding: 16, paddingTop: 0 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}
    </View>
  );
}
