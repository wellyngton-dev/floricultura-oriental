import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { nome, email, telefone, senha } = await request.json()

    // Validações
    if (!nome || !email || !telefone || !senha) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se email já existe
    const clienteExistente = await prisma.cliente.findUnique({
      where: { email }
    })

    if (clienteExistente) {
      return NextResponse.json(
        { error: 'Este email já está cadastrado' },
        { status: 400 }
      )
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10)

    // Criar cliente
    const cliente = await prisma.cliente.create({
      data: {
        nome,
        email,
        telefone,
        senha: senhaHash,
        role: 'cliente'
      },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        role: true,
        createdAt: true
      }
    })

    return NextResponse.json(cliente, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar cliente:', error)
    return NextResponse.json(
      { error: 'Erro ao criar conta' },
      { status: 500 }
    )
  }
}
