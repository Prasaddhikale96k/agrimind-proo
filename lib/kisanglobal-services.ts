// KisanGlobal API Service Functions
import { API_KEYS, FALLBACK_MANDI_PRICES } from './kisanglobal-config'

// Initialize EmailJS
export function initEmailJS() {
  if (typeof window !== 'undefined') {
    import('@emailjs/browser').then((emailjs) => {
      emailjs.init(API_KEYS.EMAILJS_PUBLIC_KEY)
    })
  }
}

// Fetch Weather Data from OpenWeatherMap
export async function fetchWeatherData(location: string = 'Nashik,IN') {
  try {
    const WEATHER_API_KEY = 'df1a9b4cb1050c130817ebc84aa2e2aa'
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${WEATHER_API_KEY}&units=metric`
    )

    if (!response.ok) {
      throw new Error('Weather API failed')
    }

    const data = await response.json()
    return {
      temp: data.main?.temp,
      humidity: data.main?.humidity,
      condition: data.weather?.[0]?.main?.toLowerCase(),
      description: data.weather?.[0]?.description,
      location: data.name,
    }
  } catch (error) {
    console.error('Weather fetch error:', error)
    return null
  }
}

// Generate AI Weather Advisory
export function generateWeatherAdvisory(weatherData: any, crop: string = 'Grapes') {
  if (!weatherData) return null

  const { temp, humidity, condition } = weatherData

  if (temp > 35) {
    return {
      type: 'warning' as const,
      message: `⚠️ High heat alert — Temperature is ${temp}°C. Book cold storage immediately before your ${crop.toLowerCase()} degrade. Pre-cooling required within 4 hours of harvest.`,
      aiAdvice: `Temperature exceeding 35°C. For ${crop}: Harvest early morning or late evening. Use shade nets during transport. Pre-cool to 5-8°C within 4 hours.`,
    }
  }

  if (humidity > 80) {
    return {
      type: 'warning' as const,
      message: `⚠️ High humidity detected (${humidity}%) — Fungal risk for ${crop.toLowerCase()}. Delay harvest by 2 days or use sulfur dioxide pads in packaging.`,
      aiAdvice: `Humidity at ${humidity}%. High fungal risk for ${crop}. Apply recommended fungicide. Ensure proper ventilation in storage. Consider SO2 pads for grape packaging.`,
    }
  }

  if (condition?.includes('rain')) {
    return {
      type: 'danger' as const,
      message: `🌧️ Rain detected — Avoid harvest today. Wet produce rejected at export inspection.`,
      aiAdvice: `Rain expected. Delay harvesting ${crop}. Moisture affects quality and shelf-life. Plan harvest for next dry window. Cover mature produce with waterproof sheets if urgent.`,
    }
  }

  return {
    type: 'success' as const,
    message: `✅ Perfect weather for harvest and packing today (${temp}°C). Export quality ${crop.toLowerCase()} expected.`,
    aiAdvice: `Ideal conditions: ${temp}°C, ${humidity}% humidity. Optimal for ${crop} harvest and grading. Proceed with export-quality packaging.`,
  }
}

// Fetch Mandi Prices from Data.gov.in
export async function fetchMandiPricesFromAPI() {
  try {
    const crops = ['Grapes', 'Onion', 'Pomegranate', 'Banana', 'Tomato', 'Mango', 'Okra']
    const prices: Record<string, number> = {}

    // Using Agmarknet API (data.gov.in format)
    const apiUrl = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070'

    for (const crop of crops) {
      try {
        const response = await fetch(
          `${apiUrl}?api-key=${API_KEYS.DATA_GOV_IN}&format=json&limit=10&filters[State]=Maharashtra&filters[Commodity]=${crop}`
        )

        if (response.ok) {
          const data = await response.json()

          if (data.records && data.records.length > 0) {
            // Extract modal price from first record
            const price = parseFloat(data.records[0].Modal_Price)
            if (!isNaN(price)) {
              prices[crop] = price
            }
          }
        }
      } catch (cropError) {
        console.warn(`Failed to fetch price for ${crop}:`, cropError)
        // Use fallback if individual crop fails
        prices[crop] = FALLBACK_MANDI_PRICES[crop as keyof typeof FALLBACK_MANDI_PRICES]
      }
    }

    // Fill in any missing crops with fallback data
    for (const crop of crops) {
      if (!prices[crop]) {
        prices[crop] = FALLBACK_MANDI_PRICES[crop as keyof typeof FALLBACK_MANDI_PRICES]
      }
    }

    return { prices, isLive: true }
  } catch (error) {
    console.error('Failed to fetch mandi prices:', error)
    return { prices: FALLBACK_MANDI_PRICES, isLive: false }
  }
}

// Fetch Exchange Rate and convert USD to INR
export async function fetchExchangeRate() {
  try {
    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${API_KEYS.EXCHANGE_RATE}/latest/USD`
    )

    if (!response.ok) {
      throw new Error('Exchange rate API failed')
    }

    const data = await response.json()
    return data.conversion_rates?.USD || 83.5
  } catch (error) {
    console.error('Failed to fetch exchange rate:', error)
    return 83.5 // Fallback rate
  }
}

