import { NavigatorScreenParams } from '@react-navigation/native';
import { Pet, HealthRecord, Appointment } from '../types/database';

// Stack navigators for each tab
export type PetStackParamList = {
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

export type OnboardingStackParamList = {
    Welcome: undefined;
    QuizIdentity: undefined;
    QuizEnergy: undefined;
    QuizAppetite: undefined;
    Analysis: undefined;
    PerfectDay: undefined;
    Login: undefined;
};

// Main tab navigator
export type RootTabParamList = {
    Pets: NavigatorScreenParams<PetStackParamList>;
    Health: NavigatorScreenParams<HealthStackParamList>;
    Track: NavigatorScreenParams<TrackingStackParamList>;
    Settings: NavigatorScreenParams<SettingsStackParamList>;
};

// Root stack (for modals, etc.)
export type RootStackParamList = {
    Main: NavigatorScreenParams<RootTabParamList>;
    Login: undefined;
};

declare global {
    namespace ReactNavigation {
        interface RootParamList extends RootStackParamList { }
    }
}
