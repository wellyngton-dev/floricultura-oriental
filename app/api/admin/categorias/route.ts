import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Listar todas as categorias
export async function GET() {
  try {
    const categorias = await prisma.categoria.findMany({
      orderBy: { ordem: 'asc' },
      include: {
        _count: {
          select: { produtos: true }
        }
      }
    })

    return NextResponse.json(categorias)
  } catch (error) {
    console.error('Erro ao buscar categorias:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar categorias' },
      { status: 500 }
    )
  }
}

// POST - Criar nova categoria
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nome, descricao, ordem } = body

    if (!nome) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      )
    }

    const categoria = await prisma.categoria.create({
      data: {
        nome,
        descricao,
        ordem: ordem || 0,
      },
    })

    return NextResponse.json(categoria, { status: 201 })
  } catch (error: any) {
    console.error('Erro ao criar categoria:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Já existe uma categoria com esse nome' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao criar categoria' },
      { status: 500 }
    )
  }
}
