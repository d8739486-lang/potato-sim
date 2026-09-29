import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { supabase } from '../core/supabase';
import { Loader2, AlertTriangle, X } from 'lucide-react';

interface DeleteAccountModalProps {
  onClose: () => void;
  onDeleted: () => void;
}

export default function DeleteAccountModal({ onClose, onDeleted }: DeleteAccountModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { playerId, logout } = useGameStore();

  const targetPhrase = 'я хочу удалить мой аккаунт';

  const handleDelete = async () => {
    if (confirmText !== targetPhrase) return;
    if (!playerId) return;

    setIsLoading(true);
    setError('');

    try {
      const { error: deleteError } = await supabase
        .from('players')
        .delete()
        .eq('id', playerId);

      if (deleteError) {
        setError('Ошибка при удалении аккаунта.');
        setIsLoading(false);
        return;
      }

      logout();
      onDeleted();
    } catch (err) {
      console.error(err);
      setError('Сетевая ошибка');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-[#1a110a] border border-red-800/50 rounded-3xl p-8 w-full max-w-md shadow-[0_0_50px_rgba(153,27,27,0.3)] relative text-center">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-white/50 hover:text-white bg-black/50 hover:bg-red-500/20 p-2 rounded-xl transition-all border border-transparent hover:border-red-500/50 cursor-pointer"
        >
          <X size={24} />
        </button>

        <div className="flex justify-center mb-6">
          <div className="bg-red-800/20 p-4 rounded-full border-2 border-red-800/50 text-red-500 animate-pulse">
            <AlertTriangle size={40} />
          </div>
        </div>
        
        <h2 className="text-3xl font-black text-white uppercase mb-2">Удаление Аккаунта</h2>
        <p className="text-white/70 mb-4 font-medium">
          Это действие <span className="text-red-400 font-bold">навсегда</span> удалит ваш прогресс и профиль из таблицы лидеров. Восстановить данные будет невозможно!
        </p>

        <div className="bg-red-950/30 border border-red-800/30 p-4 rounded-xl mb-6">
          <p className="text-sm text-red-200/70 mb-2">Чтобы подтвердить удаление, напишите следующую фразу:</p>
          <p className="font-bold text-white select-all">{targetPhrase}</p>
        </div>

        <div className="flex flex-col gap-4">
          <input 
            type="text" 
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Введите фразу здесь..."
            className="w-full bg-black/50 border-2 border-white/10 rounded-xl p-4 text-white text-lg font-bold text-center focus:outline-none focus:border-red-500 transition-all placeholder:text-white/20"
            autoFocus
          />

          {error && <div className="text-red-400 font-bold text-sm bg-red-500/20 p-3 rounded-lg border border-red-500/30">{error}</div>}
          
          <button 
            onClick={handleDelete}
            disabled={confirmText !== targetPhrase || isLoading}
            className="w-full flex justify-center items-center gap-2 py-4 mt-2 bg-red-800 hover:bg-red-700 disabled:bg-[#4b5563] disabled:text-white/50 text-white font-black text-xl rounded-xl transition-all shadow-[0_0_15px_rgba(153,27,27,0.5)] disabled:shadow-none cursor-pointer disabled:cursor-not-allowed uppercase"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : 'УДАЛИТЬ НАВСЕГДА'}
          </button>
        </div>
      </div>
    </div>
  );
}
