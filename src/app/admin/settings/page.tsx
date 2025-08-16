'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { 
  Save, 
  Globe
} from 'lucide-react';

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
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Название сайта</label>
              <Input
                value={settings.siteName}
                onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                className="bg-neutral-700 border-neutral-600 text-white"
                placeholder="Введите название сайта"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Логотип URL</label>
              <Input
                value={settings.logo || ''}
                onChange={(e) => setSettings(prev => ({ ...prev, logo: e.target.value }))}
                className="bg-neutral-700 border-neutral-600 text-white"
                placeholder="/images/logo.png"
              />
              <p className="text-xs text-gray-500 mt-1">Путь к изображению логотипа</p>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Favicon URL</label>
              <Input
                value={settings.favicon || ''}
                onChange={(e) => setSettings(prev => ({ ...prev, favicon: e.target.value }))}
                className="bg-neutral-700 border-neutral-600 text-white"
                placeholder="/favicon.ico"
              />
              <p className="text-xs text-gray-500 mt-1">Путь к иконке сайта</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 