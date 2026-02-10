'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Copy, Check, Download, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

interface PixQRCodeProps {
  pixCopiaCola: string
  valor: number
}

export function PixQRCode({ pixCopiaCola, valor }: PixQRCodeProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [copiado, setCopiado] = useState(false)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(false)

  useEffect(() => {
    if (!pixCopiaCola) return

    console.log('🎨 Gerando QR Code...')
    setLoading(true)
    setErro(false)

    // Gerar QR Code como Data URL
    QRCode.toDataURL(
      pixCopiaCola,
      {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'M',
      }
    )
      .then((url) => {
        console.log('✅ QR Code gerado com sucesso!')
        setQrCodeUrl(url)
        setLoading(false)
      })
      .catch((error) => {
        console.error('❌ Erro ao gerar QR Code:', error)
        setErro(true)
        setLoading(false)
        toast.error('Erro ao gerar QR Code. Use o código Copia e Cola.')
      })
  }, [pixCopiaCola])

  const copiarCodigoPix = () => {
    navigator.clipboard.writeText(pixCopiaCola)
    setCopiado(true)
    toast.success('Código PIX copiado!')

    setTimeout(() => setCopiado(false), 3000)
  }

  const baixarQRCode = () => {
    if (!qrCodeUrl) return

    const link = document.createElement('a')
    link.download = `qrcode-pix-${Date.now()}.png`
    link.href = qrCodeUrl
    link.click()
    toast.success('QR Code baixado!')
  }

  return (
    <div className="space-y-6">
      {/* QR Code */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg">
        <div className="flex justify-center mb-4">
          {loading ? (
            <div className="w-[300px] h-[300px] bg-gray-100 rounded-lg animate-pulse flex flex-col items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-pink-600" />
              <p className="text-gray-400 text-sm">Gerando QR Code...</p>
            </div>
          ) : erro ? (
            <div className="w-[300px] h-[300px] bg-red-50 rounded-lg flex flex-col items-center justify-center gap-3 border-2 border-red-200">
              <AlertCircle className="h-12 w-12 text-red-500" />
              <p className="text-red-600 text-sm text-center px-4">
                Não foi possível gerar o QR Code.<br />
                Use o código Copia e Cola abaixo.
              </p>
            </div>
          ) : qrCodeUrl ? (
            <div className="relative">
              <Image
                src={qrCodeUrl}
                alt="QR Code PIX"
                width={300}
                height={300}
                className="rounded-lg shadow-md"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-lg pointer-events-none" />
            </div>
          ) : null}
        </div>
        
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600 font-medium">
            {qrCodeUrl ? 'Escaneie com o app do seu banco' : 'Use o código PIX abaixo'}
          </p>
          <div className="inline-flex items-center justify-center bg-green-50 border-2 border-green-200 rounded-lg px-6 py-3">
            <p className="text-2xl font-bold text-green-700">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(valor)}
            </p>
          </div>
        </div>
      </div>

      {/* Botão Baixar QR Code */}
      {qrCodeUrl && (
        <Button
          onClick={baixarQRCode}
          variant="outline"
          className="w-full border-2 h-12 font-semibold"
        >
          <Download className="h-5 w-5 mr-2" />
          Baixar QR Code
        </Button>
      )}

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-gray-50 text-gray-600 font-medium">
            ou copie o código PIX
          </span>
        </div>
      </div>

      {/* Código PIX Copia e Cola */}
      <Card className="bg-gray-50 border-2 border-gray-200">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <AlertCircle className="h-4 w-4" />
            Código PIX Copia e Cola:
          </div>
          
          <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
            <p className="text-xs font-mono break-all text-gray-700 leading-relaxed select-all">
              {pixCopiaCola}
            </p>
          </div>
          
          <Button
            onClick={copiarCodigoPix}
            variant={copiado ? 'default' : 'outline'}
            className={`w-full h-12 font-semibold transition-all ${
              copiado
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'border-2'
            }`}
          >
            {copiado ? (
              <>
                <Check className="h-5 w-5 mr-2" />
                Código Copiado!
              </>
            ) : (
              <>
                <Copy className="h-5 w-5 mr-2" />
                Copiar Código PIX
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Informações Adicionais */}
      <Card className="bg-blue-50 border-2 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Como pagar:</p>
              <ol className="list-decimal list-inside space-y-1 text-blue-700">
                <li>Abra o app do seu banco</li>
                <li>Escolha PIX → Ler QR Code ou PIX Copia e Cola</li>
                <li>Confirme o valor e pague</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
