import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyDcIRflcFjcpXrvH_lCbKu9wZLQDjxjDzI'
const genAI = new GoogleGenerativeAI(apiKey)

export const chatModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
export const visionModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
