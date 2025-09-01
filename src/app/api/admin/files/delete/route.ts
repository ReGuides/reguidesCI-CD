import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { addServerLog } from '@/lib/serverLog';

export async function DELETE(request: NextRequest) {
  try {
    const { filePath, allowExternal } = await request.json();
    
    if (!filePath) {
      return NextResponse.json({ 
        success: false, 
        error: 'File path is required' 
      }, { status: 400 });
    }

    // Проверяем, что путь безопасный (не выходит за пределы public директории)
    const projectRoot = process.cwd();
    const publicDir = path.join(projectRoot, 'public');
    let fullPath = path.resolve(path.join(publicDir, filePath));
    
    // Разрешаем удалять внешние архивы при явном разрешении
    if (allowExternal) {
      const externalPath = path.resolve(path.join(projectRoot, filePath));
      const backupsDir = path.join(projectRoot, 'backups');
      const archivesDir = path.join(projectRoot, 'archives');
      if (externalPath.startsWith(backupsDir) || externalPath.startsWith(archivesDir)) {
        fullPath = externalPath;
      }
    }
    
    if (!fullPath.startsWith(publicDir) && !fullPath.startsWith(path.join(projectRoot, 'backups')) && !fullPath.startsWith(path.join(projectRoot, 'archives'))) {
      return NextResponse.json({ success: false, error: 'Invalid file path' }, { status: 400 });
    }

    // Проверяем, что файл существует
    try {
      await fs.access(fullPath);
    } catch {
      return NextResponse.json({ 
        success: false, 
        error: 'File not found' 
      }, { status: 404 });
    }

    // Удаляем файл
    await fs.unlink(fullPath);

    addServerLog('info', 'admin-files', 'File deleted successfully', { 
      filePath,
      fullPath 
    });

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('File delete error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    addServerLog('error', 'admin-files', 'Error deleting file', { error: errorMessage });
    
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
