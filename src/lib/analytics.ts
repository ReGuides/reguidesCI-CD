// Анонимная аналитика без сбора персональных данных (соответствует 152-ФЗ)

export interface AnalyticsData {
  // Анонимная информация (без персональных данных)
  anonymousSessionId: string;
  page: string;
  pageType: 'character' | 'weapon' | 'artifact' | 'news' | 'about' | 'home' | 'search' | 'other';
  pageId?: string;
  
  // Обезличенные технические данные
  deviceCategory: 'desktop' | 'mobile' | 'tablet';
  screenSize: 'small' | 'medium' | 'large';
  
  // Обезличенная география (только континент)
  region: 'europe' | 'asia' | 'americas' | 'africa' | 'oceania' | 'unknown';
  
  // Обезличенное время
  visitDate: string; // YYYY-MM-DD
  visitHour: number; // 0-23 по МСК
  visitDayOfWeek: number; // 1-7 по МСК
  
  // Поведенческие метрики (без идентификации)
  timeOnPage: number;
  scrollDepth: number;
  clicks: number;
  loadTime: number;
  isBounce: boolean;
}

class AnalyticsTracker {
  private anonymousSessionId: string;
  private pageStart: Date;
  private currentPage: string;
  private clickCount: number = 0;
  private maxScrollDepth: number = 0;
  private isTracking: boolean = false;

  constructor() {
    // Генерируем анонимный ID сессии (хешированный)
    this.anonymousSessionId = this.generateAnonymousSessionId();
    this.pageStart = new Date();
    this.currentPage = window.location.pathname;
    
    this.initTracking();
  }

  private generateAnonymousSessionId(): string {
    // Создаем анонимный ID на основе времени и случайных данных
    const data = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    // Простое хеширование для анонимности
    return 'anon_' + btoa(data).substr(0, 16).replace(/[^a-zA-Z0-9]/g, '');
  }

  private detectDeviceCategory(): 'desktop' | 'mobile' | 'tablet' {
    const screenWidth = window.screen.width;
    
    if (screenWidth <= 768) {
      return 'mobile';
    } else if (screenWidth <= 1024) {
      return 'tablet';
    } else {
      return 'desktop';
    }
  }

  private detectScreenSize(): 'small' | 'medium' | 'large' {
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const area = screenWidth * screenHeight;
    
    if (area <= 480000) { // 800x600
      return 'small';
    } else if (area <= 1920000) { // 1600x1200
      return 'medium';
    } else {
      return 'large';
    }
  }

  private async getRegion(): Promise<'europe' | 'asia' | 'americas' | 'africa' | 'oceania' | 'unknown'> {
    try {
      // Используем только публичный API для определения континента (без IP)
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      // Определяем континент по коду страны (без сохранения страны)
      const countryCode = data.country_code;
      
      if (['RU', 'DE', 'FR', 'GB', 'IT', 'ES', 'PL', 'UA', 'BY', 'KZ'].includes(countryCode)) {
        return 'europe';
      } else if (['CN', 'JP', 'KR', 'IN', 'TH', 'VN', 'ID', 'MY'].includes(countryCode)) {
        return 'asia';
      } else if (['US', 'CA', 'BR', 'MX', 'AR', 'CL'].includes(countryCode)) {
        return 'americas';
      } else if (['ZA', 'NG', 'EG', 'KE', 'MA'].includes(countryCode)) {
        return 'africa';
      } else if (['AU', 'NZ', 'FJ', 'PG'].includes(countryCode)) {
        return 'oceania';
      } else {
        return 'unknown';
      }
    } catch (error) {
      console.warn('Could not determine region:', error);
      return 'unknown';
    }
  }

  private getMoscowTime(): { date: string; hour: number; dayOfWeek: number } {
    const now = new Date();
    
    // Получаем московское время
    const moscowTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Moscow' }));
    
    const date = moscowTime.toISOString().split('T')[0]; // YYYY-MM-DD
    const hour = moscowTime.getHours(); // 0-23
    const dayOfWeek = moscowTime.getDay() || 7; // 1-7 (понедельник = 1)
    
    return { date, hour, dayOfWeek };
  }

