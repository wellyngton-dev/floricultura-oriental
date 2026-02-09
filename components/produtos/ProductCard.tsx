'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Heart, Eye, Package } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { toast } from 'sonner'

interface ProductCardProps {
  id: string
  nome: string
  descricao: string
  preco: number
  imagemUrl?: string
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
  categoria,
  onAddToCart,
}: ProductCardProps) {
  const router = useRouter()
  const { addItem } = useCart()
  const [imageError, setImageError] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  // 🔧 Extrair nome da categoria (objeto ou string)
  const categoriaNome = typeof categoria === 'string' 
    ? categoria 
    : categoria?.nome || 'Produtos'

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
        imagemUrl: imagemUrl || '',
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

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-floral-pink/20 hover:border-floral-pink/40">
      <CardContent className="p-0">
        {/* Imagem do Produto */}
        <div
          className="relative aspect-square overflow-hidden bg-gradient-to-br from-floral-pink/5 to-floral-lavender/5 cursor-pointer"
          onClick={handleViewDetails}
        >
          {!imageError && imagemUrl ? (
            <Image
              src={imagemUrl}
              alt={nome}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-16 w-16 text-floral-pink/30" />
            </div>
          )}

          {/* Overlay com botões */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4 gap-2">
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full bg-white/95 hover:bg-white"
              onClick={handleViewDetails}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full bg-white/95 hover:bg-white"
              onClick={(e) => {
                e.stopPropagation()
                toast.info('Favoritos em breve!')
              }}
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>

          {/* Badge de Categoria - 🔧 CORRIGIDO */}
          <Badge className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-floral-pink border-floral-pink/30 hover:bg-white z-10">
            {categoriaNome}
          </Badge>
        </div>

        {/* Informações do Produto */}
        <div className="p-4 space-y-3">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-floral-pink transition-colors">
              {nome}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">{descricao}</p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-floral-pink">
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
          className="w-full bg-gradient-to-r from-floral-pink to-floral-rose hover:from-floral-rose hover:to-floral-pink transition-all duration-300"
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
