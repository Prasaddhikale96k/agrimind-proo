export type CropGrade = 'A' | 'B' | 'C'
export type BuyerType = 'mandi' | 'private_buyer' | 'fpo' | 'export_house' | 'cold_storage' | 'mill'
export type DealBadge = 'BEST_DEAL' | 'HIGHEST_PRICE' | 'NEAREST' | 'MOST_TRUSTED' | 'FASTEST_PAYMENT' | 'LOWEST_COST'
export type PriceTrend = 'rising' | 'falling' | 'stable'
export type TransportOption = 'own_vehicle' | 'hire_transport' | 'buyer_pickup'

export interface CropOption {
  name: string
  nameHindi: string
  emoji: string
  category: string
  avgPrice: number
  trend: PriceTrend
  trendPercent: number
}

export interface FassalDealSearch {
  id: string
  cropName: string
  cropVariety?: string
  cropGrade: CropGrade
  quantityKg: number
  quantityQuintals: number
  moistureContent: number
  farmerLat: number
  farmerLng: number
  farmerAddress: string
  farmerDistrict: string
  farmerState: string
  maxDistanceKm: number
  transportOption: TransportOption
  status: 'pending' | 'scanning' | 'completed' | 'failed'
}

export interface DealResult {
  id: string
  searchId: string
  rank: number
  buyerType: BuyerType
  buyerName: string
  buyerLocation: string
  buyerLat: number
  buyerLng: number
  distanceKm: number
  buyerRating: number
  buyerVerified: boolean
  buyerPhone?: string
  pricePerQuintal: number
  totalGrossAmount: number
  transportCostTotal: number
  loadingCost: number
  unloadingCost: number
  mandiCommissionAmount: number
  weighingCharges: number
  totalDeductions: number
  netProfitInHand: number
  netPerQuintal: number
  aiTrustScore: number
  aiRecommendation: string
  aiPros: string[]
  aiCons: string[]
  dealBadge?: DealBadge
  paymentTerms: string
  paymentMethod: string[]
  dateReported: string
  variety: string
  mandiPrice: number
  trendPercent: number
}

export interface AIMarketAnalysis {
  overallSummary: string
  bestDealReason: string
  priceTrend: PriceTrend
  bestTimeToSell: string
  risks: string[]
  transportTip: string
}

export interface MandiPrice {
  id: string
  mandiName: string
  state: string
  district: string
  cropName: string
  modalPrice: number
  minPrice: number
  maxPrice: number
  priceDate: string
  priceTrend: PriceTrend
}

export interface SearchHistory {
  id: string
  cropName: string
  quantityQuintals: number
  farmerDistrict: string
  farmerState: string
  dealsFound: number
  bestDealProfit: number
  createdAt: string
  status: string
}
