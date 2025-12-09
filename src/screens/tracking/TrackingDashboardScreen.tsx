import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../../lib/supabase';
import { usePets } from '../../contexts/PetContext';
import { TrackingStackParamList } from '../../navigation/types';
import { ActivityLog, Walk } from '../../types/database';
import PetSelector from '../../components/PetSelector';
import { trackEvent } from '../../services/analytics';
import { formatDistance, formatDuration } from '../../services/location';

type NavigationProp = NativeStackNavigationProp<TrackingStackParamList, 'TrackingDashboard'>;

const QuickLogButton = ({
  emoji,
  label,
  onPress,
  loading,
}: {
  emoji: string;
  label: string;
  onPress: () => void;
  loading: boolean;
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={loading}
    className="bg-white rounded-2xl p-4 items-center flex-1 border border-gray-100"
    style={{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    }}
  >
    {loading ? (
      <ActivityIndicator size="small" color="#F59E0B" />
    ) : (
      <Text style={{ fontSize: 36 }}>{emoji}</Text>
    )}
    <Text className="text-gray-700 font-medium mt-2">{label}</Text>
  </TouchableOpacity>
);

const TodaySummary = ({ walks, activities }: { walks: Walk[]; activities: ActivityLog[] }) => {
  const totalWalkDistance = walks.reduce((sum, w) => sum + (w.distance_meters || 0), 0);
  const totalWalkDuration = walks.reduce((sum, w) => sum + (w.duration_seconds || 0), 0);
  const pooCount = activities.filter((a) => a.activity_type === 'poo').length;
  const peeCount = activities.filter((a) => a.activity_type === 'pee').length;
  const foodCount = activities.filter((a) => a.activity_type === 'food').length;

  return (
    <View className="bg-white rounded-2xl p-4 mb-4">
      <Text className="text-gray-500 font-medium text-sm mb-3">TODAY'S SUMMARY</Text>
      <View className="flex-row justify-around">
        <View className="items-center">
          <Text className="text-2xl font-bold text-amber-600">{walks.length}</Text>
          <Text className="text-gray-500 text-xs">Walks</Text>
        </View>
        <View className="items-center">
          <Text className="text-2xl font-bold text-amber-600">{formatDistance(totalWalkDistance)}</Text>
          <Text className="text-gray-500 text-xs">Distance</Text>
        </View>
        <View className="items-center">
          <Text className="text-2xl font-bold text-amber-600">{pooCount + peeCount}</Text>
          <Text className="text-gray-500 text-xs">Potty</Text>
        </View>
        <View className="items-center">
          <Text className="text-2xl font-bold text-amber-600">{foodCount}</Text>
          <Text className="text-gray-500 text-xs">Meals</Text>
        </View>
      </View>
    </View>
  );
};

export default function TrackingDashboardScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { selectedPet, pets } = usePets();
  const [todayWalks, setTodayWalks] = useState<Walk[]>([]);
  const [todayActivities, setTodayActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggingActivity, setLoggingActivity] = useState<string | null>(null);

  const fetchTodayData = useCallback(async () => {
    if (!selectedPet) {
      setTodayWalks([]);
      setTodayActivities([]);
      setLoading(false);
      return;
    }

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [walksResponse, activitiesResponse] = await Promise.all([
        supabase
          .from('walks')
          .select('*')
          .eq('pet_id', selectedPet.id)
          .gte('started_at', today.toISOString())
          .order('started_at', { ascending: false }),
        supabase
          .from('activity_logs')
          .select('*')
          .eq('pet_id', selectedPet.id)
          .gte('logged_at', today.toISOString())
          .order('logged_at', { ascending: false }),
      ]);

      setTodayWalks(walksResponse.data || []);
      setTodayActivities(activitiesResponse.data || []);
    } catch (error) {
      console.error('Error fetching today data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedPet]);

  useFocusEffect(
    useCallback(() => {
      fetchTodayData();
    }, [fetchTodayData])
  );

  const handleQuickLog = async (activityType: 'poo' | 'pee' | 'food' | 'water') => {
    if (!selectedPet) return;

    setLoggingActivity(activityType);

    try {
      const { error } = await supabase.from('activity_logs').insert({
        pet_id: selectedPet.id,
        activity_type: activityType,
        logged_at: new Date().toISOString(),
      });

      if (error) throw error;

      trackEvent('activity_logged', { type: activityType });
      fetchTodayData();

      // Show quick feedback
      const emojis: Record<string, string> = {
        poo: '💩',
        pee: '💧',
        food: '🍖',
        water: '🥤',
      };
      Alert.alert('Logged!', `${emojis[activityType]} ${activityType} logged for ${selectedPet.name}`);
    } catch (error) {
      console.error('Error logging activity:', error);
      Alert.alert('Error', 'Failed to log activity. Please try again.');
    } finally {
      setLoggingActivity(null);
    }
  };

  const handleStartWalk = () => {
    if (selectedPet) {
      navigation.navigate('WalkTracker', { petId: selectedPet.id });
    }
  };

  const handleViewLog = () => {
    navigation.navigate('ActivityLog');
  };

  if (pets.length === 0) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center px-6">
        <Text style={{ fontSize: 64 }}>📍</Text>
        <Text className="text-xl font-bold text-gray-900 mt-4 text-center">
          Add a pet first
        </Text>
        <Text className="text-gray-500 mt-2 text-center">
          You need to add a pet before you can track activities.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Pet Selector */}
      <View className="bg-amber-500 px-4 py-3">
        <PetSelector />
      </View>

      <View className="p-4">
        {/* Today's Summary */}
        {!loading && (
          <TodaySummary walks={todayWalks} activities={todayActivities} />
        )}

        {/* Walk Button */}
        <TouchableOpacity
          onPress={handleStartWalk}
          className="bg-amber-500 rounded-2xl p-6 mb-4 items-center"
          style={{
            shadowColor: '#F59E0B',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <Text style={{ fontSize: 48 }}>🚶</Text>
          <Text className="text-white text-xl font-bold mt-2">Start Walk</Text>
          <Text className="text-amber-100 text-sm">Track distance and time with GPS</Text>
        </TouchableOpacity>

        {/* Quick Log Buttons */}
        <Text className="text-gray-500 font-medium text-sm mb-3">QUICK LOG</Text>
        <View className="flex-row gap-3 mb-4">
          <QuickLogButton
            emoji="💩"
            label="Poo"
            onPress={() => handleQuickLog('poo')}
            loading={loggingActivity === 'poo'}
          />
          <QuickLogButton
            emoji="💧"
            label="Pee"
            onPress={() => handleQuickLog('pee')}
            loading={loggingActivity === 'pee'}
          />
          <QuickLogButton
            emoji="🍖"
            label="Food"
            onPress={() => handleQuickLog('food')}
            loading={loggingActivity === 'food'}
          />
          <QuickLogButton
            emoji="🥤"
            label="Water"
            onPress={() => handleQuickLog('water')}
            loading={loggingActivity === 'water'}
          />
        </View>

        {/* View All Button */}
        <TouchableOpacity
          onPress={handleViewLog}
          className="bg-white rounded-xl py-3 items-center border border-gray-200"
        >
          <Text className="text-gray-700 font-semibold">View Activity Log</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
