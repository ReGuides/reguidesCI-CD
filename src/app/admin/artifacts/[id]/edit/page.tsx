'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Upload, X } from 'lucide-react';
import Image from 'next/image';

interface ArtifactFormData {
  id: string;
  name: string;
  rarity: number[];
  bonus1: string;
  bonus2: string;
  bonus4: string;
  pieces: number;
  image: string;
}

export default function EditArtifactPage() {
  const router = useRouter();
  const params = useParams();
  const artifactId = params.id as string;
  
  const [formData, setFormData] = useState<ArtifactFormData>({
    id: '',
    name: '',
    rarity: [5],
    bonus1: '',
    bonus2: '',
    bonus4: '',
    pieces: 5,
    image: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const rarityOptions = [
    { value: 3, label: '3★' },
    { value: 4, label: '4★' },
    { value: 5, label: '5★' }
  ];

  const piecesOptions = [
    { value: 1, label: '1 предмет' },
    { value: 2, label: '2 предмета' },
    { value: 4, label: '4 предмета' },
    { value: 5, label: '5 предметов' }
  ];

  const fetchArtifact = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/artifacts/${artifactId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const artifact = data.data || data;
      
      setFormData({
        id: artifact.id || '',
        name: artifact.name || '',
        rarity: Array.isArray(artifact.rarity) ? artifact.rarity : [5],
        bonus1: artifact.bonus1 || '',
        bonus2: artifact.bonus2 || '',
        bonus4: artifact.bonus4 || '',
        pieces: artifact.pieces || 5,
        image: artifact.image || ''
      });
      
      if (artifact.image) {
        setPreviewImage(artifact.image);
      }
    } catch (err) {
      console.error('Error fetching artifact:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [artifactId]);

  useEffect(() => {
    if (artifactId) {
      fetchArtifact();
    }
  }, [artifactId, fetchArtifact]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация обязательных полей
    if (!formData.name || !formData.id || formData.rarity.length === 0 || !formData.pieces) {
      alert('Пожалуйста, заполните обязательные поля: Название, ID, Редкость и Количество предметов');
      return;
    }
    
    setSaving(true);
    
    try {
      console.log('Отправляем данные артефакта:', formData);
      
      const response = await fetch(`/api/artifacts/${artifactId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Артефакт успешно обновлен:', result);
        alert('Артефакт успешно обновлен!');
        router.push('/admin/artifacts');
      } else {
        const errorData = await response.json();
        console.error('Ошибка обновления артефакта:', errorData);
        alert(`Ошибка обновления артефакта: ${errorData.error || 'Неизвестная ошибка'}`);
      }
    } catch (error) {
      console.error('Ошибка при обновлении артефакта:', error);
      alert('Произошла ошибка при обновлении артефакта');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof ArtifactFormData, value: string | number | number[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRarityChange = (rarity: number, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      rarity: checked 
        ? [...prev.rarity, rarity]
        : prev.rarity.filter(r => r !== rarity)
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
      formData.append('type', 'artifacts');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setFormData(prev => ({ ...prev, image: result.fileUrl }));
        setPreviewImage(result.fileUrl);
        alert('Изображение успешно загружено!');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Загрузка артефакта...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-400">
          <h2 className="text-2xl font-bold mb-4">Ошибка загрузки</h2>
          <p>{error}</p>
          <Button
            onClick={() => router.back()}
            className="mt-4 bg-accent hover:bg-accent/80 text-white"
          >
            Назад
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="text-white hover:bg-neutral-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>
        <h1 className="text-3xl font-bold text-white">Редактировать артефакт</h1>
      </div>

      <Card className="max-w-2xl bg-neutral-800 border-neutral-700">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Основная информация */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                ID артефакта *
              </label>
              <Input
                type="text"
                value={formData.id}
                onChange={(e) => handleInputChange('id', e.target.value)}
                placeholder="Например: archaic-petra"
                className="bg-neutral-700 border-neutral-600 text-white"
                required
              />
              <p className="text-xs text-neutral-400 mt-1">
                Только латинские буквы, цифры и дефисы
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Название *
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Название артефакта"
                className="bg-neutral-700 border-neutral-600 text-white"
                required
              />
            </div>
          </div>

          {/* Редкость */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Редкость *
            </label>
            <div className="flex gap-4">
              {rarityOptions.map((option) => (
                <label key={option.value} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.rarity.includes(option.value)}
                    onChange={(e) => handleRarityChange(option.value, e.target.checked)}
                    className="w-4 h-4 text-accent bg-neutral-700 border-neutral-600 rounded focus:ring-accent focus:ring-2"
                  />
                  <span className="text-white">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Количество предметов */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Количество предметов *
            </label>
            <select
              value={formData.pieces}
              onChange={(e) => handleInputChange('pieces', Number(e.target.value))}
              className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent"
              required
            >
              {piecesOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Бонусы */}
          <div className="space-y-4">
            {formData.pieces >= 1 && (
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Бонус 1 предмета
                </label>
                <Textarea
                  value={formData.bonus1}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('bonus1', e.target.value)}
                  placeholder="Описание бонуса за 1 предмет"
                  className="bg-neutral-700 border-neutral-600 text-white min-h-[80px]"
                />
              </div>
            )}
            
            {formData.pieces >= 2 && (
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Бонус 2 предметов
                </label>
                <Textarea
                  value={formData.bonus2}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('bonus2', e.target.value)}
                  placeholder="Описание бонуса за 2 предмета"
                  className="bg-neutral-700 border-neutral-600 text-white min-h-[80px]"
                />
              </div>
            )}

            {formData.pieces >= 4 && (
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Бонус 4 предметов
                </label>
                <Textarea
                  value={formData.bonus4}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('bonus4', e.target.value)}
                  placeholder="Описание бонуса за 4 предмета"
                  className="bg-neutral-700 border-neutral-600 text-white min-h-[80px]"
                />
              </div>
            )}
          </div>

          {/* Загрузка изображения */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Изображение артефакта
            </label>
            
            {previewImage ? (
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
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive ? 'border-accent bg-accent/10' : 'border-neutral-600'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                <p className="text-neutral-400 mb-2">
                  Перетащите изображение сюда или нажмите для выбора
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="inline-flex items-center px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/80 transition-colors cursor-pointer"
                >
                  Выбрать файл
                </label>
                <p className="text-xs text-neutral-500 mt-2">
                  JPEG, PNG, WebP до 5MB
                </p>
              </div>
            )}
            
            {uploading && (
              <p className="text-accent text-sm mt-2">Загрузка изображения...</p>
            )}
          </div>

          {/* Кнопки */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={saving}
              className="flex-1 bg-accent hover:bg-accent/80 text-white"
            >
              {saving ? 'Сохранение...' : 'Сохранить изменения'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1 border-neutral-600 text-white hover:bg-neutral-700"
            >
              Отмена
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
