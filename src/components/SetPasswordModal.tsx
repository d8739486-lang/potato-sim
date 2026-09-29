import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { supabase } from '../core/supabase';
import { Loader2, ShieldCheck } from 'lucide-react';
import { hashPassword } from '../utils/hash';

export default function SetPasswordModal() {
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { playerId, playerName } = useGameStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8 || !playerId) return;

    if (password !== passwordConfirm) {
      setError('Пароли не совпадают!');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const hashedPw = await hashPassword(password);
      
      const { error: updateError } = await supabase
        .from('players')
        .update({ password_hash: hashedPw })
        .eq('id', playerId);

      if (updateError) {
        console.error(updateError);
        setError('Не удалось сохранить пароль. Попробуйте еще раз.');
        setIsLoading(false);
        return;
      }

      // Success, we trigger a re-render in App.tsx by updating a dummy state or relying on the useEffect?
      // We can just reload the page for simplicity to re-run the check, or add a state in gameStore.
      window.location.reload();
      
    } catch (err) {
      console.error(err);
      setError('Сетевая ошибка');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen bg-black/90 flex items-center justify-center p-4 animate-fade-in z-[200] fixed inset-0 backdrop-blur-sm">
      <div className="bg-[#141014] border border-blue-500/30 rounded-[2rem] p-8 w-full max-w-md shadow-[0_0_50px_rgba(59,130,246,0.3)] text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-cyan-300 to-blue-500" />
        
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center animate-pulse">
            <ShieldCheck size={48} className="text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
          </div>
        </div>
        
        <h2 className="text-3xl font-black text-white drop-shadow-md mb-2 tracking-wide uppercase">
          Защита Аккаунта
        </h2>
        <p className="text-white/80 mb-6 font-medium text-sm leading-relaxed">
          Привет, <span className="font-black text-amber-400">{playerName}</span>! В игре появилась система аккаунтов. Чтобы вы не потеряли свой прогресс, придумайте пароль.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Новый пароль (от 8 символов)"
            maxLength={30}
            className="w-full bg-black/50 border-2 border-white/10 rounded-xl p-4 text-white text-xl font-bold text-center focus:outline-none focus:border-blue-500 transition-all placeholder:text-white/20"
            autoFocus
          />

          <input 
            type="password" 
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            placeholder="Повторите пароль"
            maxLength={30}
            className="w-full bg-black/50 border-2 border-white/10 rounded-xl p-4 text-white text-xl font-bold text-center focus:outline-none focus:border-blue-500 transition-all placeholder:text-white/20"
          />

          {error && <div className="text-red-400 font-bold text-sm bg-red-500/20 p-3 rounded-lg border border-red-500/30">{error}</div>}
          
          <button 
            type="submit"
            disabled={password.length < 8 || password !== passwordConfirm || isLoading}
            className="w-full flex justify-center items-center gap-2 py-4 mt-2 bg-blue-500 hover:bg-blue-400 disabled:bg-[#4b5563] disabled:text-white/50 text-white font-black text-xl rounded-xl transition-all shadow-[0_0_15px_rgba(59,130,246,0.5)] disabled:shadow-none cursor-pointer disabled:cursor-not-allowed uppercase"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : 'СОХРАНИТЬ ПАРОЛЬ'}
          </button>
        </form>
      </div>
    </div>
  );
}
