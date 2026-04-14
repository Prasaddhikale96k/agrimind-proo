-- ═══════════════════════════════════════════
-- FASSAL DEAL TABLES
-- Run this in your Supabase SQL Editor
-- ═══════════════════════════════════════════

-- TABLE 1: fassal_deal_searches
CREATE TABLE IF NOT EXISTS fassal_deal_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES farmers(id) ON DELETE CASCADE,
  farm_id UUID REFERENCES farms(id),
  
  crop_name VARCHAR(100) NOT NULL,
  crop_variety VARCHAR(100),
  crop_quality VARCHAR(20),
  
  quantity_kg DECIMAL(10,2) NOT NULL,
  quantity_quintals DECIMAL(10,2),
  moisture_content DECIMAL(5,2),
  
  farmer_lat DECIMAL(10,8),
  farmer_lng DECIMAL(11,8),
  farmer_address TEXT,
  farmer_district VARCHAR(100),
  farmer_state VARCHAR(100),
  
  max_distance_km INTEGER DEFAULT 100,
  search_radius_km INTEGER DEFAULT 50,
  transport_vehicle VARCHAR(30),
  has_own_transport BOOLEAN DEFAULT FALSE,
  
  deals_found INTEGER DEFAULT 0,
  best_deal_profit DECIMAL(12,2),
  search_status VARCHAR(20) DEFAULT 'pending',
  
  ai_market_summary TEXT,
  ai_best_time_to_sell TEXT,
  ai_price_trend VARCHAR(20),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- TABLE 2: fassal_deal_results
CREATE TABLE IF NOT EXISTS fassal_deal_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_id UUID REFERENCES fassal_deal_searches(id) ON DELETE CASCADE,
  
  buyer_type VARCHAR(30),
  buyer_name VARCHAR(200) NOT NULL,
  buyer_location VARCHAR(200),
  buyer_lat DECIMAL(10,8),
  buyer_lng DECIMAL(11,8),
  buyer_district VARCHAR(100),
  buyer_rating DECIMAL(3,1),
  buyer_verified BOOLEAN DEFAULT FALSE,
  buyer_phone VARCHAR(20),
  buyer_contact_name VARCHAR(100),
  
  distance_km DECIMAL(8,2),
  estimated_travel_hours DECIMAL(4,1),
  road_quality VARCHAR(20),
  
  price_per_quintal DECIMAL(10,2),
  price_per_kg DECIMAL(10,4),
  total_gross_amount DECIMAL(12,2),
  
  transport_cost_total DECIMAL(10,2),
  transport_cost_per_km DECIMAL(8,2),
  loading_cost DECIMAL(8,2),
  unloading_cost DECIMAL(8,2),
  mandi_commission_percent DECIMAL(5,2),
  mandi_commission_amount DECIMAL(10,2),
  weighing_charges DECIMAL(8,2),
  other_charges DECIMAL(8,2),
  total_deductions DECIMAL(12,2),
  
  net_profit_in_hand DECIMAL(12,2),
  net_per_quintal DECIMAL(10,2),
  
  ai_trust_score INTEGER,
  ai_recommendation TEXT,
  ai_rank INTEGER,
  ai_pros TEXT[],
  ai_cons TEXT[],
  deal_badge VARCHAR(30),
  
  accepts_quantity BOOLEAN DEFAULT TRUE,
  min_quantity_quintal DECIMAL(8,2),
  max_quantity_quintal DECIMAL(8,2),
  payment_terms VARCHAR(50),
  payment_method VARCHAR(50),
  
  is_selected BOOLEAN DEFAULT FALSE,
  farmer_contacted BOOLEAN DEFAULT FALSE,
  deal_status VARCHAR(20) DEFAULT 'available',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 3: mandi_prices
CREATE TABLE IF NOT EXISTS mandi_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  mandi_name VARCHAR(200) NOT NULL,
  mandi_code VARCHAR(20),
  state VARCHAR(100),
  district VARCHAR(100),
  mandi_lat DECIMAL(10,8),
  mandi_lng DECIMAL(11,8),
  
  crop_name VARCHAR(100) NOT NULL,
  crop_variety VARCHAR(100),
  
  min_price DECIMAL(10,2),
  max_price DECIMAL(10,2),
  modal_price DECIMAL(10,2),
  
  arrival_quantity_quintal DECIMAL(12,2),
  price_date DATE NOT NULL,
  
  price_7day_avg DECIMAL(10,2),
  price_30day_avg DECIMAL(10,2),
  price_trend VARCHAR(20),
  trend_percent DECIMAL(5,2),
  
  data_source VARCHAR(50) DEFAULT 'agmarknet',
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 4: transport_rates
CREATE TABLE IF NOT EXISTS transport_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state VARCHAR(100),
  vehicle_type VARCHAR(30),
  capacity_quintal DECIMAL(8,2),
  base_rate_per_km DECIMAL(8,2),
  loading_charge DECIMAL(8,2),
  unloading_charge DECIMAL(8,2),
  road_type VARCHAR(20),
  last_updated DATE
);

-- TABLE 5: saved_deals
CREATE TABLE IF NOT EXISTS saved_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES farmers(id),
  deal_result_id UUID REFERENCES fassal_deal_results(id),
  search_id UUID REFERENCES fassal_deal_searches(id),
  notes TEXT,
  reminder_date DATE,
  saved_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_mandi_prices_crop ON mandi_prices(crop_name, price_date);
CREATE INDEX IF NOT EXISTS idx_mandi_prices_state ON mandi_prices(state, district);
CREATE INDEX IF NOT EXISTS idx_fassal_searches_farmer ON fassal_deal_searches(farmer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fassal_results_search ON fassal_deal_results(search_id, net_profit_in_hand DESC);
CREATE INDEX IF NOT EXISTS idx_saved_deals_farmer ON saved_deals(farmer_id, saved_at DESC);

-- RLS Policies
ALTER TABLE fassal_deal_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE fassal_deal_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE mandi_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Farmers can view own searches" ON fassal_deal_searches FOR SELECT USING (true);
CREATE POLICY "Farmers can insert own searches" ON fassal_deal_searches FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view mandi prices" ON mandi_prices FOR SELECT USING (true);
CREATE POLICY "Anyone can view transport rates" ON transport_rates FOR SELECT USING (true);

CREATE POLICY "Farmers can view deal results" ON fassal_deal_results FOR SELECT USING (true);
CREATE POLICY "System can insert deal results" ON fassal_deal_results FOR INSERT WITH CHECK (true);

CREATE POLICY "Farmers can view own saved deals" ON saved_deals FOR SELECT USING (true);
CREATE POLICY "Farmers can insert own saved deals" ON saved_deals FOR INSERT WITH CHECK (true);
CREATE POLICY "Farmers can delete own saved deals" ON saved_deals FOR DELETE USING (true);
