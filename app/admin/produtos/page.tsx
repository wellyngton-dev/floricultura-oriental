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
  RefreshCw,
  ImageIcon,
  Package,
  TrendingUp,
  Eye
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface ProdutoImagem {
  id: string
  url: string
  ordem: number
  principal: boolean
}

interface Produto {
  id: string
  nome: string
  descricao: string | null
  categoria: string
  preco: number
  imagemUrl?: string | null
  imagens?: ProdutoImagem[]
  ativo: boolean
  createdAt: string
}

export default function ProdutosPage() {
  const router = useRouter()
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
    if (!confirm('Tem certeza que deseja excluir este produto?')) {
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
  const valorTotal = produtos.reduce((acc, p) => acc + Number(p.preco), 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-gray-600 mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Moderno */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div className="h-8 w-px bg-gray-200" />
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-gray-700 to-gray-900 p-2.5 rounded-xl">
                  <Flower2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Floricultura Oriental Vila Nery
                  </h1>
                  <p className="text-sm text-gray-500">Gestão de Produtos</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchProdutos}
                className="border-gray-300 hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <ProductDialog onSuccess={fetchProdutos} />
            </div>
          </div>
        </div>
      </header>

      {/* Cards de Estatísticas */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-gray-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Produtos</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{produtos.length}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Produtos Ativos</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{produtosAtivos.length}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Produtos Inativos</p>
                  <p className="text-3xl font-bold text-gray-600 mt-2">{produtosInativos.length}</p>
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <XCircle className="h-6 w-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Valor Médio</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(produtos.length > 0 ? valorTotal / produtos.length : 0)}
                  </p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Produtos Ativos */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Produtos Ativos
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({produtosAtivos.length})
              </span>
            </h2>
          </div>
          
          {produtosAtivos.length === 0 ? (
            <Card className="border-gray-200 bg-white">
              <CardContent className="py-16 text-center">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum produto ativo</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {produtosAtivos.map((produto) => {
                const imagemPrincipal = produto.imagens?.find(img => img.principal)?.url || 
                                       produto.imagens?.[0]?.url || 
                                       produto.imagemUrl;
                const totalImagens = produto.imagens?.length || 0;

                return (
                  <Card key={produto.id} className="border-gray-200 bg-white hover:shadow-lg transition-shadow group">
                    <CardContent className="p-0">
                      <div className="relative h-48 w-full bg-gray-50 overflow-hidden">
                        {imagemPrincipal ? (
                          <>
                            <Image 
                              src={imagemPrincipal} 
                              alt={produto.nome}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                            />
                            {totalImagens > 1 && (
                              <Badge className="absolute bottom-2 right-2 bg-black/70 text-white border-0 backdrop-blur-sm">
                                <Eye className="h-3 w-3 mr-1" />
                                {totalImagens}
                              </Badge>
                            )}
                          </>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <ImageIcon className="h-12 w-12 text-gray-300" />
                          </div>
                        )}
                        <Badge className="absolute top-2 left-2 bg-green-500 text-white border-0">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Ativo
                        </Badge>
                      </div>

                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900 line-clamp-1 flex-1">
                            {produto.nome}
                          </h3>
                          <Badge variant="outline" className="text-xs border-gray-300 text-gray-600">
                            {produto.categoria}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-500 line-clamp-2 mb-3 h-10">
                          {produto.descricao || 'Sem descrição'}
                        </p>

                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xl font-bold text-gray-900">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(Number(produto.preco))}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <ProductDialog 
                            produto={produto} 
                            onSuccess={fetchProdutos}
                            trigger={
                              <Button variant="outline" size="sm" className="flex-1 border-gray-300 hover:bg-gray-50">
                                <Edit className="h-4 w-4 mr-1" />
                                Editar
                              </Button>
                            }
                          />
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => toggleAtivo(produto.id, produto.ativo)}
                            className="border-gray-300 hover:bg-gray-50"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => deletarProduto(produto.id)}
                            className="border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Produtos Inativos */}
        {produtosInativos.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-600">
                Produtos Inativos
                <span className="ml-2 text-sm font-normal text-gray-400">
                  ({produtosInativos.length})
                </span>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {produtosInativos.map((produto) => {
                const imagemPrincipal = produto.imagens?.find(img => img.principal)?.url || 
                                       produto.imagens?.[0]?.url || 
                                       produto.imagemUrl;
                const totalImagens = produto.imagens?.length || 0;

                return (
                  <Card key={produto.id} className="border-gray-200 bg-white hover:shadow-lg transition-shadow opacity-60 group">
                    <CardContent className="p-0">
                      <div className="relative h-48 w-full bg-gray-50 overflow-hidden">
                        {imagemPrincipal ? (
                          <>
                            <Image 
                              src={imagemPrincipal} 
                              alt={produto.nome}
                              fill
                              className="object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                            />
                            {totalImagens > 1 && (
                              <Badge className="absolute bottom-2 right-2 bg-black/70 text-white border-0">
                                <Eye className="h-3 w-3 mr-1" />
                                {totalImagens}
                              </Badge>
                            )}
                          </>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <ImageIcon className="h-12 w-12 text-gray-300" />
                          </div>
                        )}
                        <Badge className="absolute top-2 left-2 bg-gray-500 text-white border-0">
                          <XCircle className="h-3 w-3 mr-1" />
                          Inativo
                        </Badge>
                      </div>

                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900 line-clamp-1 flex-1">
                            {produto.nome}
                          </h3>
                          <Badge variant="outline" className="text-xs border-gray-300 text-gray-600">
                            {produto.categoria}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-500 line-clamp-2 mb-3 h-10">
                          {produto.descricao || 'Sem descrição'}
                        </p>

                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xl font-bold text-gray-600">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(Number(produto.preco))}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <ProductDialog 
                            produto={produto} 
                            onSuccess={fetchProdutos}
                            trigger={
                              <Button variant="outline" size="sm" className="flex-1 border-gray-300 hover:bg-gray-50">
                                <Edit className="h-4 w-4 mr-1" />
                                Editar
                              </Button>
                            }
                          />
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => toggleAtivo(produto.id, produto.ativo)}
                            className="border-green-200 text-green-600 hover:bg-green-50"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => deletarProduto(produto.id)}
                            className="border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
