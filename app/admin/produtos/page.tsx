'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProductDialog } from '@/components/admin/ProductDialog'
import { 
  Flower2, 
  ArrowLeft,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'

interface Produto {
  id: string
  nome: string
  descricao: string | null
  categoria: string
  preco: number
  imagemUrl: string | null
  ativo: boolean
  createdAt: string
}

export default function ProdutosPage() {
  const router = useRouter()
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar autenticação
    const isAuth = localStorage.getItem('admin-auth')
    if (!isAuth) {
      router.push('/admin/login')
      return
    }

    fetchProdutos()
  }, [router])

  const fetchProdutos = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/produtos')
      const data = await response.json()
      setProdutos(data)
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleAtivo = async (id: string, ativo: boolean) => {
    try {
      await fetch(`/api/produtos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: !ativo }),
      })
      fetchProdutos()
    } catch (error) {
      console.error('Erro ao atualizar produto:', error)
      alert('Erro ao atualizar produto')
    }
  }

  const deletarProduto = async (id: string) => {
    if (!confirm('Tem certeza que deseja desativar este produto?')) {
      return
    }

    try {
      await fetch(`/api/produtos/${id}`, {
        method: 'DELETE',
      })
      fetchProdutos()
    } catch (error) {
      console.error('Erro ao deletar produto:', error)
      alert('Erro ao deletar produto')
    }
  }

  const produtosAtivos = produtos.filter(p => p.ativo)
  const produtosInativos = produtos.filter(p => !p.ativo)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <Flower2 className="h-8 w-8 text-pink-500" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Gestão de Produtos</h1>
                  <p className="text-sm text-gray-500">
                    {produtosAtivos.length} ativos · {produtosInativos.length} inativos
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchProdutos}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <ProductDialog onSuccess={fetchProdutos} />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Produtos Ativos */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Produtos Ativos ({produtosAtivos.length})</h2>
          
          {produtosAtivos.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Flower2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum produto ativo</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {produtosAtivos.map((produto) => (
                <Card key={produto.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-1">{produto.nome}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-1">
                          {produto.descricao || 'Sem descrição'}
                        </CardDescription>
                      </div>
                      <Badge className="ml-2">{produto.categoria}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-pink-600">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(Number(produto.preco))}
                      </span>
                      {produto.ativo && (
                        <Badge variant="secondary" className="bg-green-50 text-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Ativo
                        </Badge>
                      )}
                    </div>

                    {produto.imagemUrl && (
                      <div className="relative h-32 w-full bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg overflow-hidden">
                        <img 
                          src={produto.imagemUrl} 
                          alt={produto.nome}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}

                    <div className="flex gap-2">
                      <ProductDialog 
                        produto={produto} 
                        onSuccess={fetchProdutos}
                        trigger={
                          <Button variant="outline" size="sm" className="flex-1">
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
                        }
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toggleAtivo(produto.id, produto.ativo)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Produtos Inativos */}
        {produtosInativos.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-600">
              Produtos Inativos ({produtosInativos.length})
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {produtosInativos.map((produto) => (
                <Card key={produto.id} className="opacity-60 hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-1">{produto.nome}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-1">
                          {produto.descricao || 'Sem descrição'}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="ml-2">{produto.categoria}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-600">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(Number(produto.preco))}
                      </span>
                      <Badge variant="secondary" className="bg-red-50 text-red-700">
                        <XCircle className="h-3 w-3 mr-1" />
                        Inativo
                      </Badge>
                    </div>

                    <div className="flex gap-2">
                      <ProductDialog 
                        produto={produto} 
                        onSuccess={fetchProdutos}
                        trigger={
                          <Button variant="outline" size="sm" className="flex-1">
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
                        }
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toggleAtivo(produto.id, produto.ativo)}
                        className="text-green-600"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
