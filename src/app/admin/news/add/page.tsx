'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Save, ArrowLeft, Upload } from 'lucide-react';
import Link from 'next/link';
import { Character } from '@/types';
import Image from 'next/image';
import ArticleEditor from '@/components/ui/article-editor';
import { useAdminAuth } from '@/app/admin/AdminAuthContext';

export default function AddNewsPage() {
  const router = useRouter();
  const { user } = useAdminAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [form, setForm] = useState({
    title: '',
    content: '',
    type: 'manual' as 'manual' | 'birthday' | 'update' | 'event' | 'article',
    category: 'news' as 'news' | 'guide' | 'review' | 'tutorial' | 'event',
    image: '',
    excerpt: '',
    isPublished: false,
    characterId: '',
    tags: [] as string[],
    newTag: '',
    author: ''
  });

  useEffect(() => {
    fetchCharacters();
    // Автоматически заполняем поле author именем текущего пользователя
    if (user) {
      const authorName = user.name || user.username || user.login || 'Администратор';
      setForm(prev => ({ ...prev, author: authorName }));
    }
  }, [user]);

  const fetchCharacters = async () => {
    try {
      const response = await fetch('/api/characters');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCharacters(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching characters:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title || !form.content || !form.type) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    try {
      setLoading(true);
      
      const requestData = {
        title: form.title,
        content: form.content,
        type: form.type,
        category: form.type === 'article' ? (form.category || 'news') : 'news',
        excerpt: form.type === 'article' ? (form.excerpt || '') : '',
        image: form.image || undefined,
        isPublished: form.isPublished,
        characterId: form.characterId || undefined,
        tags: form.tags,
        author: form.author
      };
      
      console.log('🚀 POST /api/news - Request data:', requestData);
      console.log('🚀 Form state:', form);
      
      const response = await fetch('/api/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      console.log('🚀 Response status:', response.status);
      console.log('🚀 Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('🚀 Success response data:', data);
        if (data.success) {
          alert('Новость успешно создана!');
          router.push('/admin/news');
        }
      } else {
        const error = await response.json();
        console.error('🚀 Error response:', error);
        console.error('🚀 Error details:', error.details);
        alert(`Ошибка: ${error.error}`);
      }
    } catch (error) {
      console.error('🚀 Catch error:', error);
      console.error('🚀 Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('🚀 Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      alert('Ошибка при создании новости');
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (form.newTag.trim() && !form.tags.includes(form.newTag.trim())) {
      setForm(prev => ({
        ...prev,
        tags: [...prev.tags, prev.newTag.trim()],
        newTag: ''
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('image', file); // Используем 'image' вместо 'file'
      formData.append('type', 'news'); // Используем тип news для новостей

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setForm(prev => ({ ...prev, image: result.url }));
        } else {
          alert('Ошибка при загрузке изображения');
        }
      } else {
        const errorData = await response.json();
        console.error('Upload error:', errorData);
        alert(`Ошибка при загрузке изображения: ${errorData.error || 'Неизвестная ошибка'}`);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Ошибка при загрузке изображения');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const removeImage = () => {
    setForm(prev => ({ ...prev, image: '' }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Заголовок */}
      <div className="flex items-center space-x-4">
        <Link href="/admin/news">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">Добавить новость</h1>
          <p className="text-gray-400">Создание новой новости для сайта</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" onKeyDown={(e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
          e.preventDefault();
        }
      }}>
        {/* Основная информация */}
        <Card className="bg-neutral-800 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-white">Основная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
                         <div>
               <label htmlFor="title" className="block text-sm font-medium text-white mb-2">
                 Заголовок *
               </label>
               <Input
                 id="title"
                 value={form.title}
                 onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                 placeholder="Введите заголовок новости"
                 className="bg-neutral-700 border-neutral-600 text-white"
                 required
               />
             </div>

             <div>
               <label htmlFor="author" className="block text-sm font-medium text-white mb-2">
                 Автор
               </label>
               <Input
                 id="author"
                 value={form.author}
                 onChange={(e) => setForm(prev => ({ ...prev, author: e.target.value }))}
                 placeholder="Автор новости"
                 className="bg-neutral-700 border-neutral-600 text-white"
               />
               <p className="text-xs text-gray-500 mt-1">Автоматически заполняется именем текущего пользователя</p>
             </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-white mb-2">
                Содержание *
              </label>
              <div onSubmit={(e) => e.preventDefault()}>
                <ArticleEditor
                  value={form.content}
                  onChange={(value) => setForm(prev => ({ ...prev, content: value }))}
                  placeholder="Введите содержание новости..."
                  className="min-h-[400px]"
                  showGameToolbar={form.type === 'article'}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-white mb-2">
                  Тип новости *
                </label>
                <select
                  id="type"
                  value={form.type}
                  onChange={(e) => {
                    const newType = e.target.value as 'manual' | 'birthday' | 'update' | 'event' | 'article';
                    setForm(prev => ({ 
                      ...prev, 
                      type: newType,
                      // Сбрасываем category для не-статей
                      category: newType === 'article' ? prev.category : 'news'
                    }));
                  }}
                  className="w-full h-10 rounded-md border border-neutral-600 bg-neutral-700 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="manual">Новость</option>
                  <option value="article">Статья</option>
                  <option value="birthday">День рождения</option>
                  <option value="update">Обновление</option>
                  <option value="event">Событие</option>
                </select>
              </div>

              {/* Категория (только для статей) */}
              {form.type === 'article' && (
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-white mb-2">
                    Категория статьи *
                  </label>
                  <select
                    id="category"
                    value={form.category}
                                         onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value as 'news' | 'guide' | 'review' | 'tutorial' | 'event' }))}
                    className="w-full h-10 rounded-md border border-neutral-600 bg-neutral-700 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="guide">Гайд</option>
                    <option value="review">Обзор</option>
                    <option value="tutorial">Туториал</option>
                    <option value="news">Новость</option>
                    <option value="event">Событие</option>
                  </select>
                </div>
              )}

              <div>
                <label htmlFor="characterId" className="block text-sm font-medium text-white mb-2">
                  Персонаж (опционально)
                </label>
                <select
                  id="characterId"
                  value={form.characterId}
                  onChange={(e) => setForm(prev => ({ ...prev, characterId: e.target.value }))}
                  className="w-full h-10 rounded-md border border-neutral-600 bg-neutral-700 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Без персонажа</option>
                  {characters.map((character) => (
                    <option key={character._id} value={character._id}>
                      {character.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Краткое описание (только для статей) */}
            {form.type === 'article' && (
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Краткое описание
                </label>
                <textarea
                  value={form.excerpt}
                  onChange={(e) => setForm(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Краткое описание статьи для предварительного просмотра..."
                  className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>
            )}

            {/* Изображение */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Изображение новости
              </label>
              <div className="flex items-center gap-4">
                {form.image && (
                  <div className="relative">
                    <Image
                      src={form.image}
                      alt="Предварительный просмотр"
                      width={80}
                      height={80}
                      className="rounded-lg object-cover bg-neutral-700"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.opacity = '0.2';
                      }}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-red-600 hover:bg-red-700 border-red-600"
                      onClick={removeImage}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    value={form.image}
                    onChange={(e) => setForm(prev => ({ ...prev, image: e.target.value }))}
                    className="bg-neutral-700 border-neutral-600 text-white mb-2"
                    placeholder="URL изображения или загрузите файл"
                  />
                  <div className="flex gap-2">
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploadingImage}
                      onClick={() => document.getElementById('image-upload')?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadingImage ? 'Загрузка...' : 'Загрузить'}
                    </Button>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Поддерживаемые форматы: JPEG, PNG, WebP. Можно загрузить файл или указать URL</p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublished"
                checked={form.isPublished}
                onChange={(e) => setForm(prev => ({ ...prev, isPublished: e.target.checked }))}
                className="rounded border-neutral-600 bg-neutral-700"
              />
              <label htmlFor="isPublished" className="text-white">
                Опубликовать сразу
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Теги */}
        <Card className="bg-neutral-800 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-white">Теги</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                value={form.newTag}
                onChange={(e) => setForm(prev => ({ ...prev, newTag: e.target.value }))}
                onKeyPress={handleKeyPress}
                placeholder="Введите тег"
                className="bg-neutral-700 border-neutral-600 text-white flex-1"
              />
              <Button 
                type="button"
                onClick={addTag}
                variant="outline"
                className="border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="bg-purple-600">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Кнопки действий */}
        <div className="flex justify-end space-x-4">
          <Link href="/admin/news">
            <Button variant="outline" type="button">
              Отмена
            </Button>
          </Link>
          <Button 
            type="submit" 
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {loading ? 'Создаем...' : 'Создать новость'}
          </Button>
        </div>
      </form>
    </div>
  );
}
