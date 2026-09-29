import { create } from 'zustand';
import { playBuySound, playUnbuySound, playButtonSound } from '@/core/audio';

export enum Screen {
  LANGUAGE_SELECT = 'LANGUAGE_SELECT',
  PRELOADER = 'PRELOADER',
  INTRO = 'INTRO',
  START = 'START',
  GAME = 'GAME',
  ENDING = 'ENDING',
}

export type UpgradeType = 'gpu' | 'cpu' | 'drive' | 'autoclicker';

export type EndingStage =
  | 'idle'
  | 'chaos_ch1'
  | 'bios_prologue'
  | 'rebooting_ch1_black'
  | 'booting_chapter1'
  | 'loading_desktop_ch1'
  | 'clean_desktop_ch1'
  | 'end_of_content';

interface UpgradeState {
  count: number;
  max: number;
}

export const LEVELS_DATA: Record<number, any> = {
  1: {
    gpu: {
      name: "GT 710 2GB GDDR5",
      sub: "710 Series",
      memeDescription: {
        en: "It's the base. Runs calculator on ultra and minesweeper in 4K.",
        ru: "Это база. Тянет калькулятор на ультрах и сапёра в 4К."
      },
      description: {
        en: "Budget solution for basic tasks. DirectX 11 support. Allows working with documents and media files.",
        ru: "Бюджетное решение для базовых задач. Поддержка DirectX 11. Позволяет работать с документами и медиафайлами."
      },
      basePrice: 80, boost: 10, type: 'auto'
    },
    cpu: {
      name: "Celeron G5905 3.5GHz",
      sub: "LGA 1200",
      memeDescription: {
        en: "2 cores - PC is doomed... Does anyone still use this?...",
        ru: "2 ядра - компу хана... Им кто то еще пользуется?..."
      },
      description: {
        en: "Entry-level dual-core processor. Ideal for office applications and web surfing.",
        ru: "Двухъядерный процессор начального уровня. Идеален для офисных приложений и серфинга в интернете."
      },
      basePrice: 200, boost: 25, type: 'auto'
    },
    drive: {
      name: "HDD 500GB 5400RPM",
      sub: "SATA III",
      memeDescription: {
        en: "Very loud, Windows loads for 5 minutes, you'll grow old.",
        ru: "Очень шумный, винда грузится по 5 минут, состаришся."
      },
      description: {
        en: "High-capacity storage for data. Spindle speed ensures reliable operation.",
        ru: "Накопитель большой емкости для хранения данных. Скорость вращения шпинделя обеспечивает надежную работу."
      },
      basePrice: 30, boost: 8, type: 'click'
    },
    autoclicker: {
      name: { en: "Auto-Clicker v1", ru: "Авто-Кликер v1" },
      sub: "Basic Scripts",
      memeDescription: {
        en: "Your fingers will say thanks. Works for food.",
        ru: "Твои пальцы скажут спасибо. Работает за еду."
      },
      description: {
        en: "Simple program to simulate clicks. Generates income even when you're resting.",
        ru: "Простая программа для имитации нажатий. Генерирует доход даже когда вы отдыхаете."
      },
      basePrice: 150, boost: 0, type: 'special'
    },
    assets: {
      pc: "/textures/1l/pc1.png",
      gpu: "/textures/1l/g1.png",
      cpu: "/textures/1l/cpu1.png",
      drive: "/textures/1l/drive1.png",
      autoclicker: "/textures/shop/1s/click1.jpg"
    },
    colors: { main: "#0DFF4A", dark: "#003B12", bg: "radial-gradient(circle at center, #001a05 0%, #000000 100%)" }
  },
  2: {
    gpu: {
      name: "RTX 4060 8GB OC",
      sub: "Ada Lovelace",
      memeDescription: {
        en: "People's choice. Runs Cyberpunk (in ultra dreams).",
        ru: "Народный выбор. Тянет киберпанк (в мечтах на ультрах)."
      },
      description: {
        en: "Modern graphics card with DLSS 3.0 and ray tracing. Excellent 1080p performance.",
        ru: "Современная видеокарта с поддержкой DLSS 3.0 и трассировки лучей. Отличная производительность в разрешении 1080p."
      },
      basePrice: 500, boost: 100, type: 'auto'
    },
    cpu: {
      name: "Core i7-13700K",
      sub: "Raptor Lake",
      memeDescription: {
        en: "Vibrant as morning coffee. Digests Chrome without lag.",
        ru: "Бодрый, как кофе с утра. Переваривает Chrome без лагов."
      },
      description: {
        en: "Powerful 16-core processor. High frequency and multithreading for professional work and gaming.",
        ru: "Мощный 16-ядерный процессор. Высокая частота и многопоточность для профессиональной работы и гейминга."
      },
      basePrice: 800, boost: 250, type: 'auto'
    },
    drive: {
      name: "SSD SATA 1TB EVO",
      sub: "V-NAND Tech",
      memeDescription: {
        en: "Forget tea during loading. Everything flies!",
        ru: "Забудь про чай во время загрузки. Всё летает!"
      },
      description: {
        en: "Solid-state drive with read speeds up to 600 MB/s. Reduces system boot time to seconds.",
        ru: "Твердотельный накопитель со скоростью чтения до 600 МБ/с. Сокращает время загрузки системы до секунд."
      },
      basePrice: 250, boost: 80, type: 'click'
    },
    autoclicker: {
      name: { en: "Macro-Bot v2", ru: "Макрос-Бот v2" },
      sub: "Advanced Automation",
      memeDescription: {
        en: "Smart script. Clicks so fast the registry smokes.",
        ru: "Умный скрипт. Кликает так быстро, что дымится реестр."
      },
      description: {
        en: "Advanced automation system. Uses optimized algorithms for maximum income.",
        ru: "Продвинутая система автоматизации. Использует оптимизированные алгоритмы для максимального дохода."
      },
      basePrice: 1200, boost: 0, type: 'special'
    },
    assets: {
      pc: "/textures/2l/pc2.png",
      gpu: "/textures/2l/g2.png",
      cpu: "/textures/2l/cpu2.png",
      drive: "/textures/2l/drive2.png",
      autoclicker: "/textures/shop/2s/click2.jpg"
    },
    colors: { main: "#FF0000", dark: "#400000", bg: "radial-gradient(circle at center, #1a0000 0%, #000000 100%)" }
  },
  3: {
    gpu: {
      name: "Quadro RTX A6000 48GB",
      sub: "Ampere Architecture",
      memeDescription: {
        en: "Rendering king. You can mine happiness.",
        ru: "Король рендеринга. Можно майнить счастье."
      },
      description: {
        en: "Flagship solution for visualization and AI. Huge video memory for complex scenes.",
        ru: "Флагманское решение для визуализации и ИИ. Огромный объем видеопамяти для работы со сложными сценами."
      },
      basePrice: 3000, boost: 1000, type: 'auto'
    },
    cpu: {
      name: "Threadripper 5995WX",
      sub: "Chagall",
      memeDescription: {
        en: "Power of a God. Renders video faster than you film it.",
        ru: "Мощь уровня 'Бог'. Рендерит видео быстрее, чем ты его снимаешь."
      },
      description: {
        en: "Enterprise-grade processor with 64 cores. Unmatched power for rendering and scientific computing.",
        ru: "Процессор серверного уровня с 64 ядрами. Непревзойденная мощь для рендеринга и научных вычислений."
      },
      basePrice: 5000, boost: 2500, type: 'auto'
    },
    drive: {
      name: "NVMe Gen5 Enterprise",
      sub: "PCIe 5.0 x4",
      memeDescription: {
        en: "Speed of light. Data arrives before you click.",
        ru: "Скорость света. Данные прилетают еще до того, как ты кликнул."
      },
      description: {
        en: "Latest generation drive with speeds up to 12000 MB/s. Instant access to any data volume.",
        ru: "Накопитель последнего поколения со скоростью до 12000 МБ/с. Мгновенный доступ к данным любого объема."
      },
      basePrice: 1500, boost: 800, type: 'click'
    },
    autoclicker: {
      name: { en: "AI-Miner v3", ru: "ИИ-Майнер v3" },
      sub: "Neural Engine",
      memeDescription: {
        en: "Singularity is near. Clicks with thought in the 4th dimension.",
        ru: "Сингулярность близко. Кликает силой мысли в 4-м измерении."
      },
      description: {
        en: "Neural network auto-generation system. Optimizes financial flows in real time.",
        ru: "Нейросетевая система автогенерации. Оптимизирует финансовые потоки в реальном времени."
      },
      basePrice: 8000, boost: 0, type: 'special'
    },
    assets: {
      pc: "/textures/3l/pc3.png",
      gpu: "/textures/3l/g3.png",
      cpu: "/textures/3l/cpu3.png",
      drive: "/textures/3l/drive3.png",
      autoclicker: "/textures/shop/3s/click3.jpg"
    },
    colors: { main: "#0099FF", dark: "#002040", bg: "radial-gradient(circle at center, #00111a 0%, #000000 100%)" }
  }
};

