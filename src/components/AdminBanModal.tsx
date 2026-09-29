import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { X, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../core/supabase';

export default function AdminBanModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { playerName } = useGameStore();

  const [banPlayerName, setBanPlayerName] = useState('');
  const [banReason, setBanReason] = useState('Нарушение правил');
  const [banType, setBanType] = useState<'permanent' | 'temporary'>('permanent');
  const [banDays, setBanDays] = useState('7');
  const [bannedPlayers, setBannedPlayers] = useState<any[]>([]);
  const [registeredPlayers, setRegisteredPlayers] = useState<string[]>([]);

  const loadBannedPlayers = async () => {
    const { data } = await supabase.from('banned_players').select('*').order('created_at', { ascending: false });
    if (data) setBannedPlayers(data);
  };

  const loadRegisteredPlayers = async () => {
    const { data } = await supabase.from('players').select('player_name').order('player_name');
    if (data) setRegisteredPlayers(data.map(p => p.player_name));
  };

  useEffect(() => {
    if (isOpen) {
      loadBannedPlayers();
      loadRegisteredPlayers();
    }
  }, [isOpen]);

  const handleBan = async () => {
    const nameToBan = banPlayerName.trim();
    if (!nameToBan) return;
    try {
      const expires_at = banType === 'temporary' 
        ? new Date(Date.now() + parseInt(banDays) * 24 * 60 * 60 * 1000).toISOString()
        : null;

      // 1. Удаляем существующую запись бана, если есть, чтобы исключить конфликты
      await supabase.from('banned_players').delete().ilike('player_name', nameToBan);

      // 2. Создаем новую запись бана
      const { error } = await supabase.from('banned_players').insert([{
        player_name: nameToBan,
        reason: banReason,
        ban_type: banType,
        expires_at
      }]);

      if (error) {
        toast.error(`Ошибка при бане: ${error.message || 'Проверьте соединение'}`);
        console.error('Ban error:', error);
      } else {
        toast.success(`Игрок ${nameToBan} забанен!`);
        setBanPlayerName('');
        loadBannedPlayers();
      }
    } catch (e: any) {
      toast.error(`Ошибка при бане: ${e?.message || e}`);
      console.error('Ban exception:', e);
    }
  };

  const handleUnban = async (name: string) => {
    const { error } = await supabase.from('banned_players').delete().eq('player_name', name);
    if (!error) {
      toast.success(`Игрок ${name} разбанен!`);
      loadBannedPlayers();
    }
  };

  useEffect(() => {
    const handleCustomOpen = () => setIsOpen(true);
    window.addEventListener('open-ban-modal', handleCustomOpen);
    return () => window.removeEventListener('open-ban-modal', handleCustomOpen);
  }, []);

  if (playerName?.toLowerCase() !== 'eternal_lunar') return null;
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={() => { setIsOpen(false); window.dispatchEvent(new CustomEvent('open-cheat-console')); }}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div 
        className="relative bg-zinc-950 border-2 border-red-500/50 rounded-[2rem] w-full max-w-3xl max-h-[90vh] shadow-[0_0_50px_rgba(239,68,68,0.2)] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={() => { setIsOpen(false); window.dispatchEvent(new CustomEvent('open-cheat-console')); }}
          className="absolute top-6 right-6 text-white/50 hover:text-white bg-black/50 hover:bg-red-500 rounded-full p-2 transition-all cursor-pointer z-10"
        >
          <X size={24} />
        </button>

        <div className="p-8 pb-4 bg-gradient-to-b from-red-900/40 to-transparent shrink-0">
          <div className="flex items-center gap-4 border-b border-red-500/20 pb-4">
            <div className="bg-red-500/20 p-3 rounded-full border-2 border-red-500/50 text-red-500">
              <ShieldAlert size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white uppercase leading-none">Панель Банов</h2>
              <p className="text-red-400 font-bold text-sm">Система правосудия картофельного мира</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-0 flex flex-col gap-6">
          <div className="bg-black/40 border border-red-500/20 rounded-2xl p-4 flex flex-col gap-4">
            <div className="flex gap-4 items-end bg-red-500/5 p-4 rounded-xl border border-red-500/20">
              <div className="flex-1">
                <label className="text-red-400 font-bold text-xs uppercase mb-1 block">Никнейм игрока</label>
                <input type="text" value={banPlayerName} onChange={e => setBanPlayerName(e.target.value)} className="w-full bg-black/50 border border-red-500/20 rounded-lg p-2 text-white font-bold focus:border-red-500 focus:outline-none" placeholder="Кого баним?" />
                {registeredPlayers.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1 max-h-16 overflow-y-auto custom-scrollbar">
                    <span className="text-[10px] text-white/40 font-bold self-center mr-1">Быстрый выбор:</span>
                    {registeredPlayers.map(name => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setBanPlayerName(name)}
                        className={`text-[11px] px-2 py-0.5 rounded cursor-pointer transition-all border font-bold ${
                          banPlayerName === name 
                            ? 'bg-red-500 text-white border-red-400' 
                            : 'bg-white/10 hover:bg-red-500/30 text-white/80 border-white/10 hover:border-red-400'
                        }`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <label className="text-red-400 font-bold text-xs uppercase mb-1 block">Причина</label>
                <input type="text" value={banReason} onChange={e => setBanReason(e.target.value)} className="w-full bg-black/50 border border-red-500/20 rounded-lg p-2 text-white font-bold focus:border-red-500 focus:outline-none" />
              </div>
              <div className="w-32">
                <label className="text-red-400 font-bold text-xs uppercase mb-1 block">Тип бана</label>
                <select value={banType} onChange={(e: any) => setBanType(e.target.value)} className="w-full bg-black/50 border border-red-500/20 rounded-lg p-2 text-white font-bold focus:border-red-500 focus:outline-none">
                  <option value="permanent">Навсегда</option>
                  <option value="temporary">Временно</option>
                </select>
              </div>
              {banType === 'temporary' && (
                <div className="w-24">
                  <label className="text-red-400 font-bold text-xs uppercase mb-1 block">Дней</label>
                  <input type="number" value={banDays} onChange={e => setBanDays(e.target.value)} className="w-full bg-black/50 border border-red-500/20 rounded-lg p-2 text-white font-bold focus:border-red-500 focus:outline-none" />
                </div>
              )}
              <button onClick={handleBan} className="px-6 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg border border-red-400 transition-all cursor-pointer h-[42px]">
                ЗАБАНИТЬ
              </button>
            </div>

            <div className="mt-4 border border-red-500/20 rounded-xl overflow-hidden">
              <div className="bg-red-950/50 p-2 px-4 text-red-400 font-bold text-sm uppercase tracking-wider flex justify-between">
                <span>Забаненные игроки ({bannedPlayers.length})</span>
              </div>
              <div className="max-h-80 overflow-y-auto custom-scrollbar bg-black/50 p-2">
                {bannedPlayers.length === 0 ? (
                  <div className="p-4 text-center text-white/40 font-bold">
                    Пока никто не забанен
                  </div>
                ) : (
                  bannedPlayers.map(bp => (
                    <div key={bp.id} className="flex justify-between items-center bg-black/40 border border-white/5 rounded-lg p-2 mb-2 last:mb-0">
                      <div>
                        <span className="text-white font-bold text-lg">{bp.player_name}</span>
                        <span className="ml-2 text-xs text-red-400/80 uppercase px-2 py-1 bg-red-500/10 rounded">
                          {bp.ban_type === 'permanent' ? 'Навсегда' : `До ${new Date(bp.expires_at).toLocaleDateString()}`}
                        </span>
                        <div className="text-white/50 text-sm">{bp.reason}</div>
                      </div>
                      <button onClick={() => handleUnban(bp.player_name)} className="px-4 py-2 bg-green-500/20 hover:bg-green-500 text-green-400 hover:text-white font-bold rounded-lg border border-green-500/50 transition-all cursor-pointer">
                        РАЗБАНИТЬ
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
