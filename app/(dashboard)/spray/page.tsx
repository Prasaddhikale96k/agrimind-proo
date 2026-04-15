"use client"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  SprayCan,
  Search,
  Plus,
  Calendar,
  DollarSign,
  Wind,
  Sparkles,
  AlertTriangle,
  Loader2,
  Package,
  Target,
  X,
} from "lucide-react"
import toast from "react-hot-toast"

const GROQ_API_KEY = process.env.GROQ_API_KEY

const generateSpraySchedulePrompt = (crop: any) => `
You are an expert agricultural scientist and crop protection specialist with 30+ years of experience in Indian agriculture. Generate a COMPLETE day-by-day spray and fertilizer schedule for the following crop.

Crop Details:
- Crop Name: ${crop.name}
- Variety: ${crop.variety || "Standard"}
- Current Growth Stage: ${crop.growthStage || "Vegetative"}
- Area: ${crop.area || "1 acre"}
- Location: Maharashtra, India
- Days to Harvest: ${crop.daysToHarvest || 120}
- Season: ${crop.season || "Kharif"}

IMPORTANT RULES:
1. NOT every day needs an activity - most days will be rest/monitoring days
2. Activities should follow real agronomic practices for this specific crop
3. Include these activity types: Fertilizer, Fungicide, Insecticide, Herbicide, Growth Regulator, Micronutrient, Irrigation Note, Monitoring, Harvest
4. Space activities realistically (some every 7 days, some every 14-21 days)
5. Include pre-harvest interval (PHI) - no sprays 14-21 days before harvest
6. Be extremely specific with product names available in India

Return ONLY valid JSON:
{
  "cropInfo": {
    "name": "${crop.name}",
    "variety": "${crop.variety || "Standard variety"}",
    "emoji": "${crop.emoji || "🌿"}",
    "totalDays": 120,
    "stages": [
      {"name": "Germination", "startDay": 0, "endDay": 10, "color": "#22c55e"},
      {"name": "Vegetative", "startDay": 11, "endDay": 50, "color": "#16a34a"},
      {"name": "Flowering", "startDay": 51, "endDay": 80, "color": "#f59e0b"},
      {"name": "Fruiting", "startDay": 81, "endDay": 110, "color": "#ef4444"},
      {"name": "Maturity", "startDay": 111, "endDay": 120, "color": "#8b5cf6"}
    ],
    "expectedYield": "25-30 q/acre",
    "summary": "Complete spray schedule for ${crop.name}"
  },
  "schedule": [
    {
      "day": 0,
      "stage": "Germination",
      "stageColor": "#22c55e",
      "hasActivity": true,
      "isRestDay": false,
      "activities": [
        {
          "id": "act_0_1",
          "type": "Fertilizer",
          "productName": "DAP (Di-Ammonium Phosphate)",
          "brandName": "IFFCO DAP",
          "chemicalName": "18-46-00 NPK",
          "dosage": "50 kg/acre",
          "applicationMethod": "Broadcasting before sowing",
          "purpose": "Provides phosphorus for strong root development",
          "timing": "Early morning",
          "weatherCondition": "Dry weather",
          "cost": "₹1,400",
          "costPerAcre": "₹1,400",
          "preharvest": "N/A",
          "safetyClass": "III",
          "organicAlternative": "Bone meal @ 100 kg/acre",
          "notes": "Mix thoroughly into top 15cm soil before sowing"
        }
      ],
      "monitoringTasks": ["Check soil moisture before sowing", "Verify seed quality"],
      "expertTip": "Ensure field has good drainage to prevent seed rot"
    },
    {
      "day": 5,
      "stage": "Germination",
      "stageColor": "#22c55e",
      "hasActivity": false,
      "isRestDay": true,
      "activities": [],
      "monitoringTasks": ["Check germination percentage"],
      "expertTip": "Maintain soil moisture but avoid waterlogging"
    }
  ],
  "summary": {
    "totalSprayDays": 8,
    "totalRestDays": 112,
    "totalFertilizerApplications": 4,
    "totalFungicideApplications": 3,
    "totalInsecticideApplications": 2,
    "estimatedTotalCost": "₹8,500",
    "importantMilestones": [
      {"day": 0, "milestone": "Sowing", "icon": "🌱"},
      {"day": 15, "milestone": "First Spray", "icon": "💊"},
      {"day": 120, "milestone": "Harvest", "icon": "🌾"}
    ],
    "productList": [
      {"productName": "DAP", "brandName": "IFFCO DAP", "type": "Fertilizer", "totalQuantity": "50 kg", "estimatedCost": "₹1,400", "usageDays": [0]}
    ]
  }
}
`

