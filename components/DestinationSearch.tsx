'use client'

import { useState, useRef, useEffect } from 'react'
import type { PlaceSuggestion, RouteOption } from '@/types'

interface Props {
  onRouteSelected: (destination: string, route: RouteOption, destinationAddress: string) => void
}

export default function DestinationSearch({ onRouteSelected }: Props) {
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([])
  const [selectedPlace, setSelectedPlace] = useState<PlaceSuggestion | null>(null)
  const [routes, setRoutes] = useState<{ highway: RouteOption | null; regular: RouteOption | null } | null>(null)
  const [selectedType, setSelectedType] = useState<'highway' | 'regular' | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (input.length < 2 || selectedPlace) {
      setSuggestions([])
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/maps/autocomplete?input=${encodeURIComponent(input)}`)
      const data = await res.json()
      setSuggestions(Array.isArray(data) ? data : [])
    }, 400)
  }, [input, selectedPlace])

  const handleSelect = async (place: PlaceSuggestion) => {
    setSelectedPlace(place)
    setInput(place.main_text)
    setSuggestions([])
    setRoutes(null)
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/maps/directions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination: place.description }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'ルート取得に失敗しました')
      setRoutes(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ルート取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleRouteSelect = (type: 'highway' | 'regular') => {
    if (!routes || !selectedPlace) return
    const route = routes[type]
    if (!route) return
    setSelectedType(type)
    onRouteSelected(selectedPlace.main_text, { ...route, type }, selectedPlace.description)
  }

  const handleReset = () => {
    setInput('')
    setSelectedPlace(null)
    setRoutes(null)
    setSelectedType(null)
    setError('')
    setSuggestions([])
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700">遠征先</label>

      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            if (selectedPlace) setSelectedPlace(null)
          }}
          placeholder="例: 横浜スタジアム、伊勢原市民球場"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        {selectedPlace && (
          <button
            type="button"
            onClick={handleReset}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xl"
          >
            ×
          </button>
        )}
        {suggestions.length > 0 && (
          <ul className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
            {suggestions.map((s) => (
              <li key={s.place_id}>
                <button
                  type="button"
                  onClick={() => handleSelect(s)}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0"
                >
                  <div className="font-medium text-slate-900">{s.main_text}</div>
                  <div className="text-xs text-slate-500 mt-0.5 truncate">{s.description}</div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="animate-spin">⟳</span> ルート取得中...
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {routes && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">ルートを選択してください</p>

          {routes.highway && (
            <button
              type="button"
              onClick={() => handleRouteSelect('highway')}
              className={`w-full text-left rounded-xl border-2 px-4 py-3 transition-colors ${
                selectedType === 'highway'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 bg-white hover:border-blue-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`font-semibold ${selectedType === 'highway' ? 'text-blue-800' : 'text-slate-700'}`}>🛣 高速道路利用</span>
                <span className={`font-bold ${selectedType === 'highway' ? 'text-blue-700' : 'text-slate-700'}`}>{routes.highway.distance_km} km</span>
              </div>
            </button>
          )}

          {routes.regular && (
            <button
              type="button"
              onClick={() => handleRouteSelect('regular')}
              className={`w-full text-left rounded-xl border-2 px-4 py-3 transition-colors ${
                selectedType === 'regular'
                  ? 'border-slate-500 bg-slate-100'
                  : 'border-slate-200 bg-white hover:border-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">🛤 一般道路</span>
                <span className="font-bold text-slate-700">{routes.regular.distance_km} km</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">高速料金なし</div>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
