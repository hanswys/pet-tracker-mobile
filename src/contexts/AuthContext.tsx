import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { initAnalytics, identifyUser, resetAnalytics } from '../services/analytics';
import { setErrorTrackingUser, clearErrorTrackingUser } from '../services/error-tracking';
import { initPayments, logoutPayments } from '../services/payments';
import { initPushNotifications } from '../services/push-notifications';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (session?.user) {
        initializeServices(session.user.id, session.user.email);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        initializeServices(session.user.id, session.user.email);
      } else {
        cleanupServices();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const initializeServices = async (userId: string, email?: string) => {
    try {
      // Initialize analytics
      await initAnalytics(userId);
      identifyUser(userId, { email });

      // Initialize error tracking
      setErrorTrackingUser(userId, email);

      // Initialize payments
      await initPayments(userId);

      // Initialize push notifications
      await initPushNotifications(userId);
    } catch (error) {
      console.error('Failed to initialize services:', error);
    }
  };

  const cleanupServices = () => {
    resetAnalytics();
    clearErrorTrackingUser();
    logoutPayments();
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
  };

  const signOut = async () => {
    cleanupServices();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

