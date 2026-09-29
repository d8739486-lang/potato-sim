import { useState, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { supabase } from '../core/supabase';
import { Loader2 } from 'lucide-react';
import { hashPassword } from '../utils/hash';

interface PlayerNameModalProps {
  onSuccess?: () => void;
}

export default function PlayerNameModal({ onSuccess }: PlayerNameModalProps) {
  const [mode, setMode] = useState<'register' | 'login'>('login');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [canResetAdmin, setCanResetAdmin] = useState(false);
  const { setPlayerName } = useGameStore();

  const nameInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const passwordConfirmInputRef = useRef<HTMLInputElement>(null);

  const handleAdminResetPassword = async () => {
    setIsLoading(true);
    try {
      const cleanName = name.trim();
      const hashedPw = await hashPassword(password);
      const newSessionId = Math.random().toString(36).substring(2, 15);

      const { data: existing, error: fetchError } = await supabase
        .from('players')
        .select('id, state_json, balance, potato_coins, rebirths')
        .ilike('player_name', cleanName)
        .single();

      if (fetchError || !existing) {
        setError('Не удалось найти аккаунт для сброса');
        setIsLoading(false);
        return;
      }

      const updatedStateJson = {
        ...(existing.state_json || {}),
        sessionId: newSessionId
      };

      await supabase
        .from('players')
        .update({
          password_hash: hashedPw,
          state_json: updatedStateJson,
          last_saved_at: new Date().toISOString()
        })
        .eq('id', existing.id);

      if (existing.state_json && typeof existing.state_json === 'object') {
        useGameStore.setState(existing.state_json);
      }

      useGameStore.setState({ 
        playerId: existing.id, 
        sessionId: newSessionId,
        balance: typeof existing.balance === 'number' ? existing.balance : useGameStore.getState().balance,
        potatoCoins: typeof existing.potato_coins === 'number' ? existing.potato_coins : useGameStore.getState().potatoCoins,
        rebirths: typeof existing.rebirths === 'number' ? existing.rebirths : useGameStore.getState().rebirths,
      });
      setPlayerName(cleanName);
      setIsLoading(false);
      if (onSuccess) onSuccess();
    } catch (e) {
      console.error(e);
      setError('Ошибка при сбросе пароля');
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanName = name.trim();
    if (cleanName.length < 2) {
      setError('Никнейм должен содержать минимум 2 символа');
      nameInputRef.current?.focus();
      return;
    }
    if (password.length < 8) {
      setError('Пароль должен содержать минимум 8 символов');
      passwordInputRef.current?.focus();
      return;
    }
    
    if (mode === 'register' && password !== passwordConfirm) {
      setError('Пароли не совпадают!');
      passwordConfirmInputRef.current?.focus();
      return;
    }

    setIsLoading(true);
    setError('');
    setCanResetAdmin(false);

    try {
      const hashedPw = await hashPassword(password);

      const { data: banCheck } = await supabase
        .from('banned_players')
        .select('player_name, reason, ban_type, expires_at')
        .ilike('player_name', cleanName)
        .maybeSingle();

      if (banCheck) {
        if (banCheck.ban_type === 'temporary' && banCheck.expires_at) {
          const expiresDate = new Date(banCheck.expires_at);
          if (expiresDate > new Date()) {
            setError(`❌ ВРЕМЕННЫЙ БАН\nПричина: ${banCheck.reason || 'Нарушение правил'}\nИстекает: ${expiresDate.toLocaleString()}`);
            setIsLoading(false);
            return;
          } else {
            await supabase.from('banned_players').delete().eq('player_name', banCheck.player_name);
          }
        } else {
          setError(`❌ ПЕРМАНЕНТНЫЙ БАН\nПричина: ${banCheck.reason || 'Нарушение правил'}`);
          setIsLoading(false);
          return;
        }
      }

      const newSessionId = Math.random().toString(36).substring(2, 15);

      if (mode === 'register') {
        const { data: existing } = await supabase
          .from('players')
          .select('id')
          .ilike('player_name', cleanName);
          
        if (existing && existing.length > 0) {
          setError('Этот никнейм уже занят!');
          setIsLoading(false);
          return;
        }

        const { data: newPlayer, error: insertError } = await supabase
          .from('players')
          .insert([{ 
            player_name: cleanName, 
            password_hash: hashedPw,
            balance: 0,
            potato_coins: 0,
            rebirths: 0,
            state_json: { sessionId: newSessionId } 
          }])
          .select('id')
          .single();

        if (insertError) {
          setError('Ошибка при сохранении профиля');
          setIsLoading(false);
          return;
        }

        useGameStore.setState({ playerId: newPlayer.id, sessionId: newSessionId });
        setPlayerName(cleanName);
        setIsLoading(false);
        if (onSuccess) onSuccess();
      } else {
        // Login mode
        const { data: existing, error: fetchError } = await supabase
          .from('players')
          .select('id, password_hash, state_json, balance, potato_coins, rebirths')
          .ilike('player_name', cleanName)
          .single();

        if (fetchError || !existing) {
          setError('Аккаунт не найден');
          setIsLoading(false);
          return;
        }

        if (!existing.password_hash) {
          setError('Этот аккаунт старого формата, и в него нельзя войти. Придумайте другой ник.');
          setIsLoading(false);
          return;
        }

        if (existing.password_hash !== hashedPw) {
          if (cleanName.toLowerCase() === 'eternal_lunar') {
            setError('Неверный пароль для eternal_lunar.');
            setCanResetAdmin(true);
          } else {
            setError('Неверный пароль!');
          }
          setIsLoading(false);
          return;
        }

        const updatedStateJson = {
          ...(existing.state_json || {}),
          sessionId: newSessionId
        };

        // Update DB with new session ID immediately
        await supabase
          .from('players')
          .update({ 
            state_json: updatedStateJson,
            last_saved_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        // Apply state if it exists
        if (existing.state_json && typeof existing.state_json === 'object') {
          useGameStore.setState(existing.state_json);
        }

        useGameStore.setState({ 
          playerId: existing.id, 
          sessionId: newSessionId,
          balance: typeof existing.balance === 'number' ? existing.balance : useGameStore.getState().balance,
          potatoCoins: typeof existing.potato_coins === 'number' ? existing.potato_coins : useGameStore.getState().potatoCoins,
          rebirths: typeof existing.rebirths === 'number' ? existing.rebirths : useGameStore.getState().rebirths,
        });
        setPlayerName(cleanName);
        setIsLoading(false);
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      console.error(err);
      setError('Сетевая ошибка');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen bg-black flex items-center justify-center p-4 animate-fade-in z-[100] relative">
      <div className="bg-[#141014] border border-amber-500/30 rounded-[2rem] p-8 w-full max-w-md shadow-[0_0_50px_rgba(245,158,11,0.2)] text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500" />
        
        <div className="text-6xl mb-6 animate-bounce">🥔</div>
        
        <h2 className="text-3xl font-black text-white drop-shadow-md mb-2 tracking-wide uppercase">
          {mode === 'register' ? 'Добро пожаловать!' : 'С возвращением!'}
        </h2>
        <p className="text-white/70 mb-8 font-medium">
          {mode === 'register' ? 'Как к вам обращаться, будущий фермер?' : 'Рады видеть вас снова!'}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input 
            ref={nameInputRef}
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === 'ArrowDown') {
                e.preventDefault();
                passwordInputRef.current?.focus();
              }
            }}
            placeholder={mode === 'register' ? "Введите ваш никнейм..." : "Ваш никнейм..."}
            maxLength={15}
            className="w-full bg-black/50 border-2 border-white/10 rounded-xl p-4 text-white text-xl font-bold text-center focus:outline-none focus:border-amber-500 transition-all placeholder:text-white/20"
            autoFocus
          />
          
          <input 
            ref={passwordInputRef}
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowUp') {
                e.preventDefault();
                nameInputRef.current?.focus();
              } else if (e.key === 'ArrowDown' && mode === 'register') {
                e.preventDefault();
                passwordConfirmInputRef.current?.focus();
              } else if (e.key === 'Enter' && mode === 'register') {
                e.preventDefault();
                passwordConfirmInputRef.current?.focus();
              }
            }}
            placeholder="Пароль (мин. 8 символов)"
            maxLength={30}
            className="w-full bg-black/50 border-2 border-white/10 rounded-xl p-4 text-white text-xl font-bold text-center focus:outline-none focus:border-amber-500 transition-all placeholder:text-white/20"
          />

          {mode === 'register' && (
            <input 
              ref={passwordConfirmInputRef}
              type="password" 
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  passwordInputRef.current?.focus();
                }
              }}
              placeholder="Повторите пароль"
              maxLength={30}
              className="w-full bg-black/50 border-2 border-white/10 rounded-xl p-4 text-white text-xl font-bold text-center focus:outline-none focus:border-amber-500 transition-all placeholder:text-white/20"
            />
          )}

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-500 p-4 rounded-xl text-center font-bold mb-2 whitespace-pre-wrap">
              {error}
            </div>
          )}

          {canResetAdmin && (
            <button
              type="button"
              onClick={handleAdminResetPassword}
              disabled={isLoading || password.length < 8}
              className="w-full py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(217,70,239,0.5)] cursor-pointer text-sm mb-2"
            >
              👑 Обновить пароль для Eternal_Lunar и войти
            </button>
          )}
          
          <button 
            type="submit"
            disabled={name.trim().length < 2 || password.length < 8 || (mode === 'register' && password !== passwordConfirm) || isLoading}
            className="w-full flex justify-center items-center gap-2 py-4 mt-2 bg-amber-500 hover:bg-amber-400 disabled:bg-[#4b5563] disabled:text-white/50 text-[#2c1810] font-black text-xl rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.5)] disabled:shadow-none cursor-pointer disabled:cursor-not-allowed uppercase"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : (mode === 'register' ? 'ПРОДОЛЖИТЬ' : 'ВОЙТИ')}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'register' ? 'login' : 'register');
              setError('');
              setPassword('');
              setPasswordConfirm('');
              setCanResetAdmin(false);
            }}
            className="text-white/50 hover:text-white transition-colors font-bold text-sm cursor-pointer hover:underline"
          >
            {mode === 'register' ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
          </button>
        </div>
      </div>
    </div>
  );
}
