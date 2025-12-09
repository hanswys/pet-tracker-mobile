# Environment Variables Template

Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# RevenueCat Configuration
EXPO_PUBLIC_REVENUECAT_API_KEY=your_revenuecat_api_key

# PostHog Configuration
EXPO_PUBLIC_POSTHOG_API_KEY=your_posthog_api_key
EXPO_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Sentry Configuration
EXPO_PUBLIC_SENTRY_DSN=your_sentry_dsn

# OneSignal Configuration
EXPO_PUBLIC_ONESIGNAL_APP_ID=your_onesignal_app_id
```

## Getting Your API Keys

### Supabase
1. Go to https://supabase.com
2. Create a new project
3. Go to Settings > API
4. Copy the Project URL and anon/public key

### RevenueCat
1. Go to https://www.revenuecat.com
2. Create an account and project
3. Go to Project Settings > API Keys
4. Copy the API key

### PostHog
1. Go to https://posthog.com
2. Create an account and project
3. Go to Project Settings > API Keys
4. Copy the Project API Key

### Sentry
1. Go to https://sentry.io
2. Create an account and project
3. Go to Settings > Projects > [Your Project] > Client Keys (DSN)
4. Copy the DSN

### OneSignal
1. Go to https://onesignal.com
2. Create an account and app
3. Go to Settings > Keys & IDs
4. Copy the App ID

