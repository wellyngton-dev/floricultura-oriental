'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ProductCard } from '@/components/produtos/ProductCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CartModal } from '@/components/cart/CartModal'
import { useCart } from '@/contexts/CartContext'
import { useFavorites } from '@/contexts/FavoritesContext'
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  LogOut,
  Settings
} from 'lucide-react'
import Link from 'next/link'
import { Logo } from '@/components/logo'
import { FavoritesModal } from '@/components/favorites/FavoritesModal'
import Footer from '@/components/Footer'

interface ProdutoImagem {
  id: string
  url: string
  ordem: number
  principal: boolean
}

interface Produto {
  id: string
  nome: string
  descricao: string
  categoria: string | { id: string; nome: string }
  preco: number
  imagemUrl?: string
  imagens?: ProdutoImagem[]
  ativo: boolean
}

const categorias = [
  { nome: 'Todos', valor: 'todos', emoji: '🌸' },
  { nome: 'Aniversário', valor: 'Aniversário', emoji: '🎂' },
  { nome: 'Casamento', valor: 'Casamento', emoji: '💐' },
  { nome: 'Romântico', valor: 'Romântico', emoji: '💕' },
  { nome: 'Agradecimento', valor: 'Agradecimento', emoji: '🌺' },
  { nome: 'Luto', valor: 'Luto', emoji: '🕊️' },
]

