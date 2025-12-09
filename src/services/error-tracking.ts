import * as Sentry from '@sentry/react-native';
import { config } from '../lib/config';

let sentryInitialized = false;

/**
 * Initialize Sentry error tracking
 */
export const initErrorTracking = () => {
  if (sentryInitialized || !config.sentry.dsn) {
    return;
  }

  try {
    Sentry.init({
      dsn: config.sentry.dsn,
      enableInExpoDevelopment: false, // Disable in development
      debug: __DEV__,
      tracesSampleRate: 1.0,
    });

    sentryInitialized = true;
  } catch (error) {
    console.error('Failed to initialize Sentry:', error);
  }
};

/**
 * Set user context for error tracking
 */
export const setErrorTrackingUser = (userId: string, email?: string) => {
  if (sentryInitialized) {
    Sentry.setUser({
      id: userId,
      email,
    });
  }
};

/**
 * Clear user context (on logout)
 */
export const clearErrorTrackingUser = () => {
  if (sentryInitialized) {
    Sentry.setUser(null);
  }
};

