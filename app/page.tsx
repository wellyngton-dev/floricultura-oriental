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
  Sparkles,
  Heart,
  Phone,
  MapPin,
  Instagram,
  Facebook,
  Mail,
  User,
  LogOut,
  Settings
} from 'lucide-react'
import Link from 'next/link'
import { Logo } from '@/components/logo'

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
  categoria: string
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

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    fetchProdutos()
  }, [categoriaAtiva])

  const fetchProdutos = async () => {
    setLoading(true)
    try {
      const url = categoriaAtiva === 'todos'
        ? '/api/produtos'
        : `/api/produtos?categoria=${categoriaAtiva}`

      const response = await fetch(url)
      const data = await response.json()
      setProdutos(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Erro ao buscar produtos:', error)
      setProdutos([])
    } finally {
      setLoading(false)
    }
  }

  const produtosFiltrados = Array.isArray(produtos) ? produtos.filter(produto =>
    produto.nome.toLowerCase().includes(busca.toLowerCase()) ||
    produto.descricao?.toLowerCase().includes(busca.toLowerCase())
  ) : []

  const handleAddToCart = (produto: Produto) => {
    const imagemPrincipal =
      produto.imagens?.find((img) => img.principal)?.url ||
      produto.imagens?.[0]?.url ||
      produto.imagemUrl ||
      '';

    addItem({
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      imagemUrl: imagemPrincipal,
    });

    setCartModalOpen(true);
  };

  // Evitar erro de hidratação
  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              {/* Logo */}
              <Logo size="md" variant="light" priority />
            </Link>

            {/* Ações do Header */}
            <div className="flex items-center gap-3">
              {/* Botão de Favoritos */}
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="h-5 w-5" />
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                    {favorites.length}
                  </span>
                )}
              </Button>

              {/* Botão de Login/Perfil */}
              {session ? (
                <div className="flex items-center gap-2">
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
                    className="hidden sm:flex"
                  >
                    <User className="h-4 w-4 mr-2" />
                    {session.user.name}
                  </Button>

                  {/* Botão Admin/Painel */}
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
                  >
                    <Settings className="h-4 w-4" />
                  </Button>

                  {/* Botão Sair */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => signOut({ callbackUrl: '/' })}
                    title="Sair"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/login')}
                >
                  <User className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Entrar</span>
                </Button>
              )}

              {/* Botão do Carrinho */}
              <Button
                onClick={() => setCartModalOpen(true)}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 relative"
              >
                <ShoppingBag className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Carrinho</span>
                {totalItems > 0 && (
                  <span className="ml-2 bg-white text-pink-600 px-2 py-0.5 rounded-full text-xs font-bold">
                    {totalItems}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Barra de Busca */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar flores, arranjos, buquês..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10 h-12 bg-white/50 backdrop-blur-sm border-pink-200 focus:border-pink-400 rounded-xl"
            />
          </div>
        </div>
      </header>

      {/* Filtros de Categoria */}
      <section className="sticky top-[120px] z-40 bg-white/80 backdrop-blur-lg border-y border-pink-100 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-2 overflow-x-auto scrollbar-hide md:flex-wrap md:justify-center">
            {categorias.map((cat) => (
              <Button
                key={cat.valor}
                variant={categoriaAtiva === cat.valor ? "default" : "outline"}
                onClick={() => setCategoriaAtiva(cat.valor)}
                className={`whitespace-nowrap rounded-full transition-all flex-shrink-0 ${categoriaAtiva === cat.valor
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-lg shadow-pink-500/30'
                  : 'hover:bg-pink-50 border-pink-200'
                  }`}
              >
                <span className="mr-2">{cat.emoji}</span>
                {cat.nome}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid de Produtos */}
      <main className="container mx-auto px-4 py-12">
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
              <h2 className="text-2xl font-bold text-gray-800">
                {categoriaAtiva === 'todos' ? 'Todos os Produtos' : categoriaAtiva}
              </h2>
              <p className="text-sm text-gray-500">
                {produtosFiltrados.length} {produtosFiltrados.length === 1 ? 'produto' : 'produtos'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo e Sobre */}
            <div>
              {/* Logo média no footer */}
              <Logo size="md" variant="dark" className="mb-6" />

              <p className="text-gray-400 text-sm mt-4">
                Flores frescas e arranjos exclusivos para tornar seus momentos ainda mais especiais.
              </p>
            </div>

            {/* Links Rápidos */}
            <div>
              <h4 className="font-semibold mb-4">Links Rápidos</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/" className="hover:text-pink-400 transition-colors">Início</Link></li>
                <li><Link href="/#produtos" className="hover:text-pink-400 transition-colors">Produtos</Link></li>
                <li><Link href="/#sobre" className="hover:text-pink-400 transition-colors">Sobre Nós</Link></li>
                <li><Link href="/#contato" className="hover:text-pink-400 transition-colors">Contato</Link></li>
              </ul>
            </div>

            {/* Contato */}
            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-pink-400 flex-shrink-0" />
                  <a href="tel:+5516999999999" className="hover:text-pink-400 transition-colors">
                    (16) 99999-9999
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-pink-400 flex-shrink-0" />
                  <a href="mailto:contato@oriental.com.br" className="hover:text-pink-400 transition-colors">
                    contato@oriental.com.br
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-pink-400 flex-shrink-0" />
                  <span>Ribeirão Preto - SP</span>
                </li>
              </ul>
            </div>

            {/* Redes Sociais */}
            <div>
              <h4 className="font-semibold mb-4">Redes Sociais</h4>
              <div className="flex gap-3">
                <Button size="icon" variant="ghost" className="hover:bg-pink-500/10 hover:text-pink-400" asChild>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                    <Instagram className="h-5 w-5" />
                  </a>
                </Button>
                <Button size="icon" variant="ghost" className="hover:bg-pink-500/10 hover:text-pink-400" asChild>
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                    <Facebook className="h-5 w-5" />
                  </a>
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2026 Floricultura Oriental. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Modal do Carrinho */}
      <CartModal open={cartModalOpen} onOpenChange={setCartModalOpen} />
    </div>
  )
}
