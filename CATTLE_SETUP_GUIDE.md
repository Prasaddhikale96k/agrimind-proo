# Cattle Management System - Setup Guide

## 🎯 Overview
A fully dynamic, real-time cattle management system integrated into AgriMind Pro with complete financial tracking.

---

## 📋 Step 1: Apply Database Schema

### Option A: Supabase Dashboard (Recommended)
1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Navigate to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Open the file: `supabase-cattle-schema.sql` (in project root)
6. Copy the entire contents
7. Paste into the SQL Editor
8. Click **Run** (or press `Ctrl + Enter`)
9. You should see "Success. No rows returned" for each statement

### Option B: Supabase CLI
```bash
cd c:\Users\vitho\dbmsproject\agrimind-pro
supabase db push
```

---

## 🔔 Step 2: Enable Realtime

### In Supabase Dashboard:
1. Go to **Database** → **Replication** (or **Database** → **Realtime** in newer UI)
2. You'll see a list of tables under "Available Tables"
3. **Enable Realtime** for these 6 tables:
   - ✅ `cattle`
   - ✅ `milk_production`
   - ✅ `health_records`
   - ✅ `breeding_records`
   - ✅ `cattle_feed_expenses`
   - ✅ `cattle_tasks`
4. Toggle the switch or click **Enable** next to each table
5. The page will automatically subscribe to real-time changes

---

## ✅ Step 3: Verify Setup

### Check Tables Created:
Run this query in Supabase SQL Editor:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('cattle', 'milk_production', 'health_records', 
                   'breeding_records', 'cattle_feed_expenses', 'cattle_tasks')
ORDER BY table_name;
```

You should see all 6 tables listed.

### Check RLS Policies:
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('cattle', 'milk_production', 'health_records',
                   'breeding_records', 'cattle_feed_expenses', 'cattle_tasks')
ORDER BY tablename;
```

You should see 4 policies per table (SELECT, INSERT, UPDATE, DELETE).

---

## 🚀 Step 4: Test the Application

### Start the Development Server:
```bash
cd c:\Users\vitho\dbmsproject\agrimind-pro
pnpm dev
```

### Test Cattle Page:
1. Open: http://localhost:3000
2. Login to your account
3. Click **Cattle** in the sidebar
4. You should see:
   - Empty KPI cards (0 values)
   - "No animals added yet" message
   - Empty milk chart
   - No tasks or health records

### Add Your First Animal:
1. Click **"+ Add New Animal"** button
2. Fill in the form:
   - Tag ID: `A-001`
   - Name: `Ganga`
   - Breed: `HF Cross`
   - Category: `Milking`
   - Health Status: `Good`
3. Click **Add Animal**
4. ✅ You should see a success toast
5. ✅ The animal should appear in the table immediately (real-time)
6. ✅ KPI cards should update

### Test Animal Profile:
1. Click **View >** on the animal
2. Modal should open with 4 tabs:
   - **Overview**: Shows all details
   - **Milk**: Empty table + "Add Milk Record" button
   - **Health**: Empty table
   - **Breeding**: Empty table
3. Click **Add Milk Record**
4. Fill in:
   - Date: Today
   - Morning: `10`
   - Evening: `8`
   - Price: `35`
5. Click **Add Record**
6. ✅ Record appears in table
7. ✅ Chart updates on Cattle page

### Test Tasks:
1. Click **"+ Add"** in Upcoming Tasks
2. Fill in:
   - Title: `Vaccination Due`
   - Type: `Vaccination`
   - Priority: `High`
   - Due Date: 2 days from now
3. Click **Add Task**
4. ✅ Task appears in list
5. Click **✓** to mark complete
6. ✅ Task disappears (marked as completed)

### Test Health Records:
1. Click **"+ Add Health Record"**
2. Fill in:
   - Tag ID: `A-001`
   - Animal Name: `Ganga`
   - Record Type: `Vaccination`
   - Vaccine/Treatment: `FMD Vaccine`
   - Date Given: Today
   - Next Due Date: 6 months from now
3. Click **Add Health Record**
4. ✅ Record appears in Health table

---

## 💰 Step 5: Test Financial Center

1. Navigate to **Financial Center** in sidebar
2. Scroll to bottom
3. You should see **"Cattle Financials"** section
4. Month selector should show current month/year
5. Cards should show:
   - Milk Income: From milk records
   - Feed & Health Expenses: From expenses
   - Net Profit: Auto-calculated

### Test Adding Milk Record from Financial Center:
1. Click **"+ Add Record"** in Milk Production Income Log
2. Fill in details
3. Click **Add Record**
4. ✅ Table updates
5. ✅ Monthly total updates

