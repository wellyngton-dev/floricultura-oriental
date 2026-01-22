import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Limpar dados existentes
  console.log('🗑️  Limpando dados existentes...')
  await prisma.itemPedido.deleteMany()
  await prisma.pedido.deleteMany()
  await prisma.produtoImagem.deleteMany()
  await prisma.produto.deleteMany()
  await prisma.enderecoCliente.deleteMany()
  await prisma.cliente.deleteMany()

  // Criar Produtos
  console.log('📦 Criando produtos...')

  const produtos = [
    {
      nome: 'Buquê de Rosas Vermelhas',
      descricao: 'Lindo buquê com 12 rosas vermelhas frescas, embaladas com papel kraft e fita de cetim.',
      categoria: 'Romântico',
      preco: 89.90,
      ativo: true,
      imagens: [
        {
          url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500',
          ordem: 0,
          principal: true,
        },
      ],
    },
    {
      nome: 'Arranjo de Lírios Brancos',
      descricao: 'Elegante arranjo com lírios brancos em vaso de vidro, perfeito para ocasiões especiais.',
      categoria: 'Casamento',
      preco: 129.90,
      ativo: true,
      imagens: [
        {
          url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=500',
          ordem: 0,
          principal: true,
        },
      ],
    },
    {
      nome: 'Cesta de Flores Mistas',
      descricao: 'Cesta rústica com variedade de flores coloridas, ideal para presentear.',
      categoria: 'Aniversário',
      preco: 149.90,
      ativo: true,
      imagens: [
        {
          url: 'https://images.unsplash.com/photo-1487070183336-b863922373d4?w=500',
          ordem: 0,
          principal: true,
        },
      ],
    },
  ]

  const produtosCriados = []
  for (const produto of produtos) {
    const { imagens, ...produtoData } = produto
    const produtoCriado = await prisma.produto.create({
      data: {
        ...produtoData,
        imagens: {
          create: imagens,
        },
      },
      include: {
        imagens: true,
      },
    })
    produtosCriados.push(produtoCriado)
    console.log(`  ✓ Produto criado: ${produtoCriado.nome}`)
  }

  // Criar Cliente
  console.log('👥 Criando cliente...')
  const cliente = await prisma.cliente.create({
    data: {
      nome: 'Maria Silva',
      email: 'maria.silva@email.com',
      telefone: '(16) 99999-1111',
    },
  })
  console.log(`  ✓ Cliente criado: ${cliente.nome}`)

  // Criar Pedido
  console.log('🛒 Criando pedido...')
  const amanha = new Date()
  amanha.setDate(amanha.getDate() + 1)

  const pedido = await prisma.pedido.create({
    data: {
      clienteId: cliente.id,
      compradorNome: 'Maria Silva',
      compradorEmail: 'maria.silva@email.com',
      compradorTelefone: '(16) 99999-1111',
      destinatarioNome: 'Pedro Silva',
      destinatarioTelefone: '(16) 98888-1111',
      dataEntrega: amanha,
      periodoEntrega: 'tarde',
      tipoEndereco: 'residencia',
      cep: '13560-000',
      endereco: 'Rua das Flores',
      numero: '123',
      bairro: 'Centro',
      cidade: 'São Carlos',
      estado: 'SP',
      mensagem: 'Feliz aniversário! ❤️',
      valorTotal: 89.90,
      status: 'CONFIRMADO',
      itens: {
        create: [
          {
            produtoId: produtosCriados[0].id,
            quantidade: 1,
            precoUnit: 89.90,
          },
        ],
      },
    },
  })

  console.log(`  ✓ Pedido criado: #${pedido.id.slice(0, 8)}`)

  console.log('✅ Seed concluído com sucesso!')
  console.log(`📦 ${produtosCriados.length} produtos criados`)
  console.log(`👥 1 cliente criado`)
  console.log(`🛒 1 pedido criado`)
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
