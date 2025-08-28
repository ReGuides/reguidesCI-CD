

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

  public start() {
    if (this.isRunning || !this.config.enabled) {
      return;
    }

    console.log('🎂 Birthday Scheduler: Starting...');
    this.isRunning = true;

    // Запускаем первую проверку сразу
    this.runCheck();

    // Устанавливаем интервал для регулярных проверок
    this.intervalId = setInterval(() => {
      this.runCheck();
    }, this.config.checkInterval);

    console.log(`🎂 Birthday Scheduler: Started with ${this.config.checkInterval / (1000 * 60 * 60)} hour interval`);
  }

  public stop() {
    if (this.intervalId) {
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
      this.config.nextCheck = new Date(Date.now() + this.config.checkInterval);
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
    this.setConfig({ checkInterval: 5 * 60 * 1000 }); // 5 минут
    console.log('🎂 Birthday Scheduler: Test mode enabled (checking every 5 minutes)');
  }

  // Метод для возврата к нормальному режиму
  public enableNormalMode() {
    this.setConfig({ checkInterval: 24 * 60 * 60 * 1000 }); // 24 часа
    console.log('🎂 Birthday Scheduler: Normal mode enabled (checking every 24 hours)');
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
