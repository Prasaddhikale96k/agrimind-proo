-- ============================================
-- LIVESTOCK MANAGEMENT TABLES
-- All tables prefixed with "lm_" to avoid conflicts
-- ============================================

-- 1. MAIN LIVESTOCK TABLE
CREATE TABLE IF NOT EXISTS lm_livestock (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL 
    CHECK (type IN ('cow','buffalo','goat','sheep','pig','poultry','horse','camel')),
  breed VARCHAR(100),
  age DECIMAL(5,1),
  weight DECIMAL(8,2),
  health_status VARCHAR(30) DEFAULT 'healthy'
    CHECK (health_status IN ('healthy','sick','recovering','critical')),
  milk_capacity DECIMAL(8,2) DEFAULT 0,
  status VARCHAR(30) DEFAULT 'active'
    CHECK (status IN ('active','sick','pregnant','sold','deceased')),
  purchase_date DATE,
  purchase_price DECIMAL(10,2),
  tag_number VARCHAR(50) UNIQUE,
  location VARCHAR(100),
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. MILK RECORDS TABLE
CREATE TABLE IF NOT EXISTS lm_milk_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  livestock_id UUID NOT NULL REFERENCES lm_livestock(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  morning_qty DECIMAL(8,2) DEFAULT 0,
  evening_qty DECIMAL(8,2) DEFAULT 0,
  total_qty DECIMAL(8,2) GENERATED ALWAYS AS 
    (morning_qty + evening_qty) STORED,
  quality_grade VARCHAR(10) DEFAULT 'A'
    CHECK (quality_grade IN ('A','B','C')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. HEALTH RECORDS TABLE
CREATE TABLE IF NOT EXISTS lm_health_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  livestock_id UUID NOT NULL REFERENCES lm_livestock(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  record_type VARCHAR(30) NOT NULL
    CHECK (record_type IN ('vaccination','treatment','checkup','surgery','deworming')),
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  disease VARCHAR(200),
  treatment TEXT,
  medicine_used VARCHAR(200),
  medicine_cost DECIMAL(10,2) DEFAULT 0,
  veterinarian VARCHAR(100),
  next_due_date DATE,
  vaccination_type VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BREEDING RECORDS TABLE
CREATE TABLE IF NOT EXISTS lm_breeding_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  livestock_id UUID NOT NULL REFERENCES lm_livestock(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  breeding_date DATE NOT NULL,
  breeding_method VARCHAR(30) DEFAULT 'natural'
    CHECK (breeding_method IN ('natural','artificial','ivf')),
  sire_info VARCHAR(200),
  expected_delivery DATE,
  actual_delivery DATE,
  offspring_count INTEGER DEFAULT 0,
  outcome VARCHAR(30) DEFAULT 'pending'
    CHECK (outcome IN ('pending','successful','failed','miscarriage')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. FEED EXPENSES TABLE
CREATE TABLE IF NOT EXISTS lm_feed_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  livestock_id UUID REFERENCES lm_livestock(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  feed_type VARCHAR(100) NOT NULL,
  quantity_kg DECIMAL(8,2),
  cost_per_unit DECIMAL(10,2),
  total_cost DECIMAL(10,2) NOT NULL,
  supplier VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. LIVESTOCK TASKS TABLE
CREATE TABLE IF NOT EXISTS lm_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  livestock_id UUID REFERENCES lm_livestock(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_title VARCHAR(200) NOT NULL,
  task_type VARCHAR(50) DEFAULT 'general'
    CHECK (task_type IN ('feeding','health','breeding','grooming',
      'vaccination','milking','cleaning','general')),
  priority VARCHAR(20) DEFAULT 'medium'
    CHECK (priority IN ('low','medium','high','urgent')),
  due_date DATE NOT NULL,
  due_time TIME,
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending','in_progress','completed','cancelled')),
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE lm_livestock ENABLE ROW LEVEL SECURITY;
ALTER TABLE lm_milk_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE lm_health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE lm_breeding_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE lm_feed_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lm_tasks ENABLE ROW LEVEL SECURITY;

-- Livestock RLS
CREATE POLICY "lm_livestock_user_policy" ON lm_livestock
  FOR ALL USING (auth.uid() = user_id);

-- Milk Records RLS
CREATE POLICY "lm_milk_records_user_policy" ON lm_milk_records
  FOR ALL USING (auth.uid() = user_id);

-- Health Records RLS
CREATE POLICY "lm_health_records_user_policy" ON lm_health_records
  FOR ALL USING (auth.uid() = user_id);

-- Breeding Records RLS
CREATE POLICY "lm_breeding_records_user_policy" ON lm_breeding_records
  FOR ALL USING (auth.uid() = user_id);

-- Feed Expenses RLS
CREATE POLICY "lm_feed_expenses_user_policy" ON lm_feed_expenses
  FOR ALL USING (auth.uid() = user_id);

-- Tasks RLS
CREATE POLICY "lm_tasks_user_policy" ON lm_tasks
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- PERFORMANCE INDEXES
-- ============================================

CREATE INDEX idx_lm_livestock_user ON lm_livestock(user_id);
CREATE INDEX idx_lm_livestock_type ON lm_livestock(type);
CREATE INDEX idx_lm_livestock_status ON lm_livestock(status);
CREATE INDEX idx_lm_livestock_health ON lm_livestock(health_status);

CREATE INDEX idx_lm_milk_livestock ON lm_milk_records(livestock_id);
CREATE INDEX idx_lm_milk_date ON lm_milk_records(record_date);
CREATE INDEX idx_lm_milk_user ON lm_milk_records(user_id);

CREATE INDEX idx_lm_health_livestock ON lm_health_records(livestock_id);
CREATE INDEX idx_lm_health_due ON lm_health_records(next_due_date);
CREATE INDEX idx_lm_health_user ON lm_health_records(user_id);

CREATE INDEX idx_lm_breeding_livestock ON lm_breeding_records(livestock_id);
CREATE INDEX idx_lm_breeding_delivery ON lm_breeding_records(expected_delivery);

CREATE INDEX idx_lm_feed_user ON lm_feed_expenses(user_id);
CREATE INDEX idx_lm_feed_date ON lm_feed_expenses(expense_date);

CREATE INDEX idx_lm_tasks_user ON lm_tasks(user_id);
CREATE INDEX idx_lm_tasks_due ON lm_tasks(due_date);
CREATE INDEX idx_lm_tasks_status ON lm_tasks(status);

-- ============================================
-- AUTO-UPDATE TIMESTAMP TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION lm_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER lm_livestock_timestamp
  BEFORE UPDATE ON lm_livestock
  FOR EACH ROW EXECUTE FUNCTION lm_update_timestamp();

-- ============================================
-- USEFUL VIEWS
-- ============================================

CREATE OR REPLACE VIEW lm_livestock_summary AS
SELECT 
  l.id,
  l.user_id,
  l.name,
  l.type,
  l.breed,
  l.health_status,
  l.status,
  l.milk_capacity,
  COALESCE(AVG(mr.total_qty), 0) as avg_daily_milk,
  COUNT(DISTINCT hr.id) as health_record_count,
  MAX(hr.next_due_date) as next_health_due,
  COUNT(DISTINCT t.id) FILTER (
    WHERE t.status = 'pending'
  ) as pending_tasks
FROM lm_livestock l
LEFT JOIN lm_milk_records mr ON mr.livestock_id = l.id
  AND mr.record_date >= CURRENT_DATE - INTERVAL '7 days'
LEFT JOIN lm_health_records hr ON hr.livestock_id = l.id
LEFT JOIN lm_tasks t ON t.livestock_id = l.id
GROUP BY l.id;
