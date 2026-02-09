import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Listar todos os bairros
export async function GET() {
  try {
    const bairros = await prisma.bairro.findMany({
      orderBy: { nome: 'asc' },
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
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nome, cidade, estado, valorFrete } = body

    if (!nome || !valorFrete) {
      return NextResponse.json(
        { error: 'Nome e valor do frete são obrigatórios' },
        { status: 400 }
      )
    }

    const bairro = await prisma.bairro.create({
      data: {
        nome,
        cidade: cidade || 'São Carlos',
        estado: estado || 'SP',
        valorFrete: parseFloat(valorFrete),
      },
    })

    return NextResponse.json(bairro, { status: 201 })
  } catch (error: any) {
    console.error('Erro ao criar bairro:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Já existe um bairro com esse nome' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao criar bairro' },
      { status: 500 }
    )
  }
}
