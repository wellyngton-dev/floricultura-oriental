'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ProdutoForm } from '@/components/admin/ProdutoForm'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface ProdutoImagem {
  id: string
  url: string
  ordem: number
  principal: boolean
}

interface Categoria {
  id: string
  nome: string
}

interface Produto {
  id: string
  nome: string
  descricao: string
  categoriaId: string        // 🔧 Adicionar categoriaId
  categoria: Categoria       // 🔧 Categoria completa
  preco: number
  ativo: boolean
  imagens: ProdutoImagem[]
}

export default function EditarProdutoPage() {
  const router = useRouter()
  const params = useParams()
  const produtoId = params.id as string

  const [loading, setLoading] = useState(true)
  const [produto, setProduto] = useState<Produto | null>(null)

  useEffect(() => {
    fetchProduto()
  }, [produtoId])

  const fetchProduto = async () => {
    try {
      const response = await fetch(`/api/produtos/${produtoId}`)
      
      if (!response.ok) {
        throw new Error('Erro ao buscar produto')
      }
      
      const data: Produto = await response.json()
      console.log('📦 Produto recebido:', data) // DEBUG
      setProduto(data)
    } catch (error) {
      console.error('Erro ao buscar produto:', error)
      toast.error('Erro ao carregar produto')
      router.push('/admin/produtos')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: any) => {
    try {
      console.log('📤 Enviando atualização:', data) // DEBUG
      
      const response = await fetch(`/api/produtos/${produtoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('❌ Erro:', error)
        throw new Error(error.error || 'Erro ao atualizar produto')
      }

      toast.success('Produto atualizado com sucesso!')
      router.push('/admin/produtos')
    } catch (error: any) {
      console.error('❌ Erro ao atualizar:', error)
      toast.error(error.message || 'Erro ao atualizar produto')
      throw error
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
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
    <ProdutoForm
      produtoId={produtoId}
      initialData={{
        nome: produto.nome,
        descricao: produto.descricao || '',
        categoriaId: produto.categoriaId, // 🔧 Enviar categoriaId
        preco: produto.preco.toString(),
        ativo: produto.ativo,
      }}
      initialImages={produto.imagens?.map((img) => img.url) || []}
      onSubmit={handleSubmit}
      submitLabel="Salvar Alterações"
      title="Editar Produto"
      subtitle="Atualize as informações do produto"
    />
  )
}
