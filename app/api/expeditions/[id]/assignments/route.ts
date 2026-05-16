import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { calcGasAmount, calcHighwayAmount, calcTotalAmount, ceilToUnit } from '@/lib/calculations'
import type { TripType } from '@/types'

type Params = { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: Params) {
  const { id: expedition_id } = await params
  const db = createServiceClient()
  const { household_id, trip_type, parking_amount: parkingInput }: {
    household_id: string
    trip_type: TripType
    parking_amount?: number
  } = await request.json()
  const parking_amount = parkingInput ?? 0

  const { data: expedition, error: expErr } = await db
    .from('expeditions')
    .select('distance_km, use_highway, highway_toll_one_way, gas_price_per_km, is_local')
    .eq('id', expedition_id)
    .single()
  if (expErr) return NextResponse.json({ error: expErr.message }, { status: 404 })

  let gas_amount: number
  let highway_amount: number
  let total_amount: number

  const { data: settingsRows } = await db.from('settings').select('key,value')
  const settings: Record<string, string> = {}
  for (const row of settingsRows ?? []) settings[row.key] = row.value
  const roundingUnit = parseInt(settings.rounding_unit ?? '10') || 10

  if (expedition.is_local) {
    const local_fee = parseFloat(settings.local_fee ?? '0') || 0
    gas_amount = trip_type === 'round_trip'
      ? ceilToUnit(local_fee, roundingUnit)
      : ceilToUnit(local_fee / 2, roundingUnit)
    highway_amount = 0
    total_amount = ceilToUnit(gas_amount + parking_amount, roundingUnit)
  } else {
    gas_amount = calcGasAmount(expedition.distance_km, expedition.gas_price_per_km, trip_type)
    highway_amount = expedition.use_highway
      ? calcHighwayAmount(expedition.highway_toll_one_way, trip_type)
      : 0
    total_amount = ceilToUnit(calcTotalAmount(gas_amount, highway_amount) + parking_amount, roundingUnit)
  }

  const { data, error } = await db
    .from('car_assignments')
    .upsert(
      { expedition_id, household_id, trip_type, gas_amount, highway_amount, parking_amount, total_amount },
      { onConflict: 'expedition_id,household_id' }
    )
    .select(`*, household:households(*)`)
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
