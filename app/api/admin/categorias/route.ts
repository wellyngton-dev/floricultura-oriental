import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Listar todas as categorias
export async function GET() {
  try {
    const categorias = await prisma.categoria.findMany({
      include: {
        _count: {
          select: {
            produtos: true,
          },
        },
      },
      orderBy: {
        nome: 'asc',
      },
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
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nome, descricao, ativo } = body

    if (!nome) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se já existe categoria com esse nome
    const categoriaExistente = await prisma.categoria.findFirst({
      where: {
        nome: {
          equals: nome,
          mode: 'insensitive',
        },
      },
    })

    if (categoriaExistente) {
      return NextResponse.json(
        { error: 'Já existe uma categoria com esse nome' },
        { status: 400 }
      )
    }

    const categoria = await prisma.categoria.create({
      data: {
        nome,
        descricao,
        ativo: ativo ?? true,
      },
    })

    return NextResponse.json(categoria, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar categoria:', error)
    return NextResponse.json(
      { error: 'Erro ao criar categoria' },
      { status: 500 }
    )
  }
}
