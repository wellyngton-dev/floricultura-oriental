'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Search,
  User,
  Phone,
  Mail,
  Calendar,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface Cliente {
  id: string
  nome: string
  email: string
  telefone: string
  cpf?: string | null
  createdAt: string
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [busca, setBusca] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    buscarClientes()
  }, [])

  const buscarClientes = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/clientes')

      if (!res.ok) {
        throw new Error('Erro ao buscar clientes')
      }

      const data = await res.json()
      setClientes(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Erro ao buscar clientes:', error)
      toast.error('Erro ao carregar clientes')
      setClientes([])
    } finally {
      setLoading(false)
    }
  }

  const clientesFiltrados = clientes.filter((c) => {
    const termo = busca.toLowerCase()
    return (
      c.nome.toLowerCase().includes(termo) ||
      c.email?.toLowerCase().includes(termo) ||
      c.telefone?.toLowerCase().includes(termo) ||
      c.id.toLowerCase().includes(termo)
    )
  })

  const formatarData = (data: string) =>
    new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Clientes
                </h1>
                <p className="text-sm text-gray-600">
                  {clientesFiltrados.length} clientes encontrados
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Filtro de busca */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome, e-mail, telefone..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de clientes */}
        {loading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4" />
              <p className="text-gray-600">Carregando clientes...</p>
            </CardContent>
          </Card>
        ) : clientesFiltrados.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum cliente encontrado.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {clientesFiltrados.map((cliente) => (
              <Card key={cliente.id} className="hover:shadow-md transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-base font-bold text-gray-900">
                          {cliente.nome}
                        </h2>
                        <Badge variant="outline" className="text-xs">
                          ID: {cliente.id.slice(0, 6).toUpperCase()}
                        </Badge>
                      </div>
                      {cliente.email && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Mail className="h-3 w-3" />
                          <span>{cliente.email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                        <Phone className="h-3 w-3" />
                        <span>{cliente.telefone}</span>
                      </div>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      <div className="flex items-center gap-1 justify-end">
                        <Calendar className="h-3 w-3" />
                        <span>Cadastrado em</span>
                      </div>
                      <div className="font-medium">
                        {formatarData(cliente.createdAt)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
