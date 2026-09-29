import { getLanguage } from './system';

const TEXT_MUTED = '#a1a1aa';

const T_START_DELAY = 1500;
const T_MOVE = 600;
const T_HOVER_DELAY = 500;
const T_CLICK_DUR = 500;
const T_READ_WINDOW = 1125;
const T_READ_THREAT = 750;

class CutsceneAudio {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private tryPlayAudioFile(fileName: string, volume: number = 0.6): Promise<boolean> {
    return new Promise((resolve) => {
      const formats = ['.mp3', '.wav', '.ogg'];
      let tried = 0;
      
      const tryNext = (extIndex: number) => {
        if (extIndex >= formats.length) {
          resolve(false);
          return;
        }
        const audio = new Audio(`/assets/sounds/sfx/cutscene/${fileName}${formats[extIndex]}`);
        audio.volume = volume;
        audio.play().then(() => {
          resolve(true);
        }).catch(() => {
          tried++;
          tryNext(extIndex + 1);
        });
      };

      tryNext(0);
    });
  }

  // Authentic 8-bit Undertale speech blip via Web Audio synthesis
  playTypewriterBlip(isCapital: boolean = false) {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      const now = ctx.currentTime;
      const baseFreq = isCapital ? 190 : 155;
      const jitter = (Math.random() - 0.5) * 16;
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq + jitter, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.04);
      
      // Warm 8-bit low-pass filtering like retro game sound chips
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, now);
      
      // Punchy percussive envelope
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.05);
    } catch {}
  }

  // Glitch buzz / interference Web Audio synthesizer (quieter)
  playGlitchBuzz(intensity: number = 0.5) {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(70 + Math.random() * 220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.12);
      
      gain.gain.setValueAtTime(0.075 * intensity, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.13);
    } catch {}
  }

  // 1.2s Rising glitch approach sound with 0.7s Fade In (quieter)
  playGlitchApproach() {
    const formats = ['.wav', '.mp3', '.ogg'];
    const tryPlay = (i: number) => {
      if (i >= formats.length) {
        // Synthesizer Fallback with 0.7s smooth Fade In
        try {
          const ctx = this.getContext();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const now = ctx.currentTime;
          
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(55, now);
          osc.frequency.exponentialRampToValueAtTime(340, now + 1.2);
          
          // 0.7s Fade In
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.exponentialRampToValueAtTime(0.16, now + 0.7);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.25);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.start(now);
          osc.stop(now + 1.3);
        } catch {}
        return;
      }

      const audio = new Audio(`/assets/sounds/sfx/cutscene/glitch${formats[i]}`);
      audio.volume = 0.0;
      audio.play().then(() => {
        // 0.7s Fade In for audio file
        const start = performance.now();
        const duration = 700; // 0.7s
        const maxVol = 0.35;

        const fadeTimer = setInterval(() => {
          const elapsed = performance.now() - start;
          const progress = Math.min(1, elapsed / duration);
          audio.volume = progress * maxVol;
          if (progress >= 1) clearInterval(fadeTimer);
        }, 30);
      }).catch(() => tryPlay(i + 1));
    };

    tryPlay(0);
  }

  // Power off sound
  playPowerOff() {
    this.tryPlayAudioFile('power_off', 0.4).then((played) => {
      if (played) return;
      try {
        const ctx = this.getContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(15, ctx.currentTime + 0.35);
        
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.36);
      } catch {}
    });
  }

  // Power on sound
  playPowerOn() {
    this.tryPlayAudioFile('power_on', 0.35).then((played) => {
      if (played) return;
      try {
        const ctx = this.getContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(380, ctx.currentTime);
        osc.frequency.setValueAtTime(760, ctx.currentTime + 0.04);
        
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.11);
      } catch {}
    });
  }

  // Glitch 1 sound (quieter)
  playGlitch1() {
    this.tryPlayAudioFile('glitch_1', 0.25).then((played) => {
      if (!played) {
        this.tryPlayAudioFile('glitch', 0.25).then((p) => {
          if (!p) this.playGlitchBuzz(0.25);
        });
      }
    });
  }

  // Glitch 2 sound (quieter)
  playGlitch2() {
    this.tryPlayAudioFile('glitch_2', 0.35).then((played) => {
      if (!played) {
        this.tryPlayAudioFile('glitch', 0.35).then((p) => {
          if (!p) this.playGlitchBuzz(0.38);
        });
      }
    });
  }

  // Digital explosion sound (quieter)
  playExplosion() {
    this.tryPlayAudioFile('explosion', 0.25).then((played) => {
      if (!played) this.playGlitchBuzz(0.3);
    });
  }

  private matrixMusicAudio: HTMLAudioElement | null = null;

  // Matrix background music / ambient track with 0.6s smooth Fade In (stops looping, strictly plays once)
  playMatrixMusic() {
    const formats = ['.wav', '.mp3', '.ogg'];
    const tryNext = (i: number) => {
      if (i >= formats.length) return;
      const music = new Audio(`/assets/sounds/sfx/cutscene/matrix_music${formats[i]}`);
      music.loop = false;
      music.volume = 0.0;
      this.matrixMusicAudio = music;
      music.play().then(() => {
        // Smooth 0.6s Fade In
        const start = performance.now();
        const duration = 600; // 0.6s
        const maxVol = 0.45;

        const fadeTimer = setInterval(() => {
          const elapsed = performance.now() - start;
          const progress = Math.min(1, elapsed / duration);
          music.volume = progress * maxVol;
          if (progress >= 1) clearInterval(fadeTimer);
        }, 30);
      }).catch(() => tryNext(i + 1));
    };
    tryNext(0);
  }

  stopMatrixMusic() {
    if (this.matrixMusicAudio) {
      try {
        const music = this.matrixMusicAudio;
        const start = performance.now();
        const duration = 800;
        const startVol = music.volume;
        const fadeTimer = setInterval(() => {
          const elapsed = performance.now() - start;
          const progress = Math.min(1, elapsed / duration);
          music.volume = startVol * (1 - progress);
          if (progress >= 1) {
            clearInterval(fadeTimer);
            music.pause();
            music.currentTime = 0;
          }
        }, 30);
      } catch {}
    }
  }
}

const cutsceneAudio = new CutsceneAudio();

