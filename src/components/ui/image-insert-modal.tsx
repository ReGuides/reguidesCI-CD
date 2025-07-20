'use client';

import { useState } from 'react';
import { X, Upload, Image as ImageIcon, AlignLeft, AlignRight, AlignCenter, Grid3X3 } from 'lucide-react';
import { useRef } from 'react';
import Image from 'next/image';

interface ImageInsertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (markdown: string) => void;
  initialMode?: 'single' | 'carousel';
}

export default function ImageInsertModal({ isOpen, onClose, onInsert, initialMode = 'single' }: ImageInsertModalProps) {
  const [imageUrl, setImageUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('center');
  const [width, setWidth] = useState('300');
  const [isCarousel, setIsCarousel] = useState(initialMode === 'carousel');
  const [carouselImages, setCarouselImages] = useState<Array<{ url: string; alt: string }>>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };
  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setImageUrl(data.url);
      } else {
        setUploadError(data.error || 'Ошибка загрузки');
      }
    } catch {
      setUploadError('Ошибка загрузки');
    } finally {
      setUploading(false);
    }
  };
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleInsert = () => {
    if (!imageUrl.trim()) return;

    let markdown = '';

    if (isCarousel && carouselImages.length > 0) {
      // Создаем карусель изображений
      markdown = '\n<div class="image-carousel">\n';
      carouselImages.forEach((img, index) => {
        markdown += `![${img.alt || `Изображение ${index + 1}`}](${img.url})\n`;
      });
      markdown += '</div>\n';
    } else {
      // Одиночное изображение с обтеканием
      const alignClass = alignment === 'left' ? 'float-left' : 
                        alignment === 'right' ? 'float-right' : 'mx-auto';
      
      markdown = `\n<div class="image-container ${alignClass}" style="width: ${width}px;">\n`;
      markdown += `![${altText || 'Изображение'}](${imageUrl})\n`;
      markdown += '</div>\n';
    }

    onInsert(markdown);
    handleClose();
  };

  const handleClose = () => {
    setImageUrl('');
    setAltText('');
    setAlignment('center');
    setWidth('300');
    setIsCarousel(false);
    setCarouselImages([]);
    onClose();
  };

  const addCarouselImage = () => {
    if (imageUrl.trim()) {
      setCarouselImages([...carouselImages, { url: imageUrl, alt: altText }]);
      setImageUrl('');
      setAltText('');
    }
  };

  const removeCarouselImage = (index: number) => {
    setCarouselImages(carouselImages.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-neutral-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Вставка изображения
          </h3>
          <button
            onClick={handleClose}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Тип вставки */}
          <div className="flex gap-2">
            <button
              onClick={() => setIsCarousel(false)}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                !isCarousel 
                  ? 'bg-accent text-white' 
                  : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
              }`}
            >
              Одиночное изображение
            </button>
            <button
              onClick={() => setIsCarousel(true)}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                isCarousel 
                  ? 'bg-accent text-white' 
                  : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
              }`}
            >
              <Grid3X3 className="w-4 h-4 inline mr-1" />
              Карусель изображений
            </button>
          </div>

          {!isCarousel ? (
            /* Одиночное изображение */
            <>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  URL изображения или загрузите файл
                </label>
                <div
                  className={`relative border-2 border-dashed rounded-lg p-3 mb-2 transition-colors ${dragActive ? 'border-accent bg-neutral-700' : 'border-neutral-600 bg-neutral-700/50'}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{ cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.6 : 1 }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileInput}
                    disabled={uploading}
                  />
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-xs text-neutral-400">Перетащите файл сюда или кликните для выбора</span>
                    {uploading && <span className="text-xs text-accent">Загрузка...</span>}
                    {uploadError && <span className="text-xs text-red-400">{uploadError}</span>}
                    {imageUrl && imageUrl.startsWith('/uploads/') && (
                      <Image src={imageUrl} alt="preview" width={128} height={128} className="max-h-32 rounded mt-2" />
                    )}
                  </div>
                </div>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent"
                  disabled={uploading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Альтернативный текст
                </label>
                <input
                  type="text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Описание изображения"
                  className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Выравнивание
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setAlignment('left')}
                    className={`p-2 rounded transition-colors ${
                      alignment === 'left' 
                        ? 'bg-accent text-white' 
                        : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                    }`}
                    title="По левому краю"
                  >
                    <AlignLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setAlignment('center')}
                    className={`p-2 rounded transition-colors ${
                      alignment === 'center' 
                        ? 'bg-accent text-white' 
                        : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                    }`}
                    title="По центру"
                  >
                    <AlignCenter className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setAlignment('right')}
                    className={`p-2 rounded transition-colors ${
                      alignment === 'right' 
                        ? 'bg-accent text-white' 
                        : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                    }`}
                    title="По правому краю"
                  >
                    <AlignRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Ширина (px)
                </label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  min="100"
                  max="800"
                  className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </>
          ) : (
            /* Карусель изображений */
            <>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  URL изображения
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <button
                    onClick={addCarouselImage}
                    disabled={!imageUrl.trim()}
                    className="px-4 py-2 bg-accent text-white rounded hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Альтернативный текст
                </label>
                <input
                  type="text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Описание изображения"
                  className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              {/* Список изображений в карусели */}
              {carouselImages.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Изображения в карусели ({carouselImages.length})
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {carouselImages.map((image, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-neutral-700 rounded">
                        <Image src={image.url} alt={image.alt || `Изображение ${index + 1}`} width={64} height={64} className="w-16 h-16 object-cover rounded" />
                        <span className="flex-1 text-sm text-neutral-300 truncate">
                          {image.alt || `Изображение ${index + 1}`}
                        </span>
                        <button
                          onClick={() => removeCarouselImage(index)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex gap-2 mt-6 pt-4 border-t border-neutral-700">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-neutral-700 text-neutral-300 rounded hover:bg-neutral-600 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleInsert}
            disabled={!imageUrl.trim() && carouselImages.length === 0}
            className="px-4 py-2 bg-accent text-white rounded hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ml-auto"
          >
            Вставить
          </button>
        </div>
      </div>
    </div>
  );
} 