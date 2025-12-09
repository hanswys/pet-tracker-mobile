/**
 * Database type definitions for Pet Tracker
 * These types match the Supabase schema
 */

export type Species = 'dog' | 'cat';
export type RecordType = 'vaccination' | 'medication';
export type ActivityType = 'poo' | 'pee' | 'food' | 'water';

export interface Pet {
    id: string;
    user_id: string;
    name: string;
    species: Species;
    breed: string | null;
    birthdate: string | null;
    weight: number | null;
    photo_url: string | null;
    created_at: string;
    updated_at: string;
}

export interface PetInsert {
    name: string;
    species: Species;
    breed?: string | null;
    birthdate?: string | null;
    weight?: number | null;
    photo_url?: string | null;
}

export interface PetUpdate {
    name?: string;
    species?: Species;
    breed?: string | null;
    birthdate?: string | null;
    weight?: number | null;
    photo_url?: string | null;
}

export interface HealthRecord {
    id: string;
    pet_id: string;
    record_type: RecordType;
    title: string;
    description: string | null;
    record_date: string;
    next_due_date: string | null;
    is_recurring: boolean;
    recurrence_days: number | null;
    created_at: string;
}

export interface HealthRecordInsert {
    pet_id: string;
    record_type: RecordType;
    title: string;
    description?: string | null;
    record_date: string;
    next_due_date?: string | null;
    is_recurring?: boolean;
    recurrence_days?: number | null;
}

export interface Appointment {
    id: string;
    pet_id: string;
    title: string;
    description: string | null;
    appointment_date: string;
    appointment_time: string;
    location: string | null;
    reminder_sent: boolean;
    created_at: string;
}

export interface AppointmentInsert {
    pet_id: string;
    title: string;
    description?: string | null;
    appointment_date: string;
    appointment_time: string;
    location?: string | null;
}

export interface Walk {
    id: string;
    pet_id: string;
    started_at: string;
    ended_at: string | null;
    distance_meters: number | null;
    duration_seconds: number | null;
    route_data: RoutePoint[] | null;
    created_at: string;
}

export interface RoutePoint {
    latitude: number;
    longitude: number;
    timestamp: number;
}

export interface WalkInsert {
    pet_id: string;
    started_at: string;
    ended_at?: string | null;
    distance_meters?: number | null;
    duration_seconds?: number | null;
    route_data?: RoutePoint[] | null;
}

export interface WalkUpdate {
    ended_at?: string | null;
    distance_meters?: number | null;
    duration_seconds?: number | null;
    route_data?: RoutePoint[] | null;
}

export interface ActivityLog {
    id: string;
    pet_id: string;
    activity_type: ActivityType;
    notes: string | null;
    logged_at: string;
    created_at: string;
}

export interface ActivityLogInsert {
    pet_id: string;
    activity_type: ActivityType;
    notes?: string | null;
    logged_at?: string;
}

// Supabase Database type helper
export interface Database {
    public: {
        Tables: {
            pets: {
                Row: Pet;
                Insert: PetInsert & { user_id: string };
                Update: PetUpdate;
            };
            health_records: {
                Row: HealthRecord;
                Insert: HealthRecordInsert;
                Update: Partial<HealthRecordInsert>;
            };
            appointments: {
                Row: Appointment;
                Insert: AppointmentInsert;
                Update: Partial<AppointmentInsert>;
            };
            walks: {
                Row: Walk;
                Insert: WalkInsert;
                Update: WalkUpdate;
            };
            activity_logs: {
                Row: ActivityLog;
                Insert: ActivityLogInsert;
                Update: Partial<ActivityLogInsert>;
            };
        };
    };
}
