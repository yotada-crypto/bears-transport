import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { id, password } = await request.json()

  if (
    id === process.env.AUTH_ID &&
    password === process.env.AUTH_PASSWORD
  ) {
    const res = NextResponse.json({ ok: true })
    res.cookies.set('bears-auth', process.env.AUTH_SECRET!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 60分
      path: '/',
    })
    return res
  }

  return NextResponse.json(
    { error: 'IDまたはパスワードが違います' },
    { status: 401 }
  )
}
