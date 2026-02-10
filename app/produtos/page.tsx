'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
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
  Search,
  ShoppingBag,
  Heart,
  Filter,
  Sparkles,
  Loader2,
  Package,
  User,
  LogOut,
  Settings,
  Phone,
  Mail,
  MapPin,
  Clock,
  Instagram,
  Facebook,
  ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import { useFavorites } from '@/contexts/FavoritesContext'
import { CartModal } from '@/components/cart/CartModal'
import { FavoritesModal } from '@/components/favorites/FavoritesModal'
import { ProductCard } from '@/components/produtos/ProductCard'
import { Logo } from '@/components/logo'
import { COMPANY } from '@/lib/constants/company'
import { toast } from 'sonner'
import { Header } from '@/components/Header'


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
  ativo: boolean
  imagens?: ProdutoImagem[]
}

export default function ProdutosPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todos')
  const [cartModalOpen, setCartModalOpen] = useState(false)
  const [favoritesModalOpen, setFavoritesModalOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  const { totalItems } = useCart()
  const { favorites } = useFavorites()

  useEffect(() => {
    setMounted(true)
  }, [])

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

  if (!mounted) {
    return null
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header Modernizado */}
      <Header
        onCartClick={() => setCartModalOpen(true)}
        onFavoritesClick={() => setFavoritesModalOpen(true)}
      />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Link href="/">
          <Button variant="ghost" className="mb-6 hover:bg-pink-50">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para loja
          </Button>
        </Link>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 px-4 py-2 rounded-full text-sm font-medium mb-4 shadow-sm">
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
        <Card className="mb-8 border-2 border-gray-100 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Busca */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar produtos..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10 border-2"
                />
              </div>

              {/* Filtro de Categoria */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
                  <SelectTrigger className="w-full md:w-48 border-2">
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

            {/* Contador de resultados */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                {busca || categoriaFiltro !== 'Todos' ? (
                  <>
                    Mostrando <span className="font-semibold text-pink-600">{produtosFiltrados.length}</span> de {produtos.length} produtos
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-pink-600">{produtos.length}</span> produtos disponíveis
                  </>
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Produtos */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-pink-600 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Carregando produtos...</p>
            </div>
          </div>
        ) : produtosFiltrados.length === 0 ? (
          <Card className="border-2 border-gray-100">
            <CardContent className="p-12 text-center">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Nenhum produto encontrado
              </h3>
              <p className="text-gray-500 mb-4">
                {busca ? `Nenhum resultado para "${busca}"` : 'Nenhum produto nesta categoria'}
              </p>
              <Button
                onClick={() => {
                  setBusca('')
                  setCategoriaFiltro('Todos')
                }}
                variant="outline"
                className="border-2 border-pink-200 hover:bg-pink-50"
              >
                Limpar filtros
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {produtosFiltrados.map((produto) => (
              <ProductCard
                key={produto.id}
                id={produto.id}
                nome={produto.nome}
                descricao={produto.descricao}
                preco={produto.preco}
                imagemUrl={produto.imagemUrl}
                imagens={produto.imagens}
                categoria={produto.categoria}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer Completo */}
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Logo size="md" variant="dark" className="mb-6" />
              <p className="text-gray-400 text-sm mt-4">
                Flores frescas e arranjos exclusivos para tornar seus momentos ainda mais especiais.
              </p>
              <div className="mt-4 flex items-center gap-2 text-yellow-400 text-sm">
                <span className="text-xl">⭐</span>
                <span className="font-semibold">{COMPANY.rating}</span>
                <span className="text-gray-400">avaliação</span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Links Rápidos</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/" className="hover:text-pink-400 transition-colors">Início</Link></li>
                <li><Link href="/produtos" className="hover:text-pink-400 transition-colors">Produtos</Link></li>
                <li><Link href="/sobre" className="hover:text-pink-400 transition-colors">Sobre Nós</Link></li>
                <li><Link href="/contato" className="hover:text-pink-400 transition-colors">Contato</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-pink-400 flex-shrink-0" />
                  <a href={`tel:${COMPANY.phone}`} className="hover:text-pink-400 transition-colors">
                    {COMPANY.phone}
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-pink-400 flex-shrink-0" />
                  <a href={`mailto:${COMPANY.email}`} className="hover:text-pink-400 transition-colors break-all">
                    {COMPANY.email}
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-pink-400 flex-shrink-0 mt-1" />
                  <a
                    href={COMPANY.maps.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-pink-400 transition-colors"
                  >
                    {COMPANY.address.street}, {COMPANY.address.number}<br />
                    {COMPANY.address.neighborhood}<br />
                    {COMPANY.address.city} - {COMPANY.address.state}
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-pink-400 flex-shrink-0" />
                  <span>{COMPANY.hours.display}</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Redes Sociais</h4>
              <div className="flex gap-3">
                <Button size="icon" variant="ghost" className="hover:bg-pink-500/10 hover:text-pink-400" asChild>
                  <a href={COMPANY.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <Instagram className="h-5 w-5" />
                  </a>
                </Button>
                <Button size="icon" variant="ghost" className="hover:bg-pink-500/10 hover:text-pink-400" asChild>
                  <a href={COMPANY.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                    <Facebook className="h-5 w-5" />
                  </a>
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Siga-nos para novidades, promoções e inspirações florais!
              </p>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} {COMPANY.name}. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <FavoritesModal open={favoritesModalOpen} onOpenChange={setFavoritesModalOpen} />
      <CartModal open={cartModalOpen} onOpenChange={setCartModalOpen} />
    </div>
  )
}
