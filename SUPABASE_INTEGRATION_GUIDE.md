# AgriMind Pro - Supabase Integration Guide

## 🎯 Overview

Your AgriMind Pro dashboard has been refactored to use **real-time Supabase queries** instead of hardcoded data. All tabs (Dashboard, Crops, Cattle, Settings) now dynamically fetch, create, and update data from your Supabase database.

---

## 📋 Setup Instructions

### Step 1: Run the SQL Migration

1. Go to your **Supabase Dashboard**: https://app.supabase.com
2. Select your project: `rrbqifrclinorpnwmwcp`
3. Navigate to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy and paste the contents of `sql/migration-unified-schema.sql`
6. Click **Run** (or press `Ctrl+Enter`)

This migration will:
- ✅ Create the `profiles` table (linked to `auth.users`)
- ✅ Create the `farm_metrics` table for real-time metrics
- ✅ Add `user_id` column to `farms` table
- ✅ Set up Row Level Security (RLS) policies
- ✅ Enable Realtime subscriptions
- ✅ Create helper functions and triggers

### Step 2: Enable Realtime in Supabase Dashboard

After running the SQL:

1. Go to **Database** > **Replication** (in Supabase sidebar)
2. Enable realtime for these tables (toggle the switch):
   - `profiles`
   - `farms`
   - `crops`
   - `soil_data`
   - `weather_data`
   - `farm_metrics`
   - `cattle` (already enabled from cattle schema)
   - `milk_production`
   - `health_records`

### Step 3: Verify Environment Variables

Your `.env.local` file already has the correct variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://rrbqifrclinorpnwmwcp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

✅ These are already configured correctly.

### Step 4: Restart Your Dev Server

```bash
# Stop the current dev server (Ctrl+C)
# Then restart:
pnpm dev
```

---

## 🏗️ What Changed

### Files Modified

| File | Changes |
|------|---------|
| `app/(dashboard)/dashboard/page.tsx` | Replaced mock data with Supabase queries, added loading/empty states, enabled realtime |
| `app/(dashboard)/crops/page.tsx` | Updated to fetch user-specific crops, added loading skeleton, realtime updates |
| `app/(dashboard)/settings/page.tsx` | Now reads/writes to `profiles` table instead of `farmers` |
| `types/index.ts` | Added `Profile` type (backwards compatible with `Farmer`) |
| `components/shared/LoadingSkeleton.tsx` | **NEW** - Reusable skeleton loaders and empty states |
| `sql/migration-unified-schema.sql` | **NEW** - Database migration script |

### Architecture Changes

**Before:**
```
Dashboard → Hardcoded mockData → Static display
```

**After:**
```
Dashboard → Supabase Query → Real-time data → Auto-updates on changes
   ↓
Supabase Realtime Subscription → Listens for DB changes → Refreshes data
```

---

## 🗄️ Database Schema

### New Tables Created

| Table | Purpose | Linked To |
|-------|---------|-----------|
| `profiles` | User profiles (replaces `farmers`) | `auth.users(id)` |
| `farm_metrics` | Real-time farm metrics (soil, weather) | `profiles(id)`, `farms(id)` |

### Updated Tables

| Table | Change |
|-------|--------|
| `farms` | Added `user_id` column (references `auth.users`) |

### Data Flow

```
User Signs Up/In
    ↓
Profile Auto-Created (trigger)
    ↓
User Creates Farm (onboarding or crops page)
    ↓
User Adds Crops/Cattle
    ↓
Dashboard Fetches Everything in Real-Time
```

---

## ✨ New Features

### 1. Loading States
- **Dashboard**: Full skeleton loader while fetching data
- **Crops**: Card skeletons during load
- **Settings**: Spinner during profile load/save

### 2. Empty States
- **No Farms**: Shows CTA to create first farm
- **No Crops**: Shows CTA to add first crop
- **Friendly icons and descriptions**

### 3. Real-Time Updates
When you add/update:
- ✅ **Crops** → Dashboard crop count & list updates instantly
- ✅ **Farm Metrics** → Soil moisture, pH, temperature update live
- ✅ **Cattle** → Cattle management tab updates automatically

### 4. User-Specific Data
All queries now filter by `user.id` from auth context:
```typescript
const { data } = await supabase
  .from('farms')
  .select('*')
  .eq('user_id', user.id) // Only this user's data
```

