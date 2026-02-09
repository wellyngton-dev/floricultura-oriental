import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoriaId = searchParams.get('categoria')

    const produtos = await prisma.produto.findMany({
      where: {
        ativo: true,
        ...(categoriaId && categoriaId !== 'todos' ? { categoriaId } : {}),
      },
      include: {
        imagens: {
          orderBy: {
            ordem: 'asc',
          },
        },
        categoria: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const produtosSerializados = produtos.map((produto) => ({
      id: produto.id,
      nome: produto.nome,
      descricao: produto.descricao,
      categoriaId: produto.categoriaId,
      categoria: produto.categoria?.nome || 'Sem categoria',
      preco: parseFloat(produto.preco.toString()),
      imagemUrl: produto.imagens[0]?.url || produto.imagemUrl || null,
      ativo: produto.ativo,
      createdAt: produto.createdAt,
      updatedAt: produto.updatedAt,
      imagens: produto.imagens,
    }))

    return NextResponse.json(produtosSerializados)
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar produtos' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nome, descricao, categoriaId, preco, imagens } = body

    console.log('📦 Criando produto:', { nome, categoriaId, imagensCount: imagens?.length })

    if (!nome || !preco) {
      return NextResponse.json(
        { error: 'Nome e preço são obrigatórios' },
        { status: 400 }
      )
    }

    const imagensData = imagens && Array.isArray(imagens) && imagens.length > 0
      ? imagens.map((img: any, index: number) => ({
          url: img.url,
          ordem: img.ordem ?? index,
          principal: img.principal ?? (index === 0),
        }))
      : []

    console.log('📸 Imagens processadas:', imagensData)

    const produto = await prisma.produto.create({
      data: {
        nome,
        descricao: descricao || '',
        categoriaId,
        preco: parseFloat(preco),
        ativo: true,
        imagens: {
          create: imagensData,
        },
      },
      include: {
        imagens: {
          orderBy: {
            ordem: 'asc',
          },
        },
        categoria: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    })

    console.log('✅ Produto criado com', produto.imagens.length, 'imagens')

    return NextResponse.json({
      ...produto,
      preco: parseFloat(produto.preco.toString()),
    })
  } catch (error) {
    console.error('❌ Erro ao criar produto:', error)
    return NextResponse.json(
      { error: 'Erro ao criar produto' },
      { status: 500 }
    )
  }
}
