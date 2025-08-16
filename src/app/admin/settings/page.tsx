'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { 
  Save, 
  Globe,
  Upload,
  X
} from 'lucide-react';
import Image from 'next/image';

interface SiteSettings {
  _id?: string;
  siteName: string;
  logo?: string;
  favicon?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'ReGuides',
    logo: '/images/logos/logo.png',
    favicon: '/favicon.ico'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSettings(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage({ type: 'error', text: 'Ошибка при загрузке настроек' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);
      
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setMessage({ type: 'success', text: 'Настройки успешно сохранены!' });
        } else {
          setMessage({ type: 'error', text: 'Ошибка при сохранении настроек' });
        }
      } else {
        setMessage({ type: 'error', text: 'Ошибка при сохранении настроек' });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Ошибка при сохранении настроек' });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (type: 'logo' | 'favicon', file: File) => {
    try {
      console.log('Starting upload for:', type, file.name);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      console.log('FormData created:', formData);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      console.log('Upload response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Upload result:', result);
        if (result.success) {
          setSettings(prev => ({
            ...prev,
            [type]: result.url
          }));
          setMessage({ type: 'success', text: `${type === 'logo' ? 'Логотип' : 'Favicon'} успешно загружен!` });
        } else {
          setMessage({ type: 'error', text: 'Ошибка при загрузке изображения' });
        }
      } else {
        const errorText = await response.text();
        console.error('Upload failed:', errorText);
        setMessage({ type: 'error', text: 'Ошибка при загрузке изображения' });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setMessage({ type: 'error', text: 'Ошибка при загрузке изображения' });
    }
  };

  const handleFileSelect = (type: 'logo' | 'favicon', event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File select triggered:', type, event.target.files);
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name, file.type, file.size);
      if (type === 'logo') {
        setUploadingLogo(true);
      } else {
        setUploadingFavicon(true);
      }
      
      handleImageUpload(type, file).finally(() => {
        if (type === 'logo') {
          setUploadingLogo(false);
        } else {
          setUploadingFavicon(false);
        }
      });
    } else {
      console.log('No file selected');
    }
  };

  const removeImage = (type: 'logo' | 'favicon') => {
    setSettings(prev => ({
      ...prev,
      [type]: type === 'logo' ? '/images/logos/logo.png' : '/favicon.ico'
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" className="text-purple-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Настройки сайта</h1>
          <p className="text-gray-400">Основные настройки сайта</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Сохранение...' : 'Сохранить'}
        </Button>
      </div>

      {/* Сообщения */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-900/20 border border-green-700 text-green-400' 
            : 'bg-red-900/20 border border-red-700 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      <div className="max-w-2xl">
        {/* Основные настройки */}
        <Card className="bg-neutral-800 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Основные настройки
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Название сайта</label>
              <Input
                value={settings.siteName}
                onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                className="bg-neutral-700 border-neutral-600 text-white"
                placeholder="Введите название сайта"
              />
            </div>

            {/* Логотип */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Логотип</label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Image
                    src={settings.logo || '/images/logos/logo.png'}
                    alt="Логотип"
                    width={80}
                    height={80}
                    className="rounded-lg object-contain bg-neutral-700"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/logos/logo.png';
                    }}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-red-600 hover:bg-red-700 border-red-600"
                    onClick={() => removeImage('logo')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex-1">
                  <Input
                    value={settings.logo || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, logo: e.target.value }))}
                    className="bg-neutral-700 border-neutral-600 text-white mb-2"
                    placeholder="/images/logo.png"
                  />
                  <div className="flex gap-2">
                    <input
                      type="file"
                      id="logo-upload"
                      accept="image/*"
                      onChange={(e) => handleFileSelect('logo', e)}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploadingLogo}
                      onClick={() => document.getElementById('logo-upload')?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadingLogo ? 'Загрузка...' : 'Загрузить'}
                    </Button>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Поддерживаемые форматы: JPEG, PNG, WebP, SVG</p>
            </div>

            {/* Favicon */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Favicon</label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Image
                    src={settings.favicon || '/favicon.ico'}
                    alt="Favicon"
                    width={32}
                    height={32}
                    className="rounded object-contain bg-neutral-700"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/favicon.ico';
                    }}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-red-600 hover:bg-red-700 border-red-600"
                    onClick={() => removeImage('favicon')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex-1">
                  <Input
                    value={settings.favicon || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, favicon: e.target.value }))}
                    className="bg-neutral-700 border-neutral-600 text-white mb-2"
                    placeholder="/favicon.ico"
                  />
                  <div className="flex gap-2">
                    <input
                      type="file"
                      id="favicon-upload"
                      accept="image/*,.ico"
                      onChange={(e) => handleFileSelect('favicon', e)}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploadingFavicon}
                      onClick={() => document.getElementById('favicon-upload')?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadingFavicon ? 'Загрузка...' : 'Загрузить'}
                    </Button>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Поддерживаемые форматы: JPEG, PNG, WebP, SVG, ICO</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 