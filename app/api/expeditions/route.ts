import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET() {
  const db = createServiceClient()
  const { data, error } = await db
    .from('expeditions')
    .select(`*, car_assignments(*, household:households(*))`)
    .order('date', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const db = createServiceClient()
  const body = await request.json()

  const { data: settings } = await db
    .from('settings')
    .select('key,value')
    .eq('key', 'gas_price_per_km')
    .single()
  const gas_price_per_km = parseFloat(settings?.value ?? '15')

  const { data, error } = await db
    .from('expeditions')
    .insert({
      date: body.date,
      destination: body.destination,
      destination_address: body.destination_address ?? null,
      is_local: body.is_local ?? false,
      distance_km: body.distance_km,
      use_highway: body.use_highway ?? false,
      entry_ic: body.entry_ic ?? null,
      exit_ic: body.exit_ic ?? null,
      highway_toll_one_way: body.highway_toll_one_way ?? 0,
      gas_price_per_km,
      notes: body.notes ?? null,
    })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
