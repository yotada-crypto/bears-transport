import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET() {
  const db = createServiceClient()
  const { data, error } = await db.from('settings').select('*')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const settings: Record<string, string> = {}
  for (const row of data ?? []) settings[row.key] = row.value
  return NextResponse.json(settings)
}

export async function PUT(request: Request) {
  const db = createServiceClient()
  const body = await request.json()

  const updates = Object.entries(body).map(([key, value]) => ({
    key,
    value: String(value),
    updated_at: new Date().toISOString(),
  }))

  const { error } = await db.from('settings').upsert(updates, { onConflict: 'key' })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
