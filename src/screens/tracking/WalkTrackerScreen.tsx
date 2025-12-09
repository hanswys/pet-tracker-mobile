import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { TrackingStackParamList } from '../../navigation/types';
import { RoutePoint, WalkInsert, WalkUpdate } from '../../types/database';
import {
  startLocationTracking,
  stopLocationTracking,
  calculateTotalDistance,
  formatDistance,
  formatDuration,
  requestLocationPermissions,
} from '../../services/location';
import { trackEvent } from '../../services/analytics';
import * as Location from 'expo-location';

type RouteProps = RouteProp<TrackingStackParamList, 'WalkTracker'>;

type WalkState = 'idle' | 'preparing' | 'tracking' | 'saving';

export default function WalkTrackerScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const { petId } = route.params;

  const [walkState, setWalkState] = useState<WalkState>('idle');
  const [walkId, setWalkId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const [currentDistance, setCurrentDistance] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer effect
  useEffect(() => {
    if (walkState === 'tracking' && startTime) {
      timerRef.current = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        setElapsedSeconds(elapsed);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [walkState, startTime]);

  // Update distance when route changes
  useEffect(() => {
    if (routePoints.length > 1) {
      setCurrentDistance(calculateTotalDistance(routePoints));
    }
  }, [routePoints]);

  const handleLocationUpdate = (location: Location.LocationObject) => {
    const point: RoutePoint = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      timestamp: location.timestamp,
    };
    setRoutePoints((prev) => [...prev, point]);
  };

  const handleStartWalk = async () => {
    setWalkState('preparing');

    try {
      // Request permissions
      const hasPermission = await requestLocationPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Location Permission Required',
          'Please enable location permissions to track your walk.',
          [{ text: 'OK' }]
        );
        setWalkState('idle');
        return;
      }

      // Start tracking
      const started = await startLocationTracking(handleLocationUpdate);
      if (!started) {
        throw new Error('Failed to start location tracking');
      }

      // Create walk record in database
      const now = new Date();
      const walkData: WalkInsert = {
        pet_id: petId,
        started_at: now.toISOString(),
      };

      const { data, error } = await supabase
        .from('walks')
        .insert(walkData)
        .select()
        .single();

      if (error) throw error;

      setWalkId(data.id);
      setStartTime(now);
      setWalkState('tracking');
      trackEvent('walk_started');
    } catch (error) {
      console.error('Error starting walk:', error);
      Alert.alert('Error', 'Failed to start walk. Please try again.');
      setWalkState('idle');
    }
  };

  const handleStopWalk = async () => {
    if (!walkId) return;

    setWalkState('saving');
    stopLocationTracking();

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    try {
      const walkUpdate: WalkUpdate = {
        ended_at: new Date().toISOString(),
        distance_meters: currentDistance,
        duration_seconds: elapsedSeconds,
        route_data: routePoints,
      };

      const { error } = await supabase
        .from('walks')
        .update(walkUpdate)
        .eq('id', walkId);

      if (error) throw error;

      trackEvent('walk_completed', {
        distance_meters: currentDistance,
        duration_seconds: elapsedSeconds,
      });

      Alert.alert(
        'Walk Complete! 🎉',
        `Great job! You walked ${formatDistance(currentDistance)} in ${formatDuration(elapsedSeconds)}.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error saving walk:', error);
      Alert.alert('Error', 'Failed to save walk. Please try again.');
      setWalkState('tracking');
    }
  };

  const handleCancel = () => {
    if (walkState === 'tracking') {
      Alert.alert(
        'Cancel Walk?',
        'Are you sure you want to cancel this walk? Your progress will be lost.',
        [
          { text: 'Keep Walking', style: 'cancel' },
          {
            text: 'Cancel Walk',
            style: 'destructive',
            onPress: async () => {
              stopLocationTracking();
              if (timerRef.current) {
                clearInterval(timerRef.current);
              }
              if (walkId) {
                await supabase.from('walks').delete().eq('id', walkId);
              }
              navigation.goBack();
            },
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <View className="flex-1 bg-gray-900">
      {/* Stats Display */}
      <View className="flex-1 items-center justify-center px-6">
        {/* Time */}
        <Text className="text-amber-400 text-sm font-medium mb-2">DURATION</Text>
        <Text className="text-white text-6xl font-bold mb-8">
          {formatDuration(elapsedSeconds)}
        </Text>

        {/* Distance */}
        <Text className="text-amber-400 text-sm font-medium mb-2">DISTANCE</Text>
        <Text className="text-white text-5xl font-bold mb-8">
          {formatDistance(currentDistance)}
        </Text>

        {/* Points Count */}
        {walkState === 'tracking' && (
          <View className="flex-row items-center mt-4">
            <View className="w-3 h-3 rounded-full bg-green-500 mr-2 animate-pulse" />
            <Text className="text-gray-400">
              GPS Active • {routePoints.length} points
            </Text>
          </View>
        )}
      </View>

      {/* Control Buttons */}
      <View className="px-6 pb-10">
        {walkState === 'idle' && (
          <TouchableOpacity
            onPress={handleStartWalk}
            className="bg-amber-500 rounded-2xl py-5 items-center"
          >
            <Text className="text-white text-xl font-bold">▶ Start Walk</Text>
          </TouchableOpacity>
        )}

        {walkState === 'preparing' && (
          <View className="bg-gray-700 rounded-2xl py-5 items-center">
            <ActivityIndicator color="#F59E0B" />
            <Text className="text-gray-400 mt-2">Getting GPS ready...</Text>
          </View>
        )}

        {walkState === 'tracking' && (
          <View className="flex-row gap-4">
            <TouchableOpacity
              onPress={handleCancel}
              className="flex-1 bg-gray-700 rounded-2xl py-5 items-center"
            >
              <Text className="text-gray-300 text-lg font-semibold">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleStopWalk}
              className="flex-1 bg-red-600 rounded-2xl py-5 items-center"
            >
              <Text className="text-white text-lg font-bold">⏹ Stop</Text>
            </TouchableOpacity>
          </View>
        )}

        {walkState === 'saving' && (
          <View className="bg-gray-700 rounded-2xl py-5 items-center">
            <ActivityIndicator color="#F59E0B" />
            <Text className="text-gray-400 mt-2">Saving walk...</Text>
          </View>
        )}
      </View>
    </View>
  );
}
