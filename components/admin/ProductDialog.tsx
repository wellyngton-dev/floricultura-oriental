'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Edit, Loader2 } from 'lucide-react'
import { ImageUploader } from '@/components/produtos/ImageUploader'

interface ProdutoImagem {
  id?: string
  url: string
  ordem?: number
  principal?: boolean
}

interface Produto {
  id?: string
  nome: string
  descricao: string | null
  categoria: string
  preco: number
  imagemUrl?: string | null
  imagens?: ProdutoImagem[]
  ativo: boolean
}

interface ProductDialogProps {
  produto?: Produto | null
  onSuccess: () => void
  trigger?: React.ReactNode
}

const categorias = [
  'Aniversário',
  'Casamento',
  'Romântico',
  'Agradecimento',
  'Luto',
]

export function ProductDialog({ produto, onSuccess, trigger }: ProductDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    categoria: '',
    preco: '',
  })
  const [imagens, setImagens] = useState<ProdutoImagem[]>([])

  useEffect(() => {
    if (produto) {
      setFormData({
        nome: produto.nome,
        descricao: produto.descricao || '',
        categoria: produto.categoria,
        preco: produto.preco.toString(),
      })
      
      // Carregar imagens existentes
      if (produto.imagens && produto.imagens.length > 0) {
        setImagens(produto.imagens.map(img => ({ url: img.url })))
      } else if (produto.imagemUrl) {
        // Compatibilidade com formato antigo
        setImagens([{ url: produto.imagemUrl }])
      } else {
        setImagens([])
      }
    } else {
      setFormData({
        nome: '',
        descricao: '',
        categoria: '',
        preco: '',
      })
      setImagens([])
    }
  }, [produto, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar se há pelo menos uma imagem
    if (imagens.length === 0) {
      alert('Adicione pelo menos uma imagem do produto')
      return
    }

    setLoading(true)

    try {
      const url = produto?.id ? `/api/produtos/${produto.id}` : '/api/produtos'
      const method = produto?.id ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          preco: parseFloat(formData.preco),
          imagens: imagens,
        }),
      })

      if (response.ok) {
        setOpen(false)
        onSuccess()
        if (!produto) {
          setFormData({
            nome: '',
            descricao: '',
            categoria: '',
            preco: '',
          })
          setImagens([])
        }
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao salvar produto')
      }
    } catch (error) {
      console.error('Erro ao salvar produto:', error)
      alert('Erro ao salvar produto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            {produto ? (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto
              </>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{produto ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
          <DialogDescription>
            {produto ? 'Atualize as informações do produto' : 'Adicione um novo produto ao catálogo'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div>
            <Label htmlFor="nome">Nome do Produto *</Label>
            <Input
              id="nome"
              required
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Ex: Buquê Rosas Vermelhas"
            />
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Descreva o produto"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="categoria">Categoria *</Label>
              <Select 
                value={formData.categoria} 
                onValueChange={(value) => setFormData({ ...formData, categoria: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="preco">Preço (R$) *</Label>
              <Input
                id="preco"
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.preco}
                onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                placeholder="0,00"
              />
            </div>
          </div>

          {/* Componente de Upload de Imagens */}
          <div>
            <ImageUploader
              images={imagens}
              onChange={setImagens}
              maxImages={5}
            />
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                produto ? 'Atualizar Produto' : 'Criar Produto'
              )}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
