import { NextRequest, NextResponse } from 'next/server';
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
  location: 'public' | 'external';
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

export async function GET(request: NextRequest) {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    const projectRoot = process.cwd();
    const externalArchiveDirs = [
      path.join(projectRoot, 'backups'),
      path.join(projectRoot, 'archives')
    ];

    const { searchParams } = new URL(request.url);
    const filterCategory = searchParams.get('category');
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    const page = pageParam ? Math.max(parseInt(pageParam, 10) || 1, 1) : 1;
    const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10) || 24, 1), 200) : 24;
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
    const scanDirectory = async (dirPath: string, category: string, location: 'public' | 'external'): Promise<FileInfo[]> => {
      const files: FileInfo[] = [];
      
      try {
        const items = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const item of items) {
          const fullPath = path.join(dirPath, item.name);
          
          if (item.isDirectory()) {
            // Рекурсивно сканируем поддиректории
            const subFiles = await scanDirectory(fullPath, category, location);
            files.push(...subFiles);
          } else if (item.isFile()) {
            try {
              const stats = await fs.stat(fullPath);
              const relativePath = location === 'public'
                ? path.relative(publicDir, fullPath)
                : path.relative(projectRoot, fullPath);
              const url = location === 'public' ? `/${relativePath.replace(/\\/g, '/')}` : '';
              
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
                url,
                location
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
      { path: 'images/characters', category: 'characters', location: 'public' as const },
      { path: 'images/weapons', category: 'weapons', location: 'public' as const },
      { path: 'images/artifacts', category: 'artifacts', location: 'public' as const },
      { path: 'images/news', category: 'news', location: 'public' as const },
      { path: 'images/logos', category: 'logos', location: 'public' as const },
      { path: 'images/avatars', category: 'avatars', location: 'public' as const },
      { path: 'backups', category: 'archives', location: 'public' as const },
      { path: 'archives', category: 'archives', location: 'public' as const }
    ];

    for (const dir of directories) {
      const fullDirPath = path.join(publicDir, dir.path);
      try {
        const files = await scanDirectory(fullDirPath, dir.category, dir.location);
        filesByCategory[dir.category as keyof FilesByCategory].push(...files);
      } catch {
        console.warn(`Directory ${dir.path} not found or not accessible`);
      }
    }

    // Сканируем внешние архивы за пределами public
    for (const extDir of externalArchiveDirs) {
      try {
        const files = await scanDirectory(extDir, 'archives', 'external');
        filesByCategory.archives.push(...files);
      } catch {
        // ignore missing external archives dirs
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

    addServerLog('info', 'admin-files', 'Files list retrieved successfully', { totalFiles, totalImages, totalArchives });

    // Если указан фильтр категории - возвращаем постранично только её
    if (filterCategory && (filesByCategory as any)[filterCategory]) {
      const allItems: FileInfo[] = (filesByCategory as any)[filterCategory] as FileInfo[];
      const start = (page - 1) * limit;
      const paged = allItems.slice(start, start + limit);
      const pages = Math.max(Math.ceil(allItems.length / limit), 1);

      return NextResponse.json({
        success: true,
        data: paged,
        pagination: {
          page,
          limit,
          total: allItems.length,
          pages,
          hasNext: page < pages
        }
      });
    }

    // Иначе возвращаем сгруппированные данные как раньше
    return NextResponse.json({ success: true, data: { files: filesByCategory, stats } });

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
