'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  RefreshCw,
  Cake,
  FileText,
  TrendingUp,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { News } from '@/types';

interface BirthdayCharacter {
  _id: string;
  name: string;
  birthday: string;
  image?: string;
  hasNews: boolean;
}

export default function NewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [birthdayCharacters, setBirthdayCharacters] = useState<BirthdayCharacter[]>([]);
  const [generating, setGenerating] = useState(false);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/news?limit=100');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNews(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBirthdayCharacters = async () => {
    try {
      const response = await fetch('/api/news/generate-birthday');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setBirthdayCharacters(data.data.characters);
        }
      }
    } catch (error) {
      console.error('Error fetching birthday characters:', error);
    }
  };

  const generateBirthdayNews = async () => {
    try {
      setGenerating(true);
      const response = await fetch('/api/news/generate-birthday', {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert(`Сгенерировано ${data.generated} новостей о днях рождения!`);
          fetchNews(); // Обновляем список новостей
          fetchBirthdayCharacters(); // Обновляем статус персонажей
        }
      }
    } catch (error) {
      console.error('Error generating birthday news:', error);
      alert('Ошибка при генерации новостей');
    } finally {
      setGenerating(false);
    }
  };

  const deleteNews = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту новость?')) return;
    
    try {
      const response = await fetch(`/api/news/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setNews(prev => prev.filter(item => item._id !== id));
        alert('Новость удалена');
      }
    } catch (error) {
      console.error('Error deleting news:', error);
      alert('Ошибка при удалении новости');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'birthday':
        return <Cake className="w-4 h-4" />;
      case 'update':
        return <Settings className="w-4 h-4" />;
      case 'event':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'birthday':
        return 'bg-pink-500';
      case 'update':
        return 'bg-blue-500';
      case 'event':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  useEffect(() => {
    fetchNews();
    fetchBirthdayCharacters();
  }, []);

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
          <h1 className="text-3xl font-bold text-white">Управление новостями</h1>
          <p className="text-gray-400">Создание и управление новостями сайта</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={fetchNews}
            variant="outline" 
            className="border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Обновить
          </Button>
          <Link href="/admin/news/add">
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Добавить новость
            </Button>
          </Link>
        </div>
      </div>

      {/* Дни рождения персонажей */}
      {birthdayCharacters.length > 0 && (
        <Card className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border-pink-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Cake className="w-5 h-5 text-pink-400" />
              Дни рождения сегодня
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {birthdayCharacters.map((character) => (
                <div key={character._id} className="flex items-center space-x-3 p-3 bg-neutral-800/50 rounded-lg">
                  {character.image && (
                    <Image 
                      src={character.image} 
                      alt={character.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <p className="text-white font-medium">{character.name}</p>
                    <p className="text-gray-400 text-sm">
                      {new Date(character.birthday).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long'
                      })}
                    </p>
                  </div>
                  <Badge 
                    variant={character.hasNews ? "secondary" : "default"}
                    className={character.hasNews ? "bg-green-500" : "bg-yellow-500"}
                  >
                    {character.hasNews ? "Новость создана" : "Новость не создана"}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-center">
              <Button 
                onClick={generateBirthdayNews}
                disabled={generating}
                className="bg-pink-600 hover:bg-pink-700"
              >
                {generating ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Cake className="w-4 h-4 mr-2" />
                )}
                {generating ? "Генерируем..." : "Сгенерировать новости о днях рождения"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Список новостей */}
      <Card className="bg-neutral-800 border-neutral-700">
        <CardHeader>
          <CardTitle className="text-white">Все новости ({news.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {news.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Новости не найдены</p>
                <p className="text-sm">Создайте первую новость или сгенерируйте автоматические</p>
              </div>
            ) : (
              news.map((item) => (
                <div key={item._id} className="flex items-center justify-between p-4 bg-neutral-700/50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full ${getTypeColor(item.type)} flex items-center justify-center`}>
                      {getTypeIcon(item.type)}
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{item.title}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <span>{item.author}</span>
                        <span>•</span>
                        <span>{new Date(item.createdAt).toLocaleDateString('ru-RU')}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {item.views}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {item.type}
                        </Badge>
                        {item.isPublished ? (
                          <Badge className="bg-green-500 text-xs">Опубликовано</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Черновик</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link href={`/admin/news/${item._id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => deleteNews(item._id)}
                      className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
