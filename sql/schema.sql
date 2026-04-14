-- ═══════════════════════════════════════════════════════════════════
-- AgriMind Pro - Complete Database Schema
-- ═══════════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════
-- TABLE 1: farmers
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS farmers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  phone VARCHAR(20),
  avatar_url TEXT,
  location VARCHAR(200),
  total_land_acres DECIMAL(10,2),
  farming_experience_years INTEGER,
  subscription_plan VARCHAR(20) DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════
-- TABLE 2: farms
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES farmers(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  plot_id VARCHAR(20) UNIQUE NOT NULL,
  location_lat DECIMAL(10,8),
  location_lng DECIMAL(11,8),
  area_sqm DECIMAL(10,2) NOT NULL,
  area_acres DECIMAL(10,4),
  soil_type VARCHAR(50),
  terrain VARCHAR(50),
  water_source VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════
-- TABLE 3: crops
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS crops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  variety VARCHAR(100),
  crop_type VARCHAR(50),
  season VARCHAR(30),
  sowing_date DATE NOT NULL,
  expected_harvest_date DATE,
  actual_harvest_date DATE,
  area_allocated_sqm DECIMAL(10,2),
  water_requirement_liters_per_day DECIMAL(10,2),
  expected_yield_kg DECIMAL(10,2),
  actual_yield_kg DECIMAL(10,2),
  market_price_per_kg DECIMAL(10,2),
  status VARCHAR(30) DEFAULT 'growing',
  health_index INTEGER DEFAULT 85,
  growth_stage VARCHAR(50),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════
-- TABLE 4: soil_data
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS soil_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  moisture_percent DECIMAL(5,2),
  ph_level DECIMAL(4,2),
  nitrogen_ppm DECIMAL(8,2),
  phosphorus_ppm DECIMAL(8,2),
  potassium_ppm DECIMAL(8,2),
  organic_matter_percent DECIMAL(5,2),
  temperature_celsius DECIMAL(5,2),
  salinity_ds_per_m DECIMAL(6,3),
  data_source VARCHAR(30) DEFAULT 'manual'
);

-- ═══════════════════════════════════════════════
-- TABLE 5: weather_data
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS weather_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  temperature_celsius DECIMAL(5,2),
  humidity_percent DECIMAL(5,2),
  wind_speed_mps DECIMAL(6,2),
  wind_direction VARCHAR(10),
  rainfall_mm DECIMAL(8,2) DEFAULT 0,
  uv_index DECIMAL(4,1),
  sunlight_hours DECIMAL(4,1),
  weather_condition VARCHAR(50),
  forecast_rain_probability INTEGER,
  high_temp DECIMAL(5,2),
  low_temp DECIMAL(5,2)
);

-- ═══════════════════════════════════════════════
-- TABLE 6: irrigation_schedules
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS irrigation_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
  crop_id UUID REFERENCES crops(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  duration_minutes INTEGER,
  water_volume_liters DECIMAL(10,2),
  method VARCHAR(30),
  status VARCHAR(20) DEFAULT 'pending',
  ai_recommended BOOLEAN DEFAULT FALSE,
  actual_water_used DECIMAL(10,2),
  cost_per_liter DECIMAL(8,4) DEFAULT 0.002,
  total_cost DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════
-- TABLE 7: spray_schedules
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS spray_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
  crop_id UUID REFERENCES crops(id) ON DELETE CASCADE,
  spray_type VARCHAR(50),
  chemical_name VARCHAR(100),
  dosage_ml_per_liter DECIMAL(8,3),
  water_volume_liters DECIMAL(10,2),
  area_covered_sqm DECIMAL(10,2),
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  status VARCHAR(20) DEFAULT 'pending',
  cost_per_liter_chemical DECIMAL(10,2),
  total_chemical_cost DECIMAL(10,2),
  total_labor_cost DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  ai_recommended BOOLEAN DEFAULT FALSE,
  weather_suitable BOOLEAN DEFAULT TRUE,
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════
-- TABLE 8: fertilization_schedules
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS fertilization_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
  crop_id UUID REFERENCES crops(id) ON DELETE CASCADE,
  fertilizer_name VARCHAR(100),
  fertilizer_type VARCHAR(50),
  npk_ratio VARCHAR(20),
  quantity_kg DECIMAL(10,2),
  application_method VARCHAR(50),
  scheduled_date DATE NOT NULL,
  growth_stage VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending',
  cost_per_kg DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  ai_recommended BOOLEAN DEFAULT FALSE,
  expected_yield_boost_percent DECIMAL(5,2),
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════
-- TABLE 9: financial_records
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS financial_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
  crop_id UUID REFERENCES crops(id),
  record_type VARCHAR(30),
  category VARCHAR(50),
  amount DECIMAL(12,2) NOT NULL,
  quantity DECIMAL(10,2),
  unit VARCHAR(20),
  description TEXT,
  record_date DATE NOT NULL,
  payment_method VARCHAR(30),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════
-- TABLE 10: alerts
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
  crop_id UUID REFERENCES crops(id),
  alert_type VARCHAR(50),
  severity VARCHAR(20),
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  action_required TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  is_resolved BOOLEAN DEFAULT FALSE,
  auto_generated BOOLEAN DEFAULT TRUE,
  ai_confidence DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- ═══════════════════════════════════════════════
-- TABLE 11: equipment
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
  name VARCHAR(100),
  equipment_type VARCHAR(50),
  purchase_date DATE,
  purchase_cost DECIMAL(10,2),
  maintenance_cost_monthly DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'operational',
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  fuel_type VARCHAR(30),
  fuel_efficiency DECIMAL(6,2)
);

