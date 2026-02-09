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
  await prisma.bairro.deleteMany()
  await prisma.categoria.deleteMany()

  // 1️⃣ Criar Categorias
  console.log('📁 Criando categorias...')

  const categoriaRomantico = await prisma.categoria.create({
    data: {
      nome: 'Romântico',
      descricao: 'Flores e arranjos românticos para momentos especiais',
      ativo: true,
      ordem: 1,
    },
  })
  console.log(`  ✓ Categoria criada: ${categoriaRomantico.nome}`)

  const categoriaCasamento = await prisma.categoria.create({
    data: {
      nome: 'Casamento',
      descricao: 'Arranjos elegantes para casamentos e eventos',
      ativo: true,
      ordem: 2,
    },
  })
  console.log(`  ✓ Categoria criada: ${categoriaCasamento.nome}`)

  const categoriaAniversario = await prisma.categoria.create({
    data: {
      nome: 'Aniversário',
      descricao: 'Flores e cestas para comemorar aniversários',
      ativo: true,
      ordem: 3,
    },
  })
  console.log(`  ✓ Categoria criada: ${categoriaAniversario.nome}`)

  // 2️⃣ Criar Bairros
  console.log('📍 Criando bairros...')

  const bairros = [
    // São Carlos - Região Central
    { nome: 'Centro', cidade: 'São Carlos', estado: 'SP', valorFrete: 5.00, ativo: true },
    { nome: 'Vila Prado', cidade: 'São Carlos', estado: 'SP', valorFrete: 7.00, ativo: true },
    { nome: 'Jardim Brasil', cidade: 'São Carlos', estado: 'SP', valorFrete: 6.00, ativo: true },

    // São Carlos - Outras regiões
    { nome: 'Vila Isabel', cidade: 'São Carlos', estado: 'SP', valorFrete: 8.00, ativo: true },
    { nome: 'Santa Felícia', cidade: 'São Carlos', estado: 'SP', valorFrete: 10.00, ativo: true },
    { nome: 'Cidade Aracy', cidade: 'São Carlos', estado: 'SP', valorFrete: 12.00, ativo: true },
    { nome: 'Jardim Paraíso', cidade: 'São Carlos', estado: 'SP', valorFrete: 9.00, ativo: true },
    { nome: 'Jardim Bethânia', cidade: 'São Carlos', estado: 'SP', valorFrete: 9.00, ativo: true },
    { nome: 'Parque Arnold Schimidt', cidade: 'São Carlos', estado: 'SP', valorFrete: 11.00, ativo: true },

    // Ibaté
    { nome: 'Centro', cidade: 'Ibaté', estado: 'SP', valorFrete: 15.00, ativo: true },
    { nome: 'Jardim Icaraí', cidade: 'Ibaté', estado: 'SP', valorFrete: 16.00, ativo: true },
    { nome: 'Jardim Cruzeiro', cidade: 'Ibaté', estado: 'SP', valorFrete: 17.00, ativo: true },
  ]

  for (const bairro of bairros) {
    await prisma.bairro.create({ data: bairro })
    console.log(`  ✓ Bairro criado: ${bairro.nome} - ${bairro.cidade}`)
  }

  // 3️⃣ Criar Produtos
  console.log('📦 Criando produtos...')

  const produtos = [
    {
      nome: 'Buquê de Rosas Vermelhas',
      descricao: 'Lindo buquê com 12 rosas vermelhas frescas, embaladas com papel kraft e fita de cetim.',
      categoriaId: categoriaRomantico.id,
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
      categoriaId: categoriaCasamento.id,
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
      categoriaId: categoriaAniversario.id,
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
      descricao: 'Alegre buquê com girassóis frescos, perfeito para alegrar o dia.',
      categoriaId: categoriaAniversario.id,
      preco: 79.90,
      ativo: true,
      imagens: [
        {
          url: 'https://images.unsplash.com/photo-1470509037663-253afd7f0f51?w=500',
          ordem: 0,
          principal: true,
        },
      ],
    },
    {
      nome: 'Arranjo Tropical',
      descricao: 'Arranjo exótico com flores tropicais coloridas em vaso decorativo.',
      categoriaId: categoriaCasamento.id,
      preco: 159.90,
      ativo: true,
      imagens: [
        {
          url: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=500',
          ordem: 0,
          principal: true,
        },
      ],
    },
    {
      nome: 'Buquê de Tulipas',
      descricao: 'Delicado buquê com tulipas coloridas, símbolo de amor e carinho.',
      categoriaId: categoriaRomantico.id,
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
        categoria: true,
      },
    })
    produtosCriados.push(produtoCriado)
    console.log(`  ✓ Produto criado: ${produtoCriado.nome} (${produtoCriado.categoria?.nome})`)
  }

  // 4️⃣ Criar Cliente
  console.log('👥 Criando cliente...')
  const cliente = await prisma.cliente.create({
    data: {
      nome: 'Maria Silva',
      email: 'maria.silva@email.com',
      telefone: '(16) 99999-1111',
    },
  })
  console.log(`  ✓ Cliente criado: ${cliente.nome}`)

  // 5️⃣ Criar Pedido
  console.log('🛒 Criando pedido...')
  const amanha = new Date()
  amanha.setDate(amanha.getDate() + 1)

  const pedido = await prisma.pedido.create({
    data: {
      clienteId: cliente.id,
      compradorNome: 'Maria Silva',
      compradorEmail: 'maria.silva@email.com',
      compradorTelefone: '+5516999991111',
      destinatarioNome: 'Pedro Silva',
      destinatarioTelefone: '+5516988881111',
      dataEntrega: amanha,
      periodoEntrega: 'tarde',
      tipoEndereco: 'residencial',
      cep: '13560-000',
      endereco: 'Rua das Flores',
      numero: '123',
      bairro: 'Centro',
      cidade: 'São Carlos',
      estado: 'SP',
      mensagem: 'Feliz aniversário! ❤️',
      valorProdutos: 89.90,
      valorFrete: 5.00,
      valorTotal: 94.90,
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

  console.log(`  ✓ Pedido criado: #${pedido.id.slice(0, 8)}`)

  console.log('\n✅ Seed concluído com sucesso!')
  console.log(`📁 3 categorias criadas`)
  console.log(`📍 ${bairros.length} bairros criados`)
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
