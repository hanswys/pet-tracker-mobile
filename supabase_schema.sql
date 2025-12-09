-- Pet Tracker MVP Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Pets table
CREATE TABLE IF NOT EXISTS pets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT NOT NULL CHECK (species IN ('dog', 'cat')),
  breed TEXT,
  birthdate DATE,
  weight DECIMAL(5, 2),
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Health records table (vaccinations, medications)
CREATE TABLE IF NOT EXISTS health_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  record_type TEXT NOT NULL CHECK (record_type IN ('vaccination', 'medication')),
  title TEXT NOT NULL,
  description TEXT,
  record_date DATE NOT NULL,
  next_due_date DATE,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_days INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  location TEXT,
  reminder_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Walks table (GPS tracked walks)
CREATE TABLE IF NOT EXISTS walks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  distance_meters DECIMAL(10, 2),
  duration_seconds INTEGER,
  route_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity logs table (potty, food events)
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('poo', 'pee', 'food', 'water')),
  notes TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE walks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Pets: Users can only access their own pets
CREATE POLICY "Users can view own pets" ON pets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own pets" ON pets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pets" ON pets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pets" ON pets
  FOR DELETE USING (auth.uid() = user_id);

-- Health records: Access through pet ownership
CREATE POLICY "Users can view own pet health records" ON health_records
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = health_records.pet_id AND pets.user_id = auth.uid())
  );

CREATE POLICY "Users can create own pet health records" ON health_records
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = health_records.pet_id AND pets.user_id = auth.uid())
  );

CREATE POLICY "Users can update own pet health records" ON health_records
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = health_records.pet_id AND pets.user_id = auth.uid())
  );

CREATE POLICY "Users can delete own pet health records" ON health_records
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = health_records.pet_id AND pets.user_id = auth.uid())
  );

-- Appointments: Access through pet ownership
CREATE POLICY "Users can view own pet appointments" ON appointments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = appointments.pet_id AND pets.user_id = auth.uid())
  );

CREATE POLICY "Users can create own pet appointments" ON appointments
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = appointments.pet_id AND pets.user_id = auth.uid())
  );

CREATE POLICY "Users can update own pet appointments" ON appointments
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = appointments.pet_id AND pets.user_id = auth.uid())
  );

CREATE POLICY "Users can delete own pet appointments" ON appointments
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = appointments.pet_id AND pets.user_id = auth.uid())
  );

-- Walks: Access through pet ownership
CREATE POLICY "Users can view own pet walks" ON walks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = walks.pet_id AND pets.user_id = auth.uid())
  );

CREATE POLICY "Users can create own pet walks" ON walks
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = walks.pet_id AND pets.user_id = auth.uid())
  );

CREATE POLICY "Users can update own pet walks" ON walks
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = walks.pet_id AND pets.user_id = auth.uid())
  );

CREATE POLICY "Users can delete own pet walks" ON walks
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = walks.pet_id AND pets.user_id = auth.uid())
  );

-- Activity logs: Access through pet ownership
CREATE POLICY "Users can view own pet activity logs" ON activity_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = activity_logs.pet_id AND pets.user_id = auth.uid())
  );

CREATE POLICY "Users can create own pet activity logs" ON activity_logs
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = activity_logs.pet_id AND pets.user_id = auth.uid())
  );

CREATE POLICY "Users can delete own pet activity logs" ON activity_logs
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = activity_logs.pet_id AND pets.user_id = auth.uid())
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_pets_user_id ON pets(user_id);
CREATE INDEX IF NOT EXISTS idx_health_records_pet_id ON health_records(pet_id);
CREATE INDEX IF NOT EXISTS idx_appointments_pet_id ON appointments(pet_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_walks_pet_id ON walks(pet_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_pet_id ON activity_logs(pet_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_logged_at ON activity_logs(logged_at);
