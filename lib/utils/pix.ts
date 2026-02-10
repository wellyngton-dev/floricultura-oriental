/**
 * Gera payload PIX no formato EMV (Padrão Banco Central do Brasil)
 * Compatível com todos os bancos brasileiros
 */

interface PixData {
  chavePix: string
  nomeBeneficiario: string
  cidade: string
  valor: number
  identificador?: string // ID do pedido
  descricao?: string
}

/**
 * Gera string PIX Copia e Cola (BR Code)
 */
export function gerarPixCopiaCola({
  chavePix,
  nomeBeneficiario,
  cidade,
  valor,
  identificador = '',
  descricao = '',
}: PixData): string {
  // Função auxiliar para adicionar campo EMV
  const addEMV = (id: string, value: string) => {
    const size = value.length.toString().padStart(2, '0')
    return `${id}${size}${value}`
  }

  // Payload Format Indicator (fixo)
  let payload = addEMV('00', '01')

  // Merchant Account Information (PIX)
  const merchantAccount =
    addEMV('00', 'br.gov.bcb.pix') + // GUI do PIX
    addEMV('01', chavePix) // Chave PIX

  payload += addEMV('26', merchantAccount)

  // Merchant Category Code (0000 = não especificado)
  payload += addEMV('52', '0000')

  // Transaction Currency (986 = BRL)
  payload += addEMV('53', '986')

  // Transaction Amount
  if (valor > 0) {
    payload += addEMV('54', valor.toFixed(2))
  }

  // Country Code
  payload += addEMV('58', 'BR')

  // Merchant Name (máx 25 caracteres)
  const nomeFormatado = nomeBeneficiario
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .toUpperCase()
    .slice(0, 25)
  
  payload += addEMV('59', nomeFormatado)

  // Merchant City (máx 15 caracteres)
  const cidadeFormatada = cidade
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .slice(0, 15)
  
  payload += addEMV('60', cidadeFormatada)

  // Additional Data Field Template
  if (identificador || descricao) {
    let additionalData = ''
    
    if (identificador) {
      additionalData += addEMV('05', identificador.slice(0, 25))
    }
    
    if (descricao) {
      additionalData += addEMV('08', descricao.slice(0, 50))
    }
    
    payload += addEMV('62', additionalData)
  }

  // CRC16 placeholder
  payload += '6304'

  // Calcular e adicionar CRC16
  const crc = calcularCRC16(payload)
  payload += crc

  return payload
}

/**
 * Calcula CRC16-CCITT (Padrão PIX)
 */
function calcularCRC16(payload: string): string {
  let crc = 0xffff
  const polynomial = 0x1021

  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8

    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ polynomial
      } else {
        crc = crc << 1
      }
    }
  }

  crc &= 0xffff
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

/**
 * Valida formato de chave PIX
 */
export function validarChavePix(chave: string): {
  valida: boolean
  tipo?: 'CPF' | 'CNPJ' | 'EMAIL' | 'TELEFONE' | 'ALEATORIA'
} {
  // Remove formatação
  const chaveLimpa = chave.replace(/[^\w@.+-]/g, '')

  // CPF (11 dígitos)
  if (/^\d{11}$/.test(chaveLimpa)) {
    return { valida: true, tipo: 'CPF' }
  }

  // CNPJ (14 dígitos)
  if (/^\d{14}$/.test(chaveLimpa)) {
    return { valida: true, tipo: 'CNPJ' }
  }

  // Email
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(chaveLimpa)) {
    return { valida: true, tipo: 'EMAIL' }
  }

  // Telefone (+5511999999999)
  if (/^\+?\d{12,13}$/.test(chaveLimpa)) {
    return { valida: true, tipo: 'TELEFONE' }
  }

  // Chave aleatória (UUID)
  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      chaveLimpa
    )
  ) {
    return { valida: true, tipo: 'ALEATORIA' }
  }

  return { valida: false }
}

/**
 * Formata chave PIX para exibição
 */
export function formatarChavePix(chave: string, tipo?: string): string {
  const validacao = validarChavePix(chave)
  
  if (!validacao.valida) return chave

  switch (validacao.tipo) {
    case 'CPF':
      return chave.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    
    case 'CNPJ':
      return chave.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    
    case 'TELEFONE':
      const numeros = chave.replace(/\D/g, '')
      if (numeros.length === 13) {
        return numeros.replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, '+$1 ($2) $3-$4')
      }
      return chave
    
    default:
      return chave
  }
}
