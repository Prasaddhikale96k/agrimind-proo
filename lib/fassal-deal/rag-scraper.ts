// Gemini with Google Search Grounding via REST API
// No external API keys needed - just Gemini API key
// Gemini searches the live web itself

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''

const CROP_ALIASES: Record<string, string> = {
  tomato: 'Tomato', onion: 'Onion', potato: 'Potato', wheat: 'Wheat',
  paddy: 'Paddy', rice: 'Rice', maize: 'Maize', chickpea: 'Gram',
  soybean: 'Soyabean', cotton: 'Cotton', sugarcane: 'Sugarcane',
  mustard: 'Mustard', groundnut: 'Groundnut', turmeric: 'Turmeric',
  chillies: 'Red Chillies', garlic: 'Garlic', ginger: 'Ginger',
  banana: 'Banana', grapes: 'Grapes', mango: 'Mango', orange: 'Orange',
  lemon: 'Lemon', brinjal: 'Brinjal', cucumber: 'Cucumber',
  capsicum: 'Capsicum', coriander: 'Coriander', fenugreek: 'Fenugreek',
  cabbage: 'Cabbage', cauliflower: 'Cauliflower', okra: 'Bhindi',
  pea: 'Peas', carrot: 'Carrot', watermelon: 'Watermelon',
  bajra: 'Bajra', jowar: 'Jowar', barley: 'Barley',
  urad: 'Urad', moong: 'Moong', arhar: 'Arhar',
  sesame: 'Sesame', sunflower: 'Sunflower',
}

function normalizeCrop(input: string): string {
  return CROP_ALIASES[input.toLowerCase()] || input
}

export async function fetchMandiPricesViaRAG(
  cropName: string,
  state?: string,
  limit: number = 30
): Promise<any[]> {
  const crop = normalizeCrop(cropName)
  const location = state || 'India'

  try {
    const prompt = `You are an Agricultural Economist. Extract the latest mandi (wholesale market) prices for ${crop} in ${location}.

Search the web for current prices from agmarknet.gov.in and other agricultural sources.

Return ONLY a valid JSON array (no markdown formatting, no explanation, no backticks) with this exact format:
[
  {"market": "Market Name", "state": "State", "district": "District", "variety": "Desi/Local/Other", "modal_price": 1500, "min_price": 1200, "max_price": 1800, "date_reported": "2026-04-07"},
  ...
]

If specific costs are not found in the source, use these Maharashtra APMC defaults:
- Weighing (Tolay): Rs 20/quintal
- Loading (Hamali): Rs 45/quintal
- Transport: Distance in km * Rs 3/quintal

CRITICAL: Always extract and include the date_reported from the source in YYYY-MM-DD format.
Include 10-15 different mandis across ${location}. Use realistic current prices for ${crop}.
If exact current data is not available, use reasonable estimates based on recent market trends.

IMPORTANT: Return ONLY the JSON array. Nothing else.`

    // Use raw fetch to avoid SDK type issues with googleSearch tool
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          tools: [{ googleSearch: {} }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 3000 },
        }),
      }
    )

    if (!res.ok) {
      const errorText = await res.text()
      console.warn('Gemini Search Grounding failed:', res.status, errorText)
      return []
    }

    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    // Extract JSON from response (handle potential markdown wrapping)
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      console.warn('No JSON found in Gemini response:', text.substring(0, 200))
      return []
    }

    const results = JSON.parse(jsonMatch[0])
    return results.slice(0, limit)
  } catch (error) {
    console.error('Gemini Search Grounding error:', error)
    return []
  }
}
