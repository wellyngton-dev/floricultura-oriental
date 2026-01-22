import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client' // ✅ Adicionar este import

// Type helper
type ProdutoComImagens = Prisma.ProdutoGetPayload<{
  include: { imagens: true }
}>


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoria = searchParams.get('categoria')

    const produtos = await prisma.produto.findMany({
      where: {
        ativo: true,
        ...(categoria && categoria !== 'todos' ? { categoria } : {}),
      },
      include: {
        imagens: {
          orderBy: {
            ordem: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const produtosSerializados = produtos.map((produto: ProdutoComImagens) => ({
      ...produto,
      preco: parseFloat(produto.preco.toString()),
      imagemUrl: produto.imagens[0]?.url || produto.imagemUrl || null,
    }));

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
    const { nome, descricao, categoria, preco, imagens, imagemUrl } = body

    if (!nome || !categoria || !preco) {
      return NextResponse.json(
        { error: 'Nome, categoria e preço são obrigatórios' },
        { status: 400 }
      );
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
        : [];

    const produto = await prisma.produto.create({
      data: {
        nome,
        descricao,
        categoria,
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
