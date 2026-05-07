'use client'

import { usePathname } from 'next/navigation'

export default function LogoutButton() {
  const pathname = usePathname()

  if (pathname === '/login') return null

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  return (
    <button
      onClick={handleLogout}
      className="absolute top-3 right-4 z-50 text-xs text-slate-400 hover:text-slate-600 active:text-slate-800 font-medium"
    >
      ログアウト
    </button>
  )
}
