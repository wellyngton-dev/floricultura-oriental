import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const produtos = await prisma.produto.findMany({
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

    const produtosSerializados = produtos.map(produto => ({
      ...produto,
      preco: parseFloat(produto.preco.toString()),
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
