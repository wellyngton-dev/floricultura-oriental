import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Listar bairros ativos (para o cliente escolher)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')

    const bairros = await prisma.bairro.findMany({
      where: {
        ativo: true,
        ...(search && {
          nome: {
            contains: search,
            mode: 'insensitive',
          },
        }),
      },
      orderBy: { nome: 'asc' },
      select: {
        id: true,
        nome: true,
        cidade: true,
        estado: true,
        valorFrete: true,
      },
    })

    return NextResponse.json(bairros)
  } catch (error) {
    console.error('Erro ao buscar bairros:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar bairros' },
      { status: 500 }
    )
  }
}
