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

    // 🔧 Correção: tipar corretamente sem type helper complexo
    const produtosSerializados = produtos.map((produto) => ({
      id: produto.id,
      nome: produto.nome,
      descricao: produto.descricao,
      categoriaId: produto.categoriaId,
      preco: parseFloat(produto.preco.toString()),
      imagemUrl: produto.imagens[0]?.url || produto.imagemUrl || null,
      ativo: produto.ativo,
      createdAt: produto.createdAt,
      updatedAt: produto.updatedAt,
      imagens: produto.imagens,
      categoria: produto.categoria,
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
    const { nome, descricao, categoriaId, preco, imagens, imagemUrl } = body

    if (!nome || !preco) {
      return NextResponse.json(
        { error: 'Nome e preço são obrigatórios' },
        { status: 400 }
      )
    }

    const imagensData = imagens?.length > 0
      ? imagens.map((img: any, index: number) => ({
          url: img.url,
          ordem: index,
          principal: index === 0,
        }))
      : imagemUrl
      ? [{
          url: imagemUrl,
          ordem: 0,
          principal: true,
        }]
      : []

    const produto = await prisma.produto.create({
      data: {
        nome,
        descricao,
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

    return NextResponse.json({
      ...produto,
      preco: parseFloat(produto.preco.toString()),
    })
  } catch (error) {
    console.error('Erro ao criar produto:', error)
    return NextResponse.json(
      { error: 'Erro ao criar produto' },
      { status: 500 }
    )
  }
}
