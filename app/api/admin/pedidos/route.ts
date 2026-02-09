import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const pedidos = await prisma.pedido.findMany({
      include: {
        itens: {
          include: {
            produto: {
              select: {
                nome: true,
                categoria: {
                  select: {
                    nome: true,
                  },
                },
              },
            },
          },
        },
        cliente: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // 🔧 Formatar resposta para compatibilidade com o dashboard
    const pedidosFormatados = pedidos.map((pedido) => ({
      id: pedido.id,
      compradorNome: pedido.compradorNome,
      destinatarioNome: pedido.destinatarioNome,
      dataEntrega: pedido.dataEntrega,
      valorTotal: Number(pedido.valorTotal),
      status: pedido.status,
      createdAt: pedido.createdAt.toISOString(),
      itens: pedido.itens.map((item) => ({
        id: item.id,
        quantidade: item.quantidade,
        precoUnit: Number(item.precoUnit),
        produto: {
          nome: item.produto.nome,
          categoria: item.produto.categoria?.nome || 'Sem categoria',
        },
      })),
    }))

    return NextResponse.json(pedidosFormatados)
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar pedidos' },
      { status: 500 }
    )
  }
}
