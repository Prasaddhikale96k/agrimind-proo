/**
 * Quick Diagnostic Script for Cattle Tables
 * 
 * HOW TO USE:
 * 1. Open your Supabase Dashboard: https://app.supabase.com
 * 2. Select your project
 * 3. Go to SQL Editor (left sidebar)
 * 4. Paste this entire script
 * 5. Click "Run"
 * 
 * This will check if all required tables exist and create them if they don't.
 */

-- ========================================
-- DIAGNOSTIC: Check which tables exist
-- ========================================

SELECT 
  'cattle' as table_name,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cattle') as exists
UNION ALL SELECT 'milk_production', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'milk_production')
UNION ALL SELECT 'health_records', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'health_records')
UNION ALL SELECT 'breeding_records', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'breeding_records')
UNION ALL SELECT 'cattle_feed_expenses', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cattle_feed_expenses')
UNION ALL SELECT 'cattle_tasks', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cattle_tasks');

-- If any table shows "false" in the "exists" column, run the CREATE TABLE statements below:

-- ========================================
-- CREATE MISSING TABLES (if any)
-- ========================================

-- TABLE 1: cattle
CREATE TABLE IF NOT EXISTS cattle (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL,
  name TEXT NOT NULL,
  breed TEXT NOT NULL,
  date_of_birth DATE,
  age_display TEXT,
  gender TEXT CHECK (gender IN ('Female', 'Male')),
  category TEXT CHECK (category IN ('Milking', 'Pregnant', 'Dry', 'Calf', 'Bull', 'Sick')),
  health_status TEXT CHECK (health_status IN ('Good', 'Attention', 'Sick', 'Under Treatment', 'Normal')) DEFAULT 'Good',
  weight_kg DECIMAL(6,2),
  breed_type TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tag_id)
);

