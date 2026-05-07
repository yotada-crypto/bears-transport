'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DestinationSearch from '@/components/DestinationSearch'
import type { RouteOption } from '@/types'
import { calcGasAmount, calcHighwayAmount, calcTotalAmount, ceilToUnit, formatCurrency } from '@/lib/calculations'

const DEFAULT_GAS = 15

export default function NewExpeditionPage() {
  const router = useRouter()
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [isLocal, setIsLocal] = useState<boolean | null>(null)
  const [localFee, setLocalFee] = useState(0)
  const [roundingUnit, setRoundingUnit] = useState(10)

  // 区内用
  const [localDestination, setLocalDestination] = useState('')

  // 区外用
  const [destination, setDestination] = useState('')
  const [destinationAddress, setDestinationAddress] = useState('')
  const [route, setRoute] = useState<RouteOption | null>(null)
  const [entryIc, setEntryIc] = useState('')
  const [exitIc, setExitIc] = useState('')
  const [tollOneWay, setTollOneWay] = useState<number | ''>('')

  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        setLocalFee(parseFloat(data.local_fee) || 0)
        setRoundingUnit(parseInt(data.rounding_unit) || 10)
      })
  }, [])

  const handleRouteSelected = (dest: string, r: RouteOption, addr: string) => {
    setDestination(dest)
    setRoute(r)
    setDestinationAddress(addr)
    setEntryIc('')
    setExitIc('')
    setTollOneWay('')
  }

  // 区外計算
  const gasPerCar = route ? calcGasAmount(route.distance_km, DEFAULT_GAS, 'round_trip') : 0
  const tollNum = tollOneWay === '' ? 0 : tollOneWay
  const tollPerCar = route?.type === 'highway' && tollNum > 0
    ? calcHighwayAmount(tollNum, 'round_trip')
    : 0
  const totalPerCar = ceilToUnit(calcTotalAmount(gasPerCar, tollPerCar), roundingUnit)

  const canSubmit = isLocal === true
    ? localDestination.trim().length > 0
    : isLocal === false
      ? route !== null
      : false

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setError('')
    try {
      const body = isLocal
        ? {
            date,
            destination: localDestination.trim(),
            destination_address: null,
            is_local: true,
            distance_km: 0,
            use_highway: false,
            entry_ic: null,
            exit_ic: null,
            highway_toll_one_way: 0,
            notes: notes || null,
          }
        : {
            date,
            destination,
            destination_address: destinationAddress || null,
            is_local: false,
            distance_km: route!.distance_km,
            use_highway: route!.type === 'highway',
            entry_ic: route!.type === 'highway' ? entryIc || null : null,
            exit_ic: route!.type === 'highway' ? exitIc || null : null,
            highway_toll_one_way: route!.type === 'highway' ? (tollOneWay === '' ? 0 : tollOneWay) : 0,
            notes: notes || null,
          }

      const res = await fetch('/api/expeditions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? '登録に失敗しました')
      router.push(`/expeditions/${data.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : '登録に失敗しました')
      setSubmitting(false)
    }
  }

  return (
    <div>
      <header className="bg-blue-800 text-white px-4 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-blue-200 text-2xl">‹</button>
        <h1 className="text-xl font-bold">遠征を登録</h1>
      </header>

      <form onSubmit={handleSubmit} className="p-4 space-y-5">
        {/* 日付 */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">日付</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        {/* 区内 / 区外 選択 */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">区内 / 区外</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => { setIsLocal(true); setRoute(null) }}
              className={`py-4 rounded-2xl font-bold text-base border-2 transition-colors ${
                isLocal === true
                  ? 'border-green-500 bg-green-500 text-white'
                  : 'border-slate-200 bg-white text-slate-700'
              }`}
            >
              🏠 区内
            </button>
            <button
              type="button"
              onClick={() => { setIsLocal(false); setLocalDestination('') }}
              className={`py-4 rounded-2xl font-bold text-base border-2 transition-colors ${
                isLocal === false
                  ? 'border-orange-500 bg-orange-500 text-white'
                  : 'border-slate-200 bg-white text-slate-700'
              }`}
            >
              📍 区外
            </button>
          </div>
        </div>

        {/* 区内フォーム */}
        {isLocal === true && (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">遠征先</label>
              <input
                type="text"
                value={localDestination}
                onChange={(e) => setLocalDestination(e.target.value)}
                placeholder="例: 青葉台公園グラウンド"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
              <h2 className="font-semibold text-green-800 mb-3">区内固定料金</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">往復（1台）</span>
                  <span className="font-bold text-green-700">{formatCurrency(ceilToUnit(localFee, roundingUnit))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">片道（1台）</span>
                  <span className="font-bold text-green-700">{formatCurrency(ceilToUnit(localFee / 2, roundingUnit))}</span>
                </div>
              </div>
              {localFee === 0 && (
                <p className="text-xs text-amber-600 mt-2">※ 設定タブで区内遠征費を設定してください</p>
              )}
            </div>
          </>
        )}

        {/* 区外フォーム */}
        {isLocal === false && (
          <>
            <DestinationSearch onRouteSelected={handleRouteSelected} />

            {route && (
              <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                <h2 className="font-semibold text-slate-700">ルート詳細</h2>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">距離</span>
                  <span className="font-medium">{route.distance_km} km</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">ルート</span>
                  <span className={`font-medium ${route.type === 'highway' ? 'text-blue-700' : 'text-slate-700'}`}>
                    {route.type === 'highway' ? '🛣 高速道路' : '🛤 一般道路'}
                  </span>
                </div>

                {route.type === 'highway' && (
                  <>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">乗るインター</label>
                      <input
                        type="text"
                        value={entryIc}
                        onChange={(e) => setEntryIc(e.target.value)}
                        placeholder="例: 横浜青葉IC"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">降りるインター</label>
                      <input
                        type="text"
                        value={exitIc}
                        onChange={(e) => setExitIc(e.target.value)}
                        placeholder="例: 伊勢原IC"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">ETC料金（片道）</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">¥</span>
                        <input
                          type="number"
                          value={tollOneWay}
                          onChange={(e) => setTollOneWay(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                          min="0"
                          step="10"
                          className="w-full rounded-lg border border-slate-300 pl-7 pr-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="border-t border-slate-200 pt-3 mt-2">
                  <p className="text-xs text-slate-500 mb-2">1台・往復あたりの試算</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">ガソリン代</span>
                      <span>{formatCurrency(gasPerCar)}</span>
                    </div>
                    {route.type === 'highway' && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">高速代（往復）</span>
                        <span>{formatCurrency(tollPerCar)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-blue-700 border-t border-slate-200 pt-1 mt-1">
                      <span>合計</span>
                      <span>{formatCurrency(totalPerCar)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* メモ */}
        {isLocal !== null && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">メモ（任意）</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="試合内容など"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none"
            />
          </div>
        )}

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting || !canSubmit}
          className="w-full bg-blue-700 text-white font-bold py-4 rounded-2xl text-base disabled:opacity-50 disabled:cursor-not-allowed active:bg-blue-800"
        >
          {submitting ? '登録中...' : '登録して配車を設定'}
        </button>
      </form>
    </div>
  )
}
