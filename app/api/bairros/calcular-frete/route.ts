import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Calcular frete baseado no bairro
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bairroId } = body

    if (!bairroId) {
      return NextResponse.json(
        { error: 'ID do bairro é obrigatório' },
        { status: 400 }
      )
    }

    const bairro = await prisma.bairro.findUnique({
      where: { 
        id: bairroId,
        ativo: true,
      },
      select: {
        id: true,
        nome: true,
        valorFrete: true,
      },
    })

    if (!bairro) {
      return NextResponse.json(
        { error: 'Bairro não encontrado ou inativo' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      bairro: bairro.nome,
      valorFrete: bairro.valorFrete,
    })
  } catch (error) {
    console.error('Erro ao calcular frete:', error)
    return NextResponse.json(
      { error: 'Erro ao calcular frete' },
      { status: 500 }
    )
  }
}
