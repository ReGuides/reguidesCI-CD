import { NextRequest, NextResponse } from 'next/server';
import { rename, access } from 'fs/promises';
import path from 'path';
import { addServerLog } from '@/lib/serverLog';

export async function POST(request: NextRequest) {
  try {
    const { filePath, newName } = await request.json();
    
    if (!filePath || !newName) {
      return NextResponse.json({ 
        success: false, 
        error: 'File path and new name are required' 
      }, { status: 400 });
    }

    // Проверяем, что новый файл не содержит недопустимых символов
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(newName)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid characters in filename' 
      }, { status: 400 });
    }

    // Проверяем, что новый файл имеет расширение
    const hasExtension = path.extname(newName);
    if (!hasExtension) {
      return NextResponse.json({ 
        success: false, 
        error: 'Filename must have an extension' 
      }, { status: 400 });
    }

    // Строим полный путь к файлу
    const fullPath = path.join(process.cwd(), 'public', filePath);
    const dir = path.dirname(fullPath);
    const newFullPath = path.join(dir, newName);

    // Проверяем, что исходный файл существует
    try {
      await access(fullPath);
    } catch {
      return NextResponse.json({ 
        success: false, 
        error: 'File not found' 
      }, { status: 404 });
    }

    // Проверяем, что файл с новым именем не существует
    try {
      await access(newFullPath);
      return NextResponse.json({ 
        success: false, 
        error: 'File with this name already exists' 
      }, { status: 409 });
    } catch {
      // Файл не существует, можно переименовывать
    }

    // Переименовываем файл
    await rename(fullPath, newFullPath);

    // Обновляем путь в базе данных (если нужно)
    const newFilePath = path.relative(path.join(process.cwd(), 'public'), newFullPath).replace(/\\/g, '/');

    addServerLog('info', 'admin-files', 'File renamed successfully', { 
      oldPath: filePath,
      newPath: newFilePath,
      newName
    });

    return NextResponse.json({
      success: true,
      data: {
        oldPath: filePath,
        newPath: newFilePath,
        newName
      },
      message: 'File renamed successfully'
    });

  } catch (error) {
    console.error('File rename error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    addServerLog('error', 'admin-files', 'Error renaming file', { error: errorMessage });
    
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
