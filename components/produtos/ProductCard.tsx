'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, ImageIcon, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { Decimal } from '@prisma/client/runtime/library';

interface ProdutoImagem {
  id: string;
  url: string;
  ordem: number;
  principal: boolean;
}

interface ProductCardProps {
  id: string;
  nome: string;
  descricao?: string;
  categoria: string;
  preco: number | Decimal;
  imagemUrl?: string;
  imagens?: ProdutoImagem[];
  onAddToCart?: () => void;
}

export function ProductCard({
  id,
  nome,
  descricao,
  categoria,
  preco,
  imagemUrl,
  imagens,
  onAddToCart,
}: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const imagensOrdenadas = imagens && imagens.length > 0
    ? [...imagens].sort((a, b) => a.ordem - b.ordem)
    : imagemUrl
    ? [{ id: 'legacy', url: imagemUrl, ordem: 0, principal: true }]
    : [];

  const hasMultipleImages = imagensOrdenadas.length > 1;
  const imagemAtual = imagensOrdenadas[currentImageIndex]?.url;

  const precoNumero = typeof preco === 'number' 
    ? preco 
    : parseFloat(preco.toString());

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === imagensOrdenadas.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? imagensOrdenadas.length - 1 : prev - 1
    );
  };

  return (
    <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
      <CardContent className="p-0">
        <div className="relative h-72 w-full bg-gradient-to-br from-pink-50 to-purple-50 overflow-hidden">
          {imagemAtual ? (
            <>
              <Image
                src={imagemAtual}
                alt={`${nome} - Imagem ${currentImageIndex + 1}`}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={false}
              />

              {/* Botão Favorito */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFavorite(!isFavorite);
                }}
                className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all z-20 ${
                  isFavorite 
                    ? 'bg-pink-500 text-white' 
                    : 'bg-white/80 text-gray-600 hover:bg-white'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>

              {/* Badge Categoria */}
              <Badge className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-800 border-0">
                {categoria}
              </Badge>

              {hasMultipleImages && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                    {imagensOrdenadas.map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex(index);
                        }}
                        className={`h-1.5 rounded-full transition-all ${
                          index === currentImageIndex
                            ? 'bg-white w-8'
                            : 'bg-white/50 hover:bg-white/70 w-1.5'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <ImageIcon className="w-16 h-16 text-gray-300" />
            </div>
          )}
        </div>

        <div className="p-5">
          <h3 className="font-bold text-lg mb-2 line-clamp-2 text-gray-800 group-hover:text-pink-600 transition-colors">
            {nome}
          </h3>
          {descricao && (
            <p className="text-sm text-gray-500 mb-4 line-clamp-2">
              {descricao}
            </p>
          )}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-1">A partir de</p>
              <span className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(precoNumero)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0">
        <Button
          onClick={onAddToCart}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-lg shadow-pink-500/50"
          size="lg"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Adicionar ao Carrinho
        </Button>
      </CardFooter>
    </Card>
  );
}
