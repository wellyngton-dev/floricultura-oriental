import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin'; // ← Use o admin
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  console.log('🚀 Iniciando upload...');
  
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    console.log(`📦 Arquivos recebidos: ${files.length}`);

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    const uploadedFiles = [];

    for (const file of files) {
      console.log(`📁 Processando: ${file.name}`);

      if (!file.type.startsWith('image/')) {
        console.log('⚠️ Não é imagem, pulando...');
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        console.log('⚠️ Arquivo muito grande, pulando...');
        continue;
      }

      const fileExtension = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      const filePath = `produtos/${fileName}`;

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      console.log(`🔄 Enviando para Supabase: ${filePath}`);

      // Usa supabaseAdmin que bypassa RLS
      const { data, error } = await supabaseAdmin.storage
        .from('produtos')
        .upload(filePath, buffer, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('❌ Erro:', error.message);
        console.error('Detalhes:', error);
        return NextResponse.json(
          { error: `Erro ao fazer upload: ${error.message}` },
          { status: 500 }
        );
      }

      console.log('✅ Upload OK:', data);

      const { data: publicUrlData } = supabaseAdmin.storage
        .from('produtos')
        .getPublicUrl(filePath);

      uploadedFiles.push({
        url: publicUrlData.publicUrl,
        name: file.name,
        size: file.size,
      });
    }

    if (uploadedFiles.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum arquivo foi enviado com sucesso' },
        { status: 400 }
      );
    }

    console.log(`✅ Total enviado: ${uploadedFiles.length}`);

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
    });
  } catch (error) {
    console.error('❌ Erro geral:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer upload das imagens', details: String(error) },
      { status: 500 }
    );
  }
}
