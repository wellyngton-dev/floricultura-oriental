import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateImages() {
  console.log('🔄 Iniciando migração de imagens...');

  try {
    // Buscar todos os produtos com imagemUrl
    const produtos = await prisma.produto.findMany({
      where: {
        imagemUrl: {
          not: null,
        },
      },
      select: {
        id: true,
        imagemUrl: true,
      },
    });

    console.log(`📦 Encontrados ${produtos.length} produtos com imagens`);

    // Migrar cada imagem para a nova tabela
    for (const produto of produtos) {
      if (produto.imagemUrl) {
        await prisma.produtoImagem.create({
          data: {
            produtoId: produto.id,
            url: produto.imagemUrl,
            ordem: 0,
            principal: true,
          },
        });
        console.log(`✅ Migrado: ${produto.imagemUrl}`);
      }
    }

    console.log('✅ Migração concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateImages();
