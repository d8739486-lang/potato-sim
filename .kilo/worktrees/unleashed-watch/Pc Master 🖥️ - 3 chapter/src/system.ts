// src/system.ts
import { initMainMenu } from './menu';

export type Language = 'RU' | 'EN';
let currentLang: Language = 'RU';

// 1. Asset Preloader
export async function initPreloader() {
  const app = document.getElementById('app') || document.body;
  app.innerHTML = `
    <div class="lang-container visible">
      <div class="lang-bg-overlay"></div>
      <div class="lang-content-wrapper" style="width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh;">
        <div id="loaderStatus" style="margin-bottom: 2rem; font-size: 1rem; opacity: 0.5; letter-spacing: 2px; font-weight: 400; text-align: center;">ЗАГРУЗКА РЕСУРСОВ...</div>
        <div style="width: 500px; height: 2px; background: rgba(255,255,255,0.05); position: relative; overflow: hidden;">
          <div id="progressBar" style="position: absolute; left: 0; top: 0; height: 100%; width: 0%; background: #fff; box-shadow: 0 0 20px #fff; transition: width 0.4s cubic-bezier(0.1, 0.7, 0.1, 1);"></div>
        </div>
        <div id="loaderPercent" style="margin-top: 2rem; font-size: 2rem; font-family: 'Orbitron', sans-serif; letter-spacing: 6px; font-weight: 900; text-align: center;">0%</div>
        <div style="position: fixed; bottom: 30px; left: 0; right: 0; text-align: center; font-size: 0.7rem; opacity: 0.3; letter-spacing: 1px; font-family: 'JetBrains Mono', monospace;">
          ЕСЛИ ИГРА НЕ ЗАГРУЖАЕТСЯ, ПЕРЕЗАГРУЗИТЕ СТРАНИЦУ<br>
          IF THE GAME DOES NOT LOAD, RELOAD THE PAGE
        </div>
      </div>
    </div>
  `;

  const assets = [
    { type: 'image', url: '/assets/images/desktop/icons/icons8-защитник-windows-96.png' },
    { type: 'image', url: '/assets/images/desktop/icons/start_icon.png' },
    { type: 'image', url: '/assets/images/desktop/wallpapers/desktop_bg.png' },
    { type: 'image', url: '/assets/images/menu_bg.png' },
    { type: 'image', url: '/assets/images/phone/icons/icon_calls.png' },
    { type: 'image', url: '/assets/images/phone/icons/icon_files.png' },
    { type: 'image', url: '/assets/images/phone/icons/icon_gallery.png' },
    { type: 'image', url: '/assets/images/phone/icons/icon_messages.png' },
    { type: 'image', url: '/assets/images/phone/icons/icon_settings.png' },
    { type: 'image', url: '/assets/images/phone/icons/icon_whatisup.png' },
    { type: 'image', url: '/assets/images/phone/icons/status_5g.png' },
    { type: 'image', url: '/assets/images/phone/icons/status_battery.png' },
    { type: 'image', url: '/assets/images/phone/icons/status_bt_off.png' },
    { type: 'image', url: '/assets/images/phone/icons/status_dark_mode.png' },
    { type: 'image', url: '/assets/images/phone/icons/status_wifi.png' },
    { type: 'image', url: '/assets/images/phone/wallpapers/home.jpeg' },
    { type: 'image', url: '/assets/images/phone/wallpapers/lock.jpg' },
    { type: 'audio', url: '/assets/sounds/sfx/intro/alarm.mp3' },
    { type: 'audio', url: '/assets/sounds/sfx/intro/alarm_off.mp3' },
    { type: 'audio', url: '/assets/sounds/sfx/intro/unlock.wav' },
    { type: 'audio', url: '/assets/sounds/sfx/intro/whatisup/receive_message.wav' },
    { type: 'audio', url: '/assets/sounds/sfx/intro/whatisup/send_message.wav' },
    { type: 'audio', url: '/assets/sounds/sfx/intro/whatisup/type.wav' },
    { type: 'audio', url: '/assets/sounds/sfx/intro/whatisup/type_delete.wav' },
    { type: 'audio', url: '/assets/sounds/sfx/main/btn_click.wav' },
    { type: 'audio', url: '/assets/sounds/sfx/main/btn_select.wav' },
    { type: 'audio', url: '/assets/sounds/sfx/main/error.wav' },
    { type: 'audio', url: '/assets/sounds/sfx/startup.wav' },
    { type: 'audio', url: '/assets/sounds/soundtracks/main_menu.mp3' },
  ];

  let loaded = 0;
  const progressBar = document.getElementById('progressBar')!;
  const loaderPercent = document.getElementById('loaderPercent')!;
  const loaderStatus = document.getElementById('loaderStatus')!;

  for (const asset of assets) {
    const fileName = asset.url.split('/').pop() || 'файл';
    loaderStatus.innerText = `ЗАГРУЗКА: ${fileName}...`;
    
    if (asset.type === 'image') {
      await new Promise(r => {
        const img = new Image();
        img.onload = r;
        img.onerror = r;
        img.src = asset.url;
      });
    } else {
      await new Promise(r => {
        const audio = new Audio();
        audio.oncanplaythrough = r;
        audio.onerror = r;
        audio.src = asset.url;
      });
    }
    
    loaded++;
    const pc = Math.floor((loaded / assets.length) * 100);
    progressBar.style.width = `${pc}%`;
    loaderPercent.innerText = `${pc}%`;
  }

  loaderStatus.innerText = 'ГОТОВО';
  setTimeout(() => {
    const langContainer = document.querySelector('.lang-container');
    if (langContainer) {
      langContainer.classList.remove('visible');
    }
    
    initLanguageSelection();
    
    setTimeout(() => {
      const langContainer = document.querySelector('.lang-container');
      if (langContainer) {
        langContainer.classList.add('visible');
      }
    }, 100);
  }, 1000);
}

