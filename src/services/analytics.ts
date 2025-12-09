import { PostHog } from 'posthog-react-native';
import { config } from '../lib/config';

let posthogClient: PostHog | null = null;

/**
 * Initialize PostHog analytics
 */
export const initAnalytics = async (userId?: string) => {
  if (posthogClient || !config.posthog.apiKey) {
    return;
  }

  try {
    posthogClient = new PostHog(config.posthog.apiKey, {
      host: config.posthog.host,
    });

    if (userId) {
      posthogClient.identify(userId);
    }
  } catch (error) {
    console.error('Failed to initialize PostHog:', error);
  }
};

/**
 * Track an event
 */
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (posthogClient) {
    posthogClient.capture(eventName, properties);
  }
};

/**
 * Identify a user
 */
export const identifyUser = (userId: string, properties?: Record<string, any>) => {
  if (posthogClient) {
    posthogClient.identify(userId, properties);
  }
};

/**
 * Reset user (on logout)
 */
export const resetAnalytics = () => {
  if (posthogClient) {
    posthogClient.reset();
  }
};

