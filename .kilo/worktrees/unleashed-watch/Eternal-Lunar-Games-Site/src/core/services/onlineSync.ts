// In-site sync & polling helper
import {
  realtime,
  getUnreadNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  clearAllNotifications,
  type StoredNotification,
} from './realtime';
import { safeFetch } from './ddosProtection';

export {
  getUnreadNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  clearAllNotifications,
  type StoredNotification,
};

const POLL_INTERVAL_MS = 30000;
const VERSION_ENDPOINTS: Record<string, string> = {
  projects: '/api/version/projects',
  sneak_peeks: '/api/version/sneak_peeks',
  mods: '/api/version/mods',
};

export type PollableTable = 'projects' | 'sneak_peeks' | 'mods';

interface VersionInfo {
  version: string;
  timestamp: number;
  count: number;
}

const lastSeenHashes: Record<PollableTable, string | null> = {
  projects: null,
  sneak_peeks: null,
  mods: null,
};

type DataChangeListener = (table: PollableTable, data: any[]) => void;
const changeListeners: Map<PollableTable, Set<DataChangeListener>> = new Map();

export function onDataChange(table: PollableTable, callback: DataChangeListener): () => void {
  if (!changeListeners.has(table)) {
    changeListeners.set(table, new Set());
  }
  changeListeners.get(table)!.add(callback);
  return () => {
    changeListeners.get(table)?.delete(callback);
  };
}

function notifyChangeListeners(table: PollableTable, data: any[]): void {
  changeListeners.get(table)?.forEach((cb) => cb(table, data));
}

async function fetchVersionInfo(table: PollableTable): Promise<VersionInfo | null> {
  try {
    const data = await safeFetch<VersionInfo>(VERSION_ENDPOINTS[table], {
      headers: { Accept: 'application/json' },
    }, 10000);
    return data;
  } catch {
    return null;
  }
}

async function fetchData(table: PollableTable): Promise<any[]> {
  return await safeFetch<any[]>(`/data/${table}.json`, undefined, 5000);
}

async function pollTable(table: PollableTable): Promise<boolean> {
  try {
    const versionInfo = await fetchVersionInfo(table);
    if (!versionInfo) return false;

    const currentHash = versionInfo.version;
    const lastHash = lastSeenHashes[table];

    if (lastHash === null) {
      lastSeenHashes[table] = currentHash;
      return false;
    }

    if (currentHash !== lastHash) {
      const newData = await fetchData(table);
      lastSeenHashes[table] = currentHash;
      notifyChangeListeners(table, newData);

      // In-site notification
      const eventName = table === 'sneak_peeks' ? 'Новая публикация' : `Обновление раздела ${table}`;
      realtime.sendNotification({
        title: eventName,
        body: `Обновлено элементов: ${newData.length}`,
      });

      return true;
    }

    return false;
  } catch {
    return false;
  }
}

let pollIntervalId: ReturnType<typeof setInterval> | null = null;
let isPollingActive = false;

export function startPolling(): void {
  if (isPollingActive) return;
  isPollingActive = true;

  pollIntervalId = setInterval(() => {
    pollTable('projects');
    pollTable('sneak_peeks');
    pollTable('mods');
  }, POLL_INTERVAL_MS);
}

export function stopPolling(): void {
  if (pollIntervalId) {
    clearInterval(pollIntervalId);
    pollIntervalId = null;
  }
  isPollingActive = false;
}
