'use client'

import { useEffect, useState } from 'react'
import type { Household } from '@/types'

export default function HouseholdsPage() {
  const [households, setHouseholds] = useState<Household[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [error, setError] = useState('')

  const load = async () => {
    const res = await fetch('/api/households')
    setHouseholds(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    setAdding(true)
    setError('')
    try {
      const res = await fetch('/api/households', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setNewName('')
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : '追加に失敗しました')
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/households/${id}`, { method: 'DELETE' })
    setDeleteTarget(null)
    await load()
  }

  return (
    <div>
      <header className="bg-blue-800 text-white px-4 pt-12 pb-4">
        <h1 className="text-xl font-bold">🚗 車登録</h1>
        <p className="text-blue-200 text-sm mt-0.5">車出しできる家庭を登録してください</p>
      </header>

      <div className="p-4 space-y-4">
        {/* 追加フォーム */}
        <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <h2 className="font-semibold text-slate-700 mb-3">家庭を追加</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="例: 田中"
              className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={adding || !newName.trim()}
              className="px-5 py-3 bg-blue-700 text-white font-bold rounded-xl disabled:opacity-50"
            >
              追加
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2">「田中」と入力すると「田中号」と表示されます</p>
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        </form>

        {/* 家庭リスト */}
        <div>
          <h2 className="font-semibold text-slate-700 mb-2">登録済み ({households.length})</h2>
          {loading ? (
            <div className="text-center py-8 text-slate-400">読み込み中...</div>
          ) : households.length === 0 ? (
            <div className="text-center py-8 text-slate-400 bg-white rounded-2xl border border-slate-100">
              <p>まだ登録されていません</p>
            </div>
          ) : (
            <div className="space-y-2">
              {households.map((h) => (
                <div key={h.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-3">
                  {deleteTarget === h.id ? (
                    <div>
                      <p className="text-slate-700 text-sm mb-3">
                        「{h.name}号」を削除しますか？関連する配車記録も影響する場合があります。
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setDeleteTarget(null)}
                          className="flex-1 py-2 rounded-xl border border-slate-300 text-slate-600 text-sm font-medium"
                        >
                          キャンセル
                        </button>
                        <button
                          onClick={() => handleDelete(h.id)}
                          className="flex-1 py-2 rounded-xl bg-red-600 text-white text-sm font-bold"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-900">{h.name}号</span>
                      <button
                        onClick={() => setDeleteTarget(h.id)}
                        className="text-red-400 text-sm hover:text-red-600"
                      >
                        削除
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
