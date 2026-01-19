'use client'

import { useEffect, useState } from 'react'
import { ProductCard } from '@/components/produtos/ProductCard'
import { CartSheet } from '@/components/checkout/CartSheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Flower2, Search } from 'lucide-react'

interface Produto {
  id: string
  nome: string
  descricao: string | null
  categoria: string
  preco: number
  imagemUrl: string | null
}

const categorias = [
  { value: 'todos', label: 'Todos' },
  { value: 'Aniversário', label: 'Aniversário' },
  { value: 'Casamento', label: 'Casamento' },
  { value: 'Romântico', label: 'Romântico' },
  { value: 'Agradecimento', label: 'Agradecimento' },
  { value: 'Luto', label: 'Luto' },
]

export default function Home() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [categoriaAtiva, setCategoriaAtiva] = useState('todos')
  const [busca, setBusca] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProdutos()
  }, [categoriaAtiva])

  const fetchProdutos = async () => {
    setLoading(true)
    try {
      const url = `/api/produtos${categoriaAtiva !== 'todos' ? `?categoria=${categoriaAtiva}` : ''}`
      const response = await fetch(url)
      const data = await response.json()
      setProdutos(data)
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
    } finally {
      setLoading(false)
    }
  }

  const produtosFiltrados = produtos.filter(produto =>
    produto.nome.toLowerCase().includes(busca.toLowerCase()) ||
    produto.descricao?.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Flower2 className="h-8 w-8 text-pink-500" />
              <h1 className="text-3xl font-bold text-gray-800">Floricultura Oriental</h1>
            </div>
            <CartSheet />
          </div>

          {/* Busca */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Buscar flores..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Filtro de Categorias */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {categorias.map((cat) => (
            <Button
              key={cat.value}
              variant={categoriaAtiva === cat.value ? 'default' : 'outline'}
              onClick={() => setCategoriaAtiva(cat.value)}
              className="whitespace-nowrap"
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Grid de Produtos */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">Carregando produtos...</p>
          </div>
        ) : produtosFiltrados.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-64 text-center">
            <Flower2 className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">Nenhum produto encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {produtosFiltrados.map((produto) => (
              <ProductCard key={produto.id} {...produto} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© 2026 Floricultura Oriental - Flores para todos os momentos 🌸</p>
        </div>
      </footer>
    </div>
  )
}
