'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  User,
  ShoppingBag
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Pedido {
  id: string
  compradorNome: string
  destinatarioNome: string
  dataEntrega: string
  valorTotal: number
  status: string
  createdAt: string
  itens: {
    id: string
    quantidade: number
    precoUnit: number
    produto: {
      nome: string
    }
  }[]
}

const statusConfig = {
  PENDENTE: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  CONFIRMADO: { label: 'Confirmado', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  EM_PREPARO: { label: 'Em Preparo', color: 'bg-purple-100 text-purple-800', icon: Package },
  SAIU_ENTREGA: { label: 'Saiu para Entrega', color: 'bg-indigo-100 text-indigo-800', icon: Package },
  ENTREGUE: { label: 'Entregue', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  CANCELADO: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: XCircle },
}

export default function PedidosClientePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchPedidos()
    }
  }, [status, router])

  const fetchPedidos = async () => {
    try {
      const response = await fetch('/api/clientes/pedidos')
      const data = await response.json()
      setPedidos(data)
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-pink-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  const pedidosAtivos = pedidos.filter(p => 
    !['ENTREGUE', 'CANCELADO'].includes(p.status)
  )
  const pedidosConcluidos = pedidos.filter(p => 
    ['ENTREGUE', 'CANCELADO'].includes(p.status)
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar à Loja
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Meus Pedidos</h1>
                <p className="text-sm text-gray-600">Olá, {session?.user?.name}</p>
              </div>
            </div>
            <Link href="/cliente/perfil">
              <Button variant="outline" size="sm">
                <User className="h-4 w-4 mr-2" />
                Meu Perfil
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total de Pedidos</p>
                  <p className="text-3xl font-bold text-gray-900">{pedidos.length}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <ShoppingBag className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Em Andamento</p>
                  <p className="text-3xl font-bold text-purple-600">{pedidosAtivos.length}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Concluídos</p>
                  <p className="text-3xl font-bold text-green-600">{pedidosConcluidos.length}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pedidos Ativos */}
        {pedidosAtivos.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Pedidos em Andamento</h2>
            <div className="space-y-4">
              {pedidosAtivos.map((pedido) => {
                const statusInfo = statusConfig[pedido.status as keyof typeof statusConfig]
                const StatusIcon = statusInfo.icon

                return (
                  <Card key={pedido.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className={statusInfo.color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusInfo.label}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              Pedido #{pedido.id.slice(0, 8)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            <strong>Para:</strong> {pedido.destinatarioNome}
                          </p>
                          <p className="text-sm text-gray-600 mb-1">
                            <strong>Entrega:</strong>{' '}
                            {format(new Date(pedido.dataEntrega), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Itens:</strong> {pedido.itens.length} produto(s)
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <p className="text-2xl font-bold text-green-600">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(Number(pedido.valorTotal))}
                          </p>
                          <Link href={`/cliente/pedidos/${pedido.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalhes
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Histórico */}
        {pedidosConcluidos.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Histórico de Pedidos</h2>
            <div className="space-y-4">
              {pedidosConcluidos.map((pedido) => {
                const statusInfo = statusConfig[pedido.status as keyof typeof statusConfig]
                const StatusIcon = statusInfo.icon

                return (
                  <Card key={pedido.id} className="opacity-75 hover:opacity-100 transition-opacity">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className={statusInfo.color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusInfo.label}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {format(new Date(pedido.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            <strong>Para:</strong> {pedido.destinatarioNome}
                          </p>
                          <p className="text-sm text-gray-600">
                            {pedido.itens.length} produto(s)
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <p className="text-xl font-bold text-gray-700">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(Number(pedido.valorTotal))}
                          </p>
                          <Link href={`/cliente/pedidos/${pedido.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalhes
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Sem Pedidos */}
        {pedidos.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Você ainda não fez nenhum pedido
              </h3>
              <p className="text-gray-600 mb-6">
                Explore nossa loja e encontre as flores perfeitas para você!
              </p>
              <Link href="/">
                <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
                  Ir para a Loja
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
