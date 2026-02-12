// Cookie management system
export interface Cookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires?: Date;
  httpOnly: boolean;
  secure: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

const COOKIES_STORAGE_KEY = 'tinx_cookies';

export class CookieJar {
  private cookies: Map<string, Cookie[]> = new Map();

  constructor() {
    this.load();
  }

  // Load cookies from storage
  private load() {
    const stored = localStorage.getItem(COOKIES_STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      this.cookies = new Map(Object.entries(data));
    }
  }

  // Save cookies to storage
  private save() {
    const data = Object.fromEntries(this.cookies);
    localStorage.setItem(COOKIES_STORAGE_KEY, JSON.stringify(data));
  }

  // Get domain key for cookie storage
  private getDomainKey(domain: string): string {
    return domain.toLowerCase().replace(/^\./, '');
  }

  // Set a cookie
  setCookie(cookie: Cookie) {
    const domainKey = this.getDomainKey(cookie.domain);
    const domainCookies = this.cookies.get(domainKey) || [];

    // Remove existing cookie with same name and path
    const filtered = domainCookies.filter(
      c => !(c.name === cookie.name && c.path === cookie.path)
    );

    filtered.push(cookie);
    this.cookies.set(domainKey, filtered);
    this.save();
  }

  // Get cookies for a domain
  getCookies(domain: string, path: string = '/'): Cookie[] {
    const domainKey = this.getDomainKey(domain);
    const domainCookies = this.cookies.get(domainKey) || [];

    return domainCookies.filter(cookie => {
      // Check if cookie is expired
      if (cookie.expires && new Date(cookie.expires) < new Date()) {
        return false;
      }

      // Check if path matches
      if (!path.startsWith(cookie.path)) {
        return false;
      }

      return true;
    });
  }

  // Get all cookies
  getAllCookies(): Cookie[] {
    const all: Cookie[] = [];
    this.cookies.forEach(cookies => all.push(...cookies));
    return all;
  }

  // Delete a specific cookie
  deleteCookie(domain: string, name: string, path: string = '/') {
    const domainKey = this.getDomainKey(domain);
    const domainCookies = this.cookies.get(domainKey) || [];

    const filtered = domainCookies.filter(
      c => !(c.name === name && c.path === path)
    );

    if (filtered.length === 0) {
      this.cookies.delete(domainKey);
    } else {
      this.cookies.set(domainKey, filtered);
    }

    this.save();
  }

  // Clear all cookies for a domain
  clearDomain(domain: string) {
    const domainKey = this.getDomainKey(domain);
    this.cookies.delete(domainKey);
    this.save();
  }

  // Clear all cookies
  clearAll() {
    this.cookies.clear();
    this.save();
  }

  // Parse Set-Cookie header
  parseSetCookie(setCookieHeader: string, url: string): Cookie | null {
    try {
      const urlObj = new URL(url);
      const parts = setCookieHeader.split(';').map(p => p.trim());
      const [nameValue] = parts;
      const [name, value] = nameValue.split('=');

      const cookie: Cookie = {
        name: name.trim(),
        value: value?.trim() || '',
        domain: urlObj.hostname,
        path: '/',
        httpOnly: false,
        secure: false,
      };

      // Parse attributes
      parts.slice(1).forEach(part => {
        const [key, val] = part.split('=');
        const keyLower = key.toLowerCase();

        if (keyLower === 'domain') {
          cookie.domain = val;
        } else if (keyLower === 'path') {
          cookie.path = val;
        } else if (keyLower === 'expires') {
          cookie.expires = new Date(val);
        } else if (keyLower === 'max-age') {
          const seconds = parseInt(val);
          cookie.expires = new Date(Date.now() + seconds * 1000);
        } else if (keyLower === 'httponly') {
          cookie.httpOnly = true;
        } else if (keyLower === 'secure') {
          cookie.secure = true;
        } else if (keyLower === 'samesite') {
          cookie.sameSite = val as any;
        }
      });

      return cookie;
    } catch (error) {
      console.error('Failed to parse Set-Cookie header:', error);
      return null;
    }
  }

  // Build Cookie header for request
  getCookieHeader(url: string): string {
    try {
      const urlObj = new URL(url);
      const cookies = this.getCookies(urlObj.hostname, urlObj.pathname);

      return cookies
        .map(c => `${c.name}=${c.value}`)
        .join('; ');
    } catch {
      return '';
    }
  }
}

export const cookieJar = new CookieJar();