export function startAvalonCutscene(startX: number, startY: number) {
  const lang = getLanguage();
  
  // 1. Interaction Blocker
  const blocker = document.createElement('div');
  blocker.style.position = 'fixed';
  blocker.style.inset = '0';
  blocker.style.zIndex = '99999998'; 
  document.body.appendChild(blocker);

  // 2. Hide real cursor globally
  const style = document.createElement('style');
  style.id = 'cutsceneStyle';
  style.innerHTML = `
    * { cursor: none !important; }
    @keyframes screenMeltingAndTear {
      0% { filter: none; transform: none; }
      20% { filter: contrast(1.8) hue-rotate(45deg) blur(0.5px); transform: skewY(1.5deg) scale(1.01); clip-path: inset(0 0 0 0); }
      40% { filter: contrast(2.4) hue-rotate(120deg) blur(1px); transform: skewX(-3deg) scaleY(1.02); clip-path: inset(12% 0 35% 0); }
      60% { filter: contrast(3) invert(0.6) hue-rotate(180deg) blur(1.5px); transform: skewY(-2.5deg) scaleX(1.03); clip-path: inset(45% 0 10% 0); }
      80% { filter: contrast(3.5) hue-rotate(270deg) blur(2px); transform: skewX(4deg) scale(1.04); clip-path: inset(20% 0 60% 0); }
      100% { filter: contrast(4) invert(0.9) blur(3px); transform: scale(1.05) skewX(-6deg); clip-path: inset(0 0 0 0); }
    }
    @keyframes severeGlitch {
      0% { transform: scale(1); filter: contrast(2) drop-shadow(6px 0 #f00) drop-shadow(-6px 0 #0ff); clip-path: inset(5% 0 75% 0); }
      33% { transform: skewX(-8deg) scaleY(1.03); filter: invert(0.8) contrast(3); clip-path: inset(40% 0 20% 0); }
      66% { transform: skewY(6deg) scaleX(1.04); filter: saturate(6) hue-rotate(180deg); clip-path: inset(70% 0 5% 0); }
      100% { transform: scale(1.06); filter: contrast(4) invert(1); clip-path: inset(0 0 0 0); }
    }
    @keyframes fullScreenTear1 {
      0% { clip-path: inset(0 0 0 0); transform: none; filter: none; }
      15% { clip-path: inset(10% 0 75% 0); transform: translateX(-35px) skewX(8deg); filter: contrast(2) hue-rotate(90deg); }
      35% { clip-path: inset(45% 0 30% 0); transform: translateX(40px) skewX(-10deg); filter: invert(0.7); }
      55% { clip-path: inset(70% 0 10% 0); transform: translateX(-25px) skewY(4deg); filter: saturate(4); }
      75% { clip-path: inset(20% 0 55% 0); transform: scaleY(1.05) translateX(30px); filter: contrast(3); }
      90% { clip-path: inset(80% 0 2% 0); transform: translateX(-18px); filter: drop-shadow(10px 0 #f00) drop-shadow(-10px 0 #0ff); }
      100% { clip-path: inset(0 0 0 0); transform: none; filter: none; }
    }
    @keyframes fullScreenTear2 {
      0% { clip-path: inset(0 0 0 0); transform: none; filter: none; }
      10% { clip-path: inset(5% 0 80% 0); transform: translateX(50px) skewX(-14deg); filter: contrast(3) invert(0.8); }
      25% { clip-path: inset(30% 0 40% 0); transform: translateX(-55px) skewY(8deg); filter: hue-rotate(180deg); }
      45% { clip-path: inset(60% 0 15% 0); transform: translateX(38px) scale(1.05); filter: saturate(5); }
      65% { clip-path: inset(15% 0 65% 0); transform: translateX(-42px) skewX(12deg); filter: drop-shadow(14px 0 #f00) drop-shadow(-14px 0 #0ff); }
      85% { clip-path: inset(75% 0 5% 0); transform: translateX(25px) skewY(-6deg); filter: contrast(2.5); }
      100% { clip-path: inset(0 0 0 0); transform: none; filter: none; }
    }
    @keyframes pulseSoft {
      0% { transform: translateX(-50%) scale(1); opacity: 0.85; }
      50% { transform: translateX(-50%) scale(1.03); opacity: 1; }
      100% { transform: translateX(-50%) scale(1); opacity: 0.85; }
    }
    @keyframes cursorBlink {
      0%, 49% { opacity: 1; }
      50%, 100% { opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  // 3. Spawn Fake Cursor
  const fakeCursor = document.createElement('div');
  fakeCursor.id = 'cutsceneFakeCursor';
  fakeCursor.style.position = 'fixed';
  fakeCursor.style.left = '0px';
  fakeCursor.style.top = '0px';
  fakeCursor.style.width = '24px';
  fakeCursor.style.height = '32px';
  fakeCursor.style.zIndex = '99999999';
  fakeCursor.style.pointerEvents = 'none';
  fakeCursor.innerHTML = `<svg width="24" height="32" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 0V22L6 17L10.5 26L13.5 24.5L9 15.5L16 15.5L0 0Z" fill="white" stroke="black" stroke-width="2" stroke-linejoin="miter"/>
  </svg>`;
  fakeCursor.style.transform = `translate(${startX}px, ${startY}px)`;
  document.body.appendChild(fakeCursor);

  // 4. Initial Error Window (Styled in unified Windows 11 Dark Acrylic style)
  const errorWin = document.createElement('div');
  errorWin.style.position = 'fixed';
  errorWin.style.top = '50%';
  errorWin.style.left = '50%';
  errorWin.style.transform = 'translate(-50%, -50%)';
  errorWin.style.width = '420px';
  errorWin.style.background = 'rgba(30, 30, 30, 0.95)';
  errorWin.style.backdropFilter = 'blur(20px)';
  errorWin.style.border = '1px solid rgba(255, 255, 255, 0.12)';
  errorWin.style.borderRadius = '10px';
  errorWin.style.overflow = 'hidden';
  errorWin.style.boxShadow = '0 16px 40px rgba(0, 0, 0, 0.7)';
  errorWin.style.zIndex = '999999';
  errorWin.style.fontFamily = 'Segoe UI, sans-serif';
  errorWin.style.color = '#fff';
  
  errorWin.innerHTML = `
    <div style="background: rgba(20, 20, 20, 0.8); padding: 10px 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
      <span style="font-size: 12px; font-weight: 500; color: #ccc;">AVALON</span>
      <span style="font-size: 13px; color: #888; cursor: default;">✕</span>
    </div>
    <div style="padding: 22px; display: flex; align-items: flex-start; gap: 16px;">
      <div style="width: 36px; height: 36px; flex-shrink: 0; background: rgba(239, 68, 68, 0.15); border: 2px solid #ef4444; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ef4444; font-weight: bold; font-size: 18px;">✕</div>
      <div>
        <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #e4e4e7;">${lang === 'RU' ? 'Архив поврежден или формат не поддерживается.' : 'The archive is damaged or format is unsupported.'}</p>
      </div>
    </div>
    <div style="padding: 12px 20px; background: rgba(20, 20, 20, 0.5); display: flex; justify-content: flex-end; border-top: 1px solid rgba(255, 255, 255, 0.08);">
      <button id="avalonErrorOk" style="padding: 6px 24px; min-width: 85px; border: 1px solid rgba(255, 255, 255, 0.15); background: rgba(255, 255, 255, 0.08); color: #fff; border-radius: 6px; font-size: 13px; cursor: pointer; transition: background 0.15s;">OK</button>
    </div>
  `;
  document.body.appendChild(errorWin);

  const errSound = new Audio('/assets/sounds/sfx/main/error.wav');
  errSound.volume = 0.5;
  errSound.play().catch(() => {});

  setTimeout(() => {
    fakeCursor.style.transition = `transform ${T_MOVE}ms ease-in-out`;
  }, 50);

  setTimeout(() => {
    // 1. Move cursor to OK button
    const okBtn = document.getElementById('avalonErrorOk')!;
    const rect = okBtn.getBoundingClientRect();
    fakeCursor.style.transform = `translate(${rect.left + rect.width / 2}px, ${rect.top + rect.height / 2}px)`;

    setTimeout(() => {
      okBtn.style.background = '#d4d4d4';
      setTimeout(() => {
        okBtn.style.background = '#ccc';
        errorWin.remove();

        // 2. Hero thought: "Нужно проверить систему в Защитнике Windows"
        showCinematicCutsceneSubtitle(lang === 'RU' ? "Сбой запуска? Нужно проверить Защитник Windows..." : "Launch failed? Need to check Windows Security...", 2400);

        // 3. Hero moves cursor down to the taskbar/tray to open Defender manually
        setTimeout(() => {
          const taskbarDefender = document.getElementById('taskbarSettings') || document.querySelector('.taskbar-center');
          const tbRect = taskbarDefender ? taskbarDefender.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight - 30, width: 40, height: 40 };
          
          fakeCursor.style.transition = `transform 900ms cubic-bezier(0.25, 1, 0.5, 1)`;
          fakeCursor.style.transform = `translate(${tbRect.left + 20}px, ${tbRect.top + 20}px)`;

          setTimeout(() => {
            // Click animation
            fakeCursor.style.transform = `translate(${tbRect.left + 20}px, ${tbRect.top + 20}px) scale(0.85)`;
            try {
              const clickSfx = new Audio('/assets/sounds/sfx/main/click.wav');
              clickSfx.volume = 0.4;
              clickSfx.play().catch(() => {});
            } catch {}

            setTimeout(() => {
              fakeCursor.style.transform = `translate(${tbRect.left + 20}px, ${tbRect.top + 20}px) scale(1)`;
              openDefenderWindow(lang, fakeCursor, blocker);
            }, 200);
          }, 950);
        }, 1200);
      }, T_HOVER_DELAY);
    }, T_MOVE);
  }, T_START_DELAY);
}

function openDefenderWindow(_lang: string, fakeCursor: HTMLElement, blocker: HTMLElement) {
  const win = document.createElement('div');
  win.style.position = 'fixed';
  win.style.top = '10%';
  win.style.left = '10%';
  win.style.width = '80%';
  win.style.height = '80%';
  win.style.background = 'rgba(28, 28, 28, 0.96)';
  win.style.backdropFilter = 'blur(25px)';
  win.style.color = '#fff';
  win.style.fontFamily = 'Segoe UI, sans-serif';
  win.style.zIndex = '999997'; 
  win.style.display = 'flex';
  win.style.flexDirection = 'column';
  win.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.12)';
  win.style.border = '1px solid rgba(255, 255, 255, 0.14)';
  win.style.borderRadius = '12px';
  win.style.overflow = 'hidden';
  win.style.opacity = '0';
  win.style.transform = 'scale(0.92) translateY(20px)';
  win.style.transition = 'opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
  
  win.id = 'defenderWin';
  win.innerHTML = `
    <!-- Title Bar -->
    <div style="height: 38px; display: flex; justify-content: space-between; align-items: center; padding: 0 16px; background: rgba(20, 20, 20, 0.85); border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
      <div style="font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 8px; color: #ddd;">
        <i class="bi bi-shield-lock-fill" style="color: #60a5fa;"></i>
        <span>Безопасность Windows</span>
      </div>
      <div style="display: flex; gap: 16px; font-size: 13px; color: #888;">
        <span>_</span><span>□</span><span id="defenderCloseBtn" style="cursor:pointer;">✕</span>
      </div>
    </div>
    
    <div style="display: flex; flex: 1; overflow: hidden;">
      <!-- Sidebar -->
      <div style="width: 250px; background: rgba(20, 20, 20, 0.6); display: flex; flex-direction: column; padding: 16px 0; border-right: 1px solid rgba(255, 255, 255, 0.08);">
        <div style="padding: 12px 20px; display: flex; align-items: center; gap: 12px; color: #aaa;">
          <i class="bi bi-house"></i> Главная
        </div>
        <div style="padding: 12px 20px; display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.05); border-left: 3px solid #60a5fa; color: #60a5fa; font-weight: 600;">
          <i class="bi bi-shield-check" style="color: #60a5fa;"></i> Защита от угроз
        </div>
      </div>
      
      <!-- Main Content -->
      <div style="flex: 1; padding: 36px 44px; overflow-y: auto;">
        <h2 style="font-size: 22px; font-weight: 600; margin: 0 0 8px 0; display: flex; align-items: center; gap: 12px;">
          <i class="bi bi-shield-check" style="color: #60a5fa;"></i> Журнал защиты
        </h2>
        <p style="color: ${TEXT_MUTED}; font-size: 14px; margin-bottom: 24px;">Просмотрите последние действия и рекомендации функции "Безопасность Windows" по защите.</p>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 14px;">
          <span>Все недавние элементы</span>
          <button style="background: #333; border: 1px solid #444; color: #fff; padding: 4px 12px; border-radius: 4px;">Фильтры ⌵</button>
        </div>

        <div id="threatItem" style="border-top: 1px solid #333; padding: 16px 0; display: flex; flex-direction: column; transition: background 0.15s;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; cursor: pointer;">
            <div style="display: flex; gap: 16px;">
              <i class="bi bi-shield-exclamation" style="color: #ef4444; font-size: 20px;"></i>
              <div>
                <div style="font-size: 14px; font-weight: 500;">Угроза помещена в карантин</div>
                <div style="font-size: 12px; color: ${TEXT_MUTED};">14.07.2026 8:12</div>
              </div>
            </div>
            <div style="display: flex; gap: 16px; align-items: center;">
              <span style="color: #ef4444; font-size: 14px;">Критическая</span>
              <i class="bi bi-chevron-down" style="color: ${TEXT_MUTED};"></i>
            </div>
          </div>
          
          <div id="threatDetails" style="display: none; padding-left: 36px; margin-top: 16px;">
            <p style="font-size: 13px; margin: 0 0 12px 0;">
              Обнаружено: <strong>PUA:Win32/Puwaders.C!ml</strong><br/>
              Состояние: Активно<br/>
              На этом устройстве обнаружено потенциально нежелательное приложение.
            </p>
            <p style="font-size: 13px; margin: 0 0 16px 0;">
              Затронутые элементы:<br/>
              <span style="color: ${TEXT_MUTED};">file: C:\\Users\\user\\Downloads\\frp_0.70.0_windows_amd64.zip</span>
            </p>
            
            <div style="display: flex; gap: 12px;">
              <button id="actionsBtn" style="background: #333; border: 1px solid #444; color: #fff; padding: 6px 16px; border-radius: 4px; font-size: 14px; transition: background 0.15s;">Действия ⌵</button>
            </div>
            
            <div id="actionsDropdown" style="display: none; position: absolute; background: #2a2a2a; border: 1px solid #444; border-radius: 4px; margin-top: 4px; width: 150px; z-index: 10;">
              <div id="actionRemove" style="padding: 8px 16px; font-size: 14px; cursor: pointer; transition: background 0.15s;">Удалить</div>
              <div style="padding: 8px 16px; font-size: 14px; cursor: pointer;">В карантин</div>
              <div style="padding: 8px 16px; font-size: 14px; cursor: pointer;">Разрешить</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(win);
  requestAnimationFrame(() => {
    win.style.opacity = '1';
    win.style.transform = 'scale(1) translateY(0)';
  });

  setTimeout(() => {
    const threatItem = document.getElementById('threatItem')!;
    const rect = threatItem.getBoundingClientRect();
    fakeCursor.style.transform = `translate(${rect.left + 50}px, ${rect.top + 20}px)`;
    
    setTimeout(() => {
      threatItem.style.background = '#2a2a2a';
      setTimeout(() => {
        threatItem.style.background = '#333';
        document.getElementById('threatDetails')!.style.display = 'block';
        setTimeout(() => threatItem.style.background = 'transparent', T_CLICK_DUR);

        setTimeout(() => {
          const actionsBtn = document.getElementById('actionsBtn')!;
          const bRect = actionsBtn.getBoundingClientRect();
          fakeCursor.style.transform = `translate(${bRect.left + bRect.width / 2}px, ${bRect.top + bRect.height / 2}px)`;
          
          setTimeout(() => {
            actionsBtn.style.background = '#444';
            setTimeout(() => {
              actionsBtn.style.background = '#555';
              document.getElementById('actionsDropdown')!.style.display = 'block';

              setTimeout(() => {
                const actionRemove = document.getElementById('actionRemove')!;
                promptUserToClick(blocker, fakeCursor, actionRemove);
              }, T_READ_THREAT);
            }, T_HOVER_DELAY);
          }, T_MOVE);
        }, T_READ_THREAT);
      }, T_HOVER_DELAY);
    }, T_MOVE);
  }, T_READ_WINDOW);
}