  private initTracking(): void {
    if (this.isTracking) return;
    
    // Не отслеживаем аналитику на страницах админки
    if (window.location.pathname.startsWith('/admin')) {
      return;
    }
    
    this.isTracking = true;

    // Отслеживаем клики
    document.addEventListener('click', () => {
      this.clickCount++;
    });

    // Отслеживаем прокрутку
    let scrollTimeout: NodeJS.Timeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollPercent = Math.round(
          (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        );
        this.maxScrollDepth = Math.max(this.maxScrollDepth, scrollPercent);
      }, 100);
    });

    // Отслеживаем уход со страницы
    window.addEventListener('beforeunload', () => {
      this.trackPageView(true);
    });

    // Отслеживаем изменение видимости страницы
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackPageView(true);
      } else {
        this.pageStart = new Date();
      }
    });

    // Отслеживаем изменение URL (для SPA)
    let currentUrl = window.location.pathname;
    const observer = new MutationObserver(() => {
      if (window.location.pathname !== currentUrl) {
        this.trackPageView(true);
        currentUrl = window.location.pathname;
        this.startNewPage();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  private async trackPageView(isLeaving: boolean = false): Promise<void> {
    try {
      // Не отслеживаем аналитику на страницах админки
      if (this.currentPage.startsWith('/admin')) {
        return;
      }
      
      const now = new Date();
      const timeOnPage = Math.round((now.getTime() - this.pageStart.getTime()) / 1000);
      
      // Получаем обезличенные данные
      const deviceCategory = this.detectDeviceCategory();
      const screenSize = this.detectScreenSize();
      const region = await this.getRegion();
      const moscowTime = this.getMoscowTime();
      
      // Округляем время для анонимности
      const roundedTimeOnPage = Math.round(timeOnPage / 10) * 10; // Округление до 10 секунд
      const roundedLoadTime = Math.round(this.getLoadTime() / 100) * 100; // Округление до 100мс

      const analyticsData: AnalyticsData = {
        anonymousSessionId: this.anonymousSessionId,
        page: this.currentPage,
        pageType: this.getPageType(this.currentPage),
        pageId: this.getPageId(this.currentPage),
        deviceCategory,
        screenSize,
        region,
        visitDate: moscowTime.date,
        visitHour: moscowTime.hour,
        visitDayOfWeek: moscowTime.dayOfWeek,
        timeOnPage: isLeaving ? roundedTimeOnPage : 0,
        scrollDepth: this.maxScrollDepth,
        clicks: this.clickCount,
        loadTime: roundedLoadTime,
        isBounce: timeOnPage < 30 // Отказ если меньше 30 секунд
      };

      // Отправляем данные на сервер
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analyticsData),
      });

      // Если есть UTM-метки, отправляем рекламную аналитику
      const urlParams = new URLSearchParams(window.location.search);
      const utmSource = urlParams.get('utm_source');
      const utmMedium = urlParams.get('utm_medium');
      const utmCampaign = urlParams.get('utm_campaign');
      const utmTerm = urlParams.get('utm_term');
      const utmContent = urlParams.get('utm_content');
      
      if (utmSource || utmMedium || utmCampaign || utmTerm || utmContent) {
        const advertisingData = {
          ...analyticsData,
          utmSource,
          utmMedium,
          utmCampaign,
          utmTerm,
          utmContent,
          isFirstVisit: this.isFirstVisit,
          conversionGoal: undefined, // Будет установлено при достижении цели
          conversionValue: undefined  // Будет установлено при достижении цели
        };
        
        await fetch('/api/analytics/advertising/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(advertisingData),
        });
      }

      // Сбрасываем счетчики для новой страницы
      if (!isLeaving) {
        this.clickCount = 0;
        this.maxScrollDepth = 0;
      }

    } catch (error) {
      console.error('Error tracking analytics:', error);
    }
  }

  private getPageType(pathname: string): 'character' | 'weapon' | 'artifact' | 'news' | 'about' | 'home' | 'search' | 'other' {
    if (pathname.startsWith('/character/')) return 'character';
    if (pathname.startsWith('/weapon/')) return 'weapon';
    if (pathname.startsWith('/artifact/')) return 'artifact';
    if (pathname.startsWith('/news/')) return 'news';
    if (pathname === '/about') return 'about';
    if (pathname === '/') return 'home';
    if (pathname === '/search') return 'search';
    return 'other';
  }

  private getPageId(pathname: string): string | undefined {
    const match = pathname.match(/\/(character|weapon|artifact|news)\/([^\/]+)/);
    return match ? match[2] : undefined;
  }

  private getLoadTime(): number {
    if (performance && performance.timing) {
      const timing = performance.timing;
      return timing.loadEventEnd - timing.navigationStart;
    }
    return 0;
  }

  public startNewPage(): void {
    // Не отслеживаем аналитику на страницах админки
    if (this.currentPage.startsWith('/admin')) {
      return;
    }
    
    this.trackPageView(true); // Завершаем предыдущую страницу
    this.pageStart = new Date();
    this.currentPage = window.location.pathname;
    this.clickCount = 0;
    this.maxScrollDepth = 0;
    
    // Отслеживаем новую страницу только если это не админка
    if (!this.currentPage.startsWith('/admin')) {
      setTimeout(() => {
        this.trackPageView(false);
      }, 100);
    }
  }

  public trackEvent(eventType: string, eventName: string, metadata?: Record<string, unknown>): void {
    // Дополнительное отслеживание событий (анонимное)
    console.log('Event tracked:', { eventType, eventName, metadata });
  }

  public trackConversion(goal: string, value?: number): void {
    // Отслеживание конверсий для рекламной аналитики
    if (this.currentPage.startsWith('/admin')) {
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source');
    const utmMedium = urlParams.get('utm_medium');
    const utmCampaign = urlParams.get('utm_campaign');
    
    if (utmSource || utmMedium || utmCampaign) {
      const conversionData = {
        anonymousSessionId: this.anonymousSessionId,
        page: this.currentPage,
        pageType: this.getPageType(this.currentPage),
        pageId: this.getPageId(this.currentPage),
        deviceCategory: this.detectDeviceCategory(),
        screenSize: this.detectScreenSize(),
        region: 'unknown', // Будет получено асинхронно
        visitDate: this.getMoscowTime().date,
        visitHour: this.getMoscowTime().hour,
        visitDayOfWeek: this.getMoscowTime().dayOfWeek,
        timeOnPage: 0,
        scrollDepth: 0,
        clicks: 0,
        loadTime: 0,
        isBounce: false,
        utmSource,
        utmMedium,
        utmCampaign,
        utmTerm: urlParams.get('utm_term'),
        utmContent: urlParams.get('utm_content'),
        isFirstVisit: this.isFirstVisit,
        conversionGoal: goal,
        conversionValue: value || 0
      };

      // Отправляем конверсию
      fetch('/api/analytics/advertising/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(conversionData),
      }).catch(error => {
        console.error('Error tracking conversion:', error);
      });
    }
  }
}

// Создаем глобальный экземпляр трекера
let analyticsTracker: AnalyticsTracker | null = null;

export function initAnalytics(): AnalyticsTracker {
  if (!analyticsTracker) {
    analyticsTracker = new AnalyticsTracker();
  }
  return analyticsTracker;
}

export function getAnalytics(): AnalyticsTracker | null {
  return analyticsTracker;
}

export function trackPageView(): void {
  if (analyticsTracker) {
    analyticsTracker.startNewPage();
  }
}

export function trackConversion(goal: string, value?: number): void {
  if (analyticsTracker) {
    analyticsTracker.trackConversion(goal, value);
  }
}

export function trackEvent(eventType: string, eventName: string, metadata?: Record<string, unknown>): void {
  if (analyticsTracker) {
    analyticsTracker.trackEvent(eventType, eventName, metadata);
  }
}
