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
        categoria: true,
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
      categoria: produto.categoria?.nome || 'Sem categoria',
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
    const { nome, descricao, categoriaId, preco, ativo, imagens } = body

    console.log('📝 Atualizando produto:', { id, nome, imagensCount: imagens?.length })

    const dataToUpdate: any = {}
    
    if (nome !== undefined) dataToUpdate.nome = nome
    if (descricao !== undefined) dataToUpdate.descricao = descricao
    if (categoriaId !== undefined) dataToUpdate.categoriaId = categoriaId
    if (preco !== undefined) dataToUpdate.preco = parseFloat(preco)
    if (ativo !== undefined) dataToUpdate.ativo = ativo

    if (imagens && Array.isArray(imagens)) {
      console.log('📸 Atualizando imagens...')
      
      await prisma.produtoImagem.deleteMany({
        where: { produtoId: id },
      })

      if (imagens.length > 0) {
        await prisma.produtoImagem.createMany({
          data: imagens.map((img: any, index: number) => ({
            produtoId: id,
            url: img.url,
            ordem: img.ordem ?? index,
            principal: img.principal ?? (index === 0),
          })),
        })
      }
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
        categoria: true,
      },
    })

    console.log('✅ Produto atualizado com', produto.imagens.length, 'imagens')

    return NextResponse.json({
      ...produto,
      preco: parseFloat(produto.preco.toString()),
    })
  } catch (error) {
    console.error('❌ Erro ao atualizar produto:', error)
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

    await prisma.produto.update({
      where: { id },
      data: { ativo: false },
    })

    return NextResponse.json({ 
      success: true,
      message: 'Produto desativado com sucesso' 
    })
  } catch (error) {
    console.error('Erro ao desativar produto:', error)
    return NextResponse.json(
      { error: 'Erro ao desativar produto' },
      { status: 500 }
    )
  }
}
