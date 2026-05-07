import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

const FALLBACK_ADDRESS = '神奈川県横浜市青葉区美しが丘西３丁目６２'

interface RoutesRoute {
  distanceMeters?: number
}

function distanceKm(route: RoutesRoute): number {
  return Math.round(((route.distanceMeters ?? 0) / 1000) * 10) / 10
}

export async function POST(request: Request) {
  const { destination } = await request.json()
  if (!destination) return NextResponse.json({ error: '目的地が未入力です' }, { status: 400 })

  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 })

  const db = createServiceClient()
  const { data: settingsRows } = await db.from('settings').select('key,value').eq('key', 'departure_address')
  const originAddress = settingsRows?.[0]?.value ?? FALLBACK_ADDRESS

  const baseBody = {
    origin: { address: originAddress },
    destination: { address: destination },
    travelMode: 'DRIVE',
    routingPreference: 'TRAFFIC_UNAWARE',
    languageCode: 'ja',
  }

  const [highwayRes, regularRes] = await Promise.all([
    fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'routes.distanceMeters',
      },
      body: JSON.stringify({ ...baseBody, routeModifiers: { avoidTolls: false } }),
    }),
    fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'routes.distanceMeters',
      },
      body: JSON.stringify({
        ...baseBody,
        routeModifiers: { avoidTolls: true, avoidHighways: true },
      }),
    }),
  ])

  const [highwayJson, regularJson] = await Promise.all([
    highwayRes.json(),
    regularRes.json(),
  ])

  const highwayRoute: RoutesRoute | null = highwayJson.routes?.[0] ?? null
  const regularRoute: RoutesRoute | null = regularJson.routes?.[0] ?? null

  if (!highwayRoute && !regularRoute) {
    return NextResponse.json({ error: 'ルートが見つかりませんでした' }, { status: 404 })
  }

  return NextResponse.json({
    highway: highwayRoute ? { distance_km: distanceKm(highwayRoute) } : null,
    regular: regularRoute ? { distance_km: distanceKm(regularRoute) } : null,
  })
}
