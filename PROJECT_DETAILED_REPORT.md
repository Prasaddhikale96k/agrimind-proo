# PROJECT DETAILED REPORT: AgriMind Pro

---

## 1. PROJECT IDENTIFICATION

- **Project Name:** AgriMind Pro (`agrimind-pro`)
- **Project Version:** `1.0.0`
- **Project Description:** A comprehensive Smart Agriculture Management and Livestock CRM Platform equipped with AI-powered personalized insights, crop recommendations, APMC market deal finding engines, intelligent cattle tracking, disease detection, financial management, and real-time weather monitoring.
- **Status:** Active Development
- **Primary Focus:** Web Platform ensuring maximum profitability, health, and logistical ease for modern tech-empowered farmers.
- **Project Type:** Full-stack Next.js Web Application with Supabase Backend

---

## 2. EXECUTIVE SUMMARY

**AgriMind Pro** is a cutting-edge web application tailored to revolutionize how modern farmers approach crop markets, livestock management, and agricultural analytics. Born out of the necessity to bridge the technology gap in the agricultural sector, the platform democratizes access to sophisticated AI analytics previously reserved for large corporate farms.

The core problems it solves revolve around **information asymmetry in agricultural markets** and **inefficiencies in livestock tracking**. By introducing the "Fassal Deal" engine, farmers can instantly compute the Haversine distance, transportation deductions, mandi commission fees, and real-time prices for APMC mandis to calculate the exact *Net Profit In Hand*, preventing them from traveling to a high-paying market only to lose all profits to transport costs.

The platform addresses critical agricultural challenges including:

- **Market Price Discovery**: Real-time APMC mandi price aggregation with intelligent transport cost calculation
- **Livestock Management**: Complete cattle tracking with health monitoring, milk production, and AI-driven insights
- **Crop Health**: Disease detection through AI image analysis and growth stage tracking
- **Financial Management**: Complete profit & loss tracking, expense categorization, and ROI analysis
- **Operational Scheduling**: Automated irrigation, spray, and fertilization scheduling with AI recommendations
- **Weather Intelligence**: Real-time weather data integration with forecast-based decision support

Targeting modern tech-empowered rural farmers, AgriMind Pro seamlessly layers complex backend API integrations (Agmarknet scraping, Leaflet map derivations, Google Maps integrations, and Supabase RLS) behind a beautiful, GSAP and Framer Motion powered interface.

---

## 3. COMPLETE FEATURE ANALYSIS

### 3.1 Fassal Deal Engine (Market Deal Optimizer)

**Description:** The flagship feature - a sophisticated pipeline that evaluates live APMC Mandi prices, subtracts granular logistics costs, and ranks markets by purely Net Profit in Hand rather than gross price.

**Key Capabilities:**

- **Multi-Source Price Aggregation:**
  - Live Agmarknet API scraping for real-time mandi prices
  - Fallback to local price database with 50+ markets
  - Support for 10+ crop types (tomato, onion, wheat, grapes, etc.)

- **Intelligent Transport Calculation:**
  - Haversine distance calculation between farmer and mandi
  - Transport cost estimation: ₹3/km × distance × quantity
  - Hamali (weighing) charges: ₹20/quintal
  - Loading charges: ₹45/quintal
  - Unloading charges: ₹30/quintal
  - Mandi commission: 2% of gross amount

- **Quality Grade Adjustment:**
  - Grade A: +10% price multiplier
  - Grade B: Standard price
  - Grade C: -15% price multiplier

- **Private Buyer Integration:**
  - Export houses with 8% premium
  - FPOs with 5% premium
  - Private buyers with 3% premium
  - Cold storage options

- **Deal Badges:**
  - BEST_DEAL: Maximum net profit
  - HIGHEST_PRICE: Best per-quintal rate
  - NEAREST: Shortest distance

**User Flow:** Crop Select → Quality Grade → Quantity Input → Location/GPS → Radius Selection → Market Scanning → Results sorted by Net Profit

### 3.2 Livestock & Cattle Management (LeadNova CRM)

**Description:** Comprehensive herd management system with AI-powered health insights and production tracking.

**Features:**

- **Herd Registration:**
  - Species tracking (Buffalo, Cow, Goat, Sheep)
  - Breed and variety recording
  - Age and birth date tracking
  - Tag number and identification
  - Parentage tracking

- **Health Management:**
  - Vaccination schedule with reminders
  - Deworming tracking
  - AI-powered health diagnosis via Groq
  - Treatment history logging
  - Health status indicators (healthy, sick, pregnant, recovering)

- **Milk Production Tracking:**
  - Daily milk yield recording (morning/evening)
  - Fat and SNF percentage logging
  - Production analytics and charts
  - Lactation period tracking

- **Task Management:**
  - Automated task board for daily operations
  - Feeding schedules
  - Milking reminders
  - Veterinary visits

- **AI Health Advisor:**
  - Groq LLaMA integration for disease diagnosis
  - Symptom analysis
  - Treatment recommendations
  - Nutritional advice

