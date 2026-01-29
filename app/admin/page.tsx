'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Package,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Plus,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  Flower2,
  ArrowUpRight,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Logo } from '@/components/logo'

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
      categoria: string
    }
  }[]
}

interface Produto {
  id: string
  nome: string
  categoria: string
  preco: number
  ativo: boolean
}

export default function AdminDashboard() {
  const router = useRouter()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [pedidosRes, produtosRes] = await Promise.all([
        fetch('/api/pedidos'),
        fetch('/api/produtos'),
      ])
      const pedidosData = await pedidosRes.json()
      const produtosData = await produtosRes.json()
      setPedidos(pedidosData)
      setProdutos(produtosData)
    } catch (error) {
      console.error('Erro ao buscar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduto = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja excluir "${nome}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/produtos/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Produto excluído com sucesso!')
        fetchData() // Recarrega a lista
      } else {
        toast.error('Erro ao excluir produto')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao excluir produto')
    }
  }

  // Estatísticas
  const hoje = new Date()
  const mesAtual = hoje.getMonth()
  const anoAtual = hoje.getFullYear()

  const pedidosHoje = pedidos.filter(
    (p) => new Date(p.createdAt).toDateString() === hoje.toDateString()
  )

  const pedidosMes = pedidos.filter((p) => {
    const data = new Date(p.createdAt)
    return data.getMonth() === mesAtual && data.getFullYear() === anoAtual
  })

  const faturamentoHoje = pedidosHoje.reduce((sum, p) => sum + Number(p.valorTotal), 0)
  const faturamentoMes = pedidosMes.reduce((sum, p) => sum + Number(p.valorTotal), 0)

  const ticketMedio = pedidos.length > 0
    ? pedidos.reduce((sum, p) => sum + Number(p.valorTotal), 0) / pedidos.length
    : 0

  const pedidosPendentes = pedidos.filter((p) => p.status === 'PENDENTE').length
  const pedidosHojePorcentagem = pedidosHoje.length > 0 ? '+12%' : '0%'

  // Produtos mais vendidos
  const produtosMaisVendidos = pedidos
    .flatMap((p) => p.itens)
    .reduce((acc: any, item) => {
      const nome = item.produto.nome
      if (!acc[nome]) {
        acc[nome] = { nome, quantidade: 0, valor: 0, categoria: item.produto.categoria }
      }
      acc[nome].quantidade += item.quantidade
      acc[nome].valor += item.quantidade * Number(item.precoUnit)
      return acc
    }, {})

  const topProdutos = Object.values(produtosMaisVendidos)
    .sort((a: any, b: any) => b.quantidade - a.quantidade)
    .slice(0, 5)

  // Pedidos recentes
  const pedidosRecentes = [...pedidos]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const statusColors = {
    PENDENTE: 'bg-yellow-100 text-yellow-800',
    CONFIRMADO: 'bg-blue-100 text-blue-800',
    EM_PREPARO: 'bg-purple-100 text-purple-800',
    SAIU_ENTREGA: 'bg-orange-100 text-orange-800',
    ENTREGUE: 'bg-green-100 text-green-800',
    CANCELADO: 'bg-red-100 text-red-800',
  }

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Logo com texto PRETO */}
               <Logo href="/" size="xl" variant="light" className="mx-auto mb-6" />

              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-600">Floricultura Oriental</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Site
                </Button>
              </Link>
              <Link href="/admin/produtos/novo">
                <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Produto
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white p-1 rounded-lg shadow-sm">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="pedidos" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Pedidos ({pedidos.length})
            </TabsTrigger>
            <TabsTrigger value="produtos" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <Package className="h-4 w-4 mr-2" />
              Produtos ({produtos.length})
            </TabsTrigger>
            <TabsTrigger value="relatorios" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <TrendingUp className="h-4 w-4 mr-2" />
              Relatórios
            </TabsTrigger>
          </TabsList>

          {/* TAB: VISÃO GERAL */}
          <TabsContent value="overview" className="space-y-6">
            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Vendas Hoje */}
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-white/20 p-3 rounded-lg">
                      <ShoppingBag className="h-6 w-6" />
                    </div>
                    <div className="flex items-center text-sm bg-white/20 px-2 py-1 rounded">
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                      {pedidosHojePorcentagem}
                    </div>
                  </div>
                  <p className="text-white/80 text-sm mb-1">Vendas Hoje</p>
                  <p className="text-3xl font-bold">{pedidosHoje.length}</p>
                  <p className="text-white/60 text-xs mt-2">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(faturamentoHoje)}
                  </p>
                </CardContent>
              </Card>

              {/* Faturamento Mensal */}
              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-white/20 p-3 rounded-lg">
                      <DollarSign className="h-6 w-6" />
                    </div>
                    <div className="flex items-center text-sm bg-white/20 px-2 py-1 rounded">
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                      +24%
                    </div>
                  </div>
                  <p className="text-white/80 text-sm mb-1">Faturamento do Mês</p>
                  <p className="text-3xl font-bold">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                      minimumFractionDigits: 0,
                    }).format(faturamentoMes)}
                  </p>
                  <p className="text-white/60 text-xs mt-2">{pedidosMes.length} pedidos</p>
                </CardContent>
              </Card>

              {/* Ticket Médio */}
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-white/20 p-3 rounded-lg">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <div className="flex items-center text-sm bg-white/20 px-2 py-1 rounded">
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                      +8%
                    </div>
                  </div>
                  <p className="text-white/80 text-sm mb-1">Ticket Médio</p>
                  <p className="text-3xl font-bold">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(ticketMedio)}
                  </p>
                  <p className="text-white/60 text-xs mt-2">Por pedido</p>
                </CardContent>
              </Card>

              {/* Pedidos Pendentes */}
              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-white/20 p-3 rounded-lg">
                      <AlertCircle className="h-6 w-6" />
                    </div>
                    <Badge className="bg-white/20 text-white border-0">Urgente</Badge>
                  </div>
                  <p className="text-white/80 text-sm mb-1">Pedidos Pendentes</p>
                  <p className="text-3xl font-bold">{pedidosPendentes}</p>
                  <p className="text-white/60 text-xs mt-2">Aguardando confirmação</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Pedidos Recentes */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5 text-pink-600" />
                      Pedidos Recentes
                    </span>
                    <Link href="/admin/pedidos">
                      <Button variant="ghost" size="sm">
                        Ver todos
                      </Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pedidosRecentes.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">Nenhum pedido ainda</p>
                    ) : (
                      pedidosRecentes.map((pedido) => (
                        <div
                          key={pedido.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                          onClick={() => router.push(`/admin/pedidos?pedidoId=${pedido.id}`)}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-sm">#{pedido.id.slice(0, 8)}</p>
                              <Badge className={statusColors[pedido.status as keyof typeof statusColors]}>
                                {pedido.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{pedido.destinatarioNome}</p>
                            <p className="text-xs text-gray-500">{formatarData(pedido.createdAt)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-700">
                              {new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                              }).format(pedido.valorTotal)}
                            </p>
                            <Button variant="ghost" size="sm" className="mt-1">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Top Produtos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Flower2 className="h-5 w-5 text-pink-600" />
                    Mais Vendidos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topProdutos.length === 0 ? (
                      <p className="text-center text-gray-500 py-8 text-sm">Nenhuma venda ainda</p>
                    ) : (
                      topProdutos.map((produto: any, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <p className="text-sm font-medium line-clamp-1">{produto.nome}</p>
                              <p className="text-xs text-gray-500">{produto.categoria}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold">{produto.quantidade}x</p>
                            <p className="text-xs text-green-600">
                              {new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                                minimumFractionDigits: 0,
                              }).format(produto.valor)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Estatísticas Adicionais */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total de Produtos</p>
                      <p className="text-2xl font-bold">{produtos.length}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {produtos.filter((p) => p.ativo).length} ativos
                      </p>
                    </div>
                    <div className="bg-pink-100 p-3 rounded-lg">
                      <Package className="h-6 w-6 text-pink-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Pedidos Totais</p>
                      <p className="text-2xl font-bold">{pedidos.length}</p>
                      <p className="text-xs text-gray-500 mt-1">Todos os tempos</p>
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
                      <p className="text-sm text-gray-600 mb-1">Taxa de Conversão</p>
                      <p className="text-2xl font-bold">87%</p>
                      <p className="text-xs text-green-600 mt-1">↑ +5% vs mês passado</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB: PEDIDOS */}
          <TabsContent value="pedidos">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Todos os Pedidos</span>
                  <Link href="/admin/pedidos">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalhes Completos
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pedidos.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">Nenhum pedido ainda</p>
                  ) : (
                    pedidos.map((pedido) => (
                      <div
                        key={pedido.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => router.push(`/admin/pedidos?pedidoId=${pedido.id}`)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-sm">#{pedido.id.slice(0, 8)}</p>
                            <Badge className={statusColors[pedido.status as keyof typeof statusColors]}>
                              {pedido.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{pedido.destinatarioNome}</p>
                          <p className="text-xs text-gray-500">{formatarData(pedido.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-700">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(pedido.valorTotal)}
                          </p>
                          <Button variant="ghost" size="sm" className="mt-1">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: PRODUTOS */}
          <TabsContent value="produtos">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Gerenciar Produtos</span>
                  <Link href="/admin/produtos/novo">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Produto
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {produtos.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">Nenhum produto cadastrado</p>
                  ) : (
                    produtos.map((produto) => (
                      <div
                        key={produto.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{produto.nome}</p>
                            {!produto.ativo && (
                              <Badge variant="secondary">Inativo</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{produto.categoria}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="font-bold text-green-700">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(produto.preco)}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/admin/produtos/${produto.id}/editar`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteProduto(produto.id, produto.nome)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: RELATÓRIOS */}
          <TabsContent value="relatorios">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios e Análises</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Gráficos e relatórios detalhados em breve...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
