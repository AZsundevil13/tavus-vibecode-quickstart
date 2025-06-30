import { logger } from './logger';

export class SecurityUtils {
  /**
   * Sanitize user input to prevent XSS attacks
   */
  static sanitizeInput(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }

    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  /**
   * Validate API token format
   */
  static validateApiToken(token: string): boolean {
    if (!token || typeof token !== 'string') {
      return false;
    }

    // Basic validation - adjust based on Tavus API token format
    const tokenRegex = /^[a-f0-9]{32}$/i;
    return tokenRegex.test(token);
  }

  /**
   * Generate a secure random string for nonces
   */
  static generateNonce(length: number = 16): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }

  /**
   * Check if the current connection is secure
   */
  static isSecureConnection(): boolean {
    return window.location.protocol === 'https:' || window.location.hostname === 'localhost';
  }

  /**
   * Validate conversation URL to prevent malicious redirects
   */
  static validateConversationUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      
      // Only allow Tavus/Daily.co domains
      const allowedDomains = [
        'tavus.daily.co',
        'daily.co',
        'api.daily.co'
      ];
      
      return allowedDomains.some(domain => 
        parsedUrl.hostname === domain || parsedUrl.hostname.endsWith(`.${domain}`)
      );
    } catch (error) {
      logger.error('Invalid conversation URL', { url, error });
      return false;
    }
  }

  /**
   * Rate limiting for API calls
   */
  static createRateLimiter(maxCalls: number, windowMs: number) {
    const calls: number[] = [];
    
    return {
      canMakeCall(): boolean {
        const now = Date.now();
        
        // Remove calls outside the window
        while (calls.length > 0 && calls[0] <= now - windowMs) {
          calls.shift();
        }
        
        if (calls.length >= maxCalls) {
          return false;
        }
        
        calls.push(now);
        return true;
      },
      
      getRemainingCalls(): number {
        const now = Date.now();
        
        // Remove calls outside the window
        while (calls.length > 0 && calls[0] <= now - windowMs) {
          calls.shift();
        }
        
        return Math.max(0, maxCalls - calls.length);
      }
    };
  }
}

// Create rate limiters for different API endpoints
export const apiRateLimiter = SecurityUtils.createRateLimiter(10, 60000); // 10 calls per minute
export const conversationRateLimiter = SecurityUtils.createRateLimiter(5, 300000); // 5 conversations per 5 minutes