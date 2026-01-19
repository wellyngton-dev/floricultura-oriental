'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Flower2,
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  Truck,
  LogOut,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'


interface Pedido {
  id: string
  cliente: {
    nome: string
    telefone: string
    email: string
  }
  status: string
  dataEntrega: string
  horaEntrega: string
  enderecoEntrega: string
  valorTotal: number
  observacoes: string | null
  createdAt: string
  itens: {
    quantidade: number
    produto: {
      nome: string
    }
  }[]
}

const statusConfig = {
  PENDENTE: { label: 'Pendente', color: 'bg-yellow-500', icon: Clock },
  CONFIRMADO: { label: 'Confirmado', color: 'bg-blue-500', icon: CheckCircle },
  EM_PREPARACAO: { label: 'Em Preparação', color: 'bg-purple-500', icon: Package },
  SAIU_ENTREGA: { label: 'Saiu para Entrega', color: 'bg-orange-500', icon: Truck },
  ENTREGUE: { label: 'Entregue', color: 'bg-green-500', icon: CheckCircle },
  CANCELADO: { label: 'Cancelado', color: 'bg-red-500', icon: XCircle },
}

export default function AdminDashboard() {
  const router = useRouter()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroStatus, setFiltroStatus] = useState('TODOS')

  useEffect(() => {
    // Verificar autenticação
    const isAuth = localStorage.getItem('admin-auth')
    if (!isAuth) {
      router.push('/admin/login')
      return
    }

    fetchPedidos()

    // Auto-refresh a cada 30 segundos
    const interval = setInterval(fetchPedidos, 30000)
    return () => clearInterval(interval)
  }, [router])

  const fetchPedidos = async () => {
    try {
      const response = await fetch('/api/pedidos')
      const data = await response.json()
      setPedidos(data)
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error)
    } finally {
      setLoading(false)
    }
  }

  const atualizarStatus = async (pedidoId: string, novoStatus: string) => {
    try {
      await fetch(`/api/pedidos/${pedidoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus }),
      })
      fetchPedidos()
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      alert('Erro ao atualizar status')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin-auth')
    router.push('/admin/login')
  }

  const pedidosFiltrados = filtroStatus === 'TODOS'
    ? pedidos
    : pedidos.filter(p => p.status === filtroStatus)

  const estatisticas = {
    total: pedidos.length,
    pendentes: pedidos.filter(p => p.status === 'PENDENTE').length,
    emAndamento: pedidos.filter(p => ['CONFIRMADO', 'EM_PREPARACAO', 'SAIU_ENTREGA'].includes(p.status)).length,
    entregues: pedidos.filter(p => p.status === 'ENTREGUE').length,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Flower2 className="h-8 w-8 text-pink-500" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Dashboard Admin</h1>
                <p className="text-sm text-gray-500">Floricultura Oriental</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/admin/produtos">
                <Button variant="outline" size="sm">
                  <Flower2 className="h-4 w-4 mr-2" />
                  Produtos
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={fetchPedidos}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>

          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">Total de Pedidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-gray-400" />
                <span className="text-3xl font-bold">{estatisticas.total}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                <span className="text-3xl font-bold text-yellow-600">{estatisticas.pendentes}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">Em Andamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-500" />
                <span className="text-3xl font-bold text-blue-600">{estatisticas.emAndamento}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">Entregues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-3xl font-bold text-green-600">{estatisticas.entregues}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <div className="mb-6">
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-64 bg-white">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todos os Pedidos</SelectItem>
              <SelectItem value="PENDENTE">Pendentes</SelectItem>
              <SelectItem value="CONFIRMADO">Confirmados</SelectItem>
              <SelectItem value="EM_PREPARACAO">Em Preparação</SelectItem>
              <SelectItem value="SAIU_ENTREGA">Saiu para Entrega</SelectItem>
              <SelectItem value="ENTREGUE">Entregues</SelectItem>
              <SelectItem value="CANCELADO">Cancelados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lista de Pedidos */}
        <div className="space-y-4">
          {pedidosFiltrados.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum pedido encontrado</p>
              </CardContent>
            </Card>
          ) : (
            pedidosFiltrados.map((pedido) => {
              const StatusIcon = statusConfig[pedido.status as keyof typeof statusConfig]?.icon || Clock

              return (
                <Card key={pedido.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-lg">Pedido #{pedido.id.slice(0, 8)}</CardTitle>
                          <Badge className={`${statusConfig[pedido.status as keyof typeof statusConfig]?.color} text-white`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig[pedido.status as keyof typeof statusConfig]?.label}
                          </Badge>
                        </div>
                        <CardDescription>
                          Criado em {new Date(pedido.createdAt).toLocaleString('pt-BR')}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-pink-600">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(Number(pedido.valorTotal))}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Informações do Cliente */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Cliente</p>
                        <p className="text-sm">{pedido.cliente.nome}</p>
                        <p className="text-sm text-gray-600">{pedido.cliente.telefone}</p>
                        <p className="text-sm text-gray-600">{pedido.cliente.email}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Entrega</p>
                        <p className="text-sm">
                          {new Date(pedido.dataEntrega).toLocaleDateString('pt-BR')} às {pedido.horaEntrega}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">{pedido.enderecoEntrega}</p>
                      </div>
                    </div>

                    {/* Itens do Pedido */}
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">Itens</p>
                      <ul className="space-y-1">
                        {pedido.itens.map((item, index) => (
                          <li key={index} className="text-sm text-gray-600">
                            {item.quantidade}x {item.produto.nome}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {pedido.observacoes && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">Observações</p>
                        <p className="text-sm text-gray-600 italic">{pedido.observacoes}</p>
                      </div>
                    )}

                    {/* Atualizar Status */}
                    <div className="pt-4 border-t">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Atualizar Status</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(statusConfig).map(([status, config]) => (
                          <Button
                            key={status}
                            variant={pedido.status === status ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => atualizarStatus(pedido.id, status)}
                            disabled={pedido.status === status}
                          >
                            <config.icon className="h-3 w-3 mr-1" />
                            {config.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </main>
    </div>
  )
}
