import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Buscar categoria por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const categoria = await prisma.categoria.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            produtos: true,
          },
        },
      },
    })

    if (!categoria) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(categoria)
  } catch (error) {
    console.error('Erro ao buscar categoria:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar categoria' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar categoria
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { nome, descricao, ativo, ordem } = body

    const categoria = await prisma.categoria.update({
      where: { id },
      data: {
        nome,
        descricao,
        ativo,
        ordem: ordem ? parseInt(ordem) : undefined,
      },
    })

    return NextResponse.json(categoria)
  } catch (error: any) {
    console.error('Erro ao atualizar categoria:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      )
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Já existe uma categoria com este nome' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao atualizar categoria' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir categoria
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verificar se há produtos usando esta categoria
    const produtosCount = await prisma.produto.count({
      where: { categoriaId: id },
    })

    if (produtosCount > 0) {
      return NextResponse.json(
        { error: `Não é possível excluir. Existem ${produtosCount} produto(s) usando esta categoria.` },
        { status: 400 }
      )
    }

    await prisma.categoria.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Categoria excluída com sucesso' })
  } catch (error: any) {
    console.error('Erro ao excluir categoria:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao excluir categoria' },
      { status: 500 }
    )
  }
}
