'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MarkdownEditor from '@/components/ui/markdown-editor';
import { ArrowLeft, Save, Eye, Image, Grid3X3, Type, Clock, Search, Zap, RefreshCw } from 'lucide-react';

export default function CreateArticlePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'guides',
    status: 'draft',
    featuredImage: '',
    tags: '',
    seoTitle: '',
    seoDescription: '',
    difficulty: 'easy',
    estimatedTime: 0,
    prerequisites: [] as string[],
    relatedArticles: [] as string[]
  });
  const [loading, setLoading] = useState(false);
  const [showSeoSection, setShowSeoSection] = useState(false);

  const handleInputChange = (field: string, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    handleInputChange('title', title);
    if (!formData.slug) {
      handleInputChange('slug', generateSlug(title));
    }
  };

  // Функция для расчета времени чтения
  const calculateReadingTime = (content: string): number => {
    const wordsPerMinute = 200; // Средняя скорость чтения
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return Math.max(1, minutes); // Минимум 1 минута
  };

  // Автоматическое определение времени чтения при изменении контента
  useEffect(() => {
    if (formData.content) {
      const readingTime = calculateReadingTime(formData.content);
      handleInputChange('estimatedTime', readingTime);
    }
  }, [formData.content]);

  // Автоматическая генерация SEO заголовка
  const generateSeoTitle = () => {
    if (formData.title) {
      const seoTitle = `${formData.title} - ReGuides`;
      handleInputChange('seoTitle', seoTitle);
    }
  };

  // Автоматическая генерация SEO описания
  const generateSeoDescription = () => {
    if (formData.excerpt) {
      handleInputChange('seoDescription', formData.excerpt);
    } else if (formData.content) {
      // Извлекаем первые 160 символов из контента
      const plainText = formData.content
        .replace(/[#*`]/g, '') // Убираем markdown разметку
        .replace(/\n+/g, ' ') // Заменяем переносы на пробелы
        .trim();
      
      const description = plainText.length > 160 
        ? plainText.substring(0, 157) + '...'
        : plainText;
      
      handleInputChange('seoDescription', description);
    }
  };

  // Автоматическая генерация всех SEO полей
  const generateAllSeo = () => {
    generateSeoTitle();
    generateSeoDescription();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          author: 'admin', // Временно хардкодим автора
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push('/admin/articles');
      } else {
        throw new Error('Ошибка создания статьи');
      }
    } catch (error) {
      console.error('Error creating article:', error);
      alert('Ошибка создания статьи');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-900/20';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20';
      case 'hard': return 'text-red-400 bg-red-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="mb-4 px-4 py-2 bg-neutral-700 text-neutral-300 rounded-lg hover:bg-neutral-600 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад
        </button>
        <h1 className="text-3xl font-bold text-white">Создать новую статью</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Основная информация */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Заголовок *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Введите заголовок статьи"
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Slug (URL)
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => handleInputChange('slug', e.target.value)}
              placeholder="url-stati"
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Краткое описание
          </label>
          <textarea
            value={formData.excerpt}
            onChange={(e) => handleInputChange('excerpt', e.target.value)}
            placeholder="Краткое описание статьи..."
            className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent"
            rows={3}
          />
        </div>

        {/* Категория, статус и сложность */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Категория
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="guides">Гайд</option>
              <option value="characters">Персонажи</option>
              <option value="weapons">Оружие</option>
              <option value="artifacts">Артефакты</option>
              <option value="news">Новости</option>
              <option value="review">Обзор</option>
              <option value="analysis">Анализ</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Статус
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="draft">Черновик</option>
              <option value="published">Опубликовано</option>
              <option value="archived">Архив</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Сложность
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) => handleInputChange('difficulty', e.target.value)}
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="easy">Легкая</option>
              <option value="medium">Средняя</option>
              <option value="hard">Сложная</option>
            </select>
          </div>
        </div>

        {/* Время чтения */}
        <div className="flex items-center gap-4 p-4 bg-neutral-800 rounded-lg border border-neutral-700">
          <Clock className="w-5 h-5 text-accent" />
          <div className="flex-1">
            <label className="block text-sm font-medium text-white mb-1">
              Время чтения (минуты)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={formData.estimatedTime}
                onChange={(e) => handleInputChange('estimatedTime', parseInt(e.target.value) || 0)}
                min="1"
                max="120"
                className="w-20 px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <span className="text-sm text-neutral-400">
                (автоматически рассчитывается на основе контента)
              </span>
            </div>
          </div>
        </div>

        {/* Изображение и теги */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Изображение статьи
            </label>
            <input
              type="url"
              value={formData.featuredImage}
              onChange={(e) => handleInputChange('featuredImage', e.target.value)}
              placeholder="URL изображения"
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Теги (через запятую)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              placeholder="тег1, тег2, тег3"
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>

        {/* SEO секция */}
        <div className="border border-neutral-700 rounded-lg">
          <div
            className="w-full p-4 text-left flex items-center justify-between hover:bg-neutral-800 transition-colors cursor-pointer"
            onClick={() => setShowSeoSection(!showSeoSection)}
          >
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-accent" />
              <span className="font-medium text-white">SEO настройки</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  generateAllSeo();
                }}
                className="px-3 py-1 bg-accent text-white rounded text-sm hover:bg-accent/90 transition-colors flex items-center gap-1"
              >
                <Zap className="w-3 h-3" />
                Автогенерация
              </button>
              <span className="text-neutral-400">{showSeoSection ? '▼' : '▶'}</span>
            </div>
          </div>
          
          {showSeoSection && (
            <div className="p-4 border-t border-neutral-700 space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  SEO заголовок
                </label>
                <input
                  type="text"
                  value={formData.seoTitle}
                  onChange={(e) => handleInputChange('seoTitle', e.target.value)}
                  placeholder="SEO заголовок для поисковых систем"
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <p className="text-xs text-neutral-400 mt-1">
                  Рекомендуется 50-60 символов
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  SEO описание
                </label>
                <textarea
                  value={formData.seoDescription}
                  onChange={(e) => handleInputChange('seoDescription', e.target.value)}
                  placeholder="SEO описание для поисковых систем"
                  className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent"
                  rows={3}
                />
                <p className="text-xs text-neutral-400 mt-1">
                  Рекомендуется 150-160 символов
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={generateSeoTitle}
                  className="px-3 py-2 bg-neutral-700 text-white rounded text-sm hover:bg-neutral-600 transition-colors flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Генерировать заголовок
                </button>
                <button
                  type="button"
                  onClick={generateSeoDescription}
                  className="px-3 py-2 bg-neutral-700 text-white rounded text-sm hover:bg-neutral-600 transition-colors flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Генерировать описание
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Содержание статьи */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Содержание статьи *
          </label>
          <MarkdownEditor
            value={formData.content}
            onChange={(value) => handleInputChange('content', value)}
            placeholder={`# Заголовок статьи

Начните писать вашу статью в формате Markdown...

## Подзаголовок

- Список
- Элементов

**Жирный текст** и *курсив*.

\`\`\`javascript
// Пример кода
console.log('Hello World');
\`\`\`

### Работа с изображениями

Используйте кнопку изображения в панели инструментов для:
- Вставки одиночных изображений с обтеканием
- Создания карусели изображений
- Настройки выравнивания и размера`}
          />
        </div>

        {/* Кнопки */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 bg-neutral-700 text-neutral-300 rounded-lg hover:bg-neutral-600 transition-colors"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Сохранение...' : 'Сохранить статью'}
          </button>
        </div>
      </form>

      {/* Инструкции по работе с изображениями */}
      <div className="mt-8 p-6 bg-neutral-800 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Image className="w-5 h-5" />
          Работа с изображениями в редакторе
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-neutral-300">
          <div>
            <h4 className="font-medium text-white mb-3 flex items-center gap-2">
              <Image className="w-4 h-4" />
              Одиночные изображения
            </h4>
            <ul className="space-y-2">
              <li>• Нажмите кнопку изображения в панели инструментов</li>
              <li>• Выберите "Одиночное изображение"</li>
              <li>• Введите URL изображения и альтернативный текст</li>
              <li>• Настройте выравнивание (лево, центр, право)</li>
              <li>• Установите ширину изображения (100-800px)</li>
              <li>• Текст будет автоматически обтекать изображение</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-white mb-3 flex items-center gap-2">
              <Grid3X3 className="w-4 h-4" />
              Карусель изображений
            </h4>
            <ul className="space-y-2">
              <li>• Нажмите кнопку изображения в панели инструментов</li>
              <li>• Выберите "Карусель изображений"</li>
              <li>• Добавьте несколько изображений по одному</li>
              <li>• Настройте альтернативный текст для каждого</li>
              <li>• Карусель будет отображаться с навигацией</li>
              <li>• Поддерживается полноэкранный просмотр</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-white mb-3 flex items-center gap-2">
              <Type className="w-4 h-4" />
              Режимы редактирования
            </h4>
            <ul className="space-y-2">
              <li>• Одна кнопка для переключения режимов</li>
              <li>• Циклическое переключение: Редактировать → Разделенный экран → Предпросмотр</li>
              <li>• Двухстрочная панель инструментов</li>
              <li>• Компактный и организованный интерфейс</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 