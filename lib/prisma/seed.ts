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
        {
          url: 'https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=500',
          ordem: 1,
          principal: false,
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
    {
      nome: 'Buquê de Girassóis',
      descricao: 'Alegre buquê com girassóis vibrantes, trazendo luz e energia positiva.',
      categoria: 'Ocasiões Especiais',
      preco: 79.90,
      ativo: true,
      imagens: [
        {
          url: 'https://images.unsplash.com/photo-1597848212624-e4e9bb9c8f91?w=500',
          ordem: 0,
          principal: true,
        },
      ],
    },
    {
      nome: 'Arranjo de Orquídeas',
      descricao: 'Sofisticado arranjo de orquídeas brancas em vaso de cerâmica.',
      categoria: 'Corporativo',
      preco: 189.90,
      ativo: true,
      imagens: [
        {
          url: 'https://images.unsplash.com/photo-1517258777-403c8d58fa28?w=500',
          ordem: 0,
          principal: true,
        },
      ],
    },
    {
      nome: 'Buquê de Tulipas',
      descricao: 'Delicado buquê com 15 tulipas coloridas, ideal para qualquer ocasião.',
      categoria: 'Romântico',
      preco: 99.90,
      ativo: true,
      imagens: [
        {
          url: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?w=500',
          ordem: 0,
          principal: true,
        },
      ],
    },
    {
      nome: 'Coroa de Flores',
      descricao: 'Coroa de flores brancas para homenagens especiais.',
      categoria: 'Luto',
      preco: 249.90,
      ativo: true,
      imagens: [
        {
          url: 'https://images.unsplash.com/photo-1561913024-23c0a5c6c4ad?w=500',
          ordem: 0,
          principal: true,
        },
      ],
    },
    {
      nome: 'Arranjo Tropical',
      descricao: 'Vibrante arranjo com flores tropicais e folhagens exóticas.',
      categoria: 'Ocasiões Especiais',
      preco: 169.90,
      ativo: true,
      imagens: [
        {
          url: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=500',
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

  // Criar Clientes
  console.log('👥 Criando clientes...')

  const clientes = [
    {
      nome: 'Maria Silva',
      email: 'maria.silva@email.com',
      telefone: '(16) 99999-1111',
      cpf: '123.456.789-00',
    },
    {
      nome: 'João Santos',
      email: 'joao.santos@email.com',
      telefone: '(16) 99999-2222',
      cpf: '987.654.321-00',
    },
    {
      nome: 'Ana Costa',
      email: 'ana.costa@email.com',
      telefone: '(16) 99999-3333',
    },
  ]

  const clientesCriados = []
  for (const cliente of clientes) {
    const clienteCriado = await prisma.cliente.create({
      data: cliente,
    })
    clientesCriados.push(clienteCriado)
    console.log(`  ✓ Cliente criado: ${clienteCriado.nome}`)
  }

  // Criar Endereços para clientes
  console.log('📍 Criando endereços...')

  await prisma.enderecoCliente.create({
    data: {
      clienteId: clientesCriados[0].id,
      apelido: 'Casa',
      cep: '13560-000',
      endereco: 'Rua das Flores',
      numero: '123',
      bairro: 'Centro',
      cidade: 'São Carlos',
      estado: 'SP',
      principal: true,
    },
  })

  await prisma.enderecoCliente.create({
    data: {
      clienteId: clientesCriados[0].id,
      apelido: 'Trabalho',
      cep: '13560-001',
      endereco: 'Avenida São Carlos',
      numero: '456',
      bairro: 'Centro',
      cidade: 'São Carlos',
      estado: 'SP',
      principal: false,
    },
  })

  // Criar Pedidos
  console.log('🛒 Criando pedidos...')

  const hoje = new Date()
  const amanha = new Date(hoje)
  amanha.setDate(amanha.getDate() + 1)

  const pedido1 = await prisma.pedido.create({
    data: {
      clienteId: clientesCriados[0].id,
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
      mensagem: 'Feliz aniversário, amor! ❤️',
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
    include: {
      itens: {
        include: {
          produto: true,
        },
      },
    },
  })

  console.log(`  ✓ Pedido criado: #${pedido1.id.slice(0, 8)}`)

  const pedido2 = await prisma.pedido.create({
    data: {
      clienteId: clientesCriados[1].id,
      compradorNome: 'João Santos',
      compradorEmail: 'joao.santos@email.com',
      compradorTelefone: '(16) 99999-2222',
      destinatarioNome: 'Fernanda Santos',
      destinatarioTelefone: '(16) 98888-2222',
      dataEntrega: amanha,
      periodoEntrega: 'manha',
      tipoEndereco: 'residencia',
      cep: '13560-002',
      endereco: 'Rua XV de Novembro',
      numero: '789',
      bairro: 'Centro',
      cidade: 'São Carlos',
      estado: 'SP',
      mensagem: 'Parabéns pelo novo emprego! 🎉',
      valorTotal: 279.80,
      status: 'PENDENTE',
      itens: {
        create: [
          {
            produtoId: produtosCriados[1].id,
            quantidade: 1,
            precoUnit: 129.90,
          },
          {
            produtoId: produtosCriados[2].id,
            quantidade: 1,
            precoUnit: 149.90,
          },
        ],
      },
    },
    include: {
      itens: {
        include: {
          produto: true,
        },
      },
    },
  })

  console.log(`  ✓ Pedido criado: #${pedido2.id.slice(0, 8)}`)

  const pedido3 = await prisma.pedido.create({
    data: {
      clienteId: clientesCriados[2].id,
      compradorNome: 'Ana Costa',
      compradorEmail: 'ana.costa@email.com',
      compradorTelefone: '(16) 99999-3333',
      destinatarioNome: 'Carlos Costa',
      destinatarioTelefone: '(16) 98888-3333',
      dataEntrega: amanha,
      periodoEntrega: 'comercial',
      tipoEndereco: 'comercial',
      cep: '13560-003',
      endereco: 'Avenida Getúlio Vargas',
      numero: '1000',
      bairro: 'Centro',
      cidade: 'São Carlos',
      estado: 'SP',
      referencia: 'Próximo ao shopping',
      valorTotal: 189.90,
      status: 'EM_PREPARO',
      itens: {
        create: [
          {
            produtoId: produtosCriados[4].id,
            quantidade: 1,
            precoUnit: 189.90,
          },
        ],
      },
    },
    include: {
      itens: {
        include: {
          produto: true,
        },
      },
    },
  })

  console.log(`  ✓ Pedido criado: #${pedido3.id.slice(0, 8)}`)

  console.log('✅ Seed concluído com sucesso!')
  console.log(`📦 ${produtosCriados.length} produtos criados`)
  console.log(`👥 ${clientesCriados.length} clientes criados`)
  console.log(`🛒 3 pedidos criados`)
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
