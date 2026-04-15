// KisanGlobal API Configuration
// All API keys are loaded from .env.local - never commit this file!
export const API_KEYS = {
  DATA_GOV_IN: process.env.NEXT_PUBLIC_DATAGOV_API_KEY || "",
  OPENWEATHER: process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || "",
  EXCHANGE_RATE: process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY || "",
  EMAILJS_SERVICE_ID: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "",
  EMAILJS_TEMPLATE_ID: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "",
  EMAILJS_PUBLIC_KEY: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "",
};

// Fallback prices if API fails (₹/kg)
export const FALLBACK_MANDI_PRICES = {
  Grapes: 45,
  Onion: 12,
  Pomegranate: 55,
  Banana: 18,
  Tomato: 10,
  Mango: 35,
  Okra: 14,
};

// Export prices (₹/kg)
export const EXPORT_PRICES = {
  Grapes: 145,
  Onion: 41,
  Pomegranate: 176,
  Banana: 56,
  Tomato: 32,
  Mango: 115,
  Okra: 44,
};

// Agent prices (₹/kg)
export const AGENT_PRICES = {
  Grapes: 45,
  Onion: 12,
  Pomegranate: 55,
  Banana: 18,
  Tomato: 10,
  Mango: 35,
  Okra: 14,
};

// KisanGlobal direct prices (₹/kg)
export const KISANGLOBAL_PRICES = {
  Grapes: 98,
  Onion: 28,
  Pomegranate: 120,
  Banana: 38,
  Tomato: 22,
  Mango: 78,
  Okra: 30,
};
