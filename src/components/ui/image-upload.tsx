'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from './button';

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  accept?: string;
  uploadType?: string; // Добавляем параметр для указания типа загрузки
}

export default function ImageUpload({
  value,
  onChange,
  placeholder = 'Загрузить изображение',
  className = '',
  accept = 'image/*',
  uploadType = 'news' // По умолчанию news
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение');
      return;
    }

    // Проверяем размер файла (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Размер файла не должен превышать 5MB');
      return;
    }

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append('image', file);
      formData.append('uploadType', uploadType); // Добавляем uploadType в FormData

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Ошибка загрузки: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.url) {
        // Обновляем состояние с новым URL изображения
        onChange(data.url);
        
        // Очищаем input для возможности повторной загрузки того же файла
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        throw new Error('Неверный ответ от сервера');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(`Ошибка при загрузке изображения: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemoveImage = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
      />

      {value ? (
        <div className="space-y-2">
          <div 
            className="relative"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <img
              src={value}
              alt="Preview"
              className="w-32 h-32 object-cover rounded-lg border border-neutral-600"
            />
            <div className={`absolute inset-0 bg-black/50 transition-opacity rounded-lg flex items-center justify-center ${
              isDragging ? 'opacity-100' : 'opacity-0 hover:opacity-100'
            }`}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={openFileDialog}
                disabled={isUploading}
                className="bg-white/90 hover:bg-white text-black border-white"
              >
                {isUploading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                ) : isDragging ? (
                  'Отпустите для замены'
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Заменить
                  </>
                )}
              </Button>
            </div>
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging
              ? 'border-purple-500 bg-purple-50/10'
              : 'border-neutral-600 hover:border-neutral-500'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center space-y-3">
            <div className="w-12 h-12 bg-neutral-700 rounded-full flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-neutral-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-300 font-medium">
                {isDragging ? 'Отпустите файл здесь' : placeholder}
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                Перетащите изображение или нажмите для выбора
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openFileDialog}
              disabled={isUploading}
              className="mt-2"
            >
              {isUploading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              {isUploading ? 'Загружаем...' : 'Выбрать файл'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
