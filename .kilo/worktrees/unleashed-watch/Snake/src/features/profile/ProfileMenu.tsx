import { useState, useRef, useEffect } from 'react';
import { User, LogOut, KeyRound, Trash2, X, ChevronDown, Trophy, Skull, Apple } from 'lucide-react';
import { useAuthStore } from '../auth/useAuthStore';
import { signOut, changePassword, deleteAccount } from '../auth/authService';
import { toast } from 'sonner';
import { useSnakeStore } from '../../store/useSnakeStore';
import { createPortal } from 'react-dom';

interface ProfileMenuProps {
  onOpenAuth: () => void;
}

export const ProfileMenu = ({ onOpenAuth }: ProfileMenuProps) => {
  const { profile, isLoading: isAuthLoading } = useAuthStore();
  const playSfx = useSnakeStore((s) => s.playSfx);
  const [open, setOpen] = useState(false);
  const [showChangePass, setShowChangePass] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Закрыть по клику вне
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (btnRef.current && !btnRef.current.closest('.profile-menu-root')?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleSignOut = async () => {
    playSfx('click');
    setOpen(false);
    await signOut();
    toast.success('Вы вышли из аккаунта');
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      toast.error('Пароли не совпадают');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Пароль должен быть не менее 8 символов');
      return;
    }
    setIsLoading(true);
    const { error } = await changePassword(newPassword);
    setIsLoading(false);
    if (error) {
      toast.error('Ошибка смены пароля');
    } else {
      toast.success('Пароль успешно изменён!');
      setShowChangePass(false);
      setNewPassword('');
      setConfirmNewPassword('');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== 'удалить мой аккаунт') {
      toast.error('Введите текст точно: удалить мой аккаунт');
      return;
    }
    setIsLoading(true);
    const { error } = await deleteAccount();
    setIsLoading(false);
    if (error) {
      toast.error('Ошибка удаления аккаунта');
    } else {
      toast.success('Аккаунт удалён');
      setShowDeleteConfirm(false);
      setOpen(false);
    }
  };

  const initials = profile?.username?.slice(0, 2).toUpperCase() ?? '?';
  const avatarColor = profile ? `hsl(${profile.username.charCodeAt(0) * 13 % 360}, 60%, 45%)` : '#334155';

  if (isAuthLoading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-lime-500/5 border border-lime-500/10 text-lime-400/50 rounded-xl text-sm font-bold animate-pulse">
        <User className="w-4 h-4" />
        Загрузка...
      </div>
    );
  }

  if (!profile) {
    return (
      <button
        type="button"
        onClick={() => { playSfx('click'); onOpenAuth(); }}
        className="flex items-center gap-2 px-4 py-2 bg-lime-500/10 hover:bg-lime-500/20 border border-lime-500/30 text-lime-400 rounded-xl text-sm font-bold transition-all"
      >
        <User className="w-4 h-4" />
        Войти
      </button>
    );
  }

  return (
    <div className="profile-menu-root relative">
      <button
        ref={btnRef}
        type="button"
        onClick={() => { playSfx('click'); setOpen(!open); }}
        className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
          style={{ background: avatarColor }}
        >
          {initials}
        </div>
        <span className="text-sm font-semibold text-white max-w-[100px] truncate">{profile.username}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Дропдаун */}
      {open && createPortal(
        <div
          className="fixed z-[100] bg-[#0e1624] border border-white/10 rounded-2xl shadow-2xl py-2 min-w-[200px] animate-fade-in"
          style={{
            top: (btnRef.current?.getBoundingClientRect().bottom ?? 0) + 8,
            right: window.innerWidth - (btnRef.current?.getBoundingClientRect().right ?? 0),
          }}
        >
          <div className="px-4 py-2 border-b border-white/5 mb-1">
            <p className="text-white font-bold text-sm">{profile.username}</p>
            <div className="text-slate-500 text-xs flex flex-wrap items-center gap-1.5 mt-1">
              <span className="flex items-center gap-1"><Trophy className="w-3.5 h-3.5 text-yellow-500" /> {profile.totalWins} побед</span> &middot;
              <span className="flex items-center gap-1"><Skull className="w-3.5 h-3.5 text-slate-400" /> {profile.totalDeaths} смертей</span> &middot;
              <span className="flex items-center gap-1"><Apple className="w-3.5 h-3.5 text-red-500" /> {profile.totalApplesEaten} яблок</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => { playSfx('click'); setOpen(false); setShowChangePass(true); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:bg-white/5 transition-colors text-sm"
          >
            <KeyRound className="w-4 h-4 text-slate-400" />
            Сменить пароль
          </button>

          <button
            type="button"
            onClick={() => { playSfx('click'); setOpen(false); setShowDeleteConfirm(true); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-500/10 transition-colors text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Удалить аккаунт
          </button>

          <div className="border-t border-white/5 mt-1 pt-1">
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:bg-white/5 transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              Выйти
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* Модалка смены пароля */}
      {showChangePass && createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-[#0e1624] border border-white/10 rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-lime-400" />
                Смена пароля
              </h3>
              <button type="button" onClick={() => setShowChangePass(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              type="password"
              placeholder="Новый пароль"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-lime-500/50 text-sm"
            />
            <input
              type="password"
              placeholder="Подтвердите новый пароль"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-lime-500/50 text-sm"
            />
            <button
              type="button"
              disabled={isLoading}
              onClick={handleChangePassword}
              className="w-full py-3 bg-lime-500 hover:bg-lime-400 disabled:opacity-50 text-black font-bold rounded-xl transition-colors"
            >
              {isLoading ? 'Сохраняем...' : 'Сохранить'}
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* Модалка удаления аккаунта */}
      {showDeleteConfirm && createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-[#0e1624] border border-red-500/30 rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-[0_0_40px_rgba(239,68,68,0.2)]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-red-400 flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Удаление аккаунта
              </h3>
              <button type="button" onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-slate-400 text-sm">
              Это действие необратимо. Все ваши данные будут удалены навсегда.
            </p>
            <p className="text-slate-300 text-sm font-medium">
              Для подтверждения введите: <span className="text-red-400 font-mono">удалить мой аккаунт</span>
            </p>
            <input
              type="text"
              placeholder="удалить мой аккаунт"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              className="w-full bg-white/5 border border-red-500/30 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-red-500/70 text-sm"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-colors"
              >
                Отмена
              </button>
              <button
                type="button"
                disabled={isLoading || deleteInput !== 'удалить мой аккаунт'}
                onClick={handleDeleteAccount}
                className="flex-1 py-3 bg-red-500/80 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors"
              >
                {isLoading ? 'Удаляем...' : 'Удалить'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
