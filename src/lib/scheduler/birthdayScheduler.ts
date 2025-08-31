

interface BirthdaySchedulerConfig {
  enabled: boolean;
  checkInterval: number; // в миллисекундах
  lastCheck?: Date;
  nextCheck?: Date;
}

class BirthdayScheduler {
  private config: BirthdaySchedulerConfig;
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor() {
    this.config = {
      enabled: true,
      checkInterval: 24 * 60 * 60 * 1000, // 24 часа по умолчанию
    };
    
    // Загружаем конфигурацию из localStorage
    this.loadConfig();
  }

  private loadConfig() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('birthdaySchedulerConfig');
        if (saved) {
          const parsed = JSON.parse(saved);
          this.config = { ...this.config, ...parsed };
        }
      } catch (error) {
        console.warn('Failed to load scheduler config:', error);
      }
    }
  }

  private saveConfig() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('birthdaySchedulerConfig', JSON.stringify(this.config));
      } catch (error) {
        console.warn('Failed to save scheduler config:', error);
      }
    }
  }

  /**
   * Вычисляет время следующего запуска в 00:00 по московскому времени
   */
  private calculateNextRunTime(): Date {
    const now = new Date();
    
    // Получаем московское время
    const moscowTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Moscow' }));
    
    // Следующий день в 00:00 по МСК
    const nextRun = new Date(moscowTime);
    nextRun.setDate(nextRun.getDate() + 1);
    nextRun.setHours(0, 0, 0, 0);
    
    // Конвертируем московское время обратно в локальное время сервера
    const localNextRun = new Date(nextRun.toLocaleString('en-US', { timeZone: 'Europe/Moscow' }));
    
    console.log('🎂 Scheduler: Next run calculated:', {
      now: now.toISOString(),
      moscowTime: moscowTime.toISOString(),
      nextRun: nextRun.toISOString(),
      localNextRun: localNextRun.toISOString()
    });
    
    return localNextRun;
  }

  /**
   * Вычисляет интервал до следующего запуска
   */
  private calculateIntervalToNextRun(): number {
    const nextRun = this.calculateNextRunTime();
    const now = new Date();
    const interval = nextRun.getTime() - now.getTime();
    
    // Если интервал отрицательный (прошло время), запускаем через 1 минуту
    if (interval <= 0) {
      console.log('🎂 Scheduler: Next run time has passed, scheduling in 1 minute');
      return 60 * 1000; // 1 минута
    }
    
    console.log(`🎂 Scheduler: Next run in ${Math.round(interval / (1000 * 60))} minutes`);
    return interval;
  }

  public start() {
    if (this.isRunning || !this.config.enabled) {
      return;
    }

    console.log('🎂 Birthday Scheduler: Starting...');
    this.isRunning = true;

    // Запускаем первую проверку сразу
    this.runCheck();

    // Проверяем, в каком режиме работаем
    if (this.config.checkInterval < 24 * 60 * 60 * 1000) {
      // Тестовый режим - каждые N минут
      this.intervalId = setInterval(() => {
        this.runCheck();
      }, this.config.checkInterval);
      
      this.config.nextCheck = new Date(Date.now() + this.config.checkInterval);
      console.log(`🎂 Birthday Scheduler: Started in test mode. Checking every ${this.config.checkInterval / (1000 * 60)} minutes`);
    } else {
      // Нормальный режим - в 00:00 МСК
      const nextRunTime = this.calculateNextRunTime();
      this.config.nextCheck = nextRunTime;
      
      const interval = this.calculateIntervalToNextRun();
      
      this.intervalId = setTimeout(() => {
        this.runCheck();
        this.scheduleNextRun();
      }, interval);

      console.log(`🎂 Birthday Scheduler: Started in normal mode. Next run at ${nextRunTime.toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })} (Moscow time)`);
    }
    
    this.saveConfig();
  }

  /**
   * Планирует следующий запуск в 00:00 МСК
   */
  private scheduleNextRun() {
    if (!this.isRunning) return;
    
    const interval = this.calculateIntervalToNextRun();
    const nextRunTime = this.calculateNextRunTime();
    
    this.config.nextCheck = nextRunTime;
    this.saveConfig();
    
    this.intervalId = setTimeout(() => {
      this.runCheck();
      this.scheduleNextRun(); // Рекурсивно планируем следующий запуск
    }, interval);
    
    console.log(`🎂 Birthday Scheduler: Next run scheduled at ${nextRunTime.toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })} (Moscow time)`);
  }

  public stop() {
    if (this.intervalId) {
      // Очищаем как setTimeout, так и setInterval
      clearTimeout(this.intervalId);
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('🎂 Birthday Scheduler: Stopped');
  }

  public async runCheck() {
    try {
      console.log('🎂 Birthday Scheduler: Running birthday check...');
      
      const response = await fetch('/api/cron/check-birthdays', {
        method: 'POST'
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          console.log(`🎂 Birthday Scheduler: Check completed. Generated ${result.generated} news`);
        } else {
          console.warn('🎂 Birthday Scheduler: Check failed:', result.error);
        }
      } else {
        console.error('🎂 Birthday Scheduler: HTTP error during check');
      }

      // Обновляем время последней проверки
      this.config.lastCheck = new Date();
      this.saveConfig();

    } catch (error) {
      console.error('🎂 Birthday Scheduler: Error during check:', error);
    }
  }

  public setConfig(newConfig: Partial<BirthdaySchedulerConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();

    // Если изменился интервал, перезапускаем планировщик
    if (newConfig.checkInterval && this.isRunning) {
      this.stop();
      this.start();
    }
  }

  public getConfig(): BirthdaySchedulerConfig {
    return { ...this.config };
  }

  public getStatus() {
    return {
      isRunning: this.isRunning,
      enabled: this.config.enabled,
      lastCheck: this.config.lastCheck,
      nextCheck: this.config.nextCheck,
      checkInterval: this.config.checkInterval
    };
  }

  public enable() {
    this.config.enabled = true;
    this.saveConfig();
    if (!this.isRunning) {
      this.start();
    }
  }

  public disable() {
    this.config.enabled = false;
    this.saveConfig();
    this.stop();
  }

  // Метод для тестирования (запуск проверки каждые 5 минут)
  public enableTestMode() {
    this.stop();
    this.config.checkInterval = 5 * 60 * 1000; // 5 минут
    this.saveConfig();
    this.start();
    console.log('🎂 Birthday Scheduler: Test mode enabled (checking every 5 minutes)');
  }

  // Метод для возврата к нормальному режиму (00:00 МСК)
  public enableNormalMode() {
    this.stop();
    this.config.checkInterval = 24 * 60 * 60 * 1000; // 24 часа
    this.saveConfig();
    this.start();
    console.log('🎂 Birthday Scheduler: Normal mode enabled (checking at 00:00 Moscow time)');
  }
}

// Создаем глобальный экземпляр планировщика
let scheduler: BirthdayScheduler | null = null;

export function getBirthdayScheduler(): BirthdayScheduler {
  if (!scheduler) {
    scheduler = new BirthdayScheduler();
  }
  return scheduler;
}

export function startBirthdayScheduler() {
  const scheduler = getBirthdayScheduler();
  scheduler.start();
  return scheduler;
}

export function stopBirthdayScheduler() {
  if (scheduler) {
    scheduler.stop();
  }
}

// Автоматически запускаем планировщик при импорте модуля
if (typeof window !== 'undefined') {
  // Запускаем только в браузере
  setTimeout(() => {
    startBirthdayScheduler();
  }, 1000); // Запускаем через 1 секунду после загрузки страницы
}
