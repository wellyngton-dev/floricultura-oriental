import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    console.log('📦 Dados recebidos:', body)

    // VALIDAÇÃO - compradorEmail OPCIONAL
    const camposObrigatorios = [
      'compradorNome',
      'compradorTelefone',
      'destinatarioNome',
      'destinatarioTelefone',
      'dataEntrega',
      'periodoEntrega',
      'tipoEndereco',
      'cep',
      'endereco',
      'numero',
      'bairro',
      'cidade',
      'estado',
      'itens',
    ]

    const camposFaltando = camposObrigatorios.filter((campo) => {
      const valor = body[campo]
      return valor === undefined || valor === null || (typeof valor === 'string' && valor.trim() === '')
    })

    if (camposFaltando.length > 0) {
      console.log('❌ Campos faltando:', camposFaltando)
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando', campos: camposFaltando },
        { status: 400 }
      )
    }

    // Validar itens
    if (!Array.isArray(body.itens) || body.itens.length === 0) {
      return NextResponse.json({ error: 'Nenhum item no pedido' }, { status: 400 })
    }

    // Calcular total
    let totalPedido = 0
    for (const item of body.itens) {
      totalPedido += parseFloat(item.precoUnit) * parseInt(item.quantidade)
    }

    console.log('💰 Total calculado:', totalPedido)

    // Criar pedido
    const pedido = await prisma.pedido.create({
      data: {
        // Comprador
        compradorNome: body.compradorNome,
        compradorEmail: body.compradorEmail || null,
        compradorTelefone: body.compradorTelefone,

        // Destinatário
        destinatarioNome: body.destinatarioNome,
        destinatarioTelefone: body.destinatarioTelefone,

        // Entrega
        dataEntrega: new Date(body.dataEntrega),
        periodoEntrega: body.periodoEntrega,
        tipoEndereco: body.tipoEndereco,

        // Endereço
        cep: body.cep,
        endereco: body.endereco,
        numero: body.numero,
        complemento: body.complemento || '',
        bairro: body.bairro,
        cidade: body.cidade,
        estado: body.estado,
        referencia: body.referencia || '',

        // Cliente (se logado)
        clienteId: body.clienteId || null,

        // Mensagem
        mensagem: body.mensagem || '',

        // 🔧 CORRIGIDO: usar valorTotal ao invés de total
        valorTotal: totalPedido,

        // Status inicial
        status: 'PENDENTE',
        statusPagamento: 'PENDENTE',

        // Itens do pedido
        itens: {
          create: body.itens.map((item: any) => ({
            produtoId: item.produtoId,
            quantidade: item.quantidade,
            precoUnit: parseFloat(item.precoUnit),
          })),
        },
      },
      include: {
        itens: {
          include: {
            produto: true,
          },
        },
      },
    })

    console.log('✅ Pedido criado:', pedido.id)

    return NextResponse.json(
      {
        success: true,
        id: pedido.id,
        total: pedido.valorTotal, // 🔧 Retornar valorTotal
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('❌ Erro ao criar pedido:', error)
    return NextResponse.json(
      {
        error: 'Erro ao criar pedido',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    return NextResponse.json(
      { error: 'Endpoint não implementado' },
      { status: 501 }
    )
  } catch (error) {
    console.error('❌ Erro ao buscar pedidos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar pedidos' },
      { status: 500 }
    )
  }
}
