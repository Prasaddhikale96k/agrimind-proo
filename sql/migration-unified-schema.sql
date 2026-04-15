-- ═══════════════════════════════════════════════════════════════════
-- AgriMind Pro - Simplified Schema Migration
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════════════════════
-- 1. CREATE PROFILES TABLE (no FK constraint for flexibility)
-- ═══════════════════════════════════════════════════════════════════
DROP TABLE IF EXISTS profiles;

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  avatar_url TEXT,
  location TEXT,
  farming_experience TEXT,
  total_land DECIMAL(10,2),
  subscription_plan VARCHAR(20) DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- ═══════════════════════════════════════════════════════════════════
-- 2. MIGRATE DATA FROM farmers TABLE
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO profiles (id, full_name, email, phone, avatar_url, location, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  COALESCE(name, 'Farmer'),
  email,
  phone,
  avatar_url,
  location,
  COALESCE(created_at, NOW()),
  COALESCE(updated_at, NOW())
FROM farmers f
WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.email = f.email)
ON CONFLICT (email) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- 3. UPDATE farms TABLE - add user_id column
-- ═══════════════════════════════════════════════════════════════════
ALTER TABLE farms ADD COLUMN IF NOT EXISTS user_id UUID;

-- Update user_id from farmer_id if possible
UPDATE farms f
SET user_id = p.id
FROM profiles p
WHERE f.farmer_id = p.id
AND f.user_id IS NULL;

-- ═══════════════════════════════════════════════════════════════════
-- 4. CREATE FARM_METRICS TABLE
-- ═══════════════════════════════════════════════════════════════════
DROP TABLE IF EXISTS farm_metrics;

CREATE TABLE IF NOT EXISTS farm_metrics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID,
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
  soil_moisture DECIMAL(5,2) DEFAULT 42,
  soil_ph DECIMAL(4,2) DEFAULT 6.8,
  temperature DECIMAL(5,2) DEFAULT 32,
  humidity DECIMAL(5,2) DEFAULT 65,
  wind_speed DECIMAL(6,2) DEFAULT 3.2,
  sunlight_hours DECIMAL(4,1) DEFAULT 8.5,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════
-- 5. ADD user_id TO crops TABLE IF NEEDED
-- ═══════════════════════════════════════════════════════════════════
ALTER TABLE crops ADD COLUMN IF NOT EXISTS user_id UUID;

-- Link crops to user via farms
UPDATE crops c
SET user_id = f.user_id
FROM farms f
WHERE c.farm_id = f.id
AND c.user_id IS NULL
AND f.user_id IS NOT NULL;

-- ═══════════════════════════════════════════════════════════════════
-- 6. INDEXES
-- ═══════════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_farms_user_id ON farms(user_id);
CREATE INDEX IF NOT EXISTS idx_farms_plot_id ON farms(plot_id);
CREATE INDEX IF NOT EXISTS idx_crops_user_id ON crops(user_id);
CREATE INDEX IF NOT EXISTS idx_crops_farm_id ON crops(farm_id);
CREATE INDEX IF NOT EXISTS idx_crops_status ON crops(status);
CREATE INDEX IF NOT EXISTS idx_farm_metrics_user_id ON farm_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_farm_metrics_farm_id ON farm_metrics(farm_id);

-- ═══════════════════════════════════════════════════════════════════
-- 7. ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_metrics ENABLE ROW LEVEL SECURITY;

-- Simple RLS policies - allow authenticated users
DROP POLICY IF EXISTS "Anyone can read profiles" ON profiles;
CREATE POLICY "Anyone can read profiles" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own profiles" ON profiles;
CREATE POLICY "Users can insert own profiles" ON profiles 
  FOR INSERT WITH CHECK (auth.uid() = id OR auth.jwt()->>'email' = email);

DROP POLICY IF EXISTS "Users can update own profiles" ON profiles;
CREATE POLICY "Users can update own profiles" ON profiles 
  FOR UPDATE USING (auth.uid() = id OR auth.jwt()->>'email' = email);

-- Farms policies
DROP POLICY IF EXISTS "Anyone can read farms" ON farms;
CREATE POLICY "Anyone can read farms" ON farms FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage own farms" ON farms;
CREATE POLICY "Users can manage own farms" ON farms 
  FOR ALL USING (auth.uid() = user_id);

-- Crops policies
DROP POLICY IF EXISTS "Anyone can read crops" ON crops;
CREATE POLICY "Anyone can read crops" ON crops FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage own crops" ON crops;
CREATE POLICY "Users can manage own crops" ON crops 
  FOR ALL USING (auth.uid() = user_id);

-- Farm metrics policies
DROP POLICY IF EXISTS "Users can manage own metrics" ON farm_metrics;
CREATE POLICY "Users can manage own metrics" ON farm_metrics 
  FOR ALL USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════
-- 8. ENABLE REALTIME
-- ═══════════════════════════════════════════════════════════════════
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE farms;
ALTER PUBLICATION supabase_realtime ADD TABLE crops;
ALTER PUBLICATION supabase_realtime ADD TABLE farm_metrics;

-- ✅ Migration Complete!