import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { criarPreferenciaPagamento, ItemPagamento } from '@/lib/mercadopago'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { pedidoId } = body

    if (!pedidoId) {
      return NextResponse.json({ error: 'Pedido ID é obrigatório' }, { status: 400 })
    }

    console.log('💳 Criando pagamento para pedido:', pedidoId)

    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
      include: {
        itens: {
          include: {
            produto: true,
          },
        },
      },
    })

    if (!pedido) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    if (pedido.pagamentoId) {
      return NextResponse.json(
        { error: 'Pedido já possui pagamento associado' },
        { status: 400 }
      )
    }

    const items: ItemPagamento[] = pedido.itens.map((item) => ({
      id: item.produto.id,
      title: item.produto.nome,
      description: item.produto.descricao || undefined,
      category_id: 'flowers',
      quantity: item.quantidade,
      currency_id: 'BRL',
      unit_price: parseFloat(item.precoUnit.toString()),
    }))

    // 🔧 Simplificar payer - remover email se for undefined
    const payerData: any = {
      name: pedido.compradorNome.split(' ')[0] || 'Cliente',
      surname: pedido.compradorNome.split(' ').slice(1).join(' ') || 'Floricultura',
    }

    // Adicionar telefone se válido
    if (pedido.compradorTelefone) {
      const telefoneNumeros = pedido.compradorTelefone.replace(/\D/g, '')
      if (telefoneNumeros.length >= 10) {
        payerData.phone = {
          area_code: telefoneNumeros.substring(2, 4),
          number: telefoneNumeros.substring(4),
        }
      }
    }

    // Adicionar email APENAS se existir
    if (pedido.compradorEmail) {
      payerData.email = pedido.compradorEmail
    }

    // Adicionar endereço
    payerData.address = {
      zip_code: pedido.cep.replace(/\D/g, ''),
      street_name: pedido.endereco,
      street_number: pedido.numero,
    }

    console.log('📦 Dados do pagamento:', { items, payer: payerData })

    const preferencia = await criarPreferenciaPagamento({
      items,
      payer: payerData,
      external_reference: pedidoId,
      statement_descriptor: 'FLORICULTURA',
      expires: false, // 🔧 Desabilitar expiração por enquanto
    })

    console.log('✅ Preferência criada:', preferencia.id)

    await prisma.pedido.update({
      where: { id: pedidoId },
      data: {
        pagamentoId: preferencia.id,
        statusPagamento: 'PENDENTE',
      },
    })

    return NextResponse.json({
      success: true,
      preferenceId: preferencia.id,
      initPoint: preferencia.init_point,
      sandboxInitPoint: preferencia.sandbox_init_point,
    })
  } catch (error) {
    console.error('❌ Erro ao criar pagamento:', error)
    return NextResponse.json(
      {
        error: 'Erro ao processar pagamento',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
