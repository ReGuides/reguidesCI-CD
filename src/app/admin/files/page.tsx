'use client';

import { useState, useEffect } from 'react';
import { 
  Upload, 
  Trash2, 
  Copy, 
  Eye, 
  Download,
  FolderOpen,
  FileImage,
  Archive,
  FileText,
  Users,
  Target,
  Shield,
  User,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import Image from 'next/image';

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

interface Stats {
  totalFiles: number;
  totalSize: number;
  totalImages: number;
  totalArchives: number;
  categories: Array<{
    name: string;
    count: number;
    size: number;
  }>;
}

export default function FilesManagementPage() {
  const [files, setFiles] = useState<FilesByCategory>({
    characters: [],
    weapons: [],
    artifacts: [],
    news: [],
    logos: [],
    avatars: [],
    archives: [],
    other: []
  });
  const [stats, setStats] = useState<Stats>({
    totalFiles: 0,
    totalSize: 0,
    totalImages: 0,
    totalArchives: 0,
    categories: []
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('characters');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<FileInfo | null>(null);
  const [currentList, setCurrentList] = useState<FileInfo[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [imageDims, setImageDims] = useState<{ width: number; height: number } | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [renamingFile, setRenamingFile] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState('');

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/files');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setFiles(data.data.files);
          setStats(data.data.stats);
        }
      }
    } catch (error) {
      console.error('Failed to fetch files:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllImagesForCategory = async (category: string) => {
    try {
      const response = await fetch(`/api/admin/files?category=${category}&all=true`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          return data.data.filter((file: FileInfo) => file.type === 'image');
        }
      }
    } catch (error) {
      console.error('Failed to fetch all images for category:', error);
    }
    return [];
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedCategory) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('category', selectedCategory);

      const response = await fetch('/api/admin/files/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          await fetchFiles();
          setShowUploadModal(false);
          setSelectedFile(null);
          setSelectedCategory('characters');
        }
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (file: FileInfo) => {
    if (!confirm(`Вы уверены, что хотите удалить файл "${file.name}"?`)) return;

    try {
      const response = await fetch('/api/admin/files/delete', {
        method: 'POST', // Используем POST вместо DELETE
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          filePath: file.path,
          allowExternal: false // Пока что удаляем только публичные файлы
        })
      });

      if (response.ok) {
        await fetchFiles();
      } else {
        console.error('Delete failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('URL скопирован в буфер обмена!');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'characters': return <Users className="w-4 h-4" />;
      case 'weapons': return <Target className="w-4 h-4" />;
      case 'artifacts': return <Shield className="w-4 h-4" />;
      case 'news': return <FileText className="w-4 h-4" />;
      case 'logos': return <FileImage className="w-4 h-4" />;
      case 'avatars': return <User className="w-4 h-4" />;
      case 'archives': return <Archive className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // Функции для массового выделения
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
        // Находим файл для определения его типа
        const file = Object.values(files).flat().find(f => f.path === filePath);
        if (!file) return false;

        const response = await fetch('/api/admin/files/delete', {
          method: 'POST', // Используем POST вместо DELETE
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            filePath: file.path,
            allowExternal: false // Пока что удаляем только публичные файлы
          })
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

  const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      characters: 'Персонажи',
      weapons: 'Оружие',
      artifacts: 'Артефакты',
      news: 'Новости',
      logos: 'Логотипы',
      avatars: 'Аватары',
      archives: 'Архивы',
      other: 'Другие'
    };
    return labels[category] || category;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Заголовок */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Управление файлами</h1>
          <p className="text-gray-400">Просмотр, загрузка и удаление файлов сайта</p>
        </div>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Загрузить файл
        </button>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Всего файлов</p>
              <p className="text-2xl font-bold text-white">{stats.totalFiles}</p>
            </div>
            <FolderOpen className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Общий размер</p>
              <p className="text-2xl font-bold text-white">{formatFileSize(stats.totalSize)}</p>
            </div>
            <Download className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Изображения</p>
              <p className="text-2xl font-bold text-white">{stats.totalImages}</p>
            </div>
            <FileImage className="w-8 h-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Архивы</p>
              <p className="text-2xl font-bold text-white">{stats.totalArchives}</p>
            </div>
            <Archive className="w-8 h-8 text-orange-400" />
          </div>
        </div>
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
      {Object.values(files).some(category => category.length > 0) && (
        <div className="flex justify-end">
          <button
            onClick={() => {
              const allFiles = Object.values(files).flat().map(f => f.path);
              setSelectedFiles(new Set(allFiles));
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            Выбрать все файлы
          </button>
        </div>
      )}

      {/* Категории файлов */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(files).map(([category, categoryFiles]) => (
          <div key={category} className="bg-neutral-800 border border-neutral-700 rounded-lg">
            <div className="p-6 border-b border-neutral-700">
              <h3 className="text-white flex items-center gap-2">
                {getCategoryIcon(category)}
                {getCategoryLabel(category)}
                <span className="text-sm text-gray-400 ml-auto">
                  {categoryFiles.length} файлов
                </span>
              </h3>
            </div>
            <div className="p-6">
              {categoryFiles.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Нет файлов</p>
              ) : (
                <div className="space-y-3">
                  {categoryFiles.slice(0, 5).map((file: FileInfo) => (
                    <div key={file.path} className="group flex items-center justify-between p-3 bg-neutral-700/50 rounded-lg">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={selectedFiles.has(file.path)}
                          onChange={() => toggleFileSelection(file.path)}
                          className="w-4 h-4 text-purple-600 bg-neutral-800 border-purple-600 rounded focus:ring-purple-500 focus:ring-2"
                        />
                        {file.type === 'image' && (
                          <div className="w-10 h-10 rounded overflow-hidden bg-neutral-600 flex-shrink-0">
                            <Image
                              src={file.url}
                              alt={file.name}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          </div>
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
                              <p className="text-white text-sm font-medium truncate flex-1">{file.name}</p>
                              <button
                                onClick={() => startRename(file.path, file.name)}
                                className="border border-neutral-600 hover:bg-neutral-700 text-white px-2 py-1 rounded text-sm"
                                title="Переименовать"
                              >
                                ✏️
                              </button>
                            </div>
                          )}
                          <p className="text-gray-400 text-xs">
                            {formatFileSize(file.size)} • {formatDate(file.modified)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {file.type === 'image' && (
                          <button
                            onClick={async () => {
                              // загружаем все изображения категории для навигации
                              const allImages = await fetchAllImagesForCategory(category);
                              setCurrentList(allImages);
                              const idx = allImages.findIndex((f: FileInfo) => f.path === file.path);
                              setCurrentIndex(Math.max(idx, 0));
                              setSelectedImage(file);
                              setShowImageModal(true);
                            }}
                            className="border border-neutral-600 hover:bg-neutral-700 text-white px-2 py-1 rounded text-sm"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => copyToClipboard(file.url)}
                          className="border border-neutral-600 hover:bg-neutral-700 text-white px-2 py-1 rounded text-sm"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        
                        <button
                          onClick={() => handleDelete(file)}
                          className="border border-red-600 hover:bg-red-900/20 text-red-400 hover:text-red-300 px-2 py-1 rounded text-sm"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {categoryFiles.length > 5 && (
                <div className="mt-3 text-right">
                  <a href={`/admin/files/${category}`}
                     className="text-purple-400 hover:text-purple-300 underline">
                    Показать все ({categoryFiles.length})
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Модальное окно загрузки */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Загрузить файл</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Категория
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="characters">Персонажи</option>
                    <option value="weapons">Оружие</option>
                    <option value="artifacts">Артефакты</option>
                    <option value="news">Новости</option>
                    <option value="logos">Логотипы</option>
                    <option value="avatars">Аватары</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Файл
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                
                {selectedFile && (
                  <div className="text-sm text-gray-400">
                    <p>Имя: {selectedFile.name}</p>
                    <p>Размер: {formatFileSize(selectedFile.size)}</p>
                    <p>Тип: {selectedFile.type}</p>
                  </div>
                )}
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowUploadModal(false);
                      setSelectedFile(null);
                      setSelectedCategory('characters');
                    }}
                    className="flex-1 bg-neutral-700 hover:bg-neutral-600 text-white px-4 py-2 rounded-lg"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={!selectedFile || uploading}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Загрузка...
                      </>
                    ) : (
                      'Загрузить'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно просмотра изображения */}
      {showImageModal && selectedImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 p-4 flex items-center justify-center" onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') setCurrentIndex((i) => (i - 1 + currentList.length) % currentList.length);
          if (e.key === 'ArrowRight') setCurrentIndex((i) => (i + 1) % currentList.length);
          if (e.key === 'Escape') setShowImageModal(false);
        }} tabIndex={0}>
          <div className="relative bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden border border-neutral-700">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-700 bg-gradient-to-r from-neutral-800 to-neutral-700">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <div className="text-lg font-semibold text-white truncate pr-4">{selectedImage.name}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-neutral-600/50 px-3 py-1 rounded-full text-sm text-gray-300">
                  {currentIndex + 1} / {currentList.length}
                </div>
                {selectedImage.url && (
                  <button onClick={() => copyToClipboard(selectedImage.url)} className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 hover:border-blue-500/50 text-blue-300 hover:text-blue-200 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200">
                    <Copy className="w-4 h-4 inline mr-2" /> Копировать URL
                  </button>
                )}
                <button onClick={() => startRename(selectedImage.path, selectedImage.name)} className="bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 hover:border-amber-500/50 text-amber-300 hover:text-amber-200 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200">
                  ✏️ Переименовать
                </button>
                <button onClick={() => handleDelete(selectedImage)} className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 hover:border-red-500/50 text-red-300 hover:text-red-200 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200">
                  <Trash2 className="w-4 h-4 inline mr-2" /> Удалить
                </button>
                <button onClick={() => setShowImageModal(false)} className="bg-neutral-600/20 hover:bg-neutral-600/30 border border-neutral-500/30 hover:border-neutral-500/50 text-neutral-300 hover:text-neutral-200 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200">
                  <X className="w-4 h-4 inline mr-2" /> Закрыть
                </button>
              </div>
            </div>
            <div className="relative bg-gradient-to-br from-neutral-900 to-neutral-800" style={{ height: '70vh' }}>
              <button onClick={() => setCurrentIndex((i) => (i - 1 + currentList.length) % currentList.length)} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-white/20 hover:border-white/30 rounded-full p-3 text-white z-10 transition-all duration-200 hover:scale-110">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button onClick={() => setCurrentIndex((i) => (i + 1) % currentList.length)} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-white/20 hover:border-white/30 rounded-full p-3 text-white z-10 transition-all duration-200 hover:scale-110">
                <ChevronRight className="w-6 h-6" />
              </button>
              <div className="absolute inset-0">
                <div className="relative w-full h-full">
                  <Image src={selectedImage.url} alt={selectedImage.name} fill sizes="100vw" style={{ objectFit: 'contain' }} onLoad={e => {
                    const el = e.currentTarget as HTMLImageElement;
                    setImageDims({ width: el.naturalWidth, height: el.naturalHeight });
                  }} />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-neutral-700 bg-gradient-to-r from-neutral-800 to-neutral-700 text-sm text-gray-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-gray-400 font-medium">Путь:</span>
                    <span className="text-white font-mono text-xs bg-neutral-600/50 px-2 py-1 rounded">{selectedImage.path}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-gray-400 font-medium">Категория:</span>
                    <span className="text-white capitalize">{selectedImage.category}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="text-gray-400 font-medium">Размер:</span>
                    <span className="text-white">{Math.round(selectedImage.size / 1024)} KB</span>
                    {imageDims && <span className="text-gray-400">• {imageDims.width}×{imageDims.height}px</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                    <span className="text-gray-400 font-medium">Изменен:</span>
                    <span className="text-white">{new Date(selectedImage.modified).toLocaleString('ru-RU')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
