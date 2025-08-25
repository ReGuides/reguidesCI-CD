'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ArticleEditor from '@/components/ui/article-editor';
import Image from 'next/image';

export default function AddArticlePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    content: '',
    type: 'manual' as 'manual' | 'birthday' | 'update' | 'event' | 'article',
    category: 'news' as 'news' | 'guide' | 'review' | 'tutorial' | 'event',
    excerpt: '',
    image: '',
    isPublished: false,
    tags: [] as string[],
    author: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title.trim() || !form.content.trim()) {
      alert('Заполните обязательные поля');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const response = await fetch('/api/news', {
        method: 'POST',
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
        alert('Новость успешно создана!');
        router.push('/admin/news');
      } else {
        throw new Error(data.message || 'Ошибка при создании');
      }
    } catch (err) {
      console.error('Error creating news:', err);
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
      formData.append('file', file);
      formData.append('type', 'news');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setForm(prev => ({ ...prev, image: data.url }));
      } else {
        throw new Error('Ошибка загрузки изображения');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Ошибка загрузки изображения');
    }
  };

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
        <h1 className="text-3xl font-bold text-white mb-2">Создать новость</h1>
        <p className="text-gray-400">Добавьте новую новость или статью</p>
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
              onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value as any }))}
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
                onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value as any }))}
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
          </div>

          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => setForm(prev => ({ ...prev, isPublished: e.target.checked }))}
                className="mr-2 w-4 h-4 text-accent bg-neutral-800 border-neutral-600 rounded focus:ring-accent focus:ring-2"
              />
              <span className="text-sm text-gray-300">Опубликовать сразу</span>
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
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Создание...' : 'Создать новость'}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/news')}
          >
            Отмена
          </Button>
        </div>
      </form>

      {/* Error Display */}
      {error && (
        <div className="mt-6 p-4 bg-red-900/20 border border-red-700 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