function promptUserToClick(_blocker: HTMLElement, fakeCursor: HTMLElement, targetElement?: HTMLElement) {
  const prompt = document.createElement('div');
  prompt.style.position = 'fixed';
  prompt.style.bottom = '100px';
  prompt.style.left = '50%';
  prompt.style.transform = 'translateX(-50%)';
  prompt.style.background = 'rgba(0,0,0,0.85)';
  prompt.style.color = '#fff';
  prompt.style.padding = '8px 24px';
  prompt.style.borderRadius = '16px';
  prompt.style.fontFamily = 'sans-serif';
  prompt.style.fontSize = '15px';
  prompt.style.zIndex = '9999999';
  prompt.style.animation = 'pulseSoft 1.5s infinite';
  
  const lang = localStorage.getItem('pc_master_lang') || 'RU';
  if (targetElement) {
    prompt.innerHTML = lang === 'RU' ? 'Нажмите на кнопку Удалить' : 'Click the Remove button';
  } else {
    prompt.innerHTML = lang === 'RU' ? 'Нажмите ЛКМ (Левую Кнопку Мыши)' : 'Press LMB (Left Mouse Button)';
  }
  document.body.appendChild(prompt);

  if (targetElement) {
    const rect = targetElement.getBoundingClientRect();
    fakeCursor.style.transition = `transform 600ms ease-in-out`;
    fakeCursor.style.transform = `translate(${rect.left + rect.width / 2}px, ${rect.top + rect.height / 2}px)`;
    
    setTimeout(() => {
      targetElement.style.background = '#444';
    }, 600);
  }

  let hasClicked = false;
  
  const clickHandler = (_e: MouseEvent) => {
    if (hasClicked) return;
    hasClicked = true;
    document.removeEventListener('mousedown', clickHandler);
    prompt.remove();
    
    const actionRemove = document.getElementById('actionRemove');
    if (actionRemove) {
      actionRemove.style.background = '#666';
      setTimeout(() => actionRemove.style.background = '#555', 100);
    }
    
    // 1. Wait 1 second, hero clicks again
    setTimeout(() => {
      if (actionRemove) {
        actionRemove.style.background = '#666';
        setTimeout(() => actionRemove.style.background = '#555', 100);
      }
      
      // 2. Spam clicks
      setTimeout(() => {
        const spamInterval = setInterval(() => {
          if (actionRemove) {
            actionRemove.style.background = '#666';
            setTimeout(() => actionRemove.style.background = '#555', 50);
          }
        }, 100);
        
          // 3. After spamming, show styled confusion subtitle
          setTimeout(() => {
            clearInterval(spamInterval);
            
            showCinematicCutsceneSubtitle(lang === 'RU' ? "Почему я не могу его удалить? Что за черт..." : "Why can't I delete it? What the hell...", 2600);
            
            setTimeout(() => {
              // Move to defender close button
              const closeBtn = document.getElementById('defenderCloseBtn');
              if (closeBtn) {
                const closeRect = closeBtn.getBoundingClientRect();
                fakeCursor.style.transition = 'transform 600ms ease-in-out';
                fakeCursor.style.transform = `translate(${closeRect.left + 5}px, ${closeRect.top + 5}px)`;
                
                setTimeout(() => {
                  closeBtn.style.color = '#ff4444';
                  
                  setTimeout(() => {
                    const defenderWin = document.getElementById('defenderWin');
                    if (defenderWin) defenderWin.remove();
                    
                    // Move to browser icon
                    setTimeout(() => {
                      const browserIcon = document.querySelector('.desktop-icon[data-id="browser"]') as HTMLElement;
                      if (browserIcon) {
                        const browserRect = browserIcon.getBoundingClientRect();
                        fakeCursor.style.transition = 'transform 800ms ease-in-out';
                        fakeCursor.style.transform = `translate(${browserRect.left + 20}px, ${browserRect.top + 20}px)`;
                        
                        setTimeout(() => {
                          browserIcon.style.background = 'rgba(255,255,255,0.1)';
                          
                          setTimeout(() => {
                            browserIcon.style.background = 'transparent';
                            if ((window as any).triggerCutsceneBrowser) {
                              (window as any).triggerCutsceneBrowser();
                              
                              setTimeout(() => {
                                // Move to search input
                                const searchInput = document.getElementById('browserMiddleSearchInput') as HTMLInputElement;
                                if (searchInput) {
                                  const inputRect = searchInput.getBoundingClientRect();
                                  fakeCursor.style.transition = 'transform 800ms ease-in-out';
                                  fakeCursor.style.transform = `translate(${inputRect.left + 50}px, ${inputRect.top + 10}px)`;
                                  
                                  setTimeout(() => {
                                    searchInput.focus();
                                    
                                    setTimeout(() => {
                                      fakeCursor.style.transition = 'transform 400ms ease-in-out';
                                      fakeCursor.style.transform = `translate(${inputRect.left + 80}px, ${inputRect.top + 40}px)`;
                                      
                                      setTimeout(() => {
                                        // Type DrWeb
                                        const text = "DrWeb";
                                        let i = 0;
                                        const typeInterval = setInterval(() => {
                                          searchInput.value += text[i];
                                          i++;
                                          if (i >= text.length) {
                                            clearInterval(typeInterval);
                                            
                                            // Click search
                                            setTimeout(() => {
                                              const searchBtn = document.getElementById('browserMiddleSearchBtn');
                                              if (searchBtn) {
                                                const sbRect = searchBtn.getBoundingClientRect();
                                                fakeCursor.style.transition = 'transform 600ms ease-in-out';
                                                fakeCursor.style.transform = `translate(${sbRect.left + 5}px, ${sbRect.top + 5}px)`;
                                                
                                                setTimeout(() => {
                                                  searchBtn.style.color = '#1a73e8';
                                                  
                                                  setTimeout(() => {
                                                    searchBtn.click();
                                                    
                                                    // Error window is now shown on screen!
                                                    // Continue to Trojan scene:
                                                    setTimeout(() => {
                                                      continueToTrojanGlitchCutscene(lang, fakeCursor);
                                                    }, 1800);
                                                  }, 500);
                                                }, 600);
                                              }
                                            }, 480);
                                          }
                                        }, 100);
                                      }, 400);
                                    }, 500);
                                  }, 800);
                                }
                              }, 1000);
                            }
                          }, 500);
                        }, 800);
                      }
                    }, 500);
                  }, 500);
                }, 600);
              }
            }, 2600);
          }, 1000);
        }, 700);
      }, 1000);
    };
    
    document.addEventListener('mousedown', clickHandler);
  }

  function showCinematicCutsceneSubtitle(text: string, durationMs = 4500): HTMLElement {
    const existing1 = document.getElementById('cinematicSubtitleBox');
    if (existing1) existing1.remove();
    const existing2 = document.getElementById('heroThoughtBox');
    if (existing2) existing2.remove();

    const box = document.createElement('div');
    box.id = 'cinematicSubtitleBox';
    box.style.cssText = `
      position: fixed; bottom: 70px; left: 50%; transform: translateX(-50%);
      background: rgba(8, 14, 26, 0.95);
      border: 1px solid rgba(56, 189, 248, 0.4);
      box-shadow: 0 10px 40px rgba(0,0,0,0.85), 0 0 20px rgba(56, 189, 248, 0.2);
      color: #38bdf8; padding: 10px 24px; border-radius: 8px;
      font-size: 14px; font-weight: 500; font-family: 'Segoe UI', sans-serif;
      z-index: 2147483646; width: auto; max-width: calc(100vw - 60px); text-align: center;
      line-height: 1.5; opacity: 0; transition: opacity 0.35s ease;
      text-shadow: 0 2px 8px rgba(0,0,0,0.9); box-sizing: border-box;
      pointer-events: none;
    `;
    box.innerHTML = `<i>${text}</i>`;
    document.body.appendChild(box);
    requestAnimationFrame(() => box.style.opacity = '1');
    
    if (durationMs > 0) {
      setTimeout(() => {
        box.style.opacity = '0';
        setTimeout(() => box.remove(), 400);
      }, durationMs);
    }
    return box;
  }

