/**
 * Cattle Management Service Layer
 * All Supabase queries for cattle, milk, health, breeding, feed, and tasks
 *
 * IMPORTANT: All functions accept a SupabaseClient parameter to ensure
 * they use the authenticated client from the AuthContext.
 */

import type { SupabaseClient } from '@supabase/supabase-js'

// ========================================
// TYPES
// ========================================

export interface Cattle {
  id: string
  user_id: string
  tag_id: string
  name: string
  breed: string
  date_of_birth: string | null
  age_display: string | null
  gender: 'Female' | 'Male' | null
  category: 'Milking' | 'Pregnant' | 'Dry' | 'Calf' | 'Bull' | 'Sick' | null
  health_status: 'Good' | 'Attention' | 'Sick' | 'Under Treatment' | 'Normal'
  weight_kg: number | null
  breed_type: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface MilkProduction {
  id: string
  user_id: string
  cattle_id: string
  tag_id: string | null
  date: string
  morning_yield: number
  evening_yield: number
  total_yield: number
  milk_price_per_litre: number
  total_income: number
  notes: string | null
  created_at: string
}

export interface HealthRecord {
  id: string
  user_id: string
  cattle_id: string
  tag_id: string | null
  animal_name: string | null
  record_type: 'Vaccination' | 'Treatment' | 'Deworming' | 'Checkup' | 'Surgery' | 'Other' | null
  vaccine_or_treatment: string
  date_given: string
  next_due_date: string | null
  administered_by: string | null
  cost: number
  status: 'Done' | 'Due Soon' | 'Overdue' | 'Scheduled'
  notes: string | null
  created_at: string
}

export interface BreedingRecord {
  id: string
  user_id: string
  cattle_id: string
  tag_id: string | null
  animal_name: string | null
  breeding_date: string
  breeding_type: 'Natural' | 'Artificial Insemination' | null
  bull_or_semen_id: string | null
  pregnancy_confirmed: boolean
  expected_calving_date: string | null
  actual_calving_date: string | null
  calving_status: 'Pending' | 'Successful' | 'Failed' | 'Aborted'
  notes: string | null
  created_at: string
}

export interface FeedExpense {
  id: string
  user_id: string
  date: string
  feed_type: string
  quantity_kg: number | null
  cost_per_kg: number | null
  total_cost: number
  supplier: string | null
  notes: string | null
  created_at: string
}

export interface CattleTask {
  id: string
  user_id: string
  task_type: 'Vaccination' | 'Calving' | 'Deworming' | 'Vet Checkup' | 'Breeding' | 'Other' | null
  title: string
  description: string | null
  related_animals: string | null
  due_date: string
  priority: 'High' | 'Medium' | 'Low'
  status: 'Pending' | 'Completed' | 'Overdue'
  color_dot: string
  created_at: string
}

export interface CattleFinancialSummary {
  totalMilkIncome: number
  totalFeedExpense: number
  totalHealthExpense: number
  netProfit: number
}

// ========================================
// CATTLE CRUD
// ========================================

export async function getAllCattle(db: SupabaseClient, userId: string) {
  const { data, error } = await db
    .from('cattle')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Cattle[]
}

export async function addCattle(db: SupabaseClient, data: Partial<Cattle> & { user_id: string }) {
  const { data: result, error } = await db
    .from('cattle')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return result as Cattle
}

export async function updateCattle(db: SupabaseClient, id: string, data: Partial<Cattle>) {
  const { data: result, error } = await db
    .from('cattle')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return result as Cattle
}

export async function deleteCattle(db: SupabaseClient, id: string) {
  const { error } = await db
    .from('cattle')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
  return true
}

export async function getCattleById(db: SupabaseClient, id: string) {
  const { data, error } = await db
    .from('cattle')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Cattle
}

// ========================================
// MILK PRODUCTION CRUD
// ========================================

export async function getMilkRecords(db: SupabaseClient, userId: string, startDate?: string, endDate?: string) {
  let query = db
    .from('milk_production')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (startDate) query = query.gte('date', startDate)
  if (endDate) query = query.lte('date', endDate)

  const { data, error } = await query
  if (error) throw error
  return data as MilkProduction[]
}

export async function getMilkRecordsByCattle(db: SupabaseClient, cattleId: string) {
  const { data, error } = await db
    .from('milk_production')
    .select('*')
    .eq('cattle_id', cattleId)
    .order('date', { ascending: false })

  if (error) throw error
  return data as MilkProduction[]
}

export async function addMilkRecord(db: SupabaseClient, data: Partial<MilkProduction> & { user_id: string }) {
  const { data: result, error } = await db
    .from('milk_production')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return result as MilkProduction
}

export async function updateMilkRecord(db: SupabaseClient, id: string, data: Partial<MilkProduction>) {
  const { data: result, error } = await db
    .from('milk_production')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return result as MilkProduction
}

export async function deleteMilkRecord(db: SupabaseClient, id: string) {
  const { error } = await db
    .from('milk_production')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}

export async function getWeeklyMilkSummary(db: SupabaseClient, userId: string) {
  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - 6)

