import { localDb } from '../data/localDb';
import type { ProjectItem, SneakPeek, Mod, ModVersion, ModGalleryImage, ModButton } from '../data/localDb';
import { realtime, type EventType } from './realtime';

export type { ProjectItem, SneakPeek, Mod, ModVersion, ModGalleryImage, ModButton };

// =============================================================================
// Projects (Games / Apps)
// =============================================================================
export async function fetchProjects(): Promise<ProjectItem[]> {
  const stored = localDb.getAll<ProjectItem>('projects');
  return stored.filter((p) => p.status === 'Active');
}

export function subscribeToProjects(onChange: (projects: ProjectItem[]) => void): () => void {
  return localDb.subscribe('projects', () => {
    onChange(localDb.getAll<ProjectItem>('projects').filter((p) => p.status === 'Active'));
  });
}

export function createProject(project: Omit<ProjectItem, 'id' | 'created_at'>): ProjectItem {
  const newProject: ProjectItem = {
    ...project,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    status: project.status || 'Active',
  };
  localDb.insert('projects', newProject);
  realtime.notifyDataChanged('projects' as EventType, 'insert', newProject, newProject.id);
  return newProject;
}

export function updateProject(id: string, updates: Partial<ProjectItem>): ProjectItem | null {
  const updated = localDb.update('projects', id, updates);
  if (updated) {
    realtime.notifyDataChanged('projects' as EventType, 'update', updated, id);
  }
  return updated;
}

export function deleteProject(id: string): boolean {
  const ok = localDb.delete('projects', id);
  if (ok) {
    realtime.notifyDataChanged('projects' as EventType, 'delete', { id }, id);
  }
  return ok;
}

// =============================================================================
// Sneak Peeks
// =============================================================================
export async function fetchSneakPeeks(): Promise<SneakPeek[]> {
  return localDb.getAll<SneakPeek>('sneak_peeks');
}

export function subscribeToSneakPeeks(onChange: (peeks: SneakPeek[]) => void): () => void {
  return localDb.subscribe('sneak_peeks', () => {
    onChange(localDb.getAll<SneakPeek>('sneak_peeks'));
  });
}

export function createSneakPeek(peek: Omit<SneakPeek, 'id' | 'created_at'>): SneakPeek {
  const newPeek: SneakPeek = {
    ...peek,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    tags: peek.tags ?? [],
    progress: peek.progress ?? 0,
    status: peek.status ?? 'In Development',
    project_scale: peek.project_scale ?? 'medium',
  };
  localDb.insert('sneak_peeks', newPeek);
  realtime.notifyDataChanged('sneak_peeks' as EventType, 'insert', newPeek, newPeek.id);
  return newPeek;
}

export function updateSneakPeek(id: string, updates: Partial<SneakPeek>): SneakPeek | null {
  const updated = localDb.update('sneak_peeks', id, updates);
  if (updated) {
    realtime.notifyDataChanged('sneak_peeks' as EventType, 'update', updated, id);
  }
  return updated;
}

export function deleteSneakPeek(id: string): boolean {
  const ok = localDb.delete('sneak_peeks', id);
  if (ok) {
    realtime.notifyDataChanged('sneak_peeks' as EventType, 'delete', { id }, id);
  }
  return ok;
}

// =============================================================================
// Mods
// =============================================================================
export async function fetchMods(): Promise<Mod[]> {
  const stored = localDb.getAll<Mod>('mods');
  return stored.filter((m) => m.status === 'Active');
}

export function subscribeToMods(onChange: (mods: Mod[]) => void): () => void {
  return localDb.subscribe('mods', () => {
    onChange(localDb.getAll<Mod>('mods').filter((m) => m.status === 'Active'));
  });
}

export function fetchModBySlug(slug: string): Mod | null {
  const mods = localDb.getAll<Mod>('mods');
  return mods.find((m) => m.slug === slug) || null;
}

export function createMod(mod: Omit<Mod, 'id' | 'created_at' | 'updated_at'>): Mod {
  const newMod: Mod = {
    ...mod,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: mod.status || 'Active',
    downloads: mod.downloads ?? 0,
    followers: mod.followers ?? 0,
    tags: mod.tags ?? [],
    platforms: mod.platforms ?? [],
    mc_versions: mod.mc_versions ?? [],
    links: mod.links ?? {},
    buttons: mod.buttons ?? [],
  };
  localDb.insert('mods', newMod);
  realtime.notifyDataChanged('mods' as EventType, 'insert', newMod, newMod.id);
  return newMod;
}

export function updateMod(id: string, updates: Partial<Mod>): Mod | null {
  const updated = localDb.update('mods', id, { ...updates, updated_at: new Date().toISOString() });
  if (updated) {
    realtime.notifyDataChanged('mods' as EventType, 'update', updated, id);
  }
  return updated;
}

export function deleteMod(id: string): boolean {
  const ok = localDb.delete('mods', id);
  if (ok) {
    realtime.notifyDataChanged('mods' as EventType, 'delete', { id }, id);
  }
  return ok;
}

export function incrementModDownloads(slug: string): void {
  const mod = localDb.getAll<Mod>('mods').find((m) => m.slug === slug);
  if (mod) {
    localDb.update<Mod>('mods', mod.id, { downloads: (mod.downloads || 0) + 1 });
  }
}

// =============================================================================
// Utility
// =============================================================================
export function formatDownloads(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export function formatFileSize(raw: string | null | undefined): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  const matchUnit = trimmed.match(/^([\d.]+)\s*(KB|MB|GB|B)$/i);
  if (matchUnit) {
    const value = parseFloat(matchUnit[1]);
    const unit = matchUnit[2].toUpperCase();
    if (unit === 'KB' && value >= 1024) {
      const mb = value / 1024;
      return `${mb % 1 === 0 ? mb.toFixed(0) : mb.toFixed(1)} MB`;
    }
    return trimmed;
  }
  const num = parseFloat(trimmed);
  if (!isNaN(num)) {
    if (num >= 1_000_000) {
      if (num >= 1_073_741_824) return `${(num / 1_073_741_824).toFixed(1)} GB`;
      if (num >= 1_048_576) return `${(num / 1_048_576).toFixed(1)} MB`;
      return `${(num / 1024).toFixed(1)} KB`;
    }
    if (num >= 1024) {
      const mb = num / 1024;
      return `${mb % 1 === 0 ? mb.toFixed(0) : mb.toFixed(1)} MB`;
    }
    return `${num} KB`;
  }
  return trimmed;
}
