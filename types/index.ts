export type Farmer = {
  id: string
  name: string
  email: string
  phone: string | null
  avatar_url: string | null
  location: string | null
  total_land_acres: number | null
  farming_experience_years: number | null
  subscription_plan: string
  created_at: string
  updated_at: string
}

export type Farm = {
  id: string
  farmer_id: string
  name: string
  plot_id: string
  location_lat: number | null
  location_lng: number | null
  area_sqm: number
  area_acres: number | null
  soil_type: string | null
  terrain: string | null
  water_source: string | null
  created_at: string
  updated_at: string
}

export type Crop = {
  id: string
  farm_id: string
  name: string
  variety: string | null
  crop_type: string | null
  season: string | null
  sowing_date: string
  expected_harvest_date: string | null
  actual_harvest_date: string | null
  area_allocated_sqm: number | null
  water_requirement_liters_per_day: number | null
  expected_yield_kg: number | null
  actual_yield_kg: number | null
  market_price_per_kg: number | null
  status: string
  health_index: number
  growth_stage: string | null
  image_url: string | null
  created_at: string
  updated_at: string
}

export type SoilData = {
  id: string
  farm_id: string
  recorded_at: string
  moisture_percent: number | null
  ph_level: number | null
  nitrogen_ppm: number | null
  phosphorus_ppm: number | null
  potassium_ppm: number | null
  organic_matter_percent: number | null
  temperature_celsius: number | null
  salinity_ds_per_m: number | null
  data_source: string
}

export type WeatherData = {
  id: string
  farm_id: string
  recorded_at: string
  temperature_celsius: number | null
  humidity_percent: number | null
  wind_speed_mps: number | null
  wind_direction: string | null
  rainfall_mm: number | null
  uv_index: number | null
  sunlight_hours: number | null
  weather_condition: string | null
  forecast_rain_probability: number | null
  high_temp: number | null
  low_temp: number | null
}

export type IrrigationSchedule = {
  id: string
  farm_id: string
  crop_id: string
  scheduled_date: string
  scheduled_time: string
  duration_minutes: number | null
  water_volume_liters: number | null
  method: string | null
  status: string
  ai_recommended: boolean
  actual_water_used: number | null
  cost_per_liter: number
  total_cost: number | null
  notes: string | null
  created_at: string
}

export type SpraySchedule = {
  id: string
  farm_id: string
  crop_id: string
  spray_type: string | null
  chemical_name: string | null
  dosage_ml_per_liter: number | null
  water_volume_liters: number | null
  area_covered_sqm: number | null
  scheduled_date: string
  scheduled_time: string | null
  status: string
  cost_per_liter_chemical: number | null
  total_chemical_cost: number | null
  total_labor_cost: number | null
  total_cost: number | null
  ai_recommended: boolean
  weather_suitable: boolean
  notes: string | null
  completed_at: string | null
  created_at: string
}

export type FertilizationSchedule = {
  id: string
  farm_id: string
  crop_id: string
  fertilizer_name: string | null
  fertilizer_type: string | null
  npk_ratio: string | null
  quantity_kg: number | null
  application_method: string | null
  scheduled_date: string
  growth_stage: string | null
  status: string
  cost_per_kg: number | null
  total_cost: number | null
  ai_recommended: boolean
  expected_yield_boost_percent: number | null
  notes: string | null
  completed_at: string | null
  created_at: string
}

export type FinancialRecord = {
  id: string
  farm_id: string
  crop_id: string | null
  record_type: string
  category: string
  amount: number
  quantity: number | null
  unit: string | null
  description: string | null
  record_date: string
  payment_method: string | null
  created_at: string
}

export type Alert = {
  id: string
  farm_id: string
  crop_id: string | null
  alert_type: string
  severity: string
  title: string
  message: string
  action_required: string | null
  is_read: boolean
  is_resolved: boolean
  auto_generated: boolean
  ai_confidence: number | null
  created_at: string
  resolved_at: string | null
}

export type Equipment = {
  id: string
  farm_id: string
  name: string | null
  equipment_type: string | null
  purchase_date: string | null
  purchase_cost: number | null
  maintenance_cost_monthly: number | null
  status: string
  last_maintenance_date: string | null
  next_maintenance_date: string | null
  fuel_type: string | null
  fuel_efficiency: number | null
}

export type AIInteraction = {
  id: string
  farmer_id: string
  farm_id: string | null
  interaction_type: string
  prompt: string | null
  response: string | null
  context_data: Record<string, unknown> | null
  tokens_used: number | null
  model_used: string | null
  confidence_score: number | null
  was_helpful: boolean | null
  created_at: string
}

export type PlotAnalytics = {
  id: string
  farm_id: string
  analysis_date: string
  total_income: number
  total_expenditure: number
  net_profit: number
  water_used_liters: number
  fertilizer_used_kg: number
  spray_cost: number
  labor_cost: number
  yield_kg: number
  profit_per_acre: number
  roi_percent: number
  created_at: string
}

export type DashboardData = {
  farmer_name: string
  farm_name: string
  plot_id: string
  area_sqm: number
  crop_name: string | null
  health_index: number | null
  crop_status: string | null
  expected_harvest_date: string | null
  moisture_percent: number | null
  ph_level: number | null
  nitrogen_ppm: number | null
  temperature_celsius: number | null
  humidity_percent: number | null
  weather_condition: string | null
  sunlight_hours: number | null
  projected_income: number | null
}

export type FinancialSummary = {
  farm_name: string
  plot_id: string
  area_acres: number | null
  total_income: number | null
  total_expenditure: number | null
  net_profit: number | null
  active_crops: number | null
  irrigation_cost: number | null
  fertilizer_cost: number | null
  spray_cost: number | null
  labor_cost: number | null
}

export type SoilAnalytics = {
  farm_id: string
  avg_moisture: number | null
  avg_ph: number | null
  avg_nitrogen: number | null
  avg_phosphorus: number | null
  avg_potassium: number | null
  min_moisture: number | null
  max_moisture: number | null
  readings_count: number | null
  week: string
}

export type PnLResult = {
  total_income: number
  total_expenditure: number
  net_profit: number
  roi_percent: number
  profit_per_acre: number
}
