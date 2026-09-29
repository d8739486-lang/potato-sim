import { useState, useEffect } from 'react';
import { Bell, X, Check, Info } from 'lucide-react';
import {
  getUnreadNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  clearAllNotifications,
  type StoredNotification,
} from '../core/services/onlineSync';

interface ToastItem {
  id: string;
  title: string;
  message: string;
  url?: string;
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<StoredNotification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const refresh = () => {
    setNotifications(getUnreadNotifications());
  };

  useEffect(() => {
    refresh();

    // Listen for custom in-site toasts
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent<{ title: string; message: string; id?: string; url?: string }>;
      if (!customEvent.detail) return;
      const newToast: ToastItem = {
        id: customEvent.detail.id || crypto.randomUUID(),
        title: customEvent.detail.title,
        message: customEvent.detail.message,
        url: customEvent.detail.url,
      };

      setToasts((prev) => [...prev, newToast]);

      // Auto dismiss after 4 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 4000);

      refresh();
    };

    window.addEventListener('eternal-toast', handleToast);
    window.addEventListener('storage', refresh);

    return () => {
      window.removeEventListener('eternal-toast', handleToast);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
    refresh();
  };

  const handleClearAll = () => {
    if (confirm('Очистить все уведомления?')) {
      clearAllNotifications();
      refresh();
    }
  };

  const handleNotificationClick = (n: StoredNotification) => {
    if (!n.read) {
      markNotificationRead(n.id);
    }
    refresh();
    if (n.url && n.url.startsWith('/')) {
      window.location.href = n.url;
    }
  };

  return (
    <>
      {/* In-Site Floating Toast Stack (Top-Right) */}
      <div className="fixed top-20 right-6 z-[200] flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto bg-[#18181b] border border-[#27272a] shadow-2xl rounded-xl p-4 flex items-start gap-3 animate-fade-in text-[#f4f4f5]"
          >
            <div className="p-2 rounded-lg bg-[#38bdf8]/10 text-[#38bdf8] shrink-0 mt-0.5">
              <Info className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-[#f4f4f5]">{t.title}</h4>
              <p className="text-xs text-[#a1a1aa] mt-0.5 leading-relaxed">{t.message}</p>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
              className="text-[#71717a] hover:text-[#f4f4f5] p-1 transition-colors cursor-pointer"
              title="Закрыть"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* In-Site Bottom-Right Notification Bell */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="relative w-11 h-11 bg-[#18181b] border border-[#27272a] hover:border-[#38bdf8]/50 text-[#f4f4f5] transition-all rounded-xl shadow-lg flex items-center justify-center cursor-pointer hover:bg-[#27272a]"
          title="Уведомления сайта"
        >
          <Bell className="w-5 h-5 text-[#38bdf8]" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-[#ef5350] text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {showDropdown && (
          <div className="absolute bottom-14 right-0 w-80 sm:w-96 bg-[#121215] border border-[#27272a] rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="px-4 py-3 border-b border-[#27272a] flex items-center justify-between bg-[#18181b]">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#38bdf8]" />
                <h3 className="font-bold text-[#f4f4f5] text-sm">Уведомления</h3>
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-[#38bdf8] hover:bg-[#27272a] px-2 py-1 rounded-md transition-colors"
                    title="Прочитать все"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={handleClearAll}
                  className="text-xs text-[#71717a] hover:text-[#ef5350] hover:bg-[#27272a] px-2 py-1 rounded-md transition-colors"
                  title="Очистить"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Notifications list */}
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-[#71717a] text-xs">
                Уведомлений пока нет
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto divide-y divide-[#27272a]">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`p-3.5 cursor-pointer transition-colors hover:bg-[#18181b] ${
                      n.read ? 'opacity-50' : 'bg-[#141417]'
                    }`}
                  >
                    <div className="text-sm font-semibold text-[#f4f4f5]">{n.title}</div>
                    <div className="text-xs text-[#a1a1aa] mt-1 line-clamp-2 leading-relaxed">
                      {n.body}
                    </div>
                    <div className="text-[10px] text-[#71717a] mt-1.5">
                      {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