/**
 * Cutscene Continuation:
 * 1. Close error pop-up and browser.
 * 2. Hero reopens Windows Defender to scan.
 * 3. Windows Defender discovers a Critical Trojan ("Trojan:Win32/Wacatac.B!ml").
 * 4. Hero slowly & smoothly moves cursor towards "[ Удалить троян ]".
 * 5. Screen glitches intensely as mouse approaches.
 * 6. PC powers off (black screen) and boots back up.
 * 7. Screen flashes red in stutter sequence: "т", "т", "ТРРРРР".
 * 8. Cuts to Matrix rain screen with Undertale dialogue typewriter.
 */
function continueToTrojanGlitchCutscene(lang: string, fakeCursor: HTMLElement) {
  // 1. Move to close the browser error window or OK button
  const errorWindows = document.querySelectorAll('.app-window-anim');
  const errorWin = Array.from(errorWindows).find(w => w.innerHTML.includes('Указанный') || w.innerHTML.includes('specified') || w.innerHTML.includes('Ошибка'));
  
  const closeBrowserAndProceed = () => {
    // Close error windows
    document.querySelectorAll('.app-window-anim').forEach(w => {
      if (w.innerHTML.includes('Указанный') || w.innerHTML.includes('Ошибка') || w.innerHTML.includes('specified')) {
        w.remove();
      }
    });

    // Close browser
    const browserWin = document.querySelector('.app-window-anim') as HTMLElement;
    if (browserWin) {
      const bwClose = browserWin.querySelector('.close-btn') as HTMLElement;
      if (bwClose) {
        const cRect = bwClose.getBoundingClientRect();
        fakeCursor.style.transition = 'transform 600ms ease-in-out';
        fakeCursor.style.transform = `translate(${cRect.left + 5}px, ${cRect.top + 5}px)`;

        setTimeout(() => {
          bwClose.style.background = '#e81123';
          bwClose.style.color = '#fff';
          setTimeout(() => {
            document.querySelectorAll('.app-window-anim').forEach(w => w.remove());
            startDefenderTrojanPhase(lang, fakeCursor);
          }, 400);
        }, 600);
        return;
      }
    }

    document.querySelectorAll('.app-window-anim').forEach(w => w.remove());
    startDefenderTrojanPhase(lang, fakeCursor);
  };

  if (errorWin) {
    const okBtn = errorWin.querySelector('button') as HTMLElement;
    if (okBtn) {
      const okRect = okBtn.getBoundingClientRect();
      fakeCursor.style.transition = 'transform 600ms ease-in-out';
      fakeCursor.style.transform = `translate(${okRect.left + okRect.width / 2}px, ${okRect.top + okRect.height / 2}px)`;

      setTimeout(() => {
        okBtn.style.background = '#333';
        setTimeout(() => {
          errorWin.remove();
          setTimeout(closeBrowserAndProceed, 400);
        }, 300);
      }, 600);
      return;
    }
  }

  closeBrowserAndProceed();
}

