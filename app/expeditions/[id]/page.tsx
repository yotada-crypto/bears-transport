'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import type { ExpeditionWithAssignments, Household, TripType } from '@/types'
import { formatDate, formatCurrency, calcGasAmount, calcHighwayAmount, calcTotalAmount, ceilToUnit } from '@/lib/calculations'

export default function ExpeditionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [expedition, setExpedition] = useState<ExpeditionWithAssignments | null>(null)
  const [households, setHouseholds] = useState<Household[]>([])
  const [localFee, setLocalFee] = useState(0)
  const [roundingUnit, setRoundingUnit] = useState(10)
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedHousehold, setSelectedHousehold] = useState('')
  const [tripType, setTripType] = useState<TripType>('round_trip')
  const [parkingAmount, setParkingAmount] = useState<number | ''>(0)
  const [adding, setAdding] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<string | null>(null)
  const [editGasValue, setEditGasValue] = useState<number | ''>(0)
  const [editHighwayValue, setEditHighwayValue] = useState<number | ''>(0)
  const [editParkingValue, setEditParkingValue] = useState<number | ''>(0)
  const [savingAssignment, setSavingAssignment] = useState(false)

  const load = async () => {
    const [expRes, hhRes, settingsRes] = await Promise.all([
      fetch(`/api/expeditions/${id}`),
      fetch('/api/households'),
      fetch('/api/settings'),
    ])
    const [expData, hhData, settingsData] = await Promise.all([
      expRes.json(), hhRes.json(), settingsRes.json(),
    ])
    setExpedition(expData)
    setHouseholds(hhData)
    setLocalFee(parseFloat(settingsData.local_fee) || 0)
    setRoundingUnit(parseInt(settingsData.rounding_unit) || 10)
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  const assignedIds = expedition?.car_assignments.map((a) => a.household_id) ?? []
  const availableHouseholds = households.filter((h) => !assignedIds.includes(h.id))

  const parkingNum = parkingAmount === '' ? 0 : parkingAmount
  const previewTotal = expedition
    ? expedition.is_local
      ? ceilToUnit((tripType === 'round_trip' ? localFee : localFee / 2) + parkingNum, roundingUnit)
      : ceilToUnit(calcTotalAmount(
          calcGasAmount(expedition.distance_km, expedition.gas_price_per_km, tripType),
          expedition.use_highway ? calcHighwayAmount(expedition.highway_toll_one_way, tripType) : 0
        ) + parkingNum, roundingUnit)
    : 0

  const handleAdd = async () => {
    if (!selectedHousehold) return
    setAdding(true)
    setError('')
    try {
      const res = await fetch(`/api/expeditions/${id}/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          household_id: selectedHousehold,
          trip_type: tripType,
          parking_amount: parkingAmount === '' ? 0 : parkingAmount,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setShowAddForm(false)
      setSelectedHousehold('')
      setTripType('round_trip')
      setParkingAmount(0)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : '追加に失敗しました')
    } finally {
      setAdding(false)
    }
  }

  const handleDeleteAssignment = async (assignmentId: string) => {
    setDeleting(assignmentId)
    try {
      await fetch(`/api/assignments/${assignmentId}`, { method: 'DELETE' })
      await load()
    } finally {
      setDeleting(null)
    }
  }

  const handleSaveAssignment = async (assignmentId: string) => {
    setSavingAssignment(true)
    try {
      const res = await fetch(`/api/assignments/${assignmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gas_amount: editGasValue === '' ? 0 : editGasValue,
          highway_amount: editHighwayValue === '' ? 0 : editHighwayValue,
          parking_amount: editParkingValue === '' ? 0 : editParkingValue,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setEditingAssignment(null)
      await load()
    } finally {
      setSavingAssignment(false)
    }
  }

  const handleDeleteExpedition = async () => {
    await fetch(`/api/expeditions/${id}`, { method: 'DELETE' })
    router.push('/expeditions')
  }

  if (loading) return <div className="text-center py-20 text-slate-400">読み込み中...</div>
  if (!expedition) return <div className="text-center py-20 text-red-500">遠征が見つかりません</div>

  const totalPayout = expedition.car_assignments.reduce((s, a) => s + a.total_amount, 0)

  return (
    <div>
      <header className="bg-blue-800 text-white px-4 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => router.back()} className="text-blue-200 text-2xl">‹</button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold truncate">{expedition.destination}</h1>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                expedition.is_local
                  ? 'bg-green-400 text-green-900'
                  : 'bg-orange-400 text-orange-900'
              }`}>
                {expedition.is_local ? '区内' : '区外'}
              </span>
            </div>
            <p className="text-blue-200 text-sm">{formatDate(expedition.date)}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 bg-blue-900/50 rounded-xl p-3 text-center text-sm">
          {expedition.is_local ? (
            <>
              <div>
                <p className="text-blue-300 text-xs">種別</p>
                <p className="font-bold">区内</p>
              </div>
              <div>
                <p className="text-blue-300 text-xs">料金体系</p>
                <p className="font-bold">固定</p>
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="text-blue-300 text-xs">距離</p>
                <p className="font-bold">{expedition.distance_km} km</p>
              </div>
              <div>
                <p className="text-blue-300 text-xs">ルート</p>
                <p className="font-bold">{expedition.use_highway ? '高速' : '一般道'}</p>
              </div>
            </>
          )}
          <div>
            <p className="text-blue-300 text-xs">支払総額</p>
            <p className="font-bold">{formatCurrency(totalPayout)}</p>
          </div>
        </div>

        {!expedition.is_local && expedition.use_highway && (expedition.entry_ic || expedition.exit_ic) && (
          <p className="text-blue-200 text-xs mt-2 text-center">
            {expedition.entry_ic} → {expedition.exit_ic}
            {expedition.highway_toll_one_way > 0 && (
              <span> （ETC片道: ¥{expedition.highway_toll_one_way.toLocaleString()}）</span>
            )}
          </p>
        )}
      </header>

      <div className="p-4 space-y-4">
        {/* 配車一覧 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-slate-800">配車リスト</h2>
            {!showAddForm && availableHouseholds.length > 0 && (
              <button
                onClick={() => setShowAddForm(true)}
                className="text-sm text-blue-700 font-semibold"
              >
                ＋ 追加
              </button>
            )}
          </div>

          {/* 追加フォーム（リストの上に表示） */}
          {showAddForm && (
          <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200 space-y-3 mb-3">
            <h3 className="font-semibold text-blue-800">家庭を追加</h3>

            <div>
              <label className="block text-xs text-slate-600 mb-1">家庭を選択</label>
              <select
                value={selectedHousehold}
                onChange={(e) => setSelectedHousehold(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-3 text-base focus:border-blue-500 focus:outline-none"
              >
                <option value="">選択してください</option>
                {availableHouseholds.map((h) => (
                  <option key={h.id} value={h.id}>{h.name}号</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-600 mb-1">往復 / 片道</label>
              <div className="grid grid-cols-2 gap-2">
                {(['round_trip', 'one_way'] as TripType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTripType(t)}
                    className={`py-3 rounded-xl font-semibold text-sm border-2 transition-colors ${
                      tripType === t
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    {t === 'round_trip' ? '往復' : '片道'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-600 mb-1">駐車場代（任意）</label>
              <div className="flex items-center gap-1 rounded-xl border border-slate-300 px-3 py-3 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-100 bg-white">
                <span className="text-slate-500 text-sm">¥</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={parkingAmount}
                  onChange={(e) => setParkingAmount(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                  min="0"
                  step="10"
                  placeholder="0"
                  className="flex-1 text-base focus:outline-none bg-transparent"
                />
              </div>
            </div>

            {selectedHousehold && (
              <div className="bg-white rounded-xl p-3 text-sm space-y-1 border border-slate-100">
                {expedition.is_local ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-500">区内固定料金</span>
                      <span>{formatCurrency(ceilToUnit(tripType === 'round_trip' ? localFee : localFee / 2, roundingUnit))}</span>
                    </div>
                    {parkingNum > 0 && (
                      <div className="flex justify-between">
                        <span className="text-purple-500">駐車場代</span>
                        <span className="text-purple-600">{formatCurrency(parkingNum)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-blue-700 border-t pt-1 mt-1">
                      <span>支払額</span>
                      <span>{formatCurrency(previewTotal)}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-500">ガソリン代</span>
                      <span>{formatCurrency(calcGasAmount(expedition.distance_km, expedition.gas_price_per_km, tripType))}</span>
                    </div>
                    {expedition.use_highway && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">高速代</span>
                        <span>{formatCurrency(calcHighwayAmount(expedition.highway_toll_one_way, tripType))}</span>
                      </div>
                    )}
                    {parkingNum > 0 && (
                      <div className="flex justify-between">
                        <span className="text-purple-500">駐車場代</span>
                        <span className="text-purple-600">{formatCurrency(parkingNum)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-blue-700 border-t pt-1 mt-1">
                      <span>支払額</span>
                      <span>{formatCurrency(previewTotal)}</span>
                    </div>
                  </>
                )}
              </div>
            )}

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <div className="flex gap-2">
              <button
                onClick={() => { setShowAddForm(false); setError('') }}
                className="flex-1 py-3 rounded-xl border border-slate-300 text-slate-600 font-medium"
              >
                キャンセル
              </button>
              <button
                onClick={handleAdd}
                disabled={!selectedHousehold || adding}
                className="flex-1 py-3 rounded-xl bg-blue-700 text-white font-bold disabled:opacity-50"
              >
                {adding ? '追加中...' : '追加'}
              </button>
            </div>
          </div>
          )}

          {expedition.car_assignments.length === 0 ? (
            <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-2xl">
              <p>まだ配車が登録されていません</p>
              {!showAddForm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="text-blue-600 font-medium mt-1 text-sm"
                >
                  家庭を追加する
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {expedition.car_assignments.map((a) => (
                <div key={a.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900">{a.household?.name}号</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          a.trip_type === 'round_trip'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {a.trip_type === 'round_trip' ? '往復' : '片道'}
                        </span>
                        {expedition.is_local ? (
                          <span className="text-xs text-slate-400">区内固定料金</span>
                        ) : (
                          <span className="text-xs text-slate-400">
                            ガス {formatCurrency(a.gas_amount)} + 高速 {formatCurrency(a.highway_amount)}
                          </span>
                        )}
                        {a.parking_amount > 0 && (
                          <span className="text-xs text-slate-400">+ 駐車 {formatCurrency(a.parking_amount)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-blue-700">{formatCurrency(a.total_amount)}</span>
                      <button
                        onClick={() => handleDeleteAssignment(a.id)}
                        disabled={deleting === a.id}
                        className="text-red-400 hover:text-red-600 text-xl leading-none"
                      >
                        ×
                      </button>
                    </div>
                  </div>

                  {editingAssignment === a.id ? (
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                      <p className="text-xs font-medium text-slate-600">金額を編集</p>
                      {[
                        { label: 'ガソリン代', value: editGasValue, setter: setEditGasValue },
                        { label: '高速代', value: editHighwayValue, setter: setEditHighwayValue },
                        { label: '駐車場代', value: editParkingValue, setter: setEditParkingValue },
                      ].map(({ label, value, setter }) => (
                        <div key={label} className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 w-20 shrink-0">{label}</span>
                          <div className="flex items-center gap-1 flex-1 rounded-xl border border-slate-300 px-3 py-2 focus-within:border-blue-500">
                            <span className="text-slate-500 text-sm">¥</span>
                            <input
                              type="number"
                              inputMode="numeric"
                              value={value}
                              onChange={(e) => setter(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                              min="0"
                              step="10"
                              className="flex-1 text-sm focus:outline-none bg-transparent"
                            />
                          </div>
                        </div>
                      ))}
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => setEditingAssignment(null)}
                          className="flex-1 py-2 rounded-xl border border-slate-300 text-slate-600 text-sm"
                        >
                          取消
                        </button>
                        <button
                          onClick={() => handleSaveAssignment(a.id)}
                          disabled={savingAssignment}
                          className="flex-1 py-2 rounded-xl bg-blue-700 text-white text-sm font-bold disabled:opacity-50"
                        >
                          保存
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <button
                        onClick={() => {
                          setEditingAssignment(a.id)
                          setEditGasValue(a.gas_amount)
                          setEditHighwayValue(a.highway_amount)
                          setEditParkingValue(a.parking_amount)
                        }}
                        className="text-xs text-blue-500 font-medium"
                      >
                        編集
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 削除 */}
        <div className="pt-4 border-t border-slate-200">
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-500 text-sm font-medium"
            >
              この遠征を削除する
            </button>
          ) : (
            <div className="bg-red-50 rounded-2xl p-4 border border-red-200">
              <p className="text-red-700 font-medium mb-3">遠征を削除しますか？配車記録も全て削除されます。</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-300 text-slate-600 text-sm font-medium"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleDeleteExpedition}
                  className="flex-1 py-2 rounded-xl bg-red-600 text-white text-sm font-bold"
                >
                  削除する
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
