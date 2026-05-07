import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

type Params = { params: Promise<{ id: string }> }

export async function GET(_: Request, { params }: Params) {
  const { id } = await params
  const db = createServiceClient()
  const { data, error } = await db
    .from('expeditions')
    .select(`*, car_assignments(*, household:households(*))`)
    .eq('id', id)
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params
  const db = createServiceClient()
  const body = await request.json()
  const { data, error } = await db
    .from('expeditions')
    .update({
      date: body.date,
      destination: body.destination,
      destination_address: body.destination_address ?? null,
      is_local: body.is_local ?? false,
      distance_km: body.distance_km,
      use_highway: body.use_highway ?? false,
      entry_ic: body.entry_ic ?? null,
      exit_ic: body.exit_ic ?? null,
      highway_toll_one_way: body.highway_toll_one_way ?? 0,
      notes: body.notes ?? null,
    })
    .eq('id', id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_: Request, { params }: Params) {
  const { id } = await params
  const db = createServiceClient()
  const { error } = await db.from('expeditions').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
