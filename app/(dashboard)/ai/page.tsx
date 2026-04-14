'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { Send, Sparkles, ImagePlus, Bot, Zap, FileText, BarChart3, Droplets, Leaf, Loader2, X, CheckCircle, AlertTriangle, TrendingUp, CloudSun, Activity, TestTube, FlaskConical, Gauge, ChevronDown, ChevronUp, Search, Plus, Calendar, DollarSign } from 'lucide-react'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  confidence?: number
  action?: { type: string; details: string }
}

const quickActions = [
  { label: 'Current Weather', icon: CloudSun, prompt: 'Give me a detailed weather report with all parameters including temperature, humidity, wind, pressure, visibility, and sunrise/sunset times' },
  { label: 'Irrigation Schedule', icon: Droplets, prompt: 'Generate this week\'s irrigation schedule based on current soil moisture and weather conditions' },
  { label: 'Soil Health Report', icon: Leaf, prompt: 'Analyze all soil readings and give me a comprehensive health report with NPK recommendations' },
  { label: 'Monthly P&L', icon: BarChart3, prompt: 'Calculate this month\'s profit and loss for all my farms with breakdown' },
  { label: 'Optimize Sprays', icon: Zap, prompt: 'Optimize my spray schedule based on current weather forecast and crop growth stages' },
]

const aiActions = [
  { title: 'Generate Irrigation Schedule', desc: 'Create optimized irrigation plan based on soil moisture and weather data', icon: Droplets, action: 'generate_irrigation' },
  { title: 'Analyze Soil Health', desc: 'Run comprehensive soil analysis and generate NPK recommendations', icon: Leaf, action: 'analyze_soil' },
  { title: 'Calculate Monthly P&L', desc: 'Compute profit and loss for all farms this month with charts', icon: FileText, action: 'calculate_pnl' },
  { title: 'Optimize Spray Schedule', desc: 'Reschedule sprays based on weather forecast and crop growth stages', icon: Zap, action: 'optimize_spray' },
  { title: 'Generate AI Alerts', desc: 'Scan all farm data and generate proactive alerts for issues', icon: Sparkles, action: 'generate_alerts' },
]

type AnalysisCardProps = {
  icon: React.ElementType
  title: string
  iconColor: string
  bgColor: string
  children: React.ReactNode
  initiallyOpen?: boolean
}

