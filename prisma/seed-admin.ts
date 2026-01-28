import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const senhaHash = await bcrypt.hash('admin123', 10)

  const admin = await prisma.cliente.upsert({
    where: { email: 'admin@floricultura.com' },
    update: {},
    create: {
      email: 'admin@floricultura.com',
      nome: 'Administrador',
      telefone: '(16) 99999-9999',
      senha: senhaHash,
      role: 'admin'
    }
  })

  console.log('✅ Admin criado:', admin.email)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