- **Partition System:**
  - Species-based categorization
  - Filterable herd views
  - Group analytics

### 3.3 AI-Powered Chat Assistant

**Description:** Intelligent farm assistant using Groq LLaMA and Google Gemini models.

**Capabilities:**

- **Multi-Provider AI:**
  - Primary: Groq LLaMA 3.3 70B Versatile
  - Fallback: Google Gemini 2.0 Flash Lite
  - Automatic failover on API failures

- **Context-Aware Responses:**
  - Real-time farm database integration
  - Live weather API data
  - Crop health status
  - Financial records
  - Active alerts

- **Weather Integration:**
  - OpenWeatherMap API for live data
  - Temperature, humidity, wind speed
  - Sunrise/sunset times
  - Visibility and cloud cover
  - 5-day forecast capability

- **Available Tools:**
  - optimize_irrigation()
  - calculate_pnl()
  - trigger_spray_drone()
  - generate_alerts()
  - analyze_soil()

- **Tone Modes:**
  - Greeting: Short, warm, conversational
  - Analysis: Professional, data-driven with confidence scores

### 3.4 Crop Management System

**Description:** Complete crop lifecycle tracking from sowing to harvest.

**Features:**

- **Crop Registration:**
  - Multiple crop types support
  - Variety and season tracking
  - Growth stage monitoring
  - Health index scoring (0-100)

- **Timeline Management:**
  - Sowing date recording
  - Expected harvest date
  - Actual harvest tracking
  - Growth stage progression

- **Yield Tracking:**
  - Expected yield (kg)
  - Actual yield recording
  - Market price per kg
  - Projected income calculation

- **Water Requirements:**
  - Daily water need (liters)
  - Irrigation dependency tracking
  - Drought vulnerability assessment

- **Status Tracking:**
  - Growing
  - Flowering
  - Fruiting
  - Harvested
  - Failed

### 3.5 Farm Management

**Description:** Multi-farm support with plot-level analytics.

**Features:**

- **Farm Registration:**
  - Plot ID generation
  - GPS coordinates (lat/lng)
  - Area calculation (sqm/acres)
  - Soil type classification
  - Terrain mapping
  - Water source identification

- **Soil Data Collection:**
  - Moisture percentage
  - pH level
  - NPK levels (Nitrogen, Phosphorus, Potassium)
  - Organic matter percentage
  - Temperature
  - Salinity

- **Auto-Alert Triggers:**
  - Low moisture alerts (<30%)
  - pH level alerts (outside 5.5-7.5)
  - Nutrient deficiency warnings

### 3.6 Operational Scheduling

**Description:** AI-powered scheduling for farm operations.

#### 3.6.1 Irrigation Schedules

- Scheduled date/time
- Duration (minutes)
- Water volume (liters)
- Method (drip, sprinkler, flood)
- Cost calculation
- AI recommendations based on soil moisture

#### 3.6.2 Spray Schedules

- Chemical name and type
- Dosage (ml/liter)
- Water volume
- Area coverage
- Weather suitability check
- Cost tracking (chemical + labor)
- AI recommendations for pest control

#### 3.6.3 Fertilization Schedules

- Fertilizer type and NPK ratio
- Quantity (kg)
- Application method
- Growth stage targeting
- Cost calculation
- Expected yield boost percentage
- AI recommendations based on soil data

### 3.7 Financial Management

**Description:** Complete farm accounting with profit & loss tracking.

**Features:**

- **Income Tracking:**
  - Crop sales
  - Milk sales
  - Other farm income
  - Payment method recording

- **Expense Categories:**
  - Irrigation costs
  - Fertilizer expenses
  - Spray/chemical costs
  - Labor costs
  - Equipment maintenance
  - Seeds and inputs

- **Analytics:**
  - Monthly/seasonal P&L
  - ROI calculation
  - Profit per acre
  - Category-wise expense breakdown

- **Automated Recording:**
  - Trigger-based expense logging
  - Irrigation cost auto-entry on completion

### 3.8 Weather Integration

**Description:** Real-time weather data for farming decisions.

**Features:**

- Current conditions (temperature, humidity, wind)
- 5-day forecast
- Rain probability
- UV index
- Sunlight hours
- Weather condition descriptions
- Farm-specific alerts

### 3.9 Equipment Management

**Description:** Farm equipment tracking and maintenance.

**Features:**

- Equipment inventory
- Purchase cost tracking
- Maintenance schedules
- Status tracking (operational, maintenance, retired)
- Fuel type and efficiency
- Next maintenance reminders

### 3.10 Alert System

**Description:** Intelligent alert generation for farm operations.

**Alert Types:**

- Irrigation alerts
- Soil health alerts
- Crop disease alerts
- Weather alerts
- Financial alerts
- Equipment maintenance alerts

**Severity Levels:**

- Critical (immediate action required)
- High (within 24 hours)
- Medium (within 3 days)
- Low (informational)

**Features:**

