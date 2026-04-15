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

    const defaultPrompt = `You are an expert plant pathologist. Analyze this crop image and provide a detailed agricultural report in JSON format:

{
  "plantInfo": {
    "commonName": "crop name",
    "scientificName": "botanical name",
    "family": "plant family",
    "cropType": "type of crop",
    "growthStage": "current growth stage",
    "emoji": "one emoji",
    "growingSeason": "best months"
  },
  "disease": {
    "detected": true,
    "name": "disease name if any",
    "confidence": 85,
    "severity": "Medium",
    "description": "2-3 sentences about the disease",
    "symptoms": ["symptom 1", "symptom 2", "symptom 3"],
    "causes": ["cause 1", "cause 2"],
    "treatment": {
      "product": "recommended fungicide/insecticide",
      "dosage": "how to apply",
      "frequency": "how often"
    }
  },
  "nutritional": {
    "overallHealth": 7,
    "deficiencies": ["nutrient 1 if any"],
    "recommendations": ["fertilizer recommendation"]
  },
  "quickTips": ["tip 1", "tip 2", "tip 3"]
}

Return ONLY valid JSON, no markdown.`

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
