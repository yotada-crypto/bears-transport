import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { ceilToUnit } from '@/lib/calculations'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body: { gas_amount?: number; highway_amount?: number; parking_amount?: number } = await request.json()
  const db = createServiceClient()

  const [{ data: current, error: fetchErr }, { data: settingsRows }] = await Promise.all([
    db.from('car_assignments').select('gas_amount, highway_amount, parking_amount').eq('id', id).single(),
    db.from('settings').select('key,value'),
  ])
  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 404 })

  const settings: Record<string, string> = {}
  for (const row of settingsRows ?? []) settings[row.key] = row.value
  const roundingUnit = parseInt(settings.rounding_unit ?? '10') || 10

  const new_gas = body.gas_amount ?? current.gas_amount
  const new_highway = body.highway_amount ?? current.highway_amount
  const new_parking = body.parking_amount ?? (current.parking_amount ?? 0)
  const new_total = ceilToUnit(new_gas + new_highway + new_parking, roundingUnit)

  const { data, error } = await db
    .from('car_assignments')
    .update({ gas_amount: new_gas, highway_amount: new_highway, parking_amount: new_parking, total_amount: new_total })
    .eq('id', id)
    .select(`*, household:households(*)`)
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = createServiceClient()
  const { error } = await db.from('car_assignments').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
