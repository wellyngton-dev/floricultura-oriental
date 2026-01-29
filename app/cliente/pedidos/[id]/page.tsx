'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  MapPin,
  Calendar,
  User,
  Phone,
  MessageSquare,
  ShoppingBag
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Pedido {
  id: string
  compradorNome: string
  compradorEmail: string
  compradorTelefone: string
  destinatarioNome: string
  destinatarioTelefone: string
  dataEntrega: string
  periodoEntrega: string
  valorTotal: number
  status: string
  statusPagamento: string
  formaPagamento: string
  mensagem: string | null
  endereco: string
  numero: string
  complemento: string | null
  bairro: string
  cidade: string
  estado: string
  cep: string
  referencia: string | null
  createdAt: string
  itens: {
    id: string
    quantidade: number
    precoUnit: number
    produto: {
      nome: string
      imagemUrl: string | null
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

export default function DetalhesPedidoPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const pedidoId = params.id as string
  
  const [pedido, setPedido] = useState<Pedido | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchPedido()
    }
  }, [status, router, pedidoId])

  const fetchPedido = async () => {
    try {
      const response = await fetch(`/api/clientes/pedidos/${pedidoId}`)
      
      if (!response.ok) {
        router.push('/cliente/pedidos')
        return
      }
      
      const data = await response.json()
      setPedido(data)
    } catch (error) {
      console.error('Erro ao buscar pedido:', error)
      router.push('/cliente/pedidos')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-pink-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando pedido...</p>
        </div>
      </div>
    )
  }

  if (!pedido) {
    return null
  }

  const statusInfo = statusConfig[pedido.status as keyof typeof statusConfig]
  const StatusIcon = statusInfo.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/cliente/pedidos">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Pedido #{pedido.id.slice(0, 8)}
              </h1>
              <p className="text-sm text-gray-600">
                Realizado em {format(new Date(pedido.createdAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Status do Pedido */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Status do Pedido</CardTitle>
              <Badge className={`${statusInfo.color} text-base px-4 py-2`}>
                <StatusIcon className="h-4 w-4 mr-2" />
                {statusInfo.label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Data de Entrega</p>
                  <p className="font-semibold">
                    {format(new Date(pedido.dataEntrega), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                  <p className="text-sm text-gray-600">{pedido.periodoEntrega}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-lg">
                  <ShoppingBag className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Pagamento</p>
                  <p className="font-semibold">{pedido.formaPagamento || 'Não informado'}</p>
                  <p className="text-sm text-gray-600">{pedido.statusPagamento}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Package className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="font-semibold text-xl text-green-600">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(Number(pedido.valorTotal))}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Produtos */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Produtos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pedido.itens.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    {item.produto.imagemUrl ? (
                      <img 
                        src={item.produto.imagemUrl} 
                        alt={item.produto.nome}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{item.produto.nome}</h4>
                    <p className="text-sm text-gray-600">Quantidade: {item.quantidade}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(Number(item.precoUnit))} cada
                    </p>
                    <p className="font-semibold text-gray-900">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(Number(item.precoUnit) * item.quantidade)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between items-center text-lg">
              <span className="font-semibold">Total do Pedido</span>
              <span className="font-bold text-2xl text-green-600">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(Number(pedido.valorTotal))}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Dados do Comprador */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Dados do Comprador
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-gray-600">Nome</p>
                <p className="font-semibold">{pedido.compradorNome}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold">{pedido.compradorEmail}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Telefone</p>
                <p className="font-semibold">{pedido.compradorTelefone}</p>
              </div>
            </CardContent>
          </Card>

          {/* Dados do Destinatário */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Destinatário
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-gray-600">Nome</p>
                <p className="font-semibold">{pedido.destinatarioNome}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Telefone</p>
                <p className="font-semibold">{pedido.destinatarioTelefone}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Endereço de Entrega */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Endereço de Entrega
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="font-semibold">
                {pedido.endereco}, {pedido.numero}
                {pedido.complemento && ` - ${pedido.complemento}`}
              </p>
              <p className="text-gray-600">{pedido.bairro}</p>
              <p className="text-gray-600">
                {pedido.cidade} - {pedido.estado}
              </p>
              <p className="text-gray-600">CEP: {pedido.cep}</p>
              {pedido.referencia && (
                <p className="text-sm text-gray-500 mt-2">
                  <strong>Referência:</strong> {pedido.referencia}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Mensagem */}
        {pedido.mensagem && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Mensagem do Cartão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 italic">"{pedido.mensagem}"</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
