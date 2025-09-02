import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    // Поддерживаем оба варианта: 'image' и 'file'
    const file = (formData.get('image') || formData.get('file')) as File;

    console.log('📤 Upload API called with:', { 
      hasFile: !!file, 
      fileName: file?.name, 
      fileSize: file?.size, 
      fileType: file?.type 
    });

    if (!file) {
      console.log('❌ No file found in formData');
      return NextResponse.json(
        { success: false, error: 'No file uploaded. Expected field name: "image" or "file"' },
        { status: 400 }
      );
    }

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      );
    }

    // Проверяем размер файла (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File size too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Создаем уникальное имя файла
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    const fileName = `${timestamp}-${randomString}.${extension}`;

    // Получаем тип загрузки из formData
    const uploadType = formData.get('uploadType') as string || formData.get('type') as string || 'news';
    
    // Путь для сохранения файла
    const uploadDir = join(process.cwd(), 'public', 'images', uploadType);
    const filePath = join(uploadDir, fileName);

    // Создаем директорию, если она не существует
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
      console.log('📁 Created directory:', uploadDir);
    }

    // Конвертируем файл в Buffer и сохраняем
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Возвращаем URL файла
    const fileUrl = `/images/${uploadType}/${fileName}`;

    console.log('✅ File uploaded successfully:', {
      fileName,
      fileUrl,
      uploadType,
      size: file.size
    });

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: fileName,
      size: file.size,
      type: file.type
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    );
  }
} 