-- TABLE 2: milk_production
CREATE TABLE IF NOT EXISTS milk_production (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cattle_id UUID REFERENCES cattle(id) ON DELETE CASCADE,
  tag_id TEXT,
  date DATE NOT NULL,
  morning_yield DECIMAL(5,2) DEFAULT 0,
  evening_yield DECIMAL(5,2) DEFAULT 0,
  total_yield DECIMAL(5,2) GENERATED ALWAYS AS (morning_yield + evening_yield) STORED,
  milk_price_per_litre DECIMAL(6,2) DEFAULT 35,
  total_income DECIMAL(10,2) GENERATED ALWAYS AS ((morning_yield + evening_yield) * milk_price_per_litre) STORED,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 3: health_records
CREATE TABLE IF NOT EXISTS health_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cattle_id UUID REFERENCES cattle(id) ON DELETE CASCADE,
  tag_id TEXT,
  animal_name TEXT,
  record_type TEXT CHECK (record_type IN ('Vaccination', 'Treatment', 'Deworming', 'Checkup', 'Surgery', 'Other')),
  vaccine_or_treatment TEXT NOT NULL,
  date_given DATE NOT NULL,
  next_due_date DATE,
  administered_by TEXT,
  cost DECIMAL(8,2) DEFAULT 0,
  status TEXT CHECK (status IN ('Done', 'Due Soon', 'Overdue', 'Scheduled')) DEFAULT 'Done',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 4: breeding_records
CREATE TABLE IF NOT EXISTS breeding_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cattle_id UUID REFERENCES cattle(id) ON DELETE CASCADE,
  tag_id TEXT,
  animal_name TEXT,
  breeding_date DATE NOT NULL,
  breeding_type TEXT CHECK (breeding_type IN ('Natural', 'Artificial Insemination')),
  bull_or_semen_id TEXT,
  pregnancy_confirmed BOOLEAN DEFAULT false,
  expected_calving_date DATE,
  actual_calving_date DATE,
  calving_status TEXT CHECK (calving_status IN ('Pending', 'Successful', 'Failed', 'Aborted')) DEFAULT 'Pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 5: cattle_feed_expenses
CREATE TABLE IF NOT EXISTS cattle_feed_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  feed_type TEXT NOT NULL,
  quantity_kg DECIMAL(8,2),
  cost_per_kg DECIMAL(6,2),
  total_cost DECIMAL(10,2) NOT NULL,
  supplier TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 6: cattle_tasks
CREATE TABLE IF NOT EXISTS cattle_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  task_type TEXT CHECK (task_type IN ('Vaccination', 'Calving', 'Deworming', 'Vet Checkup', 'Breeding', 'Other')),
  title TEXT NOT NULL,
  description TEXT,
  related_animals TEXT,
  due_date DATE NOT NULL,
  priority TEXT CHECK (priority IN ('High', 'Medium', 'Low')) DEFAULT 'Medium',
  status TEXT CHECK (status IN ('Pending', 'Completed', 'Overdue')) DEFAULT 'Pending',
  color_dot TEXT DEFAULT 'red',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- ENABLE ROW LEVEL SECURITY
-- ========================================
ALTER TABLE cattle ENABLE ROW LEVEL SECURITY;
ALTER TABLE milk_production ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE breeding_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE cattle_feed_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cattle_tasks ENABLE ROW LEVEL SECURITY;

-- ========================================
-- RLS POLICIES
-- ========================================

-- Cattle policies
DROP POLICY IF EXISTS "Users can view own cattle" ON cattle;
DROP POLICY IF EXISTS "Users can insert own cattle" ON cattle;
DROP POLICY IF EXISTS "Users can update own cattle" ON cattle;
DROP POLICY IF EXISTS "Users can delete own cattle" ON cattle;

CREATE POLICY "Users can view own cattle" ON cattle FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cattle" ON cattle FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cattle" ON cattle FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cattle" ON cattle FOR DELETE USING (auth.uid() = user_id);

-- Milk production policies
DROP POLICY IF EXISTS "Users can view own milk records" ON milk_production;
DROP POLICY IF EXISTS "Users can insert own milk records" ON milk_production;
DROP POLICY IF EXISTS "Users can update own milk records" ON milk_production;
DROP POLICY IF EXISTS "Users can delete own milk records" ON milk_production;

CREATE POLICY "Users can view own milk records" ON milk_production FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own milk records" ON milk_production FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own milk records" ON milk_production FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own milk records" ON milk_production FOR DELETE USING (auth.uid() = user_id);

-- Health records policies
DROP POLICY IF EXISTS "Users can view own health records" ON health_records;
DROP POLICY IF EXISTS "Users can insert own health records" ON health_records;
DROP POLICY IF EXISTS "Users can update own health records" ON health_records;
DROP POLICY IF EXISTS "Users can delete own health records" ON health_records;

CREATE POLICY "Users can view own health records" ON health_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own health records" ON health_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own health records" ON health_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own health records" ON health_records FOR DELETE USING (auth.uid() = user_id);

-- Breeding records policies
DROP POLICY IF EXISTS "Users can view own breeding records" ON breeding_records;
DROP POLICY IF EXISTS "Users can insert own breeding records" ON breeding_records;
DROP POLICY IF EXISTS "Users can update own breeding records" ON breeding_records;
DROP POLICY IF EXISTS "Users can delete own breeding records" ON breeding_records;

CREATE POLICY "Users can view own breeding records" ON breeding_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own breeding records" ON breeding_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own breeding records" ON breeding_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own breeding records" ON breeding_records FOR DELETE USING (auth.uid() = user_id);

-- Feed expenses policies
DROP POLICY IF EXISTS "Users can view own feed expenses" ON cattle_feed_expenses;
DROP POLICY IF EXISTS "Users can insert own feed expenses" ON cattle_feed_expenses;
DROP POLICY IF EXISTS "Users can update own feed expenses" ON cattle_feed_expenses;
DROP POLICY IF EXISTS "Users can delete own feed expenses" ON cattle_feed_expenses;

CREATE POLICY "Users can view own feed expenses" ON cattle_feed_expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own feed expenses" ON cattle_feed_expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own feed expenses" ON cattle_feed_expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own feed expenses" ON cattle_feed_expenses FOR DELETE USING (auth.uid() = user_id);

-- Tasks policies
DROP POLICY IF EXISTS "Users can view own tasks" ON cattle_tasks;
DROP POLICY IF EXISTS "Users can insert own tasks" ON cattle_tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON cattle_tasks;
DROP POLICY IF EXISTS "Users can delete own tasks" ON cattle_tasks;

CREATE POLICY "Users can view own tasks" ON cattle_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON cattle_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON cattle_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON cattle_tasks FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- INDEXES
-- ========================================
CREATE INDEX IF NOT EXISTS idx_cattle_user_id ON cattle(user_id);
CREATE INDEX IF NOT EXISTS idx_cattle_user_active ON cattle(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_milk_user_date ON milk_production(user_id, date);
CREATE INDEX IF NOT EXISTS idx_health_user_date ON health_records(user_id, date_given);
CREATE INDEX IF NOT EXISTS idx_breeding_user_date ON breeding_records(user_id, breeding_date);
CREATE INDEX IF NOT EXISTS idx_feed_user_date ON cattle_feed_expenses(user_id, date);
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON cattle_tasks(user_id, status, due_date);

-- ========================================
-- ENABLE REALTIME
-- ========================================
-- Note: You may also need to enable this in Supabase Dashboard > Database > Replication
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE cattle;
  ALTER PUBLICATION supabase_realtime ADD TABLE milk_production;
  ALTER PUBLICATION supabase_realtime ADD TABLE health_records;
  ALTER PUBLICATION supabase_realtime ADD TABLE breeding_records;
  ALTER PUBLICATION supabase_realtime ADD TABLE cattle_feed_expenses;
  ALTER PUBLICATION supabase_realtime ADD TABLE cattle_tasks;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN OTHERS THEN NULL;
END $$;

-- ========================================
-- VERIFICATION: Confirm all tables exist
-- ========================================
SELECT 
  table_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = t.table_name) 
    THEN '✅ EXISTS' 
    ELSE '❌ MISSING' 
  END as status
FROM (VALUES ('cattle'), ('milk_production'), ('health_records'), 
             ('breeding_records'), ('cattle_feed_expenses'), ('cattle_tasks')) as t(table_name);
