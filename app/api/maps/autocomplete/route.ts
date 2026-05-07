import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const input = searchParams.get('input')
  if (!input || input.length < 2) return NextResponse.json([])

  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 })

  const params = new URLSearchParams({
    input,
    language: 'ja',
    components: 'country:jp',
    location: '35.5571,139.5372',
    radius: '100000',
    key: apiKey,
  })

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params}`
  )
  const json = await res.json()

  if (json.status !== 'OK' && json.status !== 'ZERO_RESULTS') {
    return NextResponse.json({ error: json.error_message ?? json.status }, { status: 500 })
  }

  const suggestions = (json.predictions ?? []).map((p: {
    place_id: string
    description: string
    structured_formatting: { main_text: string }
  }) => ({
    place_id: p.place_id,
    description: p.description,
    main_text: p.structured_formatting?.main_text ?? p.description,
  }))

  return NextResponse.json(suggestions)
}
