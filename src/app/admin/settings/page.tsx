'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { 
  Settings, 
  Save, 
  Globe, 
  Shield, 
  Users,
  FileText,
  Bell,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface SiteSettings {
  _id?: string;
  siteName: string;
  siteDescription: string;
  logo?: string;
  favicon?: string;
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    googleAnalyticsId?: string;
    metaKeywords?: string;
  };
  social: {
    telegram?: string;
    discord?: string;
    twitter?: string;
    youtube?: string;
    vk?: string;
  };
  features: {
    r34Mode: boolean;
    maintenanceMode: boolean;
    registrationEnabled: boolean;
    commentsEnabled: boolean;
    searchEnabled: boolean;
  };
  content: {
    maxCharactersPerPage: number;
    maxWeaponsPerPage: number;
    maxArtifactsPerPage: number;
    enableCharacterBuilds: boolean;
    enableWeaponComparison: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    birthdayReminders: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'ReGuides',
    siteDescription: 'Лучшие гайды по Genshin Impact',
    logo: '/images/logos/logo.png',
    favicon: '/favicon.ico',
    seo: {
      defaultTitle: 'ReGuides - Гайды по Genshin Impact',
      defaultDescription: 'Подробные гайды по персонажам, оружию и артефактам Genshin Impact',
      googleAnalyticsId: '',
      metaKeywords: 'genshin impact, гайды, персонажи, оружие, артефакты'
    },
    social: {},
    features: {
      r34Mode: false,
      maintenanceMode: false,
      registrationEnabled: true,
      commentsEnabled: true,
      searchEnabled: true
    },
    content: {
      maxCharactersPerPage: 20,
      maxWeaponsPerPage: 24,
      maxArtifactsPerPage: 24,
      enableCharacterBuilds: true,
      enableWeaponComparison: true
    },
    notifications: {
      emailNotifications: false,
      pushNotifications: true,
      birthdayReminders: true
    }
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

  const handleInputChange = (section: keyof SiteSettings, field: string, value: string | boolean | number) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as Record<string, unknown>),
        [field]: value
      }
    }));
  };

  const ToggleButton = ({ 
    enabled, 
    onToggle, 
    label, 
    description 
  }: { 
    enabled: boolean; 
    onToggle: () => void; 
    label: string; 
    description: string; 
  }) => (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-white text-sm">{label}</p>
        <p className="text-gray-400 text-xs">{description}</p>
      </div>
      <Button
        variant={enabled ? "default" : "outline"}
        size="sm"
        onClick={onToggle}
        className={enabled ? "bg-green-600 hover:bg-green-700" : ""}
      >
        {enabled ? (
          <>
            <CheckCircle className="w-4 h-4 mr-1" />
            Включено
          </>
        ) : (
          <>
            <XCircle className="w-4 h-4 mr-1" />
            Выключено
          </>
        )}
      </Button>
    </div>
  );

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
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Favicon URL</label>
              <Input
                value={settings.favicon || ''}
                onChange={(e) => setSettings(prev => ({ ...prev, favicon: e.target.value }))}
                className="bg-neutral-700 border-neutral-600 text-white"
                placeholder="/favicon.ico"
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
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Meta Keywords</label>
              <Input
                value={settings.seo.metaKeywords || ''}
                onChange={(e) => handleInputChange('seo', 'metaKeywords', e.target.value)}
                className="bg-neutral-700 border-neutral-600 text-white"
                placeholder="genshin impact, гайды, персонажи"
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
            <div>
              <label className="text-sm text-gray-400 mb-2 block">YouTube</label>
              <Input
                value={settings.social.youtube || ''}
                onChange={(e) => handleInputChange('social', 'youtube', e.target.value)}
                className="bg-neutral-700 border-neutral-600 text-white"
                placeholder="https://youtube.com/..."
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">VK</label>
              <Input
                value={settings.social.vk || ''}
                onChange={(e) => handleInputChange('social', 'vk', e.target.value)}
                className="bg-neutral-700 border-neutral-600 text-white"
                placeholder="https://vk.com/..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Функции сайта */}
        <Card className="bg-neutral-800 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Функции сайта
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ToggleButton
              enabled={settings.features.r34Mode}
              onToggle={() => handleInputChange('features', 'r34Mode', !settings.features.r34Mode)}
              label="Режим R34"
              description="Показывать контент для взрослых"
            />
            
            <ToggleButton
              enabled={settings.features.maintenanceMode}
              onToggle={() => handleInputChange('features', 'maintenanceMode', !settings.features.maintenanceMode)}
              label="Режим обслуживания"
              description="Временно отключить сайт"
            />
            
            <ToggleButton
              enabled={settings.features.registrationEnabled}
              onToggle={() => handleInputChange('features', 'registrationEnabled', !settings.features.registrationEnabled)}
              label="Регистрация пользователей"
              description="Разрешить регистрацию новых пользователей"
            />

            <ToggleButton
              enabled={settings.features.commentsEnabled}
              onToggle={() => handleInputChange('features', 'commentsEnabled', !settings.features.commentsEnabled)}
              label="Комментарии"
              description="Разрешить комментарии на сайте"
            />

            <ToggleButton
              enabled={settings.features.searchEnabled}
              onToggle={() => handleInputChange('features', 'searchEnabled', !settings.features.searchEnabled)}
              label="Поиск"
              description="Включить поиск по сайту"
            />
          </CardContent>
        </Card>

        {/* Настройки контента */}
        <Card className="bg-neutral-800 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Настройки контента
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Персонажей на странице</label>
              <Input
                type="number"
                value={settings.content.maxCharactersPerPage}
                onChange={(e) => handleInputChange('content', 'maxCharactersPerPage', parseInt(e.target.value))}
                className="bg-neutral-700 border-neutral-600 text-white"
                min="1"
                max="100"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Оружия на странице</label>
              <Input
                type="number"
                value={settings.content.maxWeaponsPerPage}
                onChange={(e) => handleInputChange('content', 'maxWeaponsPerPage', parseInt(e.target.value))}
                className="bg-neutral-700 border-neutral-600 text-white"
                min="1"
                max="100"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Артефактов на странице</label>
              <Input
                type="number"
                value={settings.content.maxArtifactsPerPage}
                onChange={(e) => handleInputChange('content', 'maxArtifactsPerPage', parseInt(e.target.value))}
                className="bg-neutral-700 border-neutral-600 text-white"
                min="1"
                max="100"
              />
            </div>

            <ToggleButton
              enabled={settings.content.enableCharacterBuilds}
              onToggle={() => handleInputChange('content', 'enableCharacterBuilds', !settings.content.enableCharacterBuilds)}
              label="Сборки персонажей"
              description="Включить систему сборок персонажей"
            />

            <ToggleButton
              enabled={settings.content.enableWeaponComparison}
              onToggle={() => handleInputChange('content', 'enableWeaponComparison', !settings.content.enableWeaponComparison)}
              label="Сравнение оружия"
              description="Включить сравнение оружия"
            />
          </CardContent>
        </Card>

        {/* Настройки уведомлений */}
        <Card className="bg-neutral-800 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Настройки уведомлений
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ToggleButton
              enabled={settings.notifications.emailNotifications}
              onToggle={() => handleInputChange('notifications', 'emailNotifications', !settings.notifications.emailNotifications)}
              label="Email уведомления"
              description="Отправлять уведомления на email"
            />

            <ToggleButton
              enabled={settings.notifications.pushNotifications}
              onToggle={() => handleInputChange('notifications', 'pushNotifications', !settings.notifications.pushNotifications)}
              label="Push уведомления"
              description="Показывать push уведомления"
            />

            <ToggleButton
              enabled={settings.notifications.birthdayReminders}
              onToggle={() => handleInputChange('notifications', 'birthdayReminders', !settings.notifications.birthdayReminders)}
              label="Напоминания о днях рождения"
              description="Уведомлять о днях рождения персонажей"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 