- Read/unread status
- Resolution tracking
- AI confidence scoring
- Auto-generated and manual alerts

### 3.11 AI Image Analysis (Disease Detection)

**Description:** Crop disease detection through image analysis.

**Features:**

- Image upload capability
- AI-powered disease identification
- Treatment recommendations
- Confidence scores
- Historical analysis

---

## 4. UNIQUE SELLING POINTS (USPs)

1. **AI-Powered "Fassal Deal" Engine:** A highly sophisticated pipeline that evaluates live APMC Mandi prices, subtracts granular logistics costs (Hamali, Tolay, Commission, Per-KM Transport derived from exact Haversine mathematical equations), and ranks markets by purely Net Profit in Hand rather than gross price.

2. **Groq & Gemini AI Integration:** Deeply embedded LLMs power features like the *AI Cattle Health Advisor* and *Personalized Cold Outreach*, replacing generic static tips with real-time, context-aware artificial intelligence.

3. **Modern Micro-interaction UI:** Moving away from traditional, clunky enterprise software, AgriMind leverages `framer-motion`, `gsap`, and `lenis` smooth scrolling to deliver a premium, glassmorphism-inspired aesthetic with state-of-the-art cinematic animations.

4. **Supabase Real-Time & RLS Security:** Row Level Security (RLS) policies guarantee that no farmer can sniff or scrape another's data. Everything is synchronized seamlessly through Supabase Realtime subscriptions.

5. **Multi-Modal Architecture:** The platform bridges different paradigms perfectly by utilizing Server Actions for secure processing and Client Components for dense interactivity (like 3D fiber components).

6. **Geolocation Intelligence:** By taking exact GPS coordinates from the user and accurately matching them against a strictly maintained dictionary of APMC Mandi coordinates (`KNOWN_COORDS`), the app does accurate geographic radius bounding (e.g., precise 100km radii mapping).

7. **Multilingual Foundations:** Integrated robust support for multiple localized languages natively using `i18next` and `i18next-browser-languagedetector`.

8. **Automated Trigger System:** Database triggers automatically generate alerts for soil moisture, pH levels, and crop health degradation without manual intervention.

9. **Complete Financial Ecosystem:** From expense tracking to ROI calculation, farmers get a complete financial picture of their operations.

---

## 5. TECHNICAL STACK ANALYSIS

### Frontend:

- **Framework:** Next.js 14.2.15 (App Router Paradigm)
- **Library:** React 18.3.1
- **Styling:** Tailwind CSS 3.4.0 with granular utilities, custom animations (`@keyframes`), and Glassmorphism design patterns.
- **Animations:** Framer Motion (`12.38.0`), GSAP (`3.14.2`), React Three Fiber (`8.18.0`), React Three Drei.
- **State Management:** React local state (`useState`, `useReducer`), Context API, alongside optimized `useMemo` hooks.
- **Form Handling Validation:** React Hook Form (`7.72.1`) accompanied by Zod (`4.3.6`) for bulletproof strongly typed schema validation.
- **Accessibility:** Radix UI primitives & Lucide React (`1.7.0`) iconography ensuring semantic HTML delivery.
- **Scrolling Enhancements:** Lenis (`1.3.21`) for butter-smooth inertial scaling.
- **Charts:** Recharts for data visualization
- **PDF Generation:** jsPDF for report generation
- **Email Service:** EmailJS for notifications

### Backend:

- **Server Framework:** Next.js API Routes / App Router Route Handlers (`app/api/*`)
- **Database Integration:** `@supabase/ssr` bridging Next.js Auth with Supabase PostgREST layer.
- **LLM Providers:** Google Generative AI SDK, OpenAI SDK (configured to utilize Groq LLaMA models).
- **Web Scraping/Parsing:** Cheerio (`1.2.0`) for real-time parsing of agricultural news and Agmarknet boards.
- **HTTP Client:** Axios for API integrations

### Database (Supabase / PostgreSQL):

- **Capabilities Applied:** Supabase Auth (User tables), Postgres Functions, Row Level Security (RLS), Array/JSONB columns, Triggers, Stored Procedures, Views
- **Realtime:** Supabase Realtime subscriptions for live data updates

### Development Tools:

- **Package Manager:** PNPM (Performant NPM)
- **Linting/Formatting:** ESLint integrated into the Next build pipeline
- **Language:** TypeScript ensuring completely type-safe contract interfaces across the stack

---

## 6. DATABASE ARCHITECTURE

### Complete Schema Overview (14 Tables + Views + Functions + Triggers)

#### Table 1: `profiles` (User Management)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | User identifier |
| `full_name` | TEXT | NOT NULL | User's full name |
| `email` | TEXT | NOT NULL, UNIQUE | Email address |
| `phone` | TEXT | | Phone number |
| `avatar_url` | TEXT | | Profile image URL |
| `location` | TEXT | | Geographic location |
| `farming_experience` | TEXT | | Years of experience |
| `total_land` | DECIMAL(10,2) | | Total land in acres |
| `subscription_plan` | VARCHAR(20) | DEFAULT 'free' | Subscription tier |

