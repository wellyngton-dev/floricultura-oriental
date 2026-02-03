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
import { Logo } from '@/components/logo'
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
  Info,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, removeItem, updateQuantity, totalItems, totalPrice, clearCart } = useCart()
  const { data: session, status } = useSession()

  const [formData, setFormData] = useState({
    // Dados do Comprador
    compradorNome: '',
    compradorEmail: '', // 🆕 OPCIONAL
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

  // ✅ PREENCHER DADOS DO CLIENTE LOGADO AUTOMATICAMENTE
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const user = session.user as any

      setFormData((prev) => ({
        ...prev,
        compradorNome: user.nome || user.name || prev.compradorNome,
        compradorEmail: user.email || prev.compradorEmail,
        compradorTelefone: user.telefone?.replace('+55', '') || prev.compradorTelefone,
        cep: user.cep || prev.cep,
        endereco: user.endereco || prev.endereco,
        numero: user.numero || prev.numero,
        complemento: user.complemento || prev.complemento,
        bairro: user.bairro || prev.bairro,
        cidade: user.cidade || prev.cidade,
        estado: user.estado || prev.estado,
      }))

      toast.success('Dados preenchidos automaticamente!')
    }
  }, [status, session])

  // Gerar próximos 7 dias disponíveis (EXCLUINDO DOMINGOS)
  // Gerar próximos 7 dias disponíveis (EXCLUINDO DOMINGOS) - VERSÃO UTC CORRIGIDA
  useEffect(() => {
    const hoje = new Date()
    const horaAtual = hoje.getHours()
    const dias: SetStateAction<any[]> = []

    // Se for antes das 17h, pode entregar hoje (se não for domingo)
    const inicioIndex = horaAtual < 17 ? 0 : 1

    let diasAdicionados = 0
    let offset = inicioIndex

    const nomesDiasSemana = ['DOMINGO', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO']
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

    // Adicionar até 7 dias úteis (sem domingos)
    while (diasAdicionados < 7) {
      // 🔧 Criar data de forma mais segura
      const data = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + offset)

      const diaSemanaNumero = data.getDay() // 0 = Domingo, 6 = Sábado

      // PULAR DOMINGOS
      if (diaSemanaNumero === 0) {
        offset++
        continue
      }

      // Pegar o nome do dia da semana
      const diaSemana = nomesDiasSemana[diaSemanaNumero]

      // Label para exibição (HOJE, AMANHÃ, ou nome do dia)
      let labelDisplay = diaSemana
      if (offset === 0) labelDisplay = 'HOJE'
      else if (offset === 1) labelDisplay = 'AMANHÃ'

      // 🔧 Formatar data ISO de forma segura
      const ano = data.getFullYear()
      const mes = String(data.getMonth() + 1).padStart(2, '0')
      const dia = String(data.getDate()).padStart(2, '0')
      const dataISO = `${ano}-${mes}-${dia}`

      dias.push({
        label: labelDisplay,
        data: dataISO,
        dataFormatada: `${data.getDate()} de ${meses[data.getMonth()]}`,
        diaSemana: diaSemana,
        diaSemanaNumero: diaSemanaNumero,
      })

      diasAdicionados++
      offset++
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

  // 🆕 PERÍODOS COM REGRAS ESPECIAIS PARA SÁBADO
  const periodos = [
    {
      id: 'manha',
      label: 'Manhã • 08h às 13h',
      labelSabado: 'Manhã • 08h às 12h', // 🆕 Sábado termina mais cedo
      inicio: '08:00',
      fim: '13:00',
      fimSabado: '12:00', // 🆕 Fim diferente no sábado
    },
    {
      id: 'tarde',
      label: 'Tarde • 13h às 19h',
      inicio: '13:00',
      fim: '19:00',
      disponivelSabado: false, // 🆕 Não disponível aos sábados
    },
    {
      id: 'comercial',
      label: 'Comercial • 08h às 19h',
      inicio: '08:00',
      fim: '19:00',
      disponivelSabado: false, // 🆕 Não disponível aos sábados
    },
    {
      id: 'noite',
      label: 'Noite • 19h às 23h30',
      inicio: '19:00',
      fim: '23:30',
      disponivelSabado: false, // 🆕 Não disponível aos sábados
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

  // 🆕 Adicionar ANTES do return, junto com as outras funções (linha ~200)
  const handleDataChange = (dia: any) => {

    const novoFormData = {
      ...formData,
      dataEntrega: dia.data,
      dataEntregaDisplay: `${dia.label} • ${dia.dataFormatada}`,
    }

    // 🆕 Se for sábado e período não for manhã, resetar
    if (dia.diaSemanaNumero === 6 && formData.periodoEntrega !== 'manha') {
      novoFormData.periodoEntrega = 'manha'
      novoFormData.periodoEntregaDisplay = 'Manhã • 08h às 12h'
    }

    setFormData(novoFormData)
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (items.length === 0) {
      toast.error('Carrinho vazio')
      return
    }

    // 🆕 VALIDAÇÕES SIMPLIFICADAS - EMAIL OPCIONAL
    if (!formData.compradorNome || !formData.compradorTelefone) {
      toast.error('Preencha seu nome e telefone')
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
      const pedidoData = {
        compradorNome: formData.compradorNome.trim(),
        compradorEmail: formData.compradorEmail.trim().toLowerCase() || null, // 🆕 PODE SER NULL
        compradorTelefone: `${formData.compradorDDD}${formData.compradorTelefone}`.trim(),

        destinatarioNome: formData.destinatarioNome.trim(),
        destinatarioTelefone: `${formData.destinatarioDDD}${formData.destinatarioTelefone}`.trim(),

        dataEntrega: formData.dataEntrega,
        periodoEntrega: formData.periodoEntrega,
        tipoEndereco: formData.tipoEndereco,

        cep: formData.cep.trim(),
        endereco: formData.endereco.trim(),
        numero: formData.numero.trim(),
        complemento: formData.complemento?.trim() || '',
        bairro: formData.bairro.trim(),
        cidade: formData.cidade.trim(),
        estado: formData.estado.trim(),
        referencia: formData.referencia?.trim() || '',

        clienteId: session?.user?.id || null,

        mensagem: formData.adicionarCartao ? formData.mensagemCartao?.trim() : '',

        itens: items.map((item) => ({
          produtoId: item.id,
          quantidade: item.quantidade,
          precoUnit: item.preco,
        })),
      }

      console.log('🚀 Enviando pedido:', pedidoData)

      const response = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedidoData),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('❌ Erro da API:', data)
        throw new Error(data.error || 'Erro ao criar pedido')
      }

      console.log('✅ Pedido criado:', data)

      toast.success('Pedido realizado com sucesso!')
      clearCart()

      setTimeout(() => router.push(`/pedido-confirmado?id=${data.id}`), 1000)

    } catch (error) {
      console.error('❌ Erro ao finalizar pedido:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao criar pedido')
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
              <Logo size="md" variant="light" className="mx-auto mb-6" />
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
              {/* 🆕 AVISO DE CHECKOUT RÁPIDO */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1">
                      Checkout Rápido e Fácil
                    </h3>
                    <p className="text-sm text-blue-700">
                      Não precisa criar conta! Preencha apenas nome, telefone e endereço para finalizar seu pedido.
                      {status === 'unauthenticated' && (
                        <span> Se preferir, pode <Link href="/login" className="underline font-medium">fazer login</Link> para ter seus dados salvos.</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* SEUS DADOS */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-pink-600" />
                    SEUS DADOS
                    {status === 'authenticated' && (
                      <span className="ml-auto text-xs font-normal text-green-600 flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Logado
                      </span>
                    )}
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

                  {/* 🆕 TELEFONE PRINCIPAL (OBRIGATÓRIO) */}
                  <div>
                    <Label>Telefone (WhatsApp) *</Label>
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
                    <p className="text-xs text-gray-500 mt-1">
                      Usaremos para enviar atualizações do seu pedido
                    </p>
                  </div>

                  {/* 🆕 EMAIL OPCIONAL */}
                  <div>
                    <Label>E-mail (opcional)</Label>
                    <Input
                      type="email"
                      value={formData.compradorEmail}
                      onChange={(e) => setFormData({ ...formData, compradorEmail: e.target.value })}
                      placeholder="seu@email.com (opcional)"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Se preferir receber confirmação por e-mail
                    </p>
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
                  {/* Seleção de Data */}
                  {/* Seleção de Data - CORRIGIDO */}
                  <div>
                    <Label className="mb-3 block">Data de Entrega *</Label>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {diasDisponiveis.map((dia) => {
                        const isSelected = formData.dataEntrega === dia.data

                        return (
                          <button
                            key={`data-${dia.data}`}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleDataChange(dia)
                            }}
                            className={`p-3 border-2 rounded-lg text-left transition-all ${isSelected
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
                              {isSelected && (
                                <Check className="h-4 w-4 text-pink-600" />
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>

                    <p className="text-xs text-gray-500 mt-2">
                      ⏰ Pedidos feitos até 17h podem ser entregues no mesmo dia
                    </p>
                  </div>


                  {/* 🆕 Seleção de Período com Validação */}
                  <div>
                    <Label className="mb-3 block">Período de Entrega *</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {periodos.map((periodo) => {
                        // Verificar se a data selecionada é REALMENTE HOJE
                        const hoje = new Date()
                        hoje.setHours(0, 0, 0, 0) // Zerar horário para comparação

                        // 🔧 CORREÇÃO: Criar data selecionada corretamente
                        const [ano, mes, dia] = formData.dataEntrega.split('-').map(Number)
                        const dataSelecionada = new Date(ano, mes - 1, dia)
                        dataSelecionada.setHours(0, 0, 0, 0)

                        const isToday = dataSelecionada.getTime() === hoje.getTime()

                        // 🆕 Verificar se é SÁBADO (6 = Sábado, 0 = Domingo)
                        const diaSelecionado = dataSelecionada.getDay()
                        const isSabado = diaSelecionado === 6

                        // 🆕 Verificar se o período está disponível no sábado
                        const indisponivelSabado = isSabado && periodo.disponivelSabado === false

                        const horaAtual = new Date().getHours()
                        const minutoAtual = new Date().getMinutes()
                        const horaAtualDecimal = horaAtual + minutoAtual / 60

                        // 🆕 Usar horário especial do sábado se aplicável
                        const horarioFim = isSabado && periodo.fimSabado ? periodo.fimSabado : periodo.fim
                        const [horaFim] = horarioFim.split(':').map(Number)

                        // Desabilitar se for hoje E o período já passou
                        const isPeriodoPassado = isToday && (horaAtualDecimal + 2) >= horaFim

                        // 🆕 Label dinâmica para sábado
                        const labelPeriodo = isSabado && periodo.labelSabado ? periodo.labelSabado : periodo.label

                        // Determinar se está desabilitado
                        const isDisabled = isPeriodoPassado || indisponivelSabado

                        // Mensagem de indisponibilidade
                        let motivoIndisponivel = ''
                        if (isPeriodoPassado) {
                          motivoIndisponivel = 'Horário não disponível para hoje'
                        } else if (indisponivelSabado) {
                          motivoIndisponivel = 'Não entregamos neste horário aos sábados'
                        }

                        return (
                          <div key={periodo.id} className="relative">
                            <button
                              type="button"
                              onClick={() => {
                                if (!isDisabled) {
                                  setFormData({
                                    ...formData,
                                    periodoEntrega: periodo.id,
                                    periodoEntregaDisplay: labelPeriodo,
                                  })
                                }
                              }}
                              disabled={isDisabled}
                              className={`w-full p-3 border-2 rounded-lg text-left transition-all ${isDisabled
                                ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                                : formData.periodoEntrega === periodo.id
                                  ? 'border-pink-500 bg-pink-50'
                                  : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Clock className={`h-4 w-4 ${isDisabled ? 'text-gray-300' : 'text-gray-400'
                                    }`} />
                                  <div>
                                    <p className={`text-sm font-medium ${isDisabled ? 'text-gray-400' : 'text-gray-900'
                                      }`}>
                                      {labelPeriodo}
                                    </p>
                                    {isDisabled && (
                                      <p className="text-xs text-red-500 mt-0.5">
                                        {motivoIndisponivel}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                {formData.periodoEntrega === periodo.id && !isDisabled && (
                                  <Check className="h-4 w-4 text-pink-600" />
                                )}
                              </div>
                            </button>
                          </div>
                        )
                      })}
                    </div>

                    {/* 🆕 Aviso dinâmico baseado no dia da semana */}
                    {(() => {
                      const hoje = new Date()
                      hoje.setHours(0, 0, 0, 0)

                      const [ano, mes, dia] = formData.dataEntrega.split('-').map(Number)
                      const dataSelecionada = new Date(ano, mes - 1, dia)
                      dataSelecionada.setHours(0, 0, 0, 0)

                      const diaSelecionado = dataSelecionada.getDay()
                      const isSabado = diaSelecionado === 6
                      const isToday = dataSelecionada.getTime() === hoje.getTime()

                      if (isSabado) {
                        return (
                          <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                            <Info className="h-3 w-3" />
                            🕐 Aos sábados entregamos apenas pela manhã (08h às 12h)
                          </p>
                        )
                      } else if (isToday) {
                        return (
                          <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                            <Info className="h-3 w-3" />
                            Apenas períodos disponíveis para entrega hoje são exibidos (considera 2h de preparação)
                          </p>
                        )
                      } else {
                        return (
                          <p className="text-xs text-gray-500 mt-2">
                            📦 Todos os períodos estão disponíveis para esta data
                          </p>
                        )
                      }
                    })()}
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
                          <SelectItem value="SP">São Paulo</SelectItem>
                          <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                          <SelectItem value="MG">Minas Gerais</SelectItem>
                          {/* Adicionar outros estados conforme necessário */}
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

            {/* Resumo do Pedido - mantém igual */}
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
