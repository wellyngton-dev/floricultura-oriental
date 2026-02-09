import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Listar todos os bairros
export async function GET() {
  try {
    const bairros = await prisma.bairro.findMany({
      orderBy: {
        nome: 'asc',
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

// POST - Criar novo bairro
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nome, cidade, estado, valorFrete, ativo } = body

    if (!nome || !cidade || !estado || valorFrete === undefined) {
      return NextResponse.json(
        { error: 'Nome, cidade, estado e valor do frete são obrigatórios' },
        { status: 400 }
      )
    }

    const bairro = await prisma.bairro.create({
      data: {
        nome,
        cidade,
        estado,
        valorFrete,
        ativo: ativo ?? true,
      },
    })

    return NextResponse.json(bairro, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar bairro:', error)
    return NextResponse.json(
      { error: 'Erro ao criar bairro' },
      { status: 500 }
    )
  }
}
