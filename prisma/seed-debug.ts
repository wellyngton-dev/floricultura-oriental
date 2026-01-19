import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function main() {
  try {
    console.log('=== INICIANDO SEED ===')
    
    // Testar conexão
    console.log('1. Testando conexão...')
    await prisma.$connect()
    console.log('✅ Conectado ao banco')
    
    // Limpar dados
    console.log('2. Limpando dados existentes...')
    await prisma.itemPedido.deleteMany()
    console.log('✅ ItemPedido limpo')
    
    await prisma.pedido.deleteMany()
    console.log('✅ Pedido limpo')
    
    await prisma.produto.deleteMany()
    console.log('✅ Produto limpo')
    
    await prisma.cliente.deleteMany()
    console.log('✅ Cliente limpo')
    
    // Criar produtos
    console.log('3. Criando produtos...')
    
    const produto1 = await prisma.produto.create({
      data: {
        nome: 'Buquê Rosas Vermelhas Premium',
        descricao: '12 rosas vermelhas colombianas',
        categoria: 'Aniversário',
        preco: 189.90,
        ativo: true,
      },
    })
    console.log('✅ Produto 1 criado:', produto1.nome)
    
    const produto2 = await prisma.produto.create({
      data: {
        nome: 'Arranjo Lírios Brancos',
        descricao: 'Arranjo elegante com lírios',
        categoria: 'Casamento',
        preco: 249.90,
        ativo: true,
      },
    })
    console.log('✅ Produto 2 criado:', produto2.nome)
    
    const produto3 = await prisma.produto.create({
      data: {
        nome: 'Buquê Girassóis',
        descricao: '7 girassóis frescos',
        categoria: 'Aniversário',
        preco: 149.90,
        ativo: true,
      },
    })
    console.log('✅ Produto 3 criado:', produto3.nome)
    
    // Contar produtos
    const count = await prisma.produto.count()
    console.log(`\n📦 Total de produtos criados: ${count}`)
    
    console.log('\n=== SEED CONCLUÍDO COM SUCESSO ===')
    
  } catch (error) {
    console.error('❌ ERRO DURANTE SEED:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ Erro fatal:', e)
    process.exit(1)
  })
  .finally(async () => {
    console.log('Desconectando...')
    await prisma.$disconnect()
  })
