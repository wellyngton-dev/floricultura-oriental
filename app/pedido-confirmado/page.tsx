'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Home, Package } from 'lucide-react'
import Link from 'next/link'

function PedidoConfirmadoContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pedidoId = searchParams.get('id')
  const [pedido, setPedido] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!pedidoId) {
      router.push('/')
      return
    }

    fetchPedido()
  }, [pedidoId])

  const fetchPedido = async () => {
    try {
      const response = await fetch(`/api/pedidos/${pedidoId}`)
      if (response.ok) {
        const data = await response.json()
        setPedido(data)
      }
    } catch (error) {
      console.error('Erro ao buscar pedido:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="text-center">
          <CardContent className="p-12">
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Pedido Confirmado!
              </h1>
              <p className="text-gray-600 mb-4">
                Seu pedido foi recebido com sucesso
              </p>
              {pedidoId && (
                <div className="inline-block bg-gray-100 px-4 py-2 rounded-lg">
                  <p className="text-sm text-gray-600">Número do pedido</p>
                  <p className="text-lg font-mono font-bold text-gray-900">
                    #{pedidoId.slice(0, 8).toUpperCase()}
                  </p>
                </div>
              )}
            </div>

            {pedido && (
              <div className="mb-8 text-left bg-gray-50 rounded-lg p-6">
                <h3 className="font-bold text-lg mb-3">Detalhes da Entrega</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    <strong>Para:</strong> {pedido.destinatarioNome}
                  </p>
                  <p>
                    <strong>Data:</strong>{' '}
                    {new Date(pedido.dataEntrega).toLocaleDateString('pt-BR')}
                  </p>
                  <p>
                    <strong>Endereço:</strong> {pedido.endereco}, {pedido.numero} -{' '}
                    {pedido.bairro}, {pedido.cidade}/{pedido.estado}
                  </p>
                  <p>
                    <strong>Valor Total:</strong>{' '}
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(pedido.valorTotal)}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <p className="text-gray-600">
                Você receberá um email com os detalhes do seu pedido e o
                acompanhamento da entrega.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Link href="/" className="flex-1">
                  <Button variant="outline" className="w-full">
                    <Home className="w-4 h-4 mr-2" />
                    Voltar para Home
                  </Button>
                </Link>
                <Link href="/produtos" className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
                    <Package className="w-4 h-4 mr-2" />
                    Ver Mais Produtos
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function PedidoConfirmadoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600" />
      </div>
    }>
      <PedidoConfirmadoContent />
    </Suspense>
  )
}
