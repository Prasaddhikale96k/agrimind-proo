// KisanGlobal API Configuration
// WARNING: Never commit this file to version control
export const API_KEYS = {
  DATA_GOV_IN: "datagov-579b464db66ec23bdd0000018a4ae19df92248826b8d31c51485f3f8",
  // Using existing Groq API key from .env.local
  GROQ: process.env.GROQ_API_KEY || "",
  OPENWEATHER: process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || "df1a9b4cb1050c130817ebc84aa2e2aa",
  EXCHANGE_RATE: "2b01a47ebfe41316f60468f5",
  EMAILJS_SERVICE_ID: "service_uezxlwj",
  EMAILJS_TEMPLATE_ID: "template_yvdf3u6",
  EMAILJS_PUBLIC_KEY: "ARR6NkUyhnvERfZ-U",
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
