'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Heart, Eye, Package, ChevronLeft, ChevronRight } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useFavorites } from '@/contexts/FavoritesContext'
import { toast } from 'sonner'

interface ProdutoImagem {
  id: string
  url: string
  ordem: number
  principal: boolean
}

interface ProductCardProps {
  id: string
  nome: string
  descricao: string
  preco: number
  imagemUrl?: string
  imagens?: ProdutoImagem[]
  categoria?: { 
    id: string
    nome: string
  } | string
  onAddToCart?: () => void
}

export function ProductCard({
  id,
  nome,
  descricao,
  preco,
  imagemUrl,
  imagens,
  categoria,
  onAddToCart,
}: ProductCardProps) {
  const router = useRouter()
  const { addItem } = useCart()
  const { toggleFavorite, isFavorite } = useFavorites()
  const [imageError, setImageError] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // 🔧 Extrair nome da categoria (objeto ou string)
  const categoriaNome = typeof categoria === 'string' 
    ? categoria 
    : categoria?.nome || 'Produtos'

  // 🔧 Preparar array de imagens
  const imagensDisponiveis = imagens && imagens.length > 0 
    ? imagens.sort((a, b) => a.ordem - b.ordem)
    : imagemUrl 
    ? [{ id: 'default', url: imagemUrl, ordem: 0, principal: true }]
    : []

  const imagemAtual = imagensDisponiveis[currentImageIndex]?.url || imagemUrl

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (onAddToCart) {
      onAddToCart()
      return
    }

    setIsAddingToCart(true)

    try {
      addItem({
        id,
        nome,
        preco,
        imagemUrl: imagensDisponiveis[0]?.url || imagemUrl || '',
      })

      toast.success('Produto adicionado ao carrinho!', {
        description: nome,
        duration: 2000,
      })
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error)
      toast.error('Erro ao adicionar ao carrinho')
    } finally {
      setTimeout(() => setIsAddingToCart(false), 500)
    }
  }

  const handleViewDetails = () => {
    router.push(`/produtos/${id}`)
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleFavorite(id)
    
    if (isFavorite(id)) {
      toast.success('Removido dos favoritos')
    } else {
      toast.success('Adicionado aos favoritos!', {
        description: nome,
      })
    }
  }

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev + 1) % imagensDisponiveis.length)
  }

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => 
      prev === 0 ? imagensDisponiveis.length - 1 : prev - 1
    )
  }

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-pink-100 hover:border-pink-300">
      <CardContent className="p-0">
        {/* Imagem do Produto com Carousel */}
        <div
          className="relative aspect-square overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50 cursor-pointer"
          onClick={handleViewDetails}
        >
          {!imageError && imagemAtual ? (
            <>
              <Image
                src={imagemAtual}
                alt={nome}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                onError={() => setImageError(true)}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />

              {/* Botões de Navegação - CORRIGIDOS COM CONTRASTE */}
              {imagensDisponiveis.length > 1 && (
                <>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-pink-500/90 hover:bg-pink-600 text-white shadow-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-20 h-8 w-8"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-pink-500/90 hover:bg-pink-600 text-white shadow-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-20 h-8 w-8"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>

                  {/* Indicadores de Imagem */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    {imagensDisponiveis.map((_, index) => (
                      <div
                        key={index}
                        className={`transition-all rounded-full ${
                          index === currentImageIndex
                            ? 'bg-white w-4 h-1.5'
                            : 'bg-white/50 w-1.5 h-1.5'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Contador de Imagens */}
                  <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    {currentImageIndex + 1}/{imagensDisponiveis.length}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-16 w-16 text-pink-300" />
            </div>
          )}

          {/* Overlay com botões - CORES ATUALIZADAS */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4 gap-2 z-10">
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full bg-pink-500/90 hover:bg-pink-600 text-white shadow-lg backdrop-blur-sm"
              onClick={handleViewDetails}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className={`rounded-full shadow-lg backdrop-blur-sm ${
                isFavorite(id)
                  ? 'bg-pink-500 hover:bg-pink-600 text-white'
                  : 'bg-white/90 hover:bg-white text-pink-500'
              }`}
              onClick={handleToggleFavorite}
            >
              <Heart className={`h-4 w-4 ${isFavorite(id) ? 'fill-current' : ''}`} />
            </Button>
          </div>

          {/* Badge de Categoria */}
          <Badge className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-pink-600 border-pink-200 hover:bg-white z-10 shadow-md">
            {categoriaNome}
          </Badge>
        </div>

        {/* Informações do Produto */}
        <div className="p-4 space-y-3">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-pink-600 transition-colors">
              {nome}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">{descricao}</p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(preco)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 transition-all duration-300 shadow-md hover:shadow-lg"
          onClick={handleAddToCart}
          disabled={isAddingToCart}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {isAddingToCart ? 'Adicionando...' : 'Adicionar ao Carrinho'}
        </Button>
      </CardFooter>
    </Card>
  )
}
