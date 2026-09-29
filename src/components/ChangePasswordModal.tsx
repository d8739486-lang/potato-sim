import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { supabase } from '../core/supabase';
import { Loader2, KeyRound, X } from 'lucide-react';
import { hashPassword } from '../utils/hash';

interface ChangePasswordModalProps {
  onClose: () => void;
}

export default function ChangePasswordModal({ onClose }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { playerId } = useGameStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 8) {
      setError('Новый пароль должен быть не менее 8 символов.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Новые пароли не совпадают!');
      return;
    }

    if (!playerId) {
      setError('Ошибка: игрок не найден.');
      return;
    }

    setIsLoading(true);

    try {
      // Check current password
      const hashedCurrentPw = await hashPassword(currentPassword);
      
      const { data: existing, error: fetchError } = await supabase
        .from('players')
        .select('password_hash')
        .eq('id', playerId)
        .single();

      if (fetchError || !existing) {
        setError('Не удалось найти ваш профиль.');
        setIsLoading(false);
        return;
      }

      if (existing.password_hash !== hashedCurrentPw) {
        setError('Текущий пароль введен неверно.');
        setIsLoading(false);
        return;
      }

      // Update password
      const hashedNewPw = await hashPassword(newPassword);
      
      const { error: updateError } = await supabase
        .from('players')
        .update({ password_hash: hashedNewPw })
        .eq('id', playerId);

      if (updateError) {
        setError('Ошибка при смене пароля. Попробуйте позже.');
        setIsLoading(false);
        return;
      }

      setSuccess('Пароль успешно изменен!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      setError('Сетевая ошибка');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-[#1a110a] border border-blue-500/50 rounded-3xl p-8 w-full max-w-md shadow-[0_0_50px_rgba(59,130,246,0.2)] relative text-center">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-white/50 hover:text-white bg-black/50 hover:bg-blue-500/20 p-2 rounded-xl transition-all border border-transparent hover:border-blue-500/50 cursor-pointer"
        >
          <X size={24} />
        </button>

        <div className="flex justify-center mb-6">
          <div className="bg-blue-500/20 p-4 rounded-full border-2 border-blue-500/50 text-blue-500">
            <KeyRound size={40} />
          </div>
        </div>
        
        <h2 className="text-3xl font-black text-white uppercase mb-2">Смена пароля</h2>
        <p className="text-white/70 mb-8 font-medium">Придумайте новый надежный пароль</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input 
            type="password" 
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Текущий пароль"
            className="w-full bg-black/50 border-2 border-white/10 rounded-xl p-4 text-white text-xl font-bold text-center focus:outline-none focus:border-blue-500 transition-all placeholder:text-white/20"
            autoFocus
          />

          <input 
            type="password" 
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Новый пароль (от 8 символов)"
            className="w-full bg-black/50 border-2 border-white/10 rounded-xl p-4 text-white text-xl font-bold text-center focus:outline-none focus:border-blue-500 transition-all placeholder:text-white/20"
          />

          <input 
            type="password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Повторите новый пароль"
            className="w-full bg-black/50 border-2 border-white/10 rounded-xl p-4 text-white text-xl font-bold text-center focus:outline-none focus:border-blue-500 transition-all placeholder:text-white/20"
          />

          {error && <div className="text-red-400 font-bold text-sm bg-red-500/20 p-3 rounded-lg border border-red-500/30">{error}</div>}
          {success && <div className="text-green-400 font-bold text-sm bg-green-500/20 p-3 rounded-lg border border-green-500/30">{success}</div>}
          
          <button 
            type="submit"
            disabled={!currentPassword || newPassword.length < 8 || newPassword !== confirmPassword || isLoading}
            className="w-full flex justify-center items-center gap-2 py-4 mt-2 bg-blue-500 hover:bg-blue-400 disabled:bg-[#4b5563] disabled:text-white/50 text-white font-black text-xl rounded-xl transition-all shadow-[0_0_15px_rgba(59,130,246,0.5)] disabled:shadow-none cursor-pointer disabled:cursor-not-allowed uppercase"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : 'СОХРАНИТЬ'}
          </button>
        </form>
      </div>
    </div>
  );
}
