'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Weapon } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Save, Upload, X, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import LoadingSpinner from '@/components/ui/loading-spinner';
import Image from 'next/image';

interface EditWeaponPageProps {
  params: Promise<{ id: string }>;
}

export default function EditWeaponPage({ params }: EditWeaponPageProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [weaponId, setWeaponId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [formData, setFormData] = useState<Partial<Weapon>>({
    name: '',
    id: '',
    type: 'Sword',
    rarity: 4,
    baseAttack: '',
    subStatName: '',
    subStatValue: '',
    passiveName: '',
    passiveEffect: '',
    image: ''
  });

  const weaponTypes = [
    { value: 'Одноручный меч', label: 'Одноручный меч' },
    { value: 'Двуручный меч', label: 'Двуручный меч' },
    { value: 'Копьё', label: 'Копьё' },
    { value: 'Стрелковое', label: 'Стрелковое' },
    { value: 'Катализатор', label: 'Катализатор' }
  ];

  const rarityOptions = [
    { value: 3, label: '3★' },
    { value: 4, label: '4★' },
    { value: 5, label: '5★' }
  ];

  useEffect(() => {
    const loadWeapon = async () => {
      setLoading(true);
      try {
        const { id } = await params;
        setWeaponId(id);
        
        const response = await fetch(`/api/weapons/${id}`);
        if (response.ok) {
          const weapon = await response.json();
          console.log('Загруженное оружие из БД:', weapon);
          
          // Убеждаемся, что все поля присутствуют
          const processedData = {
            name: weapon.name || '',
            id: weapon.id || '',
            type: weapon.type || 'Sword',
            rarity: weapon.rarity || 4,
            baseAttack: weapon.baseAttack !== undefined && weapon.baseAttack !== null ? weapon.baseAttack.toString() : '',
            subStatName: weapon.subStatName || '',
            subStatValue: weapon.subStatValue !== undefined && weapon.subStatValue !== null ? weapon.subStatValue.toString() : '',
            passiveName: weapon.passiveName || '',
            passiveEffect: weapon.passiveEffect || '',
            image: weapon.image || ''
          };
          
          console.log('Обработанные данные для формы:', processedData);
          setFormData(processedData);
          if (weapon.image) {
            setPreviewImage(weapon.image);
          }
        } else {
          let errorMessage = 'Ошибка загрузки оружия';
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (jsonError) {
            console.error('Ошибка парсинга JSON ответа:', jsonError);
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }
          console.error('Failed to load weapon:', errorMessage);
          alert(errorMessage);
        }
      } catch (error) {
        console.error('Error loading weapon:', error);
        alert('Произошла ошибка при загрузке оружия');
      } finally {
        setLoading(false);
      }
    };

    loadWeapon();
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация обязательных полей
    if (!formData.name || !formData.type || !formData.rarity) {
      alert('Пожалуйста, заполните обязательные поля: Название, Тип и Редкость');
      return;
    }
    
    setSaving(true);
    
    try {
      // Подготавливаем данные для отправки
      const submitData = {
        ...formData,
        baseAttack: formData.baseAttack || '',
        subStatValue: formData.subStatValue || '',
        rarity: Number(formData.rarity)
      };
      
      console.log('Исходные данные формы:', formData);
      console.log('Отправляем данные оружия для обновления:', submitData);
      
      const response = await fetch(`/api/weapons/${weaponId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Оружие успешно обновлено:', result);
        alert('Оружие успешно обновлено!');
        router.push('/admin/weapons');
      } else {
        let errorMessage = 'Неизвестная ошибка';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          console.error('Ошибка парсинга JSON ответа:', jsonError);
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        console.error('Ошибка обновления оружия:', errorMessage);
        alert(`Ошибка обновления оружия: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Ошибка при обновлении оружия:', error);
      alert('Произошла ошибка при обновлении оружия');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof Weapon, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Проверяем тип файла
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Неподдерживаемый тип файла. Разрешены только JPEG, PNG и WebP.');
      return;
    }

    // Проверяем размер файла (максимум 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('Файл слишком большой. Максимальный размер: 5MB.');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'weapons');

      const response = await fetch('/api/admin/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setFormData(prev => ({ ...prev, image: result.data.url }));
          setPreviewImage(result.data.url);
          alert('Изображение успешно загружено!');
        } else {
          alert(`Ошибка загрузки: ${result.error || 'Неизвестная ошибка'}`);
        }
      } else {
        const errorData = await response.json();
        alert(`Ошибка загрузки: ${errorData.error || 'Неизвестная ошибка'}`);
      }
    } catch (error) {
      console.error('Ошибка при загрузке файла:', error);
      alert('Произошла ошибка при загрузке файла');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: '' }));
    setPreviewImage('');
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" className="text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Навигация назад */}
        <div className="mb-6">
          <Link
            href="/admin/weapons"
            className="inline-flex items-center gap-2 text-accent hover:text-accent-dark transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Вернуться к оружию
          </Link>
        </div>

        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Редактировать оружие</h1>
          <p className="text-gray-400 mt-2">Измените информацию об оружии</p>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Основная информация */}
            <Card className="p-6 bg-neutral-800 border border-neutral-700">
              <h2 className="text-xl font-semibold text-white mb-4">Основная информация</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Название оружия *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Введите название оружия"
                    className="bg-neutral-700 border-neutral-600 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ID оружия
                  </label>
                  <Input
                    value={formData.id}
                    disabled
                    className="bg-neutral-600 border-neutral-500 text-gray-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">ID нельзя изменить</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Тип оружия *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md text-white"
                    required
                  >
                    {weaponTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Редкость *
                  </label>
                  <select
                    value={formData.rarity}
                    onChange={(e) => handleInputChange('rarity', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md text-white"
                    required
                  >
                    {rarityOptions.map(rarity => (
                      <option key={rarity.value} value={rarity.value}>
                        {rarity.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>

            {/* Характеристики */}
            <Card className="p-6 bg-neutral-800 border border-neutral-700">
              <h2 className="text-xl font-semibold text-white mb-4">Характеристики</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Базовая атака
                  </label>
                  <Input
                    value={formData.baseAttack}
                    onChange={(e) => handleInputChange('baseAttack', e.target.value)}
                    placeholder="Например: 510"
                    className="bg-neutral-700 border-neutral-600 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Название дополнительной характеристики
                  </label>
                  <Input
                    value={formData.subStatName}
                    onChange={(e) => handleInputChange('subStatName', e.target.value)}
                    placeholder="Например: Крит. урон"
                    className="bg-neutral-700 border-neutral-600 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Значение дополнительной характеристики
                  </label>
                  <Input
                    value={formData.subStatValue}
                    onChange={(e) => handleInputChange('subStatValue', e.target.value)}
                    placeholder="Например: 33.1%"
                    className="bg-neutral-700 border-neutral-600 text-white"
                  />
                </div>
              </div>
            </Card>

            {/* Пассивные способности */}
            <Card className="p-6 bg-neutral-800 border border-neutral-700 md:col-span-2">
              <h2 className="text-xl font-semibold text-white mb-4">Пассивные способности</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Название пассивной способности
                  </label>
                  <Input
                    value={formData.passiveName}
                    onChange={(e) => handleInputChange('passiveName', e.target.value)}
                    placeholder="Введите название пассивной способности"
                    className="bg-neutral-700 border-neutral-600 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Описание пассивной способности
                  </label>
                  <textarea
                    value={formData.passiveEffect}
                    onChange={(e) => handleInputChange('passiveEffect', e.target.value)}
                    placeholder="Опишите эффект пассивной способности"
                    rows={4}
                    className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md text-white resize-none"
                  />
                </div>
              </div>
            </Card>

            {/* Изображение */}
            <Card className="p-6 bg-neutral-800 border border-neutral-700 md:col-span-2">
              <h2 className="text-xl font-semibold text-white mb-4">Изображение</h2>
              
              <div className="space-y-4">
                {/* URL изображения */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    URL изображения
                  </label>
                  <Input
                    value={formData.image}
                    onChange={(e) => handleInputChange('image', e.target.value)}
                    placeholder="Введите URL изображения или загрузите файл"
                    className="bg-neutral-700 border-neutral-600 text-white"
                  />
                </div>

                {/* Загрузка файла */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Загрузить изображение
                  </label>
                  
                  {/* Скрытый input для файлов */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {/* Drag & Drop зона */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      dragActive 
                        ? 'border-accent bg-accent/10' 
                        : 'border-neutral-600 hover:border-neutral-500'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {previewImage ? (
                      <div className="space-y-4">
                        <div className="relative inline-block">
                          <Image
                            src={previewImage}
                            alt="Preview"
                            width={128}
                            height={128}
                            className="w-32 h-32 object-cover rounded-lg border border-neutral-600"
                          />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-400">
                          Изображение загружено успешно
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <ImageIcon className="w-12 h-12 text-neutral-400 mx-auto" />
                        <div>
                          <p className="text-white font-medium">
                            Перетащите изображение сюда или
                          </p>
                          <button
                            type="button"
                            onClick={openFileDialog}
                            className="text-accent hover:text-accent-dark font-medium"
                          >
                            выберите файл
                          </button>
                        </div>
                        <p className="text-sm text-gray-400">
                          Поддерживаются: JPEG, PNG, WebP (максимум 5MB)
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Кнопка загрузки */}
                  <div className="mt-4 flex gap-2">
                    <Button
                      type="button"
                      onClick={openFileDialog}
                      disabled={uploading}
                      variant="outline"
                      className="px-4 py-2 border-neutral-600 text-gray-300 hover:bg-neutral-700"
                    >
                      {uploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin mr-2" />
                          Загрузка...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Выбрать файл
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Кнопки действий */}
          <div className="flex justify-end gap-4 mt-8">
            <Link href="/admin/weapons">
              <Button
                type="button"
                variant="outline"
                className="px-6 py-2 border-neutral-600 text-gray-300 hover:bg-neutral-700"
              >
                Отмена
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-accent hover:bg-accent-dark text-white"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Сохранить изменения
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
