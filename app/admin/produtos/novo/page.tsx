'use client'

import { useRouter } from 'next/navigation'
import { ProdutoForm } from '@/components/admin/ProdutoForm'
import { toast } from 'sonner'

export default function NovoProdutoPage() {
  const router = useRouter()

  const handleSubmit = async (data: any) => {
    const response = await fetch('/api/produtos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (response.ok) {
      toast.success('Produto criado com sucesso!')
      router.push('/admin/produtos')
    } else {
      toast.error('Erro ao criar produto')
      throw new Error('Erro ao criar produto')
    }
  }

  return (
    <ProdutoForm
      onSubmit={handleSubmit}
      submitLabel="Salvar Produto"
      title="Novo Produto"
      subtitle="Adicione um novo produto ao catálogo"
    />
  )
}
