import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Pet, PetInsert, PetUpdate } from '../types/database';
import { useAuth } from './AuthContext';
import { useSubscription } from './SubscriptionContext';
import { Alert } from 'react-native';

interface PetContextType {
  pets: Pet[];
  selectedPet: Pet | null;
  loading: boolean;
  selectPet: (pet: Pet | null) => void;
  refreshPets: () => Promise<void>;
  addPet: (pet: PetInsert) => Promise<Pet | null>;
  updatePet: (id: string, updates: PetUpdate) => Promise<boolean>;
  deletePet: (id: string) => Promise<boolean>;
  canAddMorePets: boolean;
}

const PetContext = createContext<PetContextType | undefined>(undefined);

export const PetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { petLimit } = useSubscription();

  const canAddMorePets = pets.length < petLimit;

  const refreshPets = useCallback(async () => {
    if (!user) {
      setPets([]);
      setSelectedPet(null);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPets(data || []);
      
      // Auto-select first pet if none selected
      if (data && data.length > 0 && !selectedPet) {
        setSelectedPet(data[0]);
      }
    } catch (error) {
      console.error('Error fetching pets:', error);
    } finally {
      setLoading(false);
    }
  }, [user, selectedPet]);

  useEffect(() => {
    refreshPets();
  }, [user]);

  const selectPet = (pet: Pet | null) => {
    setSelectedPet(pet);
  };

  const addPet = async (petData: PetInsert): Promise<Pet | null> => {
    if (!user) return null;

    if (!canAddMorePets) {
      Alert.alert(
        'Pet Limit Reached',
        'Upgrade to Pro to add unlimited pets!',
        [{ text: 'OK' }]
      );
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('pets')
        .insert({ ...petData, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      setPets((prev) => [data, ...prev]);
      if (!selectedPet) {
        setSelectedPet(data);
      }
      return data;
    } catch (error) {
      console.error('Error adding pet:', error);
      Alert.alert('Error', 'Failed to add pet. Please try again.');
      return null;
    }
  };

  const updatePet = async (id: string, updates: PetUpdate): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('pets')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setPets((prev) =>
        prev.map((pet) => (pet.id === id ? data : pet))
      );

      if (selectedPet?.id === id) {
        setSelectedPet(data);
      }

      return true;
    } catch (error) {
      console.error('Error updating pet:', error);
      Alert.alert('Error', 'Failed to update pet. Please try again.');
      return false;
    }
  };

  const deletePet = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('pets').delete().eq('id', id);

      if (error) throw error;

      setPets((prev) => prev.filter((pet) => pet.id !== id));

      if (selectedPet?.id === id) {
        const remaining = pets.filter((pet) => pet.id !== id);
        setSelectedPet(remaining.length > 0 ? remaining[0] : null);
      }

      return true;
    } catch (error) {
      console.error('Error deleting pet:', error);
      Alert.alert('Error', 'Failed to delete pet. Please try again.');
      return false;
    }
  };

  return (
    <PetContext.Provider
      value={{
        pets,
        selectedPet,
        loading,
        selectPet,
        refreshPets,
        addPet,
        updatePet,
        deletePet,
        canAddMorePets,
      }}
    >
      {children}
    </PetContext.Provider>
  );
};

export const usePets = () => {
  const context = useContext(PetContext);
  if (context === undefined) {
    throw new Error('usePets must be used within a PetProvider');
  }
  return context;
};