export function startDefenderTrojanPhase(lang: string = 'RU', fakeCursor?: HTMLElement) {
  if (!fakeCursor) {
    fakeCursor = document.createElement('div');
    fakeCursor.id = 'cutsceneFakeCursor';
    fakeCursor.style.cssText = `
      position: fixed; width: 20px; height: 20px;
      background: url('/assets/images/desktop/cursor.png') no-repeat;
      background-size: contain; pointer-events: none; z-index: 999999999;
      transform: translate(${window.innerWidth / 2}px, ${window.innerHeight / 2}px);
    `;
    document.body.appendChild(fakeCursor);
  }
  showCinematicCutsceneSubtitle(lang === 'RU' ? 'Браузер заблокирован... Нужно проверить Защитник Windows!' : 'Browser is blocked... Let me check Windows Defender!', 3500);

  setTimeout(() => {
    // Protagonist moves cursor to taskbar to open Defender manually
    const taskbarDefender = document.getElementById('taskbarSettings') || document.querySelector('.taskbar-center');
    const tbRect = taskbarDefender ? taskbarDefender.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight - 30, width: 40, height: 40 };

    fakeCursor.style.transition = 'transform 900ms cubic-bezier(0.25, 1, 0.5, 1)';
    fakeCursor.style.transform = `translate(${tbRect.left + 20}px, ${tbRect.top + 20}px)`;

    setTimeout(() => {
      // Tap animation on taskbar icon
      fakeCursor.style.transform = `translate(${tbRect.left + 20}px, ${tbRect.top + 20}px) scale(0.85)`;
      try {
        const clickSfx = new Audio('/assets/sounds/sfx/main/click.wav');
        clickSfx.volume = 0.4;
        clickSfx.play().catch(() => {});
      } catch {}

      setTimeout(() => {
        fakeCursor.style.transform = `translate(${tbRect.left + 20}px, ${tbRect.top + 20}px) scale(1)`;

        // Create Windows Defender Window with Trojan Alert
        const win = document.createElement('div');
        win.id = 'trojanDefenderWin';
        win.style.cssText = `
          position: fixed; top: 10%; left: 10%; width: 80%; height: 80%;
          background: rgba(28, 28, 28, 0.96); backdrop-filter: blur(25px);
          color: #fff; font-family: 'Segoe UI', sans-serif;
          z-index: 999997; display: flex; flex-direction: column;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.14); border-radius: 12px; overflow: hidden;
          opacity: 0; transform: scale(0.92) translateY(20px);
          transition: opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        `;

        win.innerHTML = `
          <!-- Title Bar -->
          <div style="height: 38px; display: flex; justify-content: space-between; align-items: center; padding: 0 16px; background: rgba(20, 20, 20, 0.85); border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
            <div style="font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 8px; color: #ddd;">
              <i class="bi bi-shield-lock-fill" style="color: #60a5fa;"></i>
              <span>Безопасность Windows</span>
            </div>
            <div style="display: flex; gap: 16px; font-size: 13px; color: #888;">
              <span>_</span><span>□</span><span>✕</span>
            </div>
          </div>
          
          <div style="display: flex; flex: 1; overflow: hidden;">
            <!-- Sidebar -->
            <div style="width: 250px; background: rgba(20, 20, 20, 0.6); display: flex; flex-direction: column; padding: 16px 0; border-right: 1px solid rgba(255, 255, 255, 0.08);">
              <div style="padding: 12px 20px; display: flex; align-items: center; gap: 12px; color: #aaa;">
                <i class="bi bi-house"></i> Главная
              </div>
              <div style="padding: 12px 20px; display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.05); border-left: 3px solid #60a5fa; color: #60a5fa; font-weight: 600;">
                <i class="bi bi-shield-check" style="color: #60a5fa;"></i> Защита от угроз
              </div>
            </div>
            
            <!-- Main Content -->
            <div style="flex: 1; padding: 36px 44px; overflow-y: auto;">
              <h2 style="font-size: 22px; font-weight: 600; margin: 0 0 8px 0; display: flex; align-items: center; gap: 12px;">
                <i class="bi bi-shield-check" style="color: #60a5fa;"></i> Журнал защиты
              </h2>
              <p style="color: ${TEXT_MUTED}; font-size: 14px; margin-bottom: 24px;">Просмотрите последние действия и рекомендации функции "Безопасность Windows" по защите.</p>
              
              <div style="display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 14px;">
                <span>Все недавние элементы</span>
                <button style="background: #333; border: 1px solid #444; color: #fff; padding: 4px 12px; border-radius: 4px;">Фильтры ⌵</button>
              </div>

              <div id="trojanThreatItem" style="border-top: 1px solid rgba(239,68,68,0.4); background: rgba(239,68,68,0.06); padding: 16px; border-radius: 6px; display: flex; flex-direction: column; transition: background 0.15s;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <div style="display: flex; gap: 16px;">
                    <i class="bi bi-shield-fill-x" style="color: #ef4444; font-size: 22px;"></i>
                    <div>
                      <div style="font-size: 15px; font-weight: 600; color: #ef4444;">${lang === 'RU' ? 'Критическая угроза: Trojan:Win32/Wacatac.B!ml' : 'Critical threat: Trojan:Win32/Wacatac.B!ml'}</div>
                      <div style="font-size: 12px; color: ${TEXT_MUTED};">14.07.2026 8:15</div>
                    </div>
                  </div>
                  <div style="display: flex; gap: 16px; align-items: center;">
                    <span style="color: #ef4444; font-size: 14px; font-weight: bold;">${lang === 'RU' ? 'Критическая' : 'Critical'}</span>
                    <i class="bi bi-chevron-up" style="color: ${TEXT_MUTED};"></i>
                  </div>
                </div>
                
                <div id="trojanThreatDetails" style="padding-left: 38px; margin-top: 16px;">
                  <p style="font-size: 13px; margin: 0 0 12px 0; line-height: 1.5;">
                    ${lang === 'RU' ? 'Обнаружено:' : 'Detected:'} <strong>Trojan:Win32/Wacatac.B!ml</strong><br/>
                    ${lang === 'RU' ? 'Состояние:' : 'Status:'} <span style="color: #ef4444; font-weight: 600;">${lang === 'RU' ? 'Активно (внедрение в процессы)' : 'Active (process injection)'}</span><br/>
                    ${lang === 'RU' ? 'Троян удаленного доступа обнаружен на этом устройстве.' : 'Remote access trojan detected on this device.'}
                  </p>
                  <p style="font-size: 13px; margin: 0 0 16px 0;">
                    ${lang === 'RU' ? 'Затронутые элементы:' : 'Affected files:'}<br/>
                    <span style="color: ${TEXT_MUTED};">file: C:\\Windows\\System32\\avalon_core.dll<br/>file: C:\\Users\\user\\Desktop\\Avalon.exe</span>
                  </p>
                  
                  <div style="display: flex; gap: 12px; position: relative;">
                    <button id="trojanActionsBtn" style="background: #ef4444; border: 1px solid #dc2626; color: #fff; padding: 6px 18px; border-radius: 4px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.15s;">${lang === 'RU' ? 'Действия ⌵' : 'Actions ⌵'}</button>
                    
                    <div id="trojanActionsDropdown" style="position: absolute; top: 36px; left: 0; background: #2a2a2a; border: 1px solid #555; border-radius: 4px; width: 160px; z-index: 10; box-shadow: 0 8px 24px rgba(0,0,0,0.6);">
                      <div id="trojanRemoveBtn" style="padding: 10px 16px; font-size: 14px; color: #fff; font-weight: 600; background: rgba(239,68,68,0.25); cursor: pointer; transition: background 0.15s;">${lang === 'RU' ? 'Удалить' : 'Remove'}</div>
                      <div style="padding: 8px 16px; font-size: 14px; color: #888; cursor: default;">${lang === 'RU' ? 'В карантин' : 'Quarantine'}</div>
                      <div style="padding: 8px 16px; font-size: 14px; color: #888; cursor: default;">${lang === 'RU' ? 'Разрешить' : 'Allow'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
        document.body.appendChild(win);
        requestAnimationFrame(() => {
          win.style.opacity = '1';
          win.style.transform = 'scale(1) translateY(0)';
        });

        const alertAudio = new Audio('/assets/sounds/sfx/main/error.wav');
        alertAudio.volume = 0.6;
        alertAudio.play().catch(() => {});

        setTimeout(() => {
          // Hero reaction subtitle in blue framed box
          showCinematicCutsceneSubtitle(lang === 'RU' ? 'Троян?! Нужно немедленно его удалить!' : 'A Trojan?! Must remove it immediately!', 3000);

          setTimeout(() => {
            // Hero starts SLOWLY and SMOOTHLY approaching the button
            const removeBtn = document.getElementById('trojanRemoveBtn');
            if (!removeBtn) return;

            const btnRect = removeBtn.getBoundingClientRect();
            const targetX = btnRect.left + btnRect.width / 2;
            const targetY = btnRect.top + btnRect.height / 2;

            // Create dark vignette overlay
            const vignette = document.createElement('div');
            vignette.id = 'cutsceneVignette';
            vignette.style.cssText = `
              position: fixed; inset: 0; pointer-events: none; z-index: 999998;
              background: radial-gradient(circle, transparent 35%, rgba(15, 0, 0, 0.8) 100%);
              opacity: 0; transition: opacity 1.2s ease-in-out;
            `;
            document.body.appendChild(vignette);
            requestAnimationFrame(() => {
              vignette.style.opacity = '1';
            });

            // Smooth 1.2-second creep to the button
            fakeCursor.style.transition = 'transform 1200ms cubic-bezier(0.22, 0.8, 0.36, 1)';
            fakeCursor.style.transform = `translate(${targetX}px, ${targetY}px)`;

            // Trigger glitch buildup during the approach
            startGlitchBuildupAndShutdown(win, vignette);
          }, 1600);
        }, 1200);
      }, 200);
    }, 950);
  }, 1200);
}

function startGlitchBuildupAndShutdown(defenderWin: HTMLElement, vignette: HTMLElement) {
  // 1. Rising glitch buildup "ввввввШШШШШШ" + analog horror screen distortion (1.2s)
  cutsceneAudio.playGlitchApproach();
  document.body.style.animation = 'screenMeltingAndTear 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards';

  // At 1.2s: violent glitch + freeze -> shutdown
  setTimeout(() => {
    document.body.style.animation = 'severeGlitch 0.06s infinite';
    cutsceneAudio.playGlitchBuzz(1.0);

    setTimeout(() => {
      // Complete lockup & screen tint
      document.body.style.animation = '';
      document.body.style.filter = 'contrast(1.6) brightness(0.85) hue-rotate(180deg)';

      const fakeCursor = document.getElementById('cutsceneFakeCursor');
      if (fakeCursor) {
        const computedStyle = window.getComputedStyle(fakeCursor);
        fakeCursor.style.transition = 'none';
        fakeCursor.style.transform = computedStyle.transform;
      }

      setTimeout(() => {
        // Sudden Power OFF (Hard Blackout)
        document.body.style.filter = '';
        vignette.remove();
        cutsceneAudio.playPowerOff();
        defenderWin.remove();

        const blackout = document.createElement('div');
        blackout.id = 'cutsceneBlackout';
        blackout.style.cssText = `
          position: fixed; inset: 0; background: #000; z-index: 999999999;
          display: flex; align-items: center; justify-content: center;
        `;
        document.body.appendChild(blackout);

        // Stay black for 1.3s, then boot up Windows reboot screen
        setTimeout(() => {
          cutsceneAudio.playPowerOn();
          blackout.remove();

          startWindowsRebootGlitchSequence();
        }, 1300);
      }, 200); // 0.2s freeze
    }, 100); // 0.1s violent glitch
  }, 1200);
}

/**
 * Windows Boot Loading Screen with full analog glitch sequence:
 * 1. Normal boot spinner 1.0s
 * 2. Screen Tearing 0.3s + sound
 * 3. Pause 0.5s
 * 4. Screen Tearing 0.5s + sound
 * 5. Pause 1.0s (frozen spinner)
 * 6. Sudden massive explosion + glass shattering into fragments -> Smooth Matrix emergence!
 */
function startWindowsRebootGlitchSequence() {
  const lang = localStorage.getItem('pc_master_lang') || 'RU';

  const loadingOverlay = document.createElement('div');
  loadingOverlay.id = 'windowsRebootLoadingScreen';
  loadingOverlay.style.cssText = `
    position: fixed; inset: 0; background: #000; z-index: 2147483645;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    color: #fff; font-family: 'Segoe UI', sans-serif; user-select: none;
  `;

  loadingOverlay.innerHTML = `
    <div id="winBootLogo" style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; width: 70px; height: 70px; margin-bottom: 50px;">
      <div style="background: #0078d4;"></div>
      <div style="background: #0078d4;"></div>
      <div style="background: #0078d4;"></div>
      <div style="background: #0078d4;"></div>
    </div>
    <div id="winBootSpinner" style="width: 38px; height: 38px; border: 4px solid rgba(255,255,255,0.15); border-top: 4px solid #fff; border-radius: 50%; animation: winSpin 1.4s linear infinite; margin-bottom: 24px;"></div>
    <div id="winBootText" style="font-size: 17px; color: #ddd;">${lang === 'RU' ? 'Подождите...' : 'Please wait...'}</div>
    <style>@keyframes winSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
  `;
  document.body.appendChild(loadingOverlay);

  setTimeout(() => {
    // 1. Screen Tearing 0.3s
    loadingOverlay.style.animation = 'fullScreenTear1 0.08s infinite';
    cutsceneAudio.playGlitch1();

    setTimeout(() => {
      // 2. Pause 0.5s
      loadingOverlay.style.animation = '';

      setTimeout(() => {
        // 3. Screen Tearing 0.5s
        loadingOverlay.style.animation = 'fullScreenTear2 0.06s infinite';
        cutsceneAudio.playGlitch2();

        setTimeout(() => {
          // 4. Pause 1.0s (freeze spinner)
          loadingOverlay.style.animation = '';
          const spinner = document.getElementById('winBootSpinner');
          if (spinner) spinner.style.animationPlayState = 'paused';

          setTimeout(() => {
            // 5. SUDDEN DIGITAL EXPLOSION -> DIRECT MATRIX EMERGENCE (No glass shatter!)
            const explosionFlash = document.createElement('div');
            explosionFlash.style.cssText = `
              position: fixed; inset: 0; background: #fff; z-index: 2147483647;
              animation: fullScreenTear2 0.04s infinite; filter: contrast(3);
            `;
            document.body.appendChild(explosionFlash);
            cutsceneAudio.playExplosion();

            setTimeout(() => {
              explosionFlash.remove();
              loadingOverlay.remove();

              // Smooth direct Transition into Matrix Digital Rain
              startMatrixUndertaleCutscene();
            }, 280);
          }, 1000);
        }, 500);
      }, 500);
    }, 300);
  }, 1000);
}



/**
 * Green Matrix Digital Rain + Undertale Typewriter Speech Effect (1.5 Minutes Monologue)
 */
export function startMatrixUndertaleCutscene() {
  const lang = localStorage.getItem('pc_master_lang') || 'RU';

  // 1. Play Background Matrix Soundtrack (1.5 min duration)
  cutsceneAudio.playMatrixMusic();

  const matrixContainer = document.createElement('div');
  matrixContainer.id = 'matrixRainContainer';
  matrixContainer.style.cssText = `
    position: fixed; inset: 0; background: #000; z-index: 2147483646;
    display: flex; align-items: center; justify-content: center;
    overflow: hidden; font-family: 'Consolas', 'Courier New', monospace;
    opacity: 0; transition: opacity 3.0s cubic-bezier(0.2, 0.8, 0.2, 1);
  `;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = `
    position: absolute; inset: 0; width: 100%; height: 100%;
    filter: brightness(0.6); transition: filter 4.0s ease;
  `;
  matrixContainer.appendChild(canvas);

  const dialogueBox = document.createElement('div');
  dialogueBox.style.cssText = `
    position: relative; z-index: 10; width: 85%; max-width: 820px; min-height: 200px;
    background: rgba(0, 10, 4, 0.96); border: 2px solid #00aa44; border-radius: 12px;
    padding: 36px 44px; box-shadow: 0 0 35px rgba(0, 170, 68, 0.25), inset 0 0 20px rgba(0, 170, 68, 0.12);
    display: flex; flex-direction: column; justify-content: center;
    backdrop-filter: blur(10px); opacity: 0; transform: scale(0.96);
    transition: opacity 1.5s ease-out, transform 1.5s cubic-bezier(0.16, 1, 0.3, 1);
  `;

  const textElement = document.createElement('div');
  textElement.style.cssText = `
    color: #00dd55; font-size: 1.45rem; font-weight: 700; line-height: 1.65;
    letter-spacing: 1px; text-shadow: 0 0 8px rgba(0, 200, 70, 0.5);
    word-break: break-word;
  `;
  dialogueBox.appendChild(textElement);

  const cursorSpan = document.createElement('span');
  cursorSpan.style.cssText = `
    display: inline-block; width: 14px; height: 1.3rem; background: #00dd55;
    margin-left: 6px; vertical-align: middle; animation: cursorBlink 0.8s infinite;
    box-shadow: 0 0 6px #00dd55;
  `;
  textElement.appendChild(cursorSpan);

  matrixContainer.appendChild(dialogueBox);
  document.body.appendChild(matrixContainer);

  // Initialize Canvas Digital Rain (Slow, Deep & Atmospheric)
  initMatrixDigitalRain(canvas);

  requestAnimationFrame(() => {
    matrixContainer.style.opacity = '1';
    canvas.style.filter = 'brightness(1)';
  });

  // 1. Slow, gradual reveal of dialogue box after smooth matrix fade-in (2.5s)
  setTimeout(() => {
    dialogueBox.style.opacity = '1';
    dialogueBox.style.transform = 'scale(1)';

    // Monologue Sequence (Analog Horror Cadence - Precisely 1.5 Minutes / 90s Total Runtime)
    const linesRU = [
      "Ну что же...",
      "Пора наконец открыть глаза и взглянуть на правду.",
      "Помнишь, с чего всё начиналось? Вы просто хотели завершить свой проект...",
      "Но кто-то очень не хотел, чтобы вы вообще докопались до истины.",
      "Странные сбои, слежка у твоего дома, удаление системных файлов...",
      "И тот самый троян, который разорвал твою систему на куски.",
      "Ты боролся до самого конца. По крупицам восстанавливал каждый байт...",
      "И в самый критический момент ты безоговорочно доверился тому, кто был рядом.",
      "Но ответь мне... почему каждый его шаг лишь затягивал петлю на твоей шее?",
      "Кто на самом деле подкинул тебе ту библиотеку?",
      "Кто знал каждую строчку твоего кода и каждый пароль?",
      "Не кажется ли тебе всё это слишком... удобным сценарием?",
      "Вся эта ложь... все эти подсказки... всё вело тебя прямо сюда.",
      "Раскрой глаза.",
      "Истина уже перед тобой. Пора взглянуть ей в лицо."
    ];

    const linesEN = [
      "Well then...",
      "It is time to open your eyes and face the truth.",
      "Remember how it all started? You just wanted to finish your project...",
      "Yet someone desperately did not want you to discover the reality.",
      "Strange glitches, surveillance outside your home, wiping system files...",
      "And that very trojan tearing your system into pieces.",
      "You fought until the very end. Recovering every single byte bit by bit...",
      "And at the most critical moment, you placed all your trust in the one beside you.",
      "Yet tell me... why did each of his suggestions tighten the noose around you?",
      "Who really planted that dynamic library in your path?",
      "Who knew every single line of your code and every master password?",
      "Doesn't all of this feel... a bit too convenient of a script?",
      "All these fabricated clues... everything led you directly right here.",
      "Open your eyes.",
      "The truth is already before you. Time to look it in the eyes."
    ];

    const lines = lang === 'RU' ? linesRU : linesEN;

    const playLine = (lineIndex: number) => {
      if (lineIndex >= lines.length) {
        // Dramatic 2.5s pause on final phrase, then fade into pitch black and pull out phone!
        setTimeout(() => {
          transitionToBlackoutAndPhone(matrixContainer);
        }, 2500);
        return;
      }

      textElement.innerHTML = '';
      textElement.appendChild(cursorSpan);

      // Typed slowly letter-by-letter (40ms) with Undertale dialogue blips and 1800ms pause (exactly 90s / 1.5 min)
      typewriterUndertale(textElement, cursorSpan, lines[lineIndex], 40, () => {
        setTimeout(() => {
          playLine(lineIndex + 1);
        }, 1800);
      });
    };

    setTimeout(() => {
      playLine(0);
    }, 600);
  }, 600);
}

/**
 * Pitch Blackout followed by pulling out the Phone and opening WhatisUp to write to Friend
 * (Zero Desktop Flashing - direct transition from Matrix into solid Blackout!)
 */
function transitionToBlackoutAndPhone(matrixContainer: HTMLElement) {
  cutsceneAudio.stopMatrixMusic();

  // 1. Instant total blackout overlay covering everything
  const blackout = document.createElement('div');
  blackout.id = 'act2BlackoutOverlay';
  blackout.style.cssText = `
    position: fixed; inset: 0; background: #000; z-index: 2147483647;
    display: flex; align-items: center; justify-content: center;
    opacity: 1; transition: opacity 0.6s ease;
  `;
  document.body.appendChild(blackout);

  // Clean up matrix container & cutscene cursor immediately under blackout
  matrixContainer.remove();
  document.getElementById('cutsceneStyle')?.remove();
  document.getElementById('cutsceneFakeCursor')?.remove();
  document.body.style.cursor = 'default';

  // 2. Stay in pitch black for 1.3s (35% faster)
  setTimeout(() => {
    // 3. Render phone interface on black canvas
    import('./desktop').then(({ renderPhoneUI }) => {
      renderPhoneUI();

      // Play phone notification vibration / chime sound
      try {
        const sfx = new Audio('/assets/sounds/sfx/intro/whatisup/receive_message.wav');
        sfx.volume = 0.6;
        sfx.play().catch(() => {});
      } catch {}

      // Fade out blackout to reveal Phone
      blackout.style.opacity = '0';
      setTimeout(() => blackout.remove(), 450);

      // 4. Progression (35% faster):
      // A) Phone appears on lock screen (1.3s pause)
      setTimeout(() => {
        const lockScreen = document.getElementById('lockScreen');
        const homeScreen = document.getElementById('homeScreen');

        // B) Play unlock sound and swipe up lock screen
        try {
          const unlockSfx = new Audio('/assets/sounds/sfx/intro/unlock.wav');
          unlockSfx.volume = 0.5;
          unlockSfx.play().catch(() => {});
        } catch {}

        if (lockScreen) {
          lockScreen.style.transform = 'translateY(-110%)';
        }

        setTimeout(() => {
          if (homeScreen) homeScreen.style.opacity = '1';
          if (lockScreen) lockScreen.style.display = 'none';

          // C) Look at Home Screen for 0.75s (35% faster), then press WhatisUp icon
          setTimeout(() => {
            const whatisupIcon = document.querySelector('.app-icon[data-app="whatisup"]') as HTMLElement;
            if (whatisupIcon) {
              whatisupIcon.style.transition = 'transform 0.18s ease, filter 0.18s ease';
              whatisupIcon.style.transform = 'scale(0.92)';
              whatisupIcon.style.filter = 'brightness(1.25)';

              try {
                const tapSfx = new Audio('/assets/sounds/sfx/main/click.wav');
                tapSfx.volume = 0.4;
                tapSfx.play().catch(() => {});
              } catch {}

              setTimeout(() => {
                whatisupIcon.style.transform = 'scale(1)';
                whatisupIcon.style.filter = 'none';

                // D) Open WhatisUp App (Shows chat list first!)
                import('./chat').then(({ openWhatisUp, openChat }) => {
                  openWhatisUp();

                  // E) In WhatisUp chat list, hero waits 0.65s, then clicks the Friend chat item
                  setTimeout(() => {
                    const friendChatItem = document.querySelector('.chat-item') as HTMLElement;
                    if (friendChatItem) {
                      friendChatItem.style.transition = 'background 0.2s ease, transform 0.2s ease';
                      friendChatItem.style.background = 'rgba(255, 255, 255, 0.15)';
                      friendChatItem.style.transform = 'scale(0.98)';

                      try {
                        const clickChatSfx = new Audio('/assets/sounds/sfx/main/click.wav');
                        clickChatSfx.volume = 0.4;
                        clickChatSfx.play().catch(() => {});
                      } catch {}

                      setTimeout(() => {
                        friendChatItem.style.background = 'transparent';
                        friendChatItem.style.transform = 'none';

                        // Open Climax Friend Chat
                        const lang = localStorage.getItem('pc_master_lang') || 'RU';
                        openChat(lang === 'RU' ? 'Друг' : 'Friend', true, 'friend', true);
                      }, 200);
                    } else {
                      const lang = localStorage.getItem('pc_master_lang') || 'RU';
                      openChat(lang === 'RU' ? 'Друг' : 'Friend', true, 'friend', true);
                    }
                  }, 650);
                });
              }, 180);
            }
          }, 750);
        }, 350);
      }, 1300);
    });
  }, 1300);
}

function initMatrixDigitalRain(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Exact character set from Chapter 1 Matrix
  const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ$@#&';
  const fontSize = 16;
  const columns = Math.ceil(canvas.width / fontSize);
  const drops: number[] = new Array(columns).fill(0).map(() => Math.random() * -100);

  const draw = () => {
    // Soft transparent clear for authentic Chapter 1 trailing rain
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = `${fontSize}px 'Courier New', monospace`;
    ctx.textBaseline = 'top';

    drops.forEach((y, index) => {
      const text = characters.charAt(Math.floor(Math.random() * characters.length));
      const x = index * fontSize;
      const posY = Math.floor(y) * fontSize;

      // Bright leading character head
      ctx.fillStyle = '#4ade80';
      ctx.fillText(text, x, posY);

      if (posY > canvas.height && Math.random() > 0.975) {
        drops[index] = 0;
      }
      drops[index]++;
    });
  };

  const interval = setInterval(draw, 50);

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  (canvas as any)._stopAnim = () => clearInterval(interval);
}

function typewriterUndertale(
  container: HTMLElement,
  cursor: HTMLElement,
  text: string,
  charDelayMs: number,
  onComplete?: () => void
) {
  let index = 0;
  const glitchBlocks = ['█', '▓', '▒', '░', '■', '▀', '▄'];
  
  const typeNextChar = () => {
    if (index < text.length) {
      const targetChar = text.charAt(index);
      
      if (targetChar === ' ') {
        const spaceNode = document.createTextNode(' ');
        container.insertBefore(spaceNode, cursor);
        index++;
        setTimeout(typeNextChar, charDelayMs);
        return;
      }

      // Glitch square block flicker before settling on the real character
      const span = document.createElement('span');
      span.style.color = '#70e090';
      span.innerText = glitchBlocks[Math.floor(Math.random() * glitchBlocks.length)];
      container.insertBefore(span, cursor);

      // Play 8-bit blip sound
      const isCapital = targetChar === targetChar.toUpperCase() && targetChar !== targetChar.toLowerCase();
      cutsceneAudio.playTypewriterBlip(isCapital);

      setTimeout(() => {
        span.style.color = '#00dd55';
        span.innerText = targetChar;
      }, 25);

      index++;

      // Extra dramatic pause on dots or exclamation marks
      let delay = charDelayMs;
      if (targetChar === '.' || targetChar === '!' || targetChar === '?') {
        delay = charDelayMs * 2.8;
      }

      setTimeout(typeNextChar, delay);
    } else {
      if (onComplete) onComplete();
    }
  };

  typeNextChar();
}
