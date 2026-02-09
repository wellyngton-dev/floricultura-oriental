import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Buscar categoria por ID
export async function GET(
  request: Request,
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
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { nome, descricao, ativo } = body

    if (!nome) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      )
    }

    const categoria = await prisma.categoria.update({
      where: { id },
      data: {
        nome,
        descricao,
        ativo,
      },
    })

    return NextResponse.json(categoria)
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar categoria' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir categoria
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verificar se há produtos vinculados
    const produtosVinculados = await prisma.produto.count({
      where: { categoriaId: id },
    })

    if (produtosVinculados > 0) {
      return NextResponse.json(
        { error: `Não é possível excluir. Existem ${produtosVinculados} produto(s) vinculado(s) a esta categoria.` },
        { status: 400 }
      )
    }

    await prisma.categoria.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Categoria excluída com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir categoria:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir categoria' },
      { status: 500 }
    )
  }
}
