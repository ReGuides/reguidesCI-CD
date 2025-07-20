'use client';

import { useState, useEffect } from 'react';
import { Article } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { IconActionButton } from '@/components/ui/icon-action-button';
import { AddButton } from '@/components/ui/add-button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import OptimizedImage from '@/components/ui/optimized-image';
import { Plus, Edit, Trash2, Eye, Calendar, User, Star, Globe } from 'lucide-react';

export default function ArticlesAdminPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/articles');
      if (response.ok) {
        const data = await response.json();
        setArticles(data.data?.articles || data.articles || data || []);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || article.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || article.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-600';
      case 'draft': return 'bg-yellow-600';
      case 'archived': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'guide': return 'bg-blue-600';
      case 'news': return 'bg-purple-600';
      case 'review': return 'bg-orange-600';
      case 'analysis': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" className="text-purple-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Управление статьями</h1>
        <AddButton 
          variant="primary"
          size="lg"
          icon={<Plus />}
          iconPosition="left"
          onClick={() => window.location.href = '/admin/articles/create'}
        >
          Добавить статью
        </AddButton>
      </div>

      {/* Фильтры */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <Input
            placeholder="Поиск статей..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-neutral-800 border-neutral-700 text-white"
          />
        </div>
        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white"
          >
            <option value="all">Все статусы</option>
            <option value="published">Опубликовано</option>
            <option value="draft">Черновик</option>
            <option value="archived">Архив</option>
          </select>
        </div>
        <div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white"
          >
            <option value="all">Все категории</option>
            <option value="guide">Гайд</option>
            <option value="news">Новости</option>
            <option value="review">Обзор</option>
            <option value="analysis">Анализ</option>
          </select>
        </div>
        <div className="text-white">
          Всего: {filteredArticles.length}
        </div>
      </div>

      {/* Список статей */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredArticles.map((article) => (
          <Card key={article._id} className="bg-neutral-800 border-neutral-700 hover:bg-neutral-700 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge className={getStatusColor(article.status)}>
                      {article.status === 'published' ? 'Опубликовано' : 
                       article.status === 'draft' ? 'Черновик' : 'Архив'}
                    </Badge>
                    <Badge className={getCategoryColor(article.category)}>
                      {article.category === 'guide' ? 'Гайд' :
                       article.category === 'news' ? 'Новости' :
                       article.category === 'review' ? 'Обзор' : 'Анализ'}
                    </Badge>
                    {article.featured && (
                      <Badge className="bg-yellow-600">Рекомендуемая</Badge>
                    )}
                  </div>
                  <CardTitle className="text-white text-lg mb-2">{article.title}</CardTitle>
                  <p className="text-gray-400 text-sm line-clamp-2">{article.excerpt || article.content.substring(0, 150)}...</p>
                </div>
                {article.featuredImage && (
                  <div className="ml-4">
                    <OptimizedImage
                      src={article.featuredImage}
                      alt={article.title}
                      className="w-16 h-16 rounded object-cover"
                      type="character"
                    />
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>{typeof article.author === 'string' ? article.author : article.author?.name || 'Неизвестно'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(article.publishedAt || article.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4" />
                    <span>{article.views} просмотров</span>
                  </div>
                  <div className="flex space-x-1">
                    <IconActionButton 
                      variant="view" 
                      icon={<Eye />} 
                      title="Просмотр"
                      size="sm"
                    />
                    <IconActionButton 
                      variant="edit" 
                      icon={<Edit />} 
                      title="Редактировать"
                      size="sm"
                    />
                    <IconActionButton 
                      variant="feature" 
                      icon={<Star />} 
                      title="Рекомендовать"
                      size="sm"
                    />
                    <IconActionButton 
                      variant="publish" 
                      icon={<Globe />} 
                      title="Опубликовать"
                      size="sm"
                    />
                    <IconActionButton 
                      variant="delete" 
                      icon={<Trash2 />} 
                      title="Удалить"
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">Статьи не найдены</p>
        </div>
      )}
    </div>
  );
} 