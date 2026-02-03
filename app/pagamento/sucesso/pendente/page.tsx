'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, QrCode, Package, Home, Loader2, Copy, Check } from 'lucide-react'
import Link from 'next/link'
import { Logo } from '@/components/logo'
import { toast } from 'sonner'

function PagamentoPendenteContent() {
  const searchParams = useSearchParams()
  const [pedidoId, setPedidoId] = useState<string | null>(null)
  const [tipoPagamento, setTipoPagamento] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    // Pegar dados da URL
    const collection_id = searchParams.get('collection_id')
    const collection_status = searchParams.get('collection_status')
    const payment_id = searchParams.get('payment_id')
    const status = searchParams.get('status')
    const external_reference = searchParams.get('external_reference')
    const payment_type = searchParams.get('payment_type')
    const merchant_order_id = searchParams.get('merchant_order_id')
    const preference_id = searchParams.get('preference_id')

    console.log('⏳ Pagamento pendente:', {
      collection_id,
      collection_status,
      payment_id,
      status,
      external_reference,
      payment_type,
      merchant_order_id,
      preference_id,
    })

    if (external_reference) {
      setPedidoId(external_reference)
    }

    if (payment_type) {
      setTipoPagamento(payment_type)
    }

    setLoading(false)
  }, [searchParams])

  const copiarCodigo = () => {
    // Simulação - na prática viria da API
    const codigoPix = 'PIX_CODIGO_EXEMPLO_123456789'
    navigator.clipboard.writeText(codigoPix)
    setCopiado(true)
    toast.success('Código PIX copiado!')

    setTimeout(() => setCopiado(false), 3000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-yellow-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center justify-center">
            <Logo size="md" variant="light" />
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Card Principal */}
          <Card className="border-yellow-200 shadow-xl">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="bg-yellow-100 p-6 rounded-full animate-pulse">
                  <Clock className="h-16 w-16 text-yellow-600" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-yellow-600 mb-2">
                Pagamento Pendente
              </CardTitle>
              <p className="text-gray-600 text-lg">
                Aguardando confirmação do pagamento
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Informações do Pedido */}
              {pedidoId && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Package className="h-5 w-5 text-yellow-600" />
                    <h3 className="font-semibold text-gray-900">
                      Número do Pedido
                    </h3>
                  </div>
                  <p className="text-2xl font-mono font-bold text-yellow-600 ml-8">
                    #{pedidoId.substring(0, 8).toUpperCase()}
                  </p>
                </div>
              )}

              {/* Se for PIX */}
              {tipoPagamento === 'pix' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <QrCode className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-blue-900">
                        Complete o pagamento via PIX
                      </h3>
                    </div>

                    {/* QR Code - Simulação */}
                    <div className="bg-white p-4 rounded-lg border-2 border-dashed border-blue-300 mb-4">
                      <div className="aspect-square w-48 mx-auto bg-gray-100 rounded flex items-center justify-center">
                        <QrCode className="h-32 w-32 text-gray-400" />
                      </div>
                      <p className="text-center text-sm text-gray-600 mt-2">
                        Escaneie o QR Code com seu app de pagamentos
                      </p>
                    </div>

                    {/* Código PIX Copia e Cola */}
                    <div>
                      <p className="text-sm font-semibold text-blue-900 mb-2">
                        Ou copie o código:
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value="PIX_CODIGO_EXEMPLO_123..."
                          readOnly
                          className="flex-1 px-3 py-2 text-sm bg-white border border-blue-200 rounded"
                        />
                        <Button
                          onClick={copiarCodigo}
                          variant="outline"
                          className="border-blue-300"
                        >
                          {copiado ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Instruções */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">
                  ⏱️ Próximos Passos
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600">1.</span>
                    <span>
                      {tipoPagamento === 'pix'
                        ? 'Complete o pagamento via PIX'
                        : 'Aguarde a confirmação do pagamento'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600">2.</span>
                    <span>A confirmação pode levar alguns minutos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600">3.</span>
                    <span>
                      Você receberá uma notificação quando for confirmado
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600">4.</span>
                    <span>Acompanhe o status em "Meus Pedidos"</span>
                  </li>
                </ul>
              </div>

              {/* Alerta de Tempo */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-orange-900 mb-1">
                      Atenção ao Prazo
                    </p>
                    <p className="text-sm text-orange-800">
                      {tipoPagamento === 'pix'
                        ? 'O código PIX expira em 30 minutos'
                        : 'Complete o pagamento em até 3 dias para garantir seu pedido'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                {pedidoId && (
                  <Link href="/meus-pedidos" className="flex-1">
                    <Button
                      className="w-full bg-yellow-600 hover:bg-yellow-700"
                      size="lg"
                    >
                      <Package className="h-5 w-5 mr-2" />
                      Acompanhar Pedido
                    </Button>
                  </Link>
                )}

                <Link href="/" className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full border-gray-300"
                    size="lg"
                  >
                    <Home className="h-5 w-5 mr-2" />
                    Voltar ao Início
                  </Button>
                </Link>
              </div>

              {/* Contato */}
              <div className="text-center text-sm text-gray-600 pt-4 border-t">
                <p>
                  Dúvidas?{' '}
                  <Link
                    href="https://wa.me/5516999999999"
                    className="text-yellow-600 hover:text-yellow-700 font-semibold"
                  >
                    Fale conosco pelo WhatsApp
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default function PagamentoPendentePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-yellow-600" />
        </div>
      }
    >
      <PagamentoPendenteContent />
    </Suspense>
  )
}