#### Table 2: `farms` (Farm Plots)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Farm identifier |
| `farmer_id` | UUID | REFERENCES farmers(id) | Owner reference |
| `user_id` | UUID | | Auth user ID |
| `name` | VARCHAR(100) | NOT NULL | Farm name |
| `plot_id` | VARCHAR(20) | UNIQUE | Plot reference |
| `location_lat` | DECIMAL(10,8) | | GPS latitude |
| `location_lng` | DECIMAL(11,8) | | GPS longitude |
| `area_sqm` | DECIMAL(10,2) | NOT NULL | Area in sq meters |
| `area_acres` | DECIMAL(10,4) | | Area in acres |
| `soil_type` | VARCHAR(50) | | Soil classification |
| `terrain` | VARCHAR(50) | | Terrain type |
| `water_source` | VARCHAR(100) | | Water source type |

#### Table 3: `crops` (Crop Management)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Crop identifier |
| `farm_id` UUID | REFERENCES farms(id) | Farm reference |
| `user_id` | UUID | | Owner user ID |
| `name` | VARCHAR(100) | NOT NULL | Crop name |
| `variety` | VARCHAR(100) | | Crop variety |
| `crop_type` | VARCHAR(50) | | Crop category |
| `season` | VARCHAR(30) | | Growing season |
| `sowing_date` | DATE | NOT NULL | Sowing date |
| `expected_harvest_date` | DATE | | Expected harvest |
| `actual_harvest_date` | DATE | | Actual harvest |
| `area_allocated_sqm` | DECIMAL(10,2) | | Area under crop |
| `water_requirement_liters_per_day` | DECIMAL(10,2) | | Daily water need |
| `expected_yield_kg` | DECIMAL(10,2) | | Expected production |
| `actual_yield_kg` | DECIMAL(10,2) | | Actual production |
| `market_price_per_kg` | DECIMAL(10,2) | | Expected price |
| `status` | VARCHAR(30) | DEFAULT 'growing' | Crop status |
| `health_index` | INTEGER | DEFAULT 85 | Health score (0-100) |
| `growth_stage` | VARCHAR(50) | | Current stage |

#### Table 4: `soil_data` (Soil Monitoring)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Record ID |
| `farm_id` | UUID | REFERENCES farms(id) | Farm reference |
| `recorded_at` | TIMESTAMPTZ | DEFAULT NOW() | Record timestamp |
| `moisture_percent` | DECIMAL(5,2) | | Soil moisture |
| `ph_level` | DECIMAL(4,2) | | pH value |
| `nitrogen_ppm` | DECIMAL(8,2) | | N (ppm) |
| `phosphorus_ppm` | DECIMAL(8,2) | | P (ppm) |
| `potassium_ppm` | DECIMAL(8,2) | | K (ppm) |
| `organic_matter_percent` | DECIMAL(5,2) | | Organic matter % |
| `temperature_celsius` | DECIMAL(5,2) | | Soil temperature |
| `salinity_ds_per_m` | DECIMAL(6,3) | | Salinity |
| `data_source` | VARCHAR(30) | DEFAULT 'manual' | Data origin |

#### Table 5: `weather_data` (Weather Records)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Record ID |
| `farm_id` | UUID | REFERENCES farms(id) | Farm reference |
| `recorded_at` | TIMESTAMPTZ | DEFAULT NOW() | Record timestamp |
| `temperature_celsius` | DECIMAL(5,2) | | Temperature |
| `humidity_percent` | DECIMAL(5,2) | | Humidity |
| `wind_speed_mps` | DECIMAL(6,2) | | Wind speed |
| `wind_direction` | VARCHAR(10) | | Wind direction |
| `rainfall_mm` | DECIMAL(8,2) | | Rainfall |
| `uv_index` | DECIMAL(4,1) | | UV index |
| `sunlight_hours` | DECIMAL(4,1) | | Sunlight hours |
| `weather_condition` | VARCHAR(50) | | Weather state |
| `forecast_rain_probability` | INTEGER | | Rain chance % |

#### Table 6: `irrigation_schedules` (Irrigation Planning)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Schedule ID |
| `farm_id` | UUID | REFERENCES farms(id) | Farm reference |
| `crop_id` | UUID | REFERENCES crops(id) | Crop reference |
| `scheduled_date` | DATE | NOT NULL | Planned date |
| `scheduled_time` | TIME | NOT NULL | Planned time |
| `duration_minutes` | INTEGER | | Duration |
| `water_volume_liters` | DECIMAL(10,2) | | Water volume |
| `method` | VARCHAR(30) | | Irrigation method |
| `status` | VARCHAR(20) | DEFAULT 'pending' | Schedule status |
| `ai_recommended` | BOOLEAN | DEFAULT FALSE | AI recommendation |
| `actual_water_used` | DECIMAL(10,2) | | Actual usage |
| `cost_per_liter` | DECIMAL(8,4) | DEFAULT 0.002 | Water cost |
| `total_cost` | DECIMAL(10,2) | | Total cost |

#### Table 7: `spray_schedules` (Pest Control)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Schedule ID |
| `farm_id` | UUID | REFERENCES farms(id) | Farm reference |
| `crop_id` | UUID | REFERENCES crops(id) | Crop reference |
| `spray_type` | VARCHAR(50) | | Spray category |
| `chemical_name` | VARCHAR(100) | | Chemical used |
| `dosage_ml_per_liter` | DECIMAL(8,3) | | Dosage rate |
| `water_volume_liters` | DECIMAL(10,2) | | Water volume |
| `area_covered_sqm` | DECIMAL(10,2) | | Coverage area |
| `scheduled_date` | DATE | NOT NULL | Planned date |
| `status` | VARCHAR(20) | DEFAULT 'pending' | Schedule status |
| `cost_per_liter_chemical` | DECIMAL(10,2) | | Chemical cost |
| `total_cost` | DECIMAL(10,2) | | Total cost |
| `ai_recommended` | BOOLEAN | DEFAULT FALSE | AI recommendation |
| `weather_suitable` | BOOLEAN | DEFAULT TRUE | Weather check |

#### Table 8: `fertilization_schedules` (Nutrient Management)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Schedule ID |
| `farm_id` | UUID | REFERENCES farms(id) | Farm reference |
| `crop_id` | UUID | REFERENCES crops(id) | Crop reference |
| `fertilizer_name` | VARCHAR(100) | | Fertilizer name |
| `fertilizer_type` | VARCHAR(50) | | Fertilizer type |
| `npk_ratio` | VARCHAR(20) | | NPK ratio |
| `quantity_kg` | DECIMAL(10,2) | | Quantity |
| `application_method` | VARCHAR(50) | | Application way |
| `scheduled_date` | DATE | NOT NULL | Planned date |
| `growth_stage` | VARCHAR(50) | | Target stage |
| `status` | VARCHAR(20) | DEFAULT 'pending' | Status |
| `cost_per_kg` | DECIMAL(10,2) | | Unit cost |
| `total_cost` | DECIMAL(10,2) | | Total cost |
| `ai_recommended` | BOOLEAN | DEFAULT FALSE | AI recommendation |
| `expected_yield_boost_percent` | DECIMAL(5,2) | | Yield impact |

#### Table 9: `financial_records` (Accounting)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Record ID |
| `farm_id` | UUID | REFERENCES farms(id) | Farm reference |
| `crop_id` | UUID | REFERENCES crops(id) | Crop reference |
| `record_type` | VARCHAR(30) | NOT NULL | income/expenditure |
| `category` | VARCHAR(50) | NOT NULL | Expense category |
| `amount` | DECIMAL(12,2) | NOT NULL | Amount in ₹ |
| `quantity` | DECIMAL(10,2) | | Quantity |
| `unit` | VARCHAR(20) | | Unit |
| `description` | TEXT | | Details |
| `record_date` | DATE | NOT NULL | Transaction date |
| `payment_method` | VARCHAR(30) | | Payment way |

#### Table 10: `alerts` (Notification System)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Alert ID |
| `farm_id` | UUID | REFERENCES farms(id) | Farm reference |
| `crop_id` | UUID | REFERENCES crops(id) | Crop reference |
| `alert_type` | VARCHAR(50) | NOT NULL | Alert category |
| `severity` | VARCHAR(20) | NOT NULL | Priority level |
| `title` | VARCHAR(200) | NOT NULL | Alert title |
| `message` | TEXT | NOT NULL | Alert message |
| `action_required` | TEXT | | Recommended action |
| `is_read` | BOOLEAN | DEFAULT FALSE | Read status |
| `is_resolved` | BOOLEAN | DEFAULT FALSE | Resolution status |
| `auto_generated` | BOOLEAN | DEFAULT TRUE | Auto/Manual |
| `ai_confidence` | DECIMAL(5,2) | | AI confidence % |

#### Table 11: `equipment` (Asset Management)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Equipment ID |
| `farm_id` | UUID | REFERENCES farms(id) | Farm reference |
| `name` | VARCHAR(100) | | Equipment name |
| `equipment_type` | VARCHAR(50) | | Equipment category |
| `purchase_date` | DATE | | Purchase date |
| `purchase_cost` | DECIMAL(10,2) | | Purchase price |
| `maintenance_cost_monthly` | DECIMAL(10,2) | | Monthly cost |
| `status` | VARCHAR(20) | DEFAULT 'operational' | Current status |
| `last_maintenance_date` | DATE | | Last service |
| `next_maintenance_date` | DATE | | Next service |
| `fuel_type` | VARCHAR(30) | | Fuel type |
| `fuel_efficiency` | DECIMAL(6,2) | | Efficiency |

