import { useState } from 'react';
import { Shield, Bell, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../../core/store/useAuthStore';
import { realtime } from '../../../core/services/realtime';

export function SettingsTab() {
  const { resetAdminPassword } = useAuthStore();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savedMessage, setSavedMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setSavedMessage({ type: 'error', text: 'Пароли не совпадают' });
      return;
    }
    if (newPassword.length < 8) {
      setSavedMessage({ type: 'error', text: 'Пароль должен быть не менее 8 символов' });
      return;
    }

    const success = await resetAdminPassword(currentPassword, newPassword);
    if (success) {
      setSavedMessage({ type: 'success', text: 'Пароль администратора успешно изменён!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      realtime.sendNotification({
        title: 'Безопасность',
        body: 'Пароль администратора успешно обновлён',
      });
      setTimeout(() => setSavedMessage(null), 4000);
    } else {
      setSavedMessage({ type: 'error', text: 'Текущий пароль неверен' });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#f4f4f5]">Настройки</h1>

      {savedMessage && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
            savedMessage.type === 'success'
              ? 'bg-[#4ade80]/10 border border-[#4ade80]/30 text-[#4ade80]'
              : 'bg-[#ef5350]/10 border border-[#ef5350]/30 text-[#ef5350]'
          }`}
        >
          {savedMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span>{savedMessage.text}</span>
        </div>
      )}

      {/* Security */}
      <div className="bg-[#121215] border border-[#27272a] rounded-xl p-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-[#27272a] mb-6">
          <Shield className="w-5 h-5 text-[#38bdf8]" />
          <h2 className="text-base font-bold text-[#f4f4f5]">Безопасность и пароль</h2>
        </div>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-[#a1a1aa] mb-1.5">Текущий пароль</label>
            <input
              type="password"
              className="input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Введите текущий пароль"
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#a1a1aa] mb-1.5">Новый пароль</label>
            <input
              type="password"
              className="input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Минимум 8 символов"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#a1a1aa] mb-1.5">Повторите новый пароль</label>
            <input
              type="password"
              className="input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Подтверждение нового пароля"
              autoComplete="new-password"
            />
          </div>
          <button
            onClick={handleChangePassword}
            disabled={!currentPassword || !newPassword || !confirmPassword}
            className="btn btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Сменить пароль
          </button>
        </div>
      </div>

      {/* Notifications Info */}
      <div className="bg-[#121215] border border-[#27272a] rounded-xl p-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-[#27272a] mb-4">
          <Bell className="w-5 h-5 text-[#38bdf8]" />
          <h2 className="text-base font-bold text-[#f4f4f5]">Оповещения сайта</h2>
        </div>
        <p className="text-xs text-[#a1a1aa] leading-relaxed">
          Все уведомления отображаются исключительно внутри сайта во всплывающих баннерах и в центре оповещений в правом нижнем углу. Сторонние браузерные уведомления отключены.
        </p>
      </div>

      {/* About */}
      <div className="bg-[#121215] border border-[#27272a] rounded-xl p-6">
        <h2 className="text-base font-bold text-[#f4f4f5] pb-4 border-b border-[#27272a] mb-4">
          Информация о платформе
        </h2>
        <div className="space-y-3 text-xs text-[#a1a1aa]">
          <div className="flex justify-between py-1 border-b border-[#18181b]">
            <span>Платформа:</span>
            <span className="text-[#f4f4f5] font-medium">Eternal Lunar Studio</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#18181b]">
            <span>Хранилище:</span>
            <span className="text-[#f4f4f5] font-medium">Локальное хранилище браузера (LocalStorage)</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#18181b]">
            <span>Синхронизация:</span>
            <span className="text-[#f4f4f5] font-medium">Мгновенная между вкладками (BroadcastChannel)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
