'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/contexts/CartContext'
import { useFavorites } from '@/contexts/FavoritesContext'
import { CartModal } from '@/components/cart/CartModal'
import { FavoritesModal } from '@/components/favorites/FavoritesModal'
import { Logo } from '@/components/logo'
import { COMPANY, getWhatsAppLink } from '@/lib/constants/company' // ← ADICIONADO
import { 
  ArrowLeft, 
  ShoppingBag, 
  Heart,
  Loader2,
  ChevronLeft,
  ChevronRight,
  User,
  LogOut,
  Settings,
  Phone,
  MapPin,
  Instagram,
  Facebook,
  Mail,
  MessageCircle,
  Clock
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'

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
  ativo: boolean
  imagens: ProdutoImagem[]
}

export default function ProdutoDetalhePage() {
  const params = useParams()
  const router = useRouter()
  const produtoId = params.id as string
  const { data: session } = useSession()

  const [produto, setProduto] = useState<Produto | null>(null)
  const [loading, setLoading] = useState(true)
  const [imagemAtual, setImagemAtual] = useState(0)
  const [cartModalOpen, setCartModalOpen] = useState(false)
  const [favoritesModalOpen, setFavoritesModalOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  const { addItem, totalItems } = useCart()
  const { toggleFavorite, isFavorite, favorites } = useFavorites()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    fetchProduto()
  }, [produtoId])

  const fetchProduto = async () => {
    try {
      const response = await fetch(`/api/produtos/${produtoId}`)
      const data = await response.json()
      
      if (response.ok) {
        setProduto(data)
      } else {
        toast.error('Produto não encontrado')
        router.push('/')
      }
    } catch (error) {
      console.error('Erro ao buscar produto:', error)
      toast.error('Erro ao carregar produto')
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!produto) return

    const imagemPrincipal = produto.imagens?.[0]?.url || ''

    addItem({
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      imagemUrl: imagemPrincipal,
    })

    toast.success('Produto adicionado ao carrinho!')
  }

  const handleToggleFavorite = () => {
    if (!produto) return
    toggleFavorite(produto.id)
  }

  const handleWhatsApp = () => {
    if (!produto) return
    
    const mensagem = `Olá! Tenho interesse no produto: *${produto.nome}*\n\nPreço: ${new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(produto.preco)}`
    
    const url = getWhatsAppLink(mensagem) // ← USANDO A FUNÇÃO CENTRALIZADA
    window.open(url, '_blank')
  }

  const nextImage = () => {
    if (!produto?.imagens) return
    setImagemAtual((prev) => (prev + 1) % produto.imagens.length)
  }

  const prevImage = () => {
    if (!produto?.imagens) return
    setImagemAtual((prev) => 
      prev === 0 ? produto.imagens.length - 1 : prev - 1
    )
  }

  if (!mounted) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <Loader2 className="h-12 w-12 animate-spin text-pink-600" />
      </div>
    )
  }

  if (!produto) {
    return null
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3 group">
              <Logo size="md" variant="light" priority />
            </Link>

            <div className="flex items-center gap-3">
              {/* Botão de Favoritos */}
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setFavoritesModalOpen(true)}
              >
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
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para loja
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Galeria de Imagens */}
          <div>
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-square">
                  {produto.imagens && produto.imagens.length > 0 ? (
                    <>
                      <Image
                        src={produto.imagens[imagemAtual]?.url}
                        alt={produto.nome}
                        fill
                        className="object-cover"
                        priority
                      />
                      
                      {produto.imagens.length > 1 && (
                        <>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
                            onClick={prevImage}
                          >
                            <ChevronLeft className="h-6 w-6" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
                            onClick={nextImage}
                          >
                            <ChevronRight className="h-6 w-6" />
                          </Button>

                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                            {produto.imagens.map((_, index) => (
                              <button
                                key={index}
                                onClick={() => setImagemAtual(index)}
                                className={`w-2 h-2 rounded-full transition-all ${
                                  index === imagemAtual
                                    ? 'bg-white w-6'
                                    : 'bg-white/50'
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <span className="text-gray-400">Sem imagem</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {produto.imagens && produto.imagens.length > 1 && (
              <div className="grid grid-cols-4 gap-2 mt-4">
                {produto.imagens.map((imagem, index) => (
                  <button
                    key={imagem.id}
                    onClick={() => setImagemAtual(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      index === imagemAtual
                        ? 'border-pink-500 ring-2 ring-pink-200'
                        : 'border-gray-200 hover:border-pink-300'
                    }`}
                  >
                    <Image
                      src={imagem.url}
                      alt={`${produto.nome} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Informações do Produto */}
          <div>
            <div className="mb-4">
              <Badge className="mb-2 bg-pink-100 text-pink-700">{produto.categoria}</Badge>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {produto.nome}
              </h1>
              <p className="text-gray-600 text-lg">{produto.descricao}</p>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold text-green-700">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(produto.preco)}
              </span>
            </div>

            <div className="space-y-3 mb-6">
              <Button
                onClick={handleAddToCart}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                size="lg"
              >
                <ShoppingBag className="h-5 w-5 mr-2" />
                Adicionar ao Carrinho
              </Button>

              <div className="flex gap-3">
                {/* ✅ BOTÃO DE FAVORITOS CORRIGIDO */}
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleToggleFavorite}
                  className={`flex-1 ${isFavorite(produto.id) ? 'text-pink-600 border-pink-600' : ''}`}
                >
                  <Heart 
                    className={`h-5 w-5 ${isFavorite(produto.id) ? 'fill-current' : ''}`} 
                  />
                </Button>

                <Button
                  variant="outline"
                  className="flex-1 border-green-500 text-green-600 hover:bg-green-50"
                  size="lg"
                  onClick={handleWhatsApp}
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  WhatsApp
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-3">Informações do Produto</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✓ Flores frescas e selecionadas</li>
                  <li>✓ Embalagem especial inclusa</li>
                  <li>✓ Entrega rápida</li>
                  <li>✓ Cartão personalizado</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
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