// Calculate International Export Prices
export function calculateExportPrices(
  usdPrices: Record<string, number>,
  exchangeRate: number
): Record<string, number> {
  const inrPrices: Record<string, number> = {}

  for (const [crop, usdPrice] of Object.entries(usdPrices)) {
    inrPrices[crop] = Math.round(usdPrice * exchangeRate)
  }

  return inrPrices
}

// Submit Buyer Interest via EmailJS
export async function submitBuyerInterest(formData: {
  name: string
  phone: string
  quantity: string
  date: string
  crop: string
  country: string
  price: string
}) {
  try {
    const emailjs = await import('@emailjs/browser')

    const templateParams = {
      from_name: formData.name,
      phone: formData.phone,
      quantity: formData.quantity,
      delivery_date: formData.date,
      crop: formData.crop,
      target_buyer: `${formData.country} Buyer`,
      price_offered: formData.price,
      to_email: 'admin@kisanglobal.com',
      message: `New export lead from ${formData.name} for ${formData.crop} to ${formData.country}`,
    }

    const response = await emailjs.send(
      API_KEYS.EMAILJS_SERVICE_ID,
      API_KEYS.EMAILJS_TEMPLATE_ID,
      templateParams,
      API_KEYS.EMAILJS_PUBLIC_KEY
    )

    console.log('EmailJS Success:', response)
    return { success: true, message: 'Your interest has been sent! Our export team will contact you within 24 hours.' }
  } catch (error: any) {
    console.error('EmailJS Error:', error)
    return {
      success: false,
      message: error?.text || error?.message || 'Failed to send. Please try again.'
    }
  }
}

// Generate Export Document using jsPDF
export async function generateExportDocument(docType: string, formData: {
  name: string
  crop: string
  quantity: string
  country: string
  date: string
}) {
  // Dynamic import for Next.js compatibility
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF()

  // Header with KisanGlobal branding
  doc.setFillColor(16, 185, 129) // Emerald green
  doc.rect(0, 0, 210, 30, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(28)
  doc.setFont('helvetica', 'bold')
  doc.text('KisanGlobal', 20, 18)

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('Export Hub - Nashik, Maharashtra', 20, 25)

  // Document Title
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(docType, 20, 45)

  // Divider
  doc.setDrawColor(16, 185, 129)
  doc.setLineWidth(1)
  doc.line(20, 48, 190, 48)

  // Content Section
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')

  const fields = [
    { label: 'Farmer/FPO Name', value: formData.name },
    { label: 'Crop', value: formData.crop },
    { label: 'Quantity', value: `${formData.quantity} MT` },
    { label: 'Buyer Country', value: formData.country },
    { label: 'Shipment Date', value: formData.date },
    {
      label: 'Date Generated', value: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    },
  ]

  let yPosition = 60
  fields.forEach((field) => {
    doc.setFont('helvetica', 'bold')
    doc.text(`${field.label}:`, 20, yPosition)
    doc.setFont('helvetica', 'normal')
    doc.text(field.value, 70, yPosition)
    yPosition += 12
  })

  // AI-Generated Advisory (simulated)
  yPosition += 5
  doc.setFillColor(240, 253, 244) // Light green background
  doc.roundedRect(20, yPosition, 170, 30, 3, 3, 'F')

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(16, 185, 129)
  doc.text('AI Advisory:', 25, yPosition + 8)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(50, 50, 50)
  doc.setFontSize(10)
  doc.text(
    `Quality check recommended for ${formData.crop}.`,
    25,
    yPosition + 16
  )
  doc.text(
    `Ensure compliance with ${formData.country} import regulations.`,
    25,
    yPosition + 23
  )

  // Footer with disclaimer
  const pageHeight = doc.internal.pageSize.height
  doc.setFontSize(9)
  doc.setTextColor(128, 128, 128)
  doc.setFont('helvetica', 'italic')
  doc.text(
    'Disclaimer: This document is a template. Final certification must be done via APEDA registered agency.',
    20,
    pageHeight - 20
  )

  doc.setFontSize(8)
  doc.text(
    `Generated by KisanGlobal Export Hub | ${new Date().toISOString()}`,
    20,
    pageHeight - 12
  )

  // Save PDF
  const filename = `KisanGlobal_${docType.replace(/ /g, '_')}_${formData.name.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(filename)

  return { success: true, filename }
}

// AI Advice Generator (using existing /api/ai/chat)
export async function getAIAdvice(prompt: string) {
  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: prompt,
        history: [],
      }),
    })

    const data = await response.json()
    return data.response || 'AI service unavailable'
  } catch (error) {
    console.error('AI Advice Error:', error)
    return 'Unable to generate advice at this time'
  }
}

// Cache management for API responses
export function getCachedData(key: string, maxAge: number = 2 * 60 * 60 * 1000) {
  if (typeof window === 'undefined') return null

  try {
    const cached = localStorage.getItem(`kisanglobal_${key}`)
    const cacheTime = localStorage.getItem(`kisanglobal_${key}_time`)

    if (cached && cacheTime) {
      const age = Date.now() - parseInt(cacheTime)
      if (age < maxAge) {
        return JSON.parse(cached)
      }
    }
    return null
  } catch (error) {
    console.error('Cache read error:', error)
    return null
  }
}

export function setCachedData(key: string, data: any) {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(`kisanglobal_${key}`, JSON.stringify(data))
    localStorage.setItem(`kisanglobal_${key}_time`, Date.now().toString())
  } catch (error) {
    console.error('Cache write error:', error)
  }
}
