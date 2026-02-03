'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { XCircle, AlertTriangle, Home, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Logo } from '@/components/logo'

function PagamentoFalhaContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [pedidoId, setPedidoId] = useState<string | null>(null)
  const [motivoRecusa, setMotivoRecusa] = useState<string>('')
  const [loading, setLoading] = useState(true)

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

    console.log('❌ Pagamento rejeitado:', {
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

    // Tentar identificar motivo (na prática, viria do webhook)
    if (status === 'rejected') {
      setMotivoRecusa('Pagamento recusado pela instituição financeira')
    } else if (status === 'cancelled') {
      setMotivoRecusa('Pagamento cancelado')
    } else {
      setMotivoRecusa('Não foi possível processar o pagamento')
    }

    setLoading(false)
  }, [searchParams])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-red-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
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
          <Card className="border-red-200 shadow-xl">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="bg-red-100 p-6 rounded-full">
                  <XCircle className="h-16 w-16 text-red-600" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-red-600 mb-2">
                Pagamento Não Aprovado
              </CardTitle>
              <p className="text-gray-600 text-lg">{motivoRecusa}</p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Informações do Pedido */}
              {pedidoId && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <h3 className="font-semibold text-gray-900">
                      Pedido Pendente
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 ml-8">
                    Seu pedido foi criado mas o pagamento não foi concluído
                  </p>
                  <p className="text-lg font-mono font-bold text-red-600 ml-8 mt-1">
                    #{pedidoId.substring(0, 8).toUpperCase()}
                  </p>
                </div>
              )}

              {/* Possíveis Motivos */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-3">
                  ⚠️ Motivos Comuns de Recusa
                </h4>
                <ul className="space-y-2 text-sm text-yellow-800">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600">•</span>
                    <span>Saldo insuficiente no cartão</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600">•</span>
                    <span>Dados do cartão incorretos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600">•</span>
                    <span>Cartão vencido ou bloqueado</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600">•</span>
                    <span>Limite de compras ultrapassado</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600">•</span>
                    <span>Transação recusada pelo banco emissor</span>
                  </li>
                </ul>
              </div>

              {/* O que fazer */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-3">
                  💡 O que você pode fazer
                </h4>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">1.</span>
                    <span>Tente novamente com outro cartão</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">2.</span>
                    <span>Verifique os dados do cartão e tente novamente</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">3.</span>
                    <span>Entre em contato com seu banco</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">4.</span>
                    <span>Escolha outra forma de pagamento (PIX)</span>
                  </li>
                </ul>
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={() => router.back()}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  size="lg"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Tentar Novamente
                </Button>

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
                  Precisa de ajuda?{' '}
                  <Link
                    href="https://wa.me/5516999999999"
                    className="text-red-600 hover:text-red-700 font-semibold"
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

export default function PagamentoFalhaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-red-600" />
        </div>
      }
    >
      <PagamentoFalhaContent />
    </Suspense>
  )
}
