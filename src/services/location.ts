import * as Location from 'expo-location';
import { RoutePoint } from '../types/database';

let locationSubscription: Location.LocationSubscription | null = null;

/**
 * Request location permissions
 */
export const requestLocationPermissions = async (): Promise<boolean> => {
    try {
        const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();

        if (foregroundStatus !== 'granted') {
            return false;
        }

        // Request background permissions for walk tracking
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();

        // Foreground is enough for our MVP
        return foregroundStatus === 'granted';
    } catch (error) {
        console.error('Error requesting location permissions:', error);
        return false;
    }
};

/**
 * Get current location
 */
export const getCurrentLocation = async (): Promise<Location.LocationObject | null> => {
    try {
        const hasPermission = await requestLocationPermissions();
        if (!hasPermission) return null;

        return await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
        });
    } catch (error) {
        console.error('Error getting current location:', error);
        return null;
    }
};

/**
 * Start tracking location for walk
 */
export const startLocationTracking = async (
    onLocationUpdate: (location: Location.LocationObject) => void
): Promise<boolean> => {
    try {
        const hasPermission = await requestLocationPermissions();
        if (!hasPermission) return false;

        locationSubscription = await Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.High,
                distanceInterval: 5, // Update every 5 meters
                timeInterval: 5000, // Or every 5 seconds
            },
            onLocationUpdate
        );

        return true;
    } catch (error) {
        console.error('Error starting location tracking:', error);
        return false;
    }
};

/**
 * Stop tracking location
 */
export const stopLocationTracking = () => {
    if (locationSubscription) {
        locationSubscription.remove();
        locationSubscription = null;
    }
};

/**
 * Calculate distance between two points in meters using Haversine formula
 */
export const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
};

/**
 * Calculate total distance from route points
 */
export const calculateTotalDistance = (routePoints: RoutePoint[]): number => {
    if (routePoints.length < 2) return 0;

    let totalDistance = 0;
    for (let i = 1; i < routePoints.length; i++) {
        totalDistance += calculateDistance(
            routePoints[i - 1].latitude,
            routePoints[i - 1].longitude,
            routePoints[i].latitude,
            routePoints[i].longitude
        );
    }

    return totalDistance;
};

/**
 * Format distance for display
 */
export const formatDistance = (meters: number): string => {
    if (meters < 1000) {
        return `${Math.round(meters)} m`;
    }
    const miles = meters / 1609.34;
    return `${miles.toFixed(2)} mi`;
};

/**
 * Format duration for display
 */
export const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
};
