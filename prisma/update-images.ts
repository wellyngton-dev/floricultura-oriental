import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const produtosComImagens = [
  {
    nome: 'Buquê de Rosas Vermelhas',
    imagemUrl: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=800&q=80'
  },
  {
    nome: 'Arranjo de Lírios Brancos',
    imagemUrl: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&q=80'
  },
  {
    nome: 'Buquê de Tulipas Mix',
    imagemUrl: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?w=800&q=80'
  },
  {
    nome: 'Cesta de Flores Variadas',
    imagemUrl: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=800&q=80'
  },
  {
    nome: 'Orquídeas Phalaenopsis',
    imagemUrl: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=800&q=80'
  },
  {
    nome: 'Buquê Romântico Rosas Rosa',
    imagemUrl: 'https://images.unsplash.com/photo-1496062031456-07b8f162a322?w=800&q=80'
  },
  {
    nome: 'Arranjo Tropical',
    imagemUrl: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=800&q=80'
  },
  {
    nome: 'Buquê de Girassóis',
    imagemUrl: 'https://images.unsplash.com/photo-1597848212624-e530bb5954c2?w=800&q=80'
  },
  {
    nome: 'Rosas Brancas Premium',
    imagemUrl: 'https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=800&q=80'
  },
  {
    nome: 'Arranjo de Hortênsias',
    imagemUrl: 'https://images.unsplash.com/photo-1591886960571-74d43a9d4166?w=800&q=80'
  }
]

async function main() {
  console.log('Atualizando imagens dos produtos...')
  
  for (const produto of produtosComImagens) {
    await prisma.produto.updateMany({
      where: { nome: { contains: produto.nome.split(' ')[0] } },
      data: { imagemUrl: produto.imagemUrl }
    })
    console.log(`✓ ${produto.nome}`)
  }
  
  console.log('✅ Imagens atualizadas!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
