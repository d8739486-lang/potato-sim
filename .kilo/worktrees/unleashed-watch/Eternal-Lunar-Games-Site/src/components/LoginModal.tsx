import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../core/store/useAuthStore';
import { LogIn, X, Lock, Key, AlertTriangle, Clock } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RATE_LIMIT_KEY = 'eternal_login_attempts';
const MAX_ATTEMPTS = 5;
const COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes

interface RateLimitData {
  attempts: number;
  firstAttemptAt: number;
  lockedUntil?: number;
}

function getRateLimit(): RateLimitData {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY);
    return raw ? (JSON.parse(raw) as RateLimitData) : { attempts: 0, firstAttemptAt: Date.now() };
  } catch {
    return { attempts: 0, firstAttemptAt: Date.now() };
  }
}

function setRateLimit(data: RateLimitData): void {
  try {
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
  } catch {
    // storage might be full
  }
}

function resetRateLimit(): void {
  localStorage.removeItem(RATE_LIMIT_KEY);
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cooldownSecs, setCooldownSecs] = useState(0);
  const { login } = useAuthStore();

  useEffect(() => {
    if (!isOpen) return;
    const rl = getRateLimit();
    if (rl.lockedUntil && rl.lockedUntil > Date.now()) {
      const tick = () => {
        const remaining = Math.ceil((rl.lockedUntil! - Date.now()) / 1000);
        if (remaining <= 0) {
          resetRateLimit();
          setCooldownSecs(0);
        } else {
          setCooldownSecs(remaining);
        }
      };
      tick();
      const id = setInterval(tick, 1000);
      return () => clearInterval(id);
    }
    setCooldownSecs(0);
  }, [isOpen]);

  if (!isOpen) return null;

  const isAdmin = username.trim().toLowerCase() === 'eternal_lunar';
  const isLocked = cooldownSecs > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || isLocked) return;

    if (isAdmin) {
      const rl = getRateLimit();
      if (rl.lockedUntil && rl.lockedUntil > Date.now()) {
        setCooldownSecs(Math.ceil((rl.lockedUntil - Date.now()) / 1000));
        return;
      }
    }

    setLoading(true);
    setError('');
    const success = await login(username, password);
    setLoading(false);

    if (success) {
      resetRateLimit();
      onClose();
    } else if (isAdmin) {
      const rl = getRateLimit();
      const newAttempts = rl.attempts + 1;
      if (newAttempts >= MAX_ATTEMPTS) {
        setRateLimit({ attempts: newAttempts, firstAttemptAt: rl.firstAttemptAt, lockedUntil: Date.now() + COOLDOWN_MS });
        setCooldownSecs(Math.ceil(COOLDOWN_MS / 1000));
        setError(`Слишком много попыток. Подождите 15 минут.`);
      } else {
        setRateLimit({ attempts: newAttempts, firstAttemptAt: rl.firstAttemptAt });
        setError(`Неверный пароль. Осталось попыток: ${MAX_ATTEMPTS - newAttempts}`);
      }
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m > 0 ? `${m}м ${s}с` : `${s}с`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#121215] w-full max-w-md border border-[#27272a] rounded-2xl shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#27272a]">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-[#38bdf8]" />
            <h2 className="text-base font-bold text-[#f4f4f5]">Авторизация</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Закрыть"
            className="p-1.5 text-[#71717a] hover:text-[#f4f4f5] hover:bg-[#1f1f23] transition-colors rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 md:p-8">
          {isLocked && (
            <div className="mb-5 p-3.5 bg-[#ef5350]/10 border border-[#ef5350]/30 rounded-lg flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-[#ef5350] shrink-0" />
              <p className="text-xs text-[#ef5350] font-medium">
                Попытки исчерпаны. Подождите {formatTime(cooldownSecs)}
              </p>
            </div>
          )}

          {error && !isLocked && (
            <div className="mb-5 p-3.5 bg-[#ef5350]/10 border border-[#ef5350]/30 rounded-lg flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-[#ef5350] shrink-0" />
              <p className="text-xs text-[#ef5350] font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#a1a1aa] mb-1.5">
                Имя пользователя
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                placeholder="Ваш никнейм"
                className="input"
                autoComplete="username"
                required
              />
            </div>

            {isAdmin && (
              <div className="space-y-1 animate-fade-in">
                <label className="block text-xs font-semibold text-[#a1a1aa] mb-1.5 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-[#38bdf8]" />
                  Пароль администратора
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="Введите пароль"
                  className="input"
                  autoComplete="current-password"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading || isLocked}
              className="w-full mt-6 btn btn-primary flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-3.5 h-3.5 border-2 border-t-transparent border-[#000] rounded-full animate-spin" />
                  Вход...
                </span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Войти
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