-- ═══════════════════════════════════════════════
-- TABLE 12: ai_interactions
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS ai_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES farmers(id),
  farm_id UUID REFERENCES farms(id),
  interaction_type VARCHAR(50),
  prompt TEXT,
  response TEXT,
  context_data JSONB,
  tokens_used INTEGER,
  model_used VARCHAR(50),
  confidence_score DECIMAL(5,2),
  was_helpful BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════
-- TABLE 13: plot_analytics
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS plot_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
  analysis_date DATE NOT NULL,
  total_income DECIMAL(12,2) DEFAULT 0,
  total_expenditure DECIMAL(12,2) DEFAULT 0,
  net_profit DECIMAL(12,2) DEFAULT 0,
  water_used_liters DECIMAL(12,2) DEFAULT 0,
  fertilizer_used_kg DECIMAL(10,2) DEFAULT 0,
  spray_cost DECIMAL(10,2) DEFAULT 0,
  labor_cost DECIMAL(10,2) DEFAULT 0,
  yield_kg DECIMAL(10,2) DEFAULT 0,
  profit_per_acre DECIMAL(12,2) DEFAULT 0,
  roi_percent DECIMAL(8,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════
CREATE INDEX idx_farms_farmer_id ON farms(farmer_id);
CREATE INDEX idx_crops_farm_id ON crops(farm_id);
CREATE INDEX idx_crops_status ON crops(status);
CREATE INDEX idx_soil_data_farm_id ON soil_data(farm_id);
CREATE INDEX idx_soil_data_recorded_at ON soil_data(recorded_at DESC);
CREATE INDEX idx_weather_data_farm_id ON weather_data(farm_id);
CREATE INDEX idx_weather_data_recorded_at ON weather_data(recorded_at DESC);
CREATE INDEX idx_irrigation_farm_id ON irrigation_schedules(farm_id);
CREATE INDEX idx_irrigation_crop_id ON irrigation_schedules(crop_id);
CREATE INDEX idx_irrigation_date ON irrigation_schedules(scheduled_date);
CREATE INDEX idx_irrigation_status ON irrigation_schedules(status);
CREATE INDEX idx_spray_farm_id ON spray_schedules(farm_id);
CREATE INDEX idx_spray_crop_id ON spray_schedules(crop_id);
CREATE INDEX idx_spray_date ON spray_schedules(scheduled_date);
CREATE INDEX idx_spray_status ON spray_schedules(status);
CREATE INDEX idx_fertilization_farm_id ON fertilization_schedules(farm_id);
CREATE INDEX idx_fertilization_crop_id ON fertilization_schedules(crop_id);
CREATE INDEX idx_fertilization_date ON fertilization_schedules(scheduled_date);
CREATE INDEX idx_fertilization_status ON fertilization_schedules(status);
CREATE INDEX idx_financial_farm_id ON financial_records(farm_id);
CREATE INDEX idx_financial_crop_id ON financial_records(crop_id);
CREATE INDEX idx_financial_date ON financial_records(record_date);
CREATE INDEX idx_financial_type ON financial_records(record_type);
CREATE INDEX idx_alerts_farm_id ON alerts(farm_id);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_read ON alerts(is_read);
CREATE INDEX idx_alerts_created_at ON alerts(created_at DESC);
CREATE INDEX idx_ai_interactions_farmer_id ON ai_interactions(farmer_id);
CREATE INDEX idx_ai_interactions_created_at ON ai_interactions(created_at DESC);
CREATE INDEX idx_plot_analytics_farm_id ON plot_analytics(farm_id);
CREATE INDEX idx_plot_analytics_date ON plot_analytics(analysis_date);

-- ═══════════════════════════════════════════════
-- TRIGGER 1: Auto Alert on Low Moisture
-- ═══════════════════════════════════════════════
CREATE OR REPLACE FUNCTION check_soil_moisture_alert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.moisture_percent < 30 THEN
    INSERT INTO alerts (farm_id, alert_type, severity, title, message, action_required)
    VALUES (
      NEW.farm_id,
      'irrigation',
      CASE WHEN NEW.moisture_percent < 15 THEN 'critical' ELSE 'high' END,
      'Irrigation Required',
      'Soil moisture at ' || NEW.moisture_percent || '% - Below optimal threshold',
      'Schedule immediate irrigation. AI recommends drip irrigation for 45 minutes.'
    );
  END IF;
  
  IF NEW.ph_level < 5.5 OR NEW.ph_level > 7.5 THEN
    INSERT INTO alerts (farm_id, alert_type, severity, title, message, action_required)
    VALUES (
      NEW.farm_id,
      'soil',
      'medium',
      'pH Level Alert',
      'Soil pH at ' || NEW.ph_level || ' - Outside optimal range (5.5-7.5)',
      CASE 
        WHEN NEW.ph_level < 5.5 THEN 'Apply lime to increase pH. Recommended: 2kg/acre'
        ELSE 'Apply sulfur to decrease pH. Recommended: 1.5kg/acre'
      END
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS soil_moisture_alert_trigger ON soil_data;
CREATE TRIGGER soil_moisture_alert_trigger
AFTER INSERT ON soil_data
FOR EACH ROW EXECUTE FUNCTION check_soil_moisture_alert();

-- ═══════════════════════════════════════════════
-- TRIGGER 2: Auto Financial Record on Irrigation
-- ═══════════════════════════════════════════════
CREATE OR REPLACE FUNCTION auto_record_irrigation_cost()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status = 'pending' THEN
    INSERT INTO financial_records (farm_id, crop_id, record_type, category, amount, description, record_date)
    VALUES (
      NEW.farm_id,
      NEW.crop_id,
      'expenditure',
      'irrigation',
      COALESCE(NEW.actual_water_used, NEW.water_volume_liters) * NEW.cost_per_liter,
      'Irrigation on ' || NEW.scheduled_date || ' - ' || NEW.method,
      NEW.scheduled_date
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS irrigation_cost_trigger ON irrigation_schedules;
CREATE TRIGGER irrigation_cost_trigger
AFTER UPDATE ON irrigation_schedules
FOR EACH ROW EXECUTE FUNCTION auto_record_irrigation_cost();

-- ═══════════════════════════════════════════════
-- TRIGGER 3: Crop Health Alert
-- ═══════════════════════════════════════════════
CREATE OR REPLACE FUNCTION check_crop_health()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.health_index < 60 AND OLD.health_index >= 60 THEN
    INSERT INTO alerts (farm_id, crop_id, alert_type, severity, title, message, action_required)
    VALUES (
      (SELECT farm_id FROM crops WHERE id = NEW.id),
      NEW.id,
      'ai',
      CASE WHEN NEW.health_index < 40 THEN 'critical' ELSE 'high' END,
      'Crop Health Declining: ' || NEW.name,
      'Health index dropped to ' || NEW.health_index || '/100',
      'AI analysis recommended. Upload crop image for disease detection.'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS crop_health_alert_trigger ON crops;
CREATE TRIGGER crop_health_alert_trigger
AFTER UPDATE ON crops
FOR EACH ROW EXECUTE FUNCTION check_crop_health();

-- ═══════════════════════════════════════════════
-- TRIGGER 4: Update updated_at timestamp
-- ═══════════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_farmers_updated_at BEFORE UPDATE ON farmers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_farms_updated_at BEFORE UPDATE ON farms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crops_updated_at BEFORE UPDATE ON crops FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════
-- STORED PROCEDURE 1: Generate Weekly Schedule
-- ═══════════════════════════════════════════════
CREATE OR REPLACE FUNCTION generate_weekly_irrigation_schedule(p_farm_id UUID)
RETURNS TABLE(crop_name VARCHAR, date DATE, time TIME, liters DECIMAL, method VARCHAR) AS $$
DECLARE
  v_crop RECORD;
  v_soil_moisture DECIMAL;
  v_day INTEGER;
BEGIN
  FOR v_crop IN 
    SELECT c.*, f.soil_type 
    FROM crops c 
    JOIN farms f ON c.farm_id = f.id 
    WHERE c.farm_id = p_farm_id AND c.status = 'growing'
  LOOP
    SELECT moisture_percent INTO v_soil_moisture
    FROM soil_data 
    WHERE farm_id = p_farm_id 
    ORDER BY recorded_at DESC LIMIT 1;
    
    FOR v_day IN 0..6 LOOP
      IF v_soil_moisture < 40 OR v_day % 2 = 0 THEN
        INSERT INTO irrigation_schedules (
          farm_id, crop_id, scheduled_date, scheduled_time,
          duration_minutes, water_volume_liters, method, ai_recommended
        ) VALUES (
          p_farm_id,
          v_crop.id,
          CURRENT_DATE + v_day,
          '06:00:00',
          45,
          v_crop.water_requirement_liters_per_day,
          'drip',
          TRUE
        );
      END IF;
    END LOOP;
  END LOOP;
  
  RETURN QUERY
    SELECT c.name::VARCHAR, i.scheduled_date, i.scheduled_time, i.water_volume_liters, i.method
    FROM irrigation_schedules i
    JOIN crops c ON i.crop_id = c.id
    WHERE i.farm_id = p_farm_id AND i.ai_recommended = TRUE
    AND i.scheduled_date >= CURRENT_DATE
    ORDER BY i.scheduled_date;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════
-- STORED PROCEDURE 2: Calculate Plot P&L
-- ═══════════════════════════════════════════════
CREATE OR REPLACE FUNCTION calculate_plot_pnl(p_farm_id UUID, p_month DATE)
RETURNS TABLE(
  total_income DECIMAL, 
  total_expenditure DECIMAL, 
  net_profit DECIMAL,
  roi_percent DECIMAL,
  profit_per_acre DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(CASE WHEN record_type = 'income' THEN amount ELSE 0 END), 0) as total_income,
    COALESCE(SUM(CASE WHEN record_type = 'expenditure' THEN amount ELSE 0 END), 0) as total_expenditure,
    COALESCE(SUM(CASE WHEN record_type = 'income' THEN amount ELSE -amount END), 0) as net_profit,
    CASE 
      WHEN SUM(CASE WHEN record_type = 'expenditure' THEN amount ELSE 0 END) > 0
      THEN (SUM(CASE WHEN record_type = 'income' THEN amount ELSE -amount END) / 
            SUM(CASE WHEN record_type = 'expenditure' THEN amount ELSE 0 END)) * 100
      ELSE 0 
    END as roi_percent,
    COALESCE(SUM(CASE WHEN record_type = 'income' THEN amount ELSE -amount END), 0) / 
    NULLIF((SELECT area_acres FROM farms WHERE id = p_farm_id), 0) as profit_per_acre
  FROM financial_records
  WHERE farm_id = p_farm_id
  AND DATE_TRUNC('month', record_date) = DATE_TRUNC('month', p_month);
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════
-- VIEW 1: Complete Farm Dashboard Data
-- ═══════════════════════════════════════════════
CREATE OR REPLACE VIEW farm_dashboard_view AS
SELECT 
  fa.name as farmer_name,
  f.name as farm_name,
  f.plot_id,
  f.area_sqm,
  c.name as crop_name,
  c.health_index,
  c.status as crop_status,
  c.expected_harvest_date,
  sd.moisture_percent,
  sd.ph_level,
  sd.nitrogen_ppm,
  wd.temperature_celsius,
  wd.humidity_percent,
  wd.weather_condition,
  wd.sunlight_hours,
  (c.expected_yield_kg * c.market_price_per_kg) as projected_income
FROM farmers fa
JOIN farms f ON fa.id = f.farmer_id
LEFT JOIN crops c ON f.id = c.farm_id
LEFT JOIN LATERAL (
  SELECT * FROM soil_data WHERE farm_id = f.id ORDER BY recorded_at DESC LIMIT 1
) sd ON TRUE
LEFT JOIN LATERAL (
  SELECT * FROM weather_data WHERE farm_id = f.id ORDER BY recorded_at DESC LIMIT 1
) wd ON TRUE;

-- ═══════════════════════════════════════════════
-- VIEW 2: Financial Summary per Plot
-- ═══════════════════════════════════════════════
CREATE OR REPLACE VIEW plot_financial_summary AS
SELECT 
  f.name as farm_name,
  f.plot_id,
  f.area_acres,
  SUM(CASE WHEN fr.record_type = 'income' THEN fr.amount ELSE 0 END) as total_income,
  SUM(CASE WHEN fr.record_type = 'expenditure' THEN fr.amount ELSE 0 END) as total_expenditure,
  SUM(CASE WHEN fr.record_type = 'income' THEN fr.amount ELSE -fr.amount END) as net_profit,
  COUNT(DISTINCT fr.crop_id) as active_crops,
  SUM(CASE WHEN fr.category = 'irrigation' THEN fr.amount ELSE 0 END) as irrigation_cost,
  SUM(CASE WHEN fr.category = 'fertilizer' THEN fr.amount ELSE 0 END) as fertilizer_cost,
  SUM(CASE WHEN fr.category = 'spray' THEN fr.amount ELSE 0 END) as spray_cost,
  SUM(CASE WHEN fr.category = 'labor' THEN fr.amount ELSE 0 END) as labor_cost
FROM farms f
LEFT JOIN financial_records fr ON f.id = fr.farm_id
GROUP BY f.id, f.name, f.plot_id, f.area_acres;

-- ═══════════════════════════════════════════════
-- VIEW 3: Aggregate Soil Analytics
-- ═══════════════════════════════════════════════
CREATE OR REPLACE VIEW soil_analytics_view AS
SELECT 
  farm_id,
  AVG(moisture_percent) as avg_moisture,
  AVG(ph_level) as avg_ph,
  AVG(nitrogen_ppm) as avg_nitrogen,
  AVG(phosphorus_ppm) as avg_phosphorus,
  AVG(potassium_ppm) as avg_potassium,
  MIN(moisture_percent) as min_moisture,
  MAX(moisture_percent) as max_moisture,
  COUNT(*) as readings_count,
  DATE_TRUNC('week', recorded_at) as week
FROM soil_data
GROUP BY farm_id, DATE_TRUNC('week', recorded_at);

-- ═══════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS) Policies
-- ═══════════════════════════════════════════════
ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE soil_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE irrigation_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE spray_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE fertilization_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plot_analytics ENABLE ROW LEVEL SECURITY;

-- Allow all access for development (replace with proper auth in production)
CREATE POLICY "Allow all access" ON farmers FOR ALL USING (true);
CREATE POLICY "Allow all access" ON farms FOR ALL USING (true);
CREATE POLICY "Allow all access" ON crops FOR ALL USING (true);
CREATE POLICY "Allow all access" ON soil_data FOR ALL USING (true);
CREATE POLICY "Allow all access" ON weather_data FOR ALL USING (true);
CREATE POLICY "Allow all access" ON irrigation_schedules FOR ALL USING (true);
CREATE POLICY "Allow all access" ON spray_schedules FOR ALL USING (true);
CREATE POLICY "Allow all access" ON fertilization_schedules FOR ALL USING (true);
CREATE POLICY "Allow all access" ON financial_records FOR ALL USING (true);
CREATE POLICY "Allow all access" ON alerts FOR ALL USING (true);
CREATE POLICY "Allow all access" ON equipment FOR ALL USING (true);
CREATE POLICY "Allow all access" ON ai_interactions FOR ALL USING (true);
CREATE POLICY "Allow all access" ON plot_analytics FOR ALL USING (true);
