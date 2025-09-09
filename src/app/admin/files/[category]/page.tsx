'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Copy, Trash2, Eye, ChevronLeft, ChevronRight, X } from 'lucide-react';

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

export default function FilesCategoryPage() {
  const params = useParams<{ category: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const category = params.category;

  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<number>(parseInt(searchParams.get('page') || '1', 10));
  const [limit] = useState<number>(24);
  const [total, setTotal] = useState<number>(0);
  const [pages, setPages] = useState<number>(1);

  const [showImageModal, setShowImageModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageDims, setImageDims] = useState<{ width: number; height: number } | null>(null);

  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [renamingFile, setRenamingFile] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState('');

  useEffect(() => {
    const p = parseInt(searchParams.get('page') || '1', 10);
    setPage(p);
  }, [searchParams]);

  useEffect(() => {
    fetchFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, page]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/files?category=${category}&page=${page}&limit=${limit}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setFiles(result.data);
          setTotal(result.pagination.total);
          setPages(result.pagination.pages);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('URL скопирован!');
    } catch {}
  };

  const handleDelete = async (file: FileInfo) => {
    if (!confirm(`Удалить файл "${file.name}"?`)) return;

    const body: { filePath: string; allowExternal: boolean } = { 
      filePath: file.location === 'public' ? file.path : file.fullPath, 
      allowExternal: file.location === 'external' 
    };

    const response = await fetch('/api/admin/files/delete', {
      method: 'POST', // Используем POST вместо DELETE
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (response.ok) fetchFiles();
  };

  const toggleFileSelection = (filePath: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(filePath)) {
        newSet.delete(filePath);
      } else {
        newSet.add(filePath);
      }
      return newSet;
    });
  };

  const unselectAllFiles = () => {
    setSelectedFiles(new Set());
  };

  const deleteSelectedFiles = async () => {
    if (selectedFiles.size === 0) return;
    if (!confirm(`Вы уверены, что хотите удалить ${selectedFiles.size} файл(а)?`)) return;

    try {
      const deletePromises = Array.from(selectedFiles).map(async (filePath) => {
        const file = files.find(f => f.path === filePath);
        if (!file) return false;
        
        const body: { filePath: string; allowExternal: boolean } = { 
          filePath: file.location === 'public' ? file.path : file.fullPath, 
          allowExternal: file.location === 'external' 
        };

        const response = await fetch('/api/admin/files/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        return response.ok;
      });

      const results = await Promise.all(deletePromises);
      const successCount = results.filter(Boolean).length;
      
      if (successCount > 0) {
        alert(`Успешно удалено ${successCount} из ${selectedFiles.size} файлов`);
        setSelectedFiles(new Set());
        await fetchFiles();
      }
    } catch (error) {
      console.error('Bulk delete failed:', error);
      alert('Ошибка при массовом удалении файлов');
    }
  };

  const startRename = (filePath: string, currentName: string) => {
    setRenamingFile(filePath);
    setNewFileName(currentName);
  };

  const cancelRename = () => {
    setRenamingFile(null);
    setNewFileName('');
  };

  const confirmRename = async () => {
    if (!renamingFile || !newFileName.trim()) return;

    try {
      const response = await fetch('/api/admin/files/rename', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filePath: renamingFile,
          newName: newFileName.trim()
        })
      });

      if (response.ok) {
        alert('Файл успешно переименован!');
        setRenamingFile(null);
        setNewFileName('');
        await fetchFiles();
      } else {
        const errorData = await response.json();
        alert(`Ошибка переименования: ${errorData.error || 'Неизвестная ошибка'}`);
      }
    } catch (error) {
      console.error('Rename failed:', error);
      alert('Ошибка при переименовании файла');
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-400">Загрузка...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Файлы категории: {category}</h1>
        <div className="text-gray-400">Всего: {total}</div>
      </div>

      {/* Массовое выделение */}
      {selectedFiles.size > 0 && (
        <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-yellow-200 font-medium">
                Выбрано {selectedFiles.size} файлов
              </span>
              <button
                onClick={unselectAllFiles}
                className="text-yellow-300 hover:text-yellow-200 text-sm underline"
              >
                Снять выделение
              </button>
            </div>
            <button
              onClick={deleteSelectedFiles}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Удалить {selectedFiles.size}
            </button>
          </div>
        </div>
      )}

      {/* Кнопка "Выбрать все" */}
      {files.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={() => {
              const allFiles = files.map(f => f.path);
              setSelectedFiles(new Set(allFiles));
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            Выбрать все файлы
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((file, index) => (
          <div key={file.fullPath} className="bg-neutral-800 border border-neutral-700 rounded-lg p-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedFiles.has(file.path)}
                onChange={() => toggleFileSelection(file.path)}
                className="w-4 h-4 text-purple-600 bg-neutral-800 border-purple-600 rounded focus:ring-purple-500 focus:ring-2"
              />
              {file.type === 'image' ? (
                <div className="w-16 h-16 rounded overflow-hidden bg-neutral-700 flex-shrink-0">
                  <Image src={file.url || '/images/logos/logo.png'} alt={file.name} width={64} height={64} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded bg-neutral-700 flex items-center justify-center text-gray-400">{file.type}</div>
              )}
              <div className="min-w-0 flex-1">
                {renamingFile === file.path ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newFileName}
                      onChange={(e) => setNewFileName(e.target.value)}
                      className="bg-neutral-600 border border-neutral-500 text-white text-sm px-2 py-1 rounded flex-1"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') confirmRename();
                        if (e.key === 'Escape') cancelRename();
                      }}
                    />
                    <button
                      onClick={confirmRename}
                      className="text-green-400 hover:text-green-300 px-1"
                      title="Подтвердить"
                    >
                      ✓
                    </button>
                    <button
                      onClick={cancelRename}
                      className="text-red-400 hover:text-red-300 px-1"
                      title="Отмена"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm truncate" title={file.name}>{file.name}</div>
                      <div className="text-gray-400 text-xs truncate" title={file.path}>{file.path}</div>
                    </div>
                    <button
                      onClick={() => startRename(file.path, file.name)}
                      className="text-blue-400 hover:text-blue-300 px-1"
                      title="Переименовать"
                    >
                      ✏️
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-3 flex gap-2 justify-end">
              {file.url && (
                <button onClick={() => copyToClipboard(file.url)} className="border border-neutral-600 hover:bg-neutral-700 text-white px-2 py-1 rounded text-sm">
                  <Copy className="w-3 h-3 inline mr-1" /> URL
                </button>
              )}
              <button onClick={() => handleDelete(file)} className="border border-red-600 hover:bg-red-900/20 text-red-400 hover:text-red-300 px-2 py-1 rounded text-sm">
                <Trash2 className="w-3 h-3 inline mr-1" /> Удалить
              </button>
              {file.type === 'image' && file.url && (
                <button onClick={() => { setCurrentIndex(index); setShowImageModal(true); }} className="border border-neutral-600 hover:bg-neutral-700 text-white px-2 py-1 rounded text-sm">
                  <Eye className="w-3 h-3 inline mr-1" /> Открыть
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <button
          disabled={page <= 1}
          onClick={() => router.push(`/admin/files/${category}?page=${Math.max(page - 1, 1)}`)}
          className="border border-neutral-600 hover:bg-neutral-700 disabled:opacity-50 text-white px-3 py-1 rounded"
        >
          Назад
        </button>
        <div className="text-gray-400">Страница {page} из {pages}</div>
        <button
          disabled={page >= pages}
          onClick={() => router.push(`/admin/files/${category}?page=${Math.min(page + 1, pages)}`)}
          className="border border-neutral-600 hover:bg-neutral-700 disabled:opacity-50 text-white px-3 py-1 rounded"
        >
          Вперед
        </button>
      </div>

      {showImageModal && files[currentIndex] && (
        <div className="fixed inset-0 bg-black/70 z-50 p-4 flex items-center justify-center" onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') setCurrentIndex((i) => (i - 1 + files.length) % files.length);
          if (e.key === 'ArrowRight') setCurrentIndex((i) => (i + 1) % files.length);
          if (e.key === 'Escape') setShowImageModal(false);
        }} tabIndex={0}>
          <div className="relative bg-neutral-900 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-700 bg-neutral-800">
              <div className="text-sm text-gray-300 truncate pr-4">{files[currentIndex].name}</div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 mr-2">{currentIndex + 1} / {files.length}</span>
                {files[currentIndex].url && (
                  <button onClick={() => copyToClipboard(files[currentIndex].url)} className="border border-neutral-600 hover:bg-neutral-700 text-white px-3 py-1 rounded text-sm">
                    <Copy className="w-3 h-3 inline mr-1" /> URL
                  </button>
                )}
                <button onClick={() => handleDelete(files[currentIndex])} className="border border-red-600 hover:bg-red-900/20 text-red-400 hover:text-red-300 px-3 py-1 rounded text-sm">
                  <Trash2 className="w-3 h-3 inline mr-1" /> Удалить
                </button>
                <button onClick={() => setShowImageModal(false)} className="border border-neutral-600 hover:bg-neutral-700 text-white px-3 py-1 rounded text-sm">
                  <X className="w-3 h-3 inline mr-1" /> Закрыть
                </button>
              </div>
            </div>
            <div className="relative bg-neutral-900" style={{ height: '70vh' }}>
              <button onClick={() => setCurrentIndex((i) => (i - 1 + files.length) % files.length)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-neutral-800/70 hover:bg-neutral-700/80 border border-neutral-700 rounded-full p-2 text-white z-10"><ChevronLeft className="w-6 h-6" /></button>
              <button onClick={() => setCurrentIndex((i) => (i + 1) % files.length)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-neutral-800/70 hover:bg-neutral-700/80 border border-neutral-700 rounded-full p-2 text-white z-10"><ChevronRight className="w-6 h-6" /></button>
              <div className="absolute inset-0">
                <div className="relative w-full h-full">
                  <Image src={files[currentIndex].url} alt={files[currentIndex].name} fill sizes="100vw" style={{ objectFit: 'contain' }} onLoad={e => {
                    const el = e.currentTarget as HTMLImageElement;
                    setImageDims({ width: el.naturalWidth, height: el.naturalHeight });
                  }} />
                </div>
              </div>
            </div>
            <div className="px-4 py-3 border-t border-neutral-700 bg-neutral-800 text-sm text-gray-300 grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <div><span className="text-gray-400">Путь:</span> {files[currentIndex].path}</div>
                <div><span className="text-gray-400">Категория:</span> {category}</div>
              </div>
              <div>
                <div><span className="text-gray-400">Размер:</span> {Math.round(files[currentIndex].size / 1024)} KB{imageDims ? ` • ${imageDims.width}×${imageDims.height}px` : ''}</div>
                <div><span className="text-gray-400">Изменен:</span> {new Date(files[currentIndex].modified).toLocaleString('ru-RU')}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
