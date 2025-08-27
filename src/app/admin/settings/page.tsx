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
  Plus,
  Trash2,
  MoveUp,
  MoveDown
} from 'lucide-react';
import Image from 'next/image';
import { TeamMember, ISiteSettings } from '@/models/SiteSettings';

// Интерфейс для состояния компонента (с опциональными полями)
interface SettingsState extends Omit<ISiteSettings, 'createdAt' | 'updatedAt'> {
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>({
    siteName: 'ReGuides',
    logo: '/images/logos/logo.png',
    favicon: '/favicon.ico',
    team: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);

  // Функция для принудительного обновления настроек
  const refreshSettingsAfterUpload = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSettings(result.data);
          console.log('Settings refreshed after upload:', result.data);
        }
      }
    } catch (error) {
      console.error('Error refreshing settings:', error);
    }
  };

  // Функции для загрузки файлов
  const handleFileSelect = async (type: 'logo' | 'favicon', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      if (type === 'logo') {
        setUploadingLogo(true);
      } else {
        setUploadingFavicon(true);
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSettings(prev => ({
            ...prev,
            [type]: result.url
          }));
          await refreshSettingsAfterUpload();
        }
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessage({ type: 'error', text: 'Ошибка при загрузке файла' });
    } finally {
      if (type === 'logo') {
        setUploadingLogo(false);
      } else {
        setUploadingFavicon(false);
      }
    }
  };



  useEffect(() => {
    fetchSettings();
  }, []);

  // Загружаем команду при инициализации
  useEffect(() => {
    if (!loading) {
      fetchTeam();
    }
  }, [loading]);

  const fetchTeam = async () => {
    try {
      const response = await fetch('/api/settings/team');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSettings(prev => ({
            ...prev,
            team: result.data || []
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching team:', error);
    }
  };

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
      
      // Загружаем команду отдельно
      const teamResponse = await fetch('/api/settings/team');
      if (teamResponse.ok) {
        const teamResult = await teamResponse.json();
        if (teamResult.success) {
          setSettings(prev => ({
            ...prev,
            team: teamResult.data || []
          }));
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
      
      console.log('Settings: Saving settings:', settings);
      
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      console.log('Settings: Save response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Settings: Save response result:', result);
        
        if (result.success) {
          setMessage({ type: 'success', text: 'Настройки успешно сохранены!' });
          console.log('Settings: Successfully saved!');
          refreshSettingsAfterUpload(); // Обновляем настройки после успешного сохранения
        } else {
          setMessage({ type: 'error', text: 'Ошибка при сохранении настроек' });
          console.error('Settings: API returned success: false');
        }
      } else {
        setMessage({ type: 'error', text: 'Ошибка при сохранении настроек' });
        console.error('Settings: Save failed with status:', response.status);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Ошибка при сохранении настроек' });
    } finally {
      setSaving(false);
    }
  };





  // Функции для управления командой
  const addTeamMember = () => {
    const newMember: TeamMember = {
      name: '',
      role: '',
      description: '',
      avatar: '',
      social: {},
      order: settings.team.length
    };
    setSettings(prev => ({
      ...prev,
      team: [...prev.team, newMember]
    }));
  };

  const removeTeamMember = (index: number) => {
    setSettings(prev => ({
      ...prev,
      team: prev.team.filter((_, i) => i !== index)
    }));
  };

  const updateTeamMember = (index: number, field: keyof TeamMember, value: string | Record<string, string>) => {
    setSettings(prev => ({
      ...prev,
      team: prev.team.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      )
    }));
  };

  const moveTeamMember = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === settings.team.length - 1) return;

    const newTeam = [...settings.team];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newTeam[index], newTeam[newIndex]] = [newTeam[newIndex], newTeam[index]];
    
    // Обновляем порядок
    newTeam.forEach((member, i) => {
      member.order = i;
    });

    setSettings(prev => ({
      ...prev,
      team: newTeam
    }));
  };

  const saveTeam = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/settings/team', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ team: settings.team }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setMessage({ type: 'success', text: 'Команда успешно обновлена' });
          setTimeout(() => setMessage(null), 3000);
        }
      } else {
        setMessage({ type: 'error', text: 'Ошибка при обновлении команды' });
      }
    } catch (error) {
      console.error('Error saving team:', error);
      setMessage({ type: 'error', text: 'Ошибка при обновлении команды' });
    } finally {
      setSaving(false);
    }
  };

  const migrateTeam = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/settings/migrate-team', {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setMessage({ type: 'success', text: result.message });
          // Обновляем команду в интерфейсе
          setSettings(prev => ({
            ...prev,
            team: result.data
          }));
          setTimeout(() => setMessage(null), 5000);
        } else {
          setMessage({ type: 'error', text: result.message });
        }
      } else {
        setMessage({ type: 'error', text: 'Ошибка при миграции команды' });
      }
    } catch (error) {
      console.error('Error migrating team:', error);
      setMessage({ type: 'error', text: 'Ошибка при миграции команды' });
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
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Основные настройки
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Название сайта
              </label>
              <Input
                value={settings.siteName}
                onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                placeholder="Название сайта"
                className="bg-neutral-800 border-neutral-600 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Логотип
              </label>
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 bg-neutral-700 rounded-lg overflow-hidden">
                  {settings.logo ? (
                    <Image
                      src={settings.logo}
                      alt="Logo"
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-400">
                      <Globe className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <Input
                    value={settings.logo}
                    onChange={(e) => setSettings(prev => ({ ...prev, logo: e.target.value }))}
                    placeholder="URL логотипа"
                    className="bg-neutral-800 border-neutral-600 text-white"
                  />
                </div>
                <Button
                  onClick={() => document.getElementById('logo-upload')?.click()}
                  disabled={uploadingLogo}
                  variant="outline"
                  size="sm"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploadingLogo ? 'Загрузка...' : 'Загрузить'}
                </Button>
                                 <input
                   id="logo-upload"
                   type="file"
                   accept="image/*"
                   className="hidden"
                   onChange={(e) => handleFileSelect('logo', e)}
                 />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Favicon
              </label>
              <div className="flex items-center gap-4">
                <div className="relative w-8 h-8 bg-neutral-700 rounded overflow-hidden">
                  {settings.favicon ? (
                    <Image
                      src={settings.favicon}
                      alt="Favicon"
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-400">
                      <Globe className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <Input
                    value={settings.favicon}
                    onChange={(e) => setSettings(prev => ({ ...prev, favicon: e.target.value }))}
                    placeholder="URL favicon"
                    className="bg-neutral-800 border-neutral-600 text-white"
                  />
                </div>
                <Button
                  onClick={() => document.getElementById('favicon-upload')?.click()}
                  disabled={uploadingFavicon}
                  variant="outline"
                  size="sm"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploadingFavicon ? 'Загрузка...' : 'Загрузить'}
                </Button>
                                 <input
                   id="favicon-upload"
                   type="file"
                   accept="image/*"
                   className="hidden"
                   onChange={(e) => handleFileSelect('favicon', e)}
                 />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Управление командой */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Команда разработчиков</span>
              <div className="flex gap-2">
                <Button
                  onClick={migrateTeam}
                  size="sm"
                  variant="outline"
                  className="border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-white"
                >
                  Мигрировать из About
                </Button>
                <Button
                  onClick={addTeamMember}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить участника
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {settings.team.length === 0 ? (
                             <p className="text-neutral-400 text-center py-8">
                 Команда пока не добавлена. Нажмите &quot;Добавить участника&quot; чтобы начать.
               </p>
            ) : (
              <div className="space-y-4">
                {settings.team.map((member, index) => (
                  <div key={index} className="border border-neutral-700 rounded-lg p-4 bg-neutral-800/50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => moveTeamMember(index, 'up')}
                          disabled={index === 0}
                          size="sm"
                          variant="outline"
                        >
                          <MoveUp className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => moveTeamMember(index, 'down')}
                          disabled={index === settings.team.length - 1}
                          size="sm"
                          variant="outline"
                        >
                          <MoveDown className="w-4 h-4" />
                        </Button>
                        <span className="text-sm text-neutral-400">Порядок: {member.order + 1}</span>
                      </div>
                      <Button
                        onClick={() => removeTeamMember(index)}
                        size="sm"
                        variant="outline"
                        className="text-red-400 hover:text-red-300 hover:border-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Имя *
                        </label>
                        <Input
                          value={member.name}
                          onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                          placeholder="Имя участника"
                          className="bg-neutral-800 border-neutral-600 text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Роль *
                        </label>
                        <Input
                          value={member.role}
                          onChange={(e) => updateTeamMember(index, 'role', e.target.value)}
                          placeholder="Роль в проекте"
                          className="bg-neutral-800 border-neutral-600 text-white"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Описание
                        </label>
                        <Input
                          value={member.description || ''}
                          onChange={(e) => updateTeamMember(index, 'description', e.target.value)}
                          placeholder="Краткое описание участника"
                          className="bg-neutral-800 border-neutral-600 text-white"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Аватар (URL)
                        </label>
                        <Input
                          value={member.avatar || ''}
                          onChange={(e) => updateTeamMember(index, 'avatar', e.target.value)}
                          placeholder="URL аватара"
                          className="bg-neutral-800 border-neutral-600 text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          GitHub
                        </label>
                        <Input
                          value={member.social?.github || ''}
                          onChange={(e) => updateTeamMember(index, 'social', { 
                            ...member.social, 
                            github: e.target.value 
                          })}
                          placeholder="GitHub профиль"
                          className="bg-neutral-800 border-neutral-600 text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Telegram
                        </label>
                        <Input
                          value={member.social?.telegram || ''}
                          onChange={(e) => updateTeamMember(index, 'social', { 
                            ...member.social, 
                            telegram: e.target.value 
                          })}
                          placeholder="Telegram"
                          className="bg-neutral-800 border-neutral-600 text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-end pt-4">
                  <Button
                    onClick={saveTeam}
                    disabled={saving}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Сохранение...' : 'Сохранить команду'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 