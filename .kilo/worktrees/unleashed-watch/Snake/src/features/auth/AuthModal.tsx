import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';
import { signIn, signUp } from './authService';
import { toast } from 'sonner';
import { useSnakeStore } from '../../store/useSnakeStore';

interface AuthModalProps {
  onClose: () => void;
}

const loginSchema = z.object({
  username: z.string().min(1, 'Введите никнейм'),
  password: z.string().min(1, 'Введите пароль'),
});

const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Минимум 3 символа')
    .max(20, 'Максимум 20 символов')
    .regex(/^[a-zA-Z0-9_]+$/, 'Только буквы, цифры и _')
    .refine((v) => v !== 'Eternal_Lunar', 'Этот никнейм зарезервирован'),
  password: z.string().min(8, 'Минимум 8 символов'),
  confirmPassword: z.string(),
  honeypot: z.string(), // скрытое поле для ботов
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export const AuthModal = ({ onClose }: AuthModalProps) => {
  const playSfx = useSnakeStore((s) => s.playSfx);
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Защита от спама: последний сабмит
  const [lastSubmit, setLastSubmit] = useState(0);

  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { honeypot: '' },
  });

  const handleLogin = async (data: LoginForm) => {
    if (Date.now() - lastSubmit < 2000) return;
    setLastSubmit(Date.now());
    setIsSubmitting(true);

    const { error } = await signIn(data.username, data.password);
    if (error) {
      toast.error(error);
    } else {
      toast.success('Добро пожаловать!');
      onClose();
    }
    setIsSubmitting(false);
  };

  const handleRegister = async (data: RegisterForm) => {
    if (Date.now() - lastSubmit < 2000) return;
    setLastSubmit(Date.now());
    setIsSubmitting(true);

    const { error } = await signUp({
      password: data.password,
      username: data.username,
      honeypot: data.honeypot,
    });

    if (error) {
      toast.error(error);
    } else {
      toast.success('Аккаунт создан!');
      onClose();
    }
    setIsSubmitting(false);
  };

  const inputClass =
    'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-lime-500/50 focus:bg-white/8 transition-all text-sm';

  return (
    <div
      className="absolute inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#0e1624] border border-white/10 rounded-3xl w-full max-w-sm flex flex-col shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Декоративный блик */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-lime-500/10 blur-3xl rounded-full pointer-events-none" />

        {/* Шапка */}
        <div className="flex items-center justify-between p-6 pb-0 relative">
          <div className="flex gap-1 bg-white/5 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => { playSfx('click'); setTab('login'); }}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'login' ? 'bg-lime-500 text-black' : 'text-slate-400 hover:text-white'}`}
            >
              <LogIn className="w-4 h-4 inline mr-1.5" />
              Вход
            </button>
            <button
              type="button"
              onClick={() => { playSfx('click'); setTab('register'); }}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'register' ? 'bg-lime-500 text-black' : 'text-slate-400 hover:text-white'}`}
            >
              <UserPlus className="w-4 h-4 inline mr-1.5" />
              Регистрация
            </button>
          </div>
          <button
            type="button"
            onClick={() => { playSfx('click'); onClose(); }}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* ФОРМА ВХОДА */}
          {tab === 'login' && (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-3">
              <div>
                <input
                  {...loginForm.register('username')}
                  type="text"
                  placeholder="Никнейм"
                  className={inputClass}
                  autoComplete="username"
                />
                {loginForm.formState.errors.username && (
                  <p className="text-red-400 text-xs mt-1">{loginForm.formState.errors.username.message}</p>
                )}
              </div>
              <div className="relative">
                <input
                  {...loginForm.register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Пароль"
                  className={`${inputClass} pr-12`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                {loginForm.formState.errors.password && (
                  <p className="text-red-400 text-xs mt-1">{loginForm.formState.errors.password.message}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-lime-500 hover:bg-lime-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-xl transition-colors mt-2"
              >
                {isSubmitting ? 'Входим...' : 'Войти'}
              </button>
            </form>
          )}

          {/* ФОРМА РЕГИСТРАЦИИ */}
          {tab === 'register' && (
            <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-3">
              {/* Honeypot — скрытое поле для ботов */}
              <input
                {...registerForm.register('honeypot')}
                type="text"
                tabIndex={-1}
                aria-hidden="true"
                className="hidden"
              />

              <div>
                <input
                  {...registerForm.register('username')}
                  type="text"
                  placeholder="Никнейм (3-20 символов)"
                  className={inputClass}
                  autoComplete="off"
                />
                {registerForm.formState.errors.username && (
                  <p className="text-red-400 text-xs mt-1">{registerForm.formState.errors.username.message}</p>
                )}
              </div>
              <div className="relative">
                <input
                  {...registerForm.register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Пароль (мин. 8 символов)"
                  className={`${inputClass} pr-12`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div>
                <input
                  {...registerForm.register('confirmPassword')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Подтвердите пароль"
                  className={inputClass}
                  autoComplete="new-password"
                />
                {registerForm.formState.errors.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1">{registerForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              {registerForm.formState.errors.password && (
                <p className="text-red-400 text-xs">{registerForm.formState.errors.password.message}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-lime-500 hover:bg-lime-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-xl transition-colors mt-2"
              >
                {isSubmitting ? 'Создаём аккаунт...' : 'Создать аккаунт'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
