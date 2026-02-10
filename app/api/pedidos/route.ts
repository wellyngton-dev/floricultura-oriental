import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    console.log('📦 Dados recebidos:', body)

    // Validações
    if (!body.compradorNome || !body.compradorTelefone || !body.destinatarioNome) {
      return NextResponse.json(
        { error: 'Dados obrigatórios faltando' },
        { status: 400 }
      )
    }

    if (!body.itens || body.itens.length === 0) {
      return NextResponse.json(
        { error: 'Pedido deve conter pelo menos um item' },
        { status: 400 }
      )
    }

    // 🔧 Verificar se clienteId existe (se fornecido)
    let clienteIdValido = null
    if (body.clienteId) {
      const clienteExiste = await prisma.cliente.findUnique({
        where: { id: body.clienteId },
      })

      if (clienteExiste) {
        clienteIdValido = body.clienteId
        console.log('✅ Cliente encontrado:', clienteIdValido)
      } else {
        console.log('⚠️ Cliente não encontrado, criando pedido sem vínculo')
      }
    }

    // Validar produtos e calcular total
    let totalPedido = 0
    const itensValidados = []

    for (const item of body.itens) {
      const produto = await prisma.produto.findUnique({
        where: { id: item.produtoId },
      })

      if (!produto) {
        return NextResponse.json(
          { error: `Produto ${item.produtoId} não encontrado` },
          { status: 404 }
        )
      }

      if (!produto.ativo) {
        return NextResponse.json(
          { error: `Produto ${produto.nome} não está disponível` },
          { status: 400 }
        )
      }

      const subtotal = Number(produto.preco) * item.quantidade
      totalPedido += subtotal

      itensValidados.push({
        produtoId: item.produtoId,
        quantidade: item.quantidade,
        precoUnit: Number(produto.preco),
      })
    }

    // Adicionar frete
    const valorFrete = Number(body.valorFrete || 0)
    totalPedido += valorFrete

    console.log('💰 Total calculado:', totalPedido)

    // 🔧 Criar pedido (com ou sem clienteId)
    const pedido = await prisma.pedido.create({
      data: {
        // Comprador
        compradorNome: body.compradorNome,
        compradorEmail: body.compradorEmail,
        compradorTelefone: body.compradorTelefone,

        // Destinatário
        destinatarioNome: body.destinatarioNome,
        destinatarioTelefone: body.destinatarioTelefone,

        // Entrega
        dataEntrega: new Date(body.dataEntrega),
        periodoEntrega: body.periodoEntrega || 'qualquer',
        tipoEndereco: body.tipoEndereco || 'residencial',

        // Endereço
        cep: body.cep,
        endereco: body.endereco,
        numero: body.numero,
        complemento: body.complemento || '',
        bairro: body.bairro,
        cidade: body.cidade,
        estado: body.estado,
        referencia: body.referencia || '',

        // Cliente (opcional)
        clienteId: clienteIdValido, // 🔧 Null se não existir

        // Valores
        valorProdutos: Number(body.valorProdutos),
        valorFrete: valorFrete,
        valorTotal: totalPedido,

        // Mensagem
        mensagem: body.mensagem || '',

        // Status
        status: 'PENDENTE',
        statusPagamento: 'PENDENTE',

        // Itens
        itens: {
          create: itensValidados,
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

    return NextResponse.json(pedido, { status: 201 })
  } catch (error: any) {
    console.error('❌ Erro ao criar pedido:', error)
    return NextResponse.json(
      {
        error: 'Erro ao criar pedido',
        details: error.message
      },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const clienteId = searchParams.get('clienteId')

    const where = clienteId ? { clienteId } : {}

    const pedidos = await prisma.pedido.findMany({
      where,
      include: {
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
