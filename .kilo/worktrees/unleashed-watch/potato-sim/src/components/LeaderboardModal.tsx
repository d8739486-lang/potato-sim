import { useState, useEffect } from 'react';
import { supabase } from '../core/supabase';
import { Trophy, Loader2, X } from 'lucide-react';
import { formatNumber } from '../utils';

interface PlayerData {
  player_name: string;
  balance: number;
  rebirths: number;
  potato_coins?: number;
  state_json?: any;
}

interface LeaderboardModalProps {
  onClose: () => void;
}

export default function LeaderboardModal({ onClose }: LeaderboardModalProps) {
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [owner, setOwner] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getPlayerProgress = (p: PlayerData) => {
      const rebirths = p.rebirths || 0;
      const potatoCoins = p.potato_coins || 0;
      const state = p.state_json || {};

      // Spent coins on rebirth upgrades & space station
      let spentCoins = 0;
      if (state.rebirthUpgrades && typeof state.rebirthUpgrades === 'object') {
        Object.values(state.rebirthUpgrades).forEach((lvl: any) => {
          spentCoins += (Number(lvl) || 0) * 10;
        });
      }
      if (state.spaceStation?.isUnlocked) spentCoins += 5;
      if (state.spaceStation?.greenhouses?.count) spentCoins += (state.spaceStation.greenhouses.count || 0) * 5;

      const totalCoinsValue = potatoCoins + spentCoins;

      // Max potato tier unlocked
      let maxPotatoTier = 1;
      if (Array.isArray(state.unlockedPotatoes)) {
        maxPotatoTier = Math.max(maxPotatoTier, state.unlockedPotatoes.length);
      }
      if (Array.isArray(state.everUnlockedPotatoes)) {
        maxPotatoTier = Math.max(maxPotatoTier, state.everUnlockedPotatoes.length);
      }

      // Purchased plots
      let plotCount = 1;
      if (Array.isArray(state.plots)) {
        plotCount = state.plots.length;
      }

      const balance = p.balance || 0;

      return {
        rebirths,
        totalCoinsValue,
        maxPotatoTier,
        plotCount,
        balance
      };
    };

    const fetchLeaderboard = async () => {
      try {
        const [{ data: playersData, error: pErr }, { data: bannedData }, { data: ownerData }] = await Promise.all([
          supabase
            .from('players')
            .select('player_name, balance, rebirths, potato_coins, state_json')
            .limit(200),
          supabase
            .from('banned_players')
            .select('player_name, ban_type, expires_at'),
          supabase
            .from('players')
            .select('player_name, balance, rebirths, potato_coins, state_json')
            .ilike('player_name', 'eternal_lunar')
            .limit(1)
        ]);

        if (!pErr && playersData) {
          const now = new Date();
          const activeBannedSet = new Set(
            (bannedData || [])
              .filter(b => {
                if (b.ban_type === 'permanent' || !b.ban_type) return true;
                if (b.ban_type === 'temporary' && b.expires_at) {
                  return new Date(b.expires_at) > now;
                }
                return true;
              })
              .map(b => (b.player_name ? b.player_name.trim().toLowerCase() : ''))
          );

          let filteredPlayers = playersData
            .filter(p => p.player_name && !activeBannedSet.has(p.player_name.trim().toLowerCase()))
            .filter(p => p.player_name.trim().toLowerCase() !== 'eternal_lunar');

          filteredPlayers.sort((a, b) => {
            const scoreA = getPlayerProgress(a);
            const scoreB = getPlayerProgress(b);

            if (scoreA.rebirths !== scoreB.rebirths) return scoreB.rebirths - scoreA.rebirths;
            if (scoreA.totalCoinsValue !== scoreB.totalCoinsValue) return scoreB.totalCoinsValue - scoreA.totalCoinsValue;
            if (scoreA.maxPotatoTier !== scoreB.maxPotatoTier) return scoreB.maxPotatoTier - scoreA.maxPotatoTier;
            if (scoreA.plotCount !== scoreB.plotCount) return scoreB.plotCount - scoreA.plotCount;
            return scoreB.balance - scoreA.balance;
          });

          if (ownerData && ownerData.length > 0) {
            setOwner(ownerData[0]);
          } else {
            setOwner(null);
          }

          setPlayers(filteredPlayers.slice(0, 50));
        }
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaderboard();
    
    // Auto-refresh every 3 seconds
    const interval = setInterval(fetchLeaderboard, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-[#1a0f14] border border-amber-500/30 rounded-3xl p-6 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(245,158,11,0.15)] relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-white/50 hover:text-white bg-black/50 hover:bg-amber-500/20 p-2 rounded-xl transition-all border border-transparent hover:border-amber-500/50 cursor-pointer z-10"
        >
          <X size={24} />
        </button>

        <div className="flex items-center gap-4 mb-6 border-b border-amber-500/20 pb-4 shrink-0">
          <div className="bg-amber-500/20 p-3 rounded-full border-2 border-amber-500/50 text-amber-500">
            <Trophy size={32} className="drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white uppercase leading-none">Топ Игроков</h2>
            <p className="text-amber-400/70 font-bold text-sm">Обновляется каждые 3 секунды</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/40 rounded-2xl border border-white/10 p-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-white/50 gap-4">
              <Loader2 size={48} className="animate-spin text-amber-500" />
              <p className="font-bold tracking-widest uppercase">Загрузка данных...</p>
            </div>
          ) : players.length === 0 ? (
            <div className="flex items-center justify-center h-full text-white/50 font-bold">
              Пока нет игроков
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {owner && (() => {
                const state = owner.state_json || {};
                const plots = Array.isArray(state.plots) ? state.plots.length : 1;
                const tier = Array.isArray(state.unlockedPotatoes) ? state.unlockedPotatoes.length : 1;
                return (
                  <div 
                    className="flex items-center justify-between p-4 rounded-xl border bg-cyan-950/40 border-cyan-400/60 shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all hover:scale-[1.01] mb-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-xl bg-gradient-to-br from-cyan-300 to-cyan-600 text-white shadow-[0_0_15px_rgba(34,211,238,0.8)]">
                        💎
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <span className="font-black text-xl text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
                            {owner.player_name}
                          </span>
                          <span className="ml-3 bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 text-[10px] uppercase px-2 py-0.5 rounded-full font-black animate-pulse">
                            Создатель
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-secondary font-black text-xl drop-shadow-[0_0_5px_rgba(244,164,96,0.5)]">{formatNumber(owner.balance)} 🥔</div>
                      <div className="text-white/50 text-xs font-bold flex gap-3 justify-end mt-0.5">
                        <span>Ребитхов: <span className="text-purple-400 font-extrabold">{owner.rebirths}</span></span>
                        <span>| Коинов: <span className="text-amber-400 font-extrabold">{owner.potato_coins || 0}</span></span>
                        <span>| Уровень: <span className="text-blue-400 font-extrabold">Ур. {tier}</span></span>
                        <span>| Грядок: <span className="text-green-400 font-extrabold">{plots}</span></span>
                      </div>
                    </div>
                  </div>
                );
              })()}
              {players.map((p, i) => {
                const state = p.state_json || {};
                const plots = Array.isArray(state.plots) ? state.plots.length : 1;
                const tier = Array.isArray(state.unlockedPotatoes) ? state.unlockedPotatoes.length : 1;
                return (
                  <div 
                    key={p.player_name}
                    className={`flex items-center justify-between p-4 rounded-xl border ${i === 0 ? 'bg-amber-500/20 border-amber-500/50' : i === 1 ? 'bg-slate-300/20 border-slate-300/50' : i === 2 ? 'bg-amber-700/20 border-amber-700/50' : 'bg-black/50 border-white/5'} transition-all hover:scale-[1.01]`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xl ${i === 0 ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]' : i === 1 ? 'bg-slate-300 text-black shadow-[0_0_15px_rgba(203,213,225,0.5)]' : i === 2 ? 'bg-amber-700 text-white shadow-[0_0_15px_rgba(180,83,9,0.5)]' : 'bg-white/10 text-white'}`}>
                        {i + 1}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <span className={`font-black text-xl ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-amber-600' : 'text-white'}`}>
                            {p.player_name}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-secondary font-black text-xl drop-shadow-[0_0_5px_rgba(244,164,96,0.5)]">{formatNumber(p.balance)} 🥔</div>
                      <div className="text-white/50 text-xs font-bold flex gap-3 justify-end mt-0.5">
                        <span>Ребитхов: <span className="text-purple-400 font-extrabold">{p.rebirths}</span></span>
                        <span>| Коинов: <span className="text-amber-400 font-extrabold">{p.potato_coins || 0}</span></span>
                        <span>| Уровень: <span className="text-blue-400 font-extrabold">Ур. {tier}</span></span>
                        <span>| Грядок: <span className="text-green-400 font-extrabold">{plots}</span></span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
