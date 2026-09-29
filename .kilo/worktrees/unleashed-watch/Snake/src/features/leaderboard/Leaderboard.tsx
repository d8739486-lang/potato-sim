import { useEffect, useState } from 'react';
import { Trophy, Skull, Apple, X, Loader2, Medal } from 'lucide-react';
import { supabase, mapProfile } from '../../core/supabase';
import type { Profile } from '../../core/supabase';
import { useSnakeStore } from '../../store/useSnakeStore';

type Tab = 'wins' | 'deaths' | 'apples';

interface LeaderboardProps {
  onClose: () => void;
}

const TAB_CONFIG: Array<{ id: Tab; label: string; icon: React.ReactNode; field: string; color: string }> = [
  { id: 'wins', label: 'Победы', icon: <Trophy className="w-4 h-4" />, field: 'total_wins', color: 'text-yellow-400' },
  { id: 'deaths', label: 'Смерти', icon: <Skull className="w-4 h-4" />, field: 'total_deaths', color: 'text-red-400' },
  { id: 'apples', label: 'Яблоки', icon: <Apple className="w-4 h-4" />, field: 'total_apples_eaten', color: 'text-lime-400' },
];

export const Leaderboard = ({ onClose }: LeaderboardProps) => {
  const playSfx = useSnakeStore((s) => s.playSfx);
  const [activeTab, setActiveTab] = useState<Tab>('wins');
  const [players, setPlayers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const activeConfig = TAB_CONFIG.find((t) => t.id === activeTab)!;

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order(activeConfig.field, { ascending: false })
        .limit(10);

      if (!error && data) {
        setPlayers(data.map((r) => mapProfile(r as Record<string, unknown>)));
      }
      setIsLoading(false);
    };

    fetchLeaderboard();
  }, [activeTab, activeConfig.field]);

  const getValue = (p: Profile): number => {
    if (activeTab === 'wins') return p.totalWins;
    if (activeTab === 'deaths') return p.totalDeaths;
    return p.totalApplesEaten;
  };

  const rankIcon = (i: number) => {
    if (i === 0) return <Medal className="w-5 h-5 text-yellow-500 mx-auto" />;
    if (i === 1) return <Medal className="w-5 h-5 text-slate-300 mx-auto" />;
    if (i === 2) return <Medal className="w-5 h-5 text-amber-600 mx-auto" />;
    return <span className="text-slate-400 font-bold">{i + 1}.</span>;
  };

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#0e1624] border border-white/10 rounded-3xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-white/5 shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Лидерборд
          </h2>
          <button
            type="button"
            onClick={() => { playSfx('click'); onClose(); }}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Вкладки */}
        <div className="flex gap-1 p-3 bg-white/3 mx-4 mt-4 rounded-2xl shrink-0">
          {TAB_CONFIG.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => { playSfx('click'); setActiveTab(tab.id); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-white/10 text-white shadow'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className={activeTab === tab.id ? tab.color : ''}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Список */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-lime-500 animate-spin" />
            </div>
          )}

          {!isLoading && players.length === 0 && (
            <div className="text-center py-12 text-slate-500 text-sm">
              Пока нет данных. Сыграй первым!
            </div>
          )}

          {!isLoading && players.map((player, idx) => (
            <div
              key={player.id}
              className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${
                idx === 0 ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-white/3 hover:bg-white/6'
              }`}
            >
              <div className="w-8 shrink-0 flex justify-center items-center">{rankIcon(idx)}</div>

              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
                style={{ background: `hsl(${player.username.charCodeAt(0) * 13 % 360}, 60%, 45%)` }}
              >
                {player.username.slice(0, 2).toUpperCase()}
              </div>

              <span className="flex-1 font-semibold text-white text-sm min-w-0 truncate">
                {player.username}
              </span>

              <span className={`font-black text-lg ${activeConfig.color} shrink-0`}>
                {getValue(player).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
