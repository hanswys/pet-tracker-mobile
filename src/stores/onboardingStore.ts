import { create } from 'zustand';
import { PetInsert, Species } from '../types/database';

export type EnergyLevel = 'low' | 'medium' | 'high';
export type Appetite = 'picky' | 'normal' | 'high';
export type OnboardingStep = 'welcome' | 'identity' | 'energy' | 'appetite' | 'analysis' | 'dashboard';

interface OnboardingState {
    // Guest Data
    petName: string;
    species: Species;
    breed: string;
    energyLevel: EnergyLevel;
    appetite: Appetite;

    // Flow State
    isGuest: boolean;
    currentStep: OnboardingStep;

    // Actions
    setPetName: (name: string) => void;
    setSpecies: (species: Species) => void;
    setBreed: (breed: string) => void;
    setEnergyLevel: (level: EnergyLevel) => void;
    setAppetite: (appetite: Appetite) => void;
    completeOnboarding: () => void;
    reset: () => void;

    // Computed
    getPerfectDaySchedule: () => ScheduleItem[];
}

export interface ScheduleItem {
    id: string;
    time: string;
    title: string;
    type: 'food' | 'walk' | 'health';
    isOverdue?: boolean;
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
    petName: '',
    species: 'dog',
    breed: '',
    energyLevel: 'medium',
    appetite: 'normal',

    isGuest: true,
    currentStep: 'welcome',

    setPetName: (name) => set({ petName: name }),
    setSpecies: (species) => set({ species }),
    setBreed: (breed) => set({ breed }),
    setEnergyLevel: (level) => set({ energyLevel: level }),
    setAppetite: (appetite) => set({ appetite }),

    completeOnboarding: () => set({ isGuest: false }),
    reset: () => set({
        petName: '',
        species: 'dog',
        breed: '',
        energyLevel: 'medium',
        appetite: 'normal',
        isGuest: true, // Keep as guest until signed up? Actually reset should clear data but maybe keep flow state?
        // Let's assume reset is called after successful signup to clear store
    }),

    getPerfectDaySchedule: () => {
        const { energyLevel, appetite, species } = get();
        const schedule: ScheduleItem[] = [];

        // 1. Breakfast (Appetite based)
        schedule.push({
            id: 'bfast',
            time: '08:00 AM',
            title: appetite === 'picky' ? 'Mix-in Breakfast Topper' : 'Breakfast Time',
            type: 'food',
        });

        // 2. Walk (Energy Level based)
        if (species === 'dog') {
            let duration = '30 mins';
            if (energyLevel === 'low') duration = '15 mins';
            if (energyLevel === 'high') duration = '60 mins';

            schedule.push({
                id: 'walk',
                time: '08:45 AM',
                title: `Morning Walk (${duration})`,
                type: 'walk',
            });
        } else {
            // Cat play time
            schedule.push({
                id: 'play',
                time: '09:00 AM',
                title: 'Laser Pointer Session',
                type: 'walk',
            });
        }

        // 3. Health (Fixed hook)
        schedule.push({
            id: 'prevention',
            time: 'Overdue',
            title: 'Flea & Tick Prevention',
            type: 'health',
            isOverdue: true,
        });

        return schedule;
    },
}));
