import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Buscar bairro por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // 🔧 Tipagem correta
) {
  try {
    const { id } = await params // 🔧 Await params

    const bairro = await prisma.bairro.findUnique({
      where: { id },
    })

    if (!bairro) {
      return NextResponse.json(
        { error: 'Bairro não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ...bairro,
      valorFrete: Number(bairro.valorFrete),
    })
  } catch (error) {
    console.error('Erro ao buscar bairro:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar bairro' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar bairro
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // 🔧 Tipagem correta
) {
  try {
    const { id } = await params // 🔧 Await params
    const body = await request.json()
    const { nome, cidade, estado, valorFrete, ativo } = body

    const bairro = await prisma.bairro.update({
      where: { id },
      data: {
        nome,
        cidade,
        estado,
        valorFrete: valorFrete ? parseFloat(valorFrete) : undefined,
        ativo,
      },
    })

    return NextResponse.json({
      ...bairro,
      valorFrete: Number(bairro.valorFrete),
    })
  } catch (error: any) {
    console.error('Erro ao atualizar bairro:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Bairro não encontrado' },
        { status: 404 }
      )
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Já existe um bairro com este nome' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao atualizar bairro' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir bairro
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // 🔧 Tipagem correta
) {
  try {
    const { id } = await params // 🔧 Await params

    await prisma.bairro.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Bairro excluído com sucesso' })
  } catch (error: any) {
    console.error('Erro ao excluir bairro:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Bairro não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao excluir bairro' },
      { status: 500 }
    )
  }
}
