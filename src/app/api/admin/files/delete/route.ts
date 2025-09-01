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
      const baseName = path.basename(externalPath);
      const isDeployBackup = baseName.startsWith('.next.backup.') || baseName === 'build.tar.gz';
      if (
        externalPath.startsWith(backupsDir) ||
        externalPath.startsWith(archivesDir) ||
        (isDeployBackup && path.dirname(externalPath) === projectRoot)
      ) {
        fullPath = externalPath;
      }
    }
    
    const isInPublic = fullPath.startsWith(publicDir);
    const isInBackups = fullPath.startsWith(path.join(projectRoot, 'backups'));
    const isInArchives = fullPath.startsWith(path.join(projectRoot, 'archives'));
    const baseName = path.basename(fullPath);
    const isDeployBackup = path.dirname(fullPath) === projectRoot && (baseName.startsWith('.next.backup.') || baseName === 'build.tar.gz');
    if (!isInPublic && !isInBackups && !isInArchives && !isDeployBackup) {
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

    // Удаляем файл или директорию рекурсивно
    try {
      const stat = await fs.stat(fullPath);
      if (stat.isDirectory()) {
        // Рекурсивно удаляем директорию (Node 16+)
        await fs.rm(fullPath, { recursive: true, force: true });
      } else {
        await fs.unlink(fullPath);
      }
    } catch {
      return NextResponse.json({ success: false, error: 'Failed to delete file or directory' }, { status: 500 });
    }

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
