import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { clienteId, dataEntrega, horaEntrega, enderecoEntrega, observacoes, valorTotal, itens } = body

    const pedido = await prisma.pedido.create({
      data: {
        clienteId,
        dataEntrega: new Date(dataEntrega),
        horaEntrega,
        enderecoEntrega,
        observacoes,
        valorTotal,
        status: 'PENDENTE',
        itens: {
          create: itens,
        },
      },
      include: {
        itens: {
          include: {
            produto: true,
          },
        },
        cliente: true,
      },
    })

    return NextResponse.json(pedido)
  } catch (error) {
    console.error('Erro ao criar pedido:', error)
    return NextResponse.json(
      { error: 'Erro ao criar pedido' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const pedidos = await prisma.pedido.findMany({
      include: {
        cliente: true,
        itens: {
          include: {
            produto: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(pedidos)
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar pedidos' },
      { status: 500 }
    )
  }
}
