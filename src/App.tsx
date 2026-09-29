import { useState, useEffect, useRef } from 'react';
import { Play, Settings, X, Volume2, Music, Loader2, Home, Package, Store, Wheat, Trophy, Rocket, HelpCircle, Globe } from 'lucide-react';
import { toast } from 'sonner';

import Shop from './components/Shop';
import Warehouse from './components/Warehouse';
import Field from './components/Field';
// import ActionLog from './components/ActionLog';
import ChangelogModal from './components/ChangelogModal';
import UnlockModal from './components/UnlockModal';
import LeaderboardModal from './components/LeaderboardModal';
import PlayerNameModal from './components/PlayerNameModal';
import SetPasswordModal from './components/SetPasswordModal';
import ChangePasswordModal from './components/ChangePasswordModal';
import DeleteAccountModal from './components/DeleteAccountModal';
import HowToPlayModal from './components/HowToPlayModal';
import ConfirmModal from './components/ConfirmModal';
import SpaceStation from './components/SpaceStation';
import SpaceCutscene from './components/SpaceCutscene';
import EndingCutscene from './components/EndingCutscene';
import MobileBlockerModal from './components/MobileBlockerModal';

import { useTranslation } from './hooks/useTranslation';
import { useGameStore } from './store/gameStore';
import { supabase } from './core/supabase';
import { formatNumber } from './utils';
import { ERA_INFO } from './data/gameData';

// Critical assets needed immediately for the initial screen and main menu
const CRITICAL_IMAGE_ASSETS = [
  '/sprites/bg.png',
];

// Audio loaded immediately for start / menu sound
const CRITICAL_AUDIO_ASSETS = [
  '/soundtracks/menu_bgm.mp3',
  '/sfx/click.wav',
];

// Secondary assets streamed in the background after the menu is already interactive
const SECONDARY_IMAGE_ASSETS = [
  '/sprites/bg_field_grass.png',
  '/sprites/potato_base.png',
  '/sprites/seed_packet_base.png',
  '/sprites/sprinkler_base.png',
  '/sprites/tool_watering_can.png',
  '/sprites/tool_hoe.png',
  '/sprites/tool_shovel.png',
];

const SECONDARY_AUDIO_ASSETS = [
  '/soundtracks/game_bgm.mp3',
  '/soundtracks/space_bgm.mp3',
  '/sfx/takeoff.wav',
  '/sfx/slider.wav',
  '/sfx/buy.wav',
  '/sfx/plant.wav',
  '/sfx/hoe.wav',
  '/sfx/harvest.wav',
  '/sfx/shovel.wav',
];

type GameState = 
  | 'menu' 
  | 'starting' 
  | 'loading_zone' 
  | 'safe_zone' 
  | 'shop' 
  | 'warehouse' 
  | 'field'
  | 'space'
  | 'space_cutscene'
  | 'ending'
  | 'waiting_start'
  | 'name_entry';

