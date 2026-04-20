'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import toast from 'react-hot-toast'
import {
  Leaf,
  ChevronRight,
  ChevronLeft,
  User,
  MapPin,
  Sprout,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'

const steps = [
  { id: 1, title: 'Your Details', icon: User },
  { id: 2, title: 'Farm Setup', icon: MapPin },
  { id: 3, title: 'First Crop', icon: Sprout },
]

const soilTypes = ['Loamy', 'Clay', 'Sandy', 'Black', 'Red', 'Alluvial']
const waterSources = ['Well', 'Borewell', 'Canal', 'River', 'Rainwater Harvesting', 'Municipal']
const growthStages = ['Germination', 'Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Maturing', 'Harvesting']
const cropTypes = ['Grain', 'Vegetable', 'Fruit', 'Pulse', 'Oilseed', 'Cash Crop', 'Fodder']

export default function OnboardingPage() {
  const router = useRouter()
  const { user, supabase: supabaseClient } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: 'Nashik, Maharashtra',
    experience: '1-3',
    farmName: '',
    plotId: '',
    area: '',
    soilType: 'Loamy',
    waterSource: 'Well',
    cropName: 'Grapes',
    cropType: 'Fruit',
    variety: '',
    sowingDate: new Date().toISOString().split('T')[0],
    growthStage: 'Vegetative',
  })

  useEffect(() => {
    if (user && !formData.name) {
      const emailName = user.email?.split('@')[0].replace(/[._]/g, ' ')
      const formatted = emailName
        ?.split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
      setFormData((prev) => ({ ...prev, name: formatted || '' }))
    }
  }, [user])

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Name is required'
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
      else if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/\s/g, '')))
        newErrors.phone = 'Enter a valid 10-digit Indian number'
      if (!formData.location.trim()) newErrors.location = 'Location is required'
    }

    if (step === 2) {
      if (!formData.farmName.trim()) newErrors.farmName = 'Farm name is required'
      if (!formData.plotId.trim()) newErrors.plotId = 'Plot ID is required'
      else if (!/^[A-Z]{2,4}-[A-Z]{2,6}$/.test(formData.plotId.toUpperCase()))
        newErrors.plotId = 'Format: 2-4 letters, dash, 2-6 letters (e.g., PL-ODL)'
      if (!formData.area.trim()) newErrors.area = 'Area is required'
      else if (isNaN(Number(formData.area)) || Number(formData.area) <= 0)
        newErrors.area = 'Enter a valid number'
    }

    if (step === 3) {
      if (!formData.cropName.trim()) newErrors.cropName = 'Crop name is required'
      if (!formData.sowingDate) newErrors.sowingDate = 'Sowing date is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3))
    } else {
      toast.error('Please fix the errors before continuing')
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
    setErrors({})
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      toast.error('Please fix the errors before submitting')
      return
    }

    if (!user?.email) {
      toast.error('You must be logged in')
      return
    }

    setSubmitting(true)

    try {
      const { data: existingPlot } = await supabaseClient
        .from('farms')
        .select('id')
        .eq('plot_id', formData.plotId.toUpperCase())
        .single()

      if (existingPlot) {
        setErrors({ plotId: 'This Plot ID is already taken. Please choose another.' })
        toast.error('Plot ID already exists')
        setSubmitting(false)
        return
      }

      // Create or update profile - check first if email exists
      const { data: existingProfile } = await supabaseClient
        .from('profiles')
        .select('id, email')
        .eq('email', user.email)
        .maybeSingle()

      if (existingProfile) {
        // Profile with this email exists - update it instead
        await supabaseClient.from('profiles').update({
          full_name: formData.name.trim(),
          phone: formData.phone.trim(),
          location: formData.location.trim(),
          farming_experience: formData.experience,
          total_land: parseFloat(formData.area),
          updated_at: new Date().toISOString(),
        }).eq('email', user.email)
      } else {
        // New profile - create it
        const { error: profileError } = await supabaseClient.from('profiles').upsert({
          id: user.id,
          full_name: formData.name.trim(),
          email: user.email,
          phone: formData.phone.trim(),
          location: formData.location.trim(),
          farming_experience: formData.experience,
          total_land: parseFloat(formData.area),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id', ignoreDuplicates: false })
        if (profileError) throw profileError
      }

      const areaAcres = parseFloat(formData.area)
      const areaSqM = Math.round(areaAcres * 4046.86)

      const { data: farmData, error: farmError } = await supabaseClient
        .from('farms')
        .insert({
          user_id: user.id,
          name: formData.farmName.trim(),
          plot_id: formData.plotId.toUpperCase(),
          area_sqm: areaSqM,
          area_acres: areaAcres,
          soil_type: formData.soilType,
          water_source: formData.waterSource,
        })
        .select()
        .single()

      if (farmError) throw farmError

      const harvestDate = new Date(formData.sowingDate)
      harvestDate.setMonth(harvestDate.getMonth() + 4)

      const { error: cropError } = await supabaseClient.from('crops').insert({
        user_id: user.id,
        farm_id: farmData.id,
        name: formData.cropName.trim(),
        crop_type: formData.cropType.toLowerCase(),
        variety: formData.variety.trim() || null,
        sowing_date: formData.sowingDate,
        expected_harvest_date: harvestDate.toISOString().split('T')[0],
        growth_stage: formData.growthStage,
        health_index: 75,
      })

      if (cropError) throw cropError

      setCompleted(true)

      setTimeout(() => {
        router.push('/dashboard')
      }, 2500)
    } catch (error: unknown) {
      console.error('Onboarding error:', error)
      
      let message = 'Something went wrong'
      if (error instanceof Error) {
        message = error.message
        
        // Provide helpful hints for common errors
        if (message.includes('column') || message.includes('does not exist')) {
          message = `${message}. Please ensure the database migration has been run in Supabase SQL Editor.`
        }
        if (message.includes('row-level security') || message.includes('RLS')) {
          message = `${message}. Please check RLS policies in Supabase.`
        }
      } else if (error && typeof error === 'object') {
        const err = error as any
        if (err.message) message = err.message
        else if (err.details) message = `Details: ${err.details}`
        else if (err.hint) message = `Hint: ${err.hint}`
        else message = JSON.stringify(err)
      }
      
      toast.error(`Failed to setup your farm: ${message}`)
      console.error('Onboarding error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (completed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">You&apos;re All Set!</h2>
          <p className="text-gray-600 mb-8">Setting up your AI dashboard...</p>
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
            <span className="text-sm text-green-600 font-medium">Preparing your farm data</span>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-green-700">AgriMind</span>
          <span className="text-xs text-green-500 font-semibold -mt-2">Pro</span>
        </div>
        <span className="text-sm text-gray-500">Step {currentStep} of 3</span>
      </div>

      {/* Progress bar */}
      <div className="px-6 pb-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-3">
            {steps.map((step) => (
              <div key={step.id} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    step.id < currentStep
                      ? 'bg-green-600 text-white'
                      : step.id === currentStep
                      ? 'bg-green-600 text-white ring-4 ring-green-100'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step.id < currentStep ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    step.id
                  )}
                </div>
                <span
                  className={`text-xs font-medium hidden sm:block ${
                    step.id <= currentStep ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {step.title}
                </span>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <motion.div
              className="bg-green-600 h-1.5 rounded-full"
              initial={{ width: '33.33%' }}
              animate={{ width: `${(currentStep / 3) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            {/* Step 1: Farmer Details */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white rounded-3xl border border-green-100 shadow-xl shadow-green-600/5 p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                      <User className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Your Details</h2>
                      <p className="text-sm text-gray-500">Tell us about yourself</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        placeholder="Rajesh Kumar"
                        className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${
                          errors.name
                            ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                            : 'border-gray-200 bg-gray-50 focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:bg-white'
                        }`}
                      />
                      {errors.name && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        placeholder="98765 43210"
                        className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${
                          errors.phone
                            ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                            : 'border-gray-200 bg-gray-50 focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:bg-white'
                        }`}
                      />
                      {errors.phone && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Location <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => updateField('location', e.target.value)}
                        placeholder="Nashik, Maharashtra"
                        className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${
                          errors.location
                            ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                            : 'border-gray-200 bg-gray-50 focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:bg-white'
                        }`}
                      />
                      {errors.location && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.location}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Farming Experience
                      </label>
                      <select
                        value={formData.experience}
                        onChange={(e) => updateField('experience', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:bg-white transition-all"
                      >
                        <option value="0-1">Less than 1 year</option>
                        <option value="1-3">1-3 years</option>
                        <option value="3-5">3-5 years</option>
                        <option value="5-10">5-10 years</option>
                        <option value="10+">10+ years</option>
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Farm Details */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white rounded-3xl border border-green-100 shadow-xl shadow-green-600/5 p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Farm Setup</h2>
                      <p className="text-sm text-gray-500">Tell us about your farm</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Farm Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.farmName}
                        onChange={(e) => updateField('farmName', e.target.value)}
                        placeholder="Green Valley Farm"
                        className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${
                          errors.farmName
                            ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                            : 'border-gray-200 bg-gray-50 focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:bg-white'
                        }`}
                      />
                      {errors.farmName && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.farmName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Plot ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.plotId}
                        onChange={(e) => updateField('plotId', e.target.value.toUpperCase())}
                        placeholder="PL-ODL"
                        className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all uppercase ${
                          errors.plotId
                            ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                            : 'border-gray-200 bg-gray-50 focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:bg-white'
                        }`}
                      />
                      {errors.plotId && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.plotId}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">Format: PREFIX-SUFFIX (e.g., PL-ODL, CL-B)</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Area (Acres) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.area}
                        onChange={(e) => updateField('area', e.target.value)}
                        placeholder="2.5"
                        className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${
                          errors.area
                            ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                            : 'border-gray-200 bg-gray-50 focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:bg-white'
                        }`}
                      />
                      {errors.area && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.area}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Soil Type</label>
                        <select
                          value={formData.soilType}
                          onChange={(e) => updateField('soilType', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:bg-white transition-all"
                        >
                          {soilTypes.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Water Source</label>
                        <select
                          value={formData.waterSource}
                          onChange={(e) => updateField('waterSource', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:bg-white transition-all"
                        >
                          {waterSources.map((w) => (
                            <option key={w} value={w}>{w}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Current Crop */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white rounded-3xl border border-green-100 shadow-xl shadow-green-600/5 p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                      <Sprout className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">First Crop</h2>
                      <p className="text-sm text-gray-500">What are you growing?</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Crop Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.cropName}
                        onChange={(e) => updateField('cropName', e.target.value)}
                        placeholder="Grapes"
                        className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${
                          errors.cropName
                            ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                            : 'border-gray-200 bg-gray-50 focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:bg-white'
                        }`}
                      />
                      {errors.cropName && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.cropName}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Crop Type</label>
                        <select
                          value={formData.cropType}
                          onChange={(e) => updateField('cropType', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:bg-white transition-all"
                        >
                          {cropTypes.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Variety</label>
                        <input
                          type="text"
                          value={formData.variety}
                          onChange={(e) => updateField('variety', e.target.value)}
                          placeholder="Thompson Seedless"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:bg-white transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Sowing Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={formData.sowingDate}
                          onChange={(e) => updateField('sowingDate', e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${
                            errors.sowingDate
                              ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                              : 'border-gray-200 bg-gray-50 focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:bg-white'
                          }`}
                        />
                        {errors.sowingDate && (
                          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {errors.sowingDate}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Growth Stage</label>
                        <select
                          value={formData.growthStage}
                          onChange={(e) => updateField('growthStage', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:bg-white transition-all"
                        >
                          {growthStages.map((g) => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-8">
            {currentStep > 1 ? (
              <motion.button
                onClick={prevStep}
                className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
                whileHover={{ x: -3 }}
                whileTap={{ scale: 0.97 }}
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </motion.button>
            ) : (
              <div />
            )}

            {currentStep < 3 ? (
              <motion.button
                onClick={nextStep}
                className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20"
                whileHover={{ scale: 1.02, boxShadow: '0 10px 30px rgba(22,163,74,0.3)' }}
                whileTap={{ scale: 0.97 }}
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            ) : (
              <motion.button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={!submitting ? { scale: 1.02 } : {}}
                whileTap={!submitting ? { scale: 0.97 } : {}}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    Complete Setup
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