#### Table 12: `ai_interactions` (AI Chat Logs)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Interaction ID |
| `farmer_id` | UUID | REFERENCES farmers(id) | User reference |
| `farm_id` | UUID | REFERENCES farms(id) | Farm reference |
| `interaction_type` | VARCHAR(50) | NOT NULL | Type (chat/image) |
| `prompt` | TEXT | | User input |
| `response` | TEXT | | AI response |
| `context_data` | JSONB | | Context metadata |
| `tokens_used` | INTEGER | | API tokens used |
| `model_used` | VARCHAR(50) | | AI model name |
| `confidence_score` | DECIMAL(5,2) | | Response confidence |
| `was_helpful` | BOOLEAN | | User feedback |

#### Table 13: `plot_analytics` (Business Intelligence)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Analytics ID |
| `farm_id` | UUID | REFERENCES farms(id) | Farm reference |
| `analysis_date` | DATE | NOT NULL | Analysis date |
| `total_income` | DECIMAL(12,2) | | Total income |
| `total_expenditure` | DECIMAL(12,2) | | Total expenses |
| `net_profit` | DECIMAL(12,2) | | Net profit |
| `water_used_liters` | DECIMAL(12,2) | | Water consumption |
| `fertilizer_used_kg` | DECIMAL(10,2) | | Fertilizer usage |
| `spray_cost` | DECIMAL(10,2) | | Spray expenses |
| `labor_cost` | DECIMAL(10,2) | | Labor costs |
| `yield_kg` | DECIMAL(10,2) | | Total yield |
| `profit_per_acre` | DECIMAL(12,2) | | Per-acre profit |
| `roi_percent` | DECIMAL(8,2) | | ROI percentage |

#### Table 14: `cattle_management` (Livestock - Additional Table)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Cattle ID |
| `owner_id` | UUID | REFERENCES auth.users(id) | Owner |
| `species` | VARCHAR(50) | NOT NULL | Animal type |
| `breed` | VARCHAR(100) | | Breed |
| `tag_number` | VARCHAR(50) | | Tag ID |
| `name` | VARCHAR(100) | | Animal name |
| `gender` | VARCHAR(20) | | Male/Female |
| `date_of_birth` | DATE | | Birth date |
| `age_months` | INTEGER | | Age |
| `weight_kg` | DECIMAL(8,2) | | Weight |
| `health_status` | VARCHAR(30) | DEFAULT 'healthy' | Health |
| `last_vaccination` | DATE | | Last vaccine |
| `next_vaccination` | DATE | | Next vaccine |
| `last_deworming` | DATE | | Last deworming |
| `milk_production_morning` | DECIMAL(8,2) | | Morning yield |
| `milk_production_evening` | DECIMAL(8,2) | | Evening yield |
| `fat_percentage` | DECIMAL(4,2) | | Fat % |
| `snf_percentage` | DECIMAL(4,2) | | SNF % |
| `lactation_number` | INTEGER | | Lactation count |
| `calving_date` | DATE | | Last calving |
| `pregnant` | BOOLEAN | DEFAULT FALSE | Pregnancy status |
| `due_date` | DATE | | Expected calving |
| `notes` | TEXT | | Additional notes |
| `image_url` | TEXT | | Animal photo |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Record date |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Update date |

#### Table 15: `cattle_tasks` (Livestock Operations)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Task ID |
| `cattle_id` | UUID | REFERENCES cattle_management(id) | Animal |
| `task_type` | VARCHAR(50) | NOT NULL | Task type |
| `description` | TEXT | | Task details |
| `scheduled_date` | DATE | NOT NULL | Due date |
| `status` | VARCHAR(20) | DEFAULT 'pending' | Status |
| `priority` | VARCHAR(20) | DEFAULT 'normal' | Priority |
| `assigned_to` | VARCHAR(100) | | Assigned person |
| `completed_at` | TIMESTAMPTZ | | Completion date |
| `notes` | TEXT | | Notes |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation date |

#### Table 16: `fassal_deal_searches` (Deal History)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Search ID |
| `user_id` | UUID | REFERENCES auth.users(id) | User |
| `crop_name` | VARCHAR(100) | NOT NULL | Crop |
| `crop_variety` | VARCHAR(100) | | Variety |
| `crop_quality` | VARCHAR(10) | | Grade |
| `quantity_kg` | NUMERIC | | Quantity (kg) |
| `quantity_quintals` | NUMERIC | NOT NULL | Quantity (quintal) |
| `farmer_lat` | NUMERIC(10,6) | NOT NULL | Latitude |
| `farmer_lng` | NUMERIC(10,6) | NOT NULL | Longitude |
| `farmer_district` | VARCHAR(100) | | District |
| `farmer_state` | VARCHAR(100) | | State |
| `search_radius_km` | INTEGER | DEFAULT 100 | Radius |
| `deals_found` | INTEGER | DEFAULT 0 | Results count |
| `best_deal_profit` | NUMERIC | | Best profit |
| `ai_market_summary` | TEXT | | AI analysis |
| `completed_at` | TIMESTAMPTZ | | Completion time |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation time |

