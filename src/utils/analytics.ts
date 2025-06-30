import { config } from '@/config/environment';
import { logger } from './logger';

interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}

class Analytics {
  private initialized = false;

  constructor() {
    if (config.enableAnalytics && config.googleAnalyticsId) {
      this.initializeGoogleAnalytics();
    }
  }

  private initializeGoogleAnalytics(): void {
    try {
      // Load Google Analytics script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${config.googleAnalyticsId}`;
      document.head.appendChild(script);

      // Initialize gtag
      (window as any).dataLayer = (window as any).dataLayer || [];
      function gtag(...args: any[]) {
        (window as any).dataLayer.push(args);
      }
      (window as any).gtag = gtag;

      gtag('js', new Date());
      gtag('config', config.googleAnalyticsId, {
        anonymize_ip: true,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
      });

      this.initialized = true;
      logger.info('Google Analytics initialized');
    } catch (error) {
      logger.error('Failed to initialize Google Analytics', error);
    }
  }

  trackEvent(event: AnalyticsEvent): void {
    if (!config.enableAnalytics || !this.initialized) {
      return;
    }

    try {
      if ((window as any).gtag) {
        (window as any).gtag('event', event.action, {
          event_category: event.category,
          event_label: event.label,
          value: event.value,
          ...event.custom_parameters,
        });
      }

      logger.debug('Analytics event tracked', event);
    } catch (error) {
      logger.error('Failed to track analytics event', error);
    }
  }

  trackPageView(page: string): void {
    if (!config.enableAnalytics || !this.initialized) {
      return;
    }

    try {
      if ((window as any).gtag) {
        (window as any).gtag('config', config.googleAnalyticsId, {
          page_path: page,
        });
      }

      logger.debug('Page view tracked', { page });
    } catch (error) {
      logger.error('Failed to track page view', error);
    }
  }

  trackSessionStart(): void {
    this.trackEvent({
      action: 'session_start',
      category: 'therapy',
      label: 'ai_therapy_session',
    });
  }

  trackSessionEnd(duration: number): void {
    this.trackEvent({
      action: 'session_end',
      category: 'therapy',
      label: 'ai_therapy_session',
      value: duration,
      custom_parameters: {
        session_duration: duration,
      },
    });
  }

  trackError(error: string, context?: string): void {
    this.trackEvent({
      action: 'error',
      category: 'application',
      label: error,
      custom_parameters: {
        error_context: context,
      },
    });
  }
}

export const analytics = new Analytics();