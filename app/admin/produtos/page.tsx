'use client'

import { useEffect, useState, useMemo } from 'react'
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  ArrowLeft,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Package,
  DollarSign,
  Flower2,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'

interface Categoria {
  id: string
  nome: string
}

interface Produto {
  id: string
  nome: string
  descricao: string
  categoria: string
  preco: number
  imagemUrl?: string
  ativo: boolean
  imagens?: {
    id: string
    url: string
    ordem: number
    principal: boolean
  }[]
}

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([]) // 🔧 Estado para categorias
  const [produtoParaDeletar, setProdutoParaDeletar] = useState<Produto | null>(null)
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('TODOS')
  const [filtroStatus, setFiltroStatus] = useState('TODOS')
  const [modalDeletarOpen, setModalDeletarOpen] = useState(false)

  useEffect(() => {
    console.log('🔄 Produtos atualizados:', produtos.length)
    console.log('📋 Produtos filtrados:', produtosFiltrados.length)
    fetchData() // 🔧 Buscar produtos e categorias
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      console.log('🔄 Iniciando busca...') // DEBUG

      const [produtosRes, categoriasRes] = await Promise.all([
        fetch('/api/admin/produtos'),
        fetch('/api/admin/categorias'),
      ])

      const produtosData = await produtosRes.json()
      const categoriasData = await categoriasRes.json()

      console.log('📦 Produtos recebidos:', produtosData) // DEBUG
      console.log('📦 Quantidade:', produtosData.length) // DEBUG

      setProdutos(Array.isArray(produtosData) ? produtosData : [])
      setCategorias(Array.isArray(categoriasData) ? categoriasData : [])

      console.log('✅ Estado atualizado') // DEBUG
    } catch (error) {
      console.error('❌ Erro ao buscar dados:', error)
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const fetchProdutos = async () => {
    try {
      const response = await fetch('/api/admin/produtos')
      const data = await response.json()
      setProdutos(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Erro ao buscar produtos:', error)
      toast.error('Erro ao carregar produtos')
    }
  }

  const toggleAtivo = async (id: string, ativo: boolean) => {
    try {
      const response = await fetch(`/api/produtos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: !ativo }),
      })

      if (response.ok) {
        toast.success(ativo ? 'Produto desativado' : 'Produto ativado')
        fetchProdutos()
      } else {
        toast.error('Erro ao atualizar produto')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao atualizar produto')
    }
  }

  const deletarProduto = async () => {
    if (!produtoParaDeletar) return

    try {
      const response = await fetch(`/api/produtos/${produtoParaDeletar.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Produto deletado com sucesso')
        fetchProdutos()
        setModalDeletarOpen(false)
        setProdutoParaDeletar(null)
      } else {
        toast.error('Erro ao deletar produto')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao deletar produto')
    }
  }

  const produtosFiltrados = useMemo(() => {
    return produtos.filter((p) => {
      // 1. Validar que o produto existe
      if (!p || !p.nome) {
        console.log('❌ Produto inválido:', p)
        return false
      }

      // 2. Filtro de categoria
      if (filtroCategoria !== 'TODAS' && filtroCategoria !== 'TODOS') {
        if (p.categoria !== filtroCategoria) {
          console.log('❌ Filtrado por categoria:', p.nome, p.categoria, '!==', filtroCategoria)
          return false
        }
      }

      // 3. Filtro de status
      if (filtroStatus === 'ATIVOS' && !p.ativo) {
        console.log('❌ Filtrado - inativo:', p.nome)
        return false
      }
      if (filtroStatus === 'INATIVOS' && p.ativo) {
        console.log('❌ Filtrado - ativo:', p.nome)
        return false
      }

      // 4. Filtro de busca
      if (busca) {
        const termo = busca.toLowerCase()
        const contemBusca =
          p.nome.toLowerCase().includes(termo) ||
          (p.descricao && p.descricao.toLowerCase().includes(termo)) ||
          (p.categoria && p.categoria.toLowerCase().includes(termo))

        if (!contemBusca) {
          console.log('❌ Filtrado por busca:', p.nome)
          return false
        }
      }

      console.log('✅ Produto aprovado:', p.nome)
      return true
    })
  }, [produtos, filtroCategoria, filtroStatus, busca])


  const stats = {
    total: produtos.length,
    ativos: produtos.filter((p) => p.ativo).length,
    inativos: produtos.filter((p) => !p.ativo).length,
    valorEstoque: produtos.reduce((sum, p) => sum + Number(p.preco), 0),
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
                <h1 className="text-2xl font-bold text-gray-900">Gerenciar Produtos</h1>
                <p className="text-sm text-gray-600">{produtosFiltrados.length} produtos encontrados</p>
              </div>
            </div>
            <Link href="/admin/produtos/novo">
              <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total de Produtos</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Produtos Ativos</p>
                  <p className="text-3xl font-bold text-green-600">{stats.ativos}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <Eye className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Produtos Inativos</p>
                  <p className="text-3xl font-bold text-gray-600">{stats.inativos}</p>
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <EyeOff className="h-6 w-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Valor Total</p>
                  <p className="text-2xl font-bold text-green-600">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                      minimumFractionDigits: 0,
                    }).format(stats.valorEstoque)}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Busca */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome, descrição ou categoria..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filtro de Categoria */}
              <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">TODOS</SelectItem>
                  {categorias.map((cat) => (
                    <SelectItem key={cat.id} value={cat.nome}>
                      {cat.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Filtro de Status */}
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos</SelectItem>
                  <SelectItem value="ATIVOS">Ativos</SelectItem>
                  <SelectItem value="INATIVOS">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Produtos */}
        {loading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4" />
              <p className="text-gray-600">Carregando produtos...</p>
            </CardContent>
          </Card>
        ) : produtosFiltrados.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Flower2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Nenhum produto encontrado</p>
              <Link href="/admin/produtos/novo">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Produto
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {produtosFiltrados.map((produto) => {
              const imagemPrincipal =
                produto.imagens?.find((img) => img.principal)?.url ||
                produto.imagens?.[0]?.url ||
                produto.imagemUrl

              return (
                <Card key={produto.id} className="overflow-hidden hover:shadow-lg transition-all">
                  <div className="relative aspect-square bg-gray-100">
                    {imagemPrincipal ? (
                      <Image
                        src={imagemPrincipal}
                        alt={produto.nome}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Flower2 className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                    <Badge
                      className={`absolute top-3 right-3 ${produto.ativo ? 'bg-green-500' : 'bg-gray-500'
                        }`}
                    >
                      {produto.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <div className="mb-3">
                      <h3 className="font-bold text-lg line-clamp-1 mb-1">{produto.nome}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {produto.descricao}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {produto.categoria}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-2xl font-bold text-green-700">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(produto.preco)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => toggleAtivo(produto.id, produto.ativo)}
                      >
                        {produto.ativo ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-1" />
                            Desativar
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-1" />
                            Ativar
                          </>
                        )}
                      </Button>
                      <Link href={`/admin/produtos/${produto.id}/editar`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => {
                          setProdutoParaDeletar(produto)
                          setModalDeletarOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={modalDeletarOpen} onOpenChange={setModalDeletarOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja deletar o produto{' '}
              <strong>{produtoParaDeletar?.nome}</strong>? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalDeletarOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={deletarProduto}>
              <Trash2 className="h-4 w-4 mr-2" />
              Deletar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
