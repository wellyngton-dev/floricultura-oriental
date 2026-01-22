import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    const uploadedFiles = [];

    for (const file of files) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        continue;
      }

      // Validar tamanho (5MB)
      if (file.size > 5 * 1024 * 1024) {
        continue;
      }

      // Gerar nome único
      const fileExtension = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      const filePath = `produtos/${fileName}`;

      // Converter para buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Upload para Supabase Storage
      const { data, error } = await supabase.storage
        .from('produtos')
        .upload(filePath, buffer, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Erro ao fazer upload no Supabase:', error);
        continue;
      }

      // Obter URL pública
      const { data: publicUrlData } = supabase.storage
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

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer upload das imagens' },
      { status: 500 }
    );
  }
}
