'use client'

import { useEffect, useState } from 'react'
import type { MonthlyHouseholdSummary } from '@/types'
import { formatCurrency, formatYearMonth, formatDate } from '@/lib/calculations'
import { downloadMonthlyPDF } from '@/lib/monthlyPdf'

export default function MonthlyPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [summaries, setSummaries] = useState<MonthlyHouseholdSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [pdfGenerating, setPdfGenerating] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  const load = async (y: number, m: number) => {
    setLoading(true)
    setSummaries([])
    setExpanded(null)
    const res = await fetch(`/api/monthly?year=${y}&month=${m}`)
    const data = await res.json()
    setSummaries(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load(year, month) }, [year, month])

  const totalAll = summaries.reduce((s, h) => s + h.total_amount, 0)

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1

  return (
    <div>
      <header className="bg-blue-800 text-white px-4 pt-12 pb-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold">📊 月次精算</h1>
          {summaries.length > 0 && (
            <button
              onClick={async () => {
                setPdfGenerating(true)
                try { await downloadMonthlyPDF(summaries, year, month) }
                finally { setPdfGenerating(false) }
              }}
              disabled={pdfGenerating}
              className="bg-white text-blue-800 font-bold px-3 py-1.5 rounded-xl text-sm shadow flex items-center gap-1 disabled:opacity-60"
            >
              {pdfGenerating ? '⏳ 生成中...' : '📄 PDF出力'}
            </button>
          )}
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

      <div className="p-4 space-y-3">
        {loading ? (
          <div className="text-center py-12 text-slate-400">読み込み中...</div>
        ) : summaries.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p className="text-3xl mb-2">📭</p>
            <p>この月の記録はありません</p>
          </div>
        ) : (
          <>
            {/* 月合計バナー */}
            <div className="bg-blue-700 text-white rounded-2xl p-4 text-center">
              <p className="text-blue-200 text-sm">月間支払総額</p>
              <p className="text-3xl font-bold mt-1">{formatCurrency(totalAll)}</p>
              <p className="text-blue-200 text-xs mt-1">{summaries.length}家庭に支払い</p>
            </div>

            {/* 家庭別 */}
            {summaries.map((s) => (
              <div key={s.household_id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <button
                  className="w-full px-4 py-4 flex items-center justify-between active:bg-slate-50"
                  onClick={() => setExpanded(expanded === s.household_id ? null : s.household_id)}
                >
                  <div className="text-left">
                    <p className="font-bold text-slate-900">{s.household_name}号</p>
                    <div className="flex items-center gap-2 mt-1">
                      {s.round_trip_count > 0 && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          往復 {s.round_trip_count}回
                        </span>
                      )}
                      {s.one_way_count > 0 && (
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                          片道 {s.one_way_count}回
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-blue-700">{formatCurrency(s.total_amount)}</span>
                    <span className="text-slate-400">{expanded === s.household_id ? '▲' : '▼'}</span>
                  </div>
                </button>

                {expanded === s.household_id && (
                  <div className="border-t border-slate-100 divide-y divide-slate-50">
                    {s.details.map((d) => (
                      <div key={d.expedition_id} className="px-4 py-3 bg-slate-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-slate-800">{d.destination}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{formatDate(d.expedition_date)}</p>
                            <div className="flex gap-2 mt-1">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                d.trip_type === 'round_trip'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-orange-100 text-orange-700'
                              }`}>
                                {d.trip_type === 'round_trip' ? '往復' : '片道'}
                              </span>
                              <span className="text-xs text-slate-400">
                                ガス {formatCurrency(d.gas_amount)} + 高速 {formatCurrency(d.highway_amount)}
                              </span>
                            </div>
                          </div>
                          <span className="font-bold text-blue-700 text-sm">{formatCurrency(d.total_amount)}</span>
                        </div>
                      </div>
                    ))}
                    <div className="px-4 py-3 flex justify-between font-bold bg-blue-50">
                      <span className="text-slate-700">合計</span>
                      <span className="text-blue-700">{formatCurrency(s.total_amount)}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
