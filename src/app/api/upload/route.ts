import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!type) {
      return NextResponse.json(
        { error: 'No type specified' },
        { status: 400 }
      );
    }

    // Проверяем тип файла
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/x-icon'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, SVG, and ICO files are allowed.' },
        { status: 400 }
      );
    }

    // Проверяем размер файла (максимум 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Определяем директорию для загрузки
    let uploadDir: string;
    let fileName: string;

    switch (type) {
      case 'logo':
        uploadDir = join(process.cwd(), 'public', 'images', 'logos');
        fileName = `logo-${Date.now()}.${getFileExtension(file.name)}`;
        break;
      case 'favicon':
        uploadDir = join(process.cwd(), 'public', 'images', 'logos');
        fileName = `favicon-${Date.now()}.${getFileExtension(file.name)}`;
        break;
      case 'weapon':
        uploadDir = join(process.cwd(), 'public', 'images', 'weapons');
        fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${getFileExtension(file.name)}`;
        break;
      case 'artifact':
        uploadDir = join(process.cwd(), 'public', 'images', 'artifacts');
        fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${getFileExtension(file.name)}`;
        break;
      case 'character':
        uploadDir = join(process.cwd(), 'public', 'images', 'characters');
        fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${getFileExtension(file.name)}`;
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid upload type' },
          { status: 400 }
        );
    }

    // Создаем директорию, если она не существует
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.error('Error creating directory:', error);
    }

    // Сохраняем файл
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = join(uploadDir, fileName);
    
    await writeFile(filePath, buffer);

    // Возвращаем путь к файлу
    const fileUrl = `/images/${type === 'logo' || type === 'favicon' ? 'logos' : type}s/${fileName}`;

    return NextResponse.json({ 
      success: true, 
      url: fileUrl,
      fileName: fileName
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || 'png';
} 