export default function App() {
  const { t, language, setLanguage } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  const [gameState, setGameState] = useState<GameState>('waiting_start');

  const [showSettings, setShowSettings] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isClosingSettings, setIsClosingSettings] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [needsPassword, setNeedsPassword] = useState(false);
  const { 
    resetProgress,
    logout,
    balance, 
    playerName, 
    playerId,
    masterVolume,
    musicVolume,
    soundVolume,
    setVolumes,
    rebirths,
    spaceStation,
    currentEra
  } = useGameStore();
  const eraInfo = ERA_INFO[currentEra] || ERA_INFO.potato;

  // Audio References
  const menuAudioRef = useRef<HTMLAudioElement | null>(null);
  const gameAudioRef = useRef<HTMLAudioElement | null>(null);
  const spaceAudioRef = useRef<HTMLAudioElement | null>(null);
  const sliderAudioRef = useRef<HTMLAudioElement | null>(null);

  // Управление громкостью через Ref для доступа в таймаутах
  const musicVolumeRef = useRef(musicVolume);
  
  // Функция для расчета реальной громкости (на 60% тише от номинала, чтобы музыка не оглушала)
  const getActualVolume = (vol: number) => ((vol ?? 60) / 100) * ((masterVolume ?? 100) / 100) * 0.4;

  useEffect(() => {
    if (gameState === 'name_entry' && playerName) {
      setGameState('menu');
    } else if (!playerName && gameState !== 'waiting_start' && gameState !== 'name_entry') {
      setGameState('name_entry');
    }
  }, [playerName, gameState]);

  // Check if legacy user needs a password
  useEffect(() => {
    if (playerName) {
      if (!playerId) {
        // Very old local save before we added DB IDs. Force re-auth to get an ID and Password
        useGameStore.setState({ playerName: null });
      } else {
        // Has playerId, check if password_hash exists
        const checkPassword = async () => {
          try {
            const { data } = await supabase
              .from('players')
              .select('password_hash')
              .eq('id', playerId)
              .single();
              
            if (data && data.password_hash === null) {
              setNeedsPassword(true);
            } else {
              setNeedsPassword(false);
            }
          } catch (e) {
            console.error('Failed to check password status', e);
          }
        };
        checkPassword();
      }
    }
  }, [playerName, playerId]);

  // Sync state to Supabase periodically if logged in
  useEffect(() => {
    if (!playerId) return;

    // Track whether an admin just changed our data so we don't overwrite it
    let suppressSyncUntil = 0;
    let lastKnownSavedAt = '';

    const syncToSupabase = async () => {
      if (Date.now() < suppressSyncUntil) return;

      const state = useGameStore.getState();
      if (!state.playerId) return;
      
      try {
        const savedAt = new Date().toISOString();
        await supabase
          .from('players')
          .update({
            balance: state.balance,
            potato_coins: state.potatoCoins,
            rebirths: state.rebirths,
            state_json: {
               inventory: state.inventory,
               plots: state.plots,
               sprinklers: state.sprinklers,
               unlockedPotatoes: state.unlockedPotatoes,
               everUnlockedPotatoes: state.everUnlockedPotatoes,
               rebirthUpgrades: state.rebirthUpgrades,
               warehouseLevel: state.warehouseLevel,
               sessionId: state.sessionId,
               spaceStation: state.spaceStation
            },
            last_saved_at: savedAt
          })
          .eq('id', state.playerId);
        
        lastKnownSavedAt = savedAt;
      } catch (e) {
        console.error('Failed to sync state', e);
      }
    };

    // Poll player from DB — detect admin changes and apply them instantly
    const pollPlayerState = async () => {
      try {
        const { data, error } = await supabase
          .from('players')
          .select('balance, potato_coins, rebirths, last_saved_at, state_json')
          .eq('id', playerId)
          .single();

        if (error || !data) return;

        const currentStoreSession = useGameStore.getState().sessionId;
        if (currentStoreSession && data.state_json && data.state_json.sessionId && data.state_json.sessionId !== currentStoreSession) {
          toast.error('Выполнен вход с другого устройства!');
          useGameStore.getState().logout();
          setGameState('name_entry');
          return;
        }

        // If last_saved_at is NEWER than what we know
        if (data.last_saved_at && (lastKnownSavedAt === '' || new Date(data.last_saved_at) > new Date(lastKnownSavedAt))) {
          if (lastKnownSavedAt !== '') {
            // Something changed externally — apply to store
            const current = useGameStore.getState();
            const balanceChanged = data.balance !== current.balance;
            const coinsChanged = data.potato_coins !== current.potatoCoins;
            const rebirthsChanged = data.rebirths !== current.rebirths;

            if (balanceChanged || coinsChanged || rebirthsChanged) {
              useGameStore.setState({
                balance: data.balance ?? current.balance,
                potatoCoins: data.potato_coins ?? current.potatoCoins,
                rebirths: data.rebirths ?? current.rebirths,
              });
              // Suppress our own sync for 15s so we don't immediately overwrite
              suppressSyncUntil = Date.now() + 15000;
            }
          }
          lastKnownSavedAt = data.last_saved_at;
        }
      } catch (e) { /* silent */ }
    };

    const syncIntervalId = setInterval(syncToSupabase, 10000);
    const pollIntervalId = setInterval(pollPlayerState, 5000);
    const spaceIntervalId = setInterval(() => {
      useGameStore.getState().tickSpaceStation();
    }, 1000);

    // Initial poll to set lastKnownSavedAt baseline
    pollPlayerState();
    
    const handleBeforeUnload = () => { syncToSupabase(); };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
       clearInterval(syncIntervalId);
       clearInterval(pollIntervalId);
       clearInterval(spaceIntervalId);
       window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [playerId]);

  // Poll for events — MUST work for ALL players
  const lastEventTime = useRef<string>('');
  const processedEventIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Remove the `if (!playerId) return;` so that players in the main menu 
    // ALSO receive crazy shop updates!

    const pollEvents = async () => {
      try {
        const query = supabase
          .from('global_events')
          .select('*')
          .order('created_at', { ascending: true })
          .limit(10);
        
        if (lastEventTime.current) {
          query.gt('created_at', lastEventTime.current);
        } else {
          // First fetch: only get events from last 60 seconds (catch recent events but not all history)
          const since = new Date(Date.now() - 60000).toISOString();
          query.gt('created_at', since);
        }

        const { data, error } = await query;
        
        if (!error && data && data.length > 0) {
          for (const evt of data) {
            // Deduplicate — never process same event twice
            if (processedEventIds.current.has(evt.id)) continue;
            processedEventIds.current.add(evt.id);
            lastEventTime.current = evt.created_at;

            // Handle crazy_shop event directly to instantly refresh store
            if (evt.event_type === 'crazy_shop' && evt.payload?.overrides) {
               useGameStore.setState({ shopOverrides: evt.payload.overrides });
               continue;
            }

            // Process locally
            useGameStore.getState().processGlobalEvent(evt.event_type, evt.payload);

            // For giveaway: ALSO persist coins to Supabase so it's real for everyone
            if (evt.event_type === 'giveaway' && evt.payload?.amount > 0) {
              const state = useGameStore.getState();
              if (state.playerId) {
                await supabase
                  .from('players')
                  .update({ potato_coins: state.potatoCoins })
                  .eq('id', state.playerId);
              }
            }
          }
        }
      } catch (err) {}
    };

    const pollCrazyShop = async () => {
      try {
        const { data, error } = await supabase.from('crazy_shop').select('*');
        if (!error && data) {
           const overrides: Record<string, { price: number; stock: number; is_unlimited: boolean; hidden: boolean }> = {};
           data.forEach(item => {
              overrides[item.item_id] = { price: item.price, stock: item.stock, is_unlimited: item.is_unlimited, hidden: item.hidden };
           });
           useGameStore.setState({ shopOverrides: overrides });
        }
      } catch (e) {}
    };

    // Initial fetch
    pollEvents();
    pollCrazyShop();

    const intervalId = setInterval(() => {
       pollEvents();
       pollCrazyShop();
    }, 5000);
    return () => clearInterval(intervalId);
  }, [playerId]);



  useEffect(() => {
    musicVolumeRef.current = musicVolume;
    // Сразу меняем громкость, если трек играет
    if (gameState === 'menu' && menuAudioRef.current) {
      if (!(menuAudioRef.current as any).fadeInterval) menuAudioRef.current.volume = getActualVolume(musicVolume);
    }
    if (gameState === 'safe_zone' && gameAudioRef.current) {
      if (!(gameAudioRef.current as any).fadeInterval) gameAudioRef.current.volume = getActualVolume(musicVolume);
    }
  }, [musicVolume, masterVolume, gameState]);

  // Плавное изменение громкости (Fade In / Fade Out)
  const fadeAudio = (audio: HTMLAudioElement, targetVolume: number, duration: number) => {
    const startVolume = audio.volume;
    const distance = targetVolume - startVolume;
    const steps = 20;
    const stepTime = duration / steps;
    const stepVolume = distance / steps;

    if ((audio as any).fadeInterval) clearInterval((audio as any).fadeInterval);

    let currentStep = 0;
    (audio as any).fadeInterval = setInterval(() => {
      currentStep++;
      let newVolume = startVolume + (stepVolume * currentStep);
      if (newVolume > 1) newVolume = 1;
      if (newVolume < 0) newVolume = 0;
      audio.volume = newVolume;

      if (currentStep >= steps) {
        clearInterval((audio as any).fadeInterval);
        (audio as any).fadeInterval = null;
        audio.volume = targetVolume;
        if (targetVolume === 0) audio.pause();
      }
    }, stepTime);
  };

  // Инициализация аудио со стандартным зацикливанием
  useEffect(() => {
    sliderAudioRef.current = new Audio('/sfx/slider.wav');

    const setupAudio = (src: string) => {
      const audio = new Audio(src);
      audio.loop = true; // Используем стандартный loop
      return audio;
    };

    menuAudioRef.current = setupAudio('/soundtracks/menu_bgm.mp3');
    gameAudioRef.current = setupAudio('/soundtracks/game_bgm.mp3');
    spaceAudioRef.current = setupAudio('/soundtracks/space_bgm.mp3');

    return () => {
      if (menuAudioRef.current) {
        if ((menuAudioRef.current as any).fadeInterval) clearInterval((menuAudioRef.current as any).fadeInterval);
        menuAudioRef.current.pause();
      }
      if (gameAudioRef.current) {
        if ((gameAudioRef.current as any).fadeInterval) clearInterval((gameAudioRef.current as any).fadeInterval);
        gameAudioRef.current.pause();
      }
      if (spaceAudioRef.current) {
        if ((spaceAudioRef.current as any).fadeInterval) clearInterval((spaceAudioRef.current as any).fadeInterval);
        spaceAudioRef.current.pause();
      }
    };
  }, []);

  // Переключение треков с плавным фейдом
  useEffect(() => {
    if (loading) return; // Не играем музыку пока идет прелоадер

    const playAudioWithFade = (audio: HTMLAudioElement) => {
      audio.volume = 0;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          fadeAudio(audio, getActualVolume(musicVolumeRef.current), 1500); // Плавно нарастает 1.5 сек
        }).catch(() => {});
      }
    };

    if (gameState === 'menu') {
      if (gameAudioRef.current) fadeAudio(gameAudioRef.current, 0, 500);
      if (spaceAudioRef.current) fadeAudio(spaceAudioRef.current, 0, 500);
      if (menuAudioRef.current && menuAudioRef.current.paused) {
        playAudioWithFade(menuAudioRef.current);
      }
    } else if (gameState === 'starting') {
      if (menuAudioRef.current) fadeAudio(menuAudioRef.current, 0, 700);
    } else if (gameState === 'safe_zone' || gameState === 'shop' || gameState === 'warehouse' || gameState === 'field') {
      if (menuAudioRef.current) {
        if ((menuAudioRef.current as any).fadeInterval) clearInterval((menuAudioRef.current as any).fadeInterval);
        menuAudioRef.current.pause();
        menuAudioRef.current.volume = 0;
      }
      if (spaceAudioRef.current) fadeAudio(spaceAudioRef.current, 0, 500);
      if (gameAudioRef.current && gameAudioRef.current.paused) playAudioWithFade(gameAudioRef.current);
    } else if (gameState === 'space' || gameState === 'space_cutscene') {
      if (gameAudioRef.current) fadeAudio(gameAudioRef.current, 0, 500);
      if (spaceAudioRef.current && spaceAudioRef.current.paused) playAudioWithFade(spaceAudioRef.current);
    }
  }, [gameState, loading]);

  useEffect(() => {
    let loadedCount = 0;
    const totalCritical = CRITICAL_IMAGE_ASSETS.length + CRITICAL_AUDIO_ASSETS.length;
    
    const onCriticalLoaded = () => {
      loadedCount++;
      setProgress(Math.floor((loadedCount / totalCritical) * 100));
      if (loadedCount >= totalCritical) {
        setTimeout(() => setLoading(false), 80);
      }
    };

    if (totalCritical === 0) {
      setLoading(false);
      return;
    }

    // 1. Приоритетно загружаем критические ресурсы для главного экрана
    CRITICAL_IMAGE_ASSETS.forEach(src => {
      const img = new Image();
      img.onload = onCriticalLoaded;
      img.onerror = onCriticalLoaded;
      img.src = src;
    });

    CRITICAL_AUDIO_ASSETS.forEach(src => {
      const audio = new Audio();
      audio.addEventListener('canplaythrough', onCriticalLoaded, { once: true });
      audio.addEventListener('error', onCriticalLoaded, { once: true });
      audio.src = src;
      audio.load();
    });

    // 2. Вторичные ресурсы (текстуры поля, спрайты инструментов, остальная музыка)
    // подгружаем мягко и асинхронно в фоне без задержки игрока
    const loadSecondaryAssets = () => {
      SECONDARY_IMAGE_ASSETS.forEach(src => {
        const img = new Image();
        img.src = src;
      });

      SECONDARY_AUDIO_ASSETS.forEach(src => {
        const audio = new Audio();
        audio.preload = 'auto';
        audio.src = src;
      });
    };

    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(loadSecondaryAssets);
    } else {
      setTimeout(loadSecondaryAssets, 1000);
    }

  }, []);

  // Глобальный звук клика
  useEffect(() => {
    const clickAudio = new Audio('/sfx/click.wav');
    
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Воспроизводим звук, если клик был по кнопке или интерактивному элементу
      if (target.closest('button') || target.closest('.cursor-pointer')) {
        const sound = clickAudio.cloneNode() as HTMLAudioElement;
        // Делаем звук клика чуть тише основной музыки для комфорта, или равным ей
        sound.volume = Math.min(1, getActualVolume(musicVolumeRef.current) * 0.8);
        sound.play().catch(() => {});
      }
    };

    window.addEventListener('click', handleClick, true);
    return () => {
      window.removeEventListener('click', handleClick, true);
    };
  }, []);

  // Detect mobile / tablet devices (Android, iOS, iPad, iPhone, etc.)
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const ua = navigator.userAgent || navigator.vendor || (window as any).opera || '';
      const isMobileUA = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(ua);
      const isTouchAndSmall = (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) && (window.innerWidth <= 850 || window.innerHeight <= 600);
      setIsMobileDevice(Boolean(isMobileUA || isTouchAndSmall));
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleCloseSettings = () => {
    setIsClosingSettings(true);
    setTimeout(() => {
      setShowSettings(false);
      setIsClosingSettings(false);
    }, 400); 
  };

  const startGame = () => {
    if (!playerName) {
      setGameState('name_entry');
      return;
    }

    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch (e) {}

    // Play transition soundаудио, инициируя воспроизведение прямо внутри обработчика клика
    if (gameAudioRef.current) {
      gameAudioRef.current.volume = 0;
      const p = gameAudioRef.current.play();
      if (p !== undefined) {
        p.then(() => {
          gameAudioRef.current?.pause();
        }).catch(() => {});
      }
    }

    setGameState('starting');
    setTimeout(() => {
      setGameState('loading_zone');
      setTimeout(() => {
        setGameState('safe_zone');
      }, 500);
    }, 350);
  };


  const renderSettingsModal = () => {
    if (!showSettings) return null;

    return (
      <div className={`fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md ${isClosingSettings ? 'animate-fade-out-fast' : 'animate-fade-in-fast'}`}>
        <div className={`relative bg-[#2c1810] border-4 border-[#4a331f] rounded-2xl p-8 sm:p-10 w-full max-w-md max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl fill-mode-forwards ${isClosingSettings ? 'animate-slide-down-fast' : 'animate-slide-up-fast'}`}>
          <button 
            onClick={handleCloseSettings}
            className="absolute top-5 right-5 text-white/50 hover:text-white transition-colors cursor-pointer hover:scale-110"
          >
            <X size={28} />
          </button>
          <h3 className="text-4xl font-black text-white mb-10 text-center drop-shadow-md">{t('settings.title')}</h3>
          
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between text-white text-xl font-bold">
                <div className="flex items-center gap-3">
                  <Volume2 size={24} className="text-secondary drop-shadow-sm" />
                  <span>{t('settings.masterVolume')}</span>
                </div>
                <span className="text-secondary drop-shadow-sm">{masterVolume}%</span>
              </div>
              <input 
                type="range" 
                min="0" max="100" 
                value={masterVolume}
                onChange={(e) => {
                  setVolumes({ masterVolume: Number(e.target.value) });
                  if (sliderAudioRef.current) {
                    sliderAudioRef.current.volume = Math.min(1, getActualVolume(musicVolumeRef.current) * 0.8);
                    if (sliderAudioRef.current.paused) sliderAudioRef.current.play().catch(() => {});
                    else sliderAudioRef.current.currentTime = 0;
                  }
                }}
                className="w-full"
              />
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between text-white text-xl font-bold">
                <div className="flex items-center gap-3">
                  <Volume2 size={24} className="text-secondary drop-shadow-sm" />
                  <span>{t('settings.sfxVolume')}</span>
                </div>
                <span className="text-secondary drop-shadow-sm">{soundVolume}%</span>
              </div>
              <input 
                type="range" 
                min="0" max="100" 
                value={soundVolume}
                onChange={(e) => {
                  setVolumes({ soundVolume: Number(e.target.value) });
                  if (sliderAudioRef.current) {
                    sliderAudioRef.current.volume = Math.min(1, getActualVolume(musicVolumeRef.current) * 0.8);
                    if (sliderAudioRef.current.paused) sliderAudioRef.current.play().catch(() => {});
                    else sliderAudioRef.current.currentTime = 0;
                  }
                }}
                className="w-full"
              />
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between text-white text-xl font-bold">
                <div className="flex items-center gap-3">
                  <Music size={24} className="text-secondary drop-shadow-sm" />
                  <span>{t('settings.musicVolume')}</span>
                </div>
                <span className="text-secondary drop-shadow-sm">{musicVolume}%</span>
              </div>
              <input 
                type="range" 
                min="0" max="100" 
                value={musicVolume}
                onChange={(e) => {
                  setVolumes({ musicVolume: Number(e.target.value) });
                  if (sliderAudioRef.current) {
                    sliderAudioRef.current.volume = Math.min(1, getActualVolume(Number(e.target.value)) * 0.8);
                    if (sliderAudioRef.current.paused) sliderAudioRef.current.play().catch(() => {});
                    else sliderAudioRef.current.currentTime = 0;
                  }
                }}
                className="w-full"
              />
            </div>
            
            {/* Language Selection */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between text-white text-xl font-bold">
                <div className="flex items-center gap-3">
                  <Globe size={24} className="text-cyan-400 drop-shadow-sm" />
                  <span>{t('settings.language')}</span>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setLanguage('ru')}
                  className={`flex-1 py-3 font-bold rounded-xl border-2 transition-all cursor-pointer ${language === 'ru' ? 'bg-cyan-500/30 text-white border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]' : 'bg-black/40 text-white/50 border-white/10 hover:border-white/30'}`}
                >
                  🇷🇺 Русский
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`flex-1 py-3 font-bold rounded-xl border-2 transition-all cursor-pointer ${language === 'en' ? 'bg-cyan-500/30 text-white border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]' : 'bg-black/40 text-white/50 border-white/10 hover:border-white/30'}`}
                >
                  🇬🇧 English
                </button>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-3">
              {showResetConfirm ? (
                <div className="animate-fade-in p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <p className="text-red-200 text-center mb-4 font-bold">{t('settings.resetConfirm')}</p>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setShowResetConfirm(false)}
                      className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all cursor-pointer"
                    >
                      {t('settings.cancel')}
                    </button>
                    <button 
                      onClick={() => {
                        resetProgress();
                        setShowResetConfirm(false);
                      }}
                      className="flex-1 py-3 bg-red-500 hover:bg-red-400 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(239,68,68,0.5)] cursor-pointer"
                    >
                      {t('settings.reset')}
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setShowResetConfirm(true)}
                  className="w-full py-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-black text-xl rounded-xl transition-all border border-red-500/50 cursor-pointer"
                >
                  {t('settings.resetProgress')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
    return (
      <div className="w-full h-screen bg-[#1a110a] flex flex-col items-center justify-center gap-6">
        <Loader2 className="text-secondary animate-spin" size={64} />
        <div className="text-white text-2xl font-black tracking-widest animate-pulse drop-shadow-md">
          ЗАГРУЗКА РЕСУРСОВ...
        </div>
        <div className="w-80 h-6 bg-black/60 rounded-full overflow-hidden border-2 border-white/20 shadow-inner">
          <div 
            className="h-full bg-accent progress-stripes transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-white/70 text-lg font-bold">{progress}%</div>
      </div>
    );
  }

  if (gameState === 'waiting_start') {
    return (
      <div 
        className="relative w-full h-screen bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center cursor-pointer animate-fade-in"
        style={{ backgroundImage: 'url(/sprites/bg.png)' }}
        onClick={() => {
          // Инициируем воспроизведение музыки по клику
          if (menuAudioRef.current) {
            menuAudioRef.current.volume = 0;
            menuAudioRef.current.play().then(() => {
               // Сразу ставим на паузу если не нужно играть
               // Но нам нужно играть!
               fadeAudio(menuAudioRef.current!, getActualVolume(musicVolumeRef.current), 1000);
            }).catch(()=>{});
          }
          if (gameAudioRef.current) {
            gameAudioRef.current.volume = 0;
            gameAudioRef.current.play().then(() => {
               gameAudioRef.current?.pause();
            }).catch(()=>{});
          }
          if (sliderAudioRef.current) {
             sliderAudioRef.current.volume = 0;
             sliderAudioRef.current.play().then(()=>sliderAudioRef.current?.pause()).catch(()=>{});
          }
          setGameState(playerName ? 'menu' : 'name_entry');
        }}
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm pointer-events-none" />
        <div className="relative z-10 text-white text-3xl font-black tracking-widest animate-pulse text-center p-8">
          {t('menu.clickToContinue')}
        </div>
        <div className="relative z-10 text-white/50 text-sm mt-4">{t('menu.turningOnSound')}</div>
      </div>
    );
  }

  if (gameState === 'name_entry') {
    return <PlayerNameModal onSuccess={() => setGameState('menu')} />;
  }

  if (needsPassword) {
    return <SetPasswordModal />;
  }

  if (gameState === 'loading_zone') {
    return (
      <div className="w-full h-screen bg-black flex flex-col items-center justify-center gap-6 animate-fade-in">
        <Loader2 className="text-white/50 animate-spin" size={48} />
        <div className="text-white/70 text-xl font-bold tracking-widest">
          ПОДГОТОВКА БАЗЫ...
        </div>
      </div>
    );
  }

  if (gameState === 'shop') return <Shop onBack={() => setGameState('safe_zone')} />;
  if (gameState === 'warehouse') return <Warehouse onBack={() => setGameState('safe_zone')} />;
  if (gameState === 'space_cutscene') return <SpaceCutscene onComplete={() => setGameState('space')} />;
  if (gameState === 'space') return <SpaceStation onBack={() => setGameState('safe_zone')} onUnlock={() => setGameState('space_cutscene')} onEnding={() => setGameState('ending')} />;
  if (gameState === 'ending') return <EndingCutscene onComplete={() => setGameState('space')} />;

  if (gameState === 'field') {
    return (
      <div className="animate-fade-in">
        {/* <ActionLog /> - temporarily hidden per user request */}
        <Field 
          onBack={() => {
            setGameState('safe_zone');
          }} 
        />
      </div>
    );
  }
  if (gameState === 'safe_zone') {
    return (
      <div className="w-full h-screen bg-[#1a110a] flex flex-col animate-fade-in text-white relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-amber-900/20 via-[#1a110a] to-[#1a110a] pointer-events-none" />
        
        <header className="relative z-10 w-full p-8 flex items-center justify-between bg-black/40 border-b border-amber-900/20 backdrop-blur-md shadow-lg">
          <div className="flex items-center gap-5">
            <Home size={48} className="text-[#f4a460]" />
            <div>
              <h2 className="text-4xl font-black tracking-wide text-[#fef3c7] drop-shadow-sm">
                {t('menu.farmTitle', { name: playerName?.toUpperCase() || '' })}
              </h2>
              <p className="text-[#d4b996]/70 text-lg mt-1 font-medium">
                {t('menu.cozyCorner')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right bg-[#23170e]/90 py-3 px-6 rounded-2xl border border-[#5c4028] shadow-sm mr-4">
              <div className="text-xs text-[#d4b996]/70 font-bold uppercase tracking-widest mb-1">{t('menu.balance')}</div>
              <div className="text-3xl font-black text-amber-400">{formatNumber(balance)} {eraInfo.currencyEmoji}</div>
            </div>
            
            <button 
              onClick={() => setGameState('menu')}
              className="px-6 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold rounded-2xl transition-all cursor-pointer border border-red-500/20 hover:border-red-500/40 hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center h-18.5"
              title={t('menu.toMenu')}
            >
              {t('menu.toMenu')}
            </button>

            <button 
              onClick={() => setShowLeaderboard(true)}
              className="px-6 py-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold rounded-2xl transition-all cursor-pointer border border-amber-500/20 hover:border-amber-500/40 hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center h-18.5"
              title="Топ Игроков"
            >
              <Trophy size={28} />
            </button>

            {playerName?.toLowerCase() === 'eternal_lunar' && (
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('open-cheat-console'))}
                className="px-6 py-4 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-300 font-bold rounded-2xl transition-all cursor-pointer border border-fuchsia-500/20 hover:border-fuchsia-500/40 hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center h-18.5"
                title="Личная Консоль"
              >
                👑
              </button>
            )}

            <button 
              onClick={() => setShowSettings(true)}
              className="p-5 bg-white/5 hover:bg-white/10 rounded-2xl transition-all cursor-pointer border border-white/10 hover:border-white/30 hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center h-18.5"
            >
              <Settings size={32} />
            </button>
          </div>
        </header>

        {/* Main Content - Warm Cozy Farm Cards */}
        <div className={`relative z-10 flex-1 p-8 grid gap-8 ${spaceStation?.megastructure?.stage >= 5 ? 'grid-cols-3' : 'grid-cols-2 grid-rows-2'}`}>
          
          {/* Modals */}
          <UnlockModal />

          {/* СКЛАД - Тёплый амбарный стиль */}
          <div className="relative w-full h-full">
            <button 
              onClick={() => {
                setGameState('warehouse');
              }}
              className="group relative w-full h-full rounded-[2rem] overflow-hidden border-2 border-[#5c4028] hover:border-[#8b5a2b] transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-6 bg-[#23170e]/80 hover:bg-[#2e1d11] shadow-[0_12px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_18px_40px_rgba(0,0,0,0.7)] hover:-translate-y-1">
              <div className="absolute inset-0 bg-radial from-[#8b5a2b]/10 to-transparent pointer-events-none" />
              
              <div className="w-28 h-28 rounded-2xl bg-[#3a2517]/70 border border-[#6b4729]/60 flex items-center justify-center shadow-inner group-hover:scale-105 group-hover:border-[#a36c3e] transition-transform duration-300">
                <Package size={64} className="text-[#93c5fd] group-hover:text-blue-200 transition-colors" />
              </div>

              <div className="text-center z-10 px-6">
                <span className="block text-4xl font-black text-[#fef3c7] mb-2 tracking-wide uppercase">{t('menu.warehouse')}</span>
                <span className="text-[#d4b996]/80 text-lg font-semibold">{t('menu.warehouseDesc')}</span>
              </div>
            </button>
          </div>

          {/* МАГАЗИН - Уютная фермерская лавка */}
          <div className="relative w-full h-full">
            <button 
              onClick={() => {
                setGameState('shop');
              }}
              className="group relative w-full h-full rounded-[2rem] overflow-hidden border-2 border-[#5c4028] hover:border-[#b47a3e] transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-6 bg-[#23170e]/80 hover:bg-[#2e1d11] shadow-[0_12px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_18px_40px_rgba(0,0,0,0.7)] hover:-translate-y-1">
              <div className="absolute inset-0 bg-radial from-[#d97706]/10 to-transparent pointer-events-none" />

              <div className="w-28 h-28 rounded-2xl bg-[#3a2517]/70 border border-[#6b4729]/60 flex items-center justify-center shadow-inner group-hover:scale-105 group-hover:border-[#d97706] transition-transform duration-300">
                <Store size={64} className="text-[#fcd34d] group-hover:text-amber-200 transition-colors" />
              </div>

              <div className="text-center z-10 px-6">
                <span className="block text-4xl font-black text-[#fef3c7] mb-2 tracking-wide uppercase">{t('menu.shop')}</span>
                <span className="text-[#d4b996]/80 text-lg font-semibold">{t('menu.shopDesc')}</span>
              </div>
            </button>
          </div>

          {/* НА ПОЛЕ - Тёплые пахотные земли и ростки */}
          <div className="relative w-full h-full">
            <button 
              onClick={() => {
                setGameState('field');
              }}
              className="group relative w-full h-full rounded-[2rem] overflow-hidden border-2 border-[#3d4d29] hover:border-[#5f7a3a] transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-6 bg-[#1a2312]/80 hover:bg-[#222e17] shadow-[0_12px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_18px_40px_rgba(0,0,0,0.7)] hover:-translate-y-1">
              <div className="absolute inset-0 bg-radial from-[#65a30d]/10 to-transparent pointer-events-none" />

              <div className="w-28 h-28 rounded-2xl bg-[#283818]/70 border border-[#486326]/60 flex items-center justify-center shadow-inner group-hover:scale-105 group-hover:border-[#84cc16] transition-transform duration-300">
                <Wheat size={64} className="text-[#a3e635] group-hover:text-lime-200 transition-colors" />
              </div>

              <div className="text-center z-10 px-6">
                <span className="block text-4xl font-black text-[#fef3c7] mb-2 tracking-wide uppercase">{t('menu.field')}</span>
                <span className="text-[#d4b996]/80 text-lg font-semibold">{t('menu.fieldDesc')}</span>
              </div>
            </button>
          </div>

          {/* КОСМОДРОМ */}
          {(!spaceStation?.megastructure || spaceStation.megastructure.stage < 5) && (
            <div className="relative w-full h-full">
              <button 
                onClick={() => setGameState('space')}
                disabled={rebirths < 5}
                className={`group relative w-full h-full rounded-[2rem] overflow-hidden border-2 transition-all duration-300 flex flex-col items-center justify-center gap-6 ${
                  rebirths >= 5 
                    ? 'border-[#4a2e4a] hover:border-[#864b86] cursor-pointer bg-[#1e1220]/80 hover:bg-[#2a172d] shadow-[0_12px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_18px_40px_rgba(0,0,0,0.7)] hover:-translate-y-1'
                    : 'border-white/10 bg-black/40 cursor-not-allowed opacity-60'
                }`}
              >
                <div className="w-28 h-28 rounded-2xl bg-[#2b172d]/70 border border-[#522d56]/60 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
                  <Rocket size={64} className={`transition-colors ${rebirths >= 5 ? 'text-[#e879f9]' : 'text-white/30'}`} />
                </div>
                <div className="text-center z-10 px-6">
                  <span className={`block text-4xl font-black mb-2 tracking-wide uppercase ${rebirths >= 5 ? 'text-[#fef3c7]' : 'text-white/40'}`}>{t('menu.spaceport')}</span>
                  <span className={`text-lg font-semibold ${rebirths >= 5 ? 'text-[#d4b996]/80' : 'text-white/30'}`}>
                    {rebirths >= 5 ? t('menu.spaceStationUnlocked') : t('menu.spaceStationLocked')}
                  </span>
                </div>
                {rebirths < 5 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 backdrop-blur-xs z-20">
                    <Rocket size={40} className="text-white/30 mb-2" />
                    <div className="text-base font-black text-amber-300 bg-amber-950/70 border border-amber-500/30 px-4 py-2 rounded-xl uppercase tracking-wider">{t('menu.needRebirths')}</div>
                  </div>
                )}
              </button>
            </div>
          )}
        </div>
        
      </div>
    );
  }

  // Главное меню (или состояние 'starting' перед переходом)
  return (
    <div className="relative w-full h-screen overflow-y-auto overflow-x-hidden custom-scrollbar bg-[#0a0502] scroll-smooth">
      
      {/* SECTION 1: MAIN MENU */}
      <div 
        className="relative w-full min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center animate-fade-in"
        style={{ backgroundImage: 'url(/sprites/bg.png)' }}
      >
        {/* Overlay */}
        <div 
          className={`absolute inset-0 transition-colors duration-700 ease-out ${gameState === 'starting' ? 'bg-black' : 'bg-black/30'}`} 
        />

      {/* Profile & Dropdown Menu */}
      {playerName && (
        <div className="absolute top-6 right-8 z-200">
          <div 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 bg-black/40 hover:bg-black/60 px-5 py-3 rounded-2xl border border-white/10 hover:border-white/20 backdrop-blur-sm cursor-pointer animate-fade-in shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all"
          >
            <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-[#2c1810] font-black text-xl">
              {playerName.charAt(0).toUpperCase()}
            </div>
            <span className="text-white font-bold text-lg select-none">{playerName}</span>
          </div>

          {showProfileMenu && (
            <div className="absolute top-full mt-2 right-0 w-64 bg-black/80 backdrop-blur-md rounded-2xl border border-white/10 p-2 shadow-2xl animate-fade-in-fast flex flex-col gap-1">
              {playerName?.toLowerCase() === 'eternal_lunar' && (
                <button 
                  onClick={() => {
                    setShowProfileMenu(false);
                    window.dispatchEvent(new CustomEvent('open-cheat-console'));
                  }}
                  className="w-full text-left px-4 py-3 bg-fuchsia-500/20 hover:bg-fuchsia-500/40 text-fuchsia-300 font-bold rounded-xl transition-all cursor-pointer border border-fuchsia-500/30 mb-1 flex items-center justify-between"
                >
                  <span>👑 {t('menu.personalConsole')}</span>
                  <span className="text-xs opacity-60">F+G</span>
                </button>
              )}

              <button 
                onClick={() => {
                  setShowProfileMenu(false);
                  setShowChangePassword(true);
                }}
                className="w-full text-left px-4 py-3 bg-white/5 hover:bg-blue-500/20 text-white hover:text-blue-400 font-bold rounded-xl transition-all cursor-pointer border border-transparent hover:border-blue-500/30"
              >
                Сменить пароль
              </button>

              <button 
                onClick={() => {
                  setShowProfileMenu(false);
                  setShowLogoutConfirm(true);
                }}
                className="w-full text-left px-4 py-3 bg-white/5 hover:bg-orange-500/20 text-white hover:text-orange-400 font-bold rounded-xl transition-all cursor-pointer border border-transparent hover:border-orange-500/30"
              >
                Выйти из аккаунта
              </button>

              <button 
                onClick={() => {
                  setShowProfileMenu(false);
                  setShowDeleteAccount(true);
                }}
                className="w-full text-left px-4 py-3 bg-white/5 hover:bg-red-500/20 text-white hover:text-red-400 font-bold rounded-xl transition-all cursor-pointer border border-transparent hover:border-red-500/30 mt-2"
              >
                Удалить аккаунт
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Menu Container */}
      <div className={`relative z-10 flex flex-col items-center gap-8 p-12 bg-black/30 backdrop-blur-md rounded-3xl border-2 border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] min-w-100 ${gameState === 'starting' ? 'animate-fall-down' : 'animate-slide-up animation-delay-100 opacity-0 fill-mode-forwards'}`}>
        <div className="text-center">
          <h1 className="text-6xl font-black text-white drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] tracking-wider uppercase">
            СИМУЛЯТОР
          </h1>
          <h2 className="text-2xl font-bold text-secondary drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] tracking-widest mt-3 uppercase">
            {currentEra === 'cabbage' ? 'ВЫРАЩИВАНИЯ КАПУСТЫ' : 'ВЫРАЩИВАНИЯ КАРТОШКИ'}
          </h2>
          <div className="text-6xl mt-6 animate-bounce drop-shadow-xl cursor-default">
            {eraInfo.emoji}
          </div>
        </div>
        
        <div className="flex flex-col gap-5 w-full mt-6">
          <button 
            onClick={startGame}
            className="btn-glow-accent group flex items-center justify-center gap-3 w-full py-5 px-8 bg-accent text-white font-black rounded-2xl text-2xl border-2 border-accent cursor-pointer"
          >
            <Play size={32} className="transition-transform group-hover:translate-x-2 drop-shadow-md" />
            <span className="drop-shadow-md">{t('menu.play')}</span>
          </button>
          
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setShowSettings(true)}
              className="btn-glow-white group flex items-center justify-center gap-2 w-full py-4 bg-white/10 text-white font-black rounded-2xl text-lg backdrop-blur-md border-2 border-white/20 cursor-pointer"
            >
              <Settings size={24} className="transition-transform group-hover:rotate-90 drop-shadow-md" />
              <span className="drop-shadow-md">{t('menu.settings')}</span>
            </button>

            <button 
              onClick={() => setShowLeaderboard(true)}
              className="btn-glow-accent group flex items-center justify-center gap-2 w-full py-4 bg-amber-500/20 text-amber-400 font-black rounded-2xl text-lg backdrop-blur-md border-2 border-amber-500/30 cursor-pointer"
            >
              <Trophy size={24} className="transition-transform group-hover:scale-110 drop-shadow-md" />
              <span className="drop-shadow-md">{t('menu.leaderboard')}</span>
            </button>
          </div>

          <button 
            onClick={() => setShowHowToPlay(true)}
            className="group flex items-center justify-center gap-3 w-full py-4 px-8 bg-cyan-600/20 hover:bg-cyan-500/30 text-cyan-100 font-bold rounded-2xl text-xl backdrop-blur-md border-2 border-cyan-500/30 hover:border-cyan-400/60 transition-all cursor-pointer mt-2 shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:shadow-[0_0_25px_rgba(6,182,212,0.3)]"
          >
            <HelpCircle size={24} className="text-cyan-400 group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            <span className="drop-shadow-md tracking-wider">{t('menu.howToPlay')}</span>
          </button>
        </div>
      </div>

      {/* Scroll Indicator Removed */}
      
    </div>
    </div>
  );
  }; // end of renderContent

  return (
    <>
      {isMobileDevice && <MobileBlockerModal />}

      {renderContent()}

      {/* GLOBAL MODALS */}
        {showLeaderboard && <LeaderboardModal onClose={() => setShowLeaderboard(false)} />}
        {showHowToPlay && <HowToPlayModal onClose={() => setShowHowToPlay(false)} />}
        {showChangelog && <ChangelogModal onClose={() => setShowChangelog(false)} />}
        {renderSettingsModal()}
        
        {showChangePassword && (
          <ChangePasswordModal onClose={() => setShowChangePassword(false)} />
        )}

        {showDeleteAccount && (
          <DeleteAccountModal 
            onClose={() => setShowDeleteAccount(false)} 
            onDeleted={() => {
              setShowDeleteAccount(false);
              setGameState('name_entry');
            }}
          />
        )}

        {showLogoutConfirm && (
          <ConfirmModal
            title="Выход из аккаунта"
            message="Вы уверены, что хотите выйти? Вы сможете зайти обратно по нику и паролю."
            confirmText="Выйти"
            onConfirm={() => {
              setShowLogoutConfirm(false);
              logout();
            }}
            onClose={() => setShowLogoutConfirm(false)}
            variant="warning"
          />
        )}
    </>
  );
}
