import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SESSION_SECONDS = 60 * 60 // 60分

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname === '/icon.svg' ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  const auth = request.cookies.get('bears-auth')
  if (auth?.value !== process.env.AUTH_SECRET) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // リクエストのたびにクッキーを更新してセッションを延長（スライディングセッション）
  const response = NextResponse.next()
  response.cookies.set('bears-auth', process.env.AUTH_SECRET!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_SECONDS,
    path: '/',
  })
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
}
