// app/api/bairros/por-nome/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const bairro = searchParams.get('bairro')
    const cidade = searchParams.get('cidade') // 🆕 Adicionar cidade

    if (!bairro) {
      return NextResponse.json(
        { error: 'Nome do bairro é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar bairro ativo
    const bairroEncontrado = await prisma.bairro.findFirst({
      where: {
        nome: {
          equals: bairro,
          mode: 'insensitive',
        },
        ...(cidade && {
          cidade: {
            equals: cidade,
            mode: 'insensitive',
          },
        }),
        ativo: true,
      },
    })

    if (!bairroEncontrado) {
      return NextResponse.json(
        { error: 'Bairro não encontrado ou frete não disponível para esta região' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      bairro: bairroEncontrado.nome,
      cidade: bairroEncontrado.cidade,
      estado: bairroEncontrado.estado,
      valorFrete: Number(bairroEncontrado.valorFrete),
    })
  } catch (error) {
    console.error('Erro ao buscar frete por bairro:', error)
    return NextResponse.json(
      { error: 'Erro ao calcular frete' },
      { status: 500 }
    )
  }
}
