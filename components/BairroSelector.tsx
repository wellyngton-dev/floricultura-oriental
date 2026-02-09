'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, MapPin } from 'lucide-react'

interface Bairro {
  id: string
  nome: string
  cidade: string
  estado: string
  valorFrete: number
}

interface BairroSelectorProps {
  onBairroSelect: (bairro: Bairro) => void
  selectedBairro?: Bairro | null
}

export default function BairroSelector({ 
  onBairroSelect, 
  selectedBairro 
}: BairroSelectorProps) {
  const [search, setSearch] = useState('')
  const [bairros, setBairros] = useState<Bairro[]>([])
  const [filteredBairros, setFilteredBairros] = useState<Bairro[]>([])
  const [loading, setLoading] = useState(false)
  const [showList, setShowList] = useState(false)

  useEffect(() => {
    fetchBairros()
  }, [])

  useEffect(() => {
    if (search.trim()) {
      const filtered = bairros.filter((bairro) =>
        bairro.nome.toLowerCase().includes(search.toLowerCase())
      )
      setFilteredBairros(filtered)
      setShowList(true)
    } else {
      setFilteredBairros(bairros)
      setShowList(false)
    }
  }, [search, bairros])

  const fetchBairros = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/bairros')
      const data = await response.json()
      setBairros(data)
    } catch (error) {
      console.error('Erro ao buscar bairros:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectBairro = (bairro: Bairro) => {
    onBairroSelect(bairro)
    setSearch(bairro.nome)
    setShowList(false)
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="bairro">Bairro *</Label>
      
      <div className="relative">
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="bairro"
            type="text"
            placeholder="Digite o nome do bairro..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setShowList(true)}
            className="pl-10"
          />
        </div>

        {showList && filteredBairros.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredBairros.map((bairro) => (
              <button
                key={bairro.id}
                type="button"
                onClick={() => handleSelectBairro(bairro)}
                className="w-full px-4 py-3 text-left hover:bg-gray-100 flex justify-between items-center border-b last:border-b-0"
              >
                <div>
                  <p className="font-medium">{bairro.nome}</p>
                  <p className="text-xs text-gray-500">
                    {bairro.cidade} - {bairro.estado}
                  </p>
                </div>
                <span className="text-sm font-semibold text-green-600">
                  R$ {Number(bairro.valorFrete).toFixed(2)}
                </span>
              </button>
            ))}
          </div>
        )}

        {showList && search && filteredBairros.length === 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-4 text-center text-gray-500">
            Nenhum bairro encontrado
          </div>
        )}
      </div>

      {selectedBairro && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-700">
                Frete para: <span className="font-bold">{selectedBairro.nome}</span>
              </p>
              <p className="text-xs text-gray-500">
                {selectedBairro.cidade} - {selectedBairro.estado}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-green-600">
                R$ {Number(selectedBairro.valorFrete).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">Valor do frete</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
