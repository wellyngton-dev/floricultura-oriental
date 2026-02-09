'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { CheckCircle, Package, Flower2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function PedidoSucessoPage() {
  const params = useParams()
  const pedidoId = params.id as string

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Pedido Realizado com Sucesso! 🎉
            </h1>
            <p className="text-gray-600">
              Seu pedido foi confirmado e está sendo processado.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Package className="h-5 w-5 text-gray-600" />
              <p className="text-sm text-gray-600">Número do Pedido</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              #{pedidoId.slice(0, 8).toUpperCase()}
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3 text-left">
              <Flower2 className="h-5 w-5 text-pink-600 mt-1" />
              <div>
                <p className="font-semibold text-gray-900">O que acontece agora?</p>
                <p className="text-sm text-gray-600">
                  Você receberá um email de confirmação e atualizações sobre o status da entrega.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full">
                Voltar para Loja
              </Button>
            </Link>
            <Link href={`/pedido/${pedidoId}`} className="flex-1">
              <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-500">
                Ver Detalhes do Pedido
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
