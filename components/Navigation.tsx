'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Luggage, ReceiptText, Car, BookOpen, SlidersHorizontal } from 'lucide-react'

const navItems = [
  { href: '/expeditions', label: '遠征一覧', Icon: Luggage },
  { href: '/monthly', label: '月次精算', Icon: ReceiptText },
  { href: '/households', label: '車登録', Icon: Car },
  { href: '/help', label: '使い方', Icon: BookOpen },
  { href: '/settings', label: '設定', Icon: SlidersHorizontal },
]

export default function Navigation() {
  const pathname = usePathname()

  if (pathname === '/login') return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 safe-bottom z-50">
      <div className="max-w-lg mx-auto flex">
        {navItems.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center py-2 gap-0.5 text-xs font-medium transition-colors ${
                active ? 'text-blue-700' : 'text-slate-400'
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
