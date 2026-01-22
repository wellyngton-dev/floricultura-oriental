import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ params é Promise
) {
  try {
    const { id } = await params; // ✅ await params

    const produto = await prisma.produto.findUnique({
      where: { id },
      include: {
        imagens: {
          orderBy: {
            ordem: 'asc',
          },
        },
      },
    });

    if (!produto) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...produto,
      preco: parseFloat(produto.preco.toString()),
    });
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar produto' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ params é Promise
) {
  try {
    const { id } = await params; // ✅ await params
    const body = await request.json();
    const { nome, descricao, categoria, preco, imagens, ativo } = body;

    // Deletar imagens antigas
    await prisma.produtoImagem.deleteMany({
      where: { produtoId: id },
    });

    // Atualizar produto
    const produto = await prisma.produto.update({
      where: { id },
      data: {
        nome,
        descricao,
        categoria,
        preco: parseFloat(preco),
        ativo: ativo !== undefined ? ativo : true,
        imagens: {
          create: imagens?.map((img: any, index: number) => ({
            url: img.url,
            ordem: index,
            principal: index === 0,
          })) || [],
        },
      },
      include: {
        imagens: {
          orderBy: {
            ordem: 'asc',
          },
        },
      },
    });

    return NextResponse.json({
      ...produto,
      preco: parseFloat(produto.preco.toString()),
    });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar produto' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ params é Promise
) {
  try {
    const { id } = await params; // ✅ await params
    const body = await request.json();
    
    const produto = await prisma.produto.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({
      ...produto,
      preco: parseFloat(produto.preco.toString()),
    });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar produto' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ params é Promise
) {
  try {
    const { id } = await params; // ✅ await params

    await prisma.produto.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar produto' },
      { status: 500 }
    );
  }
}
