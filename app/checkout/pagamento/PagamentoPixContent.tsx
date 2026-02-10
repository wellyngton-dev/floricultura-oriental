'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PixQRCode } from '@/components/checkout/PixQRCode'
import { Header } from '@/components/Header'
import { PAYMENT_CONFIG_PUBLIC, getWhatsAppComprovanteLink } from '@/lib/constants/payment-public'
import { gerarPixCopiaCola } from '@/lib/utils/pix'
import {
  Clock,
  CheckCircle,
  AlertCircle,
  MessageCircle,
  ArrowLeft,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

export default function PagamentoPixContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [pedidoId, setPedidoId] = useState('')
  const [valor, setValor] = useState(0)
  const [pixCopiaCola, setPixCopiaCola] = useState('')
  const [loading, setLoading] = useState(true)
  const [tempoRestante, setTempoRestante] = useState(PAYMENT_CONFIG_PUBLIC.tempoExpiracao * 60)
  const [cartModalOpen, setCartModalOpen] = useState(false)
  const [favoritesModalOpen, setFavoritesModalOpen] = useState(false)

  useEffect(() => {
    const id = searchParams.get('pedido')
    const valorPedido = searchParams.get('valor')

    if (!id || !valorPedido) {
      toast.error('Dados do pedido não encontrados')
      router.push('/')
      return
    }

    setPedidoId(id)
    const valorNumerico = parseFloat(valorPedido)
    setValor(valorNumerico)

    const codigoPix = gerarPixCopiaCola({
      chavePix: PAYMENT_CONFIG_PUBLIC.pix.chavePix,
      nomeBeneficiario: PAYMENT_CONFIG_PUBLIC.pix.nomeBeneficiario,
      cidade: PAYMENT_CONFIG_PUBLIC.pix.cidade,
      valor: valorNumerico,
      identificador: id,
      descricao: 'Pedido Floricultura',
    })

    console.log('📱 Código PIX gerado:', codigoPix)
    console.log('🔑 Chave PIX:', PAYMENT_CONFIG_PUBLIC.pix.chavePix)
    console.log('👤 Beneficiário:', PAYMENT_CONFIG_PUBLIC.pix.nomeBeneficiario)

    setPixCopiaCola(codigoPix)
    setLoading(false)
  }, [searchParams, router])

  useEffect(() => {
    if (tempoRestante <= 0) return

    const interval = setInterval(() => {
      setTempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          toast.error('Tempo expirado! Gere um novo PIX.')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [tempoRestante])

  const formatarTempo = (segundos: number) => {
    const minutos = Math.floor(segundos / 60)
    const segs = segundos % 60
    return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`
  }

  const enviarComprovante = () => {
    const url = getWhatsAppComprovanteLink(pedidoId, valor)
    window.open(url, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-pink-600 mx-auto mb-4" />
          <p className="text-gray-600">Gerando pagamento PIX...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <Header
        onCartClick={() => setCartModalOpen(true)}
        onFavoritesClick={() => setFavoritesModalOpen(true)}
      />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Pagamento via PIX
          </h1>
          <p className="text-gray-600 text-lg">
            Pedido <span className="font-semibold">#{pedidoId}</span>
          </p>
        </div>

        {/* Timer */}
        <Card className={`mb-6 border-2 ${
          tempoRestante < 300 ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className={`h-5 w-5 ${
                  tempoRestante < 300 ? 'text-red-600' : 'text-blue-600'
                }`} />
                <span className={`font-semibold ${
                  tempoRestante < 300 ? 'text-red-800' : 'text-blue-800'
                }`}>
                  Tempo restante:
                </span>
              </div>
              <span className={`text-2xl font-bold ${
                tempoRestante < 300 ? 'text-red-700' : 'text-blue-700'
              }`}>
                {formatarTempo(tempoRestante)}
              </span>
            </div>
            {tempoRestante < 300 && (
              <p className="text-sm text-red-700 mt-2">
                ⚠️ Pagamento expira em breve! Complete o pagamento agora.
              </p>
            )}
          </CardContent>
        </Card>

        {/* QR Code e Código PIX */}
        <Card className="border-2 border-gray-100 shadow-xl mb-6">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
            <CardTitle className="text-center">
              <div className="text-4xl font-bold text-green-700 mb-1">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(valor)}
              </div>
              <p className="text-sm text-gray-600 font-normal">
                Valor total do pedido
              </p>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            <PixQRCode pixCopiaCola={pixCopiaCola} valor={valor} />
          </CardContent>
        </Card>

        {/* Informações do Beneficiário */}
        <Card className="border-2 border-gray-100 mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Dados do Beneficiário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Nome:</span>
              <span className="font-semibold">{PAYMENT_CONFIG_PUBLIC.pix.nomeBeneficiario}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Banco:</span>
              <span className="font-semibold">{PAYMENT_CONFIG_PUBLIC.pix.banco}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Cidade:</span>
              <span className="font-semibold">{PAYMENT_CONFIG_PUBLIC.pix.cidade}</span>
            </div>
          </CardContent>
        </Card>

        {/* Instruções */}
        <Card className="border-2 border-purple-100 bg-purple-50 mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-purple-600" />
              Instruções de Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {PAYMENT_CONFIG_PUBLIC.pix.instrucoes.map((instrucao, index) => (
                <li key={index} className="flex gap-3 text-sm text-gray-700">
                  <span className="flex-shrink-0 w-7 h-7 bg-purple-200 text-purple-700 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <span className="leading-7">{instrucao}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        {/* Botão Enviar Comprovante */}
        <Button
          onClick={enviarComprovante}
          className="w-full bg-green-600 hover:bg-green-700 h-14 text-lg font-semibold mb-4"
        >
          <MessageCircle className="h-5 w-5 mr-2" />
          Enviar Comprovante via WhatsApp
        </Button>

        {/* Aviso Importante */}
        <Card className="bg-yellow-50 border-2 border-yellow-200 mb-6">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-1">⚠️ Importante:</p>
                <p>
                  Após realizar o pagamento, <strong>envie o comprovante pelo WhatsApp</strong> para confirmarmos seu pedido rapidamente!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botão Voltar */}
        <Button
          variant="outline"
          onClick={() => router.push('/')}
          className="w-full border-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para a loja
        </Button>
      </main>
    </div>
  )
}
