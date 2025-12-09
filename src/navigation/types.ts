import { NavigatorScreenParams } from '@react-navigation/native';
import { Pet, HealthRecord, Appointment } from '../types/database';

// Stack navigators for each tab
export type PetsStackParamList = {
    PetList: undefined;
    AddPet: undefined;
    PetDetail: { pet: Pet };
    EditPet: { pet: Pet };
};

export type HealthStackParamList = {
    HealthDashboard: undefined;
    AddHealthRecord: { petId: string };
    AppointmentList: undefined;
    AddAppointment: { petId: string };
};

export type TrackingStackParamList = {
    TrackingDashboard: undefined;
    WalkTracker: { petId: string };
    ActivityLog: undefined;
};

export type SettingsStackParamList = {
    SettingsMain: undefined;
    ChangeEmail: undefined;
    ChangePassword: undefined;
    Premium: undefined;
};

// Main tab navigator
export type MainTabParamList = {
    Pets: NavigatorScreenParams<PetsStackParamList>;
    Health: NavigatorScreenParams<HealthStackParamList>;
    Track: NavigatorScreenParams<TrackingStackParamList>;
    Settings: NavigatorScreenParams<SettingsStackParamList>;
};

// Root stack (for modals, etc.)
export type RootStackParamList = {
    Main: NavigatorScreenParams<MainTabParamList>;
    Login: undefined;
};

declare global {
    namespace ReactNavigation {
        interface RootParamList extends RootStackParamList { }
    }
}
