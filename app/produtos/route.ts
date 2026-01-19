import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoria = searchParams.get('categoria')

    const produtos = await prisma.produto.findMany({
      where: {
        ativo: true,
        ...(categoria && categoria !== 'todos' ? { categoria } : {}),
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(produtos)
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar produtos' },
      { status: 500 }
    )
  }
}
