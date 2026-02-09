import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const produtos = await prisma.produto.findMany({
      include: {
        categoria: {
          select: {
            id: true,
            nome: true,
          },
        },
        imagens: {
          select: {
            id: true,
            url: true,
            principal: true,
            ordem: true,
          },
          orderBy: {
            ordem: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // 🔧 Formatar resposta garantindo todos os campos
    const produtosFormatados = produtos.map((produto) => ({
      id: produto.id,
      nome: produto.nome || 'Produto sem nome',
      descricao: produto.descricao || '',
      categoria: produto.categoria?.nome || 'Sem categoria',
      categoriaId: produto.categoriaId,
      preco: Number(produto.preco),
      ativo: produto.ativo,
      imagemUrl: 
        produto.imagens.find((img) => img.principal)?.url || 
        produto.imagens[0]?.url || 
        null,
      imagens: produto.imagens,
    }))

    return NextResponse.json(produtosFormatados)
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar produtos' },
      { status: 500 }
    )
  }
}
