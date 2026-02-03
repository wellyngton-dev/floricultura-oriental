'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Package, Home, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Logo } from '@/components/logo'
import confetti from 'canvas-confetti'

function PagamentoSucessoContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [pedidoId, setPedidoId] = useState<string | null>(null)
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

    console.log('✅ Pagamento aprovado:', {
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

    setLoading(false)

    // Animação de confete
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      })
    }, 250)

    return () => clearInterval(interval)
  }, [searchParams])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-green-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
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
          <Card className="border-green-200 shadow-xl">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 p-6 rounded-full">
                  <CheckCircle className="h-16 w-16 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-green-600 mb-2">
                Pagamento Aprovado!
              </CardTitle>
              <p className="text-gray-600 text-lg">
                Seu pedido foi confirmado com sucesso
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Informações do Pedido */}
              {pedidoId && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Package className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-gray-900">
                      Número do Pedido
                    </h3>
                  </div>
                  <p className="text-2xl font-mono font-bold text-green-600 ml-8">
                    #{pedidoId.substring(0, 8).toUpperCase()}
                  </p>
                </div>
              )}

              {/* Status */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      Pagamento confirmado
                    </p>
                    <p className="text-sm text-gray-600">
                      Seu pagamento foi processado com sucesso
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      Pedido em preparação
                    </p>
                    <p className="text-sm text-gray-600">
                      Estamos preparando seu pedido com muito carinho
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      Confirmação enviada
                    </p>
                    <p className="text-sm text-gray-600">
                      Enviamos os detalhes do pedido para seu WhatsApp
                    </p>
                  </div>
                </div>
              </div>

              {/* Próximos Passos */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">
                  📱 Próximos Passos
                </h4>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>• Você receberá atualizações por WhatsApp</li>
                  <li>• Acompanhe o status do pedido em "Meus Pedidos"</li>
                  <li>• A entrega será realizada na data agendada</li>
                </ul>
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                {pedidoId && (
                  <Link href={`/meus-pedidos`} className="flex-1">
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      size="lg"
                    >
                      <Package className="h-5 w-5 mr-2" />
                      Ver Meus Pedidos
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
            </CardContent>
          </Card>

          {/* Mensagem de Agradecimento */}
          <div className="text-center mt-8">
            <p className="text-gray-600">
              Obrigado por confiar na{' '}
              <span className="font-semibold text-green-600">
                Floricultura Oriental
              </span>
              ! 💐
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function PagamentoSucessoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-600" />
        </div>
      }
    >
      <PagamentoSucessoContent />
    </Suspense>
  )
}