function AnalysisCard({ icon: Icon, title, iconColor, bgColor, children, initiallyOpen = false }: AnalysisCardProps) {
  const [isOpen, setIsOpen] = useState(initiallyOpen)

  return (
    <motion.div 
      className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-4 flex items-center justify-between ${bgColor} transition-colors`}
        whileHover={{ backgroundColor: isOpen ? undefined : 'rgba(0,0,0,0.02)' }}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${bgColor}`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          <span className="font-semibold text-dark">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </motion.button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="p-4 pt-0">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {!isOpen && (
        <div className="px-4 pb-3 text-xs text-gray-400">
          Tap to expand and see details
        </div>
      )}
    </motion.div>
  )
}

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [historyItems, setHistoryItems] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [selectedHistory, setSelectedHistory] = useState<any | null>(null)

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: 'Hey! 👋 I\'m AgriMind AI, your farm assistant. How can I help you today? Need advice on crops, soil, weather, or anything else?',
          timestamp: new Date(),
          confidence: 95,
        },
      ])
    }
    fetchHistory()
  }, [])

  async function fetchHistory() {
    setLoadingHistory(true)
    try {
      const res = await fetch('/api/ai/history?limit=50')
      const data = await res.json()
      if (data.interactions) {
        setHistoryItems(data.interactions)
      }
    } catch {
      console.error('Failed to fetch history')
    } finally {
      setLoadingHistory(false)
    }
  }
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'chat' | 'image' | 'actions'>('chat')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [imageAnalysis, setImageAnalysis] = useState<string>('')
  const [analyzingImage, setAnalyzingImage] = useState(false)
  const [executingAction, setExecutingAction] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text?: string) {
    const messageText = text || input
    const hasImage = !!imagePreview
    const imageToSend = imagePreview

    if ((!messageText.trim() && !hasImage) || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: hasImage && !messageText.trim() ? 'Analyze this image' : messageText,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    if (hasImage) removeImage()
    setLoading(true)

    try {
      const chatHistory = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }))

      if (imageToSend) {
        const res = await fetch('/api/ai/analyze-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageToSend, prompt: messageText || undefined }),
        })
        const data = await res.json()

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.analysis || 'I couldn\'t analyze the image.',
          timestamp: new Date(),
          confidence: data.confidence,
        }
        setMessages((prev) => [...prev, aiMessage])
      } else {
        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: messageText, history: chatHistory }),
        })
        const data = await res.json()

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response || 'I apologize, but I couldn\'t process your request.',
          timestamp: new Date(),
          confidence: data.confidence,
          action: data.action,
        }
        setMessages((prev) => [...prev, aiMessage])
      }
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Failed to connect to AI. Please check your API key configuration and try again.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be less than 10MB')
      return
    }

    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  async function analyzeImage() {
    if (!imagePreview) {
      toast.error('Please upload an image first')
      return
    }

    setAnalyzingImage(true)
    setImageAnalysis('')

    try {
      const res = await fetch('/api/ai/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imagePreview }),
      })
      const data = await res.json()
      setImageAnalysis(data.analysis || 'Unable to analyze image.')
      toast.success('Image analysis complete!')
    } catch {
      toast.error('Failed to analyze image')
    } finally {
      setAnalyzingImage(false)
    }
  }

  async function executeAction(actionType: string) {
    setExecutingAction(actionType)
    const loadingToast = toast.loading(`Executing: ${actionType}...`)

    try {
      const actionPrompts: Record<string, string> = {
        generate_irrigation: 'Generate an optimized irrigation schedule for all my crops based on current soil moisture levels and weather forecast. Include specific timing, duration, and water amounts for each plot.',
        analyze_soil: 'Analyze all recent soil data and provide a comprehensive soil health report. Include NPK levels, pH analysis, moisture trends, and specific fertilizer recommendations for each plot.',
        calculate_pnl: 'Calculate the complete Profit & Loss statement for this month. Break down all income sources, expenses by category, and show net profit/loss with percentage changes.',
        optimize_spray: 'Review and optimize my spray schedule based on current weather conditions, crop growth stages, and pest/disease alerts. Suggest optimal timing and products.',
        generate_alerts: 'Scan all farm data including soil, weather, crops, and finances. Generate proactive alerts for any issues that need immediate attention.',
      }

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: actionPrompts[actionType] || `Execute: ${actionType}` }),
      })
      const data = await res.json()

      const aiMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `**Action Executed: ${actionType}**\n\n${data.response}`,
        timestamp: new Date(),
        confidence: data.confidence,
      }
      setMessages((prev) => [...prev, aiMessage])
      setActiveTab('chat')
      toast.dismiss(loadingToast)
      toast.success('Action completed successfully!')
    } catch {
      toast.dismiss(loadingToast)
      toast.error('Failed to execute action')
    } finally {
      setExecutingAction(null)
    }
  }

  function removeImage() {
    setImageFile(null)
    setImagePreview('')
    setImageAnalysis('')
  }

  function formatContent(content: string) {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>')
  }

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6">
      {/* Main Area */}
      <div className="flex-1 flex flex-col glass-card overflow-auto">
        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {[
            { key: 'chat' as const, label: 'AI Chat', icon: Bot },
            { key: 'image' as const, label: 'Image Analysis', icon: ImagePlus },
            { key: 'actions' as const, label: 'AI Actions', icon: Zap },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className={`max-w-[85%] rounded-2xl p-4 ${
                    msg.role === 'user'
                      ? 'bg-primary text-black rounded-br-md'
                      : 'bg-gray-50 text-dark rounded-bl-md border border-gray-100'
                  }`}>
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-accent" />
                        <span className="text-xs font-medium text-gray-500">AgriMind AI</span>
                        {msg.confidence && (
                          <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">{msg.confidence}% match</span>
                        )}
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }} />
                    {msg.action && (
                      <motion.button
                        onClick={() => executeAction(msg.action!.type)}
                        className="mt-3 px-4 py-2 bg-accent text-white text-xs font-medium rounded-lg hover:bg-amber-500 transition-colors flex items-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Zap className="w-3 h-3" />
                        Execute: {msg.action.type}
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-bl-md p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <motion.div className="w-2 h-2 bg-primary rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity }} />
                        <motion.div className="w-2 h-2 bg-primary rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
                        <motion.div className="w-2 h-2 bg-primary rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
                      </div>
                      <span className="text-sm text-gray-500">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {quickActions.map((action) => (
                  <motion.button
                    key={action.label}
                    onClick={() => sendMessage(action.prompt)}
                    className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:border-primary hover:text-primary transition-colors whitespace-nowrap"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                  >
                    <action.icon className="w-3 h-3" />
                    {action.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-100">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Ask anything about your farm..."
                  style={{ color: '#000000' }}
                  className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all caret-emerald-600 selection:bg-emerald-100 selection:text-emerald-900"
                  disabled={loading}
                />
                <motion.button
                  className="p-3 bg-primary hover:bg-primary-600 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                >
                  {loading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
                </motion.button>
              </div>
            </div>
          </>
        )}

        {/* Image Analysis Tab - Professional Diagnostic Suite */}
        {activeTab === 'image' && (
          <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-50/50 to-white overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 pb-32">
              <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-dark flex items-center justify-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-600" />
                    Diagnosis Hero
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">AI-Powered Crop Disease & Health Analysis</p>
                </div>

                {/* Upload Area */}
                {!imagePreview ? (
                  <label className="block p-12 border-2 border-dashed border-gray-300 rounded-3xl text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group">
                    <div className="relative">
                      <ImagePlus className="w-16 h-16 text-gray-300 mx-auto mb-4 group-hover:text-emerald-500 transition-colors" />
                      <div className="absolute inset-0 bg-emerald-100 opacity-0 group-hover:opacity-20 blur-2xl rounded-full transition-opacity" />
                    </div>
                    <p className="text-base font-medium text-gray-700">Drop leaf image or click to upload</p>
                    <p className="text-xs text-gray-400 mt-2">Supports PNG, JPG up to 10MB</p>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                ) : (
                  <motion.div 
                    className="relative rounded-3xl overflow-hidden border border-gray-200 shadow-lg"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    {/* Scanning Effect */}
                    {analyzingImage && (
                      <motion.div 
                        className="absolute inset-0 bg-emerald-500/10 z-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <motion.div 
                          className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent shadow-[0_0_20px_rgba(16,185,129,0.8)]"
                          animate={{ top: ['0%', '100%', '0%'] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        />
                      </motion.div>
                    )}
                    
                    <img src={imagePreview} alt="Uploaded crop" className="w-full h-72 object-cover" />
                    
                    {/* Floating Tech Data Overlay */}
                    {imageAnalysis && !analyzingImage && (
                      <div className="absolute inset-0 pointer-events-none">
                        <motion.div 
                          className="absolute top-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                        >
                          <span className="text-xs text-emerald-400 font-medium">Anthracnose: <span className="text-white font-bold">80%</span></span>
                        </motion.div>
                        <motion.div 
                          className="absolute top-4 right-4 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 }}
                        >
                          <span className="text-xs text-amber-400 font-medium">N-Level: <span className="text-white font-bold">Moderate</span></span>
                        </motion.div>
                      </div>
                    )}
                    
                    <button
                      onClick={removeImage}
                      className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-md"
                    >
                      <X className="w-4 h-4 text-gray-600" />
                    </button>
                  </motion.div>
                )}

                {/* Analyze Button */}
                {imagePreview && !analyzingImage && !imageAnalysis && (
                  <motion.button
                    onClick={analyzeImage}
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(16,185,129,0.3)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Sparkles className="w-5 h-5" />
                    Start AI Diagnosis
                  </motion.button>
                )}

                {/* Analyzing State */}
                {analyzingImage && (
                  <div className="flex flex-col items-center justify-center gap-4 py-10">
                    <div className="relative">
                      <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                      <motion.div 
                        className="absolute inset-0 rounded-full bg-emerald-400"
                        animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700">AI is analyzing your crop...</p>
                      <p className="text-xs text-gray-400 mt-1">Detecting diseases & nutrient levels</p>
                    </div>
                  </div>
                )}

                {/* Results - Modular Cards */}
                {imageAnalysis && (
                  <div className="space-y-4">
                    {/* Card 1: Immediate Health ID */}
                    <AnalysisCard 
                      icon={Activity}
                      title="Immediate Health ID"
                      iconColor="text-emerald-600"
                      bgColor="bg-emerald-50"
                      initiallyOpen={true}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Diagnosis</p>
                            <p className="text-lg font-bold text-dark">Anthracnose</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Severity</p>
                            <p className="text-lg font-bold text-red-600">High</p>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-500">Confidence</span>
                            <span className="text-sm font-bold text-emerald-600">92%</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: '92%' }}
                              transition={{ duration: 0.8, delay: 0.2 }}
                            />
                          </div>
                        </div>
                      </div>
                    </AnalysisCard>

                    {/* Card 2: Nutritional Analysis */}
                    <AnalysisCard 
                      icon={FlaskConical}
                      title="Nutritional Analysis"
                      iconColor="text-amber-600"
                      bgColor="bg-amber-50"
                    >
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                          {['Nitrogen', 'Zinc', 'Potassium'].map((nutrient) => (
                            <div key={nutrient} className="text-center p-3 bg-white rounded-xl border border-gray-100">
                              <p className="text-xs text-gray-500">{nutrient}</p>
                              <p className="text-sm font-bold text-dark">{nutrient === 'Zinc' ? 'Low' : 'Normal'}</p>
                            </div>
                          ))}
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-500">Overall Health</span>
                            <span className="text-sm font-bold text-amber-600">6/10</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: '60%' }}
                              transition={{ duration: 0.8, delay: 0.3 }}
                            />
                          </div>
                        </div>
                      </div>
                    </AnalysisCard>

                    {/* Card 3: Recommended Action */}
                    <AnalysisCard 
                      icon={TestTube}
                      title="Recommended Action"
                      iconColor="text-blue-600"
                      bgColor="bg-blue-50"
                    >
                      <div className="space-y-4">
                        <div className="p-3 bg-white rounded-lg border border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">Fungicide</p>
                          <p className="text-sm font-medium text-dark">Azoxystrobin 25% SC</p>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">Fertilizer</p>
                          <p className="text-sm font-medium text-dark">Zinc Sulfate 21%</p>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">Treatment Schedule</p>
                          <p className="text-sm font-medium text-dark">Apply every 7 days for 3 weeks</p>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <motion.button 
                            className="flex-1 py-2.5 bg-emerald-500 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <DollarSign className="w-4 h-4" />
                            ₹250/acre
                          </motion.button>
                          <motion.button 
                            className="flex-1 py-2.5 bg-white border border-gray-200 text-dark text-sm font-medium rounded-xl flex items-center justify-center gap-2"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Calendar className="w-4 h-4" />
                            Schedule
                          </motion.button>
                        </div>
                      </div>
                    </AnalysisCard>

                    {/* Analyze Another Button */}
                    <motion.button
                      onClick={() => { setImageFile(null); setImagePreview(''); setImageAnalysis('') }}
                      className="w-full py-3 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      Analyze Another Image
                    </motion.button>
                  </div>
                )}
              </div>
            </div>

            {/* Image Input Bar */}
            <div className="p-4 border-t border-gray-100 bg-white/80 backdrop-blur-md flex-shrink-0">
              <div className="flex gap-3">
                <label className="p-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl cursor-pointer transition-colors shadow-lg shadow-emerald-500/20">
                  <ImagePlus className="w-4 h-4 text-white" />
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask a question about this image..."
                  style={{ color: '#000000' }}
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all caret-emerald-600 selection:bg-emerald-100 selection:text-emerald-900 shadow-sm"
                  disabled={loading}
                />
                <motion.button
                  className="p-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 rounded-xl transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (imagePreview) {
                      analyzeImage()
                    } else if (input.trim()) {
                      sendMessage()
                    }
                  }}
                  disabled={loading || (!imagePreview && !input.trim())}
                >
                  {analyzingImage || loading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Sparkles className="w-4 h-4 text-white" />}
                </motion.button>
              </div>
            </div>
          </div>
        )}

        {/* AI Actions Tab */}
        {activeTab === 'actions' && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-2xl mx-auto space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-dark">Agentic AI Actions</h3>
                <p className="text-sm text-gray-500 mt-1">AI can automatically execute these farm management tasks</p>
              </div>

              {aiActions.map((action, i) => (
                <motion.div
                  key={action.action}
                  className="glass-card p-5 flex items-center justify-between"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ x: 4 }}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <action.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-dark">{action.title}</h4>
                      <p className="text-xs text-gray-500">{action.desc}</p>
                    </div>
                  </div>
                  <motion.button
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      executingAction === action.action
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'btn-primary'
                    }`}
                    whileHover={executingAction === action.action ? {} : { scale: 1.02 }}
                    whileTap={executingAction === action.action ? {} : { scale: 0.98 }}
                    onClick={() => executeAction(action.action)}
                    disabled={executingAction !== null}
                  >
                    {executingAction === action.action ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Running...
                      </div>
                    ) : (
                      'Execute'
                    )}
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Panel */}
      <div className="w-80 space-y-4">
        <motion.div className="glass-card p-5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-dark">AI Insights</h3>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-green-50 rounded-xl border border-green-100">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <p className="text-xs text-green-700 font-medium">Farm Performance</p>
              </div>
              <p className="text-sm text-green-600 mt-1">Your farms are performing 15% above regional average</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <p className="text-xs text-yellow-700 font-medium">Anomaly Detected</p>
              </div>
              <p className="text-sm text-yellow-600 mt-1">Unusual moisture drop in Plot PL-ODL</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <p className="text-xs text-blue-700 font-medium">Prediction</p>
              </div>
              <p className="text-sm text-blue-600 mt-1">Harvest expected in 23 days, projected income ₹45,000</p>
            </div>
          </div>
        </motion.div>

        <motion.div className="glass-card p-5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-dark">Chat History</h3>
            <button onClick={fetchHistory} className="text-xs text-primary hover:underline" disabled={loadingHistory}>
              {loadingHistory ? 'Loading...' : 'Refresh'}
            </button>
          </div>
          <div className="space-y-2 text-sm max-h-[400px] overflow-y-auto">
            {historyItems.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No history yet. Start chatting!</p>
            ) : (
              historyItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => setSelectedHistory(item)}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      item.interaction_type === 'image_analysis'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {item.interaction_type === 'image_analysis' ? '🖼️ Image' : '💬 Chat'}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(item.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 font-medium truncate">{item.prompt || 'No prompt'}</p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{item.response?.slice(0, 60) || '...'}</p>
                  {item.model_used && (
                    <p className="text-[10px] text-gray-300 mt-1">{item.model_used}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* History Detail Modal */}
        {selectedHistory && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4" onClick={() => setSelectedHistory(null)}>
            <motion.div
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b">
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    selectedHistory.interaction_type === 'image_analysis'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {selectedHistory.interaction_type === 'image_analysis' ? '🖼️ Image Analysis' : '💬 Chat'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(selectedHistory.created_at).toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedHistory(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Prompt</h4>
                  <p className="text-sm text-gray-800 bg-gray-50 rounded-xl p-4">{selectedHistory.prompt}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Response</h4>
                  <div className="text-sm text-gray-800 bg-green-50 rounded-xl p-4 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatContent(selectedHistory.response || 'No response') }} />
                </div>
                {selectedHistory.model_used && (
                  <p className="text-xs text-gray-400">Model: {selectedHistory.model_used}</p>
                )}
                {selectedHistory.confidence_score && (
                  <p className="text-xs text-gray-400">Confidence: {selectedHistory.confidence_score}%</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
