import { NextResponse } from 'next/server'
import { ADMIN_PASSWORD } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    if (password === ADMIN_PASSWORD) {
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao fazer login' }, { status: 500 })
  }
}