export default function Home() {
  const router = useRouter()
  const { data: session } = useSession()
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [categoriaAtiva, setCategoriaAtiva] = useState('todos')
  const [busca, setBusca] = useState('')
  const [loading, setLoading] = useState(true)
  const [cartModalOpen, setCartModalOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  const { addItem, totalItems } = useCart()
  const { favorites } = useFavorites()
  const [favoritesModalOpen, setFavoritesModalOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    fetchProdutos()
  }, [])

  const fetchProdutos = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/produtos')
      const data = await response.json()
      setProdutos(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Erro ao buscar produtos:', error)
      setProdutos([])
    } finally {
      setLoading(false)
    }
  }

  const produtosFiltrados = Array.isArray(produtos)
    ? produtos.filter((produto) => {
      if (categoriaAtiva !== 'todos') {
        const categoriaNome = typeof produto.categoria === 'string'
          ? produto.categoria
          : produto.categoria?.nome

        if (categoriaNome !== categoriaAtiva) {
          return false
        }
      }

      if (busca) {
        const termo = busca.toLowerCase()
        const categoriaNome = typeof produto.categoria === 'string'
          ? produto.categoria
          : produto.categoria?.nome

        return (
          produto.nome.toLowerCase().includes(termo) ||
          produto.descricao?.toLowerCase().includes(termo) ||
          categoriaNome?.toLowerCase().includes(termo)
        )
      }

      return true
    })
    : []

  const handleAddToCart = (produto: Produto) => {
    const imagemPrincipal =
      produto.imagens?.find((img) => img.principal)?.url ||
      produto.imagens?.[0]?.url ||
      produto.imagemUrl ||
      ''

    addItem({
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      imagemUrl: imagemPrincipal,
    })

    setCartModalOpen(true)
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header - RESPONSIVIDADE CORRIGIDA */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Logo - Menor em mobile */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group flex-shrink-0">
              <div className="sm:hidden">
                <Logo size="sm" variant="light" priority />
              </div>
              <div className="hidden sm:block">
                <Logo size="md" variant="light" priority />
              </div>
            </Link>

            {/* Ações do Header - OTIMIZADO PARA MOBILE */}
            <div className="flex items-center gap-1 sm:gap-3">
              {/* Botão de Favoritos - Compacto em mobile */}
              <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 sm:h-10 sm:w-10"
                onClick={() => setFavoritesModalOpen(true)}
              >
                <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] sm:text-xs w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-semibold">
                    {favorites.length}
                  </span>
                )}
              </Button>

              {/* Botão de Login/Perfil - SIMPLIFICADO EM MOBILE */}
              {session ? (
                <div className="flex items-center gap-1 sm:gap-2">
                  {/* Nome do usuário - Apenas desktop */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (session.user.role === 'admin') {
                        router.push('/admin')
                      } else {
                        router.push('/cliente/pedidos')
                      }
                    }}
                    className="hidden md:flex"
                  >
                    <User className="h-4 w-4 mr-2" />
                    {session.user.name}
                  </Button>

                  {/* Botão Admin/Painel - Compacto */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      if (session.user.role === 'admin') {
                        router.push('/admin')
                      } else {
                        router.push('/cliente/pedidos')
                      }
                    }}
                    title={session.user.role === 'admin' ? 'Painel Admin' : 'Meus Pedidos'}
                    className="h-9 w-9 sm:h-10 sm:w-10"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>

                  {/* Botão Sair - Apenas desktop */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => signOut({ callbackUrl: '/' })}
                    title="Sair"
                    className="hidden sm:flex h-10 w-10"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => router.push('/login')}
                  title="Entrar"
                  className="h-9 w-9 sm:h-10 sm:w-10"
                >
                  <User className="h-4 w-4" />
                </Button>
              )}

              {/* Botão do Carrinho - COMPACTO EM MOBILE */}
              <Button
                onClick={() => setCartModalOpen(true)}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 relative h-9 sm:h-10 px-3 sm:px-4"
                size="sm"
              >
                <ShoppingBag className="h-4 w-4" />
                <span className="hidden lg:inline ml-2">Carrinho</span>
                {totalItems > 0 && (
                  <span className="ml-1 sm:ml-2 bg-white text-pink-600 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold">
                    {totalItems}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Barra de Busca - RESPONSIVA */}
          <div className="mt-3 sm:mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar flores..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9 sm:pl-10 h-10 sm:h-12 bg-white/50 backdrop-blur-sm border-pink-200 focus:border-pink-400 rounded-xl text-sm sm:text-base"
            />
          </div>
        </div>
      </header>

      {/* Filtros de Categoria - SCROLL HORIZONTAL MELHORADO */}
      <section className="sticky top-[132px] sm:top-[140px] z-40 bg-white/80 backdrop-blur-lg border-y border-pink-100 shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
            {categorias.map((cat) => (
              <Button
                key={cat.valor}
                variant={categoriaAtiva === cat.valor ? "default" : "outline"}
                onClick={() => setCategoriaAtiva(cat.valor)}
                size="sm"
                className={`whitespace-nowrap rounded-full transition-all flex-shrink-0 text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4 ${
                  categoriaAtiva === cat.valor
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-lg shadow-pink-500/30'
                    : 'hover:bg-pink-50 border-pink-200'
                }`}
              >
                <span className="mr-1 sm:mr-2">{cat.emoji}</span>
                {cat.nome}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid de Produtos */}
      <main className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 flex-1">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent" />
            <p className="mt-4 text-gray-500">Carregando produtos...</p>
          </div>
        ) : produtosFiltrados.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-pink-100 rounded-full mb-4">
              <Search className="h-10 w-10 text-pink-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Nenhum produto encontrado
            </h3>
            <p className="text-gray-500 mb-6">
              Tente buscar por outro termo ou categoria
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setBusca('')
                setCategoriaAtiva('todos')
              }}
            >
              Limpar Filtros
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                {categoriaAtiva === 'todos' ? 'Todos os Produtos' : categoriaAtiva}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                {produtosFiltrados.length} {produtosFiltrados.length === 1 ? 'produto' : 'produtos'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {produtosFiltrados.map((produto) => (
                <ProductCard
                  key={produto.id}
                  {...produto}
                  onAddToCart={() => handleAddToCart(produto)}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Modal de Favoritos */}
      <FavoritesModal open={favoritesModalOpen} onOpenChange={setFavoritesModalOpen} />

      {/* Modal do Carrinho */}
      <CartModal open={cartModalOpen} onOpenChange={setCartModalOpen} />
    </div>
  )
}
