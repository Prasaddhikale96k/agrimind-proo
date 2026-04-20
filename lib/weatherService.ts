const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || '';

export interface WeatherData {
  temp: number;
  tempMax: number;
  tempMin: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: string;
  feelsLike: number;
  location: string;
  iconEmoji: string;
  iconCode: string;
  isLive: boolean;
  lastUpdated: string;
  visibility: number;
  pressure: number;
}

export const FALLBACK_WEATHER: WeatherData = {
  temp: 36,
  tempMax: 38,
  tempMin: 28,
  condition: 'Clear',
  description: 'clear sky',
  humidity: 15,
  windSpeed: '0.4',
  feelsLike: 38,
  location: 'Nashik, Maharashtra',
  iconEmoji: '☀️',
  iconCode: '01d',
  isLive: false,
  lastUpdated: new Date().toLocaleTimeString(),
  visibility: 10,
  pressure: 1013,
};

const WEATHER_ICONS: Record<string, string> = {
  '01d': '☀️', '01n': '🌙',
  '02d': '⛅', '02n': '⛅',
  '03d': '☁️', '03n': '☁️',
  '04d': '☁️', '04n': '☁️',
  '09d': '🌧️', '09n': '🌧️',
  '10d': '🌦️', '10n': '🌧️',
  '11d': '⛈️', '11n': '⛈️',
  '13d': '❄️', '13n': '❄️',
  '50d': '🌫️', '50n': '🌫️',
};

export async function fetchWeather(
  lat = 20.0059,
  lon = 73.7898
): Promise<WeatherData> {
  if (!OPENWEATHER_API_KEY) {
    console.warn('No OpenWeather API key found, using fallback');
    return FALLBACK_WEATHER;
  }

  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`,
        { next: { revalidate: 600 } }
      ),
      fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&cnt=8`,
        { next: { revalidate: 600 } }
      )
    ]);

    if (!currentRes.ok) {
      throw new Error(`Weather API ${currentRes.status}: ${currentRes.statusText}`);
    }

    const current = await currentRes.json();
    const forecast = forecastRes.ok ? await forecastRes.json() : null;

    const temps = forecast?.list?.map((f: unknown) => (f as { main: { temp: number } }).main.temp) || [current.main.temp];
    const iconCode = current.weather[0].icon;

    return {
      temp: Math.round(current.main.temp),
      tempMax: Math.round(Math.max(...temps, current.main.temp_max)),
      tempMin: Math.round(Math.min(...temps, current.main.temp_min)),
      condition: current.weather[0].main,
      description: current.weather[0].description,
      humidity: current.main.humidity,
      windSpeed: current.wind.speed.toFixed(1),
      feelsLike: Math.round(current.main.feels_like),
      location: `${current.name}, Maharashtra`,
      iconEmoji: WEATHER_ICONS[iconCode] || '🌤️',
      iconCode,
      isLive: true,
      lastUpdated: new Date().toLocaleTimeString(),
      visibility: Math.round(current.visibility / 1000),
      pressure: current.main.pressure,
    };
  } catch (error) {
    console.error('Weather fetch failed:', error);
    return { ...FALLBACK_WEATHER, isLive: false };
  }
}