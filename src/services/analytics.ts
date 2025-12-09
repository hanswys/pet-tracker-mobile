import PostHog from 'posthog-react-native';
import { config } from '../lib/config';

let posthogInitialized = false;

/**
 * Initialize PostHog analytics
 */
export const initAnalytics = async (userId?: string) => {
  if (posthogInitialized || !config.posthog.apiKey) {
    return;
  }

  try {
    await PostHog.initAsync(config.posthog.apiKey, {
      host: config.posthog.host,
      errorTracking: {
        autocapture: {
          uncaughtExceptions: true,
          unhandledRejections: true,
          console: ['error', 'warn'],
        },
      },
    });

    if (userId) {
      PostHog.identify(userId);
    }

    posthogInitialized = true;
  } catch (error) {
    console.error('Failed to initialize PostHog:', error);
  }
};

/**
 * Track an event
 */
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (posthogInitialized) {
    PostHog.capture(eventName, properties);
  }
};

/**
 * Identify a user
 */
export const identifyUser = (userId: string, properties?: Record<string, any>) => {
  if (posthogInitialized) {
    PostHog.identify(userId, properties);
  }
};

/**
 * Reset user (on logout)
 */
export const resetAnalytics = () => {
  if (posthogInitialized) {
    PostHog.reset();
  }
};

