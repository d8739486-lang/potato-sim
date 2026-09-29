export const AUDIO_PATHS = {
  // SFX (per SfxLogic.md)
  BOOT: '/textures/sounds/sfx/boot.mp3',
  SHUTDOWN: '/textures/sounds/sfx/shut.mp3',
  ERROR: '/textures/sounds/sfx/error.mp3',
  ERROR2: '/textures/sounds/sfx/error2.mp3',
  ERROR3: '/textures/sounds/sfx/error3.mp3',
  BSOD: '/textures/sounds/sfx/bsod.mp3',
  BUTTON: '/textures/sounds/sfx/button_press.mp3',
  BUY: '/textures/sounds/sfx/buy.mp3',
  UNBUY: '/textures/sounds/sfx/unbuy.mp3',
  CLICK: '/textures/sounds/sfx/click.mp3',
  PANEL: '/textures/sounds/sfx/panel.mp3',
  REMAKE_TEXT: '/textures/sounds/sfx/remake_text.mp3',
  POP: '/textures/sounds/sfx/pop.mp3',
  MENU_SFX: '/textures/sounds/sfx/menu.mp3',
  
  // MUSIC
  MUSIC_MENU: '/textures/sounds/music/menu_track.mp3',
  MUSIC_STAGE_1: '/textures/sounds/music/1_stage.mp3',
  MUSIC_STAGE_2: '/textures/sounds/music/2_stage.mp3',
  MUSIC_STAGE_3: '/textures/sounds/music/3_stage.mp3',
  MUSIC_END: '/textures/sounds/music/end.mp3',
};

// --- SFX POOLING & PRELOADING ---
const sfxPools = new Map<string, HTMLAudioElement[]>();
const MAX_POOL_SIZE = 5;

// Preload all SFX on module load
if (typeof window !== 'undefined') {
  Object.values(AUDIO_PATHS).forEach(path => {
    // Only preload SFX, music is handled separately
    if (path.includes('/sfx/')) {
      const audio = new Audio(path);
      audio.preload = 'auto';
      audio.load();
      sfxPools.set(path, [audio]);
    }
  });
}

const getAudioFromPool = (path: string): HTMLAudioElement | null => {
  if (typeof window === 'undefined') return null;
  
  let pool = sfxPools.get(path);
  if (!pool) {
    pool = [];
    sfxPools.set(path, pool);
  }

  // Find a finished or paused audio
  let audio = pool.find(a => a.paused || a.ended);
  
  if (!audio && pool.length < MAX_POOL_SIZE) {
    audio = new Audio(path);
    audio.preload = 'auto';
    pool.push(audio);
  }

  return audio || pool[0]; // Fallback to first if all busy
};

// Global registry of all active audio elements (for stopAllAudio)
const activeAudios = new Set<HTMLAudioElement>();

export const playSound = (path: string, volume: number = 0.6, delay: number = 0) => {
  if (typeof window === 'undefined') return null;

  if (delay > 0) {
    setTimeout(() => playSound(path, volume, 0), delay);
    return null;
  }
  
  const audio = getAudioFromPool(path);
  if (!audio) return null;

  try {
    audio.currentTime = 0;
    audio.volume = volume;
    activeAudios.add(audio);
    
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(e => {
        // If blocked by browser (autoplay policy), retry on first user click
        if (e.name === 'NotAllowedError') {
          const retry = () => {
            audio.play().catch(() => {});
            window.removeEventListener('click', retry);
          };
          window.addEventListener('click', retry);
        } else if (e.name !== 'AbortError') {
          console.warn(`Audio playback failed for ${path}`, e);
        }
      });
    }

    // Clean up active set when done (though pool handles reuse)
    const onEnded = () => {
      activeAudios.delete(audio);
      audio.removeEventListener('ended', onEnded);
    };
    audio.addEventListener('ended', onEnded);

    return audio;
  } catch (err) {
    return null;
  }
};

/** Instantly stops ALL playing audio (SFX + BGM). Used by admin panel. */
export const stopAllAudio = () => {
  // Kill all tracked SFX
  activeAudios.forEach(audio => {
    audio.pause();
    audio.currentTime = 0;
  });
  activeAudios.clear();

  // Kill BGM
  clearFade();
  if (currentBgmAudio) {
    currentBgmAudio.pause();
    currentBgmAudio.currentTime = 0;
    currentBgmAudio = null;
    currentBgmPath = null;
  }
};

