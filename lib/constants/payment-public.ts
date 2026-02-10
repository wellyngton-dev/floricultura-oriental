// lib/constants/payment-public.ts
// ⚠️ Este arquivo é para uso no CLIENT-SIDE (páginas com 'use client')

export const PAYMENT_CONFIG_PUBLIC = {
  pix: {
    // Variáveis públicas (acessíveis no client)
    chavePix: process.env.NEXT_PUBLIC_PIX_CHAVE || '',
    nomeBeneficiario: process.env.NEXT_PUBLIC_PIX_NOME_BENEFICIARIO || '',
    cidade: process.env.NEXT_PUBLIC_PIX_CIDADE || 'Sao Carlos',
    whatsappComprovante: process.env.NEXT_PUBLIC_PIX_WHATSAPP || '',
    
    // Informações do banco
    banco: 'Itaú',
    codigoBanco: '341',
    
    // Instruções de pagamento
    instrucoes: [
      'Abra o app do seu banco',
      'Escolha pagar com PIX',
      'Escaneie o QR Code ou copie o código',
      'Confirme o pagamento do valor exato',
      'Envie o comprovante pelo WhatsApp',
    ],
  },
  
  tempoExpiracao: 30,
  
  status: {
    AGUARDANDO_PIX: 'Aguardando pagamento PIX',
    PAGO: 'Pagamento confirmado',
    EXPIRADO: 'Pagamento expirado',
    CANCELADO: 'Pagamento cancelado',
  },
}

export function getWhatsAppComprovanteLink(pedidoId: string, valor: number): string {
  const mensagem = `
Olá! Acabei de fazer o pagamento PIX.

*Pedido:* #${pedidoId}
*Valor:* ${new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)}

Envio o comprovante de pagamento:
  `.trim()

  const mensagemEncoded = encodeURIComponent(mensagem)
  const whatsapp = PAYMENT_CONFIG_PUBLIC.pix.whatsappComprovante
  return `https://wa.me/${whatsapp}?text=${mensagemEncoded}`
}