#### Table 17: `fassal_deal_results` (Deal Details)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Result ID |
| `search_id` | UUID | REFERENCES fassal_deal_searches(id) | Search ref |
| `buyer_type` | VARCHAR(30) | | Buyer category |
| `buyer_name` | VARCHAR(200) | | Buyer name |
| `buyer_location` | TEXT | | Location |
| `buyer_lat` | NUMERIC(10,6) | | Latitude |
| `buyer_lng` | NUMERIC(10,6) | | Longitude |
| `buyer_district` | VARCHAR(100) | | District |
| `buyer_rating` | DECIMAL(3,2) | | Rating |
| `buyer_verified` | BOOLEAN | | Verified status |
| `buyer_phone` | VARCHAR(20) | | Contact |
| `distance_km` | DECIMAL(10,2) | | Distance |
| `price_per_quintal` | DECIMAL(12,2) | | Price |
| `gross_amount` | DECIMAL(12,2) | | Gross total |
| `transport_cost_total` | DECIMAL(12,2) | | Transport |
| `mandi_commission_amount` | DECIMAL(12,2) | | Commission |
| `total_deductions` | DECIMAL(12,2) | | All deductions |
| `net_profit_in_hand` | DECIMAL(12,2) | | Net profit |
| `rank` | INTEGER | | Deal ranking |
| `deal_badge` | VARCHAR(30) | | Badge |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation |

### Database Views

#### View 1: `farm_dashboard_view`
Complete farm overview combining farmer, farm, crop, soil, and weather data.

#### View 2: `plot_financial_summary`
Financial aggregates per plot including income, expenditure, and profit.

#### View 3: `soil_analytics_view`
Weekly soil analytics with averages and trends.

### Stored Procedures

#### Function 1: `generate_weekly_irrigation_schedule(p_farm_id UUID)`
Automatically generates 7-day irrigation schedule based on soil moisture and crop requirements.

#### Function 2: `calculate_plot_pnl(p_farm_id UUID, p_month DATE)`
Calculates complete P&L for a plot including ROI and profit per acre.

### Database Triggers

#### Trigger 1: `soil_moisture_alert_trigger`
Automatically creates alerts when soil moisture drops below 30%.

#### Trigger 2: `irrigation_cost_trigger`
Automatically records irrigation expenses when irrigation is marked complete.

#### Trigger 3: `crop_health_alert_trigger`
Creates alerts when crop health index drops below 60%.

#### Trigger 4: `update_farmers_updated_at`
Automatically updates timestamps on farmer record changes.

---

## 7. API ENDPOINTS

### AI Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ai/chat` | POST | AI Chat with Groq/Gemini |
| `/api/ai/analyze-image` | POST | Crop disease image analysis |
| `/api/ai/history` | GET | Fetch AI interaction history |

### Fassal Deal Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/fassal-deal/analyze` | POST | Analyze market deals |
| `/api/fassal-deal/mandi-prices` | GET | Fetch live mandi prices |
| `/api/fassal-deal/history` | GET | Search history |
| `/api/fassal-deal/saved-deals` | POST/GET | Save/view deals |
| `/api/fassal-deal/predict` | POST | Price prediction |

### Utility Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/simulate` | GET/POST | Data simulation |

---

## 8. CODE HIGHLIGHTS

### Haversine Distance Calculator

```typescript
export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lng2 - lng1) * Math.PI / 180;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
            
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
```

### AI Chat System Prompt

```
ROLE: You are the Lead Agronomist and Financial Controller for AgriMind Pro.

TASK: Analyze the Farm Database — Soil Health, Weather API data, Crop Phenology (growth stages), and Financial Ledger.

ANALYSIS PROTOCOL:
1. DATA CROSS-REFERENCING: Match current weather against crop stage vulnerabilities
2. ANOMALY DETECTION: Identify if DB values correlate with weather forecasts
3. FINANCIAL IMPACT: Every recommendation must be weighed against Monthly P&L
4. ACTIONABLE OUTPUT: End every analysis with a specific "Execute" command
```

---

## 9. SYSTEM ARCHITECTURE

### Application Flow

```
User Request
    ↓
Next.js Middleware (Auth Check)
    ↓
API Route Handler
    ↓
├── Supabase Database Query
├── Agmarknet Web Scraping
├── Weather API Fetch
└── AI Model Processing (Groq/Gemini)
    ↓
Haversine Distance Calculation
    ↓
Transport Cost Estimation
    ↓
Net Profit Ranking
    ↓
Response to Client
    ↓
Framer Motion UI Render
```

### Authentication Flow

1. User enters credentials
2. Next.js Server Action executes sign-in
3. Supabase Auth validates credentials
4. HttpOnly cookies set
5. Middleware enforces protected routes

---

## 10. SECURITY IMPLEMENTATIONS

### Row Level Security (RLS)

All tables have RLS enabled with policies ensuring:

- Users can only access their own data
- API keys are never exposed to client
- Input validation via Zod schemas

### API Security

- Server-side API key storage
- Rate limiting ready
- Input sanitization
- Fallback pseudo-data on API failures

