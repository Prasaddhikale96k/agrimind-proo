import OpenAI from 'openai'

export const groq = new OpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY || '',
})

export const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
  defaultHeaders: {
    'HTTP-Referer': 'https://agrimind-pro.vercel.app',
    'X-Title': 'AgriMind Pro',
  },
})

export const GROQ_MODEL = 'qwen/qwen3-32b'
export const OPENROUTER_MODEL = 'google/gemini-2.0-flash-exp:free'
export const OPENROUTER_FALLBACK = 'meta-llama/llama-3.3-70b-instruct:free'
