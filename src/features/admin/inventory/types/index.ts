export interface LocationInventory {
  id: string
  name: string
  type: 'hub' | 'terminal'
  address: string
  inventory: {
    diesel: number
    petrol: number
    jet_a1: number
  }
  coordinates?: {
    lat: number
    lng: number
  }
}

export interface InventoryAggregates {
  totalDiesel: number
  totalPetrol: number
  totalJetA1: number
  criticalCount: number
  warningCount: number
}
