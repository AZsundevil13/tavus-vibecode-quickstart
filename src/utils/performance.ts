import { logger } from './logger';

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTiming(label: string): void {
    this.metrics.set(label, performance.now());
  }

  endTiming(label: string): number {
    const startTime = this.metrics.get(label);
    if (!startTime) {
      logger.warn(`No start time found for metric: ${label}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.metrics.delete(label);
    
    logger.debug(`Performance metric: ${label} took ${duration.toFixed(2)}ms`);
    return duration;
  }

  measureAsync<T>(label: string, asyncFn: () => Promise<T>): Promise<T> {
    this.startTiming(label);
    
    return asyncFn()
      .then(result => {
        this.endTiming(label);
        return result;
      })
      .catch(error => {
        this.endTiming(label);
        throw error;
      });
  }

  getMemoryUsage(): MemoryInfo | null {
    if ('memory' in performance) {
      return (performance as any).memory;
    }
    return null;
  }

  logMemoryUsage(): void {
    const memory = this.getMemoryUsage();
    if (memory) {
      logger.debug('Memory usage', {
        used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`,
      });
    }
  }

  observeWebVitals(): void {
    // Core Web Vitals monitoring
    if ('web-vitals' in window) {
      // This would require installing web-vitals package
      // For now, we'll use basic performance observer
      this.observePerformanceEntries();
    }
  }

  private observePerformanceEntries(): void {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming;
              logger.debug('Navigation timing', {
                domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
                loadComplete: navEntry.loadEventEnd - navEntry.loadEventStart,
                totalTime: navEntry.loadEventEnd - navEntry.fetchStart,
              });
            }
          }
        });

        observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });
      } catch (error) {
        logger.error('Failed to set up performance observer', error);
      }
    }
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

// Performance decorator for functions
export function measurePerformance(label: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = function (...args: any[]) {
      performanceMonitor.startTiming(`${target.constructor.name}.${propertyName}`);
      
      try {
        const result = method.apply(this, args);
        
        if (result instanceof Promise) {
          return result.finally(() => {
            performanceMonitor.endTiming(`${target.constructor.name}.${propertyName}`);
          });
        } else {
          performanceMonitor.endTiming(`${target.constructor.name}.${propertyName}`);
          return result;
        }
      } catch (error) {
        performanceMonitor.endTiming(`${target.constructor.name}.${propertyName}`);
        throw error;
      }
    };
  };
}