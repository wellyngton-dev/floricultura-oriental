'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
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
  Flower2,
  Search,
  ShoppingCart,
  Heart,
  Filter,
  Sparkles,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import { toast } from 'sonner'

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
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todos')
  const { addItem } = useCart()

  useEffect(() => {
    fetchProdutos()
  }, [])

  const fetchProdutos = async () => {
    try {
      const response = await fetch('/api/produtos')
      const data = await response.json()
      setProdutos(data.filter((p: Produto) => p.ativo))
    } catch (error) {
      console.error('Erro ao buscar produtos:', error)
      toast.error('Erro ao carregar produtos')
    } finally {
      setLoading(false)
    }
  }

  const categorias = ['Todos', ...Array.from(new Set(produtos.map((p) => p.categoria)))]

  const produtosFiltrados = produtos
    .filter((p) => categoriaFiltro === 'Todos' || p.categoria === categoriaFiltro)
    .filter((p) => {
      const termo = busca.toLowerCase()
      return (
        p.nome.toLowerCase().includes(termo) ||
        p.descricao?.toLowerCase().includes(termo) ||
        p.categoria.toLowerCase().includes(termo)
      )
    })

const adicionarAoCarrinho = (produto: Produto) => {
  const imagemPrincipal = produto.imagens?.find((img) => img.principal)?.url || 
                         produto.imagens?.[0]?.url || 
                         produto.imagemUrl ||
                         ''

  addItem({
    id: produto.id,
    nome: produto.nome,
    preco: produto.preco,
    imagemUrl: imagemPrincipal,
    // Remover quantidade daqui - o context já gerencia isso
  })
  toast.success(`${produto.nome} adicionado ao carrinho!`)
}


  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-pink-100 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                <Flower2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                Floricultura
              </span>
            </Link>
            <Link href="/checkout">
              <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Carrinho
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Entrega no mesmo dia
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Nossos Produtos
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Flores frescas e arranjos exclusivos para cada ocasião especial
          </p>
        </div>

        {/* Filtros */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Busca */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar produtos..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filtro de Categoria */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Produtos */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4" />
              <p className="text-gray-600">Carregando produtos...</p>
            </div>
          </div>
        ) : produtosFiltrados.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Flower2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum produto encontrado</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {produtosFiltrados.map((produto) => {
              const imagemPrincipal =
                produto.imagens?.find((img) => img.principal)?.url ||
                produto.imagens?.[0]?.url ||
                produto.imagemUrl

              return (
                <Card
                  key={produto.id}
                  className="group overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  {/* Imagem */}
                  <div className="relative aspect-square bg-gray-100 overflow-hidden">
                    {imagemPrincipal ? (
                      <Image
                        src={imagemPrincipal}
                        alt={produto.nome}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Flower2 className="h-16 w-16 text-gray-400" />
                      </div>
                    )}

                    {/* Overlay com ações */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="rounded-full"
                        onClick={() => adicionarAoCarrinho(produto)}
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="rounded-full"
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Badge de Categoria */}
                    <Badge className="absolute top-3 left-3 bg-white/90 text-gray-900 hover:bg-white">
                      {produto.categoria}
                    </Badge>
                  </div>

                  {/* Informações */}
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg line-clamp-1 mb-1">
                      {produto.nome}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3 min-h-[40px]">
                      {produto.descricao}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-bold text-green-700">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(produto.preco)}
                      </p>
                      <Button
                        onClick={() => adicionarAoCarrinho(produto)}
                        className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Adicionar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Estatísticas */}
        <div className="mt-12 text-center text-sm text-gray-600">
          <p>
            Mostrando {produtosFiltrados.length} de {produtos.length} produtos
          </p>
        </div>
      </main>
    </div>
  )
}
