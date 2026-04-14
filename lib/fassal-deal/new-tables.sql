-- Saved Deals Table
CREATE TABLE IF NOT EXISTS fassal_saved_deals (
  id BIGSERIAL PRIMARY KEY,
  market_name TEXT NOT NULL,
  commodity TEXT NOT NULL,
  modal_price INTEGER DEFAULT 0,
  net_in_hand INTEGER DEFAULT 0,
  date_reported DATE DEFAULT CURRENT_DATE,
  variety TEXT DEFAULT 'Standard',
  distance_km NUMERIC DEFAULT 0,
  buyer_phone TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Search History Table
CREATE TABLE IF NOT EXISTS fassal_search_history (
  id BIGSERIAL PRIMARY KEY,
  query TEXT NOT NULL,
  crop_name TEXT DEFAULT '',
  state TEXT DEFAULT '',
  district TEXT DEFAULT '',
  quantity_quintals NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_fassal_saved_commodity ON fassal_saved_deals(commodity);
CREATE INDEX IF NOT EXISTS idx_fassal_saved_date ON fassal_saved_deals(date_reported DESC);
CREATE INDEX IF NOT EXISTS idx_fassal_history_created ON fassal_search_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fassal_history_crop ON fassal_search_history(crop_name);

-- RLS
ALTER TABLE fassal_saved_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE fassal_search_history ENABLE ROW LEVEL SECURITY;

-- Public access
CREATE POLICY "Allow public read fassal_saved_deals" ON fassal_saved_deals FOR SELECT USING (true);
CREATE POLICY "Allow public insert fassal_saved_deals" ON fassal_saved_deals FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete fassal_saved_deals" ON fassal_saved_deals FOR DELETE USING (true);

CREATE POLICY "Allow public read fassal_search_history" ON fassal_search_history FOR SELECT USING (true);
CREATE POLICY "Allow public insert fassal_search_history" ON fassal_search_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete fassal_search_history" ON fassal_search_history FOR DELETE USING (true);
