import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const produto = await prisma.produto.findUnique({
      where: { id },
      include: {
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
      preco: parseFloat(produto.preco.toString()),
    })
  } catch (error) {
    console.error('Erro ao buscar produto:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar produto' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { nome, descricao, categoria, preco, ativo, imagens } = body

    const dataToUpdate: any = {}

    if (nome !== undefined) dataToUpdate.nome = nome
    if (descricao !== undefined) dataToUpdate.descricao = descricao
    if (categoria !== undefined) dataToUpdate.categoria = categoria
    if (preco !== undefined) dataToUpdate.preco = parseFloat(preco)
    if (ativo !== undefined) dataToUpdate.ativo = ativo

    // Se imagens foram enviadas, deletar as antigas e criar novas
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
        imagens: {
          orderBy: {
            ordem: 'asc',
          },
        },
      },
    })

    return NextResponse.json({
      ...produto,
      preco: parseFloat(produto.preco.toString()),
    })
  } catch (error) {
    console.error('Erro ao atualizar produto:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar produto' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.produto.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar produto:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar produto' },
      { status: 500 }
    )
  }
}
