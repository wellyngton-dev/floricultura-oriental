import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Buscar bairro por ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const bairro = await prisma.bairro.findUnique({
      where: { id },
    })

    if (!bairro) {
      return NextResponse.json(
        { error: 'Bairro não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(bairro)
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
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { nome, cidade, estado, valorFrete, ativo } = body

    const bairro = await prisma.bairro.update({
      where: { id },
      data: {
        nome,
        cidade,
        estado,
        valorFrete,
        ativo,
      },
    })

    return NextResponse.json(bairro)
  } catch (error) {
    console.error('Erro ao atualizar bairro:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar bairro' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir bairro
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.bairro.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Bairro excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir bairro:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir bairro' },
      { status: 500 }
    )
  }
}
