'use client'

import { useState, useEffect, SetStateAction } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft,
  ShoppingBag,
  Trash2,
  Sparkles,
  Package,
  User,
  MapPin,
  MessageSquare,
  Building2,
  Home,
  Plus,
  Minus,
  Loader2,
  Calendar,
  Clock,
  Check,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, removeItem, updateQuantity, totalItems, totalPrice, clearCart } = useCart()

  const [formData, setFormData] = useState({
    // Dados do Comprador
    compradorNome: '',
    compradorEmail: '',
    compradorTelefone: '',
    compradorDDD: '+55',
    
    // Dados do Destinatário
    destinatarioNome: '',
    destinatarioTelefone: '',
    destinatarioDDD: '+55',
    
    // Data e Horário
    dataEntrega: '',
    dataEntregaDisplay: 'HOJE',
    periodoEntrega: 'manha',
    periodoEntregaDisplay: 'Manhã • 08h às 13h',
    
    // Cartão de mensagem
    adicionarCartao: false,
    mensagemCartao: '',
    
    // Endereço de entrega
    tipoEndereco: 'residencial',
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: 'SP',
    referencia: '',
  })

  const [loading, setLoading] = useState(false)
  const [loadingCep, setLoadingCep] = useState(false)
  const [diasDisponiveis, setDiasDisponiveis] = useState<any[]>([])

  // Gerar próximos 7 dias disponíveis
  useEffect(() => {
    const hoje = new Date()
    const horaAtual = hoje.getHours()
    const dias: SetStateAction<any[]> = []

    // Se for antes das 17h, pode entregar hoje
    const inicioIndex = horaAtual < 17 ? 0 : 1

    for (let i = inicioIndex; i < inicioIndex + 7; i++) {
      const data = new Date()
      data.setDate(hoje.getDate() + i)
      
      const diaSemana = ['DOMINGO', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO']
      const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
      
      let label = diaSemana[data.getDay()]
      if (i === 0) label = 'HOJE'
      else if (i === 1) label = 'AMANHÃ'

      dias.push({
        label,
        data: data.toISOString().split('T')[0],
        dataFormatada: `${data.getDate()} de ${meses[data.getMonth()]}`,
        diaSemana: diaSemana[data.getDay()],
      })
    }

    setDiasDisponiveis(dias)
    
    // Definir primeiro dia como padrão
    if (dias.length > 0) {
      setFormData(prev => ({
        ...prev,
        dataEntrega: dias[0].data,
        dataEntregaDisplay: `${dias[0].label} • ${dias[0].dataFormatada}`,
      }))
    }
  }, [])

  const periodos = [
    {
      id: 'manha',
      label: 'Manhã • 08h às 13h',
      inicio: '08:00',
      fim: '13:00',
    },
    {
      id: 'tarde',
      label: 'Tarde • 13h às 19h',
      inicio: '13:00',
      fim: '19:00',
    },
    {
      id: 'comercial',
      label: 'Comercial • 08h às 19h',
      inicio: '08:00',
      fim: '19:00',
    },
    {
      id: 'noite',
      label: 'Noite • 19h às 23h30',
      inicio: '19:00',
      fim: '23:30',
    },
  ]

  // Buscar endereço pelo CEP
  const buscarCep = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, '')

    if (cepLimpo.length !== 8) {
      return
    }

    setLoadingCep(true)

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      const data = await response.json()

      if (data.erro) {
        toast.error('CEP não encontrado')
        return
      }

      setFormData(prev => ({
        ...prev,
        endereco: data.logradouro || '',
        bairro: data.bairro || '',
        cidade: data.localidade || '',
        estado: data.uf || 'SP',
        complemento: data.complemento || prev.complemento,
      }))

      toast.success('Endereço encontrado!')
      
      setTimeout(() => {
        document.getElementById('numero')?.focus()
      }, 100)
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
      toast.error('Erro ao buscar CEP')
    } finally {
      setLoadingCep(false)
    }
  }

  // Formatar CEP enquanto digita
  const handleCepChange = (value: string) => {
    let cep = value.replace(/\D/g, '')
    cep = cep.slice(0, 8)
    
    if (cep.length > 5) {
      cep = `${cep.slice(0, 5)}-${cep.slice(5)}`
    }
    
    setFormData({ ...formData, cep })

    if (cep.replace(/\D/g, '').length === 8) {
      buscarCep(cep)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (items.length === 0) {
      toast.error('Carrinho vazio')
      return
    }

    // Validações
    if (!formData.compradorNome || !formData.compradorEmail || !formData.compradorTelefone) {
      toast.error('Preencha todos os dados do comprador')
      return
    }

    if (!formData.destinatarioNome || !formData.destinatarioTelefone) {
      toast.error('Preencha os dados do destinatário')
      return
    }

    if (!formData.cep || !formData.endereco || !formData.numero || !formData.bairro || !formData.cidade) {
      toast.error('Preencha o endereço completo')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comprador: {
            nome: formData.compradorNome,
            email: formData.compradorEmail,
            telefone: `${formData.compradorDDD}${formData.compradorTelefone}`,
          },
          destinatario: {
            nome: formData.destinatarioNome,
            telefone: `${formData.destinatarioDDD}${formData.destinatarioTelefone}`,
          },
          itens: items.map(item => ({
            produtoId: item.id,
            quantidade: item.quantidade,
            precoUnit: item.preco,
          })),
          entrega: {
            tipoEndereco: formData.tipoEndereco,
            dataEntrega: formData.dataEntrega,
            periodoEntrega: formData.periodoEntrega,
            cep: formData.cep,
            endereco: formData.endereco,
            numero: formData.numero,
            complemento: formData.complemento,
            bairro: formData.bairro,
            cidade: formData.cidade,
            estado: formData.estado,
            referencia: formData.referencia,
          },
          mensagem: formData.adicionarCartao ? formData.mensagemCartao : null,
          valorTotal: totalPrice,
        }),
      })

      if (response.ok) {
        toast.success('Pedido realizado com sucesso!')
        clearCart()
        setTimeout(() => router.push('/'), 2000)
      } else {
        toast.error('Erro ao criar pedido')
      }
    } catch (error) {
      console.error(error)
      toast.error('Erro ao finalizar pedido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-2 rounded-full">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Floricultura Oriental
                </h1>
                <p className="text-xs text-gray-500">Finalizar Pedido</p>
              </div>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {items.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-200 rounded-full mb-6">
              <ShoppingBag className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Carrinho vazio</h2>
            <p className="text-gray-500 mb-6">Adicione produtos para continuar</p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Continuar Comprando
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Formulário */}
            <div className="lg:col-span-2 space-y-6">
              {/* SEUS DADOS */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-pink-600" />
                    SEUS DADOS
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Nome Completo *</Label>
                    <Input
                      required
                      value={formData.compradorNome}
                      onChange={(e) => setFormData({ ...formData, compradorNome: e.target.value })}
                      placeholder="Seu nome completo"
                    />
                  </div>
                  <div>
                    <Label>E-mail *</Label>
                    <Input
                      type="email"
                      required
                      value={formData.compradorEmail}
                      onChange={(e) => setFormData({ ...formData, compradorEmail: e.target.value })}
                      placeholder="seu@email.com"
                    />
                  </div>
                  <div>
                    <Label>Telefone *</Label>
                    <div className="flex gap-2">
                      <Select value={formData.compradorDDD} onValueChange={(v) => setFormData({ ...formData, compradorDDD: v })}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="+55">🇧🇷 +55</SelectItem>
                          <SelectItem value="+1">🇺🇸 +1</SelectItem>
                          <SelectItem value="+351">🇵🇹 +351</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        required
                        value={formData.compradorTelefone}
                        onChange={(e) => setFormData({ ...formData, compradorTelefone: e.target.value })}
                        placeholder="(16) 99999-9999"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* PARA QUEM VAMOS ENTREGAR */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-pink-600" />
                    PARA QUEM VAMOS ENTREGAR?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Nome do Destinatário *</Label>
                    <Input
                      required
                      value={formData.destinatarioNome}
                      onChange={(e) => setFormData({ ...formData, destinatarioNome: e.target.value })}
                      placeholder="Nome de quem vai receber"
                    />
                  </div>
                  <div>
                    <Label>Telefone do Destinatário *</Label>
                    <div className="flex gap-2">
                      <Select value={formData.destinatarioDDD} onValueChange={(v) => setFormData({ ...formData, destinatarioDDD: v })}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="+55">🇧🇷 +55</SelectItem>
                          <SelectItem value="+1">🇺🇸 +1</SelectItem>
                          <SelectItem value="+351">🇵🇹 +351</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        required
                        value={formData.destinatarioTelefone}
                        onChange={(e) => setFormData({ ...formData, destinatarioTelefone: e.target.value })}
                        placeholder="(16) 99999-9999"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* QUANDO VAMOS ENTREGAR */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-pink-600" />
                    QUANDO VAMOS ENTREGAR?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Seleção de Data */}
                  <div>
                    <Label className="mb-3 block">Data de Entrega *</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {diasDisponiveis.map((dia) => (
                        <button
                          key={dia.data}
                          type="button"
                          onClick={() => setFormData({ 
                            ...formData, 
                            dataEntrega: dia.data,
                            dataEntregaDisplay: `${dia.label} • ${dia.dataFormatada}`,
                          })}
                          className={`p-3 border-2 rounded-lg text-left transition-all ${
                            formData.dataEntrega === dia.data
                              ? 'border-pink-500 bg-pink-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {dia.label}
                              </p>
                              <p className="text-xs text-gray-500">
                                {dia.dataFormatada}
                              </p>
                            </div>
                            {formData.dataEntrega === dia.data && (
                              <Check className="h-4 w-4 text-pink-600" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      ⏰ Pedidos feitos até 17h podem ser entregues no mesmo dia
                    </p>
                  </div>

                  {/* Seleção de Período */}
                  <div>
                    <Label className="mb-3 block">Período de Entrega *</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {periodos.map((periodo) => (
                        <button
                          key={periodo.id}
                          type="button"
                          onClick={() => setFormData({ 
                            ...formData, 
                            periodoEntrega: periodo.id,
                            periodoEntregaDisplay: periodo.label,
                          })}
                          className={`p-3 border-2 rounded-lg text-left transition-all ${
                            formData.periodoEntrega === periodo.id
                              ? 'border-pink-500 bg-pink-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <p className="text-sm font-medium text-gray-900">
                                {periodo.label}
                              </p>
                            </div>
                            {formData.periodoEntrega === periodo.id && (
                              <Check className="h-4 w-4 text-pink-600" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      📦 Intervalo aproximado de 2 horas dentro do período selecionado
                    </p>
                  </div>

                  {/* Resumo da Entrega */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Calendar className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-blue-900 mb-1">
                          Resumo da Entrega
                        </p>
                        <p className="text-sm text-blue-700">
                          <span className="font-medium">Data:</span> {formData.dataEntregaDisplay}
                        </p>
                        <p className="text-sm text-blue-700">
                          <span className="font-medium">Período:</span> {formData.periodoEntregaDisplay}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* CARTÃO DE MENSAGEM */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-pink-600" />
                    QUER ADICIONAR CARTÃO DE MENSAGEM?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup
                    value={formData.adicionarCartao ? 'sim' : 'nao'}
                    onValueChange={(v) => setFormData({ ...formData, adicionarCartao: v === 'sim' })}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sim" id="sim" />
                      <Label htmlFor="sim" className="cursor-pointer">SIM</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="nao" id="nao" />
                      <Label htmlFor="nao" className="cursor-pointer">NÃO</Label>
                    </div>
                  </RadioGroup>

                  {formData.adicionarCartao && (
                    <Textarea
                      value={formData.mensagemCartao}
                      onChange={(e) => setFormData({ ...formData, mensagemCartao: e.target.value })}
                      placeholder="Digite sua mensagem..."
                      rows={4}
                      className="resize-none"
                    />
                  )}
                </CardContent>
              </Card>

              {/* ONDE VAMOS ENTREGAR */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-pink-600" />
                    ONDE VAMOS ENTREGAR?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="mb-3 block">TIPO DE ENDEREÇO</Label>
                    <RadioGroup
                      value={formData.tipoEndereco}
                      onValueChange={(v) => setFormData({ ...formData, tipoEndereco: v })}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="residencial" id="residencial" />
                        <Label htmlFor="residencial" className="flex items-center gap-2 cursor-pointer">
                          <Home className="h-4 w-4" />
                          RESIDENCIAL
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="comercial" id="comercial" />
                        <Label htmlFor="comercial" className="flex items-center gap-2 cursor-pointer">
                          <Building2 className="h-4 w-4" />
                          COMERCIAL
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label>CEP *</Label>
                    <div className="relative">
                      <Input
                        required
                        value={formData.cep}
                        onChange={(e) => handleCepChange(e.target.value)}
                        placeholder="00000-000"
                        maxLength={9}
                        className="pr-10"
                      />
                      {loadingCep && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Loader2 className="h-4 w-4 animate-spin text-pink-600" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Digite o CEP para buscar o endereço automaticamente
                    </p>
                  </div>

                  <div>
                    <Label>Endereço *</Label>
                    <Input
                      required
                      value={formData.endereco}
                      onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                      placeholder="Rua, Avenida..."
                      disabled={loadingCep}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Número *</Label>
                      <Input
                        id="numero"
                        required
                        value={formData.numero}
                        onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                        placeholder="123"
                      />
                    </div>
                    <div>
                      <Label>Complemento</Label>
                      <Input
                        value={formData.complemento}
                        onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                        placeholder="Apto, Bloco..."
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Bairro *</Label>
                    <Input
                      required
                      value={formData.bairro}
                      onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                      placeholder="Nome do bairro"
                      disabled={loadingCep}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Cidade *</Label>
                      <Input
                        required
                        value={formData.cidade}
                        onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                        placeholder="Cidade"
                        disabled={loadingCep}
                      />
                    </div>
                    <div>
                      <Label>Estado *</Label>
                      <Select 
                        value={formData.estado} 
                        onValueChange={(v) => setFormData({ ...formData, estado: v })}
                        disabled={loadingCep}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="UF" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AC">Acre</SelectItem>
                          <SelectItem value="AL">Alagoas</SelectItem>
                          <SelectItem value="AP">Amapá</SelectItem>
                          <SelectItem value="AM">Amazonas</SelectItem>
                          <SelectItem value="BA">Bahia</SelectItem>
                          <SelectItem value="CE">Ceará</SelectItem>
                          <SelectItem value="DF">Distrito Federal</SelectItem>
                          <SelectItem value="ES">Espírito Santo</SelectItem>
                          <SelectItem value="GO">Goiás</SelectItem>
                          <SelectItem value="MA">Maranhão</SelectItem>
                          <SelectItem value="MT">Mato Grosso</SelectItem>
                          <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                          <SelectItem value="MG">Minas Gerais</SelectItem>
                          <SelectItem value="PA">Pará</SelectItem>
                          <SelectItem value="PB">Paraíba</SelectItem>
                          <SelectItem value="PR">Paraná</SelectItem>
                          <SelectItem value="PE">Pernambuco</SelectItem>
                          <SelectItem value="PI">Piauí</SelectItem>
                          <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                          <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                          <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                          <SelectItem value="RO">Rondônia</SelectItem>
                          <SelectItem value="RR">Roraima</SelectItem>
                          <SelectItem value="SC">Santa Catarina</SelectItem>
                          <SelectItem value="SP">São Paulo</SelectItem>
                          <SelectItem value="SE">Sergipe</SelectItem>
                          <SelectItem value="TO">Tocantins</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Ponto de Referência</Label>
                    <Input
                      value={formData.referencia}
                      onChange={(e) => setFormData({ ...formData, referencia: e.target.value })}
                      placeholder="Próximo ao..."
                    />
                  </div>
                </CardContent>
              </Card>

              <Button
                type="submit"
                disabled={loading || loadingCep}
                className="w-full h-12 bg-green-700 hover:bg-green-800 text-white text-base font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Processando...
                  </>
                ) : (
                  'FINALIZAR PEDIDO'
                )}
              </Button>
            </div>

            {/* Resumo do Pedido */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5 text-pink-600" />
                      Resumo
                    </span>
                    <span className="text-sm font-normal text-gray-500">
                      {totalItems} {totalItems === 1 ? 'item' : 'itens'}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3 pb-3 border-b last:border-0">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {item.imagemUrl ? (
                            <Image
                              src={item.imagemUrl}
                              alt={item.nome}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                            {item.nome}
                          </h4>
                          <p className="text-sm font-bold text-gray-900 mb-2">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(item.preco * item.quantidade)}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 border rounded-md">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 hover:bg-gray-100"
                                onClick={() => updateQuantity(item.id, item.quantidade - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="text-xs font-medium w-6 text-center">
                                {item.quantidade}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 hover:bg-gray-100"
                                onClick={() => updateQuantity(item.id, item.quantidade + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                removeItem(item.id)
                                toast.success('Item removido')
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Subtotal</span>
                      <span>
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(totalPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Frete</span>
                      <span className="text-green-600 font-medium">Grátis</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                      <span>Total</span>
                      <span className="text-green-700">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(totalPrice)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}
