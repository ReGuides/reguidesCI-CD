'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Character } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import OptimizedImage from '@/components/ui/optimized-image';
import { Save, Upload, Star, Users, Sword, Shield, Globe, FileText, Settings, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AddCharacterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<Character>>({
    name: '',
    id: '',
    element: 'Пиро',
    weaponType: 'Двуручный меч',
    rarity: 5,
    region: 'Натлан',
    description: '',
    image: ''
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'stats' | 'media' | 'builds'>('basic');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        router.push('/admin/characters');
      } else {
        console.error('Error creating character');
      }
    } catch (error) {
      console.error('Error saving character:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const elements = [
    { value: 'Пиро', label: 'Пиро', color: 'bg-red-500', icon: '🔥' },
    { value: 'Гидро', label: 'Гидро', color: 'bg-blue-500', icon: '💧' },
    { value: 'Анемо', label: 'Анемо', color: 'bg-green-500', icon: '🌪️' },
    { value: 'Электро', label: 'Электро', color: 'bg-purple-500', icon: '⚡' },
    { value: 'Дендро', label: 'Дендро', color: 'bg-green-600', icon: '🌱' },
    { value: 'Крио', label: 'Крио', color: 'bg-cyan-500', icon: '❄️' },
    { value: 'Гео', label: 'Гео', color: 'bg-yellow-500', icon: '🪨' }
  ];

  const weaponTypes = [
    { value: 'Одноручный меч', label: 'Одноручный меч', icon: '⚔️' },
    { value: 'Двуручный меч', label: 'Двуручный меч', icon: '🗡️' },
    { value: 'Копье', label: 'Копье', icon: '🔱' },
    { value: 'Лук', label: 'Лук', icon: '🏹' },
    { value: 'Катализатор', label: 'Катализатор', icon: '📖' }
  ];

  const regions = [
    { value: 'Мондштадт', label: 'Мондштадт', icon: '🏰' },
    { value: 'Ли Юэ', label: 'Ли Юэ', icon: '🏮' },
    { value: 'Инадзума', label: 'Инадзума', icon: '⚡' },
    { value: 'Сумеру', label: 'Сумеру', icon: '🌴' },
    { value: 'Фонтейн', label: 'Фонтейн', icon: '🌊' },
    { value: 'Натлан', label: 'Натлан', icon: '🌋' },
    { value: 'Снежная', label: 'Снежная', icon: '❄️' }
  ];

  const tabs = [
    { id: 'basic', label: 'Основное', icon: Users },
    { id: 'details', label: 'Детали', icon: FileText },
    { id: 'stats', label: 'Характеристики', icon: Shield },
    { id: 'media', label: 'Медиа', icon: Upload },
    { id: 'builds', label: 'Билды', icon: Settings }
  ];

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link href="/admin/characters">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Добавить персонажа</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Вкладки */}
        <div className="flex space-x-1 bg-neutral-700/50 rounded-lg p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-600'
                }`}
              >
                <Icon className="w-4 h-4 text-neutral-400" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Основная информация */}
        {activeTab === 'basic' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Имя персонажа</label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="bg-neutral-700 border-neutral-600 text-white"
                  placeholder="Введите имя персонажа"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">ID персонажа</label>
                <Input
                  value={formData.id}
                  onChange={(e) => handleInputChange('id', e.target.value)}
                  className="bg-neutral-700 border-neutral-600 text-white"
                  placeholder="albedo"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Элемент</label>
                <div className="grid grid-cols-2 gap-2">
                  {elements.map(element => (
                    <button
                      key={element.value}
                      type="button"
                      onClick={() => handleInputChange('element', element.value)}
                      className={`flex items-center space-x-2 p-3 rounded-lg border transition-all ${
                        formData.element === element.value
                          ? 'bg-purple-600 border-purple-500 text-white'
                          : 'bg-neutral-700 border-neutral-600 text-white hover:bg-neutral-600'
                      }`}
                    >
                      <span className="text-lg">{element.icon}</span>
                      <span className="text-sm">{element.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Тип оружия</label>
                <div className="grid grid-cols-2 gap-2">
                  {weaponTypes.map(weapon => (
                    <button
                      key={weapon.value}
                      type="button"
                      onClick={() => handleInputChange('weaponType', weapon.value)}
                      className={`flex items-center space-x-2 p-3 rounded-lg border transition-all ${
                        formData.weaponType === weapon.value
                          ? 'bg-purple-600 border-purple-500 text-white'
                          : 'bg-neutral-700 border-neutral-600 text-white hover:bg-neutral-600'
                      }`}
                    >
                      <span className="text-lg">{weapon.icon}</span>
                      <span className="text-sm">{weapon.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Редкость</label>
                <div className="flex space-x-2">
                  {[4, 5].map(rarity => (
                    <button
                      key={rarity}
                      type="button"
                      onClick={() => handleInputChange('rarity', rarity)}
                      className={`flex items-center space-x-2 px-4 py-3 rounded-lg border transition-all ${
                        formData.rarity === rarity
                          ? 'bg-yellow-600 border-yellow-500 text-white'
                          : 'bg-neutral-700 border-neutral-600 text-white hover:bg-neutral-600'
                      }`}
                    >
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="font-medium">{rarity}★</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Регион</label>
                <select
                  value={formData.region}
                  onChange={(e) => handleInputChange('region', e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white"
                >
                  {regions.map(region => (
                    <option key={region.value} value={region.value}>
                      {region.icon} {region.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Детали */}
        {activeTab === 'details' && (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Описание</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white resize-none"
                rows={6}
                placeholder="Введите описание персонажа..."
              />
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isFeatured"
                checked={formData.isFeatured}
                onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                className="w-4 h-4 text-purple-600 bg-neutral-700 border-neutral-600 rounded"
              />
              <label htmlFor="isFeatured" className="text-sm text-gray-400">
                Рекомендуемый персонаж
              </label>
            </div>
          </div>
        )}

        {/* Характеристики */}
        {activeTab === 'stats' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-neutral-700/50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-neutral-300 mb-3">Базовые характеристики</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">HP:</span>
                    <span className="text-white">12,380</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Атака:</span>
                    <span className="text-white">234</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Защита:</span>
                    <span className="text-white">751</span>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-700/50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-neutral-300 mb-3">Критические характеристики</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Крит. шанс:</span>
                    <span className="text-white">5%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Крит. урон:</span>
                    <span className="text-white">50%</span>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-700/50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-neutral-300 mb-3">Элементальные характеристики</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Мастерство стихий:</span>
                    <span className="text-white">0</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Восстановление энергии:</span>
                    <span className="text-white">100%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Медиа */}
        {activeTab === 'media' && (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">URL изображения</label>
              <Input
                value={formData.image}
                onChange={(e) => handleInputChange('image', e.target.value)}
                className="bg-neutral-700 border-neutral-600 text-white"
                placeholder="/images/characters/albedo.png"
              />
            </div>

            {formData.image && (
              <div className="border border-neutral-700 rounded-lg p-4 bg-neutral-700/30">
                <h3 className="text-sm text-gray-400 mb-3">Предварительный просмотр</h3>
                <div className="flex items-center space-x-4">
                  <OptimizedImage
                    src={formData.image}
                    alt={formData.name || 'Character'}
                    className="w-20 h-20 rounded-lg object-cover border border-neutral-600"
                    type="character"
                  />
                  <div>
                    <h4 className="text-white font-medium text-lg">{formData.name}</h4>
                    <div className="flex items-center space-x-2 mt-2">
                      {elements.find(e => e.value === formData.element) && (
                        <Badge className={elements.find(e => e.value === formData.element)?.color}>
                          {elements.find(e => e.value === formData.element)?.icon} {elements.find(e => e.value === formData.element)?.label}
                        </Badge>
                      )}
                      <Badge className="bg-yellow-600">
                        <Star className="w-3 h-3 mr-1" />
                        {formData.rarity}★
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Билды */}
        {activeTab === 'builds' && (
          <div className="space-y-4">
            <div className="text-center py-8 text-neutral-400">
              <Settings className="w-12 h-12 mx-auto mb-4 text-neutral-600" />
              <p>Билды будут доступны после создания персонажа</p>
              <p className="text-sm">Сначала сохраните персонажа, затем вернитесь для добавления билдов</p>
            </div>
          </div>
        )}

        {/* Кнопки */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-neutral-700">
          <Link href="/admin/characters">
            <Button
              type="button"
              variant="outline"
              className="border-neutral-600 text-gray-400 hover:text-white"
            >
              Отмена
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>
      </form>
    </div>
  );
} 