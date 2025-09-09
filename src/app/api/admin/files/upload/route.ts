import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { addServerLog } from '@/lib/serverLog';

export async function POST(request: NextRequest) {
  try {
    // Увеличиваем лимит размера для formData
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string;
    
    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: 'File is required' 
      }, { status: 400 });
    }

    if (!category) {
      return NextResponse.json({ 
        success: false, 
        error: 'Category is required' 
      }, { status: 400 });
    }

    // Проверяем, что категория допустима
    const allowedCategories = ['characters', 'weapons', 'artifacts', 'news', 'logos', 'avatars'];
    if (!allowedCategories.includes(category)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid category' 
      }, { status: 400 });
    }

    // Проверяем тип файла
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid file type. Only images are allowed.' 
      }, { status: 400 });
    }

    // Проверяем размер файла (максимум 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        success: false, 
        error: 'File too large. Maximum size is 10MB.' 
      }, { status: 400 });
    }

    // Создаем уникальное имя файла
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = path.extname(file.name);
    const fileName = `${timestamp}-${randomString}${extension}`;

    // Определяем путь для сохранения
    const publicDir = path.join(process.cwd(), 'public');
    const categoryDir = path.join(publicDir, 'images', category);
    const filePath = path.join(categoryDir, fileName);

    // Создаем директорию, если её нет
    try {
      await mkdir(categoryDir, { recursive: true });
    } catch {
      console.warn(`Directory ${categoryDir} already exists or cannot be created`);
    }

    // Сохраняем файл
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Формируем URL для файла
    const relativePath = path.relative(publicDir, filePath);
    const url = `/${relativePath.replace(/\\/g, '/')}`;

    addServerLog('info', 'admin-files', 'File uploaded successfully', { 
      fileName,
      category,
      filePath,
      url,
      size: file.size,
      type: file.type
    });

    return NextResponse.json({
      success: true,
      data: {
        fileName,
        url,
        category,
        size: file.size,
        type: file.type
      },
      message: 'File uploaded successfully'
    });

  } catch (error) {
    console.error('File upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    addServerLog('error', 'admin-files', 'Error uploading file', { error: errorMessage });
    
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
