import Purchases, { CustomerInfo, PurchasesOffering } from 'react-native-purchases';
import { Platform } from 'react-native';
import { config } from '../lib/config';

let revenueCatInitialized = false;

/**
 * Initialize RevenueCat
 */
export const initPayments = async (userId: string) => {
  if (revenueCatInitialized || !config.revenueCat.apiKey) {
    return;
  }

  try {
    await Purchases.configure({
      apiKey: config.revenueCat.apiKey,
    });

    await Purchases.logIn(userId);
    revenueCatInitialized = true;
  } catch (error) {
    console.error('Failed to initialize RevenueCat:', error);
  }
};

/**
 * Get available offerings
 */
export const getOfferings = async (): Promise<PurchasesOffering | null> => {
  if (!revenueCatInitialized) {
    return null;
  }

  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch (error) {
    console.error('Failed to get offerings:', error);
    return null;
  }
};

/**
 * Get customer info
 */
export const getCustomerInfo = async (): Promise<CustomerInfo | null> => {
  if (!revenueCatInitialized) {
    return null;
  }

  try {
    return await Purchases.getCustomerInfo();
  } catch (error) {
    console.error('Failed to get customer info:', error);
    return null;
  }
};

/**
 * Purchase a package
 */
export const purchasePackage = async (packageToPurchase: any) => {
  if (!revenueCatInitialized) {
    throw new Error('RevenueCat not initialized');
  }

  try {
    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
    return customerInfo;
  } catch (error) {
    console.error('Purchase failed:', error);
    throw error;
  }
};

/**
 * Restore purchases
 */
export const restorePurchases = async (): Promise<CustomerInfo> => {
  if (!revenueCatInitialized) {
    throw new Error('RevenueCat not initialized');
  }

  try {
    return await Purchases.restorePurchases();
  } catch (error) {
    console.error('Restore purchases failed:', error);
    throw error;
  }
};

/**
 * Logout from RevenueCat
 */
export const logoutPayments = async () => {
  if (revenueCatInitialized) {
    await Purchases.logOut();
  }
};

