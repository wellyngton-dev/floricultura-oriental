'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Save, Upload, X, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'

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

export default function EditarProdutoPage() {
  const router = useRouter()
  const params = useParams()
  const produtoId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    categoria: '',
    preco: '',
    ativo: true,
  })
  const [imagens, setImagens] = useState<string[]>([])
  const [uploadingImage, setUploadingImage] = useState(false)

  const categorias = [
    'Aniversário',
    'Rosas',
    'Girassóis',
    'Flores do Campo',
    'Astromélias',
    'Buquês Mistos',
    'Orquídeas',
    'Casamento',
    'Romântico',
    'Agradecimento',
    'Luto',
    'Ocasiões Especiais',
    'Corporativo'
  ]

  useEffect(() => {
    fetchProduto()
  }, [produtoId])

  const fetchProduto = async () => {
    try {
      const response = await fetch(`/api/produtos/${produtoId}`)
      const produto: Produto = await response.json()

      setFormData({
        nome: produto.nome,
        descricao: produto.descricao || '',
        categoria: produto.categoria,
        preco: produto.preco.toString(),
        ativo: produto.ativo,
      })

      setImagens(produto.imagens?.map((img) => img.url) || [])
    } catch (error) {
      console.error('Erro ao buscar produto:', error)
      toast.error('Erro ao carregar produto')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    console.log('🎯 Iniciando upload no frontend')
    console.log('Arquivos selecionados:', files.length)

    setUploadingImage(true)

    try {
      const formData = new FormData()

      Array.from(files).forEach((file, index) => {
        console.log(`Adicionando arquivo ${index + 1}:`, file.name, file.type, file.size)
        formData.append('files', file)
      })

      console.log('📤 Enviando requisição para /api/upload...')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      console.log('📥 Resposta recebida:', response.status, response.statusText)

      const data = await response.json()
      console.log('Dados da resposta:', data)

      if (response.ok && data.success && data.files) {
        const novasUrls = data.files.map((file: any) => file.url)
        console.log('✅ URLs das imagens:', novasUrls)
        setImagens([...imagens, ...novasUrls])
        toast.success(`${data.files.length} imagem(ns) enviada(s) com sucesso!`)
      } else {
        console.error('❌ Erro no upload:', data.error)
        toast.error(data.error || 'Erro ao enviar imagens')
      }
    } catch (error) {
      console.error('❌ Erro na requisição:', error)
      toast.error('Erro ao enviar imagem')
    } finally {
      setUploadingImage(false)
      e.target.value = ''
    }
  }

  const handleImageUrlAdd = () => {
    const url = prompt('Cole a URL da imagem:')
    if (url) {
      setImagens([...imagens, url])
      toast.success('Imagem adicionada!')
    }
  }

  const removeImage = (index: number) => {
    setImagens(imagens.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nome || !formData.categoria || !formData.preco) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    setSaving(true)

    try {
      const response = await fetch(`/api/produtos/${produtoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formData.nome,
          descricao: formData.descricao,
          categoria: formData.categoria,
          preco: parseFloat(formData.preco),
          ativo: formData.ativo,
          imagens: imagens.map((url, index) => ({
            url,
            ordem: index,
            principal: index === 0,
          })),
        }),
      })

      if (response.ok) {
        toast.success('Produto atualizado com sucesso!')
        router.push('/admin/produtos')
      } else {
        toast.error('Erro ao atualizar produto')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao atualizar produto')
    } finally {
      setSaving(false)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/produtos">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Editar Produto</h1>
              <p className="text-sm text-gray-600">Atualize as informações do produto</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome do Produto *</Label>
                <Input
                  id="nome"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Buquê de Rosas Vermelhas"
                />
              </div>

              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descreva o produto..."
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Select
                    value={formData.categoria}
                    onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                  >
                    <SelectTrigger id="categoria">
                      <SelectValue placeholder="Selecione uma categoria" />
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
                  <Label htmlFor="preco">Preço *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      R$
                    </span>
                    <Input
                      id="preco"
                      type="number"
                      step="0.01"
                      required
                      value={formData.preco}
                      onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                      placeholder="0,00"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                  className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                />
                <Label htmlFor="ativo" className="cursor-pointer">
                  Produto ativo (visível no site)
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Imagens */}
          <Card>
            <CardHeader>
              <CardTitle>Imagens do Produto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {imagens.map((url, index) => (
                  <div key={index} className="relative aspect-square group">
                    <Image
                      src={url}
                      alt={`Imagem ${index + 1}`}
                      fill
                      className="object-cover rounded-lg"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                    {index === 0 && (
                      <div className="absolute top-2 left-2 bg-pink-600 text-white text-xs px-2 py-1 rounded">
                        Principal
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                {/* Botão de Upload */}
                <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-pink-500 hover:bg-pink-50 transition-colors">
                  {uploadingImage ? (
                    <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600 text-center px-2">
                        Upload
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </label>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleImageUrlAdd}
                  className="w-full"
                >
                  Adicionar por URL
                </Button>
              </div>

              <p className="text-xs text-gray-500">
                A primeira imagem será a imagem principal do produto. Arraste para reordenar.
              </p>
            </CardContent>
          </Card>

          {/* Ações */}
          <div className="flex gap-4">
            <Link href="/admin/produtos" className="flex-1">
              <Button type="button" variant="outline" className="w-full">
                Cancelar
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
