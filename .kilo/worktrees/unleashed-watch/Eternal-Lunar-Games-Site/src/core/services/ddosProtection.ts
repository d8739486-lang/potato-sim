// DDoS Protection Layer: Client-side Rate Limiting, Request Caching & Request Coalescing

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class RequestCache {
  private cache = new Map<string, CacheEntry<any>>();
  private inflight = new Map<string, Promise<any>>();

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlMs = 30000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
  }

  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  async coalesce<T>(key: string, fetcher: () => Promise<T>, ttlMs = 30000): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) return cached;

    if (this.inflight.has(key)) {
      return this.inflight.get(key) as Promise<T>;
    }

    const promise = fetcher()
      .then((data) => {
        this.set(key, data, ttlMs);
        this.inflight.delete(key);
        return data;
      })
      .catch((err) => {
        this.inflight.delete(key);
        throw err;
      });

    this.inflight.set(key, promise);
    return promise;
  }
}

class ClientRateLimiter {
  private timestamps: Map<string, number[]> = new Map();

  /**
   * Checks if an action with a given key exceeds `maxRequests` in `windowMs`.
   * Returns true if allowed, false if rate limited.
   */
  allow(key: string, maxRequests = 30, windowMs = 10000): boolean {
    const now = Date.now();
    const list = this.timestamps.get(key) || [];
    const recent = list.filter((t) => now - t < windowMs);

    if (recent.length >= maxRequests) {
      this.timestamps.set(key, recent);
      return false;
    }

    recent.push(now);
    this.timestamps.set(key, recent);
    return true;
  }

  reset(key: string): void {
    this.timestamps.delete(key);
  }
}

export const requestCache = new RequestCache();
export const clientRateLimiter = new ClientRateLimiter();

/**
 * Safe fetch with built-in client-side DDoS mitigation:
 * - Rate limiting
 * - Request caching with configurable TTL
 * - Simultaneous request coalescing
 */
export async function safeFetch<T>(
  url: string,
  options?: RequestInit,
  ttlMs = 15000
): Promise<T> {
  const method = (options?.method || 'GET').toUpperCase();

  // Non-GET requests should not be cached
  if (method !== 'GET') {
    if (!clientRateLimiter.allow(`write_${url}`, 10, 5000)) {
      throw new Error('Слишком много запросов. Пожалуйста, подождите несколько секунд.');
    }
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  }

  // Rate limit GET requests (max 60 per 10 seconds per endpoint)
  if (!clientRateLimiter.allow(`read_${url}`, 60, 10000)) {
    const cached = requestCache.get<T>(url);
    if (cached !== null) return cached;
    throw new Error('Превышен лимит запросов к серверу. Используются кэшированные данные.');
  }

  // Use request coalescing & caching
  return requestCache.coalesce<T>(
    url,
    async () => {
      const res = await fetch(url, {
        ...options,
        headers: {
          ...options?.headers,
          'Cache-Control': 'no-cache',
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as T;
    },
    ttlMs
  );
}
