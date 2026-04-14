import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, differenceInDays } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'dd MMM yyyy')
}

export function formatRelative(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function daysUntil(date: string | Date): number {
  return differenceInDays(new Date(date), new Date())
}

export function getHealthColor(health: number): string {
  if (health >= 80) return 'text-green-500'
  if (health >= 60) return 'text-yellow-500'
  return 'text-red-500'
}

export function getHealthBg(health: number): string {
  if (health >= 80) return 'bg-green-500'
  if (health >= 60) return 'bg-yellow-500'
  return 'bg-red-500'
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical': return 'bg-red-500'
    case 'high': return 'bg-orange-500'
    case 'medium': return 'bg-yellow-500'
    case 'low': return 'bg-blue-500'
    default: return 'bg-gray-500'
  }
}

export function getStatusBadge(status: string): string {
  switch (status) {
    case 'growing':
    case 'operational':
    case 'completed':
      return 'bg-green-100 text-green-700'
    case 'pending':
      return 'bg-blue-100 text-blue-700'
    case 'mature':
      return 'bg-yellow-100 text-yellow-700'
    case 'harvested':
      return 'bg-gray-100 text-gray-700'
    case 'skipped':
    case 'at_risk':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

export function getWeatherIcon(condition: string): string {
  switch (condition?.toLowerCase()) {
    case 'sunny':
    case 'clear':
      return '☀️'
    case 'cloudy':
    case 'overcast':
      return '☁️'
    case 'rainy':
    case 'rain':
      return '🌧️'
    case 'windy':
      return '💨'
    case 'stormy':
    case 'thunderstorm':
      return '⛈️'
    default:
      return '🌤️'
  }
}

export function getGrowthStageProgress(stage: string): number {
  switch (stage?.toLowerCase()) {
    case 'germination': return 20
    case 'vegetative': return 40
    case 'flowering': return 60
    case 'fruiting': return 80
    case 'harvest': return 100
    default: return 0
  }
}

export const growthStages = ['germination', 'vegetative', 'flowering', 'fruiting', 'harvest']

export const cropTypes = ['vegetable', 'grain', 'fruit', 'cash_crop']
export const seasons = ['kharif', 'rabi', 'zaid']
export const soilTypes = ['clay', 'loamy', 'sandy', 'silt']
export const sprayTypes = ['pesticide', 'herbicide', 'fungicide', 'foliar']
export const fertilizerTypes = ['organic', 'chemical', 'bio', 'NPK']
export const irrigationMethods = ['drip', 'sprinkler', 'flood', 'manual']
export const financialCategories = ['seeds', 'fertilizer', 'irrigation', 'labor', 'spray', 'harvest', 'sale', 'equipment']
