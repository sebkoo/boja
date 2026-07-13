export interface Cache {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T, ttlMs?: number): Promise<void>;
  delete(key: string): Promise<void>;
}

/**
 * Enough cache for one process; the interface is what matters — a Redis
 * implementation must be able to replace this without callers changing.
 */
export class InMemoryCache implements Cache {
  private readonly entries = new Map<string, { value: unknown; expiresAt: number | null }>();

  constructor(private readonly now: () => number = Date.now) {}

  async get<T>(key: string): Promise<T | undefined> {
    const entry = this.entries.get(key);
    if (entry === undefined) return undefined;
    if (entry.expiresAt !== null && entry.expiresAt <= this.now()) {
      this.entries.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
    this.entries.set(key, {
      value,
      expiresAt: ttlMs === undefined ? null : this.now() + ttlMs,
    });
  }

  async delete(key: string): Promise<void> {
    this.entries.delete(key);
  }
}
