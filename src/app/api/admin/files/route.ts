import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { addServerLog } from '@/lib/serverLog';

interface FileInfo {
  name: string;
  path: string;
  fullPath: string;
  size: number;
  modified: Date;
  type: 'image' | 'archive' | 'other';
  category: string;
  url: string;
}

interface FilesByCategory {
  characters: FileInfo[];
  weapons: FileInfo[];
  artifacts: FileInfo[];
  news: FileInfo[];
  logos: FileInfo[];
  avatars: FileInfo[];
  archives: FileInfo[];
  other: FileInfo[];
}

export async function GET() {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    const filesByCategory: FilesByCategory = {
      characters: [],
      weapons: [],
      artifacts: [],
      news: [],
      logos: [],
      avatars: [],
      archives: [],
      other: []
    };

    // Функция для сканирования директории
    const scanDirectory = async (dirPath: string, category: string): Promise<FileInfo[]> => {
      const files: FileInfo[] = [];
      
      try {
        const items = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const item of items) {
          const fullPath = path.join(dirPath, item.name);
          
          if (item.isDirectory()) {
            // Рекурсивно сканируем поддиректории
            const subFiles = await scanDirectory(fullPath, category);
            files.push(...subFiles);
          } else if (item.isFile()) {
            try {
              const stats = await fs.stat(fullPath);
              const relativePath = path.relative(publicDir, fullPath);
              const url = `/${relativePath.replace(/\\/g, '/')}`;
              
              // Определяем тип файла
              let fileType: 'image' | 'archive' | 'other' = 'other';
              const ext = path.extname(item.name).toLowerCase();
              
              if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext)) {
                fileType = 'image';
              } else if (['.zip', '.tar', '.gz', '.rar', '.7z'].includes(ext)) {
                fileType = 'archive';
              }
              
              files.push({
                name: item.name,
                path: relativePath,
                fullPath,
                size: stats.size,
                modified: stats.mtime,
                type: fileType,
                category,
                url
              });
            } catch (error) {
              console.warn(`Failed to get stats for ${fullPath}:`, error);
            }
          }
        }
      } catch (error) {
        console.warn(`Failed to read directory ${dirPath}:`, error);
      }
      
      return files;
    };

    // Сканируем основные директории
    const directories = [
      { path: 'images/characters', category: 'characters' },
      { path: 'images/weapons', category: 'weapons' },
      { path: 'images/artifacts', category: 'artifacts' },
      { path: 'images/news', category: 'news' },
      { path: 'images/logos', category: 'logos' },
      { path: 'images/avatars', category: 'avatars' },
      { path: 'backups', category: 'archives' },
      { path: 'archives', category: 'archives' }
    ];

    for (const dir of directories) {
      const fullDirPath = path.join(publicDir, dir.path);
      try {
        const files = await scanDirectory(fullDirPath, dir.category);
        filesByCategory[dir.category as keyof FilesByCategory].push(...files);
      } catch (error) {
        console.warn(`Directory ${dir.path} not found or not accessible`);
      }
    }

    // Сортируем файлы по дате изменения (новые сначала)
    Object.keys(filesByCategory).forEach(category => {
      filesByCategory[category as keyof FilesByCategory].sort((a, b) => 
        b.modified.getTime() - a.modified.getTime()
      );
    });

    // Подсчитываем общую статистику
    const totalFiles = Object.values(filesByCategory).flat().length;
    const totalSize = Object.values(filesByCategory).flat().reduce((sum, file) => sum + file.size, 0);
    const totalImages = Object.values(filesByCategory).flat().filter(f => f.type === 'image').length;
    const totalArchives = Object.values(filesByCategory).flat().filter(f => f.type === 'archive').length;

    const stats = {
      totalFiles,
      totalSize,
      totalImages,
      totalArchives,
      categories: Object.keys(filesByCategory).map(category => ({
        name: category,
        count: filesByCategory[category as keyof FilesByCategory].length,
        size: filesByCategory[category as keyof FilesByCategory].reduce((sum, file) => sum + file.size, 0)
      }))
    };

    addServerLog('info', 'admin-files', 'Files list retrieved successfully', { 
      totalFiles, 
      totalImages, 
      totalArchives 
    });

    return NextResponse.json({
      success: true,
      data: {
        files: filesByCategory,
        stats
      }
    });

  } catch (error) {
    console.error('Files API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    addServerLog('error', 'admin-files', 'Error retrieving files list', { error: errorMessage });
    
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
