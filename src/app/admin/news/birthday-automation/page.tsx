'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Clock, RefreshCw, Play, Pause, Settings } from 'lucide-react';
import Link from 'next/link';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { getBirthdayScheduler } from '@/lib/scheduler/birthdayScheduler';

interface BirthdayCharacter {
  _id: string;
  name: string;
  birthday: string;
  image?: string;
  hasNews: boolean;
}

interface CronJobStatus {
  lastRun?: string;
  nextRun?: string;
  isActive: boolean;
  totalCharacters: number;
  todayBirthdays: number;
  generatedToday: number;
}

export default function BirthdayAutomationPage() {
  const [loading, setLoading] = useState(false);
  const [characters, setCharacters] = useState<BirthdayCharacter[]>([]);
  const [schedulerStatus, setSchedulerStatus] = useState<{
    isRunning: boolean;
    enabled: boolean;
    lastCheck: Date | undefined;
    nextCheck: Date | undefined;
    checkInterval: number;
  } | null>(null);
  const [status, setStatus] = useState<CronJobStatus>({
    isActive: false,
    totalCharacters: 0,
    todayBirthdays: 0,
    generatedToday: 0
  });

  useEffect(() => {
    fetchBirthdayData();
    updateSchedulerStatus();
    
    // Обновляем статус планировщика каждые 5 секунд
    const interval = setInterval(updateSchedulerStatus, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const updateSchedulerStatus = () => {
    try {
      const scheduler = getBirthdayScheduler();
      const status = scheduler.getStatus();
      setSchedulerStatus(status);
    } catch (error) {
      console.error('Error updating scheduler status:', error);
    }
  };

  const toggleScheduler = () => {
    try {
      const scheduler = getBirthdayScheduler();
      if (schedulerStatus?.isRunning) {
        scheduler.disable();
      } else {
        scheduler.enable();
      }
      updateSchedulerStatus();
    } catch (error) {
      console.error('Error toggling scheduler:', error);
    }
  };

  const enableTestMode = () => {
    try {
      const scheduler = getBirthdayScheduler();
      scheduler.enableTestMode();
      updateSchedulerStatus();
      alert('Тестовый режим включен! Проверка каждые 5 минут.');
    } catch (error) {
      console.error('Error enabling test mode:', error);
    }
  };

  const enableNormalMode = () => {
    try {
      const scheduler = getBirthdayScheduler();
      scheduler.enableNormalMode();
      updateSchedulerStatus();
      alert('Обычный режим включен! Проверка каждые 24 часа.');
    } catch (error) {
      console.error('Error enabling normal mode:', error);
    }
  };

  const fetchBirthdayData = async () => {
    try {
      setLoading(true);
      
      // Получаем данные о персонажах с днями рождения
      const response = await fetch('/api/news/generate-birthday');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCharacters(data.data.characters || []);
          setStatus(prev => ({
            ...prev,
            totalCharacters: data.data.total || 0,
            todayBirthdays: data.data.characters?.length || 0,
            generatedToday: data.data.withNews || 0
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching birthday data:', error);
    } finally {
      setLoading(false);
    }
  };

  const runCronJob = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/cron/check-birthdays', {
        method: 'POST'
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert(`Cron job выполнен успешно!\nСоздано новостей: ${result.generated}\nВсего персонажей с днями рождения: ${result.total}`);
          // Обновляем данные
          await fetchBirthdayData();
        } else {
          alert(`Ошибка выполнения cron job: ${result.error}`);
        }
      } else {
        alert('Ошибка при выполнении cron job');
      }
    } catch (error) {
      console.error('Error running cron job:', error);
      alert('Ошибка при выполнении cron job');
    } finally {
      setLoading(false);
    }
  };

  const getNextBirthday = () => {
    const today = new Date();
    const sortedCharacters = [...characters].sort((a, b) => {
      const aDate = new Date(today.getFullYear(), getMonthFromName(a.birthday), getDayFromName(a.birthday));
      const bDate = new Date(today.getFullYear(), getMonthFromName(b.birthday), getDayFromName(b.birthday));
      
      // Если дата уже прошла в этом году, переносим на следующий год
      if (aDate < today) aDate.setFullYear(today.getFullYear() + 1);
      if (bDate < today) bDate.setFullYear(today.getFullYear() + 1);
      
      return aDate.getTime() - bDate.getTime();
    });
    
    return sortedCharacters[0];
  };

  const getMonthFromName = (birthday: string) => {
    const monthNames: { [key: string]: number } = {
      'января': 0, 'февраля': 1, 'марта': 2, 'апреля': 3, 'мая': 4, 'июня': 5,
      'июля': 6, 'августа': 7, 'сентября': 8, 'октября': 9, 'ноября': 10, 'декабря': 11
    };
    const match = birthday.match(/^(\d{1,2})\s+([а-яё]+)$/i);
    return match ? monthNames[match[2].toLowerCase()] || 0 : 0;
  };

  const getDayFromName = (birthday: string) => {
    const match = birthday.match(/^(\d{1,2})\s+([а-яё]+)$/i);
    return match ? parseInt(match[1], 10) : 1;
  };

  const nextBirthday = getNextBirthday();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" className="text-purple-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Заголовок */}
      <div className="flex items-center space-x-4">
        <Link href="/admin/news">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">Автоматизация новостей о днях рождения</h1>
          <p className="text-gray-400">Управление автоматическим созданием новостей о днях рождения персонажей</p>
        </div>
      </div>

      {/* Статус системы */}
      <Card className="bg-neutral-800 border-neutral-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Статус системы
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-neutral-700 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">{status.totalCharacters}</div>
              <div className="text-sm text-gray-400">Всего персонажей</div>
            </div>
            <div className="text-center p-4 bg-neutral-700 rounded-lg">
              <div className="text-2xl font-bold text-orange-400">{status.todayBirthdays}</div>
              <div className="text-sm text-gray-400">Дни рождения сегодня</div>
            </div>
            <div className="text-center p-4 bg-neutral-700 rounded-lg">
              <div className="text-2xl font-bold text-green-400">{status.generatedToday}</div>
              <div className="text-sm text-gray-400">Новостей создано</div>
            </div>
            <div className="text-center p-4 bg-neutral-700 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">
                {schedulerStatus?.isRunning ? 'Работает' : 'Остановлен'}
              </div>
              <div className="text-sm text-gray-400">Планировщик</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Статус планировщика */}
      <Card className="bg-neutral-800 border-neutral-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Статус планировщика
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Статус:</span>
                <span className={`font-medium ${schedulerStatus?.isRunning ? 'text-green-400' : 'text-red-400'}`}>
                  {schedulerStatus?.isRunning ? 'Работает' : 'Остановлен'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Интервал:</span>
                <span className="font-medium text-white">
                  {schedulerStatus?.checkInterval ? Math.round(schedulerStatus.checkInterval / (1000 * 60 * 60)) : 24} ч
                </span>
              </div>
              {schedulerStatus?.lastCheck && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Последняя проверка:</span>
                  <span className="font-medium text-white">
                    {new Date(schedulerStatus.lastCheck).toLocaleString('ru-RU')}
                  </span>
                </div>
              )}
              {schedulerStatus?.nextCheck && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Следующая проверка:</span>
                  <span className="font-medium text-white">
                    {new Date(schedulerStatus.nextCheck).toLocaleString('ru-RU')}
                  </span>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <Button
                onClick={toggleScheduler}
                className={`w-full ${schedulerStatus?.isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
              >
                {schedulerStatus?.isRunning ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Остановить
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Запустить
                  </>
                )}
              </Button>
              <Button
                onClick={enableTestMode}
                variant="outline"
                className="w-full border-orange-600 text-orange-400 hover:bg-orange-600 hover:text-white"
              >
                Тестовый режим (5 мин)
              </Button>
              <Button
                onClick={enableNormalMode}
                variant="outline"
                className="w-full border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
              >
                Обычный режим (24 ч)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Следующий день рождения */}
      {nextBirthday && (
        <Card className="bg-neutral-800 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Следующий день рождения
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold text-purple-400">
                {nextBirthday.name}
              </div>
              <div className="text-gray-400">
                {nextBirthday.birthday}
              </div>
              {nextBirthday.hasNews && (
                <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                  Новость создана
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Управление */}
      <Card className="bg-neutral-800 border-neutral-700">
        <CardHeader>
          <CardTitle className="text-white">Управление</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button
              onClick={runCronJob}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Выполняется...' : 'Запустить проверку сейчас'}
            </Button>
            
            <Button
              onClick={fetchBirthdayData}
              disabled={loading}
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Обновить данные
            </Button>
          </div>
          
          <div className="text-sm text-gray-400">
            <p>• <strong>Встроенный планировщик</strong>: Автоматически запускается при открытии админки</p>
            <p>• <strong>Тестовый режим</strong>: Проверка каждые 5 минут для отладки</p>
            <p>• <strong>Обычный режим</strong>: Проверка каждые 24 часа</p>
            <p>• <strong>Ручная проверка</strong>: Нажмите &quot;Запустить проверку сейчас&quot;</p>
            <p>• <strong>Логи</strong>: Проверяйте консоль браузера для деталей выполнения</p>
          </div>
        </CardContent>
      </Card>

      {/* Список персонажей с днями рождения сегодня */}
      {status.todayBirthdays > 0 && (
        <Card className="bg-neutral-800 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-white">
              Персонажи с днями рождения сегодня ({status.todayBirthdays})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {characters.filter(char => !char.hasNews).map(character => (
                <div key={character._id} className="flex items-center justify-between p-3 bg-neutral-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🎂</span>
                    <span className="font-medium text-white">{character.name}</span>
                    <span className="text-gray-400">{character.birthday}</span>
                  </div>
                  <span className="px-2 py-1 bg-orange-600 text-white text-xs rounded-full">
                    Ожидает создания новости
                  </span>
                </div>
              ))}
              
              {characters.filter(char => char.hasNews).map(character => (
                <div key={character._id} className="flex items-center justify-between p-3 bg-neutral-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">✅</span>
                    <span className="font-medium text-white">{character.name}</span>
                    <span className="text-gray-400">{character.birthday}</span>
                  </div>
                  <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                    Новость создана
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
