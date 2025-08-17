'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Character } from '@/types';

export default function AddNewsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [form, setForm] = useState({
    title: '',
    content: '',
    type: 'manual' as 'manual' | 'birthday' | 'update' | 'event',
    image: '',
    isPublished: false,
    characterId: '',
    tags: [] as string[],
    newTag: ''
  });

  useEffect(() => {
    fetchCharacters();
  }, []);

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
      
      const response = await fetch('/api/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: form.title,
          content: form.content,
          type: form.type,
          image: form.image || undefined,
          isPublished: form.isPublished,
          characterId: form.characterId || undefined,
          tags: form.tags
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert('Новость успешно создана!');
          router.push('/admin/news');
        }
      } else {
        const error = await response.json();
        alert(`Ошибка: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating news:', error);
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Основная информация */}
        <Card className="bg-neutral-800 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-white">Основная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-white">Заголовок *</Label>
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
              <Label htmlFor="content" className="text-white">Содержание *</Label>
              <Textarea
                id="content"
                value={form.content}
                onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Введите содержание новости"
                className="bg-neutral-700 border-neutral-600 text-white min-h-[200px]"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type" className="text-white">Тип новости *</Label>
                <Select
                  value={form.type}
                  onValueChange={(value: 'manual' | 'birthday' | 'update' | 'event') => 
                    setForm(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger className="bg-neutral-700 border-neutral-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-700 border-neutral-600">
                    <SelectItem value="manual">Ручная</SelectItem>
                    <SelectItem value="birthday">День рождения</SelectItem>
                    <SelectItem value="update">Обновление</SelectItem>
                    <SelectItem value="event">Событие</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="characterId" className="text-white">Персонаж (опционально)</Label>
                <Select
                  value={form.characterId}
                  onValueChange={(value) => setForm(prev => ({ ...prev, characterId: value }))}
                >
                  <SelectTrigger className="bg-neutral-700 border-neutral-600 text-white">
                    <SelectValue placeholder="Выберите персонажа" />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-700 border-neutral-600">
                    <SelectItem value="">Без персонажа</SelectItem>
                    {characters.map((character) => (
                      <SelectItem key={character._id} value={character._id}>
                        {character.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="image" className="text-white">URL изображения</Label>
              <Input
                id="image"
                type="url"
                value={form.image}
                onChange={(e) => setForm(prev => ({ ...prev, image: e.target.value }))}
                placeholder="https://example.com/image.jpg"
                className="bg-neutral-700 border-neutral-600 text-white"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublished"
                checked={form.isPublished}
                onChange={(e) => setForm(prev => ({ ...prev, isPublished: e.target.checked }))}
                className="rounded border-neutral-600 bg-neutral-700"
              />
              <Label htmlFor="isPublished" className="text-white">Опубликовать сразу</Label>
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