  const { data, error } = await db
    .from('milk_production')
    .select('date, morning_yield, evening_yield, total_yield, total_income')
    .eq('user_id', userId)
    .gte('date', startDate.toISOString().split('T')[0])
    .lte('date', today.toISOString().split('T')[0])
    .order('date', { ascending: true })

  if (error) throw error

  // Group by date and sum yields
  const summary: { [key: string]: { yield: number; income: number } } = {}
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]
    summary[dateStr] = { yield: 0, income: 0 }
  }

  data?.forEach((record) => {
    if (summary[record.date]) {
      summary[record.date].yield += Number(record.total_yield || 0)
      summary[record.date].income += Number(record.total_income || 0)
    }
  })

  return Object.entries(summary).map(([date, values]) => ({
    date: days[new Date(date).getDay()],
    yield: Math.round(values.yield * 100) / 100,
    income: Math.round(values.income * 100) / 100,
  }))
}

export async function getLastMilkPerCow(db: SupabaseClient, userId: string) {
  const { data, error } = await db
    .from('milk_production')
    .select('cattle_id, tag_id, date, morning_yield, evening_yield, total_yield')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (error) throw error

  // Get latest record per cattle
  const latestMap = new Map<string, MilkProduction>()
  data?.forEach((record) => {
    if (!latestMap.has(record.cattle_id)) {
      latestMap.set(record.cattle_id, record as any)
    }
  })

  return latestMap
}

// ========================================
// HEALTH RECORDS CRUD
// ========================================

export async function getHealthRecords(db: SupabaseClient, userId: string) {
  const { data, error } = await db
    .from('health_records')
    .select('*')
    .eq('user_id', userId)
    .order('date_given', { ascending: false })

  if (error) throw error
  return data as HealthRecord[]
}

export async function getHealthRecordsByCattle(db: SupabaseClient, cattleId: string) {
  const { data, error } = await db
    .from('health_records')
    .select('*')
    .eq('cattle_id', cattleId)
    .order('date_given', { ascending: false })

  if (error) throw error
  return data as HealthRecord[]
}

export async function addHealthRecord(db: SupabaseClient, data: Partial<HealthRecord> & { user_id: string }) {
  const { data: result, error } = await db
    .from('health_records')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return result as HealthRecord
}

export async function updateHealthRecord(db: SupabaseClient, id: string, data: Partial<HealthRecord>) {
  const { data: result, error } = await db
    .from('health_records')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return result as HealthRecord
}

export async function deleteHealthRecord(db: SupabaseClient, id: string) {
  const { error } = await db
    .from('health_records')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}

// ========================================
// BREEDING RECORDS CRUD
// ========================================

export async function getBreedingRecords(db: SupabaseClient, userId: string) {
  const { data, error } = await db
    .from('breeding_records')
    .select('*')
    .eq('user_id', userId)
    .order('breeding_date', { ascending: false })

  if (error) throw error
  return data as BreedingRecord[]
}

export async function getBreedingRecordsByCattle(db: SupabaseClient, cattleId: string) {
  const { data, error } = await db
    .from('breeding_records')
    .select('*')
    .eq('cattle_id', cattleId)
    .order('breeding_date', { ascending: false })

  if (error) throw error
  return data as BreedingRecord[]
}

export async function addBreedingRecord(db: SupabaseClient, data: Partial<BreedingRecord> & { user_id: string }) {
  const { data: result, error } = await db
    .from('breeding_records')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return result as BreedingRecord
}

export async function updateBreedingRecord(db: SupabaseClient, id: string, data: Partial<BreedingRecord>) {
  const { data: result, error } = await db
    .from('breeding_records')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return result as BreedingRecord
}

export async function deleteBreedingRecord(db: SupabaseClient, id: string) {
  const { error } = await db
    .from('breeding_records')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}

// ========================================
// FEED EXPENSES CRUD
// ========================================

