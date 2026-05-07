import type { TripType } from '@/types'

export function ceilToUnit(amount: number, unit: number): number {
  if (unit <= 1) return Math.ceil(amount)
  return Math.ceil(amount / unit) * unit
}

export function calcGasAmount(
  distance_km: number,
  gas_price_per_km: number,
  trip_type: TripType
): number {
  const multiplier = trip_type === 'round_trip' ? 2 : 1
  return Math.round(distance_km * gas_price_per_km * multiplier)
}

export function calcHighwayAmount(
  highway_toll_one_way: number,
  trip_type: TripType
): number {
  const multiplier = trip_type === 'round_trip' ? 2 : 1
  return Math.round(highway_toll_one_way * multiplier)
}

export function calcTotalAmount(gas_amount: number, highway_amount: number): number {
  return gas_amount + highway_amount
}

export function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString('ja-JP')}`
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })
}

export function getYearMonth(dateStr: string): string {
  return dateStr.slice(0, 7)
}

export function formatYearMonth(ym: string): string {
  const [y, m] = ym.split('-')
  return `${y}年${parseInt(m)}月`
}
