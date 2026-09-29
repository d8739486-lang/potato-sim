import { useGameStore, Screen, GameTab } from '@/core/store';
import { cn } from '@/core/utils';
import { ShoppingCart, LayoutGrid, Cpu } from 'lucide-react';
import { playButtonSound, playPanelSound, playMenuSfx } from '@/core/audio';
import { t } from '@/core/i18n';

// Moved outside to prevent destroying/recreating DOM nodes on re-render
const NavButton = ({ icon: Icon, label, tab, activeTab, onTabClick }: any) => {
  const isActive = activeTab === tab;
  
  return (
    <button
      onClick={() => !isActive && !onTabClick.isEvolving && onTabClick(tab)}
      disabled={isActive || onTabClick.isEvolving}
      className={cn(
        "flex items-center gap-2 px-6 py-2 border-x border-matrix-dark transition-all group",
        isActive ? "bg-matrix/10 text-matrix border-b-2 border-b-matrix cursor-default" : "text-matrix/40 hover:text-matrix hover:bg-matrix/5 cursor-pointer"
      )}
    >
      <Icon size={18} className={cn(isActive && "animate-pulse")} />
      <span className="text-sm font-black tracking-tight uppercase">{label}</span>
    </button>
  );
};

export const TopPanel = () => {
  // Use specific selectors to prevent re-rendering when other state (like balance) changes
  const activeTab = useGameStore((state) => state.activeTab);
  const setTab = useGameStore((state) => state.setTab);
  const setScreen = useGameStore((state) => state.setScreen);
  const isEvolving = useGameStore((state) => state.isEvolving);

  const handleTabClick = (tab: GameTab) => {
    if (isEvolving) return;
    playPanelSound(200);
    setTab(tab);
  };

  return (
    <div className="w-full h-14 bg-black/90 border-b-2 border-matrix-dark flex items-center justify-between px-10 fixed top-0 left-0 z-50 backdrop-blur-xl">
      <div className="flex h-full border-l border-matrix-dark">
        <NavButton icon={LayoutGrid} label={t('tabs.terminal')} tab={GameTab.TERMINAL} activeTab={activeTab} onTabClick={handleTabClick} />
        <NavButton icon={Cpu} label={t('tabs.hardware')} tab={GameTab.HARDWARE} activeTab={activeTab} onTabClick={handleTabClick} />
        <NavButton icon={ShoppingCart} label={t('tabs.shop')} tab={GameTab.SHOP} activeTab={activeTab} onTabClick={handleTabClick} />
      </div>

      <div className="flex items-center gap-6">
        <div className="text-[10px] text-matrix/30 font-mono hidden lg:block tracking-widest uppercase">
          CONNECTED // ADDR: 0x{Math.random().toString(16).slice(2, 6).toUpperCase()}
        </div>
      </div>
    </div>
  );
};