// SFX Helpers
export const playBootSound = () => playSound(AUDIO_PATHS.BOOT, 0.9);
export const playShutSound = () => playSound(AUDIO_PATHS.SHUTDOWN, 0.9);
export const playErrorSound = () => playSound(AUDIO_PATHS.ERROR, 0.8);
export const playError2Sound = () => playSound(AUDIO_PATHS.ERROR2, 0.9);
export const playError3Sound = () => playSound(AUDIO_PATHS.ERROR3, 0.9);
export const playBsodSound = () => playSound(AUDIO_PATHS.BSOD, 1.0);
export const playButtonSound = () => playSound(AUDIO_PATHS.BUTTON, 0.4);
export const playBuySound = () => playSound(AUDIO_PATHS.BUY, 0.4);
export const playUnbuySound = () => playSound(AUDIO_PATHS.UNBUY, 0.4);
export const playPcClickSound = () => playSound(AUDIO_PATHS.CLICK, 0.5);
export const playPanelSound = (delay: number = 0) => playSound(AUDIO_PATHS.PANEL, 0.5, delay);
export const playRemakeTextSound = () => playSound(AUDIO_PATHS.REMAKE_TEXT, 0.6, 400); // 0.4s delay per spec
export const playPopSound = () => playSound(AUDIO_PATHS.POP, 1.0);
export const playMenuSfx = () => playSound(AUDIO_PATHS.MENU_SFX, 0.6);
export const playEndMusic = () => playSound(AUDIO_PATHS.MUSIC_END, 1.0);

let currentBgmPath: string | null = null;
let currentBgmAudio: HTMLAudioElement | null = null;
let fadeInterval: number | null = null;
const targetVolume = 0.3;

const clearFade = () => {
  if (fadeInterval) {
    clearInterval(fadeInterval);
    fadeInterval = null;
  }
};

export const playBGM = (path: string, fadeInDelay: number = 0, fadeInDuration: number = 1000) => {
  if (currentBgmPath === path && currentBgmAudio) {
    resumeBGM(fadeInDuration);
    return;
  }

  if (currentBgmAudio) {
    stopBGM(500);
  }

  currentBgmPath = path;
  
  setTimeout(() => {
    if (currentBgmPath !== path) return;
    
    const audio = new Audio(path);
    audio.volume = 0;
    audio.loop = true;
    currentBgmAudio = audio;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(e => {
        console.warn(`BGM playback failed for ${path}`, e);
        const retryPlay = () => {
          if (currentBgmAudio === audio) {
            audio.play().catch(() => {});
            resumeBGM(fadeInDuration);
          }
          window.removeEventListener('click', retryPlay);
        };
        window.addEventListener('click', retryPlay);
      });
    }

    clearFade();
    
    if (fadeInDuration <= 0) {
      audio.volume = targetVolume;
      return;
    }
    
    let vol = 0;
    const steps = 20;
    const stepTime = fadeInDuration / steps;
    const volStep = targetVolume / steps;

    fadeInterval = window.setInterval(() => {
      if (currentBgmAudio !== audio || currentBgmPath !== path) {
        clearFade();
        return;
      }
      vol += volStep;
      if (vol >= targetVolume) {
        audio.volume = targetVolume;
        clearFade();
      } else {
        audio.volume = Math.max(0, Math.min(1, vol));
      }
    }, stepTime);
  }, fadeInDelay);
};

export const pauseBGM = (fadeOutDuration: number = 1000) => {
  if (!currentBgmAudio) return;

  clearFade();
  const audio = currentBgmAudio;
  
  if (fadeOutDuration <= 0) {
    audio.pause();
    return;
  }
  
  let vol = audio.volume;
  const steps = 10;
  const stepTime = fadeOutDuration / steps;
  const volStep = vol / steps;
  
  fadeInterval = window.setInterval(() => {
    if (currentBgmAudio !== audio) {
      clearFade();
      return;
    }
    vol -= volStep;
    if (vol <= 0) {
      clearFade();
      audio.pause();
    } else {
      audio.volume = Math.max(0, Math.min(1, vol));
    }
  }, stepTime);
};

export const resumeBGM = (fadeInDuration: number = 1000) => {
  if (!currentBgmAudio) return;

  clearFade();
  
  const playPromise = currentBgmAudio.play();
  if (playPromise !== undefined) {
    playPromise.catch(e => console.warn(`BGM resume failed`, e));
  }
  
  if (fadeInDuration <= 0) {
    currentBgmAudio.volume = targetVolume;
    return;
  }
  
  let vol = currentBgmAudio.volume;
  const steps = 10;
  const stepTime = fadeInDuration / steps;
  const volStep = (targetVolume - vol) / steps;

  fadeInterval = window.setInterval(() => {
    if (!currentBgmAudio) {
      clearFade();
      return;
    }
    vol += volStep;
    if (vol >= targetVolume) {
      currentBgmAudio.volume = targetVolume;
      clearFade();
    } else {
      currentBgmAudio.volume = Math.max(0, Math.min(1, vol));
    }
  }, stepTime);
};

export const stopBGM = (fadeOutDuration: number = 1000) => {
  if (!currentBgmAudio) return;
  
  const audio = currentBgmAudio;
  currentBgmAudio = null;
  currentBgmPath = null;
  
  if (fadeOutDuration <= 0) {
    audio.pause();
    audio.currentTime = 0;
    return;
  }

  let vol = audio.volume;
  const steps = 20;
  const stepTime = fadeOutDuration / steps;
  const volStep = vol / steps;
  
  const fadeOut = setInterval(() => {
    vol -= volStep;
    if (vol <= 0) {
      clearInterval(fadeOut);
      audio.pause();
      audio.currentTime = 0;
    } else {
      audio.volume = Math.max(0, Math.min(1, vol));
    }
  }, stepTime);
};
