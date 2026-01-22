import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const pedido = await prisma.pedido.findUnique({
      where: { id },
      include: {
        itens: {
          include: {
            produto: true,
          },
        },
      },
    })

    if (!pedido) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ...pedido,
      valorTotal: parseFloat(pedido.valorTotal.toString()),
      itens: pedido.itens.map((item) => ({
        ...item,
        precoUnit: parseFloat(item.precoUnit.toString()),
      })),
    })
  } catch (error) {
    console.error('Erro ao buscar pedido:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar pedido' },
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
    const { status } = body

    if (!status) {
      return NextResponse.json(
        { error: 'Status é obrigatório' },
        { status: 400 }
      )
    }

    const statusValidos = [
      'PENDENTE',
      'CONFIRMADO',
      'EM_PREPARO',
      'SAIU_ENTREGA',
      'ENTREGUE',
      'CANCELADO',
    ]

    if (!statusValidos.includes(status)) {
      return NextResponse.json(
        { error: 'Status inválido' },
        { status: 400 }
      )
    }

    const pedido = await prisma.pedido.update({
      where: { id },
      data: { status },
      include: {
        itens: {
          include: {
            produto: true,
          },
        },
      },
    })

    return NextResponse.json({
      ...pedido,
      valorTotal: parseFloat(pedido.valorTotal.toString()),
    })
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar pedido' },
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

    await prisma.pedido.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar pedido:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar pedido' },
      { status: 500 }
    )
  }
}
