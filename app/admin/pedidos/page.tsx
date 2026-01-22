'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  ArrowLeft,
  Search,
  Filter,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Download,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface Pedido {
  id: string
  compradorNome: string
  compradorEmail: string
  compradorTelefone: string
  destinatarioNome: string
  destinatarioTelefone: string
  dataEntrega: string
  periodoEntrega: string
  tipoEndereco: string
  cep: string
  endereco: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
  referencia?: string
  mensagem?: string
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

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [pedidoSelecionado, setPedidoSelecionado] = useState<Pedido | null>(null)
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('TODOS')
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    fetchPedidos()
  }, [])

  const fetchPedidos = async () => {
    try {
      const response = await fetch('/api/pedidos')
      const data = await response.json()
      setPedidos(data)
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error)
      toast.error('Erro ao carregar pedidos')
    } finally {
      setLoading(false)
    }
  }

  const atualizarStatus = async (pedidoId: string, novoStatus: string) => {
    try {
      const response = await fetch(`/api/pedidos/${pedidoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus }),
      })

      if (response.ok) {
        toast.success('Status atualizado!')
        fetchPedidos()
        setModalOpen(false)
      } else {
        toast.error('Erro ao atualizar status')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao atualizar status')
    }
  }

  const pedidosFiltrados = pedidos
    .filter((p) => filtroStatus === 'TODOS' || p.status === filtroStatus)
    .filter((p) => {
      const termo = busca.toLowerCase()
      return (
        p.id.toLowerCase().includes(termo) ||
        p.compradorNome.toLowerCase().includes(termo) ||
        p.destinatarioNome.toLowerCase().includes(termo) ||
        p.compradorEmail.toLowerCase().includes(termo)
      )
    })

  const statusOptions = [
    { value: 'TODOS', label: 'Todos', count: pedidos.length },
    { value: 'PENDENTE', label: 'Pendente', count: pedidos.filter((p) => p.status === 'PENDENTE').length },
    { value: 'CONFIRMADO', label: 'Confirmado', count: pedidos.filter((p) => p.status === 'CONFIRMADO').length },
    { value: 'EM_PREPARO', label: 'Em Preparo', count: pedidos.filter((p) => p.status === 'EM_PREPARO').length },
    { value: 'SAIU_ENTREGA', label: 'Saiu para Entrega', count: pedidos.filter((p) => p.status === 'SAIU_ENTREGA').length },
    { value: 'ENTREGUE', label: 'Entregue', count: pedidos.filter((p) => p.status === 'ENTREGUE').length },
    { value: 'CANCELADO', label: 'Cancelado', count: pedidos.filter((p) => p.status === 'CANCELADO').length },
  ]

  const statusColors = {
    PENDENTE: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    CONFIRMADO: 'bg-blue-100 text-blue-800 border-blue-300',
    EM_PREPARO: 'bg-purple-100 text-purple-800 border-purple-300',
    SAIU_ENTREGA: 'bg-orange-100 text-orange-800 border-orange-300',
    ENTREGUE: 'bg-green-100 text-green-800 border-green-300',
    CANCELADO: 'bg-red-100 text-red-800 border-red-300',
  }

  const periodoLabels: { [key: string]: string } = {
    manha: 'Manhã (08h-13h)',
    tarde: 'Tarde (13h-19h)',
    comercial: 'Comercial (08h-19h)',
    noite: 'Noite (19h-23h30)',
  }

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatarDataHora = (data: string) => {
    return new Date(data).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gerenciar Pedidos</h1>
                <p className="text-sm text-gray-600">{pedidosFiltrados.length} pedidos encontrados</p>
              </div>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Busca */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por pedido, cliente, email..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filtro de Status */}
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label} ({option.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Pedidos */}
        {loading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4" />
              <p className="text-gray-600">Carregando pedidos...</p>
            </CardContent>
          </Card>
        ) : pedidosFiltrados.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum pedido encontrado</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pedidosFiltrados.map((pedido) => (
              <Card
                key={pedido.id}
                className="hover:shadow-lg transition-all cursor-pointer"
                onClick={() => {
                  setPedidoSelecionado(pedido)
                  setModalOpen(true)
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">
                          #{pedido.id.slice(0, 8).toUpperCase()}
                        </h3>
                        <Badge className={`${statusColors[pedido.status as keyof typeof statusColors]} border`}>
                          {pedido.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        <Clock className="inline h-3 w-3 mr-1" />
                        Pedido em {formatarDataHora(pedido.createdAt)}
                      </p>
                      <p className="text-sm text-gray-600">
                        <Calendar className="inline h-3 w-3 mr-1" />
                        Entrega: {formatarData(pedido.dataEntrega)} • {periodoLabels[pedido.periodoEntrega]}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-700 mb-1">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(pedido.valorTotal)}
                      </p>
                      <p className="text-xs text-gray-500">{pedido.itens.length} itens</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Comprador</p>
                      <p className="text-sm font-medium">{pedido.compradorNome}</p>
                      <p className="text-xs text-gray-600">{pedido.compradorTelefone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Destinatário</p>
                      <p className="text-sm font-medium">{pedido.destinatarioNome}</p>
                      <p className="text-xs text-gray-600">{pedido.destinatarioTelefone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Endereço</p>
                      <p className="text-sm font-medium line-clamp-1">
                        {pedido.endereco}, {pedido.numero}
                      </p>
                      <p className="text-xs text-gray-600">
                        {pedido.bairro} - {pedido.cidade}/{pedido.estado}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Modal de Detalhes */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {pedidoSelecionado && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>Pedido #{pedidoSelecionado.id.slice(0, 8).toUpperCase()}</span>
                  <Badge className={statusColors[pedidoSelecionado.status as keyof typeof statusColors]}>
                    {pedidoSelecionado.status.replace('_', ' ')}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  Realizado em {formatarDataHora(pedidoSelecionado.createdAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Informações do Comprador e Destinatário */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Comprador
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <p className="text-sm font-medium">{pedidoSelecionado.compradorNome}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-3 w-3" />
                        {pedidoSelecionado.compradorTelefone}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-3 w-3" />
                        {pedidoSelecionado.compradorEmail}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Destinatário
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <p className="text-sm font-medium">{pedidoSelecionado.destinatarioNome}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-3 w-3" />
                        {pedidoSelecionado.destinatarioTelefone}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Entrega */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Informações de Entrega
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Data e Período</p>
                      <p className="text-sm font-medium">
                        {formatarData(pedidoSelecionado.dataEntrega)} • {periodoLabels[pedidoSelecionado.periodoEntrega]}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Endereço Completo</p>
                      <p className="text-sm">
                        {pedidoSelecionado.endereco}, {pedidoSelecionado.numero}
                        {pedidoSelecionado.complemento && `, ${pedidoSelecionado.complemento}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {pedidoSelecionado.bairro} - {pedidoSelecionado.cidade}/{pedidoSelecionado.estado}
                      </p>
                      <p className="text-sm text-gray-600">CEP: {pedidoSelecionado.cep}</p>
                      {pedidoSelecionado.referencia && (
                        <p className="text-sm text-gray-600 mt-1">
                          <strong>Referência:</strong> {pedidoSelecionado.referencia}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Mensagem */}
                {pedidoSelecionado.mensagem && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Mensagem do Cartão</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm italic text-gray-700">&ldquo;{pedidoSelecionado.mensagem}&rdquo;</p>
                    </CardContent>
                  </Card>
                )}

                {/* Itens */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Itens do Pedido</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {pedidoSelecionado.itens.map((item) => (
                        <div key={item.id} className="flex items-center justify-between pb-3 border-b last:border-0">
                          <div>
                            <p className="text-sm font-medium">
                              {item.quantidade}x {item.produto.nome}
                            </p>
                            <p className="text-xs text-gray-500">{item.produto.categoria}</p>
                          </div>
                          <p className="text-sm font-bold text-green-700">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(item.precoUnit * item.quantidade)}
                          </p>
                        </div>
                      ))}
                      <div className="flex items-center justify-between pt-3 border-t-2">
                        <p className="font-bold">Total</p>
                        <p className="text-xl font-bold text-green-700">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(pedidoSelecionado.valorTotal)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Ações */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => atualizarStatus(pedidoSelecionado.id, 'CONFIRMADO')}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={pedidoSelecionado.status === 'CONFIRMADO'}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirmar
                  </Button>
                  <Button
                    onClick={() => atualizarStatus(pedidoSelecionado.id, 'EM_PREPARO')}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                    disabled={pedidoSelecionado.status === 'EM_PREPARO'}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Em Preparo
                  </Button>
                  <Button
                    onClick={() => atualizarStatus(pedidoSelecionado.id, 'SAIU_ENTREGA')}
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                    disabled={pedidoSelecionado.status === 'SAIU_ENTREGA'}
                  >
                    <Truck className="h-4 w-4 mr-2" />
                    Saiu p/ Entrega
                  </Button>
                  <Button
                    onClick={() => atualizarStatus(pedidoSelecionado.id, 'ENTREGUE')}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={pedidoSelecionado.status === 'ENTREGUE'}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Entregar
                  </Button>
                  <Button
                    onClick={() => atualizarStatus(pedidoSelecionado.id, 'CANCELADO')}
                    variant="destructive"
                    className="flex-1"
                    disabled={pedidoSelecionado.status === 'CANCELADO'}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
