import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { openrouter } from '@/lib/ai-providers'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const { image, prompt: userPrompt } = await req.json()

    if (!image) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 })
    }

    let base64Data: string
    let mimeType: string

    if (image.startsWith('data:')) {
      const match = image.match(/^data:([^;]+);base64,(.+)$/)
      if (!match) {
        return NextResponse.json({ error: 'Invalid image data URL format' }, { status: 400 })
      }
      mimeType = match[1]
      base64Data = match[2]
    } else {
      base64Data = image
      mimeType = 'image/jpeg'
    }

    const defaultPrompt = `You are an expert plant pathologist, agronomist, and crop disease specialist with 20+ years of experience in Indian agriculture. Provide a COMPREHENSIVE and DETAILED analysis of this crop image.

## 1. CROP IDENTIFICATION
- Crop name and variety/species
- Growth stage (seedling, vegetative, flowering, fruiting, mature)
- Overall plant morphology and development

## 2. DISEASE & PEST DETECTION
- Identify any visible diseases (fungal, bacterial, viral) with confidence percentage
- Identify any pest damage (insects, mites, nematodes)
- Describe specific symptoms visible (spots, wilting, discoloration, lesions, etc.)
- Rate severity: Mild / Moderate / Severe / Critical

## 3. NUTRIENT STATUS ANALYSIS
- Nitrogen (N) deficiency or excess symptoms
- Phosphorus (P) deficiency or excess symptoms
- Potassium (K) deficiency or excess symptoms
- Micronutrient deficiencies (Iron, Zinc, Magnesium, Calcium, etc.)
- Visual indicators observed in leaves, stems, and overall plant

## 4. OVERALL HEALTH ASSESSMENT
- Health rating out of 10 with justification
- Vigor and growth quality
- Stress indicators (water stress, heat stress, etc.)

## 5. TREATMENT PLAN (Detailed)
- Immediate actions to take (within 24-48 hours)
- Short-term treatment (1-2 weeks)
- Long-term management strategy
- Specific product/chemical names available in India
- Exact dosages and application methods
- Application timing and frequency

## 6. ESTIMATED COST
- Treatment cost per acre in Indian Rupees (₹)
- Breakdown by product/chemical
- Cost-benefit analysis

## 7. PREVENTION STRATEGY
- Crop rotation recommendations
- Soil management practices
- Irrigation adjustments
- Seasonal precautions
- Resistant variety suggestions

## 8. WEATHER-BASED RECOMMENDATIONS
- How current weather conditions affect this issue
- Best timing for treatment based on weather
- Precautionary measures for upcoming weather patterns

Be extremely thorough and detailed. Reference Indian agricultural practices, locally available products, and Nashik-region specific advice where applicable. Use specific numbers, dosages, and timelines.`

    let analysis = ''
    let modelUsed = ''

    // Try Gemini first
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

      const result = await model.generateContent([
        {
          inlineData: {
            data: base64Data,
            mimeType,
          },
        },
        userPrompt || defaultPrompt,
      ])

      analysis = result.response.text()
      modelUsed = 'gemini-2.0-flash'

      if (!analysis) {
        throw new Error('Empty response from Gemini')
      }
    } catch (geminiError: any) {
      console.warn('Gemini failed, using fallback:', geminiError?.message)

      const completion = await openrouter.chat.completions.create({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: userPrompt || defaultPrompt },
              { type: 'image_url', image_url: { url: image } },
            ],
          },
        ],
        max_tokens: 2000,
      })

      analysis = completion.choices[0]?.message?.content || 'Unable to analyze image.'
      modelUsed = 'openai/gpt-4o-mini'
    }

    // Save to history
    try {
      const [farmersRes] = await Promise.all([
        supabaseAdmin.from('farmers').select('id').limit(1),
      ])
      const farmer = farmersRes.data?.[0]

      await supabaseAdmin.from('ai_interactions').insert({
        farmer_id: farmer?.id,
        interaction_type: 'image_analysis',
        prompt: userPrompt || 'Crop image analysis',
        response: analysis,
        model_used: modelUsed,
        confidence_score: 90,
        context_data: { image_mime: mimeType },
      })
    } catch (dbError) {
      console.warn('Failed to save image analysis to history:', dbError)
    }

    return NextResponse.json({ analysis, confidence: 90 })
  } catch (error: any) {
    console.error('Image Analysis Error:', error)
    const errorMsg = error?.message || 'Unknown error'
    return NextResponse.json({ 
      analysis: `Failed to analyze image: ${errorMsg}`, 
      error: errorMsg 
    }, { status: 500 })
  }
}
