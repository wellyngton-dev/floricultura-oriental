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

    // ✅ Formatar resposta COM TODOS OS CAMPOS
    const pedidosFormatados = pedidos.map((pedido) => ({
      id: pedido.id,
      
      // Comprador
      compradorNome: pedido.compradorNome,
      compradorEmail: pedido.compradorEmail || '',
      compradorTelefone: pedido.compradorTelefone,
      
      // Destinatário
      destinatarioNome: pedido.destinatarioNome,
      destinatarioTelefone: pedido.destinatarioTelefone,
      
      // Entrega
      dataEntrega: pedido.dataEntrega,
      periodoEntrega: pedido.periodoEntrega,
      tipoEndereco: pedido.tipoEndereco,
      
      // Endereço
      cep: pedido.cep,
      endereco: pedido.endereco,
      numero: pedido.numero,
      complemento: pedido.complemento || '',
      bairro: pedido.bairro,
      cidade: pedido.cidade,
      estado: pedido.estado,
      referencia: pedido.referencia || '',
      
      // Mensagem
      mensagem: pedido.mensagem || '',
      
      // Valores
      valorTotal: Number(pedido.valorTotal),
      valorProdutos: Number(pedido.valorProdutos),
      valorFrete: Number(pedido.valorFrete),
      
      // Status
      status: pedido.status,
      statusPagamento: pedido.statusPagamento,
      
      // Datas
      createdAt: pedido.createdAt.toISOString(),
      updatedAt: pedido.updatedAt.toISOString(),
      dataConfirmacao: pedido.dataConfirmacao?.toISOString() || null,
      dataPagamento: pedido.dataPagamento?.toISOString() || null,
      
      // Pagamento PIX
      metodoPagamento: pedido.metodoPagamento,
      pixCopiaCola: pedido.pixCopiaCola || null,
      comprovantePagamento: pedido.comprovantePagamento || null,
      
      // Itens
      itens: pedido.itens.map((item) => ({
        id: item.id,
        quantidade: item.quantidade,
        precoUnit: Number(item.precoUnit),
        produto: {
          nome: item.produto.nome,
          categoria: item.produto.categoria?.nome || 'Sem categoria',
        },
      })),
      
      // Cliente (se houver)
      cliente: pedido.cliente,
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
