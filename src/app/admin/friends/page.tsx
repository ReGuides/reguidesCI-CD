'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { AdminButton } from '@/components/ui/admin-button';
import { BackButton } from '@/components/ui/back-button';
import PageTitle from '@/components/ui/page-title';

interface Friend {
  _id: string;
  id: string;
  name: string;
  url: string;
  logo: string;
  createdAt: string;
  updatedAt: string;
}

export default function FriendsManagementPage() {
  return (
    <>
      <PageTitle title="Управление друзьями сайта" />
      <FriendsManagementContent />
    </>
  );
}

function FriendsManagementContent() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFriend, setEditingFriend] = useState<Friend | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/friends');
      if (!response.ok) {
        throw new Error('Failed to fetch friends');
      }
      const data = await response.json();
      setFriends(data);
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (friendId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этого друга?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/friends/${friendId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete friend');
      }

      await fetchFriends();
    } catch (error) {
      console.error('Error deleting friend:', error);
      alert('Ошибка при удалении друга');
    }
  };

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <BackButton />
        <h1 className="text-3xl font-bold text-white">Управление друзьями сайта</h1>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-neutral-800 border-neutral-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-gray-300">Всего друзей</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-white">{friends.length}</span>
          </CardContent>
        </Card>
        
        <Card className="bg-neutral-800 border-neutral-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-gray-300">Активных</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-green-400">{friends.filter(f => f.url && f.url.trim() !== '').length}</span>
          </CardContent>
        </Card>
        
        <Card className="bg-neutral-800 border-neutral-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-gray-300">Без логотипа</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-yellow-400">{friends.filter(f => !f.logo || f.logo.trim() === '').length}</span>
          </CardContent>
        </Card>
      </div>

      {/* Поиск и добавление */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Поиск по названию или URL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <AdminButton
          onClick={() => setShowAddForm(true)}
          className="whitespace-nowrap"
        >
          + Добавить друга
        </AdminButton>
      </div>

      {/* Список друзей */}
      <div className="grid gap-4">
        {filteredFriends.map(friend => (
          <Card key={friend._id} className="bg-neutral-800 border-neutral-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-neutral-700 rounded-lg flex items-center justify-center">
                    {friend.logo ? (
                      <img
                        src={friend.logo}
                        alt={friend.name}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <span className={`text-neutral-400 font-bold text-lg ${friend.logo ? 'hidden' : ''}`}>
                      {friend.name.charAt(0)}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">{friend.name}</h3>
                    <p className="text-gray-400 text-sm mb-1">ID: {friend.id}</p>
                    <a
                      href={friend.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm break-all"
                    >
                      {friend.url}
                    </a>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingFriend(friend)}
                    className="border-neutral-600 text-neutral-300 hover:bg-neutral-700"
                  >
                    Редактировать
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(friend.id)}
                  >
                    Удалить
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFriends.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">
            {searchQuery ? 'По вашему запросу ничего не найдено' : 'Друзей пока нет'}
          </p>
        </div>
      )}

      {/* Модальное окно добавления/редактирования */}
      {(showAddForm || editingFriend) && (
        <FriendFormModal
          friend={editingFriend}
          onClose={() => {
            setShowAddForm(false);
            setEditingFriend(null);
          }}
          onSave={async (friendData) => {
            try {
              if (editingFriend) {
                // Обновление
                const response = await fetch(`/api/admin/friends/${editingFriend.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(friendData),
                });
                
                if (!response.ok) {
                  throw new Error('Failed to update friend');
                }
              } else {
                // Создание
                const response = await fetch('/api/admin/friends', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(friendData),
                });
                
                if (!response.ok) {
                  throw new Error('Failed to create friend');
                }
              }
              
              await fetchFriends();
              setShowAddForm(false);
              setEditingFriend(null);
            } catch (error) {
              console.error('Error saving friend:', error);
              alert('Ошибка при сохранении друга');
            }
          }}
        />
      )}
    </div>
  );
}

// Компонент модального окна для формы
interface FriendFormModalProps {
  friend: Friend | null;
  onClose: () => void;
  onSave: (friendData: { id: string; name: string; url: string; logo: string }) => void;
}

function FriendFormModal({ friend, onClose, onSave }: FriendFormModalProps) {
  const [formData, setFormData] = useState({
    id: friend?.id || '',
    name: friend?.name || '',
    url: friend?.url || '',
    logo: friend?.logo || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.id.trim()) {
      newErrors.id = 'ID обязателен';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Название обязательно';
    }
    
    if (!formData.url.trim()) {
      newErrors.url = 'URL обязателен';
    } else if (!formData.url.startsWith('http://') && !formData.url.startsWith('https://')) {
      newErrors.url = 'URL должен начинаться с http:// или https://';
    }
    
    if (!formData.logo.trim()) {
      newErrors.logo = 'Логотип обязателен';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            {friend ? 'Редактировать друга' : 'Добавить друга'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              ID *
            </label>
            <input
              type="text"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              className={`w-full px-3 py-2 bg-neutral-700 border rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.id ? 'border-red-500' : 'border-neutral-600'
              }`}
              placeholder="Уникальный идентификатор"
              disabled={!!friend} // ID нельзя изменить при редактировании
            />
            {errors.id && <p className="text-red-400 text-sm mt-1">{errors.id}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Название *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3 py-2 bg-neutral-700 border rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.name ? 'border-red-500' : 'border-neutral-600'
              }`}
              placeholder="Название сайта"
            />
            {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              URL *
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className={`w-full px-3 py-2 bg-neutral-700 border rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.url ? 'border-red-500' : 'border-neutral-600'
              }`}
              placeholder="https://example.com"
            />
            {errors.url && <p className="text-red-400 text-sm mt-1">{errors.url}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Логотип *
            </label>
            <input
              type="url"
              value={formData.logo}
              onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
              className={`w-full px-3 py-2 bg-neutral-700 border rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.logo ? 'border-red-500' : 'border-neutral-600'
              }`}
              placeholder="https://example.com/logo.png"
            />
            {errors.logo && <p className="text-red-400 text-sm mt-1">{errors.logo}</p>}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              {friend ? 'Сохранить' : 'Добавить'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-neutral-600 text-neutral-300 hover:bg-neutral-700"
            >
              Отмена
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
