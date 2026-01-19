import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌸 Iniciando seed do banco de dados...')

  // Limpar dados existentes
  await prisma.itemPedido.deleteMany()
  await prisma.pedido.deleteMany()
  await prisma.produto.deleteMany()
  await prisma.cliente.deleteMany()

  // Criar Produtos
  const produtos = await Promise.all([
    prisma.produto.create({
      data: {
        nome: 'Buquê Rosas Vermelhas Premium',
        descricao: '12 rosas vermelhas colombianas com embalagem especial',
        categoria: 'Aniversário',
        preco: 189.90,
        imagemUrl: '/images/buque-rosas-vermelhas.jpg',
        ativo: true,
      },
    }),
    prisma.produto.create({
      data: {
        nome: 'Arranjo Lírios Brancos',
        descricao: 'Arranjo elegante com lírios brancos e folhagens',
        categoria: 'Casamento',
        preco: 249.90,
        imagemUrl: '/images/arranjo-lirios.jpg',
        ativo: true,
      },
    }),
    prisma.produto.create({
      data: {
        nome: 'Buquê Girassóis',
        descricao: '7 girassóis frescos com embalagem rústica',
        categoria: 'Aniversário',
        preco: 149.90,
        imagemUrl: '/images/buque-girassois.jpg',
        ativo: true,
      },
    }),
    prisma.produto.create({
      data: {
        nome: 'Cesta de Flores Mistas',
        descricao: 'Cesta com flores do campo variadas',
        categoria: 'Agradecimento',
        preco: 199.90,
        imagemUrl: '/images/cesta-mistas.jpg',
        ativo: true,
      },
    }),
    prisma.produto.create({
      data: {
        nome: 'Coroa de Flores',
        descricao: 'Coroa fúnebre com flores brancas e arranjos verdes',
        categoria: 'Luto',
        preco: 389.90,
        imagemUrl: '/images/coroa-flores.jpg',
        ativo: true,
      },
    }),
    prisma.produto.create({
      data: {
        nome: 'Buquê Tulipas Coloridas',
        descricao: '15 tulipas em cores variadas',
        categoria: 'Aniversário',
        preco: 279.90,
        imagemUrl: '/images/buque-tulipas.jpg',
        ativo: true,
      },
    }),
    prisma.produto.create({
      data: {
        nome: 'Arranjo Orquídeas',
        descricao: 'Arranjo sofisticado com orquídeas phalaenopsis',
        categoria: 'Casamento',
        preco: 349.90,
        imagemUrl: '/images/arranjo-orquideas.jpg',
        ativo: true,
      },
    }),
    prisma.produto.create({
      data: {
        nome: 'Buquê Mini Rosas',
        descricao: 'Buquê delicado com mini rosas em tons pastéis',
        categoria: 'Romântico',
        preco: 129.90,
        imagemUrl: '/images/buque-mini-rosas.jpg',
        ativo: true,
      },
    }),
  ])

  console.log(`✅ ${produtos.length} produtos criados`)

  // Criar Clientes
  const clientes = await Promise.all([
    prisma.cliente.create({
      data: {
        nome: 'Maria Silva',
        email: 'maria.silva@email.com',
        telefone: '(16) 99999-1111',
      },
    }),
    prisma.cliente.create({
      data: {
        nome: 'João Santos',
        email: 'joao.santos@email.com',
        telefone: '(16) 99999-2222',
      },
    }),
    prisma.cliente.create({
      data: {
        nome: 'Ana Paula Costa',
        email: 'ana.costa@email.com',
        telefone: '(16) 99999-3333',
      },
    }),
  ])

  console.log(`✅ ${clientes.length} clientes criados`)

  // Criar Pedidos de Exemplo
  const hoje = new Date()
  const amanha = new Date(hoje)
  amanha.setDate(amanha.getDate() + 1)

  await prisma.pedido.create({
    data: {
      clienteId: clientes[0].id,
      status: 'CONFIRMADO',
      dataEntrega: amanha,
      horaEntrega: '15:00',
      enderecoEntrega: 'Rua das Flores, 123 - Centro - São Carlos/SP',
      observacoes: 'Entregar com cartão de aniversário',
      valorTotal: 189.90,
      pagamentoStatus: 'approved',
      itens: {
        create: [
          {
            produtoId: produtos[0].id,
            quantidade: 1,
            precoUnit: 189.90,
          },
        ],
      },
    },
  })

  await prisma.pedido.create({
    data: {
      clienteId: clientes[1].id,
      status: 'EM_PREPARACAO',
      dataEntrega: hoje,
      horaEntrega: '18:00',
      enderecoEntrega: 'Av. São Carlos, 456 - Vila Prado - São Carlos/SP',
      observacoes: null,
      valorTotal: 479.70,
      pagamentoStatus: 'approved',
      itens: {
        create: [
          {
            produtoId: produtos[2].id,
            quantidade: 1,
            precoUnit: 149.90,
          },
          {
            produtoId: produtos[3].id,
            quantidade: 1,
            precoUnit: 199.90,
          },
          {
            produtoId: produtos[7].id,
            quantidade: 1,
            precoUnit: 129.90,
          },
        ],
      },
    },
  })

  await prisma.pedido.create({
    data: {
      clienteId: clientes[2].id,
      status: 'PENDENTE',
      dataEntrega: amanha,
      horaEntrega: '10:00',
      enderecoEntrega: 'Rua XV de Novembro, 789 - Centro - São Carlos/SP',
      observacoes: 'Deixar com porteiro se não estiver',
      valorTotal: 349.90,
      pagamentoStatus: 'pending',
      itens: {
        create: [
          {
            produtoId: produtos[6].id,
            quantidade: 1,
            precoUnit: 349.90,
          },
        ],
      },
    },
  })

  console.log(`✅ 3 pedidos criados com itens`)

  console.log('\n🎉 Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
