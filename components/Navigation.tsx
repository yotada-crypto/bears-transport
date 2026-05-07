'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/expeditions', label: '遠征登録', icon: '🧳' },
  { href: '/monthly', label: '月次精算', icon: '📊' },
  { href: '/households', label: '配車登録', icon: '🚗' },
  { href: '/settings', label: '設定', icon: '⚙️' },
]

export default function Navigation() {
  const pathname = usePathname()

  if (pathname === '/login') return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 safe-bottom z-50">
      <div className="max-w-lg mx-auto flex">
        {navItems.map(({ href, label, icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center py-2 gap-0.5 text-xs font-medium transition-colors ${
                active ? 'text-blue-700' : 'text-slate-500'
              }`}
            >
              <span className="text-xl">{icon}</span>
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