---

## 🧪 Testing Checklist

### Dashboard
- [ ] Loads without errors
- [ ] Shows skeleton while loading
- [ ] "Active Plots" counter matches your farms count
- [ ] "Active Crops" counter matches growing crops
- [ ] Soil moisture, pH, temperature show real values
- [ ] Adding a crop updates the dashboard automatically (realtime)

### Crops Management
- [ ] Shows loading skeletons
- [ ] Shows empty state if no crops
- [ ] "Add Crop" modal works and persists to database
- [ ] Crop list updates without page refresh (realtime)
- [ ] Filter/search work with real data

### Cattle Management
- [ ] Already functional (was already using Supabase correctly)
- [ ] Verify it still loads cattle for logged-in user

### Settings
- [ ] Profile loads with user data
- [ ] Saving updates the `profiles` table
- [ ] Changes persist after page refresh

### Onboarding
- [ ] Completing onboarding creates:
  - Profile in `profiles` table
  - Farm in `farms` table with `user_id`
  - Crop in `crops` table linked to farm

---

## 🔧 Troubleshooting

### "Table does not exist" error
**Solution**: Run the migration SQL script in Supabase SQL Editor.

### "Row-level security policy violation" error
**Solution**: 
1. Log out and log back in
2. Verify you're using the correct Supabase anon key
3. Check that RLS policies were created (see migration SQL)

### Data not showing up
**Check**:
1. Open browser DevTools → Console for errors
2. Check Supabase → Table Editor to see if data exists
3. Verify `user_id` in `farms` table matches your auth user ID

### Realtime not working
**Solution**:
1. Go to Supabase → Database → Replication
2. Ensure tables have realtime enabled (toggle on)
3. Refresh your browser

### Profile not saving
**Check**:
1. Browser console for error messages
2. Verify `profiles` table exists
3. Check RLS policies allow INSERT/UPDATE

---

## 📊 Sample Data (Optional)

To test with sample data, run this in Supabase SQL Editor:

```sql
-- After logging in, get your user ID from auth.users
-- Then insert sample data:

INSERT INTO farms (user_id, name, plot_id, area_sqm, area_acres, soil_type, water_source)
VALUES (
  'YOUR_USER_ID_HERE',
  'Green Valley Farm',
  'PL-ODL',
  10117.15,
  2.5,
  'Loamy',
  'Well'
);

-- Then add crops linked to that farm
```

---

## ✅ REFACTORING COMPLETE

All components have been successfully refactored to use Supabase instead of hardcoded data!

### What's Been Done:
- [x] **Unified SQL Schema**: Created migration script with profiles table (linked to auth.users) and proper RLS policies
- [x] **Auth Context**: Updated to use proper Supabase SSR client and provide user profile
- [x] **Onboarding Page**: Now writes to profiles, farms, and crops tables with proper user_id
- [x] **Dashboard Page**: Replaced mock data with Supabase queries, added loading/empty states, enabled realtime
- [x] **Crops Page**: CRUD operations work with existing schema, added loading/empty states
- [x] **Cattle Page**: Uses user.id from auth context for all queries
- [x] **Settings Page**: Updates profiles table instead of farmers
- [x] **Loading Components**: Created reusable loading skeleton and empty state components
- [x] **Environment Variables**: Verified Supabase client initialization

### Key Changes Made:
1. **Database Schema**: Added `profiles` table linked to `auth.users` with proper relationships
2. **Real-time Updates**: Dashboard automatically updates when data changes
3. **Loading States**: All pages now show appropriate loading skeletons
4. **Empty States**: Helpful messages when users have no data
5. **Type Safety**: Fixed all TypeScript errors with proper null checks

## 🚀 Ready to Deploy

Your application is now fully dynamic and ready for production!

### Next Steps (Optional Enhancements):
1. **Add more CRUD operations**: Delete crop, edit crop, etc.
2. **Implement data entry forms**: Soil data, weather data
3. **Add charts**: Use Recharts to visualize metrics over time
4. **Push notifications**: Use Supabase Edge Functions for alerts
5. **AI integration**: Connect crop data to AI insights

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Check Supabase logs (Dashboard → Logs)
3. Verify all SQL migrations ran successfully
4. Ensure `.env.local` has correct Supabase credentials

**Your Supabase Project**: https://app.supabase.com/project/rrbqifrclinorpnwmwcp
