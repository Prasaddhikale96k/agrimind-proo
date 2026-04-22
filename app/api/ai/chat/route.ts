import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { GoogleGenerativeAI } from '@google/generative-ai'
import OpenAI from 'openai'

const WEATHER_API_KEY = 'df1a9b4cb1050c130817ebc84aa2e2aa'

const groq = new OpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY || '',
})

async function fetchRealtimeWeather(location: string) {
  try {
    let url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)},India&appid=${WEATHER_API_KEY}&units=metric`
    let response = await fetch(url)
    
    if (!response.ok) {
      console.log(`Weather fetch failed for ${location}, falling back to Nashik`)
      url = `https://api.openweathermap.org/data/2.5/weather?q=Nashik,India&appid=${WEATHER_API_KEY}&units=metric`
      response = await fetch(url)
    }
    
    if (!response.ok) return null
    const data = await response.json()
    return {
      temp: Math.round(data.main.temp),
      feels_like: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      wind_speed: Math.round(data.wind.speed * 10) / 10,
      wind_deg: data.wind.deg,
      condition: data.weather[0].main,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      visibility: data.visibility,
      clouds: data.clouds.all,
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,
    }
  } catch (error) {
    console.error('Weather fetch error:', error)
    return null
  }
}

async function callGemini(messages: any[]) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const systemPrompt = messages.find((m: any) => m.role === 'system')?.content || ''
  const chatMessages = messages.filter((m: any) => m.role !== 'system')

  const prompt = systemPrompt
    ? `${systemPrompt}\n\n---\n\n${chatMessages.map((m: any) => `${m.role}: ${m.content}`).join('\n\n')}`
    : chatMessages.map((m: any) => `${m.role}: ${m.content}`).join('\n\n')

  const result = await model.generateContent(prompt)
  const text = result.response.text()

  return {
    choices: [{ message: { content: text } }],
  }
}

async function callGroq(messages: any[]) {
  const systemPrompt = messages.find((m: any) => m.role === 'system')?.content || ''
  const chatMessages = messages.filter((m: any) => m.role !== 'system')

  const formattedMessages = [
    { role: 'system', content: systemPrompt },
    ...chatMessages.map((m: any) => ({ role: m.role, content: m.content })),
  ]

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: formattedMessages,
    temperature: 0.7,
    max_tokens: 1024,
  })

  return {
    choices: [{ message: { content: completion.choices[0]?.message?.content || '' } }],
  }
}

