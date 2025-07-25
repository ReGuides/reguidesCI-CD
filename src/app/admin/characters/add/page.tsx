'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Character } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import OptimizedImage from '@/components/ui/optimized-image';
import { Save, Upload, Star, Users, Shield, FileText, Settings, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import BuildForm from '@/components/builds/BuildForm';
import RecommendationForm from '@/components/builds/RecommendationForm';
import TextFormattingToolbar from '@/components/admin/TextFormattingToolbar';
import SuggestionHelper from '@/components/admin/SuggestionHelper';
import TalentManager from '@/components/admin/TalentManager';
import ConstellationManager from '@/components/admin/ConstellationManager';
import { Weapon } from '@/types';
import { getImageWithFallback } from '@/lib/utils/imageUtils';

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
    image: '',
    gender: '',
    birthday: '',
    patchNumber: '',
    role: '',
    gameplayDescription: '',
    isFeatured: false
  });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'stats' | 'media' | 'builds' | 'recommendations' | 'talents' | 'constellations'>('basic');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [builds, setBuilds] = useState<any[]>([]);
  const [buildModalOpen, setBuildModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingBuild, setEditingBuild] = useState<any>(null);
  const [weaponsList, setWeaponsList] = useState<Weapon[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [recommendationModalOpen, setRecommendationModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingRecommendation, setEditingRecommendation] = useState<any>(null);
  const [isEditingGameplayDescription, setIsEditingGameplayDescription] = useState(false);
  const [gameplayDescriptionDraft, setGameplayDescriptionDraft] = useState('');

  const fetchWeapons = async () => {
    try {
      const response = await fetch('/api/weapons');
      if (response.ok) {
        const data = await response.json();
        const weaponsArray = Array.isArray(data.data) ? data.data : data.data?.weapons || data.weapons || data || [];
        setWeaponsList(weaponsArray);
      }
    } catch (error) {
      console.error('Error fetching weapons:', error);
    }
  };

  useEffect(() => {
    fetchWeapons();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const response = await fetch('/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const result = await response.json();
        router.push(`/admin/characters/${result.id}/edit`);
      } else {
        console.error('Error creating character');
      }
    } catch (error) {
      console.error('Error saving character:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Функции для работы с билдами
  const handleAddBuild = () => {
    setEditingBuild(null);
    setBuildModalOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditBuild = (build: any) => {
    setEditingBuild(build);
    setBuildModalOpen(true);
  };

  const handleDeleteBuild = async (id: string) => {
    if (!confirm("Удалить билд?")) return;
    setBuilds(prev => prev.filter(build => build.id !== id));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSaveBuild = async (build: any) => {
    try {
      // Добавляем билд в локальное состояние
      const newBuild = {
        ...build,
        id: `build-${Date.now()}`,
        characterId: formData.id
      };
      setBuilds(prev => [...prev, newBuild]);
      setBuildModalOpen(false);
      setEditingBuild(null);
    } catch (error) {
      console.error('Error saving build:', error);
    }
  };

  // Функции для работы с рекомендациями
  const handleAddRecommendation = () => {
    setEditingRecommendation(null);
    setRecommendationModalOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditRecommendation = (recommendation: any) => {
    setEditingRecommendation(recommendation);
    setRecommendationModalOpen(true);
  };

  const handleDeleteRecommendation = async () => {
    if (!confirm("Удалить рекомендации?")) return;
    setRecommendations([]);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSaveRecommendation = async (recommendation: any) => {
    try {
      const newRecommendation = {
        ...recommendation,
        id: `recommendation-${Date.now()}`,
        characterId: formData.id
      };
      setRecommendations([newRecommendation]);
      setRecommendationModalOpen(false);
      setEditingRecommendation(null);
    } catch (error) {
      console.error('Error saving recommendation:', error);
    }
  };

  // Функции для работы с описанием геймплея
  const handleEditGameplayDescription = () => {
    setGameplayDescriptionDraft(formData.gameplayDescription || '');
    setIsEditingGameplayDescription(true);
  };

  const handleSaveGameplayDescription = () => {
    setFormData(prev => ({ ...prev, gameplayDescription: gameplayDescriptionDraft }));
    setIsEditingGameplayDescription(false);
  };

  const handleCancelGameplayDescription = () => {
    setIsEditingGameplayDescription(false);
    setGameplayDescriptionDraft('');
  };

  const handleInsertSuggestion = (text: string) => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentDescription = gameplayDescriptionDraft;
      const newText = currentDescription.substring(0, start) + text + currentDescription.substring(end);
      setGameplayDescriptionDraft(newText);
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + text.length, start + text.length);
      }, 0);
    }
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
    { value: 'Снежная', label: 'Снежная', icon: '❄️' },
    { value: 'Нод-Край', label: 'Нод-Край', icon: '🌙' },
    { value: 'Каэнриарх', label: 'Каэнриарх', icon: '⚔️' }
  ];

  const tabs = [
    { id: 'basic', label: 'Основное', icon: Users },
    { id: 'stats', label: 'Характеристики', icon: Shield },
    { id: 'media', label: 'Медиа', icon: Upload },
    { id: 'builds', label: 'Билды', icon: Settings },
    { id: 'recommendations', label: 'Рекомендации', icon: Star },
    { id: 'talents', label: 'Таланты', icon: FileText },
    { id: 'constellations', label: 'Созвездия', icon: Star }
  ];

  const getAvatarSrc = () => {
    if (!formData.image) return '/default-avatar.png';
    if (formData.image.startsWith('http')) return formData.image;
    return `/images/characters/${formData.image}`;
  };

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
                onClick={() => setActiveTab(tab.id as 'basic' | 'details' | 'stats' | 'media' | 'builds' | 'recommendations' | 'talents' | 'constellations')}
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Левая часть: поля */}
            <div className="lg:col-span-2 space-y-4">
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
                <label className="text-sm text-gray-400 mb-2 block">Описание персонажа</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white min-h-[100px] resize-none"
                  placeholder="Введите описание персонажа..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Пол</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white"
                  >
                    <option value="">Выберите пол</option>
                    <option value="Мужской">Мужской</option>
                    <option value="Женский">Женский</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">День рождения</label>
                  <Input
                    value={formData.birthday}
                    onChange={(e) => handleInputChange('birthday', e.target.value)}
                    className="bg-neutral-700 border-neutral-600 text-white"
                    placeholder="Например: 8 июня"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Номер патча</label>
                  <Input
                    value={formData.patchNumber}
                    onChange={(e) => handleInputChange('patchNumber', e.target.value)}
                    className="bg-neutral-700 border-neutral-600 text-white"
                    placeholder="Например: 5.6"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Элемент</label>
                <select
                  value={formData.element}
                  onChange={(e) => handleInputChange('element', e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white"
                >
                  {elements.map(element => (
                    <option key={element.value} value={element.value}>
                      {element.icon} {element.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Тип оружия</label>
                  <select
                    value={formData.weaponType}
                    onChange={(e) => handleInputChange('weaponType', e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white"
                  >
                    {weaponTypes.map(weapon => (
                      <option key={weapon.value} value={weapon.value}>
                        {weapon.icon} {weapon.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Редкость</label>
                  <select
                    value={formData.rarity}
                    onChange={(e) => handleInputChange('rarity', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white"
                  >
                    <option value={4}>⭐ 4★</option>
                    <option value={5}>⭐⭐ 5★</option>
                  </select>
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

            {/* Правая часть: аватар */}
            <div className="flex flex-col items-center gap-4">
              <OptimizedImage
                src={getAvatarSrc()}
                alt={formData.name || 'Аватар'}
                className="w-40 h-40 rounded-full object-cover border-4 border-neutral-700 bg-neutral-800"
                type="character"
              />
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
                    src={getAvatarSrc()}
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
            {/* Описание геймплея */}
            <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Общее описание геймплея</h3>
                {isEditingGameplayDescription ? (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={handleSaveGameplayDescription}
                      className="bg-green-600 hover:bg-green-700 text-sm"
                    >
                      Сохранить
                    </Button>
                    <Button
                      type="button"
                      onClick={handleCancelGameplayDescription}
                      variant="outline"
                      className="text-sm"
                    >
                      Отмена
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    onClick={handleEditGameplayDescription}
                    className="bg-blue-600 hover:bg-blue-700 text-sm"
                  >
                    Редактировать
                  </Button>
                )}
              </div>
              
              {isEditingGameplayDescription ? (
                <>
                  <textarea
                    value={gameplayDescriptionDraft}
                    onChange={(e) => setGameplayDescriptionDraft(e.target.value)}
                    className="w-full min-h-[120px] bg-neutral-700 text-white rounded p-3 border border-neutral-600 resize-none"
                    placeholder="Введите описание геймплея персонажа..."
                  />
                  <TextFormattingToolbar onInsert={handleInsertSuggestion} />
                  <SuggestionHelper
                    onInsert={handleInsertSuggestion}
                    onClose={() => {}}
                    characterId={formData.id || ''}
                  />
                  <div className="mt-2 text-xs text-gray-400 bg-neutral-900 rounded p-2">
                    <div className="font-semibold mb-1 text-gray-300">Поддерживаемая разметка:</div>
                    <ul className="list-disc pl-5 space-y-1">
                      <li><b>Жирный:</b> <code>**текст**</code> или <code>__текст__</code></li>
                      <li><b>Цвет:</b> <code>[pyro:Пиро]</code>, <code>[hydro:Гидро]</code>, <code>[electro:Электро]</code>, <code>[cryo:Крио]</code>, <code>[anemo:Анемо]</code>, <code>[geo:Гео]</code>, <code>[dendro:Дендро]</code>, <code>[red:Красный]</code>, <code>[blue:Голубой]</code>, <code>[green:Зелёный]</code>, <code>[yellow:Жёлтый]</code>, <code>[orange:Оранжевый]</code>, <code>[purple:Фиолетовый]</code>, <code>[cyan:Голубой]</code>, <code>[pink:Розовый]</code></li>
                      <li><b>Ссылка:</b> <code>[текст](https://site.ru)</code></li>
                      <li><b>Модалка оружия:</b> <code>[Меч Фавония](weapon:favonius-sword)</code></li>
                      <li><b>Комбинированное:</b> <code>[pyro:**Пиро ДПС**]</code></li>
                    </ul>
                    <div className="mt-1 text-gray-500">Для модалок доступны: <b>weapon:ID</b>, <b>artifact:ID</b>, <b>character:ID</b>, <b>talent:тип</b>, <b>constellation:уровень</b></div>
                  </div>
                </>
              ) : (
                <div className="text-neutral-300 whitespace-pre-line">
                  {formData.gameplayDescription || <span className="text-neutral-500">Нет описания</span>}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Билды персонажа</h3>
              <Button type="button" onClick={handleAddBuild} className="bg-blue-600 hover:bg-blue-700">
                Добавить билд
              </Button>
            </div>

            {builds.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Settings className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <p>Билды не найдены</p>
                <p className="text-sm">Нажмите &quot;Добавить билд&quot; чтобы создать первый билд</p>
              </div>
            ) : (
              <div className="space-y-3">
                {builds.map((build, index) => (
                  <div key={build.id || `build-${index}`} className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-semibold text-white">{build.title}</h4>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={() => handleEditBuild(build)}
                          variant="outline"
                          size="sm"
                        >
                          Редактировать
                        </Button>
                        <Button
                          type="button"
                          onClick={() => handleDeleteBuild(build.id || `build-${index}`)}
                          variant="outline"
                          size="sm"
                          className="text-red-400 hover:text-red-300"
                        >
                          Удалить
                        </Button>
                      </div>
                    </div>
                    {build.description && (
                      <p className="text-gray-400 text-sm mb-2">{build.description}</p>
                    )}
                    {build.role && (
                      <Badge variant="secondary" className="mb-2">
                        {build.role}
                      </Badge>
                    )}
                    {build.isFeatured && (
                      <Badge variant="default" className="ml-2">
                        Рекомендуемый
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Рекомендации */}
        {activeTab === 'recommendations' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Рекомендации персонажа</h3>
              <Button 
                type="button" 
                onClick={handleAddRecommendation} 
                className="bg-green-600 hover:bg-green-700"
              >
                {recommendations.length > 0 ? 'Редактировать рекомендации' : 'Добавить рекомендации'}
              </Button>
            </div>

            {recommendations.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Star className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <p>Рекомендации не найдены</p>
                <p className="text-sm">Нажмите &quot;Добавить рекомендации&quot; чтобы создать рекомендации для персонажа</p>
              </div>
            ) : (
              <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-white">Рекомендации для персонажа</h4>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={() => handleEditRecommendation(recommendations[0])}
                      variant="outline"
                      size="sm"
                    >
                      Редактировать
                    </Button>
                    <Button
                      type="button"
                      onClick={() => handleDeleteRecommendation()}
                      variant="outline"
                      size="sm"
                      className="text-red-400 hover:text-red-300"
                    >
                      Удалить
                    </Button>
                  </div>
                </div>
                
                {/* Оружие */}
                {recommendations[0].weapons && recommendations[0].weapons.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-400 mb-2">Рекомендуемое оружие:</h5>
                    <div className="flex flex-wrap gap-2">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {recommendations[0].weapons.map((weaponItem: any, index: number) => {
                        const weaponId = typeof weaponItem === 'string' ? weaponItem : weaponItem.id;
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const weapon = weaponsList.find((w: any) => w.id === weaponId);
                        
                        if (weapon) {
                          return (
                            <div key={`weapon-${weaponId}-${index}`} className="flex items-center gap-2 bg-neutral-700 rounded px-2 py-1">
                              <OptimizedImage
                                src={getImageWithFallback(weapon.image, weapon.name, 'weapon')}
                                alt={weapon.name}
                                className="w-6 h-6 rounded"
                                type="weapon"
                              />
                              <span className="text-xs text-white">{weapon.name}</span>
                            </div>
                          );
                        } else {
                          return (
                            <div key={`weapon-not-found-${weaponId}-${index}`} className="flex items-center gap-2 bg-neutral-700 rounded px-2 py-1">
                              <span className="text-xs text-red-400">Оружие не найдено: {weaponId}</span>
                            </div>
                          );
                        }
                      })}
                    </div>
                  </div>
                )}
                
                {/* Артефакты */}
                {recommendations[0].artifacts && recommendations[0].artifacts.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-400 mb-2">Рекомендуемые артефакты:</h5>
                    <div className="flex flex-wrap gap-2">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {recommendations[0].artifacts.map((artifact: any, artifactIndex: number) => {
                        if ('id' in artifact) {
                          return (
                            <div key={`artifact-${artifact.id}-${artifactIndex}`} className="flex items-center gap-2 bg-neutral-700 rounded px-2 py-1">
                              <OptimizedImage
                                src={getImageWithFallback(artifact.image, artifact.name, 'artifact')}
                                alt={artifact.name}
                                className="w-6 h-6 rounded"
                                type="artifact"
                              />
                              <span className="text-xs text-white">{artifact.name}</span>
                            </div>
                          );
                        } else {
                          return (
                            <div key={`artifact-combo-${artifactIndex}`} className="flex items-center gap-2 bg-neutral-700 rounded px-2 py-1">
                              <span className="text-xs text-white">{artifact.description}</span>
                            </div>
                          );
                        }
                      })}
                    </div>
                  </div>
                )}

                {/* Статы и команды */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-neutral-700/50 rounded-lg p-3">
                    <h5 className="text-sm font-medium text-gray-400 mb-2">Статы персонажа</h5>
                    <p className="text-xs text-gray-500">Настройте рекомендуемые статы и приоритеты талантов</p>
                    <Button
                      type="button"
                      onClick={() => handleEditRecommendation(recommendations[0])}
                      variant="outline"
                      size="sm"
                      className="mt-2"
                    >
                      Настроить статы
                    </Button>
                  </div>
                  
                  <div className="bg-neutral-700/50 rounded-lg p-3">
                    <h5 className="text-sm font-medium text-gray-400 mb-2">Команды персонажа</h5>
                    <p className="text-xs text-gray-500">Настройте рекомендуемые команды и совместимых персонажей</p>
                    <Button
                      type="button"
                      onClick={() => handleEditRecommendation(recommendations[0])}
                      variant="outline"
                      size="sm"
                      className="mt-2"
                    >
                      Настроить команды
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Таланты */}
        {activeTab === 'talents' && (
          <div className="space-y-4">
            <TalentManager 
              characterId={formData.id || ''} 
              onSave={() => {
                const event = new CustomEvent('talentsUpdated', { detail: { characterId: formData.id } });
                window.dispatchEvent(event);
                console.log('Talents saved successfully');
              }}
            />
          </div>
        )}

        {/* Созвездия */}
        {activeTab === 'constellations' && (
          <div className="space-y-4">
            <ConstellationManager 
              characterId={formData.id || ''} 
              onSave={() => {
                const event = new CustomEvent('constellationsUpdated', { detail: { characterId: formData.id } });
                window.dispatchEvent(event);
                console.log('Constellations saved successfully');
              }}
            />
          </div>
        )}

        {/* Кнопки сохранения */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-neutral-700">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/characters')}
            className="border-neutral-600 text-gray-400 hover:text-white"
          >
            Отмена
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>
      </form>

      {/* Модальные окна вынесены за пределы формы */}
      {/* Модальное окно для билдов */}
      {buildModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-neutral-900 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4 text-white">
              {editingBuild ? "Редактировать билд" : "Добавить билд"}
            </h2>
            <BuildForm
              initial={{ ...editingBuild, characterId: formData.id }}
              onCancel={() => { setBuildModalOpen(false); setEditingBuild(null); }}
              onSave={handleSaveBuild}
              characterWeaponType={formData.weaponType}
              characterId={formData.id}
            />
          </div>
        </div>
      )}

      {/* Модальное окно для рекомендаций */}
      {recommendationModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-neutral-900 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4 text-white">
              {editingRecommendation ? "Редактировать рекомендацию" : "Добавить рекомендацию"}
            </h2>
            <RecommendationForm
              initial={editingRecommendation}
              onCancel={() => { 
                setRecommendationModalOpen(false); 
                setEditingRecommendation(null); 
              }}
              onSave={handleSaveRecommendation}
              characterWeaponType={formData.weaponType}
              characterId={formData.id || ''}
            />
          </div>
        </div>
      )}
    </div>
  );
} 