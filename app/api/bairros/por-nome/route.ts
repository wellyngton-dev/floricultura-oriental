import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 🚀 Cache em memória
let bairrosCache: any[] = []
let cacheTimestamp = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

async function getBairrosAtivos() {
  const agora = Date.now()
  
  // Se cache ainda é válido, retorna do cache
  if (bairrosCache.length > 0 && agora - cacheTimestamp < CACHE_TTL) {
    console.log('📦 Usando cache')
    return bairrosCache
  }

  // Buscar do banco e atualizar cache
  console.log('🔄 Atualizando cache de bairros')
  bairrosCache = await prisma.bairro.findMany({
    where: { ativo: true },
  })
  cacheTimestamp = agora

  return bairrosCache
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const bairro = searchParams.get('bairro')

    if (!bairro) {
      return NextResponse.json(
        { error: 'Parâmetro bairro é obrigatório' },
        { status: 400 }
      )
    }

    console.log('🔍 Buscando bairro:', bairro)

    // 🚀 Buscar do cache
    const todosBairros = await getBairrosAtivos()

    // Normalizar busca
    const bairroNormalizado = bairro
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()

    // Busca rápida em memória
    const bairroEncontrado = todosBairros.find((b) => {
      const nomeNormalizado = b.nome
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
      
      // Variações Z/S
      const nomeVariacoes = [
        nomeNormalizado,
        nomeNormalizado.replace(/z/g, 's'),
        nomeNormalizado.replace(/s/g, 'z'),
      ]

      const buscaVariacoes = [
        bairroNormalizado,
        bairroNormalizado.replace(/z/g, 's'),
        bairroNormalizado.replace(/s/g, 'z'),
      ]

      return nomeVariacoes.some((nv) =>
        buscaVariacoes.some((bv) => nv.includes(bv) || bv.includes(nv))
      )
    })

    console.log('✅ Resultado:', bairroEncontrado)

    if (!bairroEncontrado) {
      return NextResponse.json(
        { error: 'Bairro não encontrado ou não atendido' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ...bairroEncontrado,
      valorFrete: Number(bairroEncontrado.valorFrete)
    })
  } catch (error) {
    console.error('❌ Erro ao buscar bairro:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar bairro' },
      { status: 500 }
    )
  }
}
