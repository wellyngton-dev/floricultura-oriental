'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Search,
  DollarSign,
  CheckCircle,
  XCircle,
} from 'lucide-react'

interface Bairro {
  id: string
  nome: string
  cidade: string
  estado: string
  valorFrete: number
  ativo: boolean
  createdAt: string
  updatedAt: string
}

// 🎯 Apenas São Carlos e Ibaté
const CIDADES_SP = [
  'São Carlos',
  'Ibaté',
]

// 🎯 Bairros de São Carlos e Ibaté
const BAIRROS_POR_CIDADE: { [key: string]: string[] } = {
  'São Carlos': [
    'Centro',
    'Vila Isabel',
    'Cidade Aracy',
    'Jardim Paraíso',
    'Vila Prado',
    'Tijuco Preto',
    'Santa Felícia',
    'Jardim Lutfalla',
    'Vila Nery',
    'Parque Arnold Schimidt',
    'Residencial Parque Douradinho',
    'Jardim Cruzeiro do Sul',
    'Jardim Macarengo',
    'Jardim Paulistano',
    'Jardim Ricetti',
    'Vila Monteiro',
    'Vila Faria',
    'Parque Faber Castell',
    'Jardim Betânia',
    'Jardim São Carlos',
    'Jardim Gibertoni',
    'Vila Carmem',
    'Santa Paula',
    'Parque Sabará',
    'Jardim Medeiros',
    'Jardim Santa Paula',
    'Parque Delta',
    'Vila Alpes',
    'Jardim Gonzaga',
    'Chácara Castelinho',
  ],
  'Ibaté': [
    'Centro',
    'Jardim Icaraí',
    'Jardim Cruzeiro',
    'Vila Santa Terezinha',
    'Jardim Popular',
    'Jardim Mariana',
    'Parque Residencial Ibaté',
    'Jardim Baldassari',
    'Vila São João',
    'Jardim Dona Margarida',
    'Nova Ibaté',
  ],
}

export default function AdminBairrosPage() {
  const [bairros, setBairros] = useState<Bairro[]>([])
  const [bairrosFiltrados, setBairrosFiltrados] = useState<Bairro[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Filtros
  const [cidadeFiltro, setCidadeFiltro] = useState('todas')
  const [searchTerm, setSearchTerm] = useState('')
  
  // Modal de adicionar/editar
  const [modalOpen, setModalOpen] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  
  // Estado para sugestões de bairros
  const [bairrosSugeridos, setBairrosSugeridos] = useState<string[]>([])
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false)
  
  // Formulário
  const [formData, setFormData] = useState({
    nome: '',
    cidade: 'São Carlos',
    estado: 'SP',
    valorFrete: '',
    ativo: true,
  })

  // Modal de deletar
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [bairroParaDeletar, setBairroParaDeletar] = useState<Bairro | null>(null)

  useEffect(() => {
    fetchBairros()
  }, [])

  // Atualizar sugestões quando a cidade mudar
  useEffect(() => {
    const sugestoes = BAIRROS_POR_CIDADE[formData.cidade] || []
    setBairrosSugeridos(sugestoes)
  }, [formData.cidade])

  // Filtrar bairros
  useEffect(() => {
    let filtered = bairros

    if (cidadeFiltro !== 'todas') {
      filtered = filtered.filter(b => b.cidade === cidadeFiltro)
    }

    if (searchTerm) {
      filtered = filtered.filter(b =>
        b.nome.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setBairrosFiltrados(filtered)
  }, [bairros, cidadeFiltro, searchTerm])

  const fetchBairros = async () => {
    try {
      const response = await fetch('/api/admin/bairros')
      const data = await response.json()
      setBairros(data)
      setBairrosFiltrados(data)
    } catch (error) {
      console.error('Erro ao buscar bairros:', error)
      toast.error('Erro ao carregar bairros')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = editandoId
        ? `/api/admin/bairros/${editandoId}`
        : '/api/admin/bairros'
      
      const method = editandoId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          valorFrete: parseFloat(formData.valorFrete),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar bairro')
      }

      toast.success(editandoId ? 'Bairro atualizado!' : 'Bairro cadastrado!')
      
      setModalOpen(false)
      resetForm()
      fetchBairros()
    } catch (error: any) {
      console.error('Erro ao salvar bairro:', error)
      toast.error(error.message || 'Erro ao salvar bairro')
    } finally {
      setSaving(false)
    }
  }

  const handleEditar = (bairro: Bairro) => {
    setEditandoId(bairro.id)
    setFormData({
      nome: bairro.nome,
      cidade: bairro.cidade,
      estado: bairro.estado,
      valorFrete: bairro.valorFrete.toString(),
      ativo: bairro.ativo,
    })
    setModalOpen(true)
  }

  const handleDelete = async () => {
    if (!bairroParaDeletar) return

    try {
      const response = await fetch(`/api/admin/bairros/${bairroParaDeletar.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao excluir bairro')
      }

      toast.success('Bairro excluído com sucesso!')
      setDeleteModalOpen(false)
      setBairroParaDeletar(null)
      fetchBairros()
    } catch (error: any) {
      console.error('Erro ao excluir bairro:', error)
      toast.error(error.message || 'Erro ao excluir bairro')
    }
  }

  const resetForm = () => {
    setEditandoId(null)
    setFormData({
      nome: '',
      cidade: 'São Carlos',
      estado: 'SP',
      valorFrete: '',
      ativo: true,
    })
    setMostrarSugestoes(false)
  }

  // Selecionar bairro sugerido
  const selecionarBairro = (nomeBairro: string) => {
    setFormData({ ...formData, nome: nomeBairro })
    setMostrarSugestoes(false)
  }

  // Filtrar sugestões baseado no que está sendo digitado
  const sugestoesFilteradas = bairrosSugeridos.filter(b =>
    b.toLowerCase().includes(formData.nome.toLowerCase())
  )

  const cidadesUnicas = Array.from(new Set(bairros.map(b => b.cidade))).sort()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Bairros e Frete</h1>
          <p className="text-gray-500 mt-2">
            Áreas de entrega: São Carlos e Ibaté
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm()
            setModalOpen(true)
          }}
          className="bg-pink-600 hover:bg-pink-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Bairro
        </Button>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Filtrar por Cidade</Label>
              <Select value={cidadeFiltro} onValueChange={setCidadeFiltro}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as cidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as cidades</SelectItem>
                  {cidadesUnicas.map((cidade) => (
                    <SelectItem key={cidade} value={cidade}>
                      {cidade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label>Buscar Bairro</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Digite o nome do bairro..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Bairros */}
      <Card>
        <CardHeader>
          <CardTitle>
            Bairros Cadastrados ({bairrosFiltrados.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
            </div>
          ) : bairrosFiltrados.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum bairro encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bairro</TableHead>
                    <TableHead>Cidade</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Frete</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bairrosFiltrados.map((bairro) => (
                    <TableRow key={bairro.id}>
                      <TableCell className="font-medium">{bairro.nome}</TableCell>
                      <TableCell>{bairro.cidade}</TableCell>
                      <TableCell>{bairro.estado}</TableCell>
                      <TableCell>
                        <span className="font-semibold text-green-600">
                          R$ {Number(bairro.valorFrete).toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {bairro.ativo ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            <CheckCircle className="h-3 w-3" />
                            Ativo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                            <XCircle className="h-3 w-3" />
                            Inativo
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditar(bairro)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setBairroParaDeletar(bairro)
                              setDeleteModalOpen(true)
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Adicionar/Editar */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editandoId ? 'Editar Bairro' : 'Novo Bairro'}
            </DialogTitle>
            <DialogDescription>
              {editandoId
                ? 'Atualize as informações do bairro'
                : 'Cadastre um novo bairro de São Carlos ou Ibaté'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              {/* Cidade */}
              <div>
                <Label>Cidade *</Label>
                <Select
                  value={formData.cidade}
                  onValueChange={(v) => {
                    setFormData({ ...formData, cidade: v, nome: '' })
                    setMostrarSugestoes(false)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CIDADES_SP.map((cidade) => (
                      <SelectItem key={cidade} value={cidade}>
                        {cidade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Nome do Bairro com Autocomplete */}
              <div className="relative">
                <Label>Nome do Bairro *</Label>
                <Input
                  required
                  value={formData.nome}
                  onChange={(e) => {
                    setFormData({ ...formData, nome: e.target.value })
                    setMostrarSugestoes(true)
                  }}
                  onFocus={() => setMostrarSugestoes(true)}
                  placeholder="Digite ou selecione um bairro..."
                  autoComplete="off"
                />
                
                {/* Lista de Sugestões */}
                {mostrarSugestoes && sugestoesFilteradas.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {sugestoesFilteradas.map((bairro, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => selecionarBairro(bairro)}
                        className="w-full text-left px-4 py-2 hover:bg-pink-50 hover:text-pink-600 transition-colors text-sm"
                      >
                        {bairro}
                      </button>
                    ))}
                  </div>
                )}
                
                <p className="text-xs text-gray-500 mt-1">
                  {sugestoesFilteradas.length > 0
                    ? `${sugestoesFilteradas.length} sugestões disponíveis`
                    : 'Digite o nome do bairro manualmente'}
                </p>
              </div>

              {/* Estado (fixo em SP) */}
              <div>
                <Label>Estado</Label>
                <Input value="SP - São Paulo" disabled className="bg-gray-50" />
              </div>

              {/* Valor do Frete */}
              <div>
                <Label>Valor do Frete (R$) *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.valorFrete}
                    onChange={(e) =>
                      setFormData({ ...formData, valorFrete: e.target.value })
                    }
                    placeholder="0.00"
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Valor cobrado para entrega neste bairro
                </p>
              </div>

              {/* Status Ativo */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>Ativo</Label>
                  <p className="text-xs text-gray-500">
                    Apenas bairros ativos aparecem no checkout
                  </p>
                </div>
                <Switch
                  checked={formData.ativo}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, ativo: checked })
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setModalOpen(false)
                  setMostrarSugestoes(false)
                }}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-pink-600 hover:bg-pink-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Salvando...
                  </>
                ) : (
                  'Salvar'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o bairro{' '}
              <strong>{bairroParaDeletar?.nome}</strong> em{' '}
              <strong>{bairroParaDeletar?.cidade}</strong>?
              <br />
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
