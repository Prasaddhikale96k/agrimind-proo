-- ═══════════════════════════════════════════════════════════════════
-- AgriMind Pro - Multiple Plots Support Migration
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

-- 1. Ensure farms table has proper columns for plot tracking
ALTER TABLE farms ADD COLUMN IF NOT EXISTS plot_name TEXT;
ALTER TABLE farms ADD COLUMN IF NOT EXISTS area_size DECIMAL(10,2);
ALTER TABLE farms ADD COLUMN IF NOT EXISTS soil_type TEXT;
ALTER TABLE farms ADD COLUMN IF NOT EXISTS water_source TEXT;
ALTER TABLE farms ADD COLUMN IF NOT EXISTS terrain TEXT;
ALTER TABLE farms ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 2. Add plot_index to track multiple plots
ALTER TABLE farms ADD COLUMN IF NOT EXISTS plot_index INTEGER DEFAULT 0;

-- 3. Update existing farms to have plot_name from name column if empty
UPDATE farms 
SET plot_name = name 
WHERE plot_name IS NULL OR plot_name = '';

-- 4. Create index for faster plot queries
CREATE INDEX IF NOT EXISTS idx_farms_user_active ON farms(user_id, is_active) WHERE is_active = true;

-- 5. Seed sample data for development (optional)
-- INSERT INTO farms (user_id, name, plot_id, plot_name, area_sqm, area_acres, soil_type, water_source, location_lat, location_lng)
-- VALUES 
--   (gen_random_uuid(), 'Main Farm', 'PL-001', 'North Field', 20000, 4.94, 'Clay loam', 'Well', 20.0059, 73.7898),
--   (gen_random_uuid(), 'Secondary Plot', 'PL-002', 'South Orchard', 12000, 2.96, 'Sandy', 'Canal', 20.0030, 73.7910);

-- Verify structure
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('profiles', 'farms', 'crops')
ORDER BY table_name, ordinal_position;