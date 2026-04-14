interface TransportRate {
  state: string
  vehicleType: string
  capacityQuintal: number
  baseRatePerKm: number
  loadingCharge: number
  unloadingCharge: number
  roadType: string
}

const DEFAULT_RATES: TransportRate[] = [
  { state: 'Maharashtra', vehicleType: 'tractor_trolley', capacityQuintal: 50, baseRatePerKm: 12, loadingCharge: 150, unloadingCharge: 100, roadType: 'state_road' },
  { state: 'Maharashtra', vehicleType: 'mini_truck', capacityQuintal: 100, baseRatePerKm: 18, loadingCharge: 200, unloadingCharge: 150, roadType: 'highway' },
  { state: 'Maharashtra', vehicleType: 'medium_truck', capacityQuintal: 200, baseRatePerKm: 25, loadingCharge: 300, unloadingCharge: 200, roadType: 'highway' },
  { state: 'Maharashtra', vehicleType: 'large_truck', capacityQuintal: 400, baseRatePerKm: 30, loadingCharge: 500, unloadingCharge: 300, roadType: 'highway' },
  { state: 'Punjab', vehicleType: 'tractor_trolley', capacityQuintal: 50, baseRatePerKm: 10, loadingCharge: 120, unloadingCharge: 80, roadType: 'state_road' },
  { state: 'Punjab', vehicleType: 'large_truck', capacityQuintal: 400, baseRatePerKm: 30, loadingCharge: 500, unloadingCharge: 300, roadType: 'highway' },
  { state: 'Karnataka', vehicleType: 'tractor_trolley', capacityQuintal: 50, baseRatePerKm: 11, loadingCharge: 130, unloadingCharge: 90, roadType: 'state_road' },
  { state: 'Karnataka', vehicleType: 'medium_truck', capacityQuintal: 200, baseRatePerKm: 22, loadingCharge: 280, unloadingCharge: 180, roadType: 'highway' },
  { state: 'Madhya Pradesh', vehicleType: 'tractor_trolley', capacityQuintal: 50, baseRatePerKm: 10, loadingCharge: 120, unloadingCharge: 80, roadType: 'state_road' },
  { state: 'Madhya Pradesh', vehicleType: 'medium_truck', capacityQuintal: 200, baseRatePerKm: 20, loadingCharge: 250, unloadingCharge: 150, roadType: 'highway' },
  { state: 'Uttar Pradesh', vehicleType: 'tractor_trolley', capacityQuintal: 50, baseRatePerKm: 9, loadingCharge: 100, unloadingCharge: 70, roadType: 'state_road' },
  { state: 'Uttar Pradesh', vehicleType: 'medium_truck', capacityQuintal: 200, baseRatePerKm: 18, loadingCharge: 220, unloadingCharge: 140, roadType: 'highway' },
  { state: 'Rajasthan', vehicleType: 'tractor_trolley', capacityQuintal: 50, baseRatePerKm: 10, loadingCharge: 110, unloadingCharge: 75, roadType: 'state_road' },
  { state: 'Rajasthan', vehicleType: 'medium_truck', capacityQuintal: 200, baseRatePerKm: 20, loadingCharge: 250, unloadingCharge: 160, roadType: 'highway' },
  { state: 'Gujarat', vehicleType: 'tractor_trolley', capacityQuintal: 50, baseRatePerKm: 11, loadingCharge: 130, unloadingCharge: 90, roadType: 'state_road' },
  { state: 'Gujarat', vehicleType: 'medium_truck', capacityQuintal: 200, baseRatePerKm: 22, loadingCharge: 280, unloadingCharge: 180, roadType: 'highway' },
]

function getVehicleType(distanceKm: number, quantityQuintals: number): string {
  if (distanceKm > 100 || quantityQuintals > 200) return 'large_truck'
  if (distanceKm > 50 || quantityQuintals > 100) return 'medium_truck'
  if (distanceKm > 25 || quantityQuintals > 50) return 'mini_truck'
  return 'tractor_trolley'
}

export function calculateTransportCost(
  distanceKm: number,
  quantityQuintals: number,
  state: string,
  hasOwnTransport: boolean = false
): {
  vehicleType: string
  transportCost: number
  loadingCost: number
  unloadingCost: number
  ratePerKm: number
} {
  const vehicleType = getVehicleType(distanceKm, quantityQuintals)
  const rates = DEFAULT_RATES.find(
    (r) => r.state.toLowerCase() === state.toLowerCase() && r.vehicleType === vehicleType
  ) || DEFAULT_RATES.find((r) => r.vehicleType === vehicleType) || DEFAULT_RATES[0]

  if (hasOwnTransport) {
    return {
      vehicleType,
      transportCost: distanceKm * rates.baseRatePerKm * 0.4,
      loadingCost: 0,
      unloadingCost: 0,
      ratePerKm: rates.baseRatePerKm * 0.4,
    }
  }

  return {
    vehicleType,
    transportCost: distanceKm * rates.baseRatePerKm,
    loadingCost: rates.loadingCharge,
    unloadingCost: rates.unloadingCharge,
    ratePerKm: rates.baseRatePerKm,
  }
}

export function calculateDeal(
  pricePerQuintal: number,
  quantityQuintals: number,
  distanceKm: number,
  state: string,
  buyerType: string,
  hasOwnTransport: boolean = false
) {
  const transport = calculateTransportCost(distanceKm, quantityQuintals, state, hasOwnTransport)

  const grossAmount = pricePerQuintal * quantityQuintals
  const commissionPercent = buyerType === 'mandi' ? 2.0 : 0
  const commissionAmount = grossAmount * (commissionPercent / 100)
  const weighingCharges = quantityQuintals * 5
  const totalDeductions = transport.transportCost + transport.loadingCost + transport.unloadingCost + commissionAmount + weighingCharges
  const netProfitInHand = grossAmount - totalDeductions

  return {
    grossAmount,
    transportCostTotal: transport.transportCost,
    loadingCost: transport.loadingCost,
    unloadingCost: transport.unloadingCost,
    mandiCommissionPercent: commissionPercent,
    mandiCommissionAmount: commissionAmount,
    weighingCharges,
    totalDeductions,
    netProfitInHand,
    netPerQuintal: netProfitInHand / quantityQuintals,
    vehicleType: transport.vehicleType,
    ratePerKm: transport.ratePerKm,
  }
}
