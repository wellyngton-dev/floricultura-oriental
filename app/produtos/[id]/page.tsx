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
import { COMPANY, getWhatsAppLink } from '@/lib/constants/company'
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
  Clock,
  Package,
  Truck,
  Shield,
  Star
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
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
    setCartModalOpen(true)
  }

  const handleToggleFavorite = () => {
    if (!produto) return
    toggleFavorite(produto.id)

    if (isFavorite(produto.id)) {
      toast.success('Removido dos favoritos')
    } else {
      toast.success('Adicionado aos favoritos!')
    }
  }

  const handleWhatsApp = () => {
    if (!produto) return

    const mensagem = `Olá! Tenho interesse no produto: *${produto.nome}*\n\nPreço: ${new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(produto.preco)}`

    const url = getWhatsAppLink(mensagem)
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
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-pink-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando produto...</p>
        </div>
      </div>
    )
  }

  if (!produto) {
    return null
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <Header
        onCartClick={() => setCartModalOpen(true)}
        onFavoritesClick={() => setFavoritesModalOpen(true)}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6 hover:bg-pink-50">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para loja
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Galeria de Imagens - MODERNIZADA */}
          <div className="space-y-4">
            <Card className="overflow-hidden border-2 border-gray-100 shadow-xl">
              <CardContent className="p-0">
                <div className="relative aspect-square bg-gradient-to-br from-pink-50 to-purple-50">
                  {produto.imagens && produto.imagens.length > 0 ? (
                    <>
                      <Image
                        src={produto.imagens[imagemAtual]?.url}
                        alt={produto.nome}
                        fill
                        className="object-cover"
                        priority
                      />

                      {/* ✅ BOTÕES DE NAVEGAÇÃO CORRIGIDOS - AGORA COM CONTRASTE */}
                      {produto.imagens.length > 1 && (
                        <>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-pink-500/90 hover:bg-pink-600 text-white shadow-lg backdrop-blur-sm"
                            onClick={prevImage}
                          >
                            <ChevronLeft className="h-6 w-6" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-pink-500/90 hover:bg-pink-600 text-white shadow-lg backdrop-blur-sm"
                            onClick={nextImage}
                          >
                            <ChevronRight className="h-6 w-6" />
                          </Button>

                          {/* Indicadores de imagem */}
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/30 backdrop-blur-sm px-3 py-2 rounded-full">
                            {produto.imagens.map((_, index) => (
                              <button
                                key={index}
                                onClick={() => setImagemAtual(index)}
                                className={`transition-all rounded-full ${index === imagemAtual
                                    ? 'bg-white w-8 h-2'
                                    : 'bg-white/50 w-2 h-2 hover:bg-white/70'
                                  }`}
                                aria-label={`Ver imagem ${index + 1}`}
                              />
                            ))}
                          </div>

                          {/* Contador de imagens */}
                          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                            {imagemAtual + 1} / {produto.imagens.length}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <Package className="h-20 w-20 text-gray-300 mb-3" />
                      <span className="text-gray-400 font-medium">Sem imagem disponível</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Miniaturas */}
            {produto.imagens && produto.imagens.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {produto.imagens.map((imagem, index) => (
                  <button
                    key={imagem.id}
                    onClick={() => setImagemAtual(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${index === imagemAtual
                        ? 'border-pink-500 ring-2 ring-pink-200 shadow-lg'
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

          {/* Informações do Produto - MODERNIZADO */}
          <div className="space-y-6">
            {/* Cabeçalho */}
            <div>
              <Badge className="mb-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0 px-4 py-1 text-sm font-medium">
                {produto.categoria}
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                {produto.nome}
              </h1>

              {/* ✨ DESCRIÇÃO DESTACADA */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 p-5 rounded-r-lg shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-5 w-5 text-purple-600" />
                  <h3 className="text-sm font-bold text-purple-900 uppercase tracking-wide">
                    Descrição do Produto
                  </h3>
                </div>
                <p className="text-gray-700 text-lg leading-relaxed">
                  {produto.descricao}
                </p>
              </div>
            </div>

            {/* Avaliação */}
            <div className="flex items-center gap-2 text-sm">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="font-semibold text-gray-700">5.0</span>
              <span className="text-gray-500">(Produto avaliado)</span>
            </div>

            {/* Preço */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 shadow-lg">
              <p className="text-sm text-gray-600 mb-1">Preço especial</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-green-700">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(produto.preco)}
                </span>
                <span className="text-lg text-gray-600">à vista</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                💳 Aceitamos PIX, cartões de crédito e débito
              </p>
            </div>

            {/* Botões de Ação */}
            <div className="space-y-3">
              <Button
                onClick={handleAddToCart}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all h-14 text-lg font-semibold"
                size="lg"
              >
                <ShoppingBag className="h-5 w-5 mr-2" />
                Adicionar ao Carrinho
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleToggleFavorite}
                  className={`h-14 border-2 transition-all ${isFavorite(produto.id)
                      ? 'bg-pink-50 border-pink-500 text-pink-600 hover:bg-pink-100'
                      : 'border-gray-300 hover:border-pink-400 hover:bg-pink-50'
                    }`}
                >
                  <Heart
                    className={`h-5 w-5 mr-2 ${isFavorite(produto.id) ? 'fill-current' : ''}`}
                  />
                  {isFavorite(produto.id) ? 'Favoritado' : 'Favoritar'}
                </Button>

                <Button
                  variant="outline"
                  className="h-14 border-2 border-green-500 text-green-700 hover:bg-green-50 hover:border-green-600 font-semibold"
                  size="lg"
                  onClick={handleWhatsApp}
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  WhatsApp
                </Button>
              </div>
            </div>

            {/* Cards de Informações */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-2 border-purple-100 hover:border-purple-300 transition-colors">
                <CardContent className="p-4 text-center">
                  <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Truck className="h-6 w-6 text-purple-600" />
                  </div>
                  <p className="text-sm font-semibold text-gray-800">Entrega Rápida</p>
                  <p className="text-xs text-gray-600 mt-1">No mesmo dia</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-pink-100 hover:border-pink-300 transition-colors">
                <CardContent className="p-4 text-center">
                  <div className="bg-pink-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Shield className="h-6 w-6 text-pink-600" />
                  </div>
                  <p className="text-sm font-semibold text-gray-800">Qualidade</p>
                  <p className="text-xs text-gray-600 mt-1">Flores frescas</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-100 hover:border-green-300 transition-colors">
                <CardContent className="p-4 text-center">
                  <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Package className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-sm font-semibold text-gray-800">Embalagem</p>
                  <p className="text-xs text-gray-600 mt-1">Especial inclusa</p>
                </CardContent>
              </Card>
            </div>

            {/* Detalhes do Produto */}
            <Card className="border-2 border-gray-100 shadow-lg">
              <CardContent className="p-6">
                <h3 className="font-bold text-xl mb-4 text-gray-900 flex items-center gap-2">
                  <Star className="h-5 w-5 text-pink-500" />
                  O que está incluso
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-gray-700">
                    <div className="bg-green-100 rounded-full p-1 mt-0.5">
                      <div className="w-2 h-2 bg-green-600 rounded-full" />
                    </div>
                    <span>Flores frescas selecionadas e de alta qualidade</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-700">
                    <div className="bg-green-100 rounded-full p-1 mt-0.5">
                      <div className="w-2 h-2 bg-green-600 rounded-full" />
                    </div>
                    <span>Embalagem especial e elegante</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-700">
                    <div className="bg-green-100 rounded-full p-1 mt-0.5">
                      <div className="w-2 h-2 bg-green-600 rounded-full" />
                    </div>
                    <span>Cartão personalizado com sua mensagem</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-700">
                    <div className="bg-green-100 rounded-full p-1 mt-0.5">
                      <div className="w-2 h-2 bg-green-600 rounded-full" />
                    </div>
                    <span>Entrega rápida e cuidadosa</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-700">
                    <div className="bg-green-100 rounded-full p-1 mt-0.5">
                      <div className="w-2 h-2 bg-green-600 rounded-full" />
                    </div>
                    <span>Garantia de frescor e qualidade</span>
                  </li>
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
