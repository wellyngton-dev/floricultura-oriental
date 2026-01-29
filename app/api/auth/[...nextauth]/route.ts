import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email e senha são obrigatórios')
        }

        const cliente = await prisma.cliente.findUnique({
          where: { email: credentials.email }
        })

        if (!cliente || !cliente.senha) {
          throw new Error('Email ou senha inválidos')
        }

        const senhaValida = await bcrypt.compare(
          credentials.password,
          cliente.senha
        )

        if (!senhaValida) {
          throw new Error('Email ou senha inválidos')
        }

        // ✅ RETORNA TODOS OS DADOS DO CLIENTE
        return {
          id: cliente.id,
          email: cliente.email,
          name: cliente.nome,
          role: cliente.role,
          telefone: cliente.telefone,
          cpf: cliente.cpf
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
        // ✅ ADICIONA OS DADOS EXTRAS AO TOKEN
        token.telefone = (user as any).telefone
        token.cpf = (user as any).cpf
        token.endereco = (user as any).endereco
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
          // ✅ ADICIONA OS DADOS EXTRAS À SESSION
          ; (session.user as any).telefone = token.telefone as string
          ; (session.user as any).cpf = token.cpf as string
          ; (session.user as any).endereco = token.endereco as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
