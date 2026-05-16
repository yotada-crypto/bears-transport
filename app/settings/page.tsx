'use client'

import { useEffect, useState } from 'react'
import { calcGasAmount, ceilToUnit, formatCurrency } from '@/lib/calculations'

export default function SettingsPage() {
  const [gasPrice, setGasPrice] = useState('15')
  const [localFee, setLocalFee] = useState('500')
  const [roundingUnit, setRoundingUnit] = useState('10')
  const [departureName, setDepartureName] = useState('美しが丘西グラウンド(ベアグラ)')
  const [departureAddress, setDepartureAddress] = useState('神奈川県横浜市青葉区美しが丘西３丁目６２')
  const [editingDeparture, setEditingDeparture] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data.gas_price_per_km) setGasPrice(data.gas_price_per_km)
        if (data.local_fee) setLocalFee(data.local_fee)
        if (data.rounding_unit) setRoundingUnit(data.rounding_unit)
        if (data.departure_name) setDepartureName(data.departure_name)
        if (data.departure_address) setDepartureAddress(data.departure_address)
        setLoading(false)
      })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gas_price_per_km: gasPrice,
        local_fee: localFee,
        rounding_unit: roundingUnit,
        departure_name: departureName,
        departure_address: departureAddress,
      }),
    })
    setSaving(false)
    setSaved(true)
    setEditingDeparture(false)
    setTimeout(() => setSaved(false), 2000)
  }

  const preview10km = calcGasAmount(10, parseFloat(gasPrice) || 0, 'round_trip')
  const preview30km = calcGasAmount(30, parseFloat(gasPrice) || 0, 'round_trip')
  const localFeeNum = parseFloat(localFee) || 0
  const roundingUnitNum = parseInt(roundingUnit) || 10

  return (
    <div>
      <header className="bg-blue-800 text-white px-4 pt-12 pb-4">
        <h1 className="text-xl font-bold">⚙️ 設定</h1>
        <p className="text-blue-200 text-sm mt-0.5">アプリの基本設定</p>
      </header>

      <div className="p-4 space-y-4">
        {/* 出発地点 */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-700">出発地点</h2>
            {!loading && !editingDeparture && (
              <button
                onClick={() => setEditingDeparture(true)}
                className="text-sm text-blue-600 font-medium"
              >
                編集
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-slate-400 text-sm">読み込み中...</div>
          ) : editingDeparture ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">名称</label>
                <input
                  type="text"
                  value={departureName}
                  onChange={(e) => { setDepartureName(e.target.value); setSaved(false) }}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">住所（距離計算に使用）</label>
                <input
                  type="text"
                  value={departureAddress}
                  onChange={(e) => { setDepartureAddress(e.target.value); setSaved(false) }}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none"
                />
              </div>
              <button
                onClick={() => setEditingDeparture(false)}
                className="text-sm text-slate-500 font-medium"
              >
                キャンセル
              </button>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="font-medium text-slate-800">{departureName}</p>
              <p className="text-sm text-slate-500 mt-0.5">{departureAddress}</p>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-slate-400 text-sm text-center py-4">読み込み中...</div>
        ) : (
          <>
            {/* 区内遠征費 */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <h2 className="font-semibold text-slate-700 mb-1">区内遠征費（固定）</h2>
              <p className="text-xs text-slate-400 mb-3">
                区内遠征の場合、距離に関係なくこの金額を支給します<br />
                片道の場合はこの金額の半額になります
              </p>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">¥</span>
                <input
                  type="number"
                  value={localFee}
                  onChange={(e) => { setLocalFee(e.target.value); setSaved(false) }}
                  min="0"
                  step="100"
                  className="w-32 rounded-xl border border-slate-300 px-4 py-3 text-base text-center focus:border-blue-500 focus:outline-none"
                />
                <span className="text-slate-600 font-medium">円 / 台（往復）</span>
              </div>
              <div className="mt-3 bg-green-50 rounded-xl p-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">往復（1台）</span>
                  <span className="font-medium text-green-700">{formatCurrency(ceilToUnit(localFeeNum, roundingUnitNum))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">片道（1台）</span>
                  <span className="font-medium text-green-700">{formatCurrency(ceilToUnit(localFeeNum / 2, roundingUnitNum))}</span>
                </div>
              </div>
            </div>

            {/* 切り上げ単位 */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <h2 className="font-semibold text-slate-700 mb-1">料金の切り上げ単位</h2>
              <p className="text-xs text-slate-400 mb-3">
                支払い金額を指定した単位で切り上げます（四捨五入ではなく常に切り上げ）<br />
                ※ 変更後に新規登録した配車から適用されます。過去の記録には影響しません。
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: '1', label: '1円単位' },
                  { value: '10', label: '10円単位' },
                  { value: '100', label: '100円単位' },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => { setRoundingUnit(value); setSaved(false) }}
                    className={`py-3 rounded-xl font-semibold text-sm border-2 transition-colors ${
                      roundingUnit === value
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="mt-3 bg-slate-50 rounded-xl p-3 text-xs text-slate-500">
                例: 計算結果が ¥153 の場合 →&nbsp;
                {roundingUnit === '1' && '¥153（そのまま）'}
                {roundingUnit === '10' && '¥160（10円切り上げ）'}
                {roundingUnit === '100' && '¥200（100円切り上げ）'}
              </div>
            </div>

            {/* ガソリン単価 */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <h2 className="font-semibold text-slate-700 mb-1">ガソリン単価（区外用）</h2>
              <p className="text-xs text-slate-400 mb-3">
                ガソリン代 = 距離 × 単価 × 2（往復）<br />
                ※ 変更後に新規登録した配車から適用されます。過去の記録には影響しません。
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={gasPrice}
                  onChange={(e) => { setGasPrice(e.target.value); setSaved(false) }}
                  min="1"
                  max="100"
                  step="0.5"
                  className="w-28 rounded-xl border border-slate-300 px-4 py-3 text-base text-center focus:border-blue-500 focus:outline-none"
                />
                <span className="text-slate-600 font-medium">円 / km</span>
              </div>
              <div className="mt-3 bg-slate-50 rounded-xl p-3 space-y-1 text-sm">
                <p className="text-xs text-slate-500 mb-2">計算例（往復）</p>
                <div className="flex justify-between">
                  <span className="text-slate-600">10 km の場合</span>
                  <span className="font-medium">{formatCurrency(preview10km)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">30 km の場合</span>
                  <span className="font-medium">{formatCurrency(preview30km)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3 bg-blue-700 text-white font-bold rounded-xl disabled:opacity-50"
            >
              {saving ? '保存中...' : saved ? '✓ 保存しました' : '保存する'}
            </button>
          </>
        )}

        <div className="text-center text-xs text-slate-400 py-2">
          <p>⚾ Bears遠征費精算アプリ v1.0</p>
        </div>
      </div>
    </div>
  )
}
