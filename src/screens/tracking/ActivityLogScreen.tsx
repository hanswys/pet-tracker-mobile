import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { usePets } from '../../contexts/PetContext';
import { ActivityLog, Walk } from '../../types/database';
import PetSelector from '../../components/PetSelector';
import { formatDistance, formatDuration } from '../../services/location';

type LogEntry = {
  id: string;
  type: 'activity' | 'walk';
  timestamp: string;
  data: ActivityLog | Walk;
};

const ActivityLogItem = ({ activity }: { activity: ActivityLog }) => {
  const emojis: Record<string, string> = {
    poo: '💩',
    pee: '💧',
    food: '🍖',
    water: '🥤',
  };

  const labels: Record<string, string> = {
    poo: 'Bathroom (Poo)',
    pee: 'Bathroom (Pee)',
    food: 'Meal',
    water: 'Water',
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <View className="flex-row items-center py-3 border-b border-gray-100">
      <View className="w-10 h-10 rounded-full bg-amber-100 items-center justify-center mr-3">
        <Text style={{ fontSize: 20 }}>{emojis[activity.activity_type]}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-gray-900 font-medium">{labels[activity.activity_type]}</Text>
        {activity.notes && (
          <Text className="text-gray-500 text-sm">{activity.notes}</Text>
        )}
      </View>
      <Text className="text-gray-400 text-sm">{formatTime(activity.logged_at)}</Text>
    </View>
  );
};

const WalkLogItem = ({ walk }: { walk: Walk }) => {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const isComplete = !!walk.ended_at;

  return (
    <View className="flex-row items-center py-3 border-b border-gray-100">
      <View className="w-10 h-10 rounded-full bg-amber-100 items-center justify-center mr-3">
        <Text style={{ fontSize: 20 }}>🚶</Text>
      </View>
      <View className="flex-1">
        <Text className="text-gray-900 font-medium">Walk</Text>
        {isComplete ? (
          <Text className="text-gray-500 text-sm">
            {formatDistance(walk.distance_meters || 0)} • {formatDuration(walk.duration_seconds || 0)}
          </Text>
        ) : (
          <Text className="text-amber-500 text-sm">In progress...</Text>
        )}
      </View>
      <Text className="text-gray-400 text-sm">{formatTime(walk.started_at)}</Text>
    </View>
  );
};

const DayHeader = ({ date }: { date: string }) => {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (d.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View className="bg-gray-100 px-4 py-2">
      <Text className="text-gray-600 font-semibold text-sm">{formatDate(date)}</Text>
    </View>
  );
};

export default function ActivityLogScreen() {
  const { selectedPet, pets } = usePets();
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLogs = useCallback(async () => {
    if (!selectedPet) {
      setEntries([]);
      setLoading(false);
      return;
    }

    try {
      const [activitiesResponse, walksResponse] = await Promise.all([
        supabase
          .from('activity_logs')
          .select('*')
          .eq('pet_id', selectedPet.id)
          .order('logged_at', { ascending: false })
          .limit(100),
        supabase
          .from('walks')
          .select('*')
          .eq('pet_id', selectedPet.id)
          .order('started_at', { ascending: false })
          .limit(50),
      ]);

      // Combine and sort all entries
      const activityEntries: LogEntry[] = (activitiesResponse.data || []).map((a) => ({
        id: `activity-${a.id}`,
        type: 'activity' as const,
        timestamp: a.logged_at,
        data: a,
      }));

      const walkEntries: LogEntry[] = (walksResponse.data || []).map((w) => ({
        id: `walk-${w.id}`,
        type: 'walk' as const,
        timestamp: w.started_at,
        data: w,
      }));

      const allEntries = [...activityEntries, ...walkEntries].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setEntries(allEntries);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedPet]);

  useFocusEffect(
    useCallback(() => {
      fetchLogs();
    }, [fetchLogs])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLogs();
  };

  // Group entries by date
  const groupedEntries: { date: string; entries: LogEntry[] }[] = [];
  let currentDate = '';

  entries.forEach((entry) => {
    const date = new Date(entry.timestamp).toDateString();
    if (date !== currentDate) {
      currentDate = date;
      groupedEntries.push({ date: entry.timestamp, entries: [entry] });
    } else {
      groupedEntries[groupedEntries.length - 1].entries.push(entry);
    }
  });

  if (pets.length === 0) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center px-6">
        <Text style={{ fontSize: 64 }}>📋</Text>
        <Text className="text-xl font-bold text-gray-900 mt-4 text-center">
          Add a pet first
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Pet Selector */}
      <View className="bg-amber-500 px-4 py-3">
        <PetSelector />
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#F59E0B" />
        </View>
      ) : entries.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text style={{ fontSize: 48 }}>📋</Text>
          <Text className="text-lg font-semibold text-gray-900 mt-4 text-center">
            No activities yet
          </Text>
          <Text className="text-gray-500 mt-2 text-center">
            Start tracking walks and quick logs to see them here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={groupedEntries}
          keyExtractor={(item) => item.date}
          renderItem={({ item }) => (
            <View>
              <DayHeader date={item.date} />
              <View className="px-4">
                {item.entries.map((entry) =>
                  entry.type === 'activity' ? (
                    <ActivityLogItem key={entry.id} activity={entry.data as ActivityLog} />
                  ) : (
                    <WalkLogItem key={entry.id} walk={entry.data as Walk} />
                  )
                )}
              </View>
            </View>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}
    </View>
  );
}
