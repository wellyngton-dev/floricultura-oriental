'use client'

import Image from 'next/image'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Check } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart-store'
import { useState } from 'react'

interface ProductCardProps {
  id: string
  nome: string
  descricao: string | null
  categoria: string
  preco: number
  imagemUrl: string | null
}

export function ProductCard({ id, nome, descricao, categoria, preco, imagemUrl }: ProductCardProps) {
  const [added, setAdded] = useState(false)
  const addItem = useCartStore((state) => state.addItem)

  const handleAddToCart = () => {
    addItem({ id, nome, preco, imagemUrl })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-64 w-full bg-gradient-to-br from-pink-50 to-purple-50">
        {imagemUrl ? (
          <Image
            src={imagemUrl}
            alt={nome}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <span className="text-6xl">🌸</span>
          </div>
        )}
        <Badge className="absolute top-2 right-2 bg-white text-gray-800">{categoria}</Badge>
      </div>
      
      <CardHeader>
        <CardTitle className="line-clamp-1">{nome}</CardTitle>
        <CardDescription className="line-clamp-2">{descricao}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <p className="text-2xl font-bold text-pink-600">
          {new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(Number(preco))}
        </p>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleAddToCart} 
          className="w-full" 
          size="lg"
          disabled={added}
        >
          {added ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Adicionado!
            </>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Encomendar
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