### Test Adding Feed Expense:
1. Click **"+ Add Expense"** in Cattle Expense Log
2. Fill in:
   - Date: Today
   - Feed Type: `Green Fodder`
   - Quantity: `100`
   - Cost per Kg: `5`
   - Total Cost: `500`
3. Click **Add Expense**
4. ✅ Expense appears
5. ✅ Monthly total updates

---

## 🔧 Troubleshooting

### Issue: "Failed to load cattle data"
**Solution**: Check browser console for Supabase errors. Ensure:
- You're logged in
- Tables exist in Supabase
- RLS policies are configured

### Issue: Real-time not working
**Solution**:
1. Verify Realtime is enabled for all 6 tables in Supabase Dashboard
2. Check browser console for WebSocket connection errors
3. Refresh the page

### Issue: "permission denied for table cattle"
**Solution**: RLS policies not set up correctly. Re-run the SQL schema.

### Issue: Duplicate Tag ID error
**Solution**: Tag IDs must be unique per user. Use a different Tag ID.

### Issue: TypeScript errors
**Solution**: Run `pnpm install` to ensure all dependencies are installed.

---

## 📊 Features Implemented

### Cattle Page (`/cattle`)
✅ Real-time KPI metrics (Total Cattle, Avg Daily Milk, Health Index, etc.)
✅ AI Insights banner with dynamic content
✅ My Herd table with:
  - Search by tag, name, or breed
  - Filter tabs (All, Milking, Pregnant, Sick, Dry)
  - Last milk yield per cow
  - View profile button
✅ Add New Animal modal with full form
✅ Animal Profile modal with 4 tabs:
  - Overview (details + edit/delete)
  - Milk Production (add/view/delete records)
  - Health Records (add/view/delete)
  - Breeding Records (add/view/delete)
✅ Upcoming Tasks:
  - Dynamic from Supabase
  - Add/complete/delete tasks
  - Days remaining calculation
  - Priority color coding
✅ Milk Production Chart:
  - Last 7 days bar chart
  - Total weekly yield
  - Estimated income
✅ Health & Vaccination Table:
  - All health records
  - Status badges (Done/Due Soon/Overdue)
  - Add/delete records
✅ Real-time subscriptions (all changes reflect instantly)
✅ Loading states, error handling, empty states
✅ Success toasts on every action

### Financial Center (`/finance`)
✅ Cattle Financials section (at bottom)
✅ Month/Year selector
✅ 3 KPI cards:
  - Milk Income
  - Feed & Health Expenses
  - Net Profit
✅ Milk Production Income Log:
  - Monthly records
  - Add/delete records
  - Monthly total
✅ Cattle Expense Log:
  - Monthly feed expenses
  - Add/delete expenses
  - Monthly total
✅ Add Milk Record modal
✅ Add Feed Expense modal

---

## 🗂️ Files Created/Modified

### Created:
- `supabase-cattle-schema.sql` - Database schema with 6 tables + RLS policies
- `lib/cattleService.ts` - Complete service layer with all CRUD operations
- `app/(dashboard)/cattle/page.tsx` - Fully dynamic Cattle page

### Modified:
- `app/(dashboard)/finance/page.tsx` - Added Cattle Financials section

---

## 🎨 Design Consistency
All components use existing AgriMind Pro design patterns:
- `glass-card` for card backgrounds
- `btn-primary` / `btn-secondary` for buttons
- `input-field` / `select-field` for forms
- `badge-green` / `badge-yellow` / `badge-red` for status
- Framer Motion animations
- Recharts for charts
- react-hot-toast for notifications

---

## 🔐 Security
- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- All queries filtered by `user_id = auth.uid()`
- No data leakage between users

---

## 📱 Responsive Design
- Mobile-friendly layouts
- Tables scroll horizontally on small screens
- Modals adapt to screen size
- Grid layouts collapse gracefully

---

## 🚀 Next Steps (Optional Enhancements)
1. Add data export (CSV/PDF)
2. Add cattle health trend charts
3. Add breeding success rate analytics
4. Add automated task reminders
5. Add cattle age auto-calculation from DOB
6. Add photo upload for animals
7. Add bulk import from CSV
8. Add cattle marketplace/selling feature

---

## 📞 Support
If you encounter any issues:
1. Check browser console for errors
2. Verify Supabase setup (tables, RLS, Realtime)
3. Ensure you're logged in
4. Check that environment variables are set correctly

---

**You now have a fully functional, production-ready cattle management system!** 🐄✨
