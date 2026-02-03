// Tipos
export interface ItemPagamento {
  id: string
  title: string
  description?: string
  picture_url?: string
  category_id?: string
  quantity: number
  currency_id: 'BRL'
  unit_price: number
}

export interface DadosCheckout {
  items: ItemPagamento[]
  payer?: {
    name?: string
    surname?: string
    email?: string
    phone?: {
      area_code?: string
      number?: string
    }
    identification?: {
      type?: string
      number?: string
    }
    address?: {
      zip_code?: string
      street_name?: string
      street_number?: string
    }
  }
  back_urls?: {
    success?: string
    failure?: string
    pending?: string
  }
  auto_return?: 'approved' | 'all'
  payment_methods?: {
    excluded_payment_methods?: Array<{ id: string }>
    excluded_payment_types?: Array<{ id: string }>
    installments?: number
  }
  notification_url?: string
  statement_descriptor?: string
  external_reference?: string
  expires?: boolean
  expiration_date_from?: string
  expiration_date_to?: string
}

/**
 * Criar preferência de pagamento no Mercado Pago usando API REST
 */
export async function criarPreferenciaPagamento(dados: DadosCheckout) {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN

  if (!accessToken) {
    throw new Error('MERCADOPAGO_ACCESS_TOKEN não configurado')
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Corpo da requisição
    const body: any = {
      items: dados.items,
      back_urls: {
        success: `${baseUrl}/pagamento/sucesso`,
        failure: `${baseUrl}/pagamento/falha`,
        pending: `${baseUrl}/pagamento/pendente`,
      },
      notification_url: `${baseUrl}/api/mercadopago/webhook`,
      external_reference: dados.external_reference,
      statement_descriptor: dados.statement_descriptor || 'Floricultura',
    }

    // Adicionar payer se existir
    if (dados.payer) {
      body.payer = dados.payer
    }

    // Adicionar payment_methods se existir
    if (dados.payment_methods) {
      body.payment_methods = dados.payment_methods
    }

    console.log('📤 Enviando para Mercado Pago API:', JSON.stringify(body, null, 2))

    // Fazer requisição para API do Mercado Pago
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': dados.external_reference || `${Date.now()}`, // Evitar duplicatas
      },
      body: JSON.stringify(body),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('❌ Erro da API Mercado Pago:', JSON.stringify(result, null, 2))
      throw new Error(result.message || 'Erro ao criar preferência no Mercado Pago')
    }

    console.log('✅ Preferência criada com sucesso:', result.id)

    return {
      id: result.id,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point,
    }
  } catch (error: any) {
    console.error('❌ Erro ao criar preferência:', error)
    throw new Error(`Falha ao criar preferência de pagamento: ${error.message || 'Erro desconhecido'}`)
  }
}

/**
 * Buscar informações de um pagamento
 */
export async function buscarPagamento(paymentId: string) {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN

  if (!accessToken) {
    throw new Error('MERCADOPAGO_ACCESS_TOKEN não configurado')
  }

  try {
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Erro ao buscar pagamento')
    }

    return result
  } catch (error) {
    console.error('❌ Erro ao buscar pagamento:', error)
    throw new Error('Falha ao buscar informações do pagamento')
  }
}

/**
 * Verificar status do pagamento
 */
export function verificarStatusPagamento(status: string): {
  status: 'APROVADO' | 'PENDENTE' | 'REJEITADO' | 'CANCELADO'
  mensagem: string
} {
  const statusMap: Record<string, { status: 'APROVADO' | 'PENDENTE' | 'REJEITADO' | 'CANCELADO'; mensagem: string }> = {
    approved: { status: 'APROVADO', mensagem: 'Pagamento aprovado' },
    pending: { status: 'PENDENTE', mensagem: 'Pagamento pendente' },
    authorized: { status: 'PENDENTE', mensagem: 'Pagamento autorizado' },
    in_process: { status: 'PENDENTE', mensagem: 'Pagamento em processamento' },
    in_mediation: { status: 'PENDENTE', mensagem: 'Pagamento em mediação' },
    rejected: { status: 'REJEITADO', mensagem: 'Pagamento rejeitado' },
    cancelled: { status: 'CANCELADO', mensagem: 'Pagamento cancelado' },
    refunded: { status: 'CANCELADO', mensagem: 'Pagamento reembolsado' },
    charged_back: { status: 'CANCELADO', mensagem: 'Pagamento estornado' },
  }

  return statusMap[status] || { status: 'PENDENTE', mensagem: 'Status desconhecido' }
}
