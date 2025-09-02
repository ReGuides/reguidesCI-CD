'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Save, 
  ArrowLeft,
  Upload,
  X,
  Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface AdvertisementForm {
  title: string;
  description: string;
  cta: string;
  url: string;
  type: string;
  isActive: boolean;
  order: number;
  backgroundImage?: string;
  erid?: string;
  deviceTargeting: string;
  // Новые поля для внешних рекламных сервисов
  adService: 'yandex_direct' | 'google_ads' | 'custom';
  adServiceCode?: string;
  adServiceId?: string;
  // Дополнительные настройки
  maxImpressions?: number;
  startDate?: string;
  endDate?: string;
}

export default function AddAdvertisementPage() {
  const router = useRouter();
  const [form, setForm] = useState<AdvertisementForm>({
    title: '',
    description: '',
    cta: '',
    url: '',
    type: 'sidebar',
    isActive: true,
    order: 0,
    backgroundImage: '',
    erid: '',
    deviceTargeting: 'all',
    adService: 'custom',
    adServiceCode: '',
    adServiceId: '',
    maxImpressions: undefined,
    startDate: '',
    endDate: ''
  });
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title || !form.description || !form.cta || !form.url || !form.type || !form.deviceTargeting) {
      setMessage({ type: 'error', text: 'Пожалуйста, заполните все обязательные поля' });
      return;
    }

    try {
      setSaving(true);
      setMessage(null);

      const response = await fetch('/api/advertisements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setMessage({ type: 'success', text: 'Реклама успешно создана!' });
          setTimeout(() => {
            router.push('/admin/advertisements');
          }, 1500);
        } else {
          setMessage({ type: 'error', text: result.error || 'Ошибка при создании рекламы' });
        }
      } else {
        setMessage({ type: 'error', text: 'Ошибка при создании рекламы' });
      }
    } catch (error) {
      console.error('Error creating advertisement:', error);
      setMessage({ type: 'error', text: 'Ошибка при создании рекламы' });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      setUploadingImage(true);
      setMessage(null); // Сбрасываем предыдущие сообщения
      
      console.log('📤 Starting image upload:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'advertisement');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      console.log('📥 Upload response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('📥 Upload response data:', result);
        
        if (result.success) {
          setForm(prev => ({
            ...prev,
            backgroundImage: result.url
          }));
          setMessage({ type: 'success', text: 'Изображение успешно загружено!' });
          console.log('✅ Image uploaded successfully:', result.url);
        } else {
          console.error('❌ Upload failed:', result.error);
          setMessage({ type: 'error', text: `Ошибка при загрузке изображения: ${result.error}` });
        }
      } else {
        const errorText = await response.text();
        console.error('❌ Upload HTTP error:', response.status, errorText);
        setMessage({ type: 'error', text: `Ошибка HTTP ${response.status}: ${errorText}` });
      }
    } catch (error) {
      console.error('❌ Upload exception:', error);
      setMessage({ type: 'error', text: `Ошибка при загрузке изображения: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}` });
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
    setForm(prev => ({
      ...prev,
      backgroundImage: ''
    }));
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/advertisements">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">Добавить рекламу</h1>
          <p className="text-gray-400">Создание нового рекламного блока</p>
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-900/20 border border-green-700 text-green-400' 
            : 'bg-red-900/20 border border-red-700 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Основная информация */}
          <Card className="bg-neutral-800 border-neutral-700">
            <CardHeader>
              <CardTitle className="text-white">Основная информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Название *</label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  className="bg-neutral-700 border-neutral-600 text-white"
                  placeholder="Введите название рекламы"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Описание *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-neutral-700 border border-neutral-600 text-white rounded-md px-3 py-2 min-h-[100px] resize-y"
                  placeholder="Введите описание рекламы"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Призыв к действию (CTA) *</label>
                <Input
                  value={form.cta}
                  onChange={(e) => setForm(prev => ({ ...prev, cta: e.target.value }))}
                  className="bg-neutral-700 border-neutral-600 text-white"
                  placeholder="Например: Купить сейчас, Узнать больше"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">URL *</label>
                <Input
                  value={form.url}
                  onChange={(e) => setForm(prev => ({ ...prev, url: e.target.value }))}
                  className="bg-neutral-700 border-neutral-600 text-white"
                  placeholder="https://example.com"
                  type="url"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Настройки */}
          <Card className="bg-neutral-800 border-neutral-700">
            <CardHeader>
              <CardTitle className="text-white">Настройки</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Тип *</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full bg-neutral-700 border border-neutral-600 text-white rounded-md px-3 py-2"
                  required
                >
                  <option value="sidebar">Сайдбар</option>
                  <option value="banner">Баннер</option>
                  <option value="popup">Всплывающее окно</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Устройства *</label>
                <select
                  value={form.deviceTargeting}
                  onChange={(e) => setForm(prev => ({ ...prev, deviceTargeting: e.target.value }))}
                  className="w-full bg-neutral-700 border border-neutral-600 text-white rounded-md px-3 py-2"
                  required
                >
                  <option value="all">Все устройства</option>
                  <option value="desktop">Только ПК</option>
                  <option value="mobile">Только мобильные</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Порядок</label>
                <Input
                  value={form.order}
                  onChange={(e) => setForm(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                  className="bg-neutral-700 border-neutral-600 text-white"
                  type="number"
                  min="0"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">ERID (опционально)</label>
                <Input
                  value={form.erid}
                  onChange={(e) => setForm(prev => ({ ...prev, erid: e.target.value }))}
                  className="bg-neutral-700 border-neutral-600 text-white"
                  placeholder="Введите ERID"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 text-purple-600 bg-neutral-700 border-neutral-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="isActive" className="text-sm text-gray-400">
                  Активна
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Внешние рекламные сервисы */}
          <Card className="bg-neutral-800 border-neutral-700">
            <CardHeader>
              <CardTitle className="text-white">Внешние рекламные сервисы</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Сервис</label>
                <select
                  value={form.adService}
                  onChange={(e) => setForm(prev => ({ ...prev, adService: e.target.value as 'yandex_direct' | 'google_ads' | 'custom' }))}
                  className="w-full bg-neutral-700 border border-neutral-600 text-white rounded-md px-3 py-2"
                >
                  <option value="custom">Собственная реклама</option>
                  <option value="yandex_direct">Яндекс.Директ</option>
                  <option value="google_ads">Google Ads</option>
                </select>
              </div>

              {form.adService !== 'custom' && (
                <>
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">ID рекламы в сервисе</label>
                    <Input
                      value={form.adServiceId || ''}
                      onChange={(e) => setForm(prev => ({ ...prev, adServiceId: e.target.value }))}
                      className="bg-neutral-700 border-neutral-600 text-white"
                      placeholder="Введите ID рекламы"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">HTML код от сервиса</label>
                    <textarea
                      value={form.adServiceCode || ''}
                      onChange={(e) => setForm(prev => ({ ...prev, adServiceCode: e.target.value }))}
                      className="w-full bg-neutral-700 border border-neutral-600 text-white rounded-md px-3 py-2 h-32 resize-none"
                      placeholder="Вставьте HTML код от рекламного сервиса"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Дополнительные настройки */}
          <Card className="bg-neutral-800 border-neutral-700">
            <CardHeader>
              <CardTitle className="text-white">Дополнительные настройки</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Максимальное количество показов</label>
                <Input
                  type="number"
                  value={form.maxImpressions || ''}
                  onChange={(e) => setForm(prev => ({ ...prev, maxImpressions: e.target.value ? parseInt(e.target.value) : undefined }))}
                  className="bg-neutral-700 border-neutral-600 text-white"
                  placeholder="Неограниченно"
                  min="1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Дата начала показа</label>
                  <Input
                    type="date"
                    value={form.startDate || ''}
                    onChange={(e) => setForm(prev => ({ ...prev, startDate: e.target.value }))}
                    className="bg-neutral-700 border-neutral-600 text-white"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Дата окончания показа</label>
                  <Input
                    type="date"
                    value={form.endDate || ''}
                    onChange={(e) => setForm(prev => ({ ...prev, endDate: e.target.value }))}
                    className="bg-neutral-700 border-neutral-600 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Изображение */}
        <Card className="bg-neutral-800 border-neutral-700 mt-6">
          <CardHeader>
            <CardTitle className="text-white">Фоновое изображение</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                {form.backgroundImage ? (
                  <div className="relative">
                    <Image
                      src={form.backgroundImage}
                      alt="Фоновое изображение"
                      width={120}
                      height={120}
                      className="rounded-lg object-cover"
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
                ) : (
                  <div className="w-30 h-30 bg-neutral-700 rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-neutral-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
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
                  disabled={uploadingImage}
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploadingImage ? 'Загрузка...' : 'Загрузить изображение'}
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  Поддерживаемые форматы: JPEG, PNG, WebP, SVG
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Кнопки действий */}
        <div className="flex justify-end gap-4 mt-6">
          <Link href="/admin/advertisements">
            <Button type="button" variant="outline">
              Отмена
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={saving}
            className="!bg-purple-600 !hover:bg-purple-700 !text-white border-0"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>
      </form>
    </div>
  );
}
