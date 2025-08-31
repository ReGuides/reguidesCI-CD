// Утилита для сбора аналитики на клиентской стороне

export interface AnalyticsData {
  sessionId: string;
  userId?: string;
  page: string;
  pageType: 'character' | 'weapon' | 'artifact' | 'news' | 'about' | 'home' | 'search' | 'other';
  pageId?: string;
  userAgent: string;
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  device: 'desktop' | 'mobile' | 'tablet';
  screenResolution: string;
  country: string;
  city?: string;
  timezone: string;
  language: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  timeOnPage: number;
  isBounce: boolean;
  scrollDepth: number;
  clicks: number;
  loadTime: number;
  isFirstVisit: boolean;
}

class AnalyticsTracker {
  private sessionId: string;
  private sessionStart: Date;
  private pageStart: Date;
  private currentPage: string;
  private clickCount: number = 0;
  private maxScrollDepth: number = 0;
  private isTracking: boolean = false;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStart = new Date();
    this.pageStart = new Date();
    this.currentPage = window.location.pathname;
    
    // Проверяем, первый ли это визит
    this.isFirstVisit = !localStorage.getItem('hasVisitedBefore');
    if (this.isFirstVisit) {
      localStorage.setItem('hasVisitedBefore', 'true');
    }
    
    this.initTracking();
  }

  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private detectBrowser(): { browser: string; version: string } {
    const userAgent = navigator.userAgent;
    
    if (userAgent.includes('Chrome')) {
      const match = userAgent.match(/Chrome\/(\d+)/);
      return { browser: 'Chrome', version: match ? match[1] : 'Unknown' };
    } else if (userAgent.includes('Firefox')) {
      const match = userAgent.match(/Firefox\/(\d+)/);
      return { browser: 'Firefox', version: match ? match[1] : 'Unknown' };
    } else if (userAgent.includes('Safari')) {
      const match = userAgent.match(/Version\/(\d+)/);
      return { browser: 'Safari', version: match ? match[1] : 'Unknown' };
    } else if (userAgent.includes('Edge')) {
      const match = userAgent.match(/Edge\/(\d+)/);
      return { browser: 'Edge', version: match ? match[1] : 'Unknown' };
    } else {
      return { browser: 'Unknown', version: 'Unknown' };
    }
  }

  private detectOS(): { os: string; version: string } {
    const userAgent = navigator.userAgent;
    
    if (userAgent.includes('Windows')) {
      const match = userAgent.match(/Windows NT (\d+\.\d+)/);
      return { os: 'Windows', version: match ? match[1] : 'Unknown' };
    } else if (userAgent.includes('Mac OS X')) {
      const match = userAgent.match(/Mac OS X (\d+[._]\d+)/);
      return { os: 'macOS', version: match ? match[1].replace('_', '.') : 'Unknown' };
    } else if (userAgent.includes('Linux')) {
      return { os: 'Linux', version: 'Unknown' };
    } else if (userAgent.includes('Android')) {
      const match = userAgent.match(/Android (\d+\.\d+)/);
      return { os: 'Android', version: match ? match[1] : 'Unknown' };
    } else if (userAgent.includes('iOS')) {
      const match = userAgent.match(/OS (\d+[._]\d+)/);
      return { os: 'iOS', version: match ? match[1].replace('_', '.') : 'Unknown' };
    } else {
      return { os: 'Unknown', version: 'Unknown' };
    }
  }

  private detectDevice(): 'desktop' | 'mobile' | 'tablet' {
    const userAgent = navigator.userAgent;
    const screenWidth = window.screen.width;
    
    if (userAgent.includes('Mobile') || screenWidth <= 768) {
      return 'mobile';
    } else if (userAgent.includes('Tablet') || (screenWidth > 768 && screenWidth <= 1024)) {
      return 'tablet';
    } else {
      return 'desktop';
    }
  }

  private async getGeolocation(): Promise<{ country: string; city?: string }> {
    try {
      // Пытаемся получить страну из IP через внешний API
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      return {
        country: data.country_name || 'Unknown',
        city: data.city || undefined
      };
    } catch (error) {
      console.warn('Could not get geolocation:', error);
      return { country: 'Unknown' };
    }
  }

  private getUTMParams(): { utmSource?: string; utmMedium?: string; utmCampaign?: string } {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      utmSource: urlParams.get('utm_source') || undefined,
      utmMedium: urlParams.get('utm_medium') || undefined,
      utmCampaign: urlParams.get('utm_campaign') || undefined
    };
  }

  private initTracking(): void {
    if (this.isTracking) return;
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
      const now = new Date();
      const timeOnPage = Math.round((now.getTime() - this.pageStart.getTime()) / 1000);
      
      const { browser, version: browserVersion } = this.detectBrowser();
      const { os, version: osVersion } = this.detectOS();
      const device = this.detectDevice();
      const { country, city } = await this.getGeolocation();
      const { utmSource, utmMedium, utmCampaign } = this.getUTMParams();

      const analyticsData: AnalyticsData = {
        sessionId: this.sessionId,
        page: this.currentPage,
        pageType: this.getPageType(this.currentPage),
        pageId: this.getPageId(this.currentPage),
        userAgent: navigator.userAgent,
        browser,
        browserVersion,
        os,
        osVersion,
        device,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        country,
        city,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        referrer: document.referrer || undefined,
        utmSource,
        utmMedium,
        utmCampaign,
        timeOnPage: isLeaving ? timeOnPage : 0,
        isBounce: this.isFirstVisit && timeOnPage < 30,
        scrollDepth: this.maxScrollDepth,
        clicks: this.clickCount,
        loadTime: this.getLoadTime(),
        isFirstVisit: this.isFirstVisit
      };

      // Отправляем данные на сервер
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analyticsData),
      });

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
    this.trackPageView(true); // Завершаем предыдущую страницу
    this.pageStart = new Date();
    this.currentPage = window.location.pathname;
    this.clickCount = 0;
    this.maxScrollDepth = 0;
    
    // Отслеживаем новую страницу
    setTimeout(() => {
      this.trackPageView(false);
    }, 100);
  }

  public trackEvent(eventType: string, eventName: string, metadata?: Record<string, unknown>): void {
    // Дополнительное отслеживание событий
    console.log('Event tracked:', { eventType, eventName, metadata });
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

export function trackEvent(eventType: string, eventName: string, metadata?: Record<string, unknown>): void {
  if (analyticsTracker) {
    analyticsTracker.trackEvent(eventType, eventName, metadata);
  }
}
