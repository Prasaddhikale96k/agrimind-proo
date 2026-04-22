'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
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
  getTasks,
  addTask,
  completeTask,
  deleteTask,
  getKPIMetrics,
  getCattleFinancialSummary,
  type Cattle,
  type MilkProduction,
  type HealthRecord,
  type CattleTask,
} from '@/lib/cattleService'
import type { SupabaseClient } from '@supabase/supabase-js'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'
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
  Trash2,
  Milk,
  Baby,
  Leaf,
  Activity,
  Pipette,
  Scissors,
  FileText,
  Send,
  RefreshCw,
  MessageCircle,
  Check,
  IndianRupee,
} from 'lucide-react'

const BREEDS = ['Gir', 'HF Cross', 'Sahiwal', 'Jersey', 'Murrah', 'Ongole', 'Brahman', 'Amrit Mahal', 'Tharparkar', 'Red Sindhi']

const CATEGORIES = [
  { id: 'Milking', label: 'Milking', icon: Milk, color: 'blue' },
  { id: 'Pregnant', label: 'Pregnant', icon: Heart, color: 'pink' },
  { id: 'Dry', label: 'Dry', icon: Leaf, color: 'amber' },
  { id: 'Calf', label: 'Calf', icon: Baby, color: 'purple' },
]

const RECORD_TYPES = [
  { id: 'Vaccination', label: 'Vaccination', icon: Syringe },
  { id: 'Treatment', label: 'Treatment', icon: Pipette },
  { id: 'Deworming', label: 'Deworming', icon: Activity },
  { id: 'Checkup', label: 'Checkup', icon: Heart },
  { id: 'Surgery', label: 'Surgery', icon: Scissors },
  { id: 'Other', label: 'Other', icon: FileText },
]

const STATUS_OPTIONS = [
  { id: 'Done', label: 'Done', icon: Check },
  { id: 'Pending', label: 'Pending', icon: AlertTriangle },
  { id: 'Scheduled', label: 'Scheduled', icon: Calendar },
]

const AI_QUICK_PROMPTS = [
  'Why is my cow giving less milk?',
  'Signs of cattle fever?',
  'Best feed for pregnant cow?',
  'Vaccination schedule for calves?',
]

const modalVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring' as const, damping: 25, stiffness: 300 } },
  exit: { opacity: 0, scale: 0.9, y: 10, transition: { duration: 0.2 } },
}

const drawerVariants = {
  hidden: { y: '100%' },
  visible: { y: 0, transition: { type: 'spring' as const, damping: 30, stiffness: 300 } },
  exit: { y: '100%', transition: { duration: 0.25 } },
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, damping: 20 } },
}

const categoryCardVariants = {
  unselected: { scale: 1, borderColor: '#e5e7eb', backgroundColor: '#ffffff' },
  selected: { scale: 1.02, borderColor: '#16a34a', backgroundColor: '#f0fdf4' },
}

const TypewriterText = ({ text, speed = 30 }: { text: string; speed?: number }) => {
  const [displayedText, setDisplayedText] = useState('')
  useEffect(() => {
    setDisplayedText('')
    if (!text) return
    let i = 0
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1))
      i++
      if (i >= text.length) clearInterval(interval)
    }, speed)
    return () => clearInterval(interval)
  }, [text, speed])
  return <>{displayedText || ' '}</>
}

export default function CattlePage() {
  const { user, supabase: db, loading: authLoading } = useAuth()
  const userId = user?.id || ''

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    )
  }

  // All useState hooks MUST be at the top level, before any conditional logic
  const [cattle, setCattle] = useState<Cattle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<string>('All')
  const [error, setError] = useState<string | null>(null)
  const [kpi, setKpi] = useState({
    totalCattle: 0,
    avgDailyMilk: 0,
    healthIndex: 0,
    pregnantCows: 0,
    vaccinationDue: 0,
    avgWeight: 0,
  })
  const [milkChartData, setMilkChartData] = useState<any[]>([])
  const [weeklyTotal, setWeeklyTotal] = useState(0)
  const [weeklyIncome, setWeeklyIncome] = useState(0)
  const [lastMilkMap, setLastMilkMap] = useState<Map<string, number>>(new Map())
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([])
  const [tasks, setTasks] = useState<CattleTask[]>([])
  const [showAddAnimal, setShowAddAnimal] = useState(false)
  const [showAddHealth, setShowAddHealth] = useState(false)
  const [showAddTask, setShowAddTask] = useState(false)
  const [selectedAnimal, setSelectedAnimal] = useState<Cattle | null>(null)
  const [profileTab, setProfileTab] = useState<'overview' | 'milk' | 'health'>('overview')
  const [animalMilk, setAnimalMilk] = useState<MilkProduction[]>([])
  const [animalHealth, setAnimalHealth] = useState<HealthRecord[]>([])
  const [financial, setFinancial] = useState({ totalMilkIncome: 0, totalFeedExpense: 0, totalHealthExpense: 0, netProfit: 0 })
  const [addAnimalForm, setAddAnimalForm] = useState({
    tag_id: '',
    name: '',
    breed: '',
    date_of_birth: '',
    gender: 'Female' as 'Female' | 'Male',
    category: 'Milking',
    daily_milk_yield: '',
    weight_kg: '',
    notes: '',
  })
  const [addTaskForm, setAddTaskForm] = useState<{
    title: string
    task_type: 'Vaccination' | 'Calving' | 'Deworming' | 'Vet Checkup' | 'Breeding' | 'Other'
    description: string
    related_animals: string
    due_date: string
    priority: 'High' | 'Medium' | 'Low'
    color_dot: string
  }>({
    title: '',
    task_type: 'Vaccination',
    description: '',
    related_animals: '',
    due_date: new Date().toISOString().split('T')[0],
    priority: 'Medium',
    color_dot: 'red',
  })
  const [addHealthForm, setAddHealthForm] = useState({
    cattle_id: '',
    tag_id: '',
    animal_name: '',
    record_type: 'Vaccination' as const,
    vaccine_or_treatment: '',
    date_given: new Date().toISOString().split('T')[0],
    next_due_date: '',
    cost: 0,
    status: 'Done' as const,
    notes: '',
  })
  const [showAddMilk, setShowAddMilk] = useState(false)
  const [addMilkForm, setAddMilkForm] = useState({
    date: new Date().toISOString().split('T')[0],
    morning_yield: 0,
    evening_yield: 0,
    milk_price_per_litre: 35,
    notes: '',
  })
  const [showNotes, setShowNotes] = useState(false)
  const [showHealthNotes, setShowHealthNotes] = useState(false)
  const [breedSuggestions, setBreedSuggestions] = useState<string[]>([])
  const [tagSearch, setTagSearch] = useState('')
  const [aiAdvisorOpen, setAiAdvisorOpen] = useState(false)
  const [aiMessage, setAiMessage] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResponse, setAiResponse] = useState('')
  const [aiInsight, setAiInsight] = useState('')
  const [insightLoading, setInsightLoading] = useState(false)

  // Error boundary check - after all hooks are declared
  if (error && cattle.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Connection Failed</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null)
              refreshData()
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    )
  }

   const refreshData = useCallback(async () => {
    if (!userId) return
    try {
      setLoading(true)
      setError(null)
      const { data: cattleData } = await db
        .from('cattle')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      setCattle(cattleData || [])
      try {
        const kpiData = await getKPIMetrics(db, userId)
        setKpi(kpiData)
      } catch (err) {
        console.warn('KPI fetch failed:', err)
        setError('Failed to load statistics. Pull to refresh.')
      }
      try {
        const milkSummary = await getWeeklyMilkSummary(db, userId)
        setMilkChartData(milkSummary)
      } catch (err) {
        console.warn('Milk summary fetch failed:', err)
        setError('Some data failed to load. Pull to refresh.')
      }
      try {
        const healthData = await getHealthRecords(db, userId)
        setHealthRecords(healthData || [])
      } catch {}
      try {
        const taskData = await getTasks(db, userId)
        setTasks(taskData || [])
      } catch {}
    } catch (error) {
      console.error('Error refreshing data:', error)
      setError('Connection timeout. Check your internet or disable ad-blockers.')
    } finally {
      setLoading(false)
    }
  }, [userId, db])

  const refreshRef = useRef(refreshData)
  refreshRef.current = refreshData

  const herdSectionRef = useRef<HTMLDivElement>(null)
  const statCardsRef = useRef<HTMLDivElement>(null)
  const counterRefs = useRef<Record<string, any>>({
    totalCattle: {val: 0},
    avgDailyMilk: {val: 0},
    healthIndex: {val: 0},
    pregnantCows: {val: 0},
    vaccinationDue: {val: 0},
    avgWeight: {val: 0}
  })

  const filteredCattle = cattle.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.tag_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.breed.toLowerCase().includes(searchTerm.toLowerCase())

    let matchesFilter = true
    if (filter === 'Milking') matchesFilter = c.category === 'Milking'
    else if (filter === 'Pregnant') matchesFilter = c.category === 'Pregnant'
    else if (filter === 'Dry') matchesFilter = c.category === 'Dry'
    else if (filter === 'Calf') matchesFilter = c.category === 'Calf'

    return matchesSearch && matchesFilter
  })

  useEffect(() => {
    if (!userId) return

    const channel = db
      .channel('cattle-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cattle' }, () => refreshRef.current())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'milk_production' }, () => refreshRef.current())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'health_records' }, () => refreshRef.current())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cattle_tasks' }, () => refreshRef.current())
      .subscribe()

    return () => {
      db.removeChannel(channel)
    }
  }, [userId, db])

  useEffect(() => {
    if (loading || !statCardsRef.current) return

    const tl = gsap.timeline()

    tl.from('.stat-card', {
      y: 40,
      opacity: 0,
      stagger: 0.1,
      duration: 0.6,
      ease: 'power3.out',
    }).from('.ai-banner', {
      opacity: 0,
      y: 20,
      duration: 0.5,
    }, '-=0.3').from('.herd-section', {
      opacity: 0,
      y: 30,
      duration: 0.5,
    }, '-=0.2')

    gsap.to('.particle', {y: -20, x: 'random(-15, 15)', repeat: -1, yoyo: true, stagger: 0.3, duration: 2, ease: 'sine.inOut'})

    gsap.to('.task-checkmark', { strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut', delay: 0.5 })

    // Magnetic button
    const magneticBtnArray = document.querySelectorAll('.add-animal-btn')
    magneticBtnArray.forEach(btn => {
      btn.addEventListener('mousemove', (e: any) => {
        const rect = btn.getBoundingClientRect()
        const x = e.clientX - rect.left - rect.width/2
        const y = e.clientY - rect.top - rect.height/2
        gsap.to(btn, {x: x*0.3, y: y*0.3, duration: 0.3})
      })
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, {x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)'})
      })
    })

    Object.keys(counterRefs.current).forEach((key) => {
      const targetValue = kpi[key as keyof typeof kpi] as number
      if (targetValue > 0) {
        gsap.to(counterRefs.current[key], {
          val: targetValue,
          duration: 1.5,
          ease: 'power2.out',
          onUpdate: () => {
            const el = document.getElementById(`counter-${key}`)
            if (el) {
              el.textContent = Math.round(counterRefs.current[key].val).toString()
            }
          },
        })
      }
    })

    return () => {
      tl.kill()
    }
  }, [loading, kpi])

  useEffect(() => {
    if (!herdSectionRef.current || filteredCattle.length === 0) return

    const ctx = gsap.context(() => {
      gsap.from('.cattle-card', {
        y: 30,
        opacity: 0,
        stagger: 0.1,
        duration: 0.5,
        scrollTrigger: {
          trigger: herdSectionRef.current,
          start: 'top 80%',
        },
      })
    }, herdSectionRef)

    return () => ctx.revert()
  }, [filteredCattle.length])

  const getHealthBadgeClass = (status: string) => {
    switch (status) {
      case 'Good':
      case 'Normal':
        return 'bg-green-100 text-green-700'
      case 'Sick':
        return 'bg-red-100 text-red-700'
      case 'Under Treatment':
        return 'bg-orange-100 text-orange-700'
      case 'Attention':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Done':
        return 'bg-green-100 text-green-700'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700'
      case 'Scheduled':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getCategoryColor = (category: string | null) => {
    switch (category) {
      case 'Milking':
        return 'blue'
      case 'Pregnant':
        return 'pink'
      case 'Dry':
        return 'amber'
      case 'Calf':
        return 'purple'
      default:
        return 'gray'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-500'
      case 'Medium':
        return 'bg-yellow-500'
      case 'Low':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
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
    if (months < 12) return `${months} mo`
    const years = Math.floor(months / 12)
    const remainMonths = months % 12
    return remainMonths > 0 ? `${years}y ${remainMonths}m` : `${years} yrs`
  }

  const handleAddAnimal = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !userId) {
      toast.error('Please log in first')
      return
    }

     if (!addAnimalForm.tag_id || !addAnimalForm.name || !addAnimalForm.breed) {
       const form = e.target as HTMLFormElement
       gsap.to(form, { x: [-10, 10, -10, 10, 0] as any, duration: 0.4 })
       toast.error('Please fill all required fields')
       return
     }

     try {
       await addCattle(db, {
         user_id: userId,
         tag_id: addAnimalForm.tag_id,
         name: addAnimalForm.name,
         breed: addAnimalForm.breed,
         date_of_birth: addAnimalForm.date_of_birth || null,
         age_display: calculateAge(addAnimalForm.date_of_birth),
         gender: addAnimalForm.gender,
         category: addAnimalForm.category as 'Milking' | 'Pregnant' | 'Dry' | 'Calf' | 'Bull' | 'Sick',
         health_status: 'Good',
         weight_kg: addAnimalForm.weight_kg ? parseFloat(addAnimalForm.weight_kg) : null,
         notes: addAnimalForm.notes || null,
       })
      toast.success('Animal added successfully!')
      setShowAddAnimal(false)
      setAddAnimalForm({
        tag_id: '',
        name: '',
        breed: '',
        date_of_birth: '',
        gender: 'Female',
        category: 'Milking',
        daily_milk_yield: '',
        weight_kg: '',
        notes: '',
      })
    } catch (error: any) {
      toast.error(error.message || 'Failed to add animal')
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
        color_dot: addTaskForm.priority === 'High' ? 'red' : addTaskForm.priority === 'Medium' ? 'yellow' : 'green',
      })
      toast.success('Task added!')
      setShowAddTask(false)
      setAddTaskForm({
        title: '',
        task_type: 'Vaccination',
        description: '',
        related_animals: '',
        due_date: new Date().toISOString().split('T')[0],
        priority: 'Medium',
        color_dot: 'red',
      })
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
      setAddHealthForm({
        cattle_id: '',
        tag_id: '',
        animal_name: '',
        record_type: 'Vaccination',
        vaccine_or_treatment: '',
        date_given: new Date().toISOString().split('T')[0],
        next_due_date: '',
        cost: 0,
        status: 'Done',
        notes: '',
      })
    } catch (error) {
      toast.error('Failed to add health record')
    }
  }

  const handleCompleteTask = async (taskId: string) => {
    try {
      await completeTask(db, taskId)
      toast.success('Task completed!')
    } catch (error) {
      toast.error('Failed to complete task')
    }
  }

  const handleDeleteAnimal = async (id: string) => {
    if (!confirm('Deactivate this animal?')) return
    try {
      await deleteCattle(db, id)
      toast.success('Animal deactivated')
      setSelectedAnimal(null)
    } catch (error) {
      toast.error('Failed to delete animal')
    }
  }

  const handleDeleteHealth = async (id: string) => {
    if (!confirm('Delete this record?')) return
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

  const loadAnimalProfile = async (animal: Cattle) => {
    setSelectedAnimal(animal)
    setProfileTab('overview')
    try {
      const [milk, health] = await Promise.all([
        getMilkRecords(db, animal.id),
        getHealthRecords(db, userId).then((r) => r.filter((h) => h.cattle_id === animal.id)),
      ])
      setAnimalMilk(milk as any)
      setAnimalHealth(health)
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  const handleAddMilkRecord = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAnimal || (!addMilkForm.morning_yield && !addMilkForm.evening_yield)) {
      toast.error('Enter at least one yield value')
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
      setAddMilkForm({
        date: new Date().toISOString().split('T')[0],
        morning_yield: 0,
        evening_yield: 0,
        milk_price_per_litre: 35,
        notes: '',
      })
      loadAnimalProfile(selectedAnimal)
    } catch (error) {
      toast.error('Failed to add milk record')
    }
  }

  const handleDeleteMilk = async (id: string) => {
    if (!confirm('Delete this record?')) return
    try {
      await deleteMilkRecord(db, id)
      toast.success('Record deleted')
      if (selectedAnimal) loadAnimalProfile(selectedAnimal)
    } catch (error) {
      toast.error('Failed to delete record')
    }
  }

  const handleBreedChange = (value: string) => {
    setAddAnimalForm({ ...addAnimalForm, breed: value })
    if (value.length > 0) {
      const filtered = BREEDS.filter((b) => b.toLowerCase().includes(value.toLowerCase()))
      setBreedSuggestions(filtered.slice(0, 5))
    } else {
      setBreedSuggestions([])
    }
  }

  const handleTagSelect = (tagId: string) => {
    const animal = cattle.find((c) => c.tag_id === tagId)
    if (animal) {
      setAddHealthForm({
        ...addHealthForm,
        tag_id: tagId,
        animal_name: animal.name,
        cattle_id: animal.id,
      })
    }
    setTagSearch('')
  }

  const filteredTagSuggestions = cattle.filter(
    (c) =>
      c.tag_id.toLowerCase().includes(tagSearch.toLowerCase()) ||
      c.name.toLowerCase().includes(tagSearch.toLowerCase())
  )

  const fetchAIInsight = async () => {
    setInsightLoading(true)
    try {
      const groqKey = process.env.NEXT_PUBLIC_GROQ_API_KEY
      if (!groqKey) {
        setAiInsight('Add your Groq API key to enable AI insights.')
        return
      }

      const context = `Total cattle: ${kpi.totalCattle}, Avg milk: ${kpi.avgDailyMilk}L, Pregnant: ${kpi.pregnantCows}, Vaccination due: ${kpi.vaccinationDue}`
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            {
              role: 'system',
              content:
                'You are an expert cattle health advisor for Indian farmers. Generate a single, practical, 1-sentence insight for a farmer based on their cattle data. Make it actionable and encouraging.',
            },
            { role: 'user', content: `My cattle data: ${context}. Give me one actionable insight.` },
          ],
          temperature: 0.7,
          max_tokens: 100,
        }),
      })

      const data = await response.json()
      const insight = data.choices?.[0]?.message?.content || 'Unable to generate insight at this time.'
      setAiInsight(insight)
    } catch (error) {
      console.error('AI Insight error:', error)
      setAiInsight('Failed to generate insight. Please try again.')
    } finally {
      setInsightLoading(false)
    }
  }

  useEffect(() => {
    if (cattle.length > 0 && !aiInsight) {
      fetchAIInsight()
    }
  }, [cattle.length])

  const handleAISend = async () => {
    if (!aiMessage.trim()) return

    setAiLoading(true)
    setAiResponse('')

    try {
      const groqKey = process.env.NEXT_PUBLIC_GROQ_API_KEY
      if (!groqKey) {
        setAiResponse('Please add your Groq API key to .env.local')
        setAiLoading(false)
        return
      }

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            {
              role: 'system',
              content:
                'You are an expert cattle health advisor for Indian farmers. Help farmers with cattle health issues, milk production optimization, vaccination schedules, feeding advice, and general cattle management. Keep responses concise, practical, and easy to understand. Use simple language suitable for farmers.',
            },
            { role: 'user', content: aiMessage },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      })

      const data = await response.json()
      const result = data.choices?.[0]?.message?.content || 'Unable to get response.'
      setAiResponse(result)
    } catch (error) {
      console.error('AI error:', error)
      setAiResponse('Failed to get response. Please try again.')
    } finally {
      setAiLoading(false)
    }
  }

  const handleQuickPrompt = (prompt: string) => {
    setAiMessage(prompt)
    setTimeout(() => {
      const tempForm = { target: { value: prompt } } as any
      setAiMessage(prompt)
    }, 50)
  }

  const formatDisplayNumber = (value: number, suffix: string = '') => {
    if (suffix === 'L') return `${value.toFixed(1)}${suffix}`
    if (suffix === '%') return `${Math.round(value)}${suffix}`
    if (suffix === ' Kg') return `${Math.round(value)}${suffix}`
    return value.toString()
  }

  const getStatValue = (key: string) => {
    const value = kpi[key as keyof typeof kpi]
    if (key === 'avgDailyMilk') return formatDisplayNumber(value, 'L')
    if (key === 'healthIndex') return formatDisplayNumber(value, '%')
    if (key === 'avgWeight') return formatDisplayNumber(value, ' Kg')
    return value.toString()
  }

  const getStatSuffix = (key: string) => {
    if (key === 'avgDailyMilk') return 'L'
    if (key === 'healthIndex') return '%'
    if (key === 'avgWeight') return ' kg'
    return ''
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 pb-20">
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold text-gray-900">Cattle Management</h1>
        <p className="text-sm text-gray-500 mt-1">Monitor your herd health, production & breeding</p>
      </motion.div>

      <motion.div ref={statCardsRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { icon: Beef, label: 'Total Cattle', key: 'totalCattle', status: 'Active', color: 'green' },
          { icon: Droplets, label: 'Avg Daily Milk', key: 'avgDailyMilk', status: 'Good', color: 'blue' },
          { icon: Heart, label: 'Health Index', key: 'healthIndex', status: 'Good', color: 'green' },
          { icon: Calendar, label: 'Pregnant', key: 'pregnantCows', status: 'Active', color: 'pink' },
          { icon: Syringe, label: 'Vaccination Due', key: 'vaccinationDue', status: 'Attention', color: 'amber' },
          { icon: Scale, label: 'Avg Weight', key: 'avgWeight', status: 'Normal', color: 'blue' },
        ].map((card, i) => (
          <motion.div
            key={i}
            className="stat-card bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.03, boxShadow: '0 8px 25px rgba(22,163,74,0.15)' }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={`absolute top-0 left-0 right-0 h-1 bg-${card.color}-500`} />
            <div className="flex items-start justify-between">
              <div className={`p-2.5 rounded-xl bg-${card.color}-50`}>
                <card.icon className={`w-5 h-5 text-${card.color}-600`} />
              </div>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  card.status === 'Good' || card.status === 'Active'
                    ? 'bg-green-100 text-green-700'
                    : card.status === 'Attention'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {card.status}
              </span>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-gray-900">
                <span id={`counter-${card.key}`}>0</span>
                {getStatSuffix(card.key)}
              </p>
              <p className="text-sm text-gray-500 mt-1">{card.label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className="ai-banner relative bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-5 text-white overflow-hidden"
        variants={itemVariants}
      >
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="particle absolute w-2 h-2 bg-green-400/30 rounded-full"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
              }}
            />
          ))}
        </div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-xl">
              <Sparkles className="w-5 h-5 text-green-400 animate-pulse" />
            </div>
            <div>
              <h3 className="font-semibold">AI Insights</h3>
              <p className="text-sm text-gray-300 whitespace-pre-line min-h-[20px]">
                <TypewriterText text={aiInsight || 'Loading insight...'} />
              </p>
            </div>
          </div>
          <motion.button
            className="p-2 hover:bg-white/10 rounded-lg"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={fetchAIInsight}
            disabled={insightLoading}
          >
            <RefreshCw className={`w-5 h-5 ${insightLoading ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <motion.div ref={herdSectionRef} className="herd-section bg-white rounded-2xl p-5 border border-gray-100 shadow-sm" variants={itemVariants}>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h3 className="font-semibold text-gray-900 text-lg">My Herd</h3>
              <motion.button
                className="add-animal-btn flex items-center gap-2 px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddAnimal(true)}
              >
                <Plus className="w-4 h-4" />
                Add New Animal
              </motion.button>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by tag, name, or breed..."
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
              />
            </div>

            <div className="flex gap-2 mb-4 flex-wrap">
              {['All', 'Milking', 'Pregnant', 'Dry', 'Calf'].map((f) => (
                <button key={f} onClick={() => setFilter(f)} className="relative">
                  <motion.div
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filter === f
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    layoutId="activeTab"
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  >
                    {f}
                  </motion.div>
                </button>
              ))}
            </div>

            {filteredCattle.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                {cattle.length === 0
                  ? 'No animals added yet. Click + Add New Animal'
                  : 'No cattle matching your search'}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCattle.map((c) => (
                  <motion.div
                    key={c.id}
                    className="cattle-card flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all cursor-pointer"
                    whileHover={{ y: -2, boxShadow: '0 8px 25px rgba(22,163,74,0.15)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => loadAnimalProfile(c)}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold bg-${getCategoryColor(c.category)}-500`}
                    >
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-900">{c.name}</span>
                        <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full">
                          {c.tag_id}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            c.category === 'Milking'
                              ? 'bg-blue-100 text-blue-700'
                              : c.category === 'Pregnant'
                              ? 'bg-pink-100 text-pink-700'
                              : c.category === 'Dry'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}
                        >
                          {c.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span>{c.breed}</span>
                        <span>{calculateAge(c.date_of_birth)}</span>
                        {lastMilkMap.has(c.id) && (
                          <span className="text-green-600 font-medium">
                            {lastMilkMap.get(c.id)}L
                          </span>
                        )}
                      </div>
                    </div>
                    <motion.button
                      className="px-3 py-1.5 text-sm text-green-600 border border-green-600 rounded-full hover:bg-green-50 flex items-center gap-1"
                      whileHover={{ scale: 1.05 }}
                    >
                      View <ChevronRight className="w-3 h-3" />
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm" variants={itemVariants}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 text-lg">Health & Vaccination Records</h3>
              <motion.button
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddHealth(true)}
              >
                <Plus className="w-4 h-4" />
                Add Health Record
              </motion.button>
            </div>

            {healthRecords.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-32 h-32 mx-auto relative mb-4">
                  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
                    <circle cx="50" cy="50" r="45" fill="#f0fdf4" />
                    <text x="50" y="55" fontSize="40" textAnchor="middle" dominantBaseline="middle">🐄</text>
                    <path
                      d="M70 30 C 80 20, 90 40, 80 50 C 70 60, 60 40, 70 30"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="3"
                      className="origin-center animate-pulse"
                    />
                    <circle cx="65" cy="35" r="4" fill="#3b82f6" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium font-md">No health records yet — your herd is healthy! 🐄</p>
              </div>
            ) : (
              <div className="space-y-3">
                {healthRecords.slice(0, 5).map((r) => (
                  <motion.div
                    key={r.id}
                    className="flex items-center gap-4 p-3 border-l-4 border-green-500 bg-gray-50 rounded-r-xl"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-900">{r.animal_name || r.tag_id}</span>
                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                          {r.record_type}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(r.date_given).toLocaleDateString()}
                        {r.next_due_date && ` • Next: ${new Date(r.next_due_date).toLocaleDateString()}`}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClass(r.status)}`}
                    >
                      {r.status}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <motion.div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm" variants={itemVariants}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <h3 className="font-semibold text-gray-900">Upcoming Tasks</h3>
              </div>
              <motion.button
                className="text-sm text-green-600 font-medium"
                whileHover={{ scale: 1.05 }}
                onClick={() => setShowAddTask(true)}
              >
                <Plus className="w-4 h-4 inline mr-1" />
                Add
              </motion.button>
            </div>

            {tasks.length === 0 ? (
              <div className="text-center py-10">
                <svg className="w-24 h-24 mx-auto mb-4 task-empty-svg" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                  <path
                    className="task-checkmark"
                    d="M28 52L42 66L72 34"
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ strokeDasharray: 100, strokeDashoffset: 100 }}
                  />
                </svg>
                <p className="text-gray-400 font-medium">All caught up!</p>
                <p className="text-sm text-gray-400 mt-1">No pending tasks</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <motion.div
                    key={task.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className="relative mt-1.5">
                      <div
                        className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${getPriorityColor(
                          task.priority
                        )}`}
                      />
                      {daysUntil(task.due_date) === 'Overdue' && (
                        <motion.div
                          className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-orange-500 rounded-full"
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{task.title}</p>
                      {task.description && (
                        <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
                        {daysUntil(task.due_date)}
                      </span>
                      <div className="flex gap-1">
                        <motion.button
                          className="text-green-600 hover:text-green-700"
                          whileHover={{ scale: 1.2 }}
                          onClick={() => handleCompleteTask(task.id)}
                          title="Mark complete"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          className="text-red-400 hover:text-red-500"
                          whileHover={{ scale: 1.2 }}
                          onClick={() => handleDeleteTask(task.id)}
                          title="Delete"
                        >
                          <X className="w-3 h-3" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm" variants={itemVariants}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Milk Production - This Week</h3>
            </div>
            {milkChartData.length === 0 || weeklyTotal === 0 ? (
              <div className="text-center py-8 text-gray-400">No milk records this week</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={milkChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
                    <Tooltip formatter={(value: any) => `${value}L`} />
                    <Bar dataKey="yield" fill="#16a34a" radius={[4, 4, 0, 0]} name="Daily Yield" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Total Weekly Yield</span>
                    <span className="text-lg font-bold text-green-600">{weeklyTotal} Litres</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Estimated Income</span>
                    <span className="text-lg font-bold text-green-600">₹{weeklyIncome}</span>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showAddAnimal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm p-0 md:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddAnimal(false)}
          >
            <motion.div
              className="bg-white rounded-t-3xl md:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Add New Animal</h3>
                  <motion.button
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowAddAnimal(false)}
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </motion.button>
                </div>

                <motion.form
                  onSubmit={handleAddAnimal}
                  className="space-y-5"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tag ID <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={addAnimalForm.tag_id}
                        onChange={(e) =>
                          setAddAnimalForm({ ...addAnimalForm, tag_id: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all pr-10"
                        placeholder="e.g., A-009"
                      />
                      <AnimatePresence>
                        {addAnimalForm.tag_id && (
                          <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 pointer-events-none">
                            <CheckCircle className="w-5 h-5" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={addAnimalForm.name}
                        onChange={(e) =>
                          setAddAnimalForm({ ...addAnimalForm, name: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all pr-10"
                        placeholder="e.g., Ganga"
                      />
                      <AnimatePresence>
                        {addAnimalForm.name && (
                          <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 pointer-events-none">
                            <CheckCircle className="w-5 h-5" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Breed <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={addAnimalForm.breed}
                        onChange={(e) => handleBreedChange(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all pr-10"
                        placeholder="e.g., Gir, HF Cross"
                      />
                      <AnimatePresence>
                        {addAnimalForm.breed && breedSuggestions.length === 0 && (
                          <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="absolute right-3 top-[1.3rem] -translate-y-1/2 text-green-500 pointer-events-none">
                            <CheckCircle className="w-5 h-5" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                      {breedSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg">
                          {breedSuggestions.map((breed) => (
                            <button
                              key={breed}
                              type="button"
                              className="w-full px-4 py-2 text-left hover:bg-gray-50"
                              onClick={() => {
                                setAddAnimalForm({ ...addAnimalForm, breed })
                                setBreedSuggestions([])
                              }}
                            >
                              {breed}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={addAnimalForm.date_of_birth}
                      onChange={(e) =>
                        setAddAnimalForm({ ...addAnimalForm, date_of_birth: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-3">
                      {[
                        { id: 'Female', label: '🐄 Female' },
                        { id: 'Male', label: '🐂 Male' },
                      ].map((g) => (
                        <motion.button
                          key={g.id}
                          type="button"
                          className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all ${
                            addAnimalForm.gender === g.id
                              ? 'border-green-600 bg-green-50 text-green-700'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                          onClick={() =>
                            setAddAnimalForm({
                              ...addAnimalForm,
                              gender: g.id as 'Female' | 'Male',
                            })
                          }
                          whileTap={{ scale: 0.98 }}
                        >
                          {g.label}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {CATEGORIES.map((cat) => (
                        <motion.button
                          key={cat.id}
                          type="button"
                          className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                            addAnimalForm.category === cat.id
                              ? `border-${cat.color}-500 bg-${cat.color}-50`
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() =>
                            setAddAnimalForm({ ...addAnimalForm, category: cat.id })
                          }
                          whileTap={{ scale: 0.98 }}
                          variants={categoryCardVariants}
                          animate={
                            addAnimalForm.category === cat.id
                              ? 'selected'
                              : 'unselected'
                          }
                        >
                          <cat.icon
                            className={`w-6 h-6 ${
                              addAnimalForm.category === cat.id
                                ? `text-${cat.color}-600`
                                : 'text-gray-400'
                            }`}
                          />
                          <span className="text-sm font-medium">{cat.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>

                  <AnimatePresence>
                    {addAnimalForm.category === 'Milking' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Daily Milk Yield (L)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={addAnimalForm.daily_milk_yield}
                          onChange={(e) =>
                            setAddAnimalForm({
                              ...addAnimalForm,
                              daily_milk_yield: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                          placeholder="e.g., 8.5"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      value={addAnimalForm.weight_kg}
                      onChange={(e) =>
                        setAddAnimalForm({ ...addAnimalForm, weight_kg: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                      placeholder="e.g., 300"
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    {!showNotes ? (
                      <button
                        type="button"
                        className="text-sm text-green-600 hover:text-green-700"
                        onClick={() => setShowNotes(true)}
                      >
                        + Add Notes
                      </button>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notes
                        </label>
                        <textarea
                          value={addAnimalForm.notes}
                          onChange={(e) =>
                            setAddAnimalForm({ ...addAnimalForm, notes: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                          rows={3}
                          placeholder="Optional notes..."
                        />
                      </div>
                    )}
                  </motion.div>

                  <motion.button
                    type="submit"
                    className="w-full py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 relative overflow-hidden"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="relative z-10">Add Animal</span>
                  </motion.button>
                </motion.form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddTask && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddTask(false)}
          >
            <motion.div
              className="bg-white rounded-2xl w-full max-w-lg"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Add New Task</h3>
                  <motion.button
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    whileHover={{ scale: 1.1 }}
                    onClick={() => setShowAddTask(false)}
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </motion.button>
                </div>
                <form onSubmit={handleAddTask} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={addTaskForm.title}
                      onChange={(e) =>
                        setAddTaskForm({ ...addTaskForm, title: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                      placeholder="e.g., Vaccination Due"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <select
                        value={addTaskForm.task_type}
                        onChange={(e) =>
                          setAddTaskForm({ ...addTaskForm, task_type: e.target.value as any })
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                      >
                        {[
                          'Vaccination',
                          'Calving',
                          'Deworming',
                          'Vet Checkup',
                          'Breeding',
                          'Other',
                        ].map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                      <select
                        value={addTaskForm.priority}
                        onChange={(e) =>
                          setAddTaskForm({ ...addTaskForm, priority: e.target.value as any })
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                      >
                        {['High', 'Medium', 'Low'].map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={addTaskForm.description}
                      onChange={(e) =>
                        setAddTaskForm({ ...addTaskForm, description: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Related Animals
                      </label>
                      <input
                        type="text"
                        value={addTaskForm.related_animals}
                        onChange={(e) =>
                          setAddTaskForm({
                            ...addTaskForm,
                            related_animals: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                        placeholder="e.g., A-003, A-005"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Due Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={addTaskForm.due_date}
                        onChange={(e) =>
                          setAddTaskForm({ ...addTaskForm, due_date: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <motion.button
                    type="submit"
                    className="w-full py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Add Task
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddHealth && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm p-0 md:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddHealth(false)}
          >
            <motion.div
              className="bg-white rounded-t-3xl md:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Add Health Record</h3>
                  <motion.button
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    whileHover={{ scale: 1.1 }}
                    onClick={() => setShowAddHealth(false)}
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </motion.button>
                </div>

                <form onSubmit={handleAddHealth} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tag ID
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={tagSearch || addHealthForm.tag_id}
                        onChange={(e) => {
                          setTagSearch(e.target.value)
                          if (e.target.value !== addHealthForm.tag_id) {
                            setAddHealthForm({
                              ...addHealthForm,
                              tag_id: '',
                              animal_name: '',
                              cattle_id: '',
                            })
                          }
                        }}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                        placeholder="Search tag or name..."
                      />
                      {tagSearch && filteredTagSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                          {filteredTagSuggestions.slice(0, 5).map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                              onClick={() => handleTagSelect(c.tag_id)}
                            >
                              <span className="font-medium">{c.tag_id}</span>
                              <span className="text-gray-500">- {c.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Animal Name
                    </label>
                    <input
                      type="text"
                      value={addHealthForm.animal_name}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500"
                      placeholder="Auto-filled"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Record Type <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      {RECORD_TYPES.map((type) => (
                        <motion.button
                          key={type.id}
                          type="button"
                          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1.5 transition-all shadow-sm ${
                            addHealthForm.record_type === type.id
                              ? 'bg-green-600 text-white shadow-green-500/30'
                              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                          onClick={() =>
                            setAddHealthForm({
                              ...addHealthForm,
                              record_type: type.id as any,
                            })
                          }
                          whileTap={{ scale: 0.95 }}
                        >
                          <type.icon className="w-4 h-4" />
                          {type.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vaccine / Treatment <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={addHealthForm.vaccine_or_treatment}
                        onChange={(e) =>
                          setAddHealthForm({
                            ...addHealthForm,
                            vaccine_or_treatment: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all pr-10"
                        placeholder="e.g., FMD Vaccine"
                      />
                      <AnimatePresence>
                        {addHealthForm.vaccine_or_treatment && (
                          <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 pointer-events-none">
                            <CheckCircle className="w-5 h-5" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date Given <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={addHealthForm.date_given}
                        onChange={(e) =>
                          setAddHealthForm({
                            ...addHealthForm,
                            date_given: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                      />
                    </div>
                    <AnimatePresence>
                      {(addHealthForm.record_type === 'Vaccination' ||
                        addHealthForm.record_type === 'Deworming') && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Next Due Date
                          </label>
                          <input
                            type="date"
                            value={addHealthForm.next_due_date}
                            onChange={(e) =>
                              setAddHealthForm({
                                ...addHealthForm,
                                next_due_date: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      {STATUS_OPTIONS.map((status) => (
                        <motion.button
                          key={status.id}
                          type="button"
                          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-all ${
                            addHealthForm.status === status.id
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          onClick={() =>
                            setAddHealthForm({
                              ...addHealthForm,
                              status: status.id as any,
                            })
                          }
                          whileTap={{ scale: 0.95 }}
                        >
                          <status.icon className="w-4 h-4" />
                          {status.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cost (₹)
                    </label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        value={addHealthForm.cost}
                        onChange={(e) =>
                          setAddHealthForm({
                            ...addHealthForm,
                            cost: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    {!showHealthNotes ? (
                      <button
                        type="button"
                        className="text-sm text-green-600 hover:text-green-700"
                        onClick={() => setShowHealthNotes(true)}
                      >
                        + Add Notes
                      </button>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notes
                        </label>
                        <textarea
                          value={addHealthForm.notes}
                          onChange={(e) =>
                            setAddHealthForm({
                              ...addHealthForm,
                              notes: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                          rows={3}
                          placeholder="Optional notes..."
                        />
                      </div>
                    )}
                  </div>

                  <motion.button
                    type="submit"
                    className="w-full py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Add Health Record
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedAnimal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedAnimal(null)}
          >
            <motion.div
              className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedAnimal.name} ({selectedAnimal.tag_id})
                    </h3>
                    <p className="text-sm text-gray-500">{selectedAnimal.breed}</p>
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      className="p-2 hover:bg-gray-100 rounded-lg text-red-500"
                      whileHover={{ scale: 1.1 }}
                      onClick={() => handleDeleteAnimal(selectedAnimal.id)}
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      className="p-2 hover:bg-gray-100 rounded-lg"
                      whileHover={{ scale: 1.1 }}
                      onClick={() => setSelectedAnimal(null)}
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </motion.button>
                  </div>
                </div>

                <div className="flex gap-2 mb-6 border-b border-gray-200">
                  {(['overview', 'milk', 'health'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setProfileTab(tab)}
                      className={`px-4 py-2 text-sm font-medium capitalize transition-all ${
                        profileTab === tab
                          ? 'border-b-2 border-green-600 text-green-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {profileTab === 'overview' && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      ['Tag ID', selectedAnimal.tag_id],
                      ['Breed', selectedAnimal.breed],
                      ['Age', calculateAge(selectedAnimal.date_of_birth)],
                      ['Gender', selectedAnimal.gender || '--'],
                      ['Category', selectedAnimal.category || '--'],
                      ['Health', selectedAnimal.health_status],
                      [
                        'Weight',
                        selectedAnimal.weight_kg ? `${selectedAnimal.weight_kg} Kg` : '--',
                      ],
                    ].map(([label, value]) => (
                      <div key={label} className="p-3 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500">{label}</p>
                        <p className="text-sm font-medium text-gray-900">{value}</p>
                      </div>
                    ))}
                  </div>
                )}

                {profileTab === 'milk' && (
                  <div className="space-y-4">
                    <div className="flex justify-end">
                      <motion.button
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg"
                        whileHover={{ scale: 1.05 }}
                        onClick={() => setShowAddMilk(true)}
                      >
                        <Plus className="w-4 h-4" /> Add Milk Record
                      </motion.button>
                    </div>
                    {animalMilk.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">No milk records</div>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            {['Date', 'Morning (L)', 'Evening (L)', 'Total (L)', 'Income (₹)', 'Action'].map(
                              (h) => (
                                <th
                                  key={h}
                                  className="text-left py-2 px-2 text-gray-500 font-medium"
                                >
                                  {h}
                                </th>
                              )
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {animalMilk.map((m: any) => (
                            <tr key={m.id} className="border-b border-gray-100">
                              <td className="py-2 px-2">
                                {new Date(m.date).toLocaleDateString()}
                              </td>
                              <td className="py-2 px-2">{m.morning_yield}</td>
                              <td className="py-2 px-2">{m.evening_yield}</td>
                              <td className="py-2 px-2 font-medium">
                                {Number(m.total_yield || 0).toFixed(2)}
                              </td>
                              <td className="py-2 px-2 text-green-600">
                                ₹{Number(m.total_income || 0).toFixed(2)}
                              </td>
                              <td className="py-2 px-2">
                                <motion.button
                                  className="text-red-400 hover:text-red-500"
                                  whileHover={{ scale: 1.2 }}
                                  onClick={() => handleDeleteMilk(m.id)}
                                >
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
                            {['Type', 'Treatment', 'Date', 'Next Due', 'Status', 'Action'].map(
                              (h) => (
                                <th
                                  key={h}
                                  className="text-left py-2 px-2 text-gray-500 font-medium"
                                >
                                  {h}
                                </th>
                              )
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {animalHealth.map((h) => (
                            <tr key={h.id} className="border-b border-gray-100">
                              <td className="py-2 px-2">{h.record_type || '--'}</td>
                              <td className="py-2 px-2">{h.vaccine_or_treatment}</td>
                              <td className="py-2 px-2">
                                {new Date(h.date_given).toLocaleDateString()}
                              </td>
                              <td className="py-2 px-2">
                                {h.next_due_date
                                  ? new Date(h.next_due_date).toLocaleDateString()
                                  : '--'}
                              </td>
                              <td className="py-2 px-2">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                                    h.status
                                  )}`}
                                >
                                  {h.status}
                                </span>
                              </td>
                              <td className="py-2 px-2">
                                <motion.button
                                  className="text-red-400 hover:text-red-500"
                                  whileHover={{ scale: 1.2 }}
                                  onClick={() => handleDeleteHealth(h.id)}
                                >
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
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddMilk && selectedAnimal && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddMilk(false)}
          >
            <motion.div
              className="bg-white rounded-2xl w-full max-w-md"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">
                    Add Milk Record - {selectedAnimal.name}
                  </h3>
                  <motion.button
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    whileHover={{ scale: 1.1 }}
                    onClick={() => setShowAddMilk(false)}
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </motion.button>
                </div>
                <form onSubmit={handleAddMilkRecord} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      required
                      value={addMilkForm.date}
                      onChange={(e) =>
                        setAddMilkForm({ ...addMilkForm, date: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Morning (L)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={addMilkForm.morning_yield}
                        onChange={(e) =>
                          setAddMilkForm({
                            ...addMilkForm,
                            morning_yield: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Evening (L)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={addMilkForm.evening_yield}
                        onChange={(e) =>
                          setAddMilkForm({
                            ...addMilkForm,
                            evening_yield: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price per Litre (₹)
                    </label>
                    <input
                      type="number"
                      value={addMilkForm.milk_price_per_litre}
                      onChange={(e) =>
                        setAddMilkForm({
                          ...addMilkForm,
                          milk_price_per_litre: parseFloat(e.target.value) || 35,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={addMilkForm.notes}
                      onChange={(e) =>
                        setAddMilkForm({ ...addMilkForm, notes: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                      rows={2}
                    />
                  </div>
                  <motion.button
                    type="submit"
                    className="w-full py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Add Record
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full shadow-2xl flex items-center justify-center z-40 group"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.5 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setAiAdvisorOpen(true)}
      >
        <span className="absolute inset-0 rounded-full animate-ping bg-green-400 opacity-50" />
        <div className="flex flex-col items-center justify-center relative z-10 text-xl font-bold -mt-1 group-hover:scale-110 transition-transform">
          🐄<span className="absolute -top-1 -right-2 text-sm">✨</span>
        </div>
      </motion.button>

      <AnimatePresence>
        {aiAdvisorOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/20 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAiAdvisorOpen(false)}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[80vh] overflow-y-auto"
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    🐄 AI Cattle Health Advisor
                  </h3>
                  <motion.button
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    whileHover={{ scale: 1.1 }}
                    onClick={() => setAiAdvisorOpen(false)}
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </motion.button>
                </div>

                <p className="text-sm text-gray-500 mb-4">
                  Ask anything about your cattle's health, feed, or productivity
                </p>

                <div className="flex gap-2 flex-wrap mb-4">
                  {AI_QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
                      onClick={() => handleQuickPrompt(prompt)}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={aiMessage}
                      onChange={(e) => setAiMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAISend()}
                      placeholder="Ask about your cattle..."
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                    />
                    <motion.button
                      className="p-3 bg-green-600 text-white rounded-xl"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAISend}
                      disabled={aiLoading}
                    >
                      {aiLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </motion.button>
                  </div>

                  {aiResponse && (
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap"><TypewriterText text={aiResponse} speed={15} /></p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}