'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { News } from '@/types';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/loading-spinner';
import ArticleEditor from '@/components/ui/article-editor';
import Image from 'next/image';
import { useAdminAuth } from '@/app/admin/AdminAuthContext';

type NewsType = 'manual' | 'birthday' | 'update' | 'event' | 'article';
type NewsCategory = 'news' | 'guide' | 'review' | 'tutorial' | 'event';

export default function EditNewsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAdminAuth();
  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    content: '',
    type: 'manual' as NewsType,
    category: 'news' as NewsCategory,
    excerpt: '',
    image: '',
    isPublished: false,
    tags: [] as string[],
    author: ''
  });

  useEffect(() => {
    if (params.id) {
      fetchNews();
    }
  }, [params.id]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/news/${params.id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        const newsData = data.data;
        setNews(newsData);
        setForm({
          title: newsData.title || '',
          content: newsData.content || '',
          type: newsData.type || 'manual',
          category: newsData.category || 'news',
          excerpt: newsData.excerpt || '',
          image: newsData.image || '',
          isPublished: newsData.isPublished || false,
          tags: newsData.tags || [],
          author: newsData.author || (user ? (user.name || user.username || user.login || 'Администратор') : 'Администратор')
        });
      } else {
        throw new Error('Новость не найдена');
      }
    } catch (err) {
      console.error('Error fetching news:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title.trim() || !form.content.trim()) {
      alert('Заполните обязательные поля');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const response = await fetch(`/api/news/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: form.title,
          content: form.content,
          type: form.type,
          category: form.category,
          excerpt: form.excerpt,
          image: form.image,
          isPublished: form.isPublished,
          tags: form.tags,
          author: form.author
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        alert('Новость успешно обновлена!');
        router.push('/admin/news');
      } else {
        throw new Error(data.message || 'Ошибка при обновлении');
      }
    } catch (err) {
      console.error('Error updating news:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('image', file); // Используем 'image' вместо 'file'
      formData.append('type', 'news');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setForm(prev => ({ ...prev, image: data.url }));
      } else {
        const errorData = await response.json();
        console.error('Upload error:', errorData);
        throw new Error(`Ошибка загрузки изображения: ${errorData.error || 'Неизвестная ошибка'}`);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Ошибка загрузки изображения');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" className="text-accent" />
          <span className="ml-3 text-neutral-400">Загрузка новости...</span>
        </div>
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center text-red-400">
          <h2 className="text-2xl font-bold mb-4">Ошибка загрузки</h2>
          <p>{error || 'Новость не найдена'}</p>
          <Button 
            onClick={() => router.push('/admin/news')}
            className="mt-4"
          >
            Вернуться к списку
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Навигация */}
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => router.push('/admin/news')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад к списку
        </Button>
      </div>

      {/* Заголовок */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Редактировать новость</h1>
        <p className="text-gray-400">Измените содержимое новости или статьи</p>
      </div>

      {/* Форма */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Основные поля */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Заголовок *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-accent"
              placeholder="Введите заголовок новости"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Тип
            </label>
            <select
              value={form.type}
              onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value as NewsType }))}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-accent"
            >
              <option value="manual">Новость</option>
              <option value="birthday">День рождения</option>
              <option value="update">Обновление</option>
              <option value="event">Событие</option>
              <option value="article">Статья</option>
            </select>
          </div>
        </div>

        {/* Поля для статей */}
        {form.type === 'article' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Категория
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value as NewsCategory }))}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-accent"
              >
                <option value="news">Новости</option>
                <option value="guide">Гайд</option>
                <option value="review">Обзор</option>
                <option value="tutorial">Туториал</option>
                <option value="event">Событие</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Краткое описание
              </label>
              <input
                type="text"
                value={form.excerpt}
                onChange={(e) => setForm(prev => ({ ...prev, excerpt: e.target.value }))}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-accent"
                placeholder="Краткое описание статьи"
                maxLength={200}
              />
            </div>
          </div>
        )}

        {/* Автор и статус */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Автор
            </label>
            <input
              type="text"
              value={form.author}
              onChange={(e) => setForm(prev => ({ ...prev, author: e.target.value }))}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-accent"
              placeholder="Имя автора"
            />
            <p className="text-xs text-gray-500 mt-1">Автоматически заполняется именем текущего пользователя</p>
          </div>

          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => setForm(prev => ({ ...prev, isPublished: e.target.checked }))}
                className="mr-2 w-4 h-4 text-accent bg-neutral-800 border-neutral-600 rounded focus:ring-accent focus:ring-2"
              />
              <span className="text-sm text-gray-300">Опубликовать</span>
            </label>
          </div>
        </div>

        {/* Изображение */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Изображение
          </label>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-accent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-white hover:file:bg-accent/80"
            />
            {form.image && (
              <div className="relative w-20 h-20">
                <Image
                  src={form.image}
                  alt="Preview"
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            )}
          </div>
        </div>

        {/* Теги */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Теги (через запятую)
          </label>
          <input
            type="text"
            value={form.tags.join(', ')}
            onChange={(e) => setForm(prev => ({ 
              ...prev, 
              tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
            }))}
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-accent"
            placeholder="тег1, тег2, тег3"
          />
        </div>

        {/* Редактор контента */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Содержание *
          </label>
          <ArticleEditor
            value={form.content}
            onChange={(value) => setForm(prev => ({ ...prev, content: value }))}
            placeholder="Введите содержание новости..."
            className="min-h-[400px]"
            showGameToolbar={form.type === 'article'}
          />
        </div>

        {/* Кнопки */}
        <div className="flex gap-4 pt-6 border-t border-neutral-700">
          <Button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2"
          >
            {saving ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Сохранение...' : 'Сохранить изменения'}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/news')}
          >
            Отмена
          </Button>

          {news && (
            <Button
              type="button"
              variant="outline"
              onClick={() => window.open(`/articles/${news._id}`, '_blank')}
              className="flex items-center gap-2"
            >
              Предварительный просмотр
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
