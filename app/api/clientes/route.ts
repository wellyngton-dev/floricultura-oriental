import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nome, email, telefone } = body

    // Verificar se cliente já existe
    let cliente = await prisma.cliente.findUnique({
      where: { email },
    })

    if (!cliente) {
      cliente = await prisma.cliente.create({
        data: {
          nome,
          email,
          telefone,
        },
      })
    }

    return NextResponse.json(cliente)
  } catch (error) {
    console.error('Erro ao criar cliente:', error)
    return NextResponse.json(
      { error: 'Erro ao criar cliente' },
      { status: 500 }
    )
  }
}
