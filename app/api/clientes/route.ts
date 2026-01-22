import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { nome, email, telefone, senha, cpf } = await request.json()

    if (!nome || !email || !telefone) {
      return NextResponse.json(
        { error: 'Nome, email e telefone são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se cliente já existe
    const clienteExistente = await prisma.cliente.findUnique({
      where: { email },
    })

    if (clienteExistente) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 400 }
      )
    }

    // Hash da senha se fornecida
    let senhaHash = null
    if (senha) {
      senhaHash = await bcrypt.hash(senha, 10)
    }

    // Criar cliente
    const cliente = await prisma.cliente.create({
      data: {
        nome,
        email,
        telefone,
        senha: senhaHash,
        cpf,
      },
    })

    // Não retornar a senha
    const { senha: _, ...clienteSemSenha } = cliente

    return NextResponse.json(clienteSemSenha, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar cliente:', error)
    return NextResponse.json(
      { error: 'Erro ao criar cliente' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const clientes = await prisma.cliente.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        cpf: true,
        createdAt: true,
        _count: {
          select: {
            pedidos: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(clientes)
  } catch (error) {
    console.error('Erro ao buscar clientes:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar clientes' },
      { status: 500 }
    )
  }
}
