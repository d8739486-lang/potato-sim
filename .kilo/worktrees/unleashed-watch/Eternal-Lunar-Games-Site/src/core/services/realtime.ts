// In-site notification & realtime broadcast system
// Cross-tab real-time sync via BroadcastChannel & localStorage
// ALL notifications are strictly in-site (toast banners + NotificationCenter dropdown).
// No browser engine Notification API.

const BROADCAST_CHANNEL_NAME = 'eternal_lunar_realtime';
const DATA_CHANGED_EVENT = 'eternal_data_changed';
const UNREAD_KEY = 'eternal_unread_notifications';

export type EventType =
  | 'projects'
  | 'sneak_peeks'
  | 'mods'
  | 'auth'
  | 'notification';

export interface RealtimePayload {
  type: EventType;
  action: 'insert' | 'update' | 'delete' | 'replace' | 'auth_state' | 'notify';
  id?: string;
  data?: any;
  timestamp: number;
  sourceTabId?: string;
}

// ---------------------------------------------------------------------------
// Tab identification
// ---------------------------------------------------------------------------
const TAB_ID_KEY = '__eternal_tab_id__';
let tabId: string | null = localStorage.getItem(TAB_ID_KEY);
if (!tabId) {
  tabId = crypto.randomUUID();
  localStorage.setItem(TAB_ID_KEY, tabId);
}

function getTabId(): string {
  return tabId!;
}

// ---------------------------------------------------------------------------
// Broadcast channel
// ---------------------------------------------------------------------------
let bc: BroadcastChannel | null = null;
if (typeof BroadcastChannel !== 'undefined') {
  try {
    bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    bc.onmessage = (event: MessageEvent<RealtimePayload>) => {
      const payload = event.data;
      if (payload.sourceTabId === getTabId()) return;
      handleRealtimeMessage(payload);
    };
  } catch {
    bc = null;
  }
}

// ---------------------------------------------------------------------------
// Subscriber management
// ---------------------------------------------------------------------------
type Listener = (payload: RealtimePayload) => void;
const listeners: Map<EventType, Set<Listener>> = new Map();

export function subscribe(eventType: EventType, callback: Listener): () => void {
  if (!listeners.has(eventType)) {
    listeners.set(eventType, new Set());
  }
  listeners.get(eventType)!.add(callback);
  return () => {
    listeners.get(eventType)?.delete(callback);
  };
}

// ---------------------------------------------------------------------------
// Message handler
// ---------------------------------------------------------------------------
function handleRealtimeMessage(payload: RealtimePayload): void {
  const set = listeners.get(payload.type);
  if (set && set.size > 0) {
    set.forEach((cb) => cb(payload));
  }

  if (['projects', 'sneak_peeks', 'mods'].includes(payload.type)) {
    (['projects', 'sneak_peeks', 'mods'] as EventType[]).forEach((type) => {
      listeners.get(type)?.forEach((cb) => cb(payload));
    });
  }

  if (payload.type === 'notification' && payload.action === 'notify' && payload.data) {
    showToastNotification(payload.data);
  }
}

// ---------------------------------------------------------------------------
// Broadcast
// ---------------------------------------------------------------------------
export function broadcast(payload: RealtimePayload): void {
  const fullPayload: RealtimePayload = {
    ...payload,
    timestamp: Date.now(),
    sourceTabId: getTabId(),
  };

  if (bc) {
    bc.postMessage(fullPayload);
  }

  const channelKey = `${DATA_CHANGED_EVENT}_${payload.type}`;
  localStorage.setItem(channelKey, JSON.stringify(fullPayload));
  setTimeout(() => {
    localStorage.removeItem(channelKey);
  }, 100);
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e: StorageEvent) => {
    if (!e.key || !e.newValue) return;
    if (e.key.startsWith(DATA_CHANGED_EVENT)) {
      try {
        const payload = JSON.parse(e.newValue) as RealtimePayload;
        if (!payload || typeof payload !== 'object' || !payload.type || !payload.action) return;
        if (payload.sourceTabId === getTabId()) return;
        handleRealtimeMessage(payload);
      } catch {
        // ignore
      }
    }
  });
}

export function notifyDataChanged(
  type: EventType,
  action: 'insert' | 'update' | 'delete' | 'replace',
  data?: any,
  id?: string
): void {
  broadcast({ type, action, data, id, timestamp: Date.now() });
}

// ---------------------------------------------------------------------------
// In-site Notification system (strictly UI toasts and in-site center)
// ---------------------------------------------------------------------------
export interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  url?: string;
  persistentId?: string;
}

export function sendNotification(data: NotificationData): void {
  // Always trigger in-page toast inside the website
  showToastNotification(data);
}

function showToastNotification(data: NotificationData): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent('eternal-toast', {
      detail: {
        title: data.title,
        message: data.body,
        id: data.persistentId || crypto.randomUUID(),
        url: data.url,
      },
    })
  );
}

// ---------------------------------------------------------------------------
// Stored notifications for in-site dropdown
// ---------------------------------------------------------------------------
export interface StoredNotification {
  id: string;
  title: string;
  body: string;
  timestamp: number;
  url?: string;
  read: boolean;
}

export function addUnreadNotification(notification: Omit<StoredNotification, 'id' | 'read'>): void {
  try {
    const existingRaw = localStorage.getItem(UNREAD_KEY);
    const existing: StoredNotification[] = existingRaw ? JSON.parse(existingRaw) : [];
    const newNotification: StoredNotification = {
      ...notification,
      id: crypto.randomUUID(),
      read: false,
    };
    existing.unshift(newNotification);
    const trimmed = existing.slice(0, 50);
    localStorage.setItem(UNREAD_KEY, JSON.stringify(trimmed));

    broadcast({
      type: 'notification',
      action: 'notify',
      data: newNotification,
      timestamp: Date.now(),
    });
  } catch (e) {
    console.error('[Notifications] Failed to store unread:', e);
  }
}

export function getUnreadNotifications(): StoredNotification[] {
  try {
    const raw = localStorage.getItem(UNREAD_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function markNotificationRead(id: string): void {
  try {
    const all = getUnreadNotifications();
    const updated = all.map((n) => (n.id === id ? { ...n, read: true } : n));
    localStorage.setItem(UNREAD_KEY, JSON.stringify(updated));
    broadcast({ type: 'notification', action: 'update', data: { id, read: true }, timestamp: Date.now() });
  } catch {
    // ignore
  }
}

export function markAllNotificationsRead(): void {
  try {
    const all = getUnreadNotifications();
    const updated = all.map((n) => ({ ...n, read: true }));
    localStorage.setItem(UNREAD_KEY, JSON.stringify(updated));
    broadcast({ type: 'notification', action: 'replace', data: updated, timestamp: Date.now() });
  } catch {
    // ignore
  }
}

export function clearAllNotifications(): void {
  localStorage.setItem(UNREAD_KEY, JSON.stringify([]));
  broadcast({ type: 'notification', action: 'replace', data: [], timestamp: Date.now() });
}

export const realtime = {
  subscribe,
  broadcast,
  notifyDataChanged,
  sendNotification,
  addUnreadNotification,
  getUnreadNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  clearAllNotifications,
};