export function initLanguageSelection(): void {
  const app = document.getElementById('app') || document.body;
  app.innerHTML = `
    <style>
      @keyframes aurora {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      .lang-container {
        position: fixed; inset: 0; 
        background: linear-gradient(-45deg, #00122e, #001f3f, #002d5a, #000c1f);
        background-size: 400% 400%;
        animation: aurora 15s ease infinite;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        font-family: 'JetBrains Mono', monospace; color: #fff;
        opacity: 0; transition: opacity 1.5s ease;
      }
      .lang-container.visible { opacity: 1; }
      .lang-bg-overlay { position: absolute; inset: 0; background: radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.4) 100%); z-index: 1; pointer-events: none; }
      .lang-content-wrapper { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; }
      .lang-title { font-family: 'Orbitron', sans-serif; font-size: 2.5rem; font-weight: 900; margin-bottom: 4rem; letter-spacing: 8px; opacity: 0.9; text-align: center; transition: transform 0.8s cubic-bezier(0.165, 0.84, 0.44, 1); margin-top: 10rem; }
      .lang-container.shifted .lang-title { transform: translateY(-80px); }
      .lang-options { display: flex; gap: 4rem; margin-bottom: 4rem; transition: transform 0.8s cubic-bezier(0.165, 0.84, 0.44, 1); }
      .lang-container.shifted .lang-options { transform: translateY(-80px); }
      .lang-btn { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); color: rgba(255, 255, 255, 0.5); padding: 2rem 5rem; cursor: pointer; transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1); font-size: 1.5rem; font-weight: 700; letter-spacing: 4px; border-radius: 8px; position: relative; backdrop-filter: blur(10px); }
      .lang-btn:hover { background: rgba(255, 255, 255, 0.08); color: rgba(255, 255, 255, 0.9); border-color: rgba(255, 255, 255, 0.3); transform: scale(1.05); }
      .lang-btn.selected { border-color: #fff; color: #fff; background: rgba(255, 255, 255, 0.12); box-shadow: 0 0 50px rgba(255, 255, 255, 0.1); }
      .lang-btn.selected::before { content: '✓'; position: absolute; top: -15px; right: -15px; background: #fff; color: #000; width: 30px; height: 30px; border-radius: 50%; font-size: 1rem; display: flex; align-items: center; justify-content: center; font-weight: 900; }
      .start-btn { background: #fff; color: #000; border: none; padding: 1.5rem 7rem; font-family: 'JetBrains Mono', monospace; font-size: 1.2rem; font-weight: 900; cursor: pointer; opacity: 0; pointer-events: none; transition: all 0.6s cubic-bezier(0.165, 0.84, 0.44, 1); transform: translateY(40px); letter-spacing: 6px; text-transform: uppercase; border-radius: 4px; }
      .start-btn.ready { opacity: 1; pointer-events: auto; transform: translateY(0); }
      .start-btn:hover { background: #f0f0f0; box-shadow: 0 0 60px rgba(255, 255, 255, 0.4); letter-spacing: 10px; padding-left: 8rem; padding-right: 8rem; }
    </style>
    <div class="lang-container">
      <div class="lang-bg-overlay"></div>
      <div class="lang-content-wrapper">
        <div class="lang-title">ВЫБЕРИТЕ ЯЗЫК / CHOOSE LANGUAGE</div>
        <div class="lang-options">
          <button id="ruBtn" class="lang-btn">RUSSIAN</button>
          <button id="enBtn" class="lang-btn">ENGLISH</button>
        </div>
        <button id="startBtn" class="start-btn">НАЧАТЬ / START</button>
      </div>
    </div>
  `;

  requestAnimationFrame(() => {
    document.querySelector('.lang-container')?.classList.add('visible');
  });

  // Startup sound
  const intro = new Audio('/assets/sounds/sfx/menu_appear.mp3');
  intro.volume = 0.5;
  intro.play().catch(() => {});

  const playSfx = (path: string) => {
    const sfx = new Audio(path);
    sfx.volume = 0.5;
    sfx.play().catch(() => {});
  };

  const ruBtn = document.getElementById('ruBtn');
  const enBtn = document.getElementById('enBtn');
  const startBtn = document.getElementById('startBtn');

  const select = (lang: Language) => {
    playSfx('/assets/sounds/sfx/main/btn_select.wav');
    currentLang = lang;
    ruBtn?.classList.toggle('selected', lang === 'RU');
    enBtn?.classList.toggle('selected', lang === 'EN');
    document.querySelector('.lang-container')?.classList.add('shifted');
    startBtn?.classList.add('ready');
  };

  ruBtn?.addEventListener('click', () => select('RU'));
  enBtn?.addEventListener('click', () => select('EN'));
  
  startBtn?.addEventListener('click', () => {
    playSfx('/assets/sounds/sfx/main/btn_click.wav');
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(console.warn);
    }
    const container = document.querySelector('.lang-container');
    if (container) {
      container.classList.remove('visible');
      setTimeout(() => initMainMenu(), 1500);
    }
  });
}

export function getLanguage(): Language { return currentLang; }
