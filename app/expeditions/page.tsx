'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { ExpeditionWithAssignments } from '@/types'
import { formatDate, formatCurrency, formatYearMonth } from '@/lib/calculations'

function localBadge(exp: ExpeditionWithAssignments) {
  if (exp.is_local) {
    return (
      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">
        🏠 区内
      </span>
    )
  }
  return (
    <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-medium">
      📍 区外
    </span>
  )
}

export default function ExpeditionsPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [expeditions, setExpeditions] = useState<ExpeditionWithAssignments[]>([])
  const [loading, setLoading] = useState(true)

  const load = async (y: number, m: number) => {
    setLoading(true)
    setExpeditions([])
    const res = await fetch(`/api/expeditions?year=${y}&month=${m}`)
    const data = await res.json()
    setExpeditions(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load(year, month) }, [year, month])

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1

  const totalPerExpedition = (exp: ExpeditionWithAssignments) =>
    exp.car_assignments.reduce((s, a) => s + a.total_amount, 0)

  return (
    <div className="flex flex-col h-full">
      <header className="bg-blue-800 text-white px-4 pt-12 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold">⚾ Bears遠征費精算アプリ</h1>
            <p className="text-blue-200 text-sm mt-0.5">遠征一覧</p>
          </div>
          <Link
            href="/expeditions/new"
            className="bg-white text-blue-800 font-bold px-4 py-2 rounded-xl text-sm shadow"
          >
            ＋ 遠征登録
          </Link>
        </div>

        {/* 月切り替え */}
        <div className="flex items-center justify-between bg-blue-900/50 rounded-xl p-2">
          <button onClick={prevMonth} className="px-4 py-2 text-blue-200 text-xl">‹</button>
          <div className="text-center">
            <p className="font-bold text-lg">{formatYearMonth(`${year}-${String(month).padStart(2, '0')}`)}</p>
            {isCurrentMonth && <p className="text-blue-300 text-xs">今月</p>}
          </div>
          <button onClick={nextMonth} className="px-4 py-2 text-blue-200 text-xl">›</button>
        </div>
      </header>

      <div className="flex-1 p-4 space-y-3">
        {loading ? (
          <div className="text-center py-12 text-slate-400">読み込み中...</div>
        ) : expeditions.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p className="text-4xl mb-3">⚾</p>
            <p>この月の遠征はありません</p>
            <Link href="/expeditions/new" className="text-blue-600 font-medium mt-2 block">
              遠征を登録する →
            </Link>
          </div>
        ) : (
          expeditions.map((exp) => (
            <Link
              key={exp.id}
              href={`/expeditions/${exp.id}`}
              className="block bg-white rounded-2xl shadow-sm border border-slate-100 px-4 py-4 active:bg-slate-50"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 truncate">{exp.destination}</p>
                  {exp.notes && (
                    <p className="text-xs text-slate-500 truncate mt-0.5">{exp.notes}</p>
                  )}
                  <p className="text-sm text-slate-500 mt-0.5">{formatDate(exp.date)}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {localBadge(exp)}
                    {!exp.is_local && <span className="text-xs text-slate-500">{exp.distance_km} km</span>}
                    {exp.use_highway && (
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">高速</span>
                    )}
                    <span className="text-xs text-slate-500">{exp.car_assignments.length} 台</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-blue-700">
                    {formatCurrency(totalPerExpedition(exp))}
                  </p>
                  <p className="text-xs text-slate-400">合計支払</p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
