'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function LogoutButton() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    setScrolled(false)
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [pathname])

  if (pathname === '/login' || scrolled) return null

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  return (
    <button
      onClick={handleLogout}
      className="fixed top-3 right-3 z-50 text-xs text-white/60 hover:text-white active:text-white/80 font-medium"
    >
      ログアウト
    </button>
  )
}