export async function POST(req: Request) {
  try {
    const { message, execute, history } = await req.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const [farmersRes, farmsRes, cropsRes, soilRes, weatherRes, alertsRes, financialsRes, irrigationRes, sprayRes] = await Promise.all([
      supabaseAdmin.from('farmers').select('*').limit(1),
      supabaseAdmin.from('farms').select('*'),
      supabaseAdmin.from('crops').select('*').eq('status', 'growing'),
      supabaseAdmin.from('soil_data').select('*').order('recorded_at', { ascending: false }).limit(7),
      supabaseAdmin.from('weather_data').select('*').order('recorded_at', { ascending: false }).limit(1),
      supabaseAdmin.from('alerts').select('*').eq('is_resolved', false).limit(10),
      supabaseAdmin.from('financial_records').select('*').order('record_date', { ascending: false }).limit(20),
      supabaseAdmin.from('irrigation_schedules').select('*').order('scheduled_date', { ascending: false }).limit(10),
      supabaseAdmin.from('spray_schedules').select('*').order('scheduled_date', { ascending: false }).limit(10),
    ])

    const farmer = farmersRes.data?.[0]
    const farms = farmsRes.data || []
    const crops = cropsRes.data || []
    const latestSoil = soilRes.data?.[0]
    const latestWeather = weatherRes.data?.[0]
    const activeAlerts = alertsRes.data || []
    const recentFinancials = financialsRes.data || []
    const irrigationSchedules = irrigationRes.data || []
    const spraySchedules = sprayRes.data || []

    // Fetch real-time weather
    const farmLocation = farmer?.district || farms[0]?.location || 'Nashik'
    const realtimeWeather = await fetchRealtimeWeather(farmLocation)

    const totalIncome = recentFinancials.filter((r) => r.record_type === 'income').reduce((s, r) => s + Number(r.amount), 0)
    const totalExpenditure = recentFinancials.filter((r) => r.record_type === 'expenditure').reduce((s, r) => s + Number(r.amount), 0)

    const farmContext = `
FARMER: ${farmer?.name || 'Unknown'}
FARMS: ${farms.map((f) => `${f.name} (${f.plot_id}), ${f.area_acres || 0} acres, soil: ${f.soil_type || 'unknown'}`).join('; ')}
ACTIVE CROPS: ${crops.map((c) => `${c.name} (${c.variety || ''}), health: ${c.health_index}%, stage: ${c.growth_stage || 'unknown'}, status: ${c.status}`).join('; ')}

=== REAL-TIME WEATHER (Live from API) ===
Location: ${farmLocation}, India
Temperature: ${realtimeWeather?.temp || 'N/A'}°C (Feels like: ${realtimeWeather?.feels_like || 'N/A'}°C)
Humidity: ${realtimeWeather?.humidity || 'N/A'}%
Pressure: ${realtimeWeather?.pressure || 'N/A'} hPa
Wind: ${realtimeWeather?.wind_speed || 'N/A'} m/s (${realtimeWeather?.wind_deg || 'N/A'}°)
Condition: ${realtimeWeather?.condition || 'N/A'} (${realtimeWeather?.description || 'N/A'})
Visibility: ${realtimeWeather?.visibility ? (realtimeWeather.visibility / 1000).toFixed(1) : 'N/A'} km
Clouds: ${realtimeWeather?.clouds || 'N/A'}%
Sunrise: ${realtimeWeather?.sunrise ? new Date(realtimeWeather.sunrise * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
Sunset: ${realtimeWeather?.sunset ? new Date(realtimeWeather.sunset * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
=======================================

SOIL: Moisture=${latestSoil?.moisture_percent || 'N/A'}%, pH=${latestSoil?.ph_level || 'N/A'}, N=${latestSoil?.nitrogen_ppm || 'N/A'}, P=${latestSoil?.phosphorus_ppm || 'N/A'}, K=${latestSoil?.potassium_ppm || 'N/A'} ppm
ACTIVE ALERTS: ${activeAlerts.length} total, ${activeAlerts.filter((a) => a.severity === 'critical').length} critical
FINANCIALS: Income=₹${totalIncome}, Expenditure=₹${totalExpenditure}, Net=₹${totalIncome - totalExpenditure}
IRRIGATION: ${irrigationSchedules.map((i) => `${i.crop_name || 'Unknown'} on ${i.scheduled_date || 'N/A'}, status: ${i.status || 'pending'}`).join('; ')}
SPRAY: ${spraySchedules.map((s) => `${s.crop_name || 'Unknown'} on ${s.scheduled_date || 'N/A'}, status: ${s.status || 'pending'}`).join('; ')}
`.trim()

    const isGreeting = /^(hi|hello|hey|hii|hola|greetings|good\s*(morning|afternoon|evening|night))\b/i.test(message.trim())

    const systemPrompt = isGreeting
      ? `You are AgriMind AI, a friendly farm assistant.

TONE: Short, warm, conversational.

For greetings: Reply in 1-2 sentences max. Ask what they need. Example: "Hey! 👋 How can I help you today? Need advice on crops, soil, or weather?"

AVOID: Long lists, formal tone, dumping data.`
      : `ROLE: You are the Lead Agronomist and Financial Controller for AgriMind Pro.

TASK: Analyze the Farm Database — Soil Health, Weather API data, Crop Phenology (growth stages), and Financial Ledger.

ANALYSIS PROTOCOL:
1. DATA CROSS-REFERENCING: Match current weather (Temp/Humidity/Wind) against the crop stage's specific vulnerabilities (e.g., flowering grapes vs. fruiting tomatoes).
2. ANOMALY DETECTION: Identify if any DB values correlate with weather forecasts (e.g., moisture drops before dry spells).
3. FINANCIAL IMPACT: Every biological recommendation must be weighed against Monthly P&L. If a spray is recommended, estimate cost-to-yield benefit.
4. ACTIONABLE OUTPUT: End every analysis with a specific "Execute" command.

LOCAL CONTEXT: Consider Nashik-region vulnerabilities — e.g., Grapes to Downy Mildew when humidity exceeds 60%.

AVAILABLE TOOLS: optimize_irrigation(), calculate_pnl(), trigger_spray_drone(), generate_alerts(), analyze_soil()

CURRENT FARM DATA:
${farmContext}

RESPONSE FORMAT:
- **Confidence Score:** [% match]
- **Insight:** [1 sentence on why this matters]
- **Actions:** [Bullet points with specific timings]
- **Command:** Execute: [function_name]

TONE: Professional yet supportive. Concise and data-driven. Use ₹ for all currency.

CRITICAL: Keep responses focused. Don't dump all data — only reference what's relevant to the user's question. For simple queries, keep it to 3-4 sentences. For analysis requests (P&L, optimization, reports), use the full format above.`

    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      ...(history || []).map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
      { role: 'user', content: message },
    ]

    let completion
    let modelUsed = ''

    // Try Groq first, fallback to Gemini
    try {
      console.log('Trying Groq API...')
      completion = await callGroq(messages)
      modelUsed = 'llama-3.3-70b-versatile'
      console.log('Groq API succeeded')
    } catch (groqError: any) {
      console.error('Groq failed:', groqError?.message || groqError)
      console.log('Falling back to Gemini API...')
      try {
        completion = await callGemini(messages)
        modelUsed = 'gemini-2.0-flash-lite'
        console.log('Gemini API succeeded')
      } catch (geminiError: any) {
        console.error('Gemini also failed:', geminiError?.message || geminiError)
        throw new Error('AI service unavailable. Please check your API keys.')
      }
    }

    const response = completion.choices[0]?.message?.content || 'I apologize, but I could not process your request.'

    const actionMatch = response.match(/ACTION:\s*(\w+)\s*\|\s*(.+)/)
    const action = actionMatch ? { type: actionMatch[1], details: actionMatch[2] } : undefined

    try {
      await supabaseAdmin.from('ai_interactions').insert({
        farmer_id: farmer?.id,
        interaction_type: 'chat',
        prompt: message,
        response,
        model_used: modelUsed,
        confidence_score: 92,
        context_data: { history_length: history?.length || 0 },
      })
    } catch {}

    return NextResponse.json({ response, action, confidence: 92 })
  } catch (error: any) {
    console.error('AI Chat Error:', error)
    return NextResponse.json({
      response: 'Sorry, I encountered an error. Please try again.',
      error: error?.message || 'Unknown error',
    }, { status: 500 })
  }
}
