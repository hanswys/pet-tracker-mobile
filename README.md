# Pet Care & Tracking App

A mobile SaaS application built with React Native (Expo) for fast deployment and iteration.

## 🚀 Tech Stack

- **Mobile Framework**: React Native (Expo)
- **Backend & DB**: Supabase (PostgreSQL, Auth, Realtime)
- **Styling**: NativeWind (Tailwind CSS)
- **Mobile DevOps**: EAS (Expo Application Services)
- **Payments**: RevenueCat
- **Analytics**: PostHog
- **Error Tracking**: Sentry
- **Push Notifications**: OneSignal
- **Email**: Resend (backend integration)

## 📋 Prerequisites

- Node.js 18+ and npm
- Expo CLI
- EAS CLI (for builds)
- Supabase account
- Accounts for RevenueCat, PostHog, Sentry, OneSignal (optional for development)

## 🛠️ Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Create a `.env` file in the root directory with the following variables:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   EXPO_PUBLIC_REVENUECAT_API_KEY=your_revenuecat_api_key
   EXPO_PUBLIC_POSTHOG_API_KEY=your_posthog_api_key
   EXPO_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
   EXPO_PUBLIC_SENTRY_DSN=your_sentry_dsn
   EXPO_PUBLIC_ONESIGNAL_APP_ID=your_onesignal_app_id
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Run on iOS/Android:**
   ```bash
   npm run ios
   # or
   npm run android
   ```

## 📁 Project Structure

```
pet-system/
├── src/
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React contexts (Auth, etc.)
│   ├── lib/           # Core utilities (Supabase client, config)
│   ├── screens/       # Screen components
│   ├── services/      # Service integrations (Analytics, Payments, etc.)
│   └── types/         # TypeScript type definitions
├── App.tsx            # Main app component
├── app.json           # Expo configuration
├── eas.json           # EAS build configuration
└── tailwind.config.js # Tailwind CSS configuration
```

## 🔐 Authentication

The app uses Supabase Authentication for user management. The authentication flow is handled in `src/contexts/AuthContext.tsx`.

## 🎨 Styling

This project uses NativeWind (Tailwind CSS for React Native). Use Tailwind utility classes directly in your components:

```tsx
<View className="flex-1 bg-white items-center justify-center">
  <Text className="text-2xl font-bold text-gray-900">Hello World</Text>
</View>
```

## 🏗️ Building & Deployment

### Development Build
```bash
eas build --profile development --platform ios
```

### Production Build
```bash
eas build --profile production --platform all
```

### Submit to App Stores
```bash
eas submit --platform ios
eas submit --platform android
```

## 📱 Service Integrations

### Supabase
- Database: PostgreSQL with real-time subscriptions
- Authentication: Email/password, OAuth providers
- Storage: File uploads and management

### RevenueCat
- In-app purchases and subscriptions
- Cross-platform subscription management

### PostHog
- Product analytics
- Session replay
- Feature flags

### Sentry
- Error tracking and crash reporting
- Performance monitoring

### OneSignal
- Push notifications
- User segmentation

## 🔄 Over-The-Air (OTA) Updates

Use Expo's OTA update capability to push updates without app store approval:

```bash
eas update --branch production --message "Bug fixes"
```

## 📝 License

Private - All rights reserved

