'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/ui/loading-spinner';
import AdminNavigation from '@/components/admin/AdminNavigation';
import { 
  Settings, 
  Save, 
  Globe, 
  Shield, 
  Database,
  Bell,
  Palette,
  Users
} from 'lucide-react';

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  logo?: string;
  favicon?: string;
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    googleAnalyticsId?: string;
  };
  social: {
    telegram?: string;
    discord?: string;
    twitter?: string;
  };
  features: {
    r34Mode: boolean;
    maintenanceMode: boolean;
    registrationEnabled: boolean;
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'ReGuides',
    siteDescription: 'Лучшие гайды по Genshin Impact',
    seo: {
      defaultTitle: 'ReGuides - Гайды по Genshin Impact',
      defaultDescription: 'Подробные гайды по персонажам, оружию и артефактам Genshin Impact'
    },
    social: {},
    features: {
      r34Mode: false,
      maintenanceMode: false,
      registrationEnabled: true
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // В будущем здесь будет API для получения настроек
      // Пока используем дефолтные значения
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // В будущем здесь будет API для сохранения настроек
      console.log('Saving settings:', settings);
      // Имитация сохранения
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Настройки сохранены!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Ошибка при сохранении настроек');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (section: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof SiteSettings],
        [field]: value
      }
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
          <p className="text-gray-400">Управление конфигурацией и функциями</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Описание сайта</label>
                <Input
                  value={settings.siteDescription}
                  onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                  className="bg-neutral-700 border-neutral-600 text-white"
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
              </div>
            </CardContent>
          </Card>

          {/* SEO настройки */}
          <Card className="bg-neutral-800 border-neutral-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                SEO настройки
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Заголовок по умолчанию</label>
                <Input
                  value={settings.seo.defaultTitle}
                  onChange={(e) => handleInputChange('seo', 'defaultTitle', e.target.value)}
                  className="bg-neutral-700 border-neutral-600 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Описание по умолчанию</label>
                <Input
                  value={settings.seo.defaultDescription}
                  onChange={(e) => handleInputChange('seo', 'defaultDescription', e.target.value)}
                  className="bg-neutral-700 border-neutral-600 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Google Analytics ID</label>
                <Input
                  value={settings.seo.googleAnalyticsId || ''}
                  onChange={(e) => handleInputChange('seo', 'googleAnalyticsId', e.target.value)}
                  className="bg-neutral-700 border-neutral-600 text-white"
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
            </CardContent>
          </Card>

          {/* Социальные сети */}
          <Card className="bg-neutral-800 border-neutral-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Социальные сети
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Telegram</label>
                <Input
                  value={settings.social.telegram || ''}
                  onChange={(e) => handleInputChange('social', 'telegram', e.target.value)}
                  className="bg-neutral-700 border-neutral-600 text-white"
                  placeholder="@username"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Discord</label>
                <Input
                  value={settings.social.discord || ''}
                  onChange={(e) => handleInputChange('social', 'discord', e.target.value)}
                  className="bg-neutral-700 border-neutral-600 text-white"
                  placeholder="https://discord.gg/..."
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Twitter</label>
                <Input
                  value={settings.social.twitter || ''}
                  onChange={(e) => handleInputChange('social', 'twitter', e.target.value)}
                  className="bg-neutral-700 border-neutral-600 text-white"
                  placeholder="@username"
                />
              </div>
            </CardContent>
          </Card>

          {/* Функции */}
          <Card className="bg-neutral-800 border-neutral-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Функции сайта
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm">Режим R34</p>
                  <p className="text-gray-400 text-xs">Показывать контент для взрослых</p>
                </div>
                <Button
                  variant={settings.features.r34Mode ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleInputChange('features', 'r34Mode', !settings.features.r34Mode)}
                  className={settings.features.r34Mode ? "bg-purple-600" : ""}
                >
                  {settings.features.r34Mode ? "Включено" : "Выключено"}
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm">Режим обслуживания</p>
                  <p className="text-gray-400 text-xs">Временно отключить сайт</p>
                </div>
                <Button
                  variant={settings.features.maintenanceMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleInputChange('features', 'maintenanceMode', !settings.features.maintenanceMode)}
                  className={settings.features.maintenanceMode ? "bg-red-600" : ""}
                >
                  {settings.features.maintenanceMode ? "Включено" : "Выключено"}
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm">Регистрация пользователей</p>
                  <p className="text-gray-400 text-xs">Разрешить регистрацию новых пользователей</p>
                </div>
                <Button
                  variant={settings.features.registrationEnabled ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleInputChange('features', 'registrationEnabled', !settings.features.registrationEnabled)}
                  className={settings.features.registrationEnabled ? "bg-green-600" : ""}
                >
                  {settings.features.registrationEnabled ? "Включено" : "Выключено"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
    </div>
  );
} 