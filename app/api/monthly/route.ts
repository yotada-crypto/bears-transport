import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import type { MonthlyHouseholdSummary } from '@/types'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const year = searchParams.get('year')
  const month = searchParams.get('month')

  if (!year || !month) return NextResponse.json({ error: 'year, month は必須です' }, { status: 400 })

  const startDate = `${year}-${month.padStart(2, '0')}-01`
  const endDate = new Date(parseInt(year), parseInt(month), 0).toISOString().slice(0, 10)

  const db = createServiceClient()
  const { data, error } = await db
    .from('car_assignments')
    .select(`
      id, trip_type, gas_amount, highway_amount, parking_amount, total_amount,
      household:households(id, name),
      expedition:expeditions!inner(id, date, destination)
    `)
    .gte('expedition.date', startDate)
    .lte('expedition.date', endDate)
    .order('expedition(date)', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const summaryMap: Record<string, MonthlyHouseholdSummary> = {}

  for (const row of data ?? []) {
    const h = row.household as unknown as { id: string; name: string }
    const exp = row.expedition as unknown as { id: string; date: string; destination: string }
    if (!h || !exp) continue

    if (!summaryMap[h.id]) {
      summaryMap[h.id] = {
        household_id: h.id,
        household_name: h.name,
        total_amount: 0,
        round_trip_count: 0,
        one_way_count: 0,
        details: [],
      }
    }
    const s = summaryMap[h.id]
    s.total_amount += row.total_amount
    if (row.trip_type === 'round_trip') s.round_trip_count++
    else s.one_way_count++
    s.details.push({
      expedition_id: exp.id,
      expedition_date: exp.date,
      destination: exp.destination,
      trip_type: row.trip_type,
      gas_amount: row.gas_amount,
      highway_amount: row.highway_amount,
      parking_amount: row.parking_amount ?? 0,
      total_amount: row.total_amount,
    })
  }

  const summaries = Object.values(summaryMap).sort((a, b) =>
    a.household_name.localeCompare(b.household_name, 'ja')
  )
  return NextResponse.json(summaries)
}
