// lib/constants/payment.ts
// ⚠️ Este arquivo é para uso no SERVER-SIDE (APIs, Server Components)

export const PAYMENT_CONFIG = {
  pix: {
    // Variáveis privadas do servidor
    chavePix: process.env.PIX_CHAVE || process.env.NEXT_PUBLIC_PIX_CHAVE || '',
    nomeBeneficiario: process.env.PIX_NOME_BENEFICIARIO || process.env.NEXT_PUBLIC_PIX_NOME_BENEFICIARIO || '',
    cidade: process.env.PIX_CIDADE || process.env.NEXT_PUBLIC_PIX_CIDADE || 'Sao Carlos',
    whatsappComprovante: process.env.PIX_WHATSAPP_COMPROVANTE || process.env.NEXT_PUBLIC_PIX_WHATSAPP || '',
    
    banco: 'Itaú',
    codigoBanco: '341',
    
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
