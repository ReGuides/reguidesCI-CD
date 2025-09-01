'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Copy, Trash2, Eye } from 'lucide-react';

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
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (response.ok) fetchFiles();
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((file, index) => (
          <div key={file.fullPath} className="bg-neutral-800 border border-neutral-700 rounded-lg p-3">
            <div className="flex items-center gap-3">
              {file.type === 'image' ? (
                <div className="w-16 h-16 rounded overflow-hidden bg-neutral-700 flex-shrink-0">
                  <Image src={file.url || '/images/logos/logo.png'} alt={file.name} width={64} height={64} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded bg-neutral-700 flex items-center justify-center text-gray-400">{file.type}</div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-white text-sm truncate" title={file.name}>{file.name}</div>
                <div className="text-gray-400 text-xs truncate" title={file.path}>{file.path}</div>
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-800 rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-white text-sm truncate pr-4">{files[currentIndex].name}</div>
              <button onClick={() => setShowImageModal(false)} className="border border-neutral-600 hover:bg-neutral-700 text-white px-3 py-1 rounded">Закрыть</button>
            </div>
            <div className="flex items-center justify-between mb-2">
              <button onClick={() => setCurrentIndex((i) => (i - 1 + files.length) % files.length)} className="border border-neutral-600 hover:bg-neutral-700 text-white px-3 py-1 rounded">Предыдущая</button>
              <span className="text-gray-400 text-sm">{currentIndex + 1} / {files.length}</span>
              <button onClick={() => setCurrentIndex((i) => (i + 1) % files.length)} className="border border-neutral-600 hover:bg-neutral-700 text-white px-3 py-1 rounded">Следующая</button>
            </div>
            <div className="text-center">
              <Image src={files[currentIndex].url} alt={files[currentIndex].name} width={1200} height={800} className="inline-block max-w-full h-auto rounded" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
