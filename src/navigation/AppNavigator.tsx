import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';

import {
  PetsStackParamList,
  HealthStackParamList,
  TrackingStackParamList,
  SettingsStackParamList,
  MainTabParamList,
} from './types';

// Pet Screens
import PetListScreen from '../screens/pets/PetListScreen';
import AddPetScreen from '../screens/pets/AddPetScreen';
import PetDetailScreen from '../screens/pets/PetDetailScreen';

// Health Screens
import HealthDashboardScreen from '../screens/health/HealthDashboardScreen';
import AddHealthRecordScreen from '../screens/health/AddHealthRecordScreen';
import AppointmentListScreen from '../screens/health/AppointmentListScreen';
import AddAppointmentScreen from '../screens/health/AddAppointmentScreen';

// Tracking Screens
import TrackingDashboardScreen from '../screens/tracking/TrackingDashboardScreen';
import WalkTrackerScreen from '../screens/tracking/WalkTrackerScreen';
import ActivityLogScreen from '../screens/tracking/ActivityLogScreen';

// Settings Screens
import SettingsScreen from '../screens/settings/SettingsScreen';
import ChangeEmailScreen from '../screens/settings/ChangeEmailScreen';
import ChangePasswordScreen from '../screens/settings/ChangePasswordScreen';
import PremiumScreen from '../screens/settings/PremiumScreen';

const PetsStack = createNativeStackNavigator<PetsStackParamList>();
const HealthStack = createNativeStackNavigator<HealthStackParamList>();
const TrackingStack = createNativeStackNavigator<TrackingStackParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Tab icon component
const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => {
  const icons: Record<string, string> = {
    Pets: '🐾',
    Health: '💉',
    Track: '📍',
    Settings: '⚙️',
  };

  return (
    <View className="items-center justify-center">
      <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.5 }}>
        {icons[name] || '•'}
      </Text>
    </View>
  );
};

function PetsStackNavigator() {
  return (
    <PetsStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#6366F1' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <PetsStack.Screen
        name="PetList"
        component={PetListScreen}
        options={{ title: 'My Pets' }}
      />
      <PetsStack.Screen
        name="AddPet"
        component={AddPetScreen}
        options={{ title: 'Add Pet' }}
      />
      <PetsStack.Screen
        name="PetDetail"
        component={PetDetailScreen}
        options={{ title: 'Pet Details' }}
      />
    </PetsStack.Navigator>
  );
}

function HealthStackNavigator() {
  return (
    <HealthStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#10B981' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <HealthStack.Screen
        name="HealthDashboard"
        component={HealthDashboardScreen}
        options={{ title: 'Health Records' }}
      />
      <HealthStack.Screen
        name="AddHealthRecord"
        component={AddHealthRecordScreen}
        options={{ title: 'Add Record' }}
      />
      <HealthStack.Screen
        name="AppointmentList"
        component={AppointmentListScreen}
        options={{ title: 'Appointments' }}
      />
      <HealthStack.Screen
        name="AddAppointment"
        component={AddAppointmentScreen}
        options={{ title: 'Schedule Appointment' }}
      />
    </HealthStack.Navigator>
  );
}

function TrackingStackNavigator() {
  return (
    <TrackingStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#F59E0B' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <TrackingStack.Screen
        name="TrackingDashboard"
        component={TrackingDashboardScreen}
        options={{ title: 'Daily Tracking' }}
      />
      <TrackingStack.Screen
        name="WalkTracker"
        component={WalkTrackerScreen}
        options={{ title: 'Walk Tracker' }}
      />
      <TrackingStack.Screen
        name="ActivityLog"
        component={ActivityLogScreen}
        options={{ title: 'Activity Log' }}
      />
    </TrackingStack.Navigator>
  );
}

function SettingsStackNavigator() {
  return (
    <SettingsStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#6B7280' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <SettingsStack.Screen
        name="SettingsMain"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <SettingsStack.Screen
        name="ChangeEmail"
        component={ChangeEmailScreen}
        options={{ title: 'Change Email' }}
      />
      <SettingsStack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ title: 'Change Password' }}
      />
      <SettingsStack.Screen
        name="Premium"
        component={PremiumScreen}
        options={{ title: 'Premium Features' }}
      />
    </SettingsStack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
          tabBarActiveTintColor: '#6366F1',
          tabBarInactiveTintColor: '#9CA3AF',
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#E5E7EB',
            paddingTop: 8,
            paddingBottom: 8,
            height: 80,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
        })}
      >
        <Tab.Screen name="Pets" component={PetsStackNavigator} />
        <Tab.Screen name="Health" component={HealthStackNavigator} />
        <Tab.Screen name="Track" component={TrackingStackNavigator} />
        <Tab.Screen name="Settings" component={SettingsStackNavigator} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
