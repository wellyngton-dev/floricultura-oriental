import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const clientes = await prisma.cliente.findMany({
      orderBy: { createdAt: 'desc' },
    })

    const formatados = clientes.map((c) => ({
      id: c.id,
      nome: c.nome,
      email: c.email,
      telefone: c.telefone,
      cpf: c.cpf,
      createdAt: c.createdAt.toISOString(),
    }))

    return NextResponse.json(formatados)
  } catch (error) {
    console.error('Erro ao buscar clientes:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar clientes' },
      { status: 500 },
    )
  }
}
