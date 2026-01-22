import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    console.log('📦 Dados recebidos:', JSON.stringify(body, null, 2))

    const {
      compradorNome,
      compradorEmail,
      compradorTelefone,
      destinatarioNome,
      destinatarioTelefone,
      dataEntrega,
      periodoEntrega,
      tipoEndereco,
      cep,
      endereco,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      referencia,
      mensagem,
      itens,
    } = body

    // Validação detalhada
    const camposObrigatorios = {
      compradorNome,
      compradorEmail,
      compradorTelefone,
      destinatarioNome,
      destinatarioTelefone,
      dataEntrega,
      periodoEntrega,
      tipoEndereco,
      cep,
      endereco,
      numero,
      bairro,
      cidade,
      estado,
    }

    const camposFaltando = Object.entries(camposObrigatorios)
      .filter(([_, value]) => !value)
      .map(([key]) => key)

    if (camposFaltando.length > 0) {
      console.error('❌ Campos faltando:', camposFaltando)
      return NextResponse.json(
        { 
          error: 'Dados incompletos',
          camposFaltando 
        },
        { status: 400 }
      )
    }

    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      console.error('❌ Itens inválidos:', itens)
      return NextResponse.json(
        { error: 'Carrinho vazio ou inválido' },
        { status: 400 }
      )
    }

    // Buscar ou criar cliente
    let cliente = await prisma.cliente.findUnique({
      where: { email: compradorEmail },
    })

    if (!cliente) {
      console.log('👤 Criando novo cliente:', compradorEmail)
      cliente = await prisma.cliente.create({
        data: {
          nome: compradorNome,
          email: compradorEmail,
          telefone: compradorTelefone,
        },
      })
    } else {
      console.log('👤 Cliente existente:', cliente.id)
    }

    // Calcular valor total
    const valorTotal = itens.reduce(
      (sum: number, item: any) => sum + parseFloat(item.precoUnit) * item.quantidade,
      0
    )

    console.log('💰 Valor total:', valorTotal)

    // Criar pedido
    const pedido = await prisma.pedido.create({
      data: {
        clienteId: cliente.id,
        compradorNome,
        compradorEmail,
        compradorTelefone,
        destinatarioNome,
        destinatarioTelefone,
        dataEntrega: new Date(dataEntrega),
        periodoEntrega,
        tipoEndereco,
        cep,
        endereco,
        numero,
        complemento: complemento || null,
        bairro,
        cidade,
        estado,
        referencia: referencia || null,
        mensagem: mensagem || null,
        valorTotal,
        status: 'PENDENTE',
        itens: {
          create: itens.map((item: any) => ({
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
        cliente: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    })

    console.log('✅ Pedido criado:', pedido.id)

    return NextResponse.json({
      ...pedido,
      valorTotal: parseFloat(pedido.valorTotal.toString()),
    })
  } catch (error) {
    console.error('❌ Erro ao criar pedido:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao criar pedido',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const pedidos = await prisma.pedido.findMany({
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

    const pedidosSerializados = pedidos.map((pedido) => ({
      ...pedido,
      valorTotal: parseFloat(pedido.valorTotal.toString()),
      itens: pedido.itens.map((item) => ({
        ...item,
        precoUnit: parseFloat(item.precoUnit.toString()),
      })),
    }))

    return NextResponse.json(pedidosSerializados)
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar pedidos' },
      { status: 500 }
    )
  }
}
