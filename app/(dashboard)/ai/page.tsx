'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { Send, Sparkles, ImagePlus, Bot, Zap, FileText, BarChart3, Droplets, Leaf, Loader2, X, CheckCircle, AlertTriangle, TrendingUp, CloudSun, Activity, TestTube, FlaskConical, Gauge, ChevronDown, ChevronUp, Search, Plus, Calendar, DollarSign } from 'lucide-react'
import DiagnosisHero from './DiagnosisHero'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  confidence?: number
  action?: { type: string; details: string }
  image?: string | null
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
  const [parsedAnalysis, setParsedAnalysis] = useState<any>(null)
  const [analyzingImage, setAnalyzingImage] = useState(false)
  const [executingAction, setExecutingAction] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text?: string) {
    const messageText = text || input
    const hasImage = !!imagePreview
    
    if ((!messageText.trim() && !hasImage) || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: hasImage && !messageText.trim() ? 'Analyze this image' : messageText,
      timestamp: new Date(),
      image: hasImage ? imagePreview : null,
    }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    if (hasImage) {
      setImageFile(null)
      setImagePreview('')
      setImageAnalysis('')
      setParsedAnalysis(null)
    }
    setLoading(true)

    try {
      const chatHistory = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }))

      if (hasImage) {
        const res = await fetch('/api/ai/analyze-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: userMessage.image, prompt: messageText || undefined }),
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
    setParsedAnalysis(null)

    try {
      const res = await fetch('/api/ai/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imagePreview }),
      })
      const data = await res.json()
      
      const rawAnalysis = data.analysis || 'Unable to analyze image.'
      setImageAnalysis(rawAnalysis)
      
      try {
        let cleanedJson = rawAnalysis.trim()
        
        // Remove markdown code blocks if present
        if (cleanedJson.startsWith('```')) {
          cleanedJson = cleanedJson.replace(/^```json?/, '').replace(/```$/, '')
        }
        cleanedJson = cleanedJson.trim()
        
        const jsonMatch = cleanedJson.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          console.log('✅ Parsed JSON keys:', Object.keys(parsed))
          
          // Accept any format with plantInfo, disease, or quickTips
          if (!parsed.plantInfo && !parsed.disease && !parsed.quickTips) {
            console.error('❌ Missing required fields in parsed data')
            toast.error('Could not parse analysis results')
            return
          }
          
          setParsedAnalysis(parsed)
          toast.success('Image analysis complete!')
        } else {
          console.error('No JSON found in response:', rawAnalysis.slice(0, 500))
          toast.error('Could not parse analysis results')
        }
      } catch (parseError) {
        console.error('JSON parse error:', parseError)
        console.error('Raw response:', rawAnalysis.slice(0, 1000))
        toast.error('Analysis received but could not be parsed')
      }
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
    setParsedAnalysis(null)
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
                    {msg.image && (
                      <img src={msg.image} alt="Uploaded" className="w-full h-40 object-cover rounded-lg mb-2" />
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
                <label className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <ImagePlus className="w-4 h-4 text-gray-600" />
                </label>
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
              {imagePreview && (
                <div className="mt-3 relative inline-block">
                  <img src={imagePreview} alt="Preview" className="h-20 rounded-lg" />
                  <button
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full hover:bg-red-600"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Image Analysis Tab - Professional Diagnostic Suite */}
        {activeTab === 'image' && (
          !parsedAnalysis ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <div className="max-w-md w-full text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                  <ImagePlus className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-dark mb-3">Crop Disease Analysis</h3>
                <p className="text-gray-500 mb-10">Upload a photo of your crop leaf, fruit, or plant to get AI-powered disease detection, nutrient analysis, and treatment recommendations.</p>
                
                {!imagePreview ? (
                  <label className="block cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <div className="border-2 border-dashed border-gray-400 rounded-2xl p-16 cursor-pointer hover:border-green-600 hover:bg-green-50 transition-all">
                      <ImagePlus className="w-20 h-20 mx-auto text-gray-500 mb-5" />
                      <p className="text-xl font-semibold text-gray-700">Drop image here or click to upload</p>
                      <p className="text-gray-500 mt-3">PNG, JPG up to 10MB</p>
                    </div>
                  </label>
                ) : (
                  <div className="space-y-6">
                    <div className="relative rounded-2xl overflow-hidden shadow-lg">
                      <img src={imagePreview} alt="Preview" className="w-full h-80 object-contain bg-gray-100" />
                      <button
                        onClick={removeImage}
                        className="absolute top-3 right-3 p-3 bg-red-500 rounded-full hover:bg-red-600 transition-colors shadow-md"
                      >
                        <X className="w-5 h-5 text-white" />
                      </button>
                    </div>
                    <div className="flex gap-4">
                      <button
                        onClick={removeImage}
                        className="flex-1 py-4 border-2 border-gray-400 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-all text-lg"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={analyzeImage}
                        disabled={analyzingImage}
                        className="flex-1 py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all disabled:bg-gray-400 flex items-center justify-center gap-3 text-lg shadow-lg"
                      >
                        {analyzingImage ? (
                          <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span>Analyzing...</span>
                          </>
                        ) : (
                          <>
                            <ImagePlus className="w-6 h-6" />
                            <span>Analyze Image</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-auto p-4">
              <DiagnosisHero analysisData={parsedAnalysis} />
            </div>
          )
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
