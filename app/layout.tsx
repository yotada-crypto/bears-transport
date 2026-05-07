import type { Metadata } from 'next'
import './globals.css'
import Navigation from '@/components/Navigation'

export const metadata: Metadata = {
  title: 'Bears遠征費精算アプリ',
  description: 'Bears少年野球チーム 遠征費精算アプリ',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-slate-50 text-slate-900 min-h-screen">
        <div className="max-w-lg mx-auto min-h-screen flex flex-col">
          <main className="flex-1 pb-20">{children}</main>
          <Navigation />
        </div>
      </body>
    </html>
  )
}
