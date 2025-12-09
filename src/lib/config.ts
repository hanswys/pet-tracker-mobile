/**
 * Application configuration
 * All service API keys and configuration should be stored as environment variables
 */

export const config = {
  supabase: {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  revenueCat: {
    apiKey: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || '',
  },
  posthog: {
    apiKey: process.env.EXPO_PUBLIC_POSTHOG_API_KEY || '',
    host: process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
  },
  sentry: {
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN || '',
  },
  onesignal: {
    appId: process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID || '',
  },
  resend: {
    // Resend is backend-only, no client-side config needed
  },
} as const;