export async function getFeedExpenses(db: SupabaseClient, userId: string, month?: number, year?: number) {
  let query = db
    .from('cattle_feed_expenses')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (month && year) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`
    query = query.gte('date', startDate).lte('date', endDate)
  }

  const { data, error } = await query
  if (error) throw error
  return data as FeedExpense[]
}

export async function addFeedExpense(db: SupabaseClient, data: Partial<FeedExpense> & { user_id: string }) {
  const { data: result, error } = await db
    .from('cattle_feed_expenses')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return result as FeedExpense
}

export async function updateFeedExpense(db: SupabaseClient, id: string, data: Partial<FeedExpense>) {
  const { data: result, error } = await db
    .from('cattle_feed_expenses')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return result as FeedExpense
}

export async function deleteFeedExpense(db: SupabaseClient, id: string) {
  const { error } = await db
    .from('cattle_feed_expenses')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}

// ========================================
// TASKS CRUD
// ========================================

export async function getTasks(db: SupabaseClient, userId: string, status?: string) {
  let query = db
    .from('cattle_tasks')
    .select('*')
    .eq('user_id', userId)
    .order('due_date', { ascending: true })

  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) throw error
  return data as CattleTask[]
}

export async function addTask(db: SupabaseClient, data: Partial<CattleTask> & { user_id: string }) {
  const { data: result, error } = await db
    .from('cattle_tasks')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return result as CattleTask
}

export async function updateTask(db: SupabaseClient, id: string, data: Partial<CattleTask>) {
  const { data: result, error } = await db
    .from('cattle_tasks')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return result as CattleTask
}

export async function completeTask(db: SupabaseClient, id: string) {
  const { data: result, error } = await db
    .from('cattle_tasks')
    .update({ status: 'Completed' })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return result as CattleTask
}

export async function deleteTask(db: SupabaseClient, id: string) {
  const { error } = await db
    .from('cattle_tasks')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}

// ========================================
// FINANCIAL SUMMARY
// ========================================

export async function getCattleFinancialSummary(
  db: SupabaseClient,
  userId: string,
  month?: number,
  year?: number
): Promise<CattleFinancialSummary> {
  const now = new Date()
  const selectedMonth = month || now.getMonth() + 1
  const selectedYear = year || now.getFullYear()

  const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`
  const endDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-31`

  // Get milk income
  const { data: milkData, error: milkError } = await db
    .from('milk_production')
    .select('total_income')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)

  if (milkError) throw milkError

  const totalMilkIncome = milkData?.reduce((sum, record) => sum + Number(record.total_income || 0), 0) || 0

  // Get feed expenses
  const { data: feedData, error: feedError } = await db
    .from('cattle_feed_expenses')
    .select('total_cost')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)

  if (feedError) throw feedError

  const totalFeedExpense = feedData?.reduce((sum, record) => sum + Number(record.total_cost || 0), 0) || 0

  // Get health expenses
  const { data: healthData, error: healthError } = await db
    .from('health_records')
    .select('cost')
    .eq('user_id', userId)
    .gte('date_given', startDate)
    .lte('date_given', endDate)

  if (healthError) throw healthError

  const totalHealthExpense = healthData?.reduce((sum, record) => sum + Number(record.cost || 0), 0) || 0

  const totalExpense = totalFeedExpense + totalHealthExpense

  return {
    totalMilkIncome: Math.round(totalMilkIncome * 100) / 100,
    totalFeedExpense: Math.round(totalFeedExpense * 100) / 100,
    totalHealthExpense: Math.round(totalHealthExpense * 100) / 100,
    netProfit: Math.round((totalMilkIncome - totalExpense) * 100) / 100,
  }
}

// ========================================
// KPI METRICS
// ========================================

export async function getKPIMetrics(db: SupabaseClient, userId: string) {
  // Total cattle
  const { count: totalCattle, error: cattleError } = await db
    .from('cattle')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_active', true)

  if (cattleError) throw cattleError

  // Average daily milk (today)
  const today = new Date().toISOString().split('T')[0]
  const { data: todayMilk, error: milkError } = await db
    .from('milk_production')
    .select('total_yield')
    .eq('user_id', userId)
    .eq('date', today)

  if (milkError) throw milkError

  const avgDailyMilk =
    todayMilk && todayMilk.length > 0
      ? todayMilk.reduce((sum, r) => sum + Number(r.total_yield || 0), 0) / todayMilk.length
      : 0

  // Health index (percentage of healthy animals)
  const { data: allCattle, error: healthError } = await db
    .from('cattle')
    .select('health_status')
    .eq('user_id', userId)
    .eq('is_active', true)

  if (healthError) throw healthError

  const healthyCount = allCattle?.filter((c) => c.health_status === 'Good' || c.health_status === 'Normal').length || 0
  const healthIndex = allCattle && allCattle.length > 0 ? Math.round((healthyCount / allCattle.length) * 100) : 0

  // Pregnant cows
  const { count: pregnantCows, error: pregnantError } = await db
    .from('cattle')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('category', 'Pregnant')
    .eq('is_active', true)

  if (pregnantError) throw pregnantError

  // Vaccination due
  const { count: vaccinationDue, error: vaccError } = await db
    .from('health_records')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .in('status', ['Due Soon', 'Overdue'])

  if (vaccError) throw vaccError

  // Average body weight
  const { data: weightData, error: weightError } = await db
    .from('cattle')
    .select('weight_kg')
    .eq('user_id', userId)
    .eq('is_active', true)
    .not('weight_kg', 'is', null)

  if (weightError) throw weightError

  const avgWeight =
    weightData && weightData.length > 0
      ? weightData.reduce((sum, c) => sum + Number(c.weight_kg || 0), 0) / weightData.length
      : 0

  return {
    totalCattle: totalCattle || 0,
    avgDailyMilk: Math.round(avgDailyMilk * 100) / 100,
    healthIndex,
    pregnantCows: pregnantCows || 0,
    vaccinationDue: vaccinationDue || 0,
    avgWeight: Math.round(avgWeight * 100) / 100,
  }
}
