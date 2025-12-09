# Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Create a `.env` file in the root directory (see `ENV_TEMPLATE.md` for details):

**Minimum required for basic functionality:**
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

**Optional (can be added later):**
- RevenueCat API key (for payments)
- PostHog API key (for analytics)
- Sentry DSN (for error tracking)
- OneSignal App ID (for push notifications)

### 3. Start Development Server
```bash
npm start
```

Then press:
- `i` for iOS simulator
- `a` for Android emulator
- `w` for web browser

### 4. Test Authentication
1. The app will show a login screen
2. Click "Sign Up" to create a new account
3. Check your email for verification (if email confirmation is enabled in Supabase)
4. Sign in with your credentials

## 📱 Project Structure Overview

```
src/
├── components/      # Reusable UI components (Button, etc.)
├── contexts/        # React contexts (AuthContext)
├── lib/            # Core utilities
│   ├── supabase.ts # Supabase client setup
│   └── config.ts   # App configuration
├── screens/        # Screen components
│   ├── LoginScreen.tsx
│   └── HomeScreen.tsx
├── services/       # Service integrations
│   ├── analytics.ts        # PostHog
│   ├── error-tracking.ts   # Sentry
│   ├── payments.ts         # RevenueCat
│   └── push-notifications.ts # OneSignal
└── types/          # TypeScript definitions
```

## 🎨 Using NativeWind (Tailwind CSS)

Simply use Tailwind classes in your components:

```tsx
<View className="flex-1 bg-white items-center justify-center">
  <Text className="text-2xl font-bold text-blue-600">Hello World</Text>
</View>
```

## 🔐 Authentication Flow

The app uses Supabase Authentication:
- Email/Password authentication is set up
- User session is managed automatically
- Services (Analytics, Payments, etc.) are initialized on login

## 🛠️ Next Steps

1. **Set up Supabase:**
   - Create a project at https://supabase.com
   - Configure authentication providers (if needed)
   - Set up your database schema

2. **Configure Services (Optional):**
   - Add RevenueCat for in-app purchases
   - Set up PostHog for analytics
   - Configure Sentry for error tracking
   - Set up OneSignal for push notifications

3. **Build Your App:**
   - Add your features in `src/screens/`
   - Create reusable components in `src/components/`
   - Use Supabase for backend operations

4. **Deploy:**
   - Run `eas build` to create production builds
   - Use `eas submit` to submit to app stores
   - Use `eas update` for OTA updates

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [NativeWind Documentation](https://www.nativewind.dev/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)

