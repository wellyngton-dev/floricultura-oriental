import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { buscarPagamento, verificarStatusPagamento } from '@/lib/mercadopago'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    console.log('📩 Webhook Mercado Pago recebido:', body)

    // Validação básica
    if (body.type !== 'payment') {
      return NextResponse.json({ message: 'Event type not supported' }, { status: 200 })
    }

    const paymentId = body.data?.id

    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID not found' }, { status: 400 })
    }

    // Buscar informações do pagamento
    const pagamento = await buscarPagamento(paymentId)

    console.log('💳 Dados do pagamento:', {
      id: pagamento.id,
      status: pagamento.status,
      external_reference: pagamento.external_reference,
    })

    const pedidoId = pagamento.external_reference

    if (!pedidoId) {
      console.error('❌ Pedido ID não encontrado na referência externa')
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    // Verificar status
    const { status: statusPedido, mensagem } = verificarStatusPagamento(pagamento.status || '')

    // Atualizar pedido
    await prisma.pedido.update({
      where: { id: pedidoId },
      data: {
        statusPagamento: statusPedido,
        pagamentoMercadoPagoId: String(pagamento.id),
        pagamentoStatus: pagamento.status,
        pagamentoDetalhes: JSON.stringify(pagamento),
        ...(statusPedido === 'APROVADO' && {
          status: 'CONFIRMADO',
          dataConfirmacao: new Date(),
        }),
      },
    })

    console.log(`✅ Pedido ${pedidoId} atualizado: ${statusPedido}`)

    // TODO: Enviar notificação para admin
    // TODO: Enviar email para cliente

    return NextResponse.json({ success: true, message: mensagem })
  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error)
    return NextResponse.json(
      { error: 'Erro ao processar webhook', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}
