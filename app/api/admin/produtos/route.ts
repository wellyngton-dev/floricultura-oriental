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

    // 🔧 Correção: mapear sem type helper complexo
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
