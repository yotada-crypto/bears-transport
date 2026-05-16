export type TripType = 'round_trip' | 'one_way'

export interface Household {
  id: string
  name: string
  created_at: string
}

export interface Expedition {
  id: string
  date: string
  destination: string
  destination_address: string | null
  is_local: boolean
  distance_km: number
  use_highway: boolean
  entry_ic: string | null
  exit_ic: string | null
  highway_toll_one_way: number
  gas_price_per_km: number
  notes: string | null
  created_at: string
}

export interface CarAssignment {
  id: string
  expedition_id: string
  household_id: string
  trip_type: TripType
  gas_amount: number
  highway_amount: number
  parking_amount: number
  total_amount: number
  created_at: string
  household?: Household
}

export interface ExpeditionWithAssignments extends Expedition {
  car_assignments: (CarAssignment & { household: Household })[]
}

export interface RouteOption {
  type: 'highway' | 'regular'
  distance_km: number
}

export interface MonthlyDetail {
  expedition_id: string
  expedition_date: string
  destination: string
  trip_type: TripType
  gas_amount: number
  highway_amount: number
  parking_amount: number
  total_amount: number
}

export interface MonthlyHouseholdSummary {
  household_id: string
  household_name: string
  total_amount: number
  round_trip_count: number
  one_way_count: number
  details: MonthlyDetail[]
}

export interface PlaceSuggestion {
  place_id: string
  description: string
  main_text: string
}
