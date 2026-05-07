'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { ExpeditionWithAssignments } from '@/types'
import { formatDate, formatCurrency } from '@/lib/calculations'

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
  const [expeditions, setExpeditions] = useState<ExpeditionWithAssignments[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/expeditions')
      .then((r) => r.json())
      .then(setExpeditions)
      .finally(() => setLoading(false))
  }, [])

  const totalPerExpedition = (exp: ExpeditionWithAssignments) =>
    exp.car_assignments.reduce((s, a) => s + a.total_amount, 0)

  return (
    <div className="flex flex-col h-full">
      <header className="bg-blue-800 text-white px-4 pt-12 pb-4 flex items-center justify-between">
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
      </header>

      <div className="flex-1 p-4 space-y-3">
        {loading ? (
          <div className="text-center py-12 text-slate-400">読み込み中...</div>
        ) : expeditions.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p className="text-4xl mb-3">⚾</p>
            <p>遠征が登録されていません</p>
            <Link href="/expeditions/new" className="text-blue-600 font-medium mt-2 block">
              最初の遠征を登録する →
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
