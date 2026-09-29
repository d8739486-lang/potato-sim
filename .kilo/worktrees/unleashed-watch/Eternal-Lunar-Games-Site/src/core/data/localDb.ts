import { DEFAULT_PROJECTS, DEFAULT_SNEAK_PEEKS, DEFAULT_MODS } from './defaultData';

const DATA_VERSION_KEY = 'eternal_data_version';
const DATA_INIT_PREFIX = 'eternal_initialized_';

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  type: 'game' | 'mod';
  cover_url?: string;
  link?: string;
  status: 'Active' | 'Disabled';
  display_type?: 'simple' | 'chapters';
  chapters?: any[];
  chapters_text?: string;
  action_text?: string;
  created_at?: string;
}

export interface SneakPeek {
  id: string;
  slug: string;
  title: string;
  category: 'sneak_peek' | 'announcement' | 'notification' | 'mod_preview' | 'browser_game' | 'app_beta';
  status: 'In Development' | 'Planned' | 'Testing' | 'Released';
  progress: number;
  project_scale?: 'major' | 'medium' | 'mini';
  short_description: string;
  full_content?: string;
  cover_url?: string;
  tags: string[];
  mc_version?: string;
  platform?: string;
  created_at: string;
}

export interface ModButton {
  label: string;
  url: string;
  enabled: boolean;
  style: 'primary' | 'secondary';
}

export interface ModVersion {
  id: string;
  mod_id: string;
  version_number: string;
  mc_version: string;
  platform: string;
  download_url: string;
  file_size: string;
  release_type: 'Release' | 'Beta' | 'Alpha';
  release_date: string;
  changelog: string;
  created_at: string;
}

export interface ModGalleryImage {
  id: string;
  mod_id: string;
  image_url: string;
  caption: string;
  sort_order: number;
}

export interface Mod {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  long_description: string;
  icon_url: string | null;
  banner_url: string | null;
  mc_versions: string[];
  platforms: string[];
  tags: string[];
  links: { source_url?: string; issues_url?: string; discord_url?: string; wiki_url?: string };
  file_url: string | null;
  file_size: string | null;
  buttons: ModButton[];
  changelog: string;
  downloads: number;
  followers: number;
  status: string;
  created_at: string;
  updated_at: string;
  versions?: ModVersion[];
  gallery?: ModGalleryImage[];
}

const DEFAULTS_MAP: Record<string, any[]> = {
  projects: DEFAULT_PROJECTS,
  sneak_peeks: DEFAULT_SNEAK_PEEKS,
  mods: DEFAULT_MODS,
};

class LocalDataStore {
  private cache = new Map<string, any>();
  private subscribers: Map<string, Set<() => void>> = new Map();

  private getStorageKey(table: string): string {
    return `eternal_${table}`;
  }

  private isTableInitialized(table: string): boolean {
    return localStorage.getItem(`${DATA_INIT_PREFIX}${table}`) === 'true';
  }

  private markTableInitialized(table: string): void {
    localStorage.setItem(`${DATA_INIT_PREFIX}${table}`, 'true');
  }

  getTableVersion(table: string): number {
    const key = `${DATA_VERSION_KEY}_${table}`;
    return Number(localStorage.getItem(key) || '0');
  }

  private setTableVersion(table: string, version: number): void {
    const key = `${DATA_VERSION_KEY}_${table}`;
    localStorage.setItem(key, String(version));
  }

  private ensureInitialized(table: string): void {
    if (!this.isTableInitialized(table)) {
      const defaultData = DEFAULTS_MAP[table] || [];
      localStorage.setItem(this.getStorageKey(table), JSON.stringify(defaultData));
      this.markTableInitialized(table);
      this.cache.set(table, defaultData);
    }
  }

  async fetchTable<T>(table: string, _fallbackUrl?: string): Promise<T[]> {
    this.ensureInitialized(table);
    return this.getAll<T>(table);
  }

  getAll<T>(table: string): T[] {
    this.ensureInitialized(table);
    const raw = localStorage.getItem(this.getStorageKey(table));
    if (!raw) return [];
    try {
      return JSON.parse(raw) as T[];
    } catch {
      return [];
    }
  }

  getById<T extends { id: string }>(table: string, id: string): T | null {
    const items = this.getAll<T>(table);
    return items.find((item) => item.id === id) || null;
  }

  insert<T extends { id: string }>(table: string, item: T): T {
    this.ensureInitialized(table);
    const items = this.getAll<T>(table);
    items.push(item);
    localStorage.setItem(this.getStorageKey(table), JSON.stringify(items));
    this.cache.set(table, items);
    this.setTableVersion(table, this.getTableVersion(table) + 1);
    this.notify(table);
    return item;
  }

  update<T extends { id: string }>(table: string, id: string, updates: Partial<T>): T | null {
    this.ensureInitialized(table);
    const items = this.getAll<T>(table);
    const idx = items.findIndex((item) => item.id === id);
    if (idx === -1) return null;
    items[idx] = { ...items[idx], ...updates };
    localStorage.setItem(this.getStorageKey(table), JSON.stringify(items));
    this.cache.set(table, items);
    this.setTableVersion(table, this.getTableVersion(table) + 1);
    this.notify(table);
    return items[idx];
  }

  delete(table: string, id: string): boolean {
    this.ensureInitialized(table);
    const items = this.getAll<any>(table);
    const idx = items.findIndex((item) => item.id === id);
    if (idx === -1) return false;
    items.splice(idx, 1);
    localStorage.setItem(this.getStorageKey(table), JSON.stringify(items));
    this.cache.set(table, items);
    this.setTableVersion(table, this.getTableVersion(table) + 1);
    this.notify(table);
    return true;
  }

  replaceAll<T extends { id: string }>(table: string, items: T[]): void {
    this.markTableInitialized(table);
    localStorage.setItem(this.getStorageKey(table), JSON.stringify(items));
    this.cache.set(table, items);
    this.setTableVersion(table, this.getTableVersion(table) + 1);
    this.notify(table);
  }

  migrateFromStatic(table: string, _fallbackUrl?: string): void {
    this.ensureInitialized(table);
  }

  subscribe(table: string, callback: () => void): () => void {
    if (!this.subscribers.has(table)) {
      this.subscribers.set(table, new Set());
    }
    this.subscribers.get(table)!.add(callback);
    return () => {
      this.subscribers.get(table)?.delete(callback);
    };
  }

  private notify(table: string): void {
    setTimeout(() => {
      this.subscribers.get(table)?.forEach((cb) => cb());
    }, 0);
  }
}

export const localDb = new LocalDataStore();

export function initDataStores(): void {
  localDb.migrateFromStatic('projects');
  localDb.migrateFromStatic('sneak_peeks');
  localDb.migrateFromStatic('mods');
}
