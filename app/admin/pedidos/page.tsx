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
  Printer,
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
  valorProdutos: number  // ✅ ADICIONAR
  valorFrete: number      // ✅ ADICIONAR
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
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    fetchPedidos()
  }, [])

  const fetchPedidos = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/pedidos')

      if (!response.ok) {
        throw new Error('Erro ao buscar pedidos')
      }

      const data = await response.json()
      setPedidos(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error)
      setPedidos([])
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

  const pedidosFiltrados = Array.isArray(pedidos)
    ? pedidos
      .filter((p) => filtroStatus === 'TODOS' || p.status === filtroStatus)
      .filter((p) => {
        const termo = busca.toLowerCase()
        return (
          p.compradorNome.toLowerCase().includes(termo) ||
          p.destinatarioNome.toLowerCase().includes(termo) ||
          p.id.toLowerCase().includes(termo)
        )
      })
    : []

  const statusOptions = [
    { value: 'TODOS', label: 'Todos', count: pedidos.length },
    { value: 'PENDENTE', label: 'Pendente', count: pedidos.filter((p) => p.status === 'PENDENTE').length },
    { value: 'CONFIRMADO', label: 'Confirmado', count: pedidos.filter((p) => p.status === 'CONFIRMADO').length },
    { value: 'EM_PREPARO', label: 'Em Preparo', count: pedidos.filter((p) => p.status === 'EM_PREPARO').length },
    { value: 'SAIU_ENTREGA', label: 'Saiu para Entrega', count: pedidos.filter((p) => p.status === 'SAIU_ENTREGA').length },
    { value: 'ENTREGUE', label: 'Entregue', count: pedidos.filter((p) => p.status === 'ENTREGUE').length },
    { value: 'CANCELADO', label: 'Cancelado', count: pedidos.filter((p) => p.status === 'CANCELADO').length },
  ]

  const statusColors: Record<string, string> = {
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
    qualquer: 'Qualquer horário',
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
  // ✅ ADICIONAR FUNÇÃO DE IMPRESSÃO
  // ✅ FUNÇÃO DE IMPRESSÃO TÉRMICA
  const imprimirPedido = () => {
    if (!pedidoSelecionado) return

    const printWindow = window.open('', '', 'width=400,height=600')
    if (!printWindow) {
      toast.error('Erro ao abrir janela de impressão. Verifique o bloqueador de pop-ups.')
      return
    }

    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Pedido #${pedidoSelecionado.id.slice(0, 8).toUpperCase()}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          @page {
            size: 80mm auto;
            margin: 0;
          }
          
          body {
            width: 80mm;
            font-family: 'Courier New', Courier, monospace;
            font-size: 12px;
            line-height: 1.4;
            color: #000;
            background: #fff;
            padding: 10px;
          }
          
          .center {
            text-align: center;
          }
          
          .bold {
            font-weight: bold;
          }
          
          .large {
            font-size: 14px;
          }
          
          .small {
            font-size: 10px;
          }
          
          .header {
            text-align: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px dashed #000;
          }
          
          .header h1 {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 3px;
          }
          
          .separator {
            border-top: 1px dashed #000;
            margin: 10px 0;
          }
          
          .separator-double {
            border-top: 2px solid #000;
            margin: 10px 0;
          }
          
          .section {
            margin-bottom: 12px;
          }
          
          .section-title {
            font-weight: bold;
            font-size: 13px;
            margin-bottom: 5px;
            text-transform: uppercase;
          }
          
          .row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
          }
          
          .label {
            font-size: 10px;
            color: #333;
          }
          
          .value {
            font-weight: bold;
          }
          
          .item-row {
            margin-bottom: 8px;
            padding-bottom: 8px;
            border-bottom: 1px dotted #999;
          }
          
          .item-row:last-child {
            border-bottom: none;
          }
          
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
            font-size: 13px;
          }
          
          .total-final {
            font-size: 16px;
            font-weight: bold;
            border-top: 2px solid #000;
            border-bottom: 2px solid #000;
            padding: 8px 0;
            margin-top: 8px;
          }
          
          .mensagem-box {
            background: #f5f5f5;
            padding: 8px;
            margin: 10px 0;
            border: 1px solid #000;
            font-style: italic;
            font-size: 11px;
          }
          
          .footer {
            text-align: center;
            margin-top: 15px;
            padding-top: 10px;
            border-top: 2px dashed #000;
            font-size: 10px;
          }
          
          @media print {
            body {
              padding: 5px;
            }
          }
        </style>
      </head>
      <body>
        <!-- CABEÇALHO -->
        <div class="header">
          <h1>FLORICULTURA ORIENTAL</h1>
          <div class="small">Sao Carlos - SP</div>
          <div class="small">Comprovante de Pedido</div>
        </div>

        <!-- INFORMAÇÕES DO PEDIDO -->
        <div class="section center">
          <div class="large bold">PEDIDO #${pedidoSelecionado.id.slice(0, 8).toUpperCase()}</div>
          <div class="small">Status: ${pedidoSelecionado.status.replace('_', ' ')}</div>
          <div class="small">${formatarDataHora(pedidoSelecionado.createdAt)}</div>
        </div>

        <div class="separator"></div>

        <!-- COMPRADOR -->
        <div class="section">
          <div class="section-title">COMPRADOR</div>
          <div class="label">Nome:</div>
          <div class="value">${pedidoSelecionado.compradorNome}</div>
          <div class="label">Telefone:</div>
          <div class="value">${pedidoSelecionado.compradorTelefone}</div>
          ${pedidoSelecionado.compradorEmail ? `
            <div class="label">E-mail:</div>
            <div class="value small">${pedidoSelecionado.compradorEmail}</div>
          ` : ''}
        </div>

        <div class="separator"></div>

        <!-- DESTINATÁRIO -->
        <div class="section">
          <div class="section-title">DESTINATARIO</div>
          <div class="label">Nome:</div>
          <div class="value">${pedidoSelecionado.destinatarioNome}</div>
          <div class="label">Telefone:</div>
          <div class="value">${pedidoSelecionado.destinatarioTelefone}</div>
        </div>

        <div class="separator"></div>

        <!-- ENDEREÇO -->
        <div class="section">
          <div class="section-title">ENDERECO DE ENTREGA</div>
          <div class="value">${pedidoSelecionado.endereco}, ${pedidoSelecionado.numero}</div>
          ${pedidoSelecionado.complemento ? `<div>${pedidoSelecionado.complemento}</div>` : ''}
          <div>${pedidoSelecionado.bairro}</div>
          <div>${pedidoSelecionado.cidade}/${pedidoSelecionado.estado}</div>
          <div class="label">CEP: ${pedidoSelecionado.cep}</div>
          ${pedidoSelecionado.referencia ? `
            <div class="small" style="margin-top: 5px;">
              Ref: ${pedidoSelecionado.referencia}
            </div>
          ` : ''}
        </div>

        <div class="separator"></div>

        <!-- DATA DE ENTREGA -->
        <div class="section">
          <div class="section-title">DATA DE ENTREGA</div>
          <div class="value">${formatarData(pedidoSelecionado.dataEntrega)}</div>
          <div class="label">Periodo: ${periodoLabels[pedidoSelecionado.periodoEntrega] || pedidoSelecionado.periodoEntrega}</div>
          <div class="label">Tipo: ${pedidoSelecionado.tipoEndereco}</div>
        </div>

        ${pedidoSelecionado.mensagem ? `
          <div class="separator"></div>
          <div class="section">
            <div class="section-title">MENSAGEM DO CARTAO</div>
            <div class="mensagem-box">
              ${pedidoSelecionado.mensagem.replace(/\n/g, '<br>')}
            </div>
          </div>
        ` : ''}

        <div class="separator-double"></div>

        <!-- ITENS -->
        <div class="section">
          <div class="section-title center">ITENS DO PEDIDO</div>
          ${pedidoSelecionado.itens.map(item => `
            <div class="item-row">
              <div class="row">
                <div>${item.quantidade}x ${item.produto.nome}</div>
              </div>
              <div class="row">
                <div class="small">${item.produto.categoria}</div>
                <div class="value">R$ ${(item.precoUnit * item.quantidade).toFixed(2)}</div>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="separator"></div>

        <!-- TOTAIS -->
        <div class="section">
          <div class="total-row">
            <span>Subtotal Produtos:</span>
            <span class="value">R$ ${(pedidoSelecionado.valorProdutos || 0).toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>Taxa de Entrega:</span>
            <span class="value">R$ ${(pedidoSelecionado.valorFrete || 0).toFixed(2)}</span>
          </div>
          <div class="total-row total-final">
            <span>TOTAL:</span>
            <span>R$ ${pedidoSelecionado.valorTotal.toFixed(2)}</span>
          </div>
        </div>

        <div class="separator-double"></div>

        <!-- RODAPÉ -->
        <div class="footer">
          <div class="bold">Obrigado pela preferencia!</div>
          <div style="margin-top: 5px;">
            ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
    </html>
  `

    printWindow.document.write(html)
    printWindow.document.close()
  }

  if (!isMounted) {
    return null
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
                <p className="text-sm text-gray-600">
                  {pedidosFiltrados.length} pedidos encontrados
                </p>
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
                        <Badge
                          className={`${statusColors[pedido.status as keyof typeof statusColors]} border`}
                        >
                          {pedido.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        <Clock className="inline h-3 w-3 mr-1" />
                        Pedido em {formatarDataHora(pedido.createdAt)}
                      </p>
                      <p className="text-sm text-gray-600">
                        <Calendar className="inline h-3 w-3 mr-1" />
                        Entrega: {formatarData(pedido.dataEntrega)} •{' '}
                        {periodoLabels[pedido.periodoEntrega] || pedido.periodoEntrega}
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
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <DialogTitle className="flex items-center gap-2">
                      <span>Pedido #{pedidoSelecionado.id.slice(0, 8).toUpperCase()}</span>
                      <Badge
                        className={
                          statusColors[pedidoSelecionado.status as keyof typeof statusColors]
                        }
                      >
                        {pedidoSelecionado.status.replace('_', ' ')}
                      </Badge>
                    </DialogTitle>
                    <DialogDescription>
                      Realizado em {formatarDataHora(pedidoSelecionado.createdAt)}
                    </DialogDescription>
                  </div>

                  {/* ✅ BOTÃO DE IMPRESSÃO */}
                  <Button
                    onClick={imprimirPedido}
                    variant="outline"
                    size="sm"
                    className="ml-4"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimir
                  </Button>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* Comprador e Destinatário */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Comprador
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm font-medium">{pedidoSelecionado.compradorNome}</p>
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
                      <p className="text-sm font-medium">
                        {pedidoSelecionado.destinatarioNome}
                      </p>
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
                        {formatarData(pedidoSelecionado.dataEntrega)} •{' '}
                        {periodoLabels[pedidoSelecionado.periodoEntrega] ||
                          pedidoSelecionado.periodoEntrega}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Tipo de Endereço</p>
                      <p className="text-sm font-medium capitalize">
                        {pedidoSelecionado.tipoEndereco}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Endereço Completo</p>
                      <p className="text-sm">
                        {pedidoSelecionado.endereco}, {pedidoSelecionado.numero}
                        {pedidoSelecionado.complemento &&
                          ` - ${pedidoSelecionado.complemento}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {pedidoSelecionado.bairro} - {pedidoSelecionado.cidade}/
                        {pedidoSelecionado.estado}
                      </p>
                      <p className="text-sm text-gray-600">
                        CEP: {pedidoSelecionado.cep}
                      </p>
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
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Mensagem do Cartão
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-200 p-6 rounded-lg shadow-sm">
                        <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                          {pedidoSelecionado.mensagem}
                        </p>
                      </div>
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
                      {/* Lista de Produtos */}
                      {pedidoSelecionado.itens.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between pb-3 border-b"
                        >
                          <div>
                            <p className="text-sm font-medium">
                              {item.quantidade}x {item.produto.nome}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.produto.categoria}
                            </p>
                          </div>
                          <p className="text-sm font-bold text-gray-700">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(item.precoUnit * item.quantidade)}
                          </p>
                        </div>
                      ))}

                      {/* Subtotais */}
                      <div className="space-y-2 pt-3 border-t">
                        {/* Subtotal Produtos */}
                        <div className="flex items-center justify-between text-sm">
                          <p className="text-gray-600">Subtotal (Produtos)</p>
                          <p className="font-medium">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(pedidoSelecionado.valorProdutos || 0)}
                          </p>
                        </div>

                        {/* Taxa de Entrega */}
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <Truck className="h-3 w-3 text-blue-600" />
                            <p className="text-gray-600">Taxa de Entrega</p>
                          </div>
                          <p className="font-medium text-blue-600">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(pedidoSelecionado.valorFrete || 0)}
                          </p>
                        </div>

                        {/* Total Final */}
                        <div className="flex items-center justify-between pt-3 border-t-2">
                          <p className="font-bold text-lg">Total</p>
                          <p className="text-2xl font-bold text-green-700">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(pedidoSelecionado.valorTotal)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Ações */}
                <div className="flex flex-wrap gap-3 pt-4">
                  <Button
                    onClick={() =>
                      atualizarStatus(pedidoSelecionado.id, 'CONFIRMADO')
                    }
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={pedidoSelecionado.status === 'CONFIRMADO'}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirmar
                  </Button>
                  <Button
                    onClick={() =>
                      atualizarStatus(pedidoSelecionado.id, 'EM_PREPARO')
                    }
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                    disabled={pedidoSelecionado.status === 'EM_PREPARO'}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Em Preparo
                  </Button>
                  <Button
                    onClick={() =>
                      atualizarStatus(pedidoSelecionado.id, 'SAIU_ENTREGA')
                    }
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                    disabled={pedidoSelecionado.status === 'SAIU_ENTREGA'}
                  >
                    <Truck className="h-4 w-4 mr-2" />
                    Saiu p/ Entrega
                  </Button>
                  <Button
                    onClick={() =>
                      atualizarStatus(pedidoSelecionado.id, 'ENTREGUE')
                    }
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={pedidoSelecionado.status === 'ENTREGUE'}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Entregar
                  </Button>
                  <Button
                    onClick={() =>
                      atualizarStatus(pedidoSelecionado.id, 'CANCELADO')
                    }
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