---

## 11. CHALLENGES & SOLUTIONS

### Challenge 1: Distance Calculation Bug
- **Problem:** 0km distance showing for some mandis
- **Solution:** Filter `(lat !== farmerLat || lng !== farmerLng) ? distance : 9999`

### Challenge 2: Leaflet Map Hydration Errors
- **Problem:** React-Leaflet causing Next.js hydration failures
- **Solution:** Replaced with direct Google Maps URL encoding

### Challenge 3: AI API Failures
- **Problem:** Single AI provider failure causing app crashes
- **Solution:** Implemented Groq → Gemini fallback chain

---

## 12. UI/UX FEATURES

### Design System

- **Glassmorphism Cards:** `backdrop-filter: blur(20px)`
- **Animated Transitions:** Framer Motion
- **Smooth Scrolling:** Lenis integration
- **3D Elements:** React Three Fiber

### Landing Page Components

- Hero Section with animations
- Features showcase
- Pricing section
- Testimonials
- FAQ
- Final CTA

### Dashboard Components

- Weather Hero
- Metric Cards
- Farm Map
- Data Tables
- Charts (Recharts)

---

## 13. PROJECT STRUCTURE

```
agrimind-pro/
├── app/
│   ├── (auth)/
│   │   └── login/
│   ├── (dashboard)/
│   │   ├── ai/
│   │   ├── cattle/
│   │   ├── crops/
│   │   ├── dashboard/
│   │   ├── fassal-deal/
│   │   ├── finance/
│   │   ├── Kisanglobal/
│   │   ├── livestock-management/
│   │   ├── reports/
│   │   ├── settings/
│   │   ├── spray/
│   │   └── weather/
│   ├── (onboarding)/
│   │   └── onboarding/
│   ├── (public)/
│   │   ├── landing/
│   │   └── page.tsx
│   ├── api/
│   │   ├── ai/
│   │   ├── fassal-deal/
│   │   └── simulate/
│   └── layout.tsx
├── components/
│   ├── dashboard/
│   ├── fassal-deal/
│   ├── layout/
│   ├── landing/
│   ├── livestock-management/
│   └── shared/
├── lib/
│   ├── fassal-deal/
│   │   ├── agmarknet-api.ts
│   │   ├── haversine.ts
│   │   └── transport-calculator.ts
│   └── supabase.ts
├── SQL/
│   ├── schema.sql
│   ├── migration-unified-schema.sql
│   └── sample-data.sql
├── types/
│   ├── database.ts
│   ├── fassal-deal.ts
│   └── index.ts
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

---

## 14. PROJECT STATISTICS

- **Lines of Code (Core Engine):** >15,000 LOC
- **Tech Dependencies:** 35+
- **Frontend Modules:** ~80 bespoke components
- **Unique Features:** 15+ primary modules
- **Database Schema Density:** 17 relational Postgres tables
- **API Endpoints:** 10+
- **Views:** 3
- **Stored Procedures:** 2
- **Database Triggers:** 4
- **Supported Crop Types:** 10+
- **Supported Markets:** 50+

---

## 15. FUTURE ENHANCEMENTS

1. **AI Voice Commands:** Voice-to-text for rural farmers
2. **WhatsApp Bot Integration:** Twilio-based market alerts
3. **Peer-to-Peer Trading:** Blockchain crop handoffs
4. **Weather API Injection:** Dynamic monsoon-based recommendations
5. **Drone Integration:** Automated crop monitoring
6. **Multi-language Support:** Regional language AI responses

---

## 16. LEARNING OUTCOMES

- **Geospatial Logic:** Haversine distance mathematics
- **Next.js Optimization:** Escaping heavy libraries for performance
- **AI Integration:** Multi-provider fallback systems
- **Database Design:** Complex PostgreSQL with triggers and RLS
- **Real-time Systems:** Supabase Realtime subscriptions

---

## 17. CONCLUSION

**AgriMind Pro** represents the pinnacle of combining bleeding-edge web technology with real-world traditional agricultural workflows. Through meticulous problem solving—identifying subtle logic faults within server-side Haversine bounds, dynamically pruning library overload, and rigorously layering Gen-AI on top of deeply reliable Supabase database systems—the project establishes itself not merely as another management tool, but as a proactive "Agricultural OS".

The platform provides:

- Complete farm-to-market intelligence
- AI-powered decision support
- Real-time weather monitoring
- Comprehensive financial tracking
- Livestock management with health AI
- Automated operational scheduling

The technical foundations laid here natively promise unbounded horizontal scalability, making AgriMind Pro the future of smart agriculture management.

---

## 18. APPENDIX

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GROQ_API_KEY=your-key
OPENAI_API_KEY=your-key
GEMINI_API_KEY=your-key
NEXT_PUBLIC_SUPABASE_URL=your-url
```

### Installation

```bash
pnpm install
pnpm dev
```

Server initiates on http://localhost:3000

---

*(End of Detailed Project Report)*
