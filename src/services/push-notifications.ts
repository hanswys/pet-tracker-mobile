import { config } from '../lib/config';

let oneSignalInitialized = false;

/**
 * Initialize OneSignal push notifications
 * 
 * Note: OneSignal is configured via app.json plugin.
 * The OneSignal SDK will be available after the app is built with the plugin.
 * For additional configuration, refer to OneSignal's React Native documentation.
 */
export const initPushNotifications = async (userId?: string) => {
  if (oneSignalInitialized || !config.onesignal.appId) {
    return;
  }

  try {
    // OneSignal is configured via app.json plugin
    // The plugin automatically initializes OneSignal with the app ID from environment variables
    // Additional initialization can be done here using the OneSignal SDK if needed
    // Example: OneSignal.setExternalUserId(userId);
    
    if (userId) {
      // Set external user ID for OneSignal
      // This will be handled by the OneSignal SDK after plugin initialization
    }
    oneSignalInitialized = true;
  } catch (error) {
    console.error('Failed to initialize OneSignal:', error);
  }
};

/**
 * Request push notification permissions
 * 
 * OneSignal handles permission requests automatically via the plugin.
 * This function is a placeholder for custom permission handling if needed.
 */
export const requestPushPermissions = async (): Promise<boolean> => {
  // OneSignal handles permission requests automatically
  // This is a placeholder for custom permission handling if needed
  return true;
};

