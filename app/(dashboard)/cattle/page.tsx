'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Beef,
  Droplets,
  Heart,
  Calendar,
  Syringe,
  Scale,
  Sparkles,
  Search,
  Plus,
  X,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import {
  getAllCattle,
  addCattle,
  updateCattle,
  deleteCattle,
  getMilkRecords,
  addMilkRecord,
  updateMilkRecord,
  deleteMilkRecord,
  getWeeklyMilkSummary,
  getLastMilkPerCow,
  getHealthRecords,
  addHealthRecord,
  updateHealthRecord,
  deleteHealthRecord,
  getBreedingRecords,
  addBreedingRecord,
  deleteBreedingRecord,
  getTasks,
  addTask,
  completeTask,
  deleteTask,
  getKPIMetrics,
  getCattleFinancialSummary,
  getFeedExpenses,
  addFeedExpense,
  deleteFeedExpense,
  type Cattle,
  type MilkProduction,
  type HealthRecord,
  type BreedingRecord,
  type FeedExpense,
  type CattleTask,
} from '@/lib/cattleService'
import type { SupabaseClient } from '@supabase/supabase-js'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import toast from 'react-hot-toast'

const containerVariants = {
  animate: { transition: { staggerChildren: 0.08 } },
}

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

export default function CattlePage() {
  const { user, supabase: db, loading: authLoading } = useAuth()
  const userId = user?.id || ''

  // Show auth error if not logged in
  if (!authLoading && !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertTriangle className="w-16 h-16 text-yellow-500" />
        <h2 className="text-2xl font-bold text-dark">Authentication Required</h2>
        <p className="text-gray-600">Please log in to access Cattle Management</p>
      </div>
    )
  }

  // State: Cattle
  const [cattle, setCattle] = useState<Cattle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<string>('All')

  // State: KPIs
  const [kpi, setKpi] = useState({
    totalCattle: 0,
    avgDailyMilk: 0,
    healthIndex: 0,
    pregnantCows: 0,
    vaccinationDue: 0,
    avgWeight: 0,
  })

  // State: Milk
  const [milkChartData, setMilkChartData] = useState<any[]>([])
  const [weeklyTotal, setWeeklyTotal] = useState(0)
  const [weeklyIncome, setWeeklyIncome] = useState(0)
  const [lastMilkMap, setLastMilkMap] = useState<Map<string, number>>(new Map())

  // State: Health
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([])

  // State: Tasks
  const [tasks, setTasks] = useState<CattleTask[]>([])

  // State: Modals
  const [showAddAnimal, setShowAddAnimal] = useState(false)
  const [showAddTask, setShowAddTask] = useState(false)
  const [showAddHealth, setShowAddHealth] = useState(false)
  const [selectedAnimal, setSelectedAnimal] = useState<Cattle | null>(null)
  const [profileTab, setProfileTab] = useState<'overview' | 'milk' | 'health' | 'breeding'>('overview')

  // State: Profile data
  const [animalMilk, setAnimalMilk] = useState<MilkProduction[]>([])
  const [animalHealth, setAnimalHealth] = useState<HealthRecord[]>([])
  const [animalBreeding, setAnimalBreeding] = useState<BreedingRecord[]>([])

  // State: Financial
  const [financial, setFinancial] = useState({ totalMilkIncome: 0, totalFeedExpense: 0, totalHealthExpense: 0, netProfit: 0 })

  // State: Add forms
  const [addAnimalForm, setAddAnimalForm] = useState({
    tag_id: '', name: '', breed: '', date_of_birth: '', gender: 'Female' as const,
    category: 'Milking' as const, health_status: 'Good' as const, weight_kg: '', notes: '',
  })

  const [addTaskForm, setAddTaskForm] = useState({
    title: '', task_type: 'Vaccination' as const, description: '',
    related_animals: '', due_date: new Date().toISOString().split('T')[0],
    priority: 'Medium' as const, color_dot: 'red',
  })

  const [addHealthForm, setAddHealthForm] = useState({
    cattle_id: '', tag_id: '', animal_name: '', record_type: 'Vaccination' as const,
    vaccine_or_treatment: '', date_given: new Date().toISOString().split('T')[0],
    next_due_date: '', cost: 0, status: 'Done' as const, notes: '',
  })

  // State: Add milk record in profile
  const [showAddMilk, setShowAddMilk] = useState(false)
  const [addMilkForm, setAddMilkForm] = useState({
    date: new Date().toISOString().split('T')[0], morning_yield: 0, evening_yield: 0,
    milk_price_per_litre: 35, notes: '',
  })

  // State: Add breeding record
  const [showAddBreeding, setShowAddBreeding] = useState(false)
  const [addBreedingForm, setAddBreedingForm] = useState({
    breeding_date: new Date().toISOString().split('T')[0], breeding_type: 'Natural' as const,
    bull_or_semen_id: '', pregnancy_confirmed: false, expected_calving_date: '', notes: '',
  })

  // ========================================
  // LOAD DATA
  // ========================================

  const loadAllData = useCallback(async () => {
    if (!userId) {
      console.error('❌ loadAllData: No userId available')
      return
    }

    try {
      setLoading(true)
      console.log('🔄 Loading cattle data for user:', userId)

      // Load cattle
      console.log('📦 Fetching cattle...')
      const { data: cattleData, error: cattleError } = await db
        .from('cattle')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (cattleError) {
        console.error('❌ Cattle fetch error:', cattleError)
        if (cattleError.message?.includes('does not exist') || cattleError.code === '42P01') {
          toast.error('Database tables not found. Please run the SQL schema first.')
          console.error('👉 Run supabase-cattle-schema.sql in Supabase SQL Editor')
        } else if (cattleError.message?.includes('row-level security') || cattleError.code === '42501') {
          toast.error('Permission error. Please log out and log back in.')
        } else {
          toast.error(`Cattle error: ${cattleError.message}`)
        }
      } else {
        console.log(`✅ Loaded ${cattleData?.length || 0} cattle`)
        setCattle(cattleData || [])
      }

      // Load KPIs
      console.log('📊 Fetching KPIs...')
      try {
        const kpiData = await getKPIMetrics(db, userId)
        setKpi(kpiData)
        console.log('✅ KPIs loaded:', kpiData)
      } catch (kpiError: any) {
        console.error('❌ KPI error:', kpiError)
        // Don't toast for KPI errors, they're non-critical
      }

      // Load milk chart data
      console.log('🥛 Fetching milk data...')
      try {
        const milkSummary = await getWeeklyMilkSummary(db, userId)
        setMilkChartData(milkSummary)
        const total = milkSummary.reduce((sum: number, d: any) => sum + d.yield, 0)
        const income = milkSummary.reduce((sum: number, d: any) => sum + d.income, 0)
        setWeeklyTotal(Math.round(total * 100) / 100)
        setWeeklyIncome(Math.round(income * 100) / 100)
        console.log('✅ Milk data loaded')
      } catch (milkError: any) {
        console.error('❌ Milk error:', milkError)
      }

      // Load last milk per cow
      try {
        const milkMap = await getLastMilkPerCow(db, userId)
        const displayMap = new Map<string, number>()
        milkMap.forEach((v: any, k: string) => displayMap.set(k, Number(v.total_yield || 0)))
        setLastMilkMap(displayMap)
      } catch (error) {
        console.error('❌ Last milk error:', error)
      }

      // Load health records
      console.log('💊 Fetching health records...')
      try {
        const healthData = await getHealthRecords(db, userId)
        setHealthRecords(healthData || [])
        console.log(`✅ Loaded ${healthData?.length || 0} health records`)
      } catch (healthError: any) {
        console.error('❌ Health error:', healthError)
      }

      // Load tasks
      console.log('📋 Fetching tasks...')
      try {
        const tasksData = await getTasks(db, userId, 'Pending')
        setTasks(tasksData || [])
        console.log(`✅ Loaded ${tasksData?.length || 0} tasks`)
      } catch (taskError: any) {
        console.error('❌ Tasks error:', taskError)
      }

      // Load financial summary
      console.log('💰 Fetching financials...')
      try {
        const finData = await getCattleFinancialSummary(db, userId)
        setFinancial(finData)
        console.log('✅ Financials loaded:', finData)
      } catch (finError: any) {
        console.error('❌ Financials error:', finError)
      }

    } catch (error: any) {
      console.error('❌ CRITICAL Error loading cattle data:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))

      if (error.message?.includes('does not exist') || error.code === '42P01') {
        toast.error('Database tables missing! Run supabase-cattle-schema.sql in Supabase SQL Editor')
      } else if (error.message?.includes('row-level security') || error.code === '42501') {
        toast.error('Permission denied. Please log out and log back in.')
      } else {
        toast.error(`Failed to load cattle data: ${error.message || 'Unknown error'}`)
      }
    } finally {
      setLoading(false)
      console.log('✅ Load complete')
    }
  }, [userId])

  useEffect(() => {
    loadAllData()
  }, [loadAllData])

  // ========================================
  // REAL-TIME SUBSCRIPTIONS
  // ========================================

  useEffect(() => {
    if (!userId) return

    const channel = db
      .channel('cattle-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cattle' }, () => loadAllData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'milk_production' }, () => loadAllData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'health_records' }, () => loadAllData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cattle_tasks' }, () => loadAllData())
      .subscribe()

    return () => {
      db.removeChannel(channel)
    }
  }, [userId, loadAllData])

  // ========================================
  // FILTERED CATTLE
  // ========================================

  const filteredCattle = cattle.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.tag_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.breed.toLowerCase().includes(searchTerm.toLowerCase())

    let matchesFilter = true
    if (filter === 'Milking') matchesFilter = c.category === 'Milking'
    else if (filter === 'Pregnant') matchesFilter = c.category === 'Pregnant'
    else if (filter === 'Sick') matchesFilter = c.health_status === 'Sick' || c.health_status === 'Under Treatment' || c.health_status === 'Attention'
    else if (filter === 'Dry') matchesFilter = c.category === 'Dry'

    return matchesSearch && matchesFilter
  })

  // ========================================
  // HELPER FUNCTIONS
  // ========================================

  const getHealthBadgeClass = (status: string) => {
    switch (status) {
      case 'Good': case 'Normal': return 'bg-green-100 text-green-700'
      case 'Sick': return 'bg-red-100 text-red-700'
      case 'Under Treatment': return 'bg-orange-100 text-orange-700'
      case 'Attention': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Done': return 'bg-green-100 text-green-700'
      case 'Due Soon': return 'bg-yellow-100 text-yellow-700'
      case 'Overdue': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-500'
      case 'Medium': return 'bg-yellow-500'
      case 'Low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const daysUntil = (dateStr: string) => {
    const due = new Date(dateStr)
    const today = new Date()
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    if (diff < 0) return 'Overdue'
    if (diff === 0) return 'Today'
    return `in ${diff} day${diff === 1 ? '' : 's'}`
  }

  const calculateAge = (dob: string | null) => {
    if (!dob) return '--'
    const birth = new Date(dob)
    const today = new Date()
    const months = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth())
    if (months < 12) return `${months} months`
    const years = Math.floor(months / 12)
    const remainMonths = months % 12
    return remainMonths > 0 ? `${years}y ${remainMonths}m` : `${years} yrs`
  }

  // ========================================
  // FORM HANDLERS
  // ========================================

  const handleAddAnimal = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate authentication
    if (!user) {
      toast.error('Not logged in. Please refresh and log in first.')
      console.error('❌ Auth Error - User object:', user)
      console.error('❌ User ID:', userId)
      return
    }

    if (!userId) {
      toast.error('User ID not found. Please log out and log back in.')
      console.error('❌ Auth Error - User exists but no ID')
      console.error('User object:', JSON.stringify(user, null, 2))
      return
    }

    if (!addAnimalForm.tag_id || !addAnimalForm.name || !addAnimalForm.breed) {
      toast.error('Please fill all required fields')
      return
    }

    try {
      console.log('✅ Adding cattle with user_id:', userId)
      console.log('✅ User email:', user.email)

      await addCattle(db, {
        user_id: userId,
        tag_id: addAnimalForm.tag_id,
        name: addAnimalForm.name,
        breed: addAnimalForm.breed,
        date_of_birth: addAnimalForm.date_of_birth || null,
        age_display: calculateAge(addAnimalForm.date_of_birth),
        gender: addAnimalForm.gender,
        category: addAnimalForm.category,
        health_status: addAnimalForm.health_status,
        weight_kg: addAnimalForm.weight_kg ? parseFloat(addAnimalForm.weight_kg) : null,
        notes: addAnimalForm.notes || null,
      })
      toast.success('Animal added successfully!')
      setShowAddAnimal(false)
      setAddAnimalForm({ tag_id: '', name: '', breed: '', date_of_birth: '', gender: 'Female', category: 'Milking', health_status: 'Good', weight_kg: '', notes: '' })
    } catch (error: any) {
      console.error('❌ Error adding cattle:', error)
      console.error('❌ Error details:', JSON.stringify(error, null, 2))

      if (error.message?.includes('row-level security')) {
        toast.error('RLS Error: Please log out and log back in, then try again')
      } else {
        toast.error(error.message || 'Failed to add animal')
      }
    }
  }

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId || !addTaskForm.title || !addTaskForm.due_date) {
      toast.error('Please fill all required fields')
      return
    }

    try {
      await addTask(db, {
        user_id: userId,
        title: addTaskForm.title,
        task_type: addTaskForm.task_type,
        description: addTaskForm.description || null,
        related_animals: addTaskForm.related_animals || null,
        due_date: addTaskForm.due_date,
        priority: addTaskForm.priority,
        color_dot: (addTaskForm.priority as string) === 'High' ? 'red' : (addTaskForm.priority as string) === 'Medium' ? 'yellow' : 'green',
      })
      toast.success('Task added!')
      setShowAddTask(false)
      setAddTaskForm({ title: '', task_type: 'Vaccination', description: '', related_animals: '', due_date: new Date().toISOString().split('T')[0], priority: 'Medium', color_dot: 'red' })
    } catch (error) {
      toast.error('Failed to add task')
    }
  }

  const handleAddHealth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId || !addHealthForm.vaccine_or_treatment || !addHealthForm.date_given) {
      toast.error('Please fill all required fields')
      return
    }

    try {
      await addHealthRecord(db, {
        user_id: userId,
        cattle_id: addHealthForm.cattle_id || null as any,
        tag_id: addHealthForm.tag_id || null,
        animal_name: addHealthForm.animal_name || null,
        record_type: addHealthForm.record_type,
        vaccine_or_treatment: addHealthForm.vaccine_or_treatment,
        date_given: addHealthForm.date_given,
        next_due_date: addHealthForm.next_due_date || null,
        cost: addHealthForm.cost,
        status: addHealthForm.status,
        notes: addHealthForm.notes || null,
      })
      toast.success('Health record added!')
      setShowAddHealth(false)
      setAddHealthForm({ cattle_id: '', tag_id: '', animal_name: '', record_type: 'Vaccination', vaccine_or_treatment: '', date_given: new Date().toISOString().split('T')[0], next_due_date: '', cost: 0, status: 'Done', notes: '' })
    } catch (error) {
      toast.error('Failed to add health record')
    }
  }

  const handleCompleteTask = async (taskId: string) => {
    try {
      await completeTask(db, taskId)
      toast.success('Task marked as complete!')
    } catch (error) {
      toast.error('Failed to complete task')
    }
  }

  const handleDeleteAnimal = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this animal?')) return
    try {
      await deleteCattle(db, id)
      toast.success('Animal deactivated')
      setSelectedAnimal(null)
    } catch (error) {
      toast.error('Failed to delete animal')
    }
  }

  const handleDeleteHealth = async (id: string) => {
    if (!confirm('Delete this health record?')) return
    try {
      await deleteHealthRecord(db, id)
      toast.success('Record deleted')
    } catch (error) {
      toast.error('Failed to delete record')
    }
  }

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Delete this task?')) return
    try {
      await deleteTask(db, id)
      toast.success('Task deleted')
    } catch (error) {
      toast.error('Failed to delete task')
    }
  }

  // Load animal profile data
  const loadAnimalProfile = async (animal: Cattle) => {
    setSelectedAnimal(animal)
    setProfileTab('overview')
    try {
      const [milk, health, breeding] = await Promise.all([
        getMilkRecords(db, animal.id),
        getHealthRecords(db, userId).then(r => r.filter(h => h.cattle_id === animal.id)),
        getBreedingRecords(db, userId).then(r => r.filter(b => b.cattle_id === animal.id)),
      ])
      setAnimalMilk(milk as any)
      setAnimalHealth(health)
      setAnimalBreeding(breeding)
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  const handleAddMilkRecord = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAnimal || (!addMilkForm.morning_yield && !addMilkForm.evening_yield)) {
      toast.error('Please enter at least one yield value')
      return
    }

    try {
      await addMilkRecord(db, {
        user_id: userId,
        cattle_id: selectedAnimal.id,
        tag_id: selectedAnimal.tag_id,
        date: addMilkForm.date,
        morning_yield: addMilkForm.morning_yield,
        evening_yield: addMilkForm.evening_yield,
        milk_price_per_litre: addMilkForm.milk_price_per_litre,
        notes: addMilkForm.notes || null,
      })
      toast.success('Milk record added!')
      setShowAddMilk(false)
      setAddMilkForm({ date: new Date().toISOString().split('T')[0], morning_yield: 0, evening_yield: 0, milk_price_per_litre: 35, notes: '' })
      loadAnimalProfile(selectedAnimal)
    } catch (error) {
      toast.error('Failed to add milk record')
    }
  }

  const handleDeleteMilk = async (id: string) => {
    if (!confirm('Delete this milk record?')) return
    try {
      await deleteMilkRecord(db, id)
      toast.success('Record deleted')
      if (selectedAnimal) loadAnimalProfile(selectedAnimal)
    } catch (error) {
      toast.error('Failed to delete record')
    }
  }

  const handleAddBreeding = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAnimal || !addBreedingForm.breeding_date) {
      toast.error('Please fill all required fields')
      return
    }

    try {
      await addBreedingRecord(db, {
        user_id: userId,
        cattle_id: selectedAnimal.id,
        tag_id: selectedAnimal.tag_id,
        animal_name: selectedAnimal.name,
        breeding_date: addBreedingForm.breeding_date,
        breeding_type: addBreedingForm.breeding_type,
        bull_or_semen_id: addBreedingForm.bull_or_semen_id || null,
        pregnancy_confirmed: addBreedingForm.pregnancy_confirmed,
        expected_calving_date: addBreedingForm.expected_calving_date || null,
        notes: addBreedingForm.notes || null,
      })
      toast.success('Breeding record added!')
      setShowAddBreeding(false)
      setAddBreedingForm({ breeding_date: new Date().toISOString().split('T')[0], breeding_type: 'Natural', bull_or_semen_id: '', pregnancy_confirmed: false, expected_calving_date: '', notes: '' })
      loadAnimalProfile(selectedAnimal)
    } catch (error) {
      toast.error('Failed to add breeding record')
    }
  }

  const handleDeleteBreeding = async (id: string) => {
    if (!confirm('Delete this breeding record?')) return
    try {
      await deleteBreedingRecord(db, id)
      toast.success('Record deleted')
      if (selectedAnimal) loadAnimalProfile(selectedAnimal)
    } catch (error) {
      toast.error('Failed to delete record')
    }
  }

  // ========================================
  // RENDER
  // ========================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="initial" animate="animate" className="space-y-6">
      {/* Page Header */}
      <motion.div variants={cardVariants}>
        <h1 className="text-3xl font-bold text-dark">Cattle Management</h1>
        <p className="text-sm text-subtle mt-1">Monitor your herd health, production & breeding</p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-6 gap-4">
        {[
          { icon: Beef, label: 'Total Cattle', value: kpi.totalCattle.toString(), status: 'Active', color: 'primary' as const },
          { icon: Droplets, label: 'Avg Daily Milk', value: `${kpi.avgDailyMilk} L`, status: 'Good', color: 'info' as const },
          { icon: Heart, label: 'Health Index', value: `${kpi.healthIndex}%`, status: kpi.healthIndex >= 70 ? 'Good' : 'Attention', color: 'primary' as const },
          { icon: Calendar, label: 'Pregnant', value: kpi.pregnantCows.toString(), status: 'Active', color: 'secondary' as const },
          { icon: Syringe, label: 'Vaccination Due', value: kpi.vaccinationDue.toString(), status: kpi.vaccinationDue > 0 ? 'Attention' : 'Done', color: 'warning' as const },
          { icon: Scale, label: 'Avg Weight', value: `${kpi.avgWeight} Kg`, status: 'Normal', color: 'info' as const },
        ].map((card, i) => (
          <motion.div key={i} className="glass-card p-5" variants={cardVariants} whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
            <div className="flex items-start justify-between">
              <div className={`p-2.5 rounded-xl bg-${card.color}/10 text-${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
              {card.status && (
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${card.status === 'Good' ? 'badge-green' : card.status === 'Done' ? 'badge-green' :
                  card.status === 'Attention' ? 'badge-yellow' : 'badge-gray'
                  }`}>{card.status}</span>
              )}
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-dark">{card.value}</p>
              <p className="text-sm text-gray-500 mt-1">{card.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* AI Insights Card */}
      <motion.div className="glass-card-dark p-5 text-white" variants={cardVariants}>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-accent" />
          <h3 className="font-semibold">AI Insights</h3>
        </div>
        <p className="text-sm text-white/90">
          {kpi.vaccinationDue > 0 && `${kpi.vaccinationDue} animals have upcoming vaccinations. `}
          {kpi.pregnantCows > 0 && `${kpi.pregnantCows} cows are pregnant. `}
          {kpi.avgDailyMilk > 0 && `Average daily milk production is ${kpi.avgDailyMilk} litres.`}
          {!kpi.totalCattle && 'No cattle added yet. Click "Add New Animal" to get started.'}
        </p>
      </motion.div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-5 gap-6">
        {/* LEFT COLUMN */}
        <div className="col-span-3 space-y-6">
          {/* My Herd Table */}
          <motion.div className="glass-card p-5" variants={cardVariants}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-dark text-lg">My Herd</h3>
              <motion.button
                className="btn-primary flex items-center gap-2 px-4 py-2 text-sm font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddAnimal(true)}
              >
                <Plus className="w-4 h-4" />
                Add New Animal
              </motion.button>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by tag, name, or breed..."
                className="input-field w-full pl-10 pr-4 py-2.5 text-sm"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {['All', 'Milking', 'Pregnant', 'Sick', 'Dry'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f ? 'bg-primary text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-primary hover:text-primary'
                    }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Table */}
            {filteredCattle.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                {cattle.length === 0 ? 'No animals added yet. Click + Add New Animal' : 'No cattle matching your search'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      {['Tag ID', 'Name', 'Breed', 'Age', 'Category', 'Health', 'Milk (L)', 'Action'].map(h => (
                        <th key={h} className="text-left py-3 px-2 text-gray-500 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCattle.map((c) => (
                      <motion.tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <td className="py-3 px-2 font-medium text-dark">{c.tag_id}</td>
                        <td className="py-3 px-2 text-dark">{c.name}</td>
                        <td className="py-3 px-2 text-subtle">{c.breed}</td>
                        <td className="py-3 px-2 text-subtle">{calculateAge(c.date_of_birth)}</td>
                        <td className="py-3 px-2"><span className="badge badge-blue">{c.category || '--'}</span></td>
                        <td className="py-3 px-2">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getHealthBadgeClass(c.health_status)}`}>
                            {c.health_status}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-dark font-medium">
                          {lastMilkMap.has(c.id) ? `${lastMilkMap.get(c.id)}L` : '--'}
                        </td>
                        <td className="py-3 px-2">
                          <motion.button
                            className="text-primary hover:text-primary-600 text-sm font-medium flex items-center gap-1"
                            whileHover={{ x: 2 }}
                            onClick={() => loadAnimalProfile(c)}
                          >
                            View <ChevronRight className="w-3 h-3" />
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>

          {/* Health & Vaccination Table */}
          <motion.div className="glass-card p-5" variants={cardVariants}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-dark text-lg">Health & Vaccination Records</h3>
              <motion.button
                className="btn-primary flex items-center gap-2 px-4 py-2 text-sm font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddHealth(true)}
              >
                <Plus className="w-4 h-4" />
                Add Health Record
              </motion.button>
            </div>

            {healthRecords.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No health records yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      {['Tag ID', 'Animal', 'Type', 'Date Given', 'Next Due', 'Status'].map(h => (
                        <th key={h} className="text-left py-3 px-2 text-gray-500 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {healthRecords.map((r) => (
                      <motion.tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <td className="py-3 px-2 font-medium text-dark">{r.tag_id || '--'}</td>
                        <td className="py-3 px-2 text-dark">{r.animal_name || '--'}</td>
                        <td className="py-3 px-2 text-subtle">{r.vaccine_or_treatment}</td>
                        <td className="py-3 px-2 text-subtle">{new Date(r.date_given).toLocaleDateString()}</td>
                        <td className="py-3 px-2 text-subtle">{r.next_due_date ? new Date(r.next_due_date).toLocaleDateString() : '--'}</td>
                        <td className="py-3 px-2">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(r.status)}`}>
                            {r.status}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="col-span-2 space-y-6">
          {/* Upcoming Tasks */}
          <motion.div className="glass-card p-5" variants={cardVariants}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-accent" />
                <h3 className="font-semibold text-dark">Upcoming Tasks</h3>
              </div>
              <motion.button
                className="text-sm text-primary font-medium"
                whileHover={{ scale: 1.05 }}
                onClick={() => setShowAddTask(true)}
              >
                <Plus className="w-4 h-4 inline mr-1" />
                Add
              </motion.button>
            </div>

            {tasks.length === 0 ? (
              <div className="text-center py-6 text-gray-400">No pending tasks</div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <motion.div key={task.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/50 hover:bg-gray-50" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${getPriorityColor(task.priority)}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-dark">{task.title}</p>
                      {task.description && <p className="text-xs text-subtle mt-0.5">{task.description}</p>}
                      {task.related_animals && <p className="text-xs text-subtle">Animals: {task.related_animals}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs font-medium text-subtle whitespace-nowrap">{daysUntil(task.due_date)}</span>
                      <div className="flex gap-1">
                        <motion.button className="text-green-600 hover:text-green-700" whileHover={{ scale: 1.2 }} onClick={() => handleCompleteTask(task.id)} title="Mark complete">
                          <CheckCircle className="w-4 h-4" />
                        </motion.button>
                        <motion.button className="text-red-400 hover:text-red-500" whileHover={{ scale: 1.2 }} onClick={() => handleDeleteTask(task.id)} title="Delete">
                          <X className="w-3 h-3" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Milk Production Chart */}
          <motion.div className="glass-card p-5" variants={cardVariants}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-dark">Milk Production - This Week</h3>
            </div>
            {milkChartData.length === 0 || weeklyTotal === 0 ? (
              <div className="text-center py-8 text-gray-400">No milk records this week</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={milkChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
                    <Tooltip formatter={(value: any) => `${value}L`} />
                    <Bar dataKey="yield" fill="#1a7a4a" radius={[4, 4, 0, 0]} name="Daily Yield" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-subtle">Total Weekly Yield</span>
                    <span className="text-lg font-bold text-primary">{weeklyTotal} Litres</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-subtle">Estimated Income</span>
                    <span className="text-lg font-bold text-green-600">₹{weeklyIncome}</span>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>

      {/* ======================================== */}
      {/* MODALS                                   */}
      {/* ======================================== */}

      {/* Add Animal Modal */}
      <AnimatePresence>
        {showAddAnimal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddAnimal(false)}>
            <motion.div className="glass-card p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-dark">Add New Animal</h3>
                <motion.button className="p-2 hover:bg-gray-100 rounded-lg" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setShowAddAnimal(false)}>
                  <X className="w-5 h-5 text-gray-500" />
                </motion.button>
              </div>
              <form onSubmit={handleAddAnimal} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1">Tag ID *</label>
                    <input type="text" required value={addAnimalForm.tag_id} onChange={(e) => setAddAnimalForm({ ...addAnimalForm, tag_id: e.target.value })} className="input-field w-full px-3 py-2 text-sm" placeholder="e.g., A-009" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1">Name *</label>
                    <input type="text" required value={addAnimalForm.name} onChange={(e) => setAddAnimalForm({ ...addAnimalForm, name: e.target.value })} className="input-field w-full px-3 py-2 text-sm" placeholder="Animal name" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1">Breed *</label>
                    <input type="text" required value={addAnimalForm.breed} onChange={(e) => setAddAnimalForm({ ...addAnimalForm, breed: e.target.value })} className="input-field w-full px-3 py-2 text-sm" placeholder="e.g., HF Cross" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1">Date of Birth</label>
                    <input type="date" value={addAnimalForm.date_of_birth} onChange={(e) => setAddAnimalForm({ ...addAnimalForm, date_of_birth: e.target.value })} className="input-field w-full px-3 py-2 text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1">Gender</label>
                    <select value={addAnimalForm.gender} onChange={(e) => setAddAnimalForm({ ...addAnimalForm, gender: e.target.value as any })} className="select-field w-full px-3 py-2 text-sm">
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1">Category</label>
                    <select value={addAnimalForm.category} onChange={(e) => setAddAnimalForm({ ...addAnimalForm, category: e.target.value as any })} className="select-field w-full px-3 py-2 text-sm">
                      {['Milking', 'Pregnant', 'Dry', 'Calf', 'Bull', 'Sick'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1">Health Status</label>
                    <select value={addAnimalForm.health_status} onChange={(e) => setAddAnimalForm({ ...addAnimalForm, health_status: e.target.value as any })} className="select-field w-full px-3 py-2 text-sm">
                      {['Good', 'Normal', 'Attention', 'Sick', 'Under Treatment'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1">Weight (Kg)</label>
                    <input type="number" value={addAnimalForm.weight_kg} onChange={(e) => setAddAnimalForm({ ...addAnimalForm, weight_kg: e.target.value })} className="input-field w-full px-3 py-2 text-sm" placeholder="e.g., 420" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Notes</label>
                  <textarea value={addAnimalForm.notes} onChange={(e) => setAddAnimalForm({ ...addAnimalForm, notes: e.target.value })} className="input-field w-full px-3 py-2 text-sm" rows={2} placeholder="Optional notes" />
                </div>
                <motion.button type="submit" className="btn-primary w-full py-2.5 font-medium" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  Add Animal
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Task Modal */}
      <AnimatePresence>
        {showAddTask && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddTask(false)}>
            <motion.div className="glass-card p-6 w-full max-w-lg mx-4" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-dark">Add New Task</h3>
                <motion.button className="p-2 hover:bg-gray-100 rounded-lg" whileHover={{ scale: 1.1 }} onClick={() => setShowAddTask(false)}>
                  <X className="w-5 h-5 text-gray-500" />
                </motion.button>
              </div>
              <form onSubmit={handleAddTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Title *</label>
                  <input type="text" required value={addTaskForm.title} onChange={(e) => setAddTaskForm({ ...addTaskForm, title: e.target.value })} className="input-field w-full px-3 py-2 text-sm" placeholder="e.g., Vaccination Due" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1">Type</label>
                    <select value={addTaskForm.task_type} onChange={(e) => setAddTaskForm({ ...addTaskForm, task_type: e.target.value as any })} className="select-field w-full px-3 py-2 text-sm">
                      {['Vaccination', 'Calving', 'Deworming', 'Vet Checkup', 'Breeding', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1">Priority</label>
                    <select value={addTaskForm.priority} onChange={(e) => setAddTaskForm({ ...addTaskForm, priority: e.target.value as any })} className="select-field w-full px-3 py-2 text-sm">
                      {['High', 'Medium', 'Low'].map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Description</label>
                  <textarea value={addTaskForm.description} onChange={(e) => setAddTaskForm({ ...addTaskForm, description: e.target.value })} className="input-field w-full px-3 py-2 text-sm" rows={2} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1">Related Animals</label>
                    <input type="text" value={addTaskForm.related_animals} onChange={(e) => setAddTaskForm({ ...addTaskForm, related_animals: e.target.value })} className="input-field w-full px-3 py-2 text-sm" placeholder="e.g., A-003, A-005" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1">Due Date *</label>
                    <input type="date" required value={addTaskForm.due_date} onChange={(e) => setAddTaskForm({ ...addTaskForm, due_date: e.target.value })} className="input-field w-full px-3 py-2 text-sm" />
                  </div>
                </div>
                <motion.button type="submit" className="btn-primary w-full py-2.5 font-medium" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  Add Task
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Health Record Modal */}
      <AnimatePresence>
        {showAddHealth && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddHealth(false)}>
            <motion.div className="glass-card p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-dark">Add Health Record</h3>
                <motion.button className="p-2 hover:bg-gray-100 rounded-lg" whileHover={{ scale: 1.1 }} onClick={() => setShowAddHealth(false)}>
                  <X className="w-5 h-5 text-gray-500" />
                </motion.button>
              </div>
              <form onSubmit={handleAddHealth} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1">Tag ID</label>
                    <input type="text" value={addHealthForm.tag_id} onChange={(e) => setAddHealthForm({ ...addHealthForm, tag_id: e.target.value })} className="input-field w-full px-3 py-2 text-sm" placeholder="e.g., A-001" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1">Animal Name</label>
                    <input type="text" value={addHealthForm.animal_name} onChange={(e) => setAddHealthForm({ ...addHealthForm, animal_name: e.target.value })} className="input-field w-full px-3 py-2 text-sm" placeholder="e.g., Ganga" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1">Record Type</label>
                    <select value={addHealthForm.record_type} onChange={(e) => setAddHealthForm({ ...addHealthForm, record_type: e.target.value as any })} className="select-field w-full px-3 py-2 text-sm">
                      {['Vaccination', 'Treatment', 'Deworming', 'Checkup', 'Surgery', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1">Status</label>
                    <select value={addHealthForm.status} onChange={(e) => setAddHealthForm({ ...addHealthForm, status: e.target.value as any })} className="select-field w-full px-3 py-2 text-sm">
                      {['Done', 'Due Soon', 'Overdue', 'Scheduled'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Vaccine / Treatment *</label>
                  <input type="text" required value={addHealthForm.vaccine_or_treatment} onChange={(e) => setAddHealthForm({ ...addHealthForm, vaccine_or_treatment: e.target.value })} className="input-field w-full px-3 py-2 text-sm" placeholder="e.g., FMD Vaccine" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1">Date Given *</label>
                    <input type="date" required value={addHealthForm.date_given} onChange={(e) => setAddHealthForm({ ...addHealthForm, date_given: e.target.value })} className="input-field w-full px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1">Next Due Date</label>
                    <input type="date" value={addHealthForm.next_due_date} onChange={(e) => setAddHealthForm({ ...addHealthForm, next_due_date: e.target.value })} className="input-field w-full px-3 py-2 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Cost (₹)</label>
                  <input type="number" value={addHealthForm.cost} onChange={(e) => setAddHealthForm({ ...addHealthForm, cost: parseFloat(e.target.value) || 0 })} className="input-field w-full px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Notes</label>
                  <textarea value={addHealthForm.notes} onChange={(e) => setAddHealthForm({ ...addHealthForm, notes: e.target.value })} className="input-field w-full px-3 py-2 text-sm" rows={2} />
                </div>
                <motion.button type="submit" className="btn-primary w-full py-2.5 font-medium" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  Add Health Record
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animal Profile Modal */}
      <AnimatePresence>
        {selectedAnimal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedAnimal(null)}>
            <motion.div className="glass-card p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-dark">Animal Profile: {selectedAnimal.name} ({selectedAnimal.tag_id})</h3>
                <div className="flex gap-2">
                  <motion.button className="p-2 hover:bg-gray-100 rounded-lg text-red-500" whileHover={{ scale: 1.1 }} onClick={() => handleDeleteAnimal(selectedAnimal.id)}>
                    <Trash2 className="w-5 h-5" />
                  </motion.button>
                  <motion.button className="p-2 hover:bg-gray-100 rounded-lg" whileHover={{ scale: 1.1 }} onClick={() => setSelectedAnimal(null)}>
                    <X className="w-5 h-5 text-gray-500" />
                  </motion.button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-6 border-b border-gray-200">
                {(['overview', 'milk', 'health', 'breeding'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setProfileTab(tab)}
                    className={`px-4 py-2 text-sm font-medium capitalize transition-all ${profileTab === tab ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {profileTab === 'overview' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      ['Tag ID', selectedAnimal.tag_id],
                      ['Name', selectedAnimal.name],
                      ['Breed', selectedAnimal.breed],
                      ['Age', calculateAge(selectedAnimal.date_of_birth)],
                      ['Gender', selectedAnimal.gender || '--'],
                      ['Category', selectedAnimal.category || '--'],
                      ['Health', selectedAnimal.health_status],
                      ['Weight', selectedAnimal.weight_kg ? `${selectedAnimal.weight_kg} Kg` : '--'],
                    ].map(([label, value]) => (
                      <div key={label} className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">{label}</p>
                        <p className="text-sm font-medium text-dark">{value}</p>
                      </div>
                    ))}
                  </div>
                  {selectedAnimal.notes && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Notes</p>
                      <p className="text-sm text-dark">{selectedAnimal.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {profileTab === 'milk' && (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <motion.button className="btn-primary flex items-center gap-2 px-4 py-2 text-sm font-medium" whileHover={{ scale: 1.05 }} onClick={() => setShowAddMilk(true)}>
                      <Plus className="w-4 h-4" /> Add Milk Record
                    </motion.button>
                  </div>
                  {animalMilk.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">No milk records</div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          {['Date', 'Morning (L)', 'Evening (L)', 'Total (L)', 'Income (₹)', 'Action'].map(h => (
                            <th key={h} className="text-left py-2 px-2 text-gray-500 font-medium">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {animalMilk.map((m: any) => (
                          <tr key={m.id} className="border-b border-gray-100">
                            <td className="py-2 px-2">{new Date(m.date).toLocaleDateString()}</td>
                            <td className="py-2 px-2">{m.morning_yield}</td>
                            <td className="py-2 px-2">{m.evening_yield}</td>
                            <td className="py-2 px-2 font-medium">{Number(m.total_yield || 0).toFixed(2)}</td>
                            <td className="py-2 px-2 text-green-600">₹{Number(m.total_income || 0).toFixed(2)}</td>
                            <td className="py-2 px-2">
                              <motion.button className="text-red-400 hover:text-red-500" whileHover={{ scale: 1.2 }} onClick={() => handleDeleteMilk(m.id)}>
                                <X className="w-3 h-3" />
                              </motion.button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {profileTab === 'health' && (
                <div className="space-y-4">
                  {animalHealth.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">No health records</div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          {['Type', 'Treatment', 'Date', 'Next Due', 'Status', 'Action'].map(h => (
                            <th key={h} className="text-left py-2 px-2 text-gray-500 font-medium">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {animalHealth.map((h) => (
                          <tr key={h.id} className="border-b border-gray-100">
                            <td className="py-2 px-2">{h.record_type || '--'}</td>
                            <td className="py-2 px-2">{h.vaccine_or_treatment}</td>
                            <td className="py-2 px-2">{new Date(h.date_given).toLocaleDateString()}</td>
                            <td className="py-2 px-2">{h.next_due_date ? new Date(h.next_due_date).toLocaleDateString() : '--'}</td>
                            <td className="py-2 px-2">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(h.status)}`}>{h.status}</span>
                            </td>
                            <td className="py-2 px-2">
                              <motion.button className="text-red-400 hover:text-red-500" whileHover={{ scale: 1.2 }} onClick={() => handleDeleteHealth(h.id)}>
                                <X className="w-3 h-3" />
                              </motion.button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {profileTab === 'breeding' && (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <motion.button className="btn-primary flex items-center gap-2 px-4 py-2 text-sm font-medium" whileHover={{ scale: 1.05 }} onClick={() => setShowAddBreeding(true)}>
                      <Plus className="w-4 h-4" /> Add Breeding Record
                    </motion.button>
                  </div>
                  {animalBreeding.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">No breeding records</div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          {['Date', 'Type', 'Bull/Semen', 'Pregnant', 'Expected', 'Status', 'Action'].map(h => (
                            <th key={h} className="text-left py-2 px-2 text-gray-500 font-medium">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {animalBreeding.map((b) => (
                          <tr key={b.id} className="border-b border-gray-100">
                            <td className="py-2 px-2">{new Date(b.breeding_date).toLocaleDateString()}</td>
                            <td className="py-2 px-2">{b.breeding_type || '--'}</td>
                            <td className="py-2 px-2">{b.bull_or_semen_id || '--'}</td>
                            <td className="py-2 px-2">{b.pregnancy_confirmed ? 'Yes' : 'No'}</td>
                            <td className="py-2 px-2">{b.expected_calving_date ? new Date(b.expected_calving_date).toLocaleDateString() : '--'}</td>
                            <td className="py-2 px-2"><span className="badge badge-blue">{b.calving_status}</span></td>
                            <td className="py-2 px-2">
                              <motion.button className="text-red-400 hover:text-red-500" whileHover={{ scale: 1.2 }} onClick={() => handleDeleteBreeding(b.id)}>
                                <X className="w-3 h-3" />
                              </motion.button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Milk Record Modal (in profile) */}
      <AnimatePresence>
        {showAddMilk && selectedAnimal && (
          <motion.div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddMilk(false)}>
            <motion.div className="glass-card p-6 w-full max-w-md mx-4" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-dark">Add Milk Record - {selectedAnimal.name}</h3>
                <motion.button className="p-2 hover:bg-gray-100 rounded-lg" whileHover={{ scale: 1.1 }} onClick={() => setShowAddMilk(false)}>
                  <X className="w-5 h-5 text-gray-500" />
                </motion.button>
              </div>
              <form onSubmit={handleAddMilkRecord} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Date</label>
                  <input type="date" required value={addMilkForm.date} onChange={(e) => setAddMilkForm({ ...addMilkForm, date: e.target.value })} className="input-field w-full px-3 py-2 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1">Morning (L)</label>
                    <input type="number" step="0.1" value={addMilkForm.morning_yield} onChange={(e) => setAddMilkForm({ ...addMilkForm, morning_yield: parseFloat(e.target.value) || 0 })} className="input-field w-full px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1">Evening (L)</label>
                    <input type="number" step="0.1" value={addMilkForm.evening_yield} onChange={(e) => setAddMilkForm({ ...addMilkForm, evening_yield: parseFloat(e.target.value) || 0 })} className="input-field w-full px-3 py-2 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Price per Litre (₹)</label>
                  <input type="number" value={addMilkForm.milk_price_per_litre} onChange={(e) => setAddMilkForm({ ...addMilkForm, milk_price_per_litre: parseFloat(e.target.value) || 35 })} className="input-field w-full px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Notes</label>
                  <textarea value={addMilkForm.notes} onChange={(e) => setAddMilkForm({ ...addMilkForm, notes: e.target.value })} className="input-field w-full px-3 py-2 text-sm" rows={2} />
                </div>
                <motion.button type="submit" className="btn-primary w-full py-2.5 font-medium" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  Add Record
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Breeding Record Modal (in profile) */}
      <AnimatePresence>
        {showAddBreeding && selectedAnimal && (
          <motion.div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddBreeding(false)}>
            <motion.div className="glass-card p-6 w-full max-w-md mx-4" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-dark">Add Breeding Record - {selectedAnimal.name}</h3>
                <motion.button className="p-2 hover:bg-gray-100 rounded-lg" whileHover={{ scale: 1.1 }} onClick={() => setShowAddBreeding(false)}>
                  <X className="w-5 h-5 text-gray-500" />
                </motion.button>
              </div>
              <form onSubmit={handleAddBreeding} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Breeding Date</label>
                  <input type="date" required value={addBreedingForm.breeding_date} onChange={(e) => setAddBreedingForm({ ...addBreedingForm, breeding_date: e.target.value })} className="input-field w-full px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Type</label>
                  <select value={addBreedingForm.breeding_type} onChange={(e) => setAddBreedingForm({ ...addBreedingForm, breeding_type: e.target.value as any })} className="select-field w-full px-3 py-2 text-sm">
                    <option value="Natural">Natural</option>
                    <option value="Artificial Insemination">Artificial Insemination</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Bull/Semen ID</label>
                  <input type="text" value={addBreedingForm.bull_or_semen_id} onChange={(e) => setAddBreedingForm({ ...addBreedingForm, bull_or_semen_id: e.target.value })} className="input-field w-full px-3 py-2 text-sm" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={addBreedingForm.pregnancy_confirmed} onChange={(e) => setAddBreedingForm({ ...addBreedingForm, pregnancy_confirmed: e.target.checked })} />
                  <label className="text-sm text-dark">Pregnancy Confirmed</label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Expected Calving Date</label>
                  <input type="date" value={addBreedingForm.expected_calving_date} onChange={(e) => setAddBreedingForm({ ...addBreedingForm, expected_calving_date: e.target.value })} className="input-field w-full px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Notes</label>
                  <textarea value={addBreedingForm.notes} onChange={(e) => setAddBreedingForm({ ...addBreedingForm, notes: e.target.value })} className="input-field w-full px-3 py-2 text-sm" rows={2} />
                </div>
                <motion.button type="submit" className="btn-primary w-full py-2.5 font-medium" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  Add Breeding Record
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