const callGroqAPI = async (prompt: string) => {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        { role: "system", content: "You are an expert agricultural scientist. Return ONLY valid JSON." },
        { role: "user", content: prompt },
      ],
      max_tokens: 8000,
      temperature: 0.2,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Groq API Error: ${error}`)
  }

  const data = await response.json()
  const content = data.choices[0].message.content.trim()
  const jsonStart = content.indexOf("{")
  const jsonEnd = content.lastIndexOf("}") + 1
  return JSON.parse(content.slice(jsonStart, jsonEnd))
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
}

const cardVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

const mockCrops = [
  {
    id: "CL-ODL",
    name: "HD-2967 Wheat",
    variety: "HD-2967",
    emoji: "🌾",
    growthStage: "Vegetative",
    stageProgress: 40,
    area: "500m²",
    daysToHarvest: 120,
    location: "Nashik, Maharashtra",
    season: "Rabi",
    color: "#f59e0b",
  },
  {
    id: "PL-ODL",
    name: "Cherry Tomato",
    variety: "Hybrid Cherry",
    emoji: "🍅",
    growthStage: "Fruiting",
    stageProgress: 80,
    area: "200m²",
    daysToHarvest: 45,
    location: "Nashik, Maharashtra",
    season: "Kharif",
    color: "#ef4444",
  },
  {
    id: "PL-NEW",
    name: "Grapes",
    variety: "Crimson Seedless",
    emoji: "🍇",
    growthStage: "Vegetative",
    stageProgress: 40,
    area: "1 acre",
    daysToHarvest: 121,
    location: "Nashik, Maharashtra",
    season: "Annual",
    color: "#8b5cf6",
  },
]

const activityConfig: Record<string, { color: string; bg: string; icon: string }> = {
  Fertilizer: { color: "#10b981", bg: "bg-emerald-100", icon: "🌱" },
  Fungicide: { color: "#8b5cf6", bg: "bg-violet-100", icon: "🍄" },
  Insecticide: { color: "#ef4444", bg: "bg-red-100", icon: "🐛" },
  Herbicide: { color: "#f59e0b", bg: "bg-amber-100", icon: "🌿" },
  "Growth Regulator": { color: "#3b82f6", bg: "bg-blue-100", icon: "📈" },
  Micronutrient: { color: "#06b6d4", bg: "bg-cyan-100", icon: "⚗️" },
  Irrigation: { color: "#0ea5e9", bg: "bg-sky-100", icon: "💧" },
  Monitoring: { color: "#6b7280", bg: "bg-gray-100", icon: "🔍" },
  Harvest: { color: "#f97316", bg: "bg-orange-100", icon: "🌾" },
}

export default function SpraySchedulePage() {
  const [selectedCrop, setSelectedCrop] = useState<any>(null)
  const [scheduleData, setScheduleData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeView, setActiveView] = useState("timeline")
  const [filterType, setFilterType] = useState("All")
  const [cachedSchedules, setCachedSchedules] = useState<Record<string, any>>({})
  const [searchDay, setSearchDay] = useState("")

  const filterTypes = ["All", "Fertilizer", "Fungicide", "Insecticide", "Herbicide", "Micronutrient"]

  const generateSchedule = async (crop: any) => {
    if (cachedSchedules[crop.id]) {
      setSelectedCrop(crop)
      setScheduleData(cachedSchedules[crop.id])
      return
    }

    setSelectedCrop(crop)
    setIsLoading(true)
    setError(null)
    setScheduleData(null)

    try {
      const prompt = generateSpraySchedulePrompt(crop)
      const data = await callGroqAPI(prompt)
      setScheduleData(data)
      setCachedSchedules((prev) => ({ ...prev, [crop.id]: data }))
    } catch (err: any) {
      console.error("Schedule generation error:", err)
      setError(err.message)
      setScheduleData(generateMockSchedule(crop))
    } finally {
      setIsLoading(false)
    }
  }

  const generateMockSchedule = (crop: any) => ({
    cropInfo: {
      name: crop.name,
      variety: crop.variety,
      emoji: crop.emoji,
      totalDays: crop.daysToHarvest,
      stages: [
        { name: "Germination", startDay: 0, endDay: 10, color: "#22c55e" },
        { name: "Vegetative", startDay: 11, endDay: 50, color: "#16a34a" },
        { name: "Flowering", startDay: 51, endDay: 80, color: "#f59e0b" },
        { name: "Fruiting", startDay: 81, endDay: 110, color: "#ef4444" },
        { name: "Maturity", startDay: 111, endDay: 120, color: "#8b5cf6" },
      ],
      expectedYield: "25-30 q/acre",
      summary: `Complete spray schedule for ${crop.name}`,
    },
    schedule: [
      {
        day: 0,
        stage: "Germination",
        stageColor: "#22c55e",
        hasActivity: true,
        isRestDay: false,
        activities: [
          {
            id: "act_0_1",
            type: "Fertilizer",
            productName: "DAP 18-46-0",
            brandName: "IFFCO DAP",
            chemicalName: "Di-Ammonium Phosphate",
            dosage: "50 kg/acre",
            applicationMethod: "Broadcasting",
            purpose: "Basal dose for strong root establishment",
            timing: "Before sowing",
            weatherCondition: "Dry",
            cost: "₹1,200",
            costPerAcre: "₹1,200",
            preharvest: "N/A",
            safetyClass: "III",
            organicAlternative: "Bone meal 100 kg/acre",
            notes: "Incorporate well into soil",
          },
        ],
        monitoringTasks: ["Check soil moisture", "Verify seed quality"],
        expertTip: "Treat seeds with fungicide before sowing",
      },
    ],
    summary: {
      totalSprayDays: 8,
      totalRestDays: 112,
      totalFertilizerApplications: 4,
      totalFungicideApplications: 3,
      totalInsecticideApplications: 2,
      estimatedTotalCost: "₹8,500",
      importantMilestones: [
        { day: 0, milestone: "Sowing", icon: "🌱" },
        { day: 15, milestone: "First Spray", icon: "💊" },
        { day: 120, milestone: "Harvest", icon: "🌾" },
      ],
      productList: [
        { productName: "DAP", brandName: "IFFCO DAP", type: "Fertilizer", totalQuantity: "50 kg", estimatedCost: "₹1,200", usageDays: [0] },
      ],
    },
  })

  const getFilteredSchedule = () => {
    if (!scheduleData?.schedule) return []
    let filtered = scheduleData.schedule.filter((day: any) => !day.isRestDay)
    if (filterType !== "All") {
      filtered = filtered.filter((day: any) => day.activities?.some((act: any) => act.type === filterType))
    }
    if (searchDay) {
      filtered = filtered.filter((day: any) => day.day.toString().includes(searchDay))
    }
    return filtered
  }

  const filteredDays = getFilteredSchedule()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 px-6 py-5 sticky top-0 z-50 shadow-lg"
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-3xl"
            >
              🌿
            </motion.div>
            <div>
              <h2 className="text-xl font-bold text-white">AI Spray Scheduler</h2>
              <p className="text-xs text-green-100 ml-1">Intelligent Season Planning</p>
            </div>
          </div>
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center gap-2 px-3 py-2 bg-white/20 rounded-xl"
          >
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-white">AI Active</span>
          </motion.div>
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Empty State - Crop Selection */}
        {!selectedCrop && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <motion.div
              animate={{ y: [0, -12, 0], rotate: [0, -5, 5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-7xl mb-6"
            >
              🌾
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">AI Spray Scheduler</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              Select a crop below to automatically generate a complete day-by-day spray and fertilizer schedule
            </p>

            <div className="grid grid-cols-1 gap-4 max-w-lg mx-auto">
              {mockCrops.map((crop, i) => (
                <motion.button
                  key={crop.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => generateSchedule(crop)}
                  className="flex items-center gap-4 p-4 bg-white border-2 border-gray-100 rounded-xl cursor-pointer text-left shadow-md hover:shadow-lg transition-all"
                  style={{ borderColor: crop.color }}
                >
                  <span className="text-3xl">{crop.emoji}</span>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{crop.name}</p>
                    <p className="text-sm text-gray-500">
                      {crop.variety} • {crop.daysToHarvest} days to harvest
                    </p>
                  </div>
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold rounded-lg"
                  >
                    Generate →
                  </motion.span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Loading Animation */}
        <AnimatePresence>
          {isLoading && selectedCrop && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-8 shadow-lg"
            >
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-24 h-24 mx-auto mb-6 border-4 border-green-200 border-t-green-500 rounded-full"
                />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Generating Schedule</h3>
                <p className="text-gray-500 mb-4">
                  Creating complete season plan for {selectedCrop.name}
                </p>
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-medium">Processing AI...</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-4"
          >
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <div>
              <p className="text-sm font-medium text-red-600">Using fallback data</p>
              <p className="text-xs text-gray-500">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Schedule Data */}
        {scheduleData && !isLoading && selectedCrop && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Hero Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-6 text-white mb-6"
            >
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center text-4xl"
                >
                  {scheduleData.cropInfo?.emoji || selectedCrop.emoji}
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">{scheduleData.cropInfo?.name}</h3>
                  <p className="text-sm text-green-100 mb-3">
                    {scheduleData.cropInfo?.variety} • {scheduleData.cropInfo?.totalDays} Day Schedule
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white/15 rounded-lg p-2 text-center">
                      <p className="text-lg font-bold">{scheduleData.summary?.totalSprayDays || 0}</p>
                      <p className="text-xs text-green-200">Tasks</p>
                    </div>
                    <div className="bg-white/15 rounded-lg p-2 text-center">
                      <p className="text-lg font-bold">{scheduleData.summary?.estimatedTotalCost || "₹0"}</p>
                      <p className="text-xs text-green-200">Cost</p>
                    </div>
                    <div className="bg-white/15 rounded-lg p-2 text-center">
                      <p className="text-lg font-bold">{scheduleData.cropInfo?.expectedYield || "-"}</p>
                      <p className="text-xs text-green-200">Yield</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0 }}
                className="bg-white rounded-xl p-4 text-center shadow-md"
              >
                <span className="text-2xl">💊</span>
                <p className="text-lg font-bold text-violet-600">{scheduleData.summary?.totalFungicideApplications || 0}</p>
                <p className="text-xs text-gray-500">Fungicide</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl p-4 text-center shadow-md"
              >
                <span className="text-2xl">🌱</span>
                <p className="text-lg font-bold text-emerald-600">{scheduleData.summary?.totalFertilizerApplications || 0}</p>
                <p className="text-xs text-gray-500">Fertilizer</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl p-4 text-center shadow-md"
              >
                <span className="text-2xl">🐛</span>
                <p className="text-lg font-bold text-red-600">{scheduleData.summary?.totalInsecticideApplications || 0}</p>
                <p className="text-xs text-gray-500">Insecticide</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl p-4 text-center shadow-md"
              >
                <span className="text-2xl">💰</span>
                <p className="text-lg font-bold text-amber-600">{scheduleData.summary?.estimatedTotalCost || "₹0"}</p>
                <p className="text-xs text-gray-500">Total Cost</p>
              </motion.div>
            </div>

            {/* View Tabs */}
            <div className="flex gap-1 bg-white rounded-xl p-1 mb-4 shadow-md">
              {[
                { id: "timeline", icon: "📅", label: "Timeline" },
                { id: "products", icon: "📦", label: "Products" },
                { id: "milestones", icon: "🎯", label: "Milestones" },
              ].map((view) => (
                <motion.button
                  key={view.id}
                  onClick={() => setActiveView(view.id)}
                  whileTap={{ scale: 0.96 }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeView === view.id
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span>{view.icon}</span>
                  {view.label}
                </motion.button>
              ))}
            </div>

            {/* Timeline View */}
            <AnimatePresence mode="wait">
              {activeView === "timeline" && (
                <motion.div
                  key="timeline"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-3"
                >
                  {/* Filters */}
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {filterTypes.map((type) => {
                      const cfg = activityConfig[type] || activityConfig.Monitoring
                      return (
                        <motion.button
                          key={type}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setFilterType(type)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all ${
                            filterType === type
                              ? `${cfg.bg} border${cfg.color}`
                              : "border-gray-200 bg-white text-gray-500"
                          }`}
                          style={filterType === type ? { color: cfg.color, borderColor: cfg.color } : {}}
                        >
                          {type !== "All" && <span className="mr-1">{cfg.icon}</span>}
                          {type}
                        </motion.button>
                      )
                    })}
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      placeholder="Jump to day number..."
                      value={searchDay}
                      onChange={(e) => setSearchDay(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                    />
                  </div>

                  {/* Schedule Cards */}
                  <motion.div
                    variants={containerVariants}
                    initial="initial"
                    animate="animate"
                    className="space-y-3 pl-2"
                  >
                    {filteredDays.length > 0 ? (
                      filteredDays.map((dayData: any, index: number) => (
                        <DayCard key={dayData.day} dayData={dayData} index={index} />
                      ))
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p>No activities found for this filter</p>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              )}

              {/* Products View */}
              {activeView === "products" && (
                <motion.div
                  key="products"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-xl p-4 shadow-md"
                >
                  <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4 text-emerald-500" />
                    Complete Product List
                  </h4>
                  <div className="space-y-3">
                    {scheduleData.summary?.productList?.map((product: any, i: number) => {
                      const cfg = activityConfig[product.type] || activityConfig.Monitoring
                      return (
                        <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <div className={`w-10 h-10 ${cfg.bg} rounded-lg flex items-center justify-center text-xl`}>
                            {cfg.icon}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">{product.brandName || product.productName}</p>
                            <p className="text-xs text-gray-500">{product.type} • {product.totalQuantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-emerald-600">{product.estimatedCost}</p>
                            <p className="text-xs text-gray-500">Day {product.usageDays?.join(", ")}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              {/* Milestones View */}
              {activeView === "milestones" && (
                <motion.div
                  key="milestones"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-xl p-4 shadow-md"
                >
                  <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-500" />
                    Key Milestones
                  </h4>
                  <div className="space-y-4">
                    {scheduleData.summary?.importantMilestones?.map((milestone: any, i: number) => (
                      <div key={i} className="flex items-center gap-4">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 10 }}
                          className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-lg shadow-md"
                        >
                          {milestone.icon}
                        </motion.div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{milestone.milestone}</p>
                          <p className="text-xs text-gray-500">
                            Day {milestone.day} • {Math.round((milestone.day / 120) * 100)}% complete
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Reset Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelectedCrop(null)
                setScheduleData(null)
              }}
              className="w-full py-3 mt-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 text-sm font-medium hover:border-gray-400 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Select Different Crop
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

function DayCard({ dayData, index }: { dayData: any; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const stageColor = dayData.stageColor || "#10b981"

  return (
    <motion.div variants={cardVariants} className="flex gap-3">
      {/* Timeline */}
      <div className="flex flex-col items-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.03, type: "spring", stiffness: 400 }}
          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
            dayData.isRestDay ? "bg-gray-100 text-gray-400 border-2 border-gray-200" : "text-white border-2"
          }`}
          style={{
            background: dayData.isRestDay ? undefined : `linear-gradient(135deg, ${stageColor}, ${stageColor}cc)`,
            borderColor: dayData.isRestDay ? "#e5e7eb" : stageColor,
          }}
        >
          {dayData.day}
        </motion.div>
        <div className={`w-0.5 flex-1 ${dayData.isRestDay ? "bg-gray-100" : ""}`} style={{ backgroundColor: dayData.isRestDay ? undefined : `${stageColor}30` }} />
      </div>

      {/* Content */}
      <div className="flex-1 pb-4">
        <motion.div
          onClick={() => !dayData.isRestDay && setExpanded(!expanded)}
          whileHover={!dayData.isRestDay ? { scale: 1.01 } : {}}
          whileTap={!dayData.isRestDay ? { scale: 0.99 } : {}}
          className={`p-3 rounded-xl cursor-pointer ${
            dayData.isRestDay ? "bg-gray-50 border border-dashed border-gray-200" : "bg-white border border-gray-200 shadow-sm"
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-gray-800">Day {dayData.day}</span>
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ color: stageColor, backgroundColor: `${stageColor}15` }}
                >
                  {dayData.stage}
                </span>
              </div>
              {!dayData.isRestDay ? (
                <div className="flex gap-1.5 flex-wrap">
                  {dayData.activities?.map((act: any, i: number) => {
                    const cfg = activityConfig[act.type] || activityConfig.Monitoring
                    return (
                      <span
                        key={i}
                        className={`text-xs font-medium px-2 py-1 rounded-full ${cfg.bg}`}
                        style={{ color: cfg.color }}
                      >
                        {cfg.icon} {act.type}
                      </span>
                    )
                  })}
                </div>
              ) : (
                <p className="text-xs text-gray-400">Rest day — Monitor crop health</p>
              )}
            </div>
            {!dayData.isRestDay && (
              <div className="text-right">
                <p className="text-xs text-gray-500">
                  {dayData.activities?.length || 0} task{(dayData.activities?.length || 0) !== 1 ? "s" : ""}
                </p>
                <motion.span animate={{ rotate: expanded ? 180 : 0 }} className="text-xs text-gray-400">
                  ▼
                </motion.span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Expanded */}
        <AnimatePresence>
          {expanded && !dayData.isRestDay && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-3 space-y-3">
                {dayData.activities?.map((activity: any, i: number) => (
                  <ActivityCard key={i} activity={activity} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

function ActivityCard({ activity }: { activity: any }) {
  const [expanded, setExpanded] = useState(false)
  const cfg = activityConfig[activity.type] || activityConfig.Monitoring

  return (
    <motion.div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <motion.div
        onClick={() => setExpanded(!expanded)}
        whileTap={{ scale: 0.99 }}
        className="p-3 cursor-pointer flex items-center gap-3"
      >
        <div className={`w-10 h-10 ${cfg.bg} rounded-lg flex items-center justify-center text-xl`}>
          {cfg.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{activity.productName}</p>
          <p className="text-xs text-gray-500">{activity.brandName}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-emerald-600">{activity.costPerAcre}</p>
        </div>
      </motion.div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 border-t border-gray-100 pt-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-[10px] text-gray-400 uppercase">Dosage</p>
                  <p className="text-xs font-medium">{activity.dosage}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-[10px] text-gray-400 uppercase">Method</p>
                  <p className="text-xs font-medium">{activity.applicationMethod}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-[10px] text-gray-400 uppercase">Timing</p>
                  <p className="text-xs font-medium">{activity.timing}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-[10px] text-gray-400 uppercase">Safety</p>
                  <p className="text-xs font-medium">{activity.safetyClass}</p>
                </div>
              </div>
              {activity.purpose && (
                <div className="mt-2 p-2 bg-amber-50 rounded-lg border-l-2 border-amber-400">
                  <p className="text-[10px] text-amber-600 uppercase mb-1">Purpose</p>
                  <p className="text-xs text-amber-800">{activity.purpose}</p>
                </div>
              )}
              {activity.organicAlternative && (
                <div className="mt-2 p-2 bg-green-50 rounded-lg border-l-2 border-green-400">
                  <p className="text-[10px] text-green-600 uppercase mb-1">Organic Alt</p>
                  <p className="text-xs text-green-800">{activity.organicAlternative}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}