export enum GameTab {
  TERMINAL = 'TERMINAL',
  HARDWARE = 'HARDWARE',
  SHOP = 'SHOP',
}

interface GameState {
  screen: Screen;
  setScreen: (screen: Screen) => void;

  activeTab: GameTab;
  setTab: (tab: GameTab) => void;

  evolution: number;
  isEvolving: boolean;
  balance: number;
  autoGen: number;
  clickPower: number;
  upgrades: Record<UpgradeType, UpgradeState>;

  addMoney: (amount?: number) => void;
  buyUpgrade: (type: UpgradeType, silent?: boolean) => void;
  getUpgradePrice: (type: UpgradeType) => number;
  evolve: () => void;
  buyAll: () => void;

  isReWatchingTeaser: boolean;
  setIsReWatchingTeaser: (val: boolean) => void;

  showDebug: boolean;
  setShowDebug: (show: boolean) => void;
  endingStage: EndingStage;
  setEndingStage: (stage: EndingStage) => void;
  resetGame: () => void;
  language: 'en' | 'ru' | null;
  setLanguage: (lang: 'en' | 'ru') => void;
}


export const useGameStore = create<GameState>()((set, get) => ({
  screen: Screen.LANGUAGE_SELECT,
  setScreen: (screen) => set({ screen }),

  activeTab: GameTab.TERMINAL,
  setTab: (activeTab) => set({ activeTab }),

  evolution: 1,
  isEvolving: false,
  balance: 0,
  autoGen: 0,
  clickPower: 1,
  upgrades: {
    gpu: { count: 0, max: 5 },
    cpu: { count: 0, max: 5 },
    drive: { count: 0, max: 5 },
    autoclicker: { count: 0, max: 1 },
  },
  isReWatchingTeaser: false,
  setIsReWatchingTeaser: (isReWatchingTeaser) => set({ isReWatchingTeaser }),

  showDebug: false,
  setShowDebug: (showDebug) => set({ showDebug }),

  endingStage: 'idle',
  setEndingStage: (endingStage) => set({ endingStage }),

  resetGame: () => set({
    screen: Screen.GAME,
    evolution: 1,
    isEvolving: false,
    balance: 0,
    autoGen: 0,
    clickPower: 1,
    activeTab: GameTab.TERMINAL,
    endingStage: 'idle',
    upgrades: {
      gpu: { count: 0, max: 5 },
      cpu: { count: 0, max: 5 },
      drive: { count: 0, max: 5 },
      autoclicker: { count: 0, max: 1 },
    },
  }),

  language: null,
  setLanguage: (language) => set({ language }),

  addMoney: (amount) => set((state) => ({
    balance: state.balance + (amount !== undefined ? amount : state.clickPower)
  })),

  getUpgradePrice: (type) => {
    const { evolution, upgrades } = get();
    const upgrade = upgrades[type];
    const basePrice = LEVELS_DATA[evolution][type].basePrice;
    return Math.floor(basePrice * Math.pow(1.5, upgrade.count));
  },

  buyUpgrade: (type, silent = false) => {
    const { balance, upgrades, getUpgradePrice, evolution } = get();
    const price = getUpgradePrice(type);
    const upgrade = upgrades[type];

    if (balance >= price && upgrade.count < upgrade.max) {
      if (!silent) playBuySound();
      const upgradeData = LEVELS_DATA[evolution][type];
      const boost = upgradeData.boost;

      set((state) => ({
        balance: state.balance - price,
        autoGen: state.autoGen + (upgradeData.type === 'auto' ? boost : 0),
        clickPower: state.clickPower + (upgradeData.type === 'click' ? boost : Math.max(1, Math.floor(boost * 0.1))),
        upgrades: {
          ...state.upgrades,
          [type]: { ...upgrade, count: upgrade.count + 1 }
        }
      }));
    } else {
      if (!silent) playUnbuySound();
    }
  },

  buyAll: () => {
    const { isEvolving } = get();
    if (isEvolving) return;

    let boughtSomething = false;
    const upgradeTypes: UpgradeType[] = ['gpu', 'cpu', 'drive', 'autoclicker'];

    // We use a while loop to buy as much as possible
    // To be efficient, we'll keep buying the cheapest affordable item
    let safetyCounter = 0;
    while (safetyCounter < 50) { // Max 21 upgrades total (5*3 + 1 + something)
      safetyCounter++;

      // Get current prices
      const affordable = upgradeTypes
        .map(type => ({ type, price: get().getUpgradePrice(type), upgrade: get().upgrades[type] }))
        .filter(item => item.upgrade.count < item.upgrade.max && get().balance >= item.price)
        .sort((a, b) => a.price - b.price);

      if (affordable.length === 0) break;

      // Buy the cheapest one
      get().buyUpgrade(affordable[0].type, true);
      boughtSomething = true;
    }

    if (boughtSomething) {
      playBuySound();
    } else {
      playUnbuySound();
    }
  },



  evolve: async () => {
    const { evolution, isEvolving } = get();
    if (evolution < 3 && !isEvolving) {
      playButtonSound();
      set({ isEvolving: true });

      await new Promise(r => setTimeout(r, 900));

      set((state) => {
        const nextEvolution = state.evolution + 1;
        const nextClickPower = nextEvolution === 2 ? 5 : nextEvolution === 3 ? 25 : 1;

        return {
          evolution: nextEvolution,
          balance: 0,
          autoGen: 0,
          clickPower: nextClickPower,
          upgrades: {
            gpu: { count: 0, max: 5 },
            cpu: { count: 0, max: 5 },
            drive: { count: 0, max: 5 },
            autoclicker: { count: 0, max: 1 },
          }
        };
      });

      await new Promise(r => setTimeout(r, 2000));
      set({ isEvolving: false });
    }
  }
}));
