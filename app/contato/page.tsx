'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Logo } from '@/components/logo'
import { COMPANY, getWhatsAppLink } from '@/lib/constants/company'
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  Instagram,
  Facebook,
  Loader2,
  CheckCircle2
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function ContatoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    assunto: '',
    mensagem: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nome || !formData.email || !formData.mensagem) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    setLoading(true)

    // Simular envio (você pode integrar com uma API real depois)
    try {
      // Aqui você pode adicionar a lógica de envio de email
      // Por enquanto, vamos apenas redirecionar para WhatsApp com a mensagem

      const mensagemWhatsApp = `
*Novo Contato do Site*

*Nome:* ${formData.nome}
*E-mail:* ${formData.email}
*Telefone:* ${formData.telefone || 'Não informado'}
*Assunto:* ${formData.assunto || 'Não informado'}

*Mensagem:*
${formData.mensagem}
      `.trim()

      await new Promise(resolve => setTimeout(resolve, 1000)) // Simular delay

      toast.success('Mensagem enviada com sucesso!', {
        description: 'Entraremos em contato em breve.',
      })

      // Limpar formulário
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        assunto: '',
        mensagem: '',
      })

      // Opcional: Abrir WhatsApp com a mensagem
      const whatsappUrl = getWhatsAppLink(mensagemWhatsApp)
      window.open(whatsappUrl, '_blank')

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      toast.error('Erro ao enviar mensagem. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleWhatsAppDirect = () => {
    const mensagem = 'Olá! Gostaria de mais informações sobre os produtos.'
    const url = getWhatsAppLink(mensagem)
    window.open(url, '_blank')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <Logo size="md" variant="light" priority />
            </Link>
            <Link href="/">
              <Button variant="ghost" className="hover:bg-pink-50">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para loja
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-4 py-12">
        {/* Cabeçalho da Página */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Entre em Contato
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Estamos aqui para ajudar! Entre em contato conosco por qualquer um dos canais abaixo.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Coluna Esquerda - Informações de Contato */}
          <div className="lg:col-span-1 space-y-6">
            {/* Telefone */}
            <Card className="border-2 border-pink-100 hover:border-pink-300 transition-colors">
              <CardHeader>
                <div className="bg-pink-100 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                  <Phone className="h-6 w-6 text-pink-600" />
                </div>
                <CardTitle className="text-lg">Telefone</CardTitle>
                <CardDescription>Ligue para nós</CardDescription>
              </CardHeader>
              <CardContent>
                <a
                  href={`tel:${COMPANY.phone}`}
                  className="text-pink-600 hover:text-pink-700 font-semibold text-lg"
                >
                  {COMPANY.phone}
                </a>
              </CardContent>
            </Card>

            {/* E-mail */}
            <Card className="border-2 border-purple-100 hover:border-purple-300 transition-colors">
              <CardHeader>
                <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                  <Mail className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">E-mail</CardTitle>
                <CardDescription>Envie um e-mail</CardDescription>
              </CardHeader>
              <CardContent>
                <a
                  href={`mailto:${COMPANY.email}`}
                  className="text-purple-600 hover:text-purple-700 font-semibold break-all"
                >
                  {COMPANY.email}
                </a>
              </CardContent>
            </Card>

            {/* Endereço */}
            <Card className="border-2 border-green-100 hover:border-green-300 transition-colors">
              <CardHeader>
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                  <MapPin className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">Endereço</CardTitle>
                <CardDescription>Visite nossa loja</CardDescription>
              </CardHeader>
              <CardContent>
                <a
                  href={COMPANY.maps.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  {COMPANY.address.street}, {COMPANY.address.number}<br />
                  {COMPANY.address.neighborhood}<br />
                  {COMPANY.address.city} - {COMPANY.address.state}<br />
                  CEP: {COMPANY.address.zip}
                </a>
              </CardContent>
            </Card>

            {/* Horário */}
            <Card className="border-2 border-blue-100 hover:border-blue-300 transition-colors">
              <CardHeader>
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Horário</CardTitle>
                <CardDescription>Estamos abertos</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 font-medium">
                  {COMPANY.hours.display}
                </p>
              </CardContent>
            </Card>

            {/* WhatsApp */}
            <Card className="border-2 border-green-100 bg-green-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-green-600" />
                  Atendimento Rápido
                </CardTitle>
                <CardDescription>Fale conosco agora</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleWhatsAppDirect}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Chamar no WhatsApp
                </Button>
              </CardContent>
            </Card>

            {/* Redes Sociais */}
            <Card className="border-2 border-gray-100">
              <CardHeader>
                <CardTitle className="text-lg">Redes Sociais</CardTitle>
                <CardDescription>Siga-nos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Button
                    size="icon"
                    variant="outline"
                    className="hover:bg-pink-50 hover:border-pink-300"
                    asChild
                  >
                    <a
                      href={COMPANY.social.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram"
                    >
                      <Instagram className="h-5 w-5 text-pink-600" />
                    </a>
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="hover:bg-blue-50 hover:border-blue-300"
                    asChild
                  >
                    <a
                      href={COMPANY.social.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Facebook"
                    >
                      <Facebook className="h-5 w-5 text-blue-600" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna Direita - Formulário de Contato */}
          <div className="lg:col-span-2">
            <Card className="border-2 border-gray-100 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl">Envie sua Mensagem</CardTitle>
                <CardDescription>
                  Preencha o formulário abaixo e entraremos em contato o mais breve possível.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nome">Nome Completo *</Label>
                      <Input
                        id="nome"
                        required
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        placeholder="Seu nome"
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">E-mail *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="seu@email.com"
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input
                        id="telefone"
                        type="tel"
                        value={formData.telefone}
                        onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                        placeholder="(00) 00000-0000"
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="assunto">Assunto</Label>
                      <Input
                        id="assunto"
                        value={formData.assunto}
                        onChange={(e) => setFormData({ ...formData, assunto: e.target.value })}
                        placeholder="Motivo do contato"
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="mensagem">Mensagem *</Label>
                    <Textarea
                      id="mensagem"
                      required
                      value={formData.mensagem}
                      onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                      placeholder="Digite sua mensagem..."
                      rows={6}
                      className="mt-2 resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 h-12 text-lg font-semibold"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Enviar Mensagem
                      </>
                    )}
                  </Button>

                  <p className="text-sm text-gray-500 text-center">
                    * Campos obrigatórios
                  </p>
                </form>
              </CardContent>
            </Card>

            {/* Mapa (Opcional) */}
            <Card className="mt-6 border-2 border-gray-100 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl">Nossa Localização</CardTitle>
                <CardDescription>Visite nossa loja física</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="aspect-video w-full">
                  <iframe
                    src={COMPANY.maps.embed}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Mapa de localização"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Seção de Benefícios */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="text-center border-2 border-pink-100">
            <CardContent className="pt-6">
              <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-pink-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Resposta Rápida</h3>
              <p className="text-gray-600 text-sm">
                Respondemos todas as mensagens em até 24 horas
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-2 border-purple-100">
            <CardContent className="pt-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Atendimento Personalizado</h3>
              <p className="text-gray-600 text-sm">
                Equipe dedicada para te ajudar com suas dúvidas
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-2 border-green-100">
            <CardContent className="pt-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Múltiplos Canais</h3>
              <p className="text-gray-600 text-sm">
                Fale conosco por WhatsApp, telefone ou e-mail
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
