import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCustomerInfo, getOfferings } from '../services/payments';
import { useAuth } from './AuthContext';

const FREE_PET_LIMIT = 2;
const PRO_PET_LIMIT = 100; // Effectively unlimited

interface SubscriptionContextType {
  isPro: boolean;
  petLimit: number;
  loading: boolean;
  offering: any | null;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPro, setIsPro] = useState(false);
  const [offering, setOffering] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const petLimit = isPro ? PRO_PET_LIMIT : FREE_PET_LIMIT;

  const refreshSubscription = useCallback(async () => {
    if (!user) {
      setIsPro(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Check subscription status
      const customerInfo = await getCustomerInfo();
      if (customerInfo) {
        // Check if user has active "pro" entitlement
        const proEntitlement = customerInfo.entitlements.active['pro'];
        setIsPro(!!proEntitlement);
      }

      // Get available offerings for paywall
      const currentOffering = await getOfferings();
      setOffering(currentOffering);
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshSubscription();
  }, [user]);

  return (
    <SubscriptionContext.Provider
      value={{
        isPro,
        petLimit,
        loading,
        offering,
        refreshSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
