import OpenAI from 'openai'

export const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
  defaultHeaders: {
    'HTTP-Referer': 'https://agrimind-pro.vercel.app',
    'X-Title': 'AgriMind Pro',
  },
})

export const CHAT_MODEL = 'google/gemini-2.0-flash-exp:free'
export const CHAT_MODEL_FALLBACK = 'meta-llama/llama-3.3-70b-instruct:free'
export const VISION_MODEL = 'google/gemini-2.0-flash-exp:free'
