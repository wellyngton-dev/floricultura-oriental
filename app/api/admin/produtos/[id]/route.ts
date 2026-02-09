import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Buscar produto por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const produto = await prisma.produto.findUnique({
      where: { id },
      include: {
        categoria: true,
        imagens: {
          orderBy: {
            ordem: 'asc',
          },
        },
      },
    })

    if (!produto) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ...produto,
      preco: Number(produto.preco),
    })
  } catch (error) {
    console.error('Erro ao buscar produto:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar produto' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar produto
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { nome, descricao, preco, categoriaId, imagemUrl, ativo, imagens } = body

    const dataToUpdate: any = {}

    if (nome !== undefined) dataToUpdate.nome = nome
    if (descricao !== undefined) dataToUpdate.descricao = descricao
    if (preco !== undefined) dataToUpdate.preco = parseFloat(preco)
    if (categoriaId !== undefined) dataToUpdate.categoriaId = categoriaId
    if (imagemUrl !== undefined) dataToUpdate.imagemUrl = imagemUrl
    if (ativo !== undefined) dataToUpdate.ativo = ativo

    // Se imagens foram enviadas, atualizar
    if (imagens && Array.isArray(imagens)) {
      // Deletar imagens antigas
      await prisma.produtoImagem.deleteMany({
        where: { produtoId: id },
      })

      // Criar novas imagens
      await prisma.produtoImagem.createMany({
        data: imagens.map((img: any) => ({
          produtoId: id,
          url: img.url,
          ordem: img.ordem,
          principal: img.principal,
        })),
      })
    }

    const produto = await prisma.produto.update({
      where: { id },
      data: dataToUpdate,
      include: {
        categoria: true,
        imagens: {
          orderBy: {
            ordem: 'asc',
          },
        },
      },
    })

    return NextResponse.json({
      ...produto,
      preco: Number(produto.preco),
    })
  } catch (error: any) {
    console.error('Erro ao atualizar produto:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao atualizar produto' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir produto
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Deletar imagens primeiro (se existirem)
    await prisma.produtoImagem.deleteMany({
      where: { produtoId: id },
    })

    // Deletar o produto
    await prisma.produto.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Produto excluído com sucesso' })
  } catch (error: any) {
    console.error('Erro ao excluir produto:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao excluir produto' },
      { status: 500 }
    )
  }
}
