import { getLanguage } from './system';
import { settings } from './menu';
import { openWhatisUp } from './chat';
import { openPhoneFiles, openPhoneGallery, openPhoneSettings, openPhoneMessages, openPhoneCalls } from './phoneApps';
import { openUniversalFileViewer } from './fileViewer';

// --- PHONE INTERFACE ---

export function initPhone(): void {
  const app = document.getElementById('app') || document.body;
  const lang = getLanguage();

  // Create black screen overlay for intro
  const overlay = document.createElement('div');
  overlay.id = 'mobileIntroOverlay';
  overlay.style.cssText = `
    position: fixed; inset: 0; background: #000; z-index: 1000;
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-family: 'JetBrains Mono', monospace;
    opacity: 1; transition: opacity 1s ease-in-out;
  `;

  const introText = document.createElement('div');
  introText.style.cssText = `font-size: 1.2rem; opacity: 0; transition: opacity 0.5s ease; letter-spacing: 2px;`;
  introText.innerText = lang === 'RU' ? 'да встаю я, встаю...' : 'yeah, I\'m getting up, getting up...';

  overlay.appendChild(introText);
  app.appendChild(overlay);

  // Sequence: 3.4 seconds total
  const alarm = new Audio('/assets/sounds/sfx/intro/alarm.mp3');
  alarm.loop = true;
  alarm.volume = 0.5;
  alarm.play().catch(() => { });

  // Show text immediately
  setTimeout(() => { introText.style.opacity = '0.6'; }, 500);

  // Stop alarm and finish earlier (0.8s faster)
  setTimeout(() => {
    alarm.pause();
    const alarmOff = new Audio('/assets/sounds/sfx/intro/alarm_off.mp3');
    alarmOff.volume = 0.5;
    alarmOff.play().catch(() => { });

    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.remove();
      renderPhoneUI();
    }, 1000);
  }, 3400);
}

export function renderPhoneUI(): void {
  const app = document.getElementById('app') || document.body;
  const lang = getLanguage();

  // Add animation styles
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes phoneAppear {
      0% { transform: scale(0.9) translateY(50px); opacity: 0; }
      100% { transform: scale(1) translateY(0); opacity: 1; }
    }
    .phone-screen {
      animation: phoneAppear 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `;
  document.head.appendChild(style);

  app.innerHTML = `
    <div class="phone-body" style="position: fixed; inset: 0; background: #000; display: flex; align-items: center; justify-content: center; overflow: hidden; z-index: 9999;">
      <div class="phone-screen" id="phoneScreen" style="width: 400px; height: 850px; background: #111; border-radius: 40px; position: relative; overflow: hidden; box-shadow: 0 0 100px rgba(0,0,0,0.5), 0 0 0 10px #222; opacity: 0;">
        
        <!-- Persistent Status Bar -->
        <div class="status-bar" style="position: absolute; top: 15px; left: 30px; right: 30px; display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; font-family: 'JetBrains Mono', monospace; opacity: 0.8; z-index: 1000; color: #fff;">
          <span id="statusBarTime">07:13</span>
          <div style="display:flex; gap:8px; align-items: center;">
              <img src="/assets/images/phone/icons/status_5g.png" style="height:12px; opacity: 0.9;">
              <img src="/assets/images/phone/icons/status_wifi.png" style="height:14px;">
              <img src="/assets/images/phone/icons/status_bt_off.png" style="height:14px; opacity: 0.6;">
              <img src="/assets/images/phone/icons/status_battery.png" style="height:14px;">
          </div>
        </div>

        <div class="lock-screen" id="lockScreen" style="position: absolute; inset: 0; background: url('/assets/images/phone/wallpapers/lock.jpg') center/cover; display: flex; flex-direction: column; align-items: center; z-index: 100; transition: transform 0.8s cubic-bezier(0.77, 0, 0.175, 1); color: #fff;">
          <div class="phone-time" id="phoneTime" style="font-family: 'Orbitron', sans-serif; font-size: 5rem; margin-top: 150px; font-weight: 300;">07:13</div>
          <div class="swipe-hint" style="position: absolute; bottom: 50px; font-size: 0.9rem; opacity: 0.4;">${lang === 'RU' ? 'свайпните вверх' : 'swipe up'}</div>
        </div>

        <div class="home-screen" id="homeScreen" style="position: absolute; inset: 0; background: url('/assets/images/phone/wallpapers/home.jpeg') center/cover; display: flex; flex-direction: column; justify-content: flex-end; padding-bottom: 50px; opacity: 0; transition: opacity 0.4s ease;">
          <div class="app-grid" style="display: flex; justify-content: center; gap: 23px; margin-bottom: 100px; flex-wrap: wrap;">
            <div class="app-icon" data-app="whatisup" style="cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 8px;">
              <img src="/assets/images/phone/icons/icon_whatisup.png" style="width: 60px; height: 60px; border-radius: 15px; background: rgba(255,255,255,0.1); backdrop-filter: blur(10px);">
              <div class="app-label" style="font-size: 0.7rem; color: #fff;">WhatisUp</div>
            </div>
            <div class="app-icon" data-app="files" style="cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 8px;">
              <img src="/assets/images/phone/icons/icon_files.png" style="width: 60px; height: 60px; border-radius: 15px; background: rgba(255,255,255,0.1); backdrop-filter: blur(10px);">
              <div class="app-label" style="font-size: 0.7rem; color: #fff;">${lang === 'RU' ? 'Файлы' : 'Files'}</div>
            </div>
            <div class="app-icon" data-app="gallery" style="cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 8px;">
              <img src="/assets/images/phone/icons/icon_gallery.png" style="width: 60px; height: 60px; border-radius: 15px; background: rgba(255,255,255,0.1); backdrop-filter: blur(10px);">
              <div class="app-label" style="font-size: 0.7rem; color: #fff;">${lang === 'RU' ? 'Галерея' : 'Gallery'}</div>
            </div>
            <div class="app-icon" data-app="settings" style="cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 8px;">
              <img src="/assets/images/phone/icons/icon_settings.png" style="width: 60px; height: 60px; border-radius: 15px; background: rgba(255,255,255,0.1); backdrop-filter: blur(10px);">
              <div class="app-label" style="font-size: 0.7rem; color: #fff;">${lang === 'RU' ? 'Настройки' : 'Settings'}</div>
            </div>
          </div>
          <div class="dock" style="background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(20px); border-radius: 30px; padding: 20px; display: flex; justify-content: center; gap: 20px; margin: 0 20px;">
            <div class="app-icon" data-app="messages"><img src="/assets/images/phone/icons/icon_messages.png" style="width: 60px; height: 60px; border-radius: 15px; background: rgba(255,255,255,0.1); backdrop-filter: blur(10px);"></div>
            <div class="app-icon" data-app="calls"><img src="/assets/images/phone/icons/icon_calls.png" style="width: 60px; height: 60px; border-radius: 15px; background: rgba(255,255,255,0.1); backdrop-filter: blur(10px);"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Swipe logic
  const lockScreen = document.getElementById('lockScreen')!;
  const homeScreen = document.getElementById('homeScreen')!;
  let isUnlocked = false;
  const handleUnlock = () => {
    if (isUnlocked) return;
    isUnlocked = true;

    // Unlock
    const unlockSound = new Audio('/assets/sounds/sfx/intro/unlock.wav');
    unlockSound.volume = (settings.sfxVolume / 100) * (settings.masterVolume / 100);
    unlockSound.play().catch(() => { });

    lockScreen.style.transform = 'translateY(-110%)';

    // Sync home screen appearance
    setTimeout(() => {
      homeScreen.style.opacity = '1';
      lockScreen.style.display = 'none';
      document.getElementById('goalNotify')?.classList.add('visible');
    }, 400); // Trigger mid-animation for smoothness
  };

  // Click-to-unlock removed per request
  // lockScreen.addEventListener('click', handleUnlock);

  // Swipe support (mouse/touch)
  let startY = 0;
  let isDragging = false;

  lockScreen.addEventListener('mousedown', (e) => { startY = e.clientY; isDragging = true; });
  lockScreen.addEventListener('touchstart', (e) => { startY = e.touches[0].clientY; isDragging = true; }, { passive: true });

  const handleEnd = (clientY: number) => {
    if (!isDragging) return;
    isDragging = false;
    if (startY - clientY > 40) handleUnlock(); // Swiped up
  };

  lockScreen.addEventListener('mouseup', (e) => handleEnd(e.clientY));
  lockScreen.addEventListener('touchend', (e) => handleEnd(e.changedTouches[0].clientY));
  lockScreen.addEventListener('mouseleave', () => { isDragging = false; });

  // App listener
  document.querySelectorAll('.app-icon').forEach(icon => {
    icon.addEventListener('click', () => {
      const app = (icon as HTMLElement).dataset.app;
      if (app === 'whatisup') openWhatisUp();
      else if (app === 'files') openPhoneFiles();
      else if (app === 'gallery') openPhoneGallery();
      else if (app === 'settings') openPhoneSettings();
      else if (app === 'messages') openPhoneMessages();
      else if (app === 'calls') openPhoneCalls();
    });
  });
}

// --- DESKTOP INTERFACE ---

export let globalMouseX = 0;
export let globalMouseY = 0;

window.addEventListener('mousemove', (e: MouseEvent) => {
  globalMouseX = e.clientX;
  globalMouseY = e.clientY;
});

export function initWindowsDesktop(): void {
  const app = document.getElementById('app') || document.body;

  // Windows 11 Boot Sequence
  app.innerHTML = `
    <div id="bootScreen" style="position: fixed; inset: 0; background: #000; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 999999; color: #fff; font-family: sans-serif;">
      <!-- Windows 11 Logo (4 cubes) -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; width: 80px; height: 80px; margin-bottom: 80px;">
        <div style="background: #0078d4;"></div>
        <div style="background: #0078d4;"></div>
        <div style="background: #0078d4;"></div>
        <div style="background: #0078d4;"></div>
      </div>
      
      <!-- Loading Spinner -->
      <div class="win-loader"></div>
      
      <style>
        .win-loader {
          width: 40px;
          height: 40px;
          position: relative;
        }
        .win-loader:before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 3px solid transparent;
          border-top-color: #fff;
          animation: winSpin 1.5s linear infinite;
        }
        @keyframes winSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    </div>
  `;

  setTimeout(() => {
    const bootScreen = document.getElementById('bootScreen');
    if (bootScreen) {
      bootScreen.style.opacity = '0';
      bootScreen.style.transition = 'opacity 0.5s ease';
      setTimeout(() => {
        bootScreen.remove();
        renderWindowsDesktop();

        // Play Windows startup sound
        const startupSfx = new Audio('/assets/sounds/sfx/startup.wav');
        startupSfx.volume = 0.6;
        startupSfx.play().catch(err => console.log('Audio autoplay blocked', err));
      }, 500);
    }
  }, 3500);
}

function renderWindowsDesktop(): void {
  const app = document.getElementById('app') || document.body;
  const lang = getLanguage();

  // Windows 11 Style Overrides & Animations
  const style = document.createElement('style');
  style.innerHTML = `
    .desktop-icon {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100px;
      padding: 10px 5px;
      border: 1px solid transparent;
      border-radius: 4px;
      transition: all 0.1s ease;
      cursor: pointer;
      user-select: none;
    }
    .desktop-icon:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(5px);
    }
    
    .app-window-anim {
      opacity: 0;
      transform: scale(0.97) translateY(10px);
      transition: opacity 0.2s cubic-bezier(0.2, 0.9, 0.3, 1), transform 0.2s cubic-bezier(0.2, 0.9, 0.3, 1);
    }
    .app-window-anim.open {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
    .desktop-icon img {
      width: 48px;
      height: 48px;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
      object-fit: contain;
    }
    .desktop-icon span {
      color: #fff;
      text-shadow: 0 1px 2px rgba(0,0,0,0.8);
      font-size: 0.72rem;
      text-align: center;
      margin-top: 8px;
      line-height: 1.2;
      word-break: break-word;
      max-width: 90px;
    }

    #taskbar {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 48px;
      background: rgba(20, 10, 30, 0.75); /* Dark Purple/Black */
      backdrop-filter: blur(20px) saturate(150%);
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      z-index: 10000;
      padding: 0 12px;
    }

    .taskbar-center {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 4px;
      align-items: center;
    }

    .taskbar-item {
      height: 40px;
      width: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: background 0.2s;
      cursor: default;
    }
    .taskbar-item:hover {
      background: rgba(255, 255, 255, 0.1);
    }
    .taskbar-item img {
      width: 28px;
      height: 28px;
    }

    
    @keyframes taskbarItemIn {
      0% { width: 0; opacity: 0; transform: translateY(10px) scale(0.8); margin: 0; }
      100% { width: 40px; opacity: 1; transform: translateY(0) scale(1); margin: 0; }
    }
    @keyframes taskbarItemOut {
      0% { width: 40px; opacity: 1; transform: scale(1); margin: 0; }
      100% { width: 0; opacity: 0; transform: scale(0.5); margin: 0; padding: 0; border: none; }
    }
    .taskbar-item.dynamic {
      animation: taskbarItemIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
      overflow: hidden;
    }
    .taskbar-item.dynamic.closing {
      animation: taskbarItemOut 0.2s ease-in forwards;
    }

    .system-tray {
      display: flex;
      align-items: center;
      gap: 12px;
      font-family: 'Segoe UI Variable Text', sans-serif;
      font-size: 0.75rem;
      color: #fff;
    }

    .tray-time-group {
      padding: 4px 8px;
      border-radius: 4px;
      transition: background 0.2s;
    }
    .tray-time-group:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    /* Windows 11 Start Menu */
    #startMenu {
      position: absolute;
      bottom: -600px;
      left: 50%;
      transform: translateX(-50%);
      width: 520px;
      height: 560px;
      background: rgba(25, 15, 35, 0.85);
      backdrop-filter: blur(30px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 8px;
      z-index: 9999;
      transition: bottom 0.4s cubic-bezier(0.1, 0.9, 0.2, 1);
      padding: 32px;
      color: #fff;
      box-shadow: 0 10px 40px rgba(0,0,0,0.5);
    }
    #startMenu.open {
      bottom: 60px;
    }
  `;
  document.head.appendChild(style);

  app.innerHTML = `
    <div id="desktop" style="width: 100vw; height: 100vh; background: url('/assets/images/desktop/wallpapers/desktop_bg.png') center/cover; position: relative; overflow: hidden; font-family: 'Segoe UI Variable Text', 'Segoe UI', sans-serif;">
      
      <!-- Desktop Icons Grid -->
      <div style="padding: 30px; display: grid; grid-template-columns: repeat(auto-fill, 100px); grid-auto-rows: 110px; grid-auto-flow: row; align-content: start; height: calc(100vh - 60px); gap: 18px; justify-content: start;">

        <!-- 'This PC' pinned top-left as first icon -->
        <div class="desktop-icon" data-id="this_pc">
          <i class="bi bi-pc-display" style="font-size: 44px; color: #60a5fa; margin-bottom: 4px;"></i>
          <span>${lang === 'RU' ? 'Этот компьютер' : 'This PC'}</span>
        </div>

        <!-- Browser -->
        <div class="desktop-icon" data-id="browser">
          <i class="bi bi-globe2" style="font-size: 44px; color: #3b82f6; margin-bottom: 4px;"></i>
          <span>${lang === 'RU' ? 'Браузер' : 'Browser'}</span>
        </div>

        <!-- Lore Document: Newspaper PDF -->
        <div class="desktop-icon" data-id="doc_newspaper">
          <i class="bi bi-file-earmark-pdf-fill" style="font-size: 44px; color: #f87171; margin-bottom: 4px;"></i>
          <span>${lang === 'RU' ? 'Газета_2024.pdf' : 'News_2024.pdf'}</span>
        </div>

        <!-- Lore Document: Personal Notes -->
        <div class="desktop-icon" data-id="doc_personal_notes">
          <i class="bi bi-file-earmark-text-fill" style="font-size: 44px; color: #38bdf8; margin-bottom: 4px;"></i>
          <span>${lang === 'RU' ? 'Заметки.txt' : 'Notes.txt'}</span>
        </div>

        <!-- Lore Document: Audio Call Recording -->
        <div class="desktop-icon" data-id="doc_audio_call">
          <i class="bi bi-music-note-beamed" style="font-size: 44px; color: #a78bfa; margin-bottom: 4px;"></i>
          <span>${lang === 'RU' ? 'Запись_04.wav' : 'Call_04.wav'}</span>
        </div>

        <!-- Other folders/programs -->
        <div class="desktop-icon" data-id="projects">
          <i class="bi bi-folder-fill" style="font-size: 44px; color: #fbbf24; margin-bottom: 4px;"></i>
          <span>${lang === 'RU' ? 'Проекты' : 'Projects'}</span>
        </div>
        <div class="desktop-icon" data-id="personal_folder">
          <i class="bi bi-folder-fill" style="font-size: 44px; color: #fbbf24; margin-bottom: 4px;"></i>
          <span>${lang === 'RU' ? 'Личное' : 'Personal'}</span>
        </div>
        <div class="desktop-icon" data-id="recycle_bin">
          <i class="bi bi-trash3-fill" style="font-size: 44px; color: #f87171; margin-bottom: 4px;"></i>
          <span>${lang === 'RU' ? 'Корзина' : 'Recycle Bin'}</span>
        </div>
      </div>

      <!-- Start Menu (Win 11 Style) -->
      <div id="startMenu">
        <div style="font-size: 0.8rem; font-weight: 600; margin-bottom: 20px; opacity: 0.9;">${lang === 'RU' ? 'Закрепленные' : 'Pinned'}</div>
        <div style="grid-template-columns: repeat(6, 1fr); gap: 10px; display: grid;">
           <div class="desktop-icon" id="startMenuSettings" style="width: auto; padding: 12px 0;">
              <i class="bi bi-gear-fill" style="font-size: 28px; color: #94a3b8; margin-bottom: 4px;"></i>
              <span style="font-size: 0.7rem;">${lang === 'RU' ? 'Параметры' : 'Settings'}</span>
           </div>
           <div class="desktop-icon" id="startMenuExplorer" style="width: auto; padding: 12px 0;">
              <i class="bi bi-folder-fill" style="font-size: 28px; color: #fbbf24; margin-bottom: 4px;"></i>
              <span style="font-size: 0.7rem;">${lang === 'RU' ? 'Проводник' : 'Explorer'}</span>
           </div>
        </div>
      </div>

      <!-- Taskbar -->
      <div id="taskbar">
        <div></div> <!-- Left spacing -->

        <div class="taskbar-center">
          <div class="taskbar-item" id="startBtn">
            <i class="bi bi-windows" style="font-size: 20px; color: #38bdf8;"></i>
          </div>
          <div class="taskbar-item" id="taskbarExplorer">
            <i class="bi bi-folder-fill" style="font-size: 20px; color: #fbbf24;"></i>
          </div>
          <div class="taskbar-item" id="taskbarBrowser">
            <i class="bi bi-globe2" style="font-size: 20px; color: #3b82f6;"></i>
          </div>
          <div class="taskbar-item" id="taskbarSettings">
            <i class="bi bi-gear-fill" style="font-size: 20px; color: #94a3b8;"></i>
          </div>
        </div>

        <div class="system-tray">
          <!-- Desktop clock removed per request -->
        </div>
      </div>
    </div>
  `;

  // Start Menu Toggle
  const startBtn = document.getElementById('startBtn');
  const startMenu = document.getElementById('startMenu') as HTMLElement;
  startBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    startMenu?.classList.toggle('open');
  });

  document.addEventListener('click', () => {
    startMenu?.classList.remove('open');
  });

  // Clock
  function updateClock() {
    const now = new Date();
    const timeEl = document.getElementById('taskbarTime');
    const dateEl = document.getElementById('taskbarDate');
    if (timeEl && dateEl) {
      timeEl.innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      dateEl.innerText = now.toLocaleDateString();
    }
  }
  updateClock();

  // Window Management System
  const openWindows = new Map<string, { id: string, title: string, icon: string, minimized: boolean, element: HTMLElement, taskbarItem: HTMLElement }>();
  let zIndexCounter = 10000;
  function getTopZIndex() {
    return zIndexCounter++;
  }

  function showWindowsError(title: string, message: string) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position: absolute; inset: 0; background: transparent; display: flex; align-items: center; justify-content: center; z-index: 99999;';

    const win = document.createElement('div');
    win.className = 'app-window-anim';
    win.id = 'custom-error-' + Math.random().toString(36).substr(2, 9);
    win.style.cssText = 'width: 450px; background: #202020; border-radius: 8px; border: 1px solid #333; box-shadow: 0 10px 40px rgba(0,0,0,0.6); pointer-events: auto; display: flex; flex-direction: column; overflow: hidden; color: #fff; font-family: "Segoe UI", sans-serif;';

    win.innerHTML = `
      <div style="height: 40px; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; font-size: 12px; user-select: none;">
        <span>${title}</span>
        <div class="close-btn" style="cursor: pointer; display: flex; align-items: center; justify-content: center; width: 46px; height: 32px; margin-right: -16px; margin-top: -8px; transition: background 0.15s; font-size: 16px;">✕</div>
      </div>
      <div style="padding: 16px 24px 32px 24px; display: flex; gap: 24px; align-items: center;">
        <div style="width: 56px; height: 56px; flex-shrink: 0; background: #ff5252; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 30px rgba(255,82,82,0.25);">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#222" stroke-width="1.5"><path d="M6 6L18 18M6 18L18 6"/></svg>
        </div>
        <div style="flex: 1; font-size: 15px; line-height: 1.4; font-weight: 400;">${message}</div>
      </div>
      <div style="padding: 16px 24px; background: #1a1a1a; display: flex; justify-content: flex-end; border-top: 1px solid #2a2a2a;">
        <button class="ok-btn" style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.1); color: #fff; padding: 6px 32px; border-radius: 4px; cursor: pointer; transition: background 0.15s; font-size: 14px; font-family: inherit;">OK</button>
      </div>
    `;

    overlay.appendChild(win);
    document.getElementById('desktop')?.appendChild(overlay);

    requestAnimationFrame(() => win.classList.add('open'));

    try {
      const errSound = new Audio('/assets/sounds/sfx/main/error.wav');
      errSound.volume = (settings.sfxVolume / 100) * (settings.masterVolume / 100);
      errSound.play().catch(() => { });
    } catch (e) { }

    const closeDialog = () => {
      win.classList.remove('open');
      setTimeout(() => overlay.remove(), 200);
    };

    const closeBtn = win.querySelector('.close-btn') as HTMLElement;
    closeBtn?.addEventListener('click', closeDialog);
    closeBtn?.addEventListener('mouseenter', () => closeBtn.style.background = '#e81123');
    closeBtn?.addEventListener('mouseleave', () => closeBtn.style.background = 'transparent');

    const okBtn = win.querySelector('.ok-btn') as HTMLElement;
    okBtn?.addEventListener('click', closeDialog);
    okBtn?.addEventListener('mouseenter', () => { okBtn.style.background = 'rgba(255, 255, 255, 0.12)'; okBtn.style.borderColor = 'rgba(255, 255, 255, 0.15)'; });
    okBtn?.addEventListener('mouseleave', () => { okBtn.style.background = 'rgba(255, 255, 255, 0.08)'; okBtn.style.borderColor = 'rgba(255, 255, 255, 0.1)'; });
  }

  function openAppWindow(id: string, title: string, iconHtml: string, htmlContent: string, customLogic?: (body: HTMLElement) => void): void {
    if (openWindows.has(id)) {
      const win = openWindows.get(id)!;
      if (win.minimized) {
        win.element.style.display = 'flex';
        win.taskbarItem.style.background = 'rgba(255, 255, 255, 0.2)';
        win.minimized = false;
        requestAnimationFrame(() => win.element.classList.add('open'));
      }
      win.element.style.zIndex = getTopZIndex().toString();
      return;
    }

    const overlay = document.createElement('div');
    overlay.className = 'app-window-anim';
    overlay.style.cssText = `position: absolute; top: 0; left: 0; width: 100vw; height: calc(100vh - 48px); background: transparent; display: flex; flex-direction: column; z-index: ${getTopZIndex()}; box-sizing: border-box; overflow: hidden;`;

    const contentContainer = document.createElement('div');
    contentContainer.style.cssText = 'width: 100%; height: 100%; background: rgba(20,20,20,0.98); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,0.08); border-radius: 0; display: flex; flex-direction: column; overflow: hidden; color: #fff; box-sizing: border-box;';

    const header = document.createElement('div');
    header.style.cssText = 'height: 40px; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; border-bottom: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.4);';

    const titleDiv = document.createElement('div');
    titleDiv.style.cssText = 'display: flex; align-items: center; gap: 10px; font-size: 0.85rem; opacity: 0.9; font-weight: 500; color: #fff;';

    // Convert icon size for header
    const headerIconHtml = iconHtml.replace(/font-size:\s*\d+px;?/g, 'font-size: 16px; margin-bottom: 0;');
    titleDiv.innerHTML = headerIconHtml + '<span>' + title + '</span>';

    const closeBtn = document.createElement('div');
    closeBtn.innerHTML = '<i class="bi bi-x"></i>';
    closeBtn.style.cssText = 'cursor: pointer; font-size: 20px; opacity: 0.7; transition: all 0.2s;';
    closeBtn.onmouseenter = () => closeBtn.style.opacity = '1';
    closeBtn.onmouseleave = () => closeBtn.style.opacity = '0.7';

    header.appendChild(titleDiv);
    header.appendChild(closeBtn);

    const body = document.createElement('div');
    body.style.cssText = 'flex: 1; display: flex; flex-direction: column; overflow: hidden; position: relative;';
    body.innerHTML = htmlContent;

    contentContainer.appendChild(header);
    contentContainer.appendChild(body);

    overlay.appendChild(contentContainer);
    document.getElementById('desktop')?.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.classList.add('open');
    });

    // Taskbar icon
    const taskbarItem = document.createElement('div');
    taskbarItem.className = 'taskbar-item dynamic';
    taskbarItem.style.background = 'rgba(255, 255, 255, 0.2)';
    const tbIconHtml = iconHtml.replace(/font-size:\s*\d+px;?/g, 'font-size: 20px; margin-bottom: 0;');
    taskbarItem.innerHTML = tbIconHtml;
    document.querySelector('.taskbar-center')?.appendChild(taskbarItem);

    const winState = { id, title, icon: iconHtml, minimized: false, element: overlay, taskbarItem };
    openWindows.set(id, winState);

    overlay.addEventListener('mousedown', () => {
      overlay.style.zIndex = getTopZIndex().toString();
    });

    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      overlay.classList.remove('open');
      taskbarItem.classList.add('closing');
      setTimeout(() => {
        overlay.remove();
        taskbarItem.remove();
        openWindows.delete(id);
      }, 200);
    });

    taskbarItem.addEventListener('click', () => {
      if (winState.minimized) {
        overlay.style.display = 'flex';
        taskbarItem.style.background = 'rgba(255, 255, 255, 0.2)';
        winState.minimized = false;
        overlay.style.zIndex = getTopZIndex().toString();
        requestAnimationFrame(() => {
          overlay.classList.add('open');
        });
      } else {
        const topZ = getTopZIndex() - 1;
        if (parseInt(overlay.style.zIndex || '0') === topZ) {
          overlay.classList.remove('open');
          setTimeout(() => {
            if (winState.minimized) {
              overlay.style.display = 'none';
            }
          }, 200);
          taskbarItem.style.background = 'transparent';
          winState.minimized = true;
        } else {
          overlay.style.zIndex = getTopZIndex().toString();
        }
      }
    });

    if (customLogic) {
      customLogic(body);
    }
  }

  function openNotepadWindow(fileName: string, textContent: string) {
    const icon = '<i class="bi bi-file-earmark-text" style="font-size: 44px; color: #60a5fa; margin-bottom: 4px;"></i>';
    const html = `
      <div style="display: flex; flex-direction: column; flex: 1; height: 100%; background: #1e1e1e; color: #d4d4d4; font-family: 'Consolas', monospace; font-size: 14px;">
        <div style="height: 28px; background: #252526; display: flex; align-items: center; gap: 16px; padding: 0 12px; font-size: 12px; color: #888; border-bottom: 1px solid rgba(255,255,255,0.06); font-family: 'Segoe UI', sans-serif; user-select: none;">
          <span>Файл</span><span>Правка</span><span>Формат</span><span>Вид</span><span>Справка</span>
        </div>
        <div style="flex: 1; padding: 16px; overflow-y: auto; white-space: pre-wrap; line-height: 1.6; user-select: text;">${textContent}</div>
      </div>
    `;
    openAppWindow('notepad_' + fileName, fileName + ' - Блокнот', icon, html);
  }

  // App Contents & Logics
  const getThisPcHtml = () => `
    <div id="explorerApp" style="display: flex; flex-direction: column; flex: 1; height: 100%; font-family: 'Segoe UI', sans-serif; background: #191919; color: #fff; user-select: none;">
      <!-- Explorer Toolbar & Address Bar -->
      <div style="display: flex; align-items: center; gap: 8px; padding: 8px 16px; background: #202020; border-bottom: 1px solid rgba(255,255,255,0.07);">
        <button id="expBackBtn" style="background: transparent; border: none; color: #aaa; font-size: 16px; cursor: pointer; width: 30px; height: 30px; border-radius: 4px; display: flex; align-items: center; justify-content: center; transition: background 0.15s;" onmouseover="this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.background='transparent'"><i class="bi bi-arrow-left"></i></button>
        <button id="expUpBtn" style="background: transparent; border: none; color: #aaa; font-size: 16px; cursor: pointer; width: 30px; height: 30px; border-radius: 4px; display: flex; align-items: center; justify-content: center; transition: background 0.15s;" onmouseover="this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.background='transparent'"><i class="bi bi-arrow-up"></i></button>
        
        <!-- Address Bar -->
        <div id="expAddressBar" style="flex: 1; display: flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 4px 12px; font-size: 13px; color: #ddd;">
          <i class="bi bi-pc-display" style="color: #60a5fa; font-size: 14px;"></i>
          <span id="expBreadcrumbs">${lang === 'RU' ? 'Этот компьютер' : 'This PC'}</span>
        </div>

        <!-- Search Bar -->
        <div style="width: 220px; display: flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 4px 10px; font-size: 13px; color: #888;">
          <i class="bi bi-search" style="font-size: 12px;"></i>
          <span>${lang === 'RU' ? 'Поиск в: Этот компьютер' : 'Search This PC'}</span>
        </div>
      </div>

      <!-- Main Explorer Area -->
      <div style="display: flex; flex: 1; overflow: hidden;">
        <!-- Left Quick Access Sidebar -->
        <div style="width: 210px; border-right: 1px solid rgba(255,255,255,0.07); padding: 12px 8px; background: #181818; display: flex; flex-direction: column; gap: 4px;">
          <div id="sideThisPc" class="exp-side-item" style="padding: 6px 12px; border-radius: 4px; display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; background: rgba(255,255,255,0.08);">
            <i class="bi bi-pc-display" style="color: #60a5fa;"></i>
            <span>${lang === 'RU' ? 'Этот компьютер' : 'This PC'}</span>
          </div>
          <div id="sideDocs" class="exp-side-item" style="padding: 6px 12px; border-radius: 4px; display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; color: #aaa; transition: background 0.15s;">
            <i class="bi bi-folder-fill" style="color: #fbbf24;"></i>
            <span>${lang === 'RU' ? 'Документы' : 'Documents'}</span>
          </div>
          <div id="sideDownloads" class="exp-side-item" style="padding: 6px 12px; border-radius: 4px; display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; color: #aaa; transition: background 0.15s;">
            <i class="bi bi-arrow-down-circle-fill" style="color: #38bdf8;"></i>
            <span>${lang === 'RU' ? 'Загрузки' : 'Downloads'}</span>
          </div>
          <div id="sidePictures" class="exp-side-item" style="padding: 6px 12px; border-radius: 4px; display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; color: #aaa; transition: background 0.15s;">
            <i class="bi bi-image" style="color: #34d399;"></i>
            <span>${lang === 'RU' ? 'Изображения' : 'Pictures'}</span>
          </div>
          
          <div style="height: 1px; background: rgba(255,255,255,0.07); margin: 8px 4px;"></div>

          <div id="sideDriveC" class="exp-side-item" style="padding: 6px 12px; border-radius: 4px; display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; color: #aaa; transition: background 0.15s;">
            <i class="bi bi-device-hdd-fill" style="color: #ef4444;"></i>
            <span>System (C:)</span>
          </div>
        </div>

        <!-- Right File List View -->
        <div id="expContentView" style="flex: 1; padding: 24px 32px; overflow-y: auto; display: flex; flex-direction: column;">
          <!-- Dynamically populated by getThisPcLogic -->
        </div>
      </div>
    </div>
  `;

  const getThisPcLogic = () => (body: HTMLElement) => {
    let currentPath = 'root';
    const historyStack: string[] = ['root'];

    const breadcrumbs = body.querySelector('#expBreadcrumbs') as HTMLElement;
    const contentView = body.querySelector('#expContentView') as HTMLElement;
    const backBtn = body.querySelector('#expBackBtn') as HTMLElement;
    const upBtn = body.querySelector('#expUpBtn') as HTMLElement;

    const sideThisPc = body.querySelector('#sideThisPc') as HTMLElement;
    const sideDocs = body.querySelector('#sideDocs') as HTMLElement;
    const sideDownloads = body.querySelector('#sideDownloads') as HTMLElement;
    const sidePictures = body.querySelector('#sidePictures') as HTMLElement;
    const sideDriveC = body.querySelector('#sideDriveC') as HTMLElement;

    const resetSidebar = () => {
      body.querySelectorAll('.exp-side-item').forEach(el => {
        (el as HTMLElement).style.background = 'transparent';
        (el as HTMLElement).style.color = '#aaa';
      });
    };

    const renderPath = (path: string, pushHistory = true) => {
      currentPath = path;
      if (pushHistory && historyStack[historyStack.length - 1] !== path) {
        historyStack.push(path);
      }

      resetSidebar();

      if (path === 'root') {
        if (sideThisPc) { sideThisPc.style.background = 'rgba(255,255,255,0.08)'; sideThisPc.style.color = '#fff'; }
        if (breadcrumbs) breadcrumbs.innerText = lang === 'RU' ? 'Этот компьютер' : 'This PC';

        contentView.innerHTML = `
          <div style="font-size: 14px; font-weight: 600; color: #ddd; margin-bottom: 14px;">${lang === 'RU' ? 'Папки' : 'Folders'}</div>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; margin-bottom: 28px;">
            
            <div class="exp-folder-card" data-goto="documents" style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: rgba(255,255,255,0.04); border-radius: 6px; cursor: pointer; transition: background 0.15s;" onmouseover="this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.background='rgba(255,255,255,0.04)'">
              <i class="bi bi-folder-fill" style="font-size: 28px; color: #fbbf24;"></i>
              <div>
                <div style="font-size: 13px; font-weight: 500;">${lang === 'RU' ? 'Документы' : 'Documents'}</div>
                <div style="font-size: 11px; color: #777;">${lang === 'RU' ? 'Системная папка' : 'System folder'}</div>
              </div>
            </div>

            <div class="exp-folder-card" data-goto="downloads" style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: rgba(255,255,255,0.04); border-radius: 6px; cursor: pointer; transition: background 0.15s;" onmouseover="this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.background='rgba(255,255,255,0.04)'">
              <i class="bi bi-arrow-down-circle-fill" style="font-size: 28px; color: #38bdf8;"></i>
              <div>
                <div style="font-size: 13px; font-weight: 500;">${lang === 'RU' ? 'Загрузки' : 'Downloads'}</div>
                <div style="font-size: 11px; color: #777;">${lang === 'RU' ? 'Системная папка' : 'System folder'}</div>
              </div>
            </div>

            <div class="exp-folder-card" data-goto="pictures" style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: rgba(255,255,255,0.04); border-radius: 6px; cursor: pointer; transition: background 0.15s;" onmouseover="this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.background='rgba(255,255,255,0.04)'">
              <i class="bi bi-image" style="font-size: 28px; color: #34d399;"></i>
              <div>
                <div style="font-size: 13px; font-weight: 500;">${lang === 'RU' ? 'Изображения' : 'Pictures'}</div>
                <div style="font-size: 11px; color: #777;">${lang === 'RU' ? 'Системная папка' : 'System folder'}</div>
              </div>
            </div>
          </div>

          <div style="font-size: 14px; font-weight: 600; color: #ddd; margin-bottom: 14px;">${lang === 'RU' ? 'Устройства и диски' : 'Devices and drives'}</div>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">
            
            <div class="exp-folder-card" data-goto="c_drive" style="display: flex; gap: 14px; background: rgba(255,255,255,0.04); padding: 16px; border-radius: 8px; transition: background 0.15s; cursor: pointer;" onmouseover="this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.background='rgba(255,255,255,0.04)'">
              <i class="bi bi-device-hdd-fill" style="font-size: 36px; color: #ef4444;"></i>
              <div style="flex: 1;">
                <div style="font-size: 14px; margin-bottom: 6px; color: #ef4444; font-weight: 500;">System (C:)</div>
                <div style="height: 10px; background: rgba(255,255,255,0.1); border-radius: 5px; overflow: hidden; margin-bottom: 6px;">
                  <div style="width: 95%; height: 100%; background: #ef4444;"></div>
                </div>
                <div style="font-size: 12px; color: #fca5a5;">23.0 GB ${lang === 'RU' ? 'свободно из' : 'free of'} 512 GB</div>
              </div>
            </div>

            <div class="exp-folder-card" data-goto="f_drive" style="display: flex; gap: 14px; background: rgba(255,255,255,0.04); padding: 16px; border-radius: 8px; transition: background 0.15s; cursor: pointer;" onmouseover="this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.background='rgba(255,255,255,0.04)'">
              <i class="bi bi-device-hdd-fill" style="font-size: 36px; color: #64748b;"></i>
              <div style="flex: 1;">
                <div style="font-size: 14px; margin-bottom: 6px; font-weight: 500;">Новый том (F:)</div>
                <div style="height: 10px; background: rgba(255,255,255,0.1); border-radius: 5px; overflow: hidden; margin-bottom: 6px;">
                  <div style="width: 51%; height: 100%; background: #0078d4;"></div>
                </div>
                <div style="font-size: 12px; color: #aaa;">45,6 GB ${lang === 'RU' ? 'свободно из' : 'free of'} 94,3 GB</div>
              </div>
            </div>
          </div>
        `;
      } else if (path === 'c_drive') {
        // Outcome 1: C Drive system investigation
        if (sideDriveC) { sideDriveC.style.background = 'rgba(255,255,255,0.08)'; sideDriveC.style.color = '#fff'; }
        if (breadcrumbs) breadcrumbs.innerText = `${lang === 'RU' ? 'Этот компьютер' : 'This PC'} > System (C:)`;

        contentView.innerHTML = `
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 20px;">
            <div id="expCrashDumpFile" style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px; padding: 14px; border-radius: 6px; cursor: pointer; border: 1px solid rgba(239, 68, 68, 0.3); background: rgba(239, 68, 68, 0.06);" onmouseover="this.style.background='rgba(239, 68, 68, 0.12)'" onmouseout="this.style.background='rgba(239, 68, 68, 0.06)'">
              <i class="bi bi-file-earmark-medical-fill" style="font-size: 42px; color: #ef4444;"></i>
              <span style="font-size: 12px; font-weight: 500;">crash_dump.log</span>
            </div>
            <div class="exp-item-icon" data-goto="windows" style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px; padding: 14px; border-radius: 6px; cursor: pointer;" onmouseover="this.style.background='rgba(255,255,255,0.06)'" onmouseout="this.style.background='transparent'">
              <i class="bi bi-folder-fill" style="font-size: 42px; color: #fbbf24;"></i>
              <span style="font-size: 12px;">Windows</span>
            </div>
            <div class="exp-item-icon" data-goto="progfiles" style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px; padding: 14px; border-radius: 6px; cursor: pointer;" onmouseover="this.style.background='rgba(255,255,255,0.06)'" onmouseout="this.style.background='transparent'">
              <i class="bi bi-folder-fill" style="font-size: 42px; color: #fbbf24;"></i>
              <span style="font-size: 12px;">Program Files</span>
            </div>
          </div>
        `;

        import('./winrarQuest').then(q => {
          const file = contentView.querySelector('#expCrashDumpFile') as HTMLElement;
          if (file) {
            file.addEventListener('click', () => {
              openNotepadWindow('crash_dump.log', '[CRASH DUMP LOG - 2024]\nFaulting Module: ntoskrnl.exe\nError Code: 0x0000007E (SYSTEM_THREAD_EXCEPTION_NOT_HANDLED)\nSystem memory integrity checked: OK\nNo project files found in this sector.');
              setTimeout(() => {
                q.showHeroThought(lang === 'RU' ? 'Эх, не нашел... Здесь только системные логи. Надо поискать в других папках.' : 'Not here... Only system crash logs here. Need to check other folders.');
                setTimeout(() => {
                  renderPath('root');
                }, 3500);
              }, 1200);
            }, { once: true });
          }
        });
      } else if (path === 'f_drive') {
        // Outcome 2: F Drive investigation
        if (breadcrumbs) breadcrumbs.innerText = `${lang === 'RU' ? 'Этот компьютер' : 'This PC'} > Новый том (F:)`;

        contentView.innerHTML = `
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 20px;">
            <div id="expPhotoArchiveItem" style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px; padding: 14px; border-radius: 6px; cursor: pointer; border: 1px solid rgba(56, 189, 248, 0.3); background: rgba(56, 189, 248, 0.06);" onmouseover="this.style.background='rgba(56, 189, 248, 0.12)'" onmouseout="this.style.background='rgba(56, 189, 248, 0.06)'">
              <i class="bi bi-file-earmark-zip-fill" style="font-size: 42px; color: #38bdf8;"></i>
              <span style="font-size: 12px; font-weight: 500;">Архив_Фоток_2023.zip</span>
            </div>
            <div style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px; padding: 14px; border-radius: 6px; cursor: pointer;" onmouseover="this.style.background='rgba(255,255,255,0.06)'" onmouseout="this.style.background='transparent'">
              <i class="bi bi-file-earmark-pdf-fill" style="font-size: 42px; color: #f87171;"></i>
              <span style="font-size: 12px;">Договор_2023.pdf</span>
            </div>
            <div style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px; padding: 14px; border-radius: 6px; cursor: pointer;" onmouseover="this.style.background='rgba(255,255,255,0.06)'" onmouseout="this.style.background='transparent'">
              <i class="bi bi-image" style="font-size: 42px; color: #34d399;"></i>
              <span style="font-size: 12px;">IMG_0042.jpg</span>
            </div>
          </div>
        `;

        import('./winrarQuest').then(q => {
          const item = contentView.querySelector('#expPhotoArchiveItem') as HTMLElement;
          if (item) {
            item.addEventListener('contextmenu', (e) => {
              e.preventDefault();

              const menu = document.createElement('div');
              menu.style.cssText = `
                position: fixed; left: ${e.clientX}px; top: ${e.clientY}px;
                background: #252526; border: 1px solid rgba(255,255,255,0.12);
                box-shadow: 0 8px 30px rgba(0,0,0,0.8); border-radius: 6px;
                padding: 4px 0; z-index: 1000000; font-family: 'Segoe UI', sans-serif;
                min-width: 180px; color: #fff; font-size: 13px;
              `;
              menu.innerHTML = `
                <div id="fArchiveProps" style="padding: 8px 16px; cursor: pointer; display: flex; align-items: center; gap: 10px;" onmouseover="this.style.background='#0078d4'" onmouseout="this.style.background='transparent'">
                  <i class="bi bi-info-circle"></i>
                  <span>${lang === 'RU' ? 'Свойства архива' : 'Properties'}</span>
                </div>
              `;
              document.body.appendChild(menu);

              const propsBtn = menu.querySelector('#fArchiveProps') as HTMLElement;
              propsBtn?.addEventListener('click', () => {
                menu.remove();
                showWindowsError(lang === 'RU' ? 'Свойства: Архив_Фоток_2023.zip' : 'Properties', lang === 'RU' ? 'Содержимое: 1,420 файлов (JPG, PNG). Исходников AVALON не обнаружено.' : 'Contents: 1,420 photo files. No AVALON files found.');
                setTimeout(() => {
                  q.showHeroThought(lang === 'RU' ? 'Не здесь... Тут только старые фотографии и бэкапы за прошлый год. Проверим другое место.' : 'Not here... Only old photos and backups from last year. Let us check another place.');
                  setTimeout(() => {
                    renderPath('root');
                  }, 3500);
                }, 1200);
              });

              const closeHandler = () => {
                menu.remove();
                window.removeEventListener('click', closeHandler);
              };
              setTimeout(() => window.addEventListener('click', closeHandler), 10);
            });
          }
        });
      } else if (path === 'users') {
        if (breadcrumbs) breadcrumbs.innerText = `${lang === 'RU' ? 'Этот компьютер' : 'This PC'} > System (C:) > ${lang === 'RU' ? 'Пользователи' : 'Users'}`;

        contentView.innerHTML = `
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 20px;">
            <div class="exp-item-icon" data-goto="user_profile" style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px; padding: 12px; border-radius: 6px; cursor: pointer;" onmouseover="this.style.background='rgba(255,255,255,0.06)'" onmouseout="this.style.background='transparent'">
              <i class="bi bi-folder-fill" style="font-size: 40px; color: #fbbf24;"></i>
              <span style="font-size: 12px;">User</span>
            </div>
            <div class="exp-item-icon" data-goto="empty" style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px; padding: 12px; border-radius: 6px; cursor: pointer;" onmouseover="this.style.background='rgba(255,255,255,0.06)'" onmouseout="this.style.background='transparent'">
              <i class="bi bi-folder-fill" style="font-size: 40px; color: #94a3b8;"></i>
              <span style="font-size: 12px;">${lang === 'RU' ? 'Общие' : 'Public'}</span>
            </div>
          </div>
        `;
      } else if (path === 'user_profile') {
        if (breadcrumbs) breadcrumbs.innerText = `${lang === 'RU' ? 'Этот компьютер' : 'This PC'} > System (C:) > ${lang === 'RU' ? 'Пользователи' : 'Users'} > User`;

        contentView.innerHTML = `
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 20px;">
            <div class="exp-item-icon" data-goto="documents" style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px; padding: 12px; border-radius: 6px; cursor: pointer;" onmouseover="this.style.background='rgba(255,255,255,0.06)'" onmouseout="this.style.background='transparent'">
              <i class="bi bi-folder-fill" style="font-size: 40px; color: #fbbf24;"></i>
              <span style="font-size: 12px;">${lang === 'RU' ? 'Документы' : 'Documents'}</span>
            </div>
            <div class="exp-item-icon" data-goto="downloads" style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px; padding: 12px; border-radius: 6px; cursor: pointer;" onmouseover="this.style.background='rgba(255,255,255,0.06)'" onmouseout="this.style.background='transparent'">
              <i class="bi bi-arrow-down-circle-fill" style="font-size: 40px; color: #38bdf8;"></i>
              <span style="font-size: 12px;">${lang === 'RU' ? 'Загрузки' : 'Downloads'}</span>
            </div>
            <div class="exp-item-icon" data-goto="pictures" style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px; padding: 12px; border-radius: 6px; cursor: pointer;" onmouseover="this.style.background='rgba(255,255,255,0.06)'" onmouseout="this.style.background='transparent'">
              <i class="bi bi-image" style="font-size: 40px; color: #34d399;"></i>
              <span style="font-size: 12px;">${lang === 'RU' ? 'Изображения' : 'Pictures'}</span>
            </div>
            <div class="exp-item-icon" data-goto="c_drive" style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px; padding: 12px; border-radius: 6px; cursor: pointer;" onmouseover="this.style.background='rgba(255,255,255,0.06)'" onmouseout="this.style.background='transparent'">
              <i class="bi bi-hdd-fill" style="font-size: 40px; color: #a1a1aa;"></i>
              <span style="font-size: 12px;">${lang === 'RU' ? 'Локальный диск (C:)' : 'Local Disk (C:)'}</span>
            </div>
            <div class="exp-item-icon" data-goto="d_drive" style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px; padding: 12px; border-radius: 6px; cursor: pointer;" onmouseover="this.style.background='rgba(255,255,255,0.06)'" onmouseout="this.style.background='transparent'">
              <i class="bi bi-hdd-network-fill" style="font-size: 40px; color: #60a5fa;"></i>
              <span style="font-size: 12px;">${lang === 'RU' ? 'Диск данных (D:)' : 'Data Disk (D:)'}</span>
            </div>
          </div>
        `;
      } else if (path === 'downloads') {
        if (sideDownloads) { sideDownloads.style.background = 'rgba(255,255,255,0.08)'; sideDownloads.style.color = '#fff'; }
        if (breadcrumbs) breadcrumbs.innerText = `${lang === 'RU' ? 'Этот компьютер' : 'This PC'} > ${lang === 'RU' ? 'Загрузки' : 'Downloads'}`;

        const quest = import('./winrarQuest');
        quest.then(q => {
          const state = q.getQuestState();
          contentView.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 20px;">
              ${state.winrarDownloaded ? `
                  <div id="expWinrarInstallerItem" style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px; padding: 12px; border-radius: 6px; cursor: pointer; background: rgba(139, 92, 246, 0.08); border: 1px solid rgba(139, 92, 246, 0.3);" onmouseover="this.style.background='rgba(139, 92, 246, 0.15)'" onmouseout="this.style.background='rgba(139, 92, 246, 0.08)'">
                    <i class="bi bi-file-earmark-zip-fill" style="font-size: 40px; color: #a78bfa;"></i>
                    <span style="font-size: 12px; font-weight: 500;">winrar-x64-701ru.exe</span>
                  </div>
                ` : ''
            }
              <div class="open-frp-zip" style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px; padding: 12px; border-radius: 6px; cursor: pointer;" onmouseover="this.style.background='rgba(255,255,255,0.06)'" onmouseout="this.style.background='transparent'">
                <i class="bi bi-file-earmark-zip" style="font-size: 40px; color: #94a3b8;"></i>
                <span style="font-size: 12px;">frp_windows.zip</span>
              </div>
              <div class="open-patch-txt" style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px; padding: 12px; border-radius: 6px; cursor: pointer;" onmouseover="this.style.background='rgba(255,255,255,0.06)'" onmouseout="this.style.background='transparent'">
                <i class="bi bi-file-earmark-text" style="font-size: 40px; color: #60a5fa;"></i>
                <span style="font-size: 12px;">patch_v3.log</span>
              </div>
            </div>
          `;

          const item = contentView.querySelector('#expWinrarInstallerItem') as HTMLElement;
          if (item && !state.winrarInstalled) {
            item.addEventListener('dblclick', (e) => {
              e.stopPropagation();
              q.openWinrarInstallerModal(() => {
                renderPath('downloads');
              });
            });
          }

          contentView.querySelector('.open-patch-txt')?.addEventListener('dblclick', () => {
            openUniversalFileViewer({
              name: 'patch_v3.log',
              type: 'text',
              title: 'Патч безопасности v3.0',
              content: '[SECURITY LOG - SERVER AUDIT]\n- User [ID: ████████] admin privileges revoked.\n- Quarantine flag set for AVALON project cluster.\n- Backdoor injection detected at port 4481.\n- Emergency data wiping initiated by administrator.\n- Status: Connection dropped.'
            });
          });

          contentView.querySelector('.open-frp-zip')?.addEventListener('dblclick', () => {
            openUniversalFileViewer({
              name: 'frp_windows.zip',
              type: 'text',
              title: 'frp_windows.zip',
              content: '[ARCHIVE METADATA]\nFast Reverse Proxy Client 0.70.0\nConfigured server: 185.220.101.44 (Digital Dreams Internal Relay)\nEncrypted tunnel established.'
            });
          });
        });
      } else if (path === 'pictures') {
        if (sidePictures) { sidePictures.style.background = 'rgba(255,255,255,0.08)'; sidePictures.style.color = '#fff'; }
        if (breadcrumbs) breadcrumbs.innerText = `${lang === 'RU' ? 'Этот компьютер' : 'This PC'} > ${lang === 'RU' ? 'Изображения' : 'Pictures'}`;

        contentView.innerHTML = `
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 20px;">
            <div class="open-pic-concept" style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px; padding: 12px; border-radius: 6px; cursor: pointer;" onmouseover="this.style.background='rgba(255,255,255,0.06)'" onmouseout="this.style.background='transparent'">
              <i class="bi bi-image" style="font-size: 40px; color: #38bdf8;"></i>
              <span style="font-size: 12px;">Концепт_Avalon.png</span>
            </div>
            <div class="open-pic-schema" style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px; padding: 12px; border-radius: 6px; cursor: pointer;" onmouseover="this.style.background='rgba(255,255,255,0.06)'" onmouseout="this.style.background='transparent'">
              <i class="bi bi-diagram-3-fill" style="font-size: 40px; color: #a78bfa;"></i>
              <span style="font-size: 12px;">Схема_Сети.png</span>
            </div>
            <div class="open-pic-family" style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px; padding: 12px; border-radius: 6px; cursor: pointer;" onmouseover="this.style.background='rgba(255,255,255,0.06)'" onmouseout="this.style.background='transparent'">
              <i class="bi bi-person-badge" style="font-size: 40px; color: #fbbf24;"></i>
              <span style="font-size: 12px;">Семья_1999.jpg</span>
            </div>
          </div>
        `;

        contentView.querySelector('.open-pic-concept')?.addEventListener('dblclick', () => {
          openUniversalFileViewer({
            name: 'Концепт_Avalon.png',
            type: 'image',
            title: 'Концепт-арт виртуального города AVALON (2023)',
            date: '10.03.2023',
            imageSrc: '/assets/images/desktop/wallpapers/desktop_bg.png'
          });
        });

        contentView.querySelector('.open-pic-schema')?.addEventListener('dblclick', () => {
          openUniversalFileViewer({
            name: 'Схема_Сети.png',
            type: 'image',
            title: 'Схема кластера Digital Dreams с точкой внедрения трояна',
            date: '02.11.2023',
            imageSrc: '/assets/images/phone/gallery/2.jpg'
          });
        });

        contentView.querySelector('.open-pic-family')?.addEventListener('dblclick', () => {
          openUniversalFileViewer({
            name: 'Семья_1999.jpg',
            type: 'image',
            title: 'Семейная фотография (Лица родителей и ребенка повреждены цифровым шумом)',
            date: '18.08.1999',
            imageSrc: '/assets/images/phone/gallery/1.jpg'
          });
        });
      } else if (path === 'c_drive' || path === 'd_drive') {
        if (sideDriveC) { sideDriveC.style.background = 'rgba(255,255,255,0.08)'; sideDriveC.style.color = '#fff'; }
        if (breadcrumbs) breadcrumbs.innerText = `${lang === 'RU' ? 'Этот компьютер' : 'This PC'} > ${path === 'c_drive' ? 'Локальный диск (C:)' : 'Диск данных (D:)'}`;

        contentView.innerHTML = `
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 20px;">
            <div style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px; padding: 12px; border-radius: 6px; cursor: pointer;" onmouseover="this.style.background='rgba(255,255,255,0.06)'" onmouseout="this.style.background='transparent'">
              <i class="bi bi-folder-fill" style="font-size: 40px; color: #fbbf24;"></i>
              <span style="font-size: 12px;">Windows</span>
            </div>
            <div style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px; padding: 12px; border-radius: 6px; cursor: pointer;" onmouseover="this.style.background='rgba(255,255,255,0.06)'" onmouseout="this.style.background='transparent'">
              <i class="bi bi-folder-fill" style="font-size: 40px; color: #fbbf24;"></i>
              <span style="font-size: 12px;">Program Files</span>
            </div>
            <div style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px; padding: 12px; border-radius: 6px; cursor: pointer;" onmouseover="this.style.background='rgba(255,255,255,0.06)'" onmouseout="this.style.background='transparent'">
              <i class="bi bi-folder-fill" style="font-size: 40px; color: #fbbf24;"></i>
              <span style="font-size: 12px;">Users</span>
            </div>
            <div class="open-system-dump" style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px; padding: 12px; border-radius: 6px; cursor: pointer;" onmouseover="this.style.background='rgba(255,255,255,0.06)'" onmouseout="this.style.background='transparent'">
              <i class="bi bi-file-earmark-code-fill" style="font-size: 40px; color: #ef4444;"></i>
              <span style="font-size: 12px;">CrashDump.sys</span>
            </div>
          </div>
        `;

        contentView.querySelector('.open-system-dump')?.addEventListener('dblclick', () => {
          openUniversalFileViewer({
            name: 'CrashDump.sys',
            type: 'code',
            title: 'Системный дамп ядра (Критический сбой)',
            content: '00000000: 4D 5A 90 00 03 00 00 00 04 00 00 00 FF FF 00 00  MZ..............\n00000010: B8 00 00 00 00 00 00 00 40 00 00 00 00 00 00 00  ........@.......\n00000020: 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................\n00000030: 54 68 69 73 20 70 72 6F 67 72 61 6D 20 63 61 6E  This program can\n00000040: 6E 6F 74 20 62 65 20 72 75 6E 20 69 6E 20 44 4F  not be run in DO\n00000050: 53 20 6D 6F 64 65 2E 0D 0D 0A 24 00 00 00 00 00  S mode....$.....\n[AVALON_CORE_VIRUS_SIGNATURE_DETECTED]: INJECT_PAYLOAD_READY'
          });
        });
      } else if (path === 'documents') {
        if (sideDocs) { sideDocs.style.background = 'rgba(255,255,255,0.08)'; sideDocs.style.color = '#fff'; }
        if (breadcrumbs) breadcrumbs.innerText = `${lang === 'RU' ? 'Этот компьютер' : 'This PC'} > ${lang === 'RU' ? 'Документы' : 'Documents'}`;

        const quest = import('./winrarQuest');
        quest.then(q => {
          const state = q.getQuestState();

          contentView.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(115px, 1fr)); gap: 16px;">
              ${state.avalonExtracted ? `
                  <div id="expAvalonExtractedFolder" style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px; padding: 10px; border-radius: 6px; cursor: pointer; border: 1px solid rgba(251, 191, 36, 0.4); background: rgba(251, 191, 36, 0.1);" onmouseover="this.style.background='rgba(251, 191, 36, 0.2)'" onmouseout="this.style.background='rgba(251, 191, 36, 0.1)'">
                    <i class="bi bi-folder-fill" style="font-size: 38px; color: #fbbf24;"></i>
                    <span style="font-size: 11.5px; font-weight: 600; color: #fde68a;">AVALON</span>
                  </div>
                  <div style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px; padding: 10px; border-radius: 6px; cursor: pointer; opacity: 0.8;" onmouseover="this.style.background='rgba(255,255,255,0.06)'" onmouseout="this.style.background='transparent'">
                    <i class="bi bi-file-earmark-zip-fill" style="font-size: 38px; color: #a78bfa;"></i>
                    <span style="font-size: 11.5px; color: #ccc;">AVALON.rar</span>
                  </div>
                ` : state.winrarInstalled ? `
                  <div id="expAvalonArchiveWinrar" style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px; padding: 10px; border-radius: 6px; cursor: pointer; border: 1px solid rgba(167, 139, 250, 0.4); background: rgba(167, 139, 250, 0.08);" onmouseover="this.style.background='rgba(167, 139, 250, 0.15)'" onmouseout="this.style.background='rgba(167, 139, 250, 0.08)'">
                    <i class="bi bi-file-earmark-zip-fill" style="font-size: 38px; color: #a78bfa;"></i>
                    <span style="font-size: 11.5px; font-weight: 600; color: #ddd;">AVALON.rar</span>
                  </div>
                ` : `
                  <div id="expAvalonUnassocRar" style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px; padding: 10px; border-radius: 6px; cursor: pointer; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.03);" onmouseover="this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.background='rgba(255,255,255,0.03)'">
                    <i class="bi bi-file-earmark-zip" style="font-size: 38px; color: #94a3b8;"></i>
                    <span style="font-size: 11.5px; font-weight: 500; color: #bbb;">AVALON.rar</span>
                  </div>
                `
            }

              <!-- Lore Document 1: Newspaper PDF Article -->
              <div class="open-newspaper-pdf" style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px; padding: 10px; border-radius: 6px; cursor: pointer;" onmouseover="this.style.background='rgba(255,255,255,0.06)'" onmouseout="this.style.background='transparent'">
                <i class="bi bi-file-earmark-pdf-fill" style="font-size: 38px; color: #f87171;"></i>
                <span style="font-size: 11.5px; font-weight: 500;">Газета_Инцидент.pdf</span>
              </div>

              <!-- Lore Document 2: Medical Psychological Record PDF -->
              <div class="open-medical-pdf" style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px; padding: 10px; border-radius: 6px; cursor: pointer;" onmouseover="this.style.background='rgba(255,255,255,0.06)'" onmouseout="this.style.background='transparent'">
                <i class="bi bi-file-earmark-medical-fill" style="font-size: 38px; color: #38bdf8;"></i>
                <span style="font-size: 11.5px; font-weight: 500;">Выписка_Больницы.pdf</span>
              </div>

              <!-- Lore Document 3: Glitched Team Photo -->
              <div class="open-team-photo" style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px; padding: 10px; border-radius: 6px; cursor: pointer;" onmouseover="this.style.background='rgba(255,255,255,0.06)'" onmouseout="this.style.background='transparent'">
                <i class="bi bi-file-earmark-image" style="font-size: 38px; color: #fbbf24;"></i>
                <span style="font-size: 11.5px;">Фото_Команды_2023.jpg</span>
              </div>

              <!-- Dev Plan -->
              <div class="open-plan-txt" style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px; padding: 10px; border-radius: 6px; cursor: pointer;" onmouseover="this.style.background='rgba(255,255,255,0.06)'" onmouseout="this.style.background='transparent'">
                <i class="bi bi-file-earmark-text" style="font-size: 38px; color: #60a5fa;"></i>
                <span style="font-size: 11.5px;">План_2024.txt</span>
              </div>

              <!-- Engine Log -->
              <div class="open-engine-log" style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px; padding: 10px; border-radius: 6px; cursor: pointer;" onmouseover="this.style.background='rgba(255,255,255,0.06)'" onmouseout="this.style.background='transparent'">
                <i class="bi bi-file-earmark-code" style="font-size: 38px; color: #a78bfa;"></i>
                <span style="font-size: 11.5px;">engine_notes.log</span>
              </div>
            </div>
          `;

          // Bind Newspaper PDF
          contentView.querySelector('.open-newspaper-pdf')?.addEventListener('dblclick', () => {
            openUniversalFileViewer({
              name: 'Газета_Инцидент.pdf',
              type: 'pdf',
              title: 'МОЛОДОЙ ПРОГРАММИСТ В ОДИНОЧКУ ОБОШЕЛ СИСТЕМУ ЗАЩИТЫ DIGITAL DREAMS',
              date: '14.07.2024',
              content: `
                <p><strong>СТОЛИЦА.</strong> В ночь на 14 июля столичный отдел кибербезопасности зафиксировал беспрецедентный инцидент: серверная инфраструктура корпорации Digital Dreams оказалась парализована в результате глубокого низкоуровневого перехвата.</p>
                <p>Согласно закрытым материалам расследования, всю операцию осуществил 22-летний ведущий разработчик проекта AVALON: <strong>[ИМЯ СТЁРТО / ██████████]</strong>.</p>
                <p>Известно, что юноша родился в 2002 году в семье инженеров-исследователей искусственного интеллекта. Родители трагически погибли при невыясненных обстоятельствах в 2018 году. Оставшись один, он с отличием окончил физико-математический лицей и был приглашен в закрытый отдел Digital Dreams.</p>
                <p>Однако, как утверждают анонимные источники, когда руководство попыталось перепрофилировать проект AVALON в кибероружие скрытого слежения, парень отказался передавать исходный код и заперся в своей квартире, пытаясь дистанционно стереть ядро вируса.</p>
                <p>В момент прибытия спецгруппы вся цифровая карточка и государственные реестры о личности парня были полностью стёрты неизвестным удалённым скриптом. Его лицо на видеозаписях покрыто артефактами помех. Кто он на самом деле? Ответа до сих пор нет.</p>
              `
            });
          });

          // Bind Medical PDF
          contentView.querySelector('.open-medical-pdf')?.addEventListener('dblclick', () => {
            openUniversalFileViewer({
              name: 'Выписка_Больницы.pdf',
              type: 'pdf',
              title: 'ЗАКЛЮЧЕНИЕ ПСИХОНЕВРОЛОГИЧЕСКОГО ОТДЕЛЕНИЯ №4',
              date: '28.09.2024',
              content: `
                <p><strong>ПАЦИЕНТ:</strong> [ЛИЧНОСТЬ ЗАСЕКРЕЧЕНА / НОМЕР ПАЛАТЫ 12]</p>
                <p><strong>ВОЗРАСТ:</strong> 22 года. <strong>ПРИЧИНА ПОСТУПЛЕНИЯ:</strong> Коматозное состояние с судорожным синдромом после продолжительного взаимодействия с терминалом.</p>
                <p><strong>РЕЗУЛЬТАТЫ ОБСЛЕДОВАНИЯ:</strong> Тотальная ретроградная амнезия. Пациент полностью забыл собственное имя, место рождения и события последних пяти лет. При этом в коре головного мозга сохраняется гипертрофированная активность участков, отвечающих за алгоритмическое мышление.</p>
                <p><strong>ЗАМЕТКА ВРАЧА:</strong> <em>"Пациент во сне шепчет о 'втором разработчике' и повторяет, что цифровые сны нельзя выпускать наружу. Родственники так и не объявились. В базе Минздрава его СНИЛС и паспорт отсутствуют — словно человека никогда не существовало."</em></p>
              `
            });
          });

          // Bind Photo
          contentView.querySelector('.open-team-photo')?.addEventListener('dblclick', () => {
            openUniversalFileViewer({
              name: 'Фото_Команды_2023.jpg',
              type: 'image',
              title: 'Команда разработчиков Digital Dreams (Лицо главного героя размыто и стёрто)',
              date: 'Ноябрь 2023'
            });
          });

          // Bind Plan & Engine
          contentView.querySelector('.open-plan-txt')?.addEventListener('dblclick', () => {
            openUniversalFileViewer({
              name: 'План_2024.txt',
              type: 'text',
              title: 'План_2024.txt',
              content: 'ПЛАН РАЗРАБОТКИ (2024):\n1. Интеграция пост-процессинга шейдеров в ядро.\n2. Оптимизация многопоточного рендера.\n3. Финализация сборки проекта AVALON.\n4. Проверить архив перед архивацией.\n\nЗаметка для себя: Если они попытаются забрать проект — стереть все бэкапы.'
            });
          });

          contentView.querySelector('.open-engine-log')?.addEventListener('dblclick', () => {
            openUniversalFileViewer({
              name: 'engine_notes.log',
              type: 'text',
              title: 'engine_notes.log',
              content: '[LOG 03:14:22] Avalon Engine initialized.\n[LOG 03:14:25] Loading render shaders: vertex.glsl, fragment.glsl\n[LOG 03:14:28] Direct3D 11 device created successfully.\n[LOG 03:14:30] Asset packages loaded: 24 items.\n[LOG 03:14:31] WARNING: Suspicious entry point detected in avalon_core.dll!\n[LOG 03:14:32] Security breach bypassed.'
            });
          });

          // Folder double-click
          const folder = contentView.querySelector('#expAvalonExtractedFolder') as HTMLElement;
          if (folder) {
            folder.addEventListener('dblclick', (e) => {
              e.stopPropagation();
              import('./avalonCutscene').then(module => module.startAvalonCutscene(e.clientX, e.clientY));
            });
          }

          const rarWinrar = contentView.querySelector('#expAvalonArchiveWinrar') as HTMLElement;
          if (rarWinrar) {
            rarWinrar.addEventListener('contextmenu', (e) => {
              e.preventDefault();
              e.stopPropagation();
              q.triggerArchiveContextMenu(e.clientX, e.clientY, () => {
                renderPath('documents');
              });
            });
            rarWinrar.addEventListener('dblclick', (e) => {
              e.stopPropagation();
              q.showExtractProgressModal(() => {
                renderPath('documents');
              });
            });
          }

          const rarUnassoc = contentView.querySelector('#expAvalonUnassocRar') as HTMLElement;
          if (rarUnassoc) {
            rarUnassoc.addEventListener('dblclick', (e) => {
              e.stopPropagation();
              q.hideGuidePrompt();
              q.triggerUnknownArchiveAlert(e.clientX, e.clientY);
            });
          }
        });
      } else {
        // Empty folder placeholder
        if (breadcrumbs) breadcrumbs.innerText = `${lang === 'RU' ? 'Этот компьютер' : 'This PC'} > ${path}`;
        contentView.innerHTML = `
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #666;">
            <i class="bi bi-folder" style="font-size: 48px; margin-bottom: 12px; opacity: 0.5;"></i>
            <div style="font-size: 14px;">${lang === 'RU' ? 'Папка пуста' : 'This folder is empty'}</div>
          </div>
        `;
      }

      // Bind clicks on subfolder cards / icons
      contentView.querySelectorAll('[data-goto]').forEach(item => {
        const goto = (item as HTMLElement).dataset.goto || 'root';
        item.addEventListener('click', () => {
          renderPath(goto);
        });
      });
    };

    // Sidebar navigation
    sideThisPc?.addEventListener('click', () => renderPath('root'));
    sideDocs?.addEventListener('click', () => renderPath('documents'));
    sideDownloads?.addEventListener('click', () => renderPath('downloads'));
    sidePictures?.addEventListener('click', () => renderPath('pictures'));
    sideDriveC?.addEventListener('click', () => renderPath('c_drive'));

    // Back & Up buttons
    backBtn?.addEventListener('click', () => {
      if (historyStack.length > 1) {
        historyStack.pop();
        const prev = historyStack[historyStack.length - 1];
        renderPath(prev, false);
      }
    });

    upBtn?.addEventListener('click', () => {
      if (currentPath === 'documents' || currentPath === 'downloads' || currentPath === 'pictures' || currentPath === 'c_drive' || currentPath === 'f_drive') {
        renderPath('root');
      } else if (currentPath === 'windows' || currentPath === 'progfiles' || currentPath === 'users') {
        renderPath('c_drive');
      } else if (currentPath === 'user_profile') {
        renderPath('users');
      }
    });

    // Initial render
    renderPath('root');
  };

  const getProjectsHtml = () => `
    <div style="padding: 24px; display: flex; gap: 24px; flex-wrap: wrap;">
      <div class="archive-item" style="display:flex; flex-direction:column; align-items:center; cursor:pointer; width: 100px; padding: 10px; border-radius: 4px; transition: background 0.2s;" onmouseenter="this.style.background='rgba(255,255,255,0.1)'" onmouseleave="this.style.background='transparent'">
        <i class="bi bi-file-earmark-zip-fill" style="font-size: 40px; color: #eab308; margin-bottom: 8px;"></i>
        <span style="font-size: 0.8rem; text-align: center;">Project_Core.zip</span>
      </div>
      <div class="archive-item" style="display:flex; flex-direction:column; align-items:center; cursor:pointer; width: 100px; padding: 10px; border-radius: 4px; transition: background 0.2s;" onmouseenter="this.style.background='rgba(255,255,255,0.1)'" onmouseleave="this.style.background='transparent'">
        <i class="bi bi-file-earmark-zip-fill" style="font-size: 40px; color: #eab308; margin-bottom: 8px;"></i>
        <span style="font-size: 0.8rem; text-align: center;">Backup_2024.rar</span>
      </div>
    </div>
  `;

  const getProjectsLogic = () => (body: HTMLElement) => {
    body.querySelectorAll('.archive-item').forEach(el => {
      el.addEventListener('dblclick', () => {
        showWindowsError(lang === 'RU' ? 'Ошибка приложения' : 'Application Error', lang === 'RU' ? 'Установите WinRAR для открытия архивов!' : 'Please install WinRAR to open archives!');
      });
    });
  };

  // Bind click & double-click events for all desktop icons
  document.querySelectorAll('.desktop-icon').forEach(el => {
    const id = (el as HTMLElement).dataset.id || '';
    let lastClickTime = 0;

    const handleOpen = (mouseEvent: MouseEvent) => {
      const titleEl = el.querySelector('span');
      const title = titleEl ? (titleEl.textContent || id) : id;
      const iconEl = el.querySelector('i');
      const iconHtml = iconEl ? iconEl.outerHTML : '<i class="bi bi-folder-fill" style="font-size: 44px; color: #fbbf24; margin-bottom: 4px;"></i>';

      if (id === 'avalon_folder') {
        import('./avalonCutscene').then(module => module.startAvalonCutscene(mouseEvent.clientX, mouseEvent.clientY));
        return;
      }

      if (id === 'doc_newspaper') {
        openUniversalFileViewer({
          name: 'Газета_2024.pdf',
          type: 'pdf',
          title: 'МОЛОДОЙ ПРОГРАММИСТ В ОДИНОЧКУ ОБОШЕЛ СИСТЕМУ ЗАЩИТЫ DIGITAL DREAMS',
          date: '14.07.2024',
          content: `
            <p><strong>I. НОЧНОЙ ВЗЛОМ ВЕКА: ПАРАЛИЧ МАГИСТРАЛИ</strong><br/>
            В ночь на 14 июля 2024 года столичный департамент по борьбе с киберпреступностью зафиксировал беспрецедентный инцидент: главная серверная магистраль корпорации Digital Dreams оказалась парализована за считанные секунды. В 03:14 по местному времени автоматические шлюзы безопасности были перехвачены с одного локального терминала, а зашифрованное ядро экспериментальной платформы AVALON — скачано и бесследно удалено с корпоративных накопителей. Сработала экстренная тревога пятого уровня, однако служба безопасности не смогла перехватить трафик.</p>

            <p><strong>II. ТАЙНА РОЖДЕНИЯ И СЕМЕЙНАЯ ТРАГЕДИЯ (2002–2018)</strong><br/>
            Согласно закрытым материалам следствия, за атакой стоял 22-летний ведущий архитектор платформы: <strong>[ИМЯ ЗАСЕКРЕЧЕНО / ██████████]</strong>.<br/>
            Он родился в июне 2002 года в семье ведущих советских и российских инженеров-кибернетиков. Отец и мать стояли у истоков первых закрытых нейросетей Института Проблем Передачи Информации. В октябре 2018 года их автомобиль на высокой скорости вылетел с моста в реку при загадочных обстоятельствах — дело закрыли за отсутствием улик спустя всего две недели. Оставшись один в 16 лет, юноша экстерном окончил физико-математический лицей и отказался от престижных зарубежных грантов, чтобы продолжить семейные исследования.</p>

            <p><strong>III. ПРОЕКТ AVALON И ДВОЙНОЕ ДНО КОРПОРАЦИИ</strong><br/>
            В 2021 году руководство Digital Dreams предложило ему карт-бланш: создать революционную виртуальную среду, способную воспроизводить человеческие сны и мысли в реальном времени. Однако за фасадом "мира будущего" скрывалась закрытая военная подсистема тотального цифрового контроля — вредоносный штамм <em>Trojan:Win32/Wacatac.B!ml</em>, способный внедряться в память и перехватывать сознание подключённых пользователей. Узнав об этом, разработчик отказался отдавать мастер-ключи и заперся в своей квартире, пытаясь дистанционно очистить проект от заражения.</p>

            <p><strong>IV. СТИРАНИЕ ЧЕЛОВЕКА ИЗ ГОСУДАРСТВЕННЫХ БАЗ</strong><br/>
            Когда спецгруппа взломала бронированную дверь его квартиры на рассвете, парень находился в глубокой коме перед мерцающим монитором. В ту же секунду сработал неизвестный удалённый алгоритм зачистки: записи в ЗАГСе, паспортные данные, медицинские полисы, школьные аттестаты и даже водительские права парня были стёрты во всех центральных серверах страны. Человек превратился в цифрового призрака без имени и прошлого.</p>

            <p><strong>V. ИНТЕРВЬЮ С СОСЕДЯМИ И КОЛЛЕГАМИ</strong><br/>
            «Он почти не выходил из дома последние полгода, только пил кофе и сутками писал код,» — рассказывает сосед по лестничной площадке. — «А потом, когда приехала полиция, все соседи вдруг поняли, что не могут вспомнить его лица. Словно смотришь на фотографию, а там расплывчатое пятно». Коллеги из Digital Dreams на условиях анонимности подтвердили: «Его имя стёрли из всех гитов и коммитов за 5 минут до приезда следственной группы».</p>

            <p><strong>VI. ПОСЛЕДНЕЕ СООБЩЕНИЕ: КТО ТАКОЙ ДРУГ?</strong><br/>
            В локальном логе компьютера обнаружена последняя незавершённая отправка сообщения в зашифрованном мессенджере: <em>«Я разделил архив. Если я усну — найди контрольную сумму. Спаси проект...»</em>. Личность получателя остаётся засекреченной следствием.</p>
          `
        });
        return;
      }

      if (id === 'doc_personal_notes') {
        openUniversalFileViewer({
          name: 'Заметки.txt',
          type: 'text',
          title: 'Личный Дневник Разработчика (2023–2024)',
          content: `========================================================================================
[ЛИЧНЫЙ ДНЕВНИК И РАБОЧИЙ ЖУРНАЛ АРХИТЕКТОРА AVALON — ШИФРОВАНИЕ AES-256]
========================================================================================

[14.11.2023 — ПЕРВЫЙ УСПЕШНЫЙ РЕНДЕР]
Сегодня мы запустили первый стабильный рендер процедурного города в AVALON. Это потрясающе. Мне кажется, я наконец-то завершаю то, о чем мечтали мама и папа в своих старых тетрадях 1999 года. Мир, где цифровые сны становятся осязаемыми и живыми. Мой друг помогает с сетевой синхронизацией сокетов, я доверяю ему как себе.

[08.12.2023 — СТРАННЫЕ ДИРЕКТИВЫ]
Совет директоров Digital Dreams затребовал исходники низкоуровневого загрузчика памяти. На совещании представитель службы безопасности спросил: "Сможет ли ядро считывать биометрические паттерны пользователя без его явного согласия?". Я ответил, что это нарушает все этические протоколы. Они промолчали.

[03.02.2024 — ТРОЯН В СИСТЕМЕ]
Начальство в ультимативной форме потребовало внедрить в билд закрытую динамическую библиотеку 'avalon_core.dll'. Сказали, что это "модуль телеметрии и защиты авторских прав". Я провел дизассемблирование через IDA Pro. Это не телеметрия. Это троян нулевого дня (Trojan:Win32/Wacatac.B!ml), способный перехватывать системные прерывания и внедряться в память подключенных устройств. Они хотят контролировать каждого человека, кто запустит игру.

[19.04.2024 — ШАНТАЖ И УГРОЗЫ]
Я пытался поговорить с генеральным директором наедине. Он выключил телефон и намекнул, что авария моих родителей на Северном мосту в 2018 году не была случайностью: "Твой отец тоже был слишком принципиальным". Они шантажируют меня. Но я не отдам им ядро в таком виде.

[28.05.2024 — ПЛАН СПАСЕНИЯ]
Я начал скрытное разделение кодовой базы. Чистый движок я упаковал в зашифрованный контейнер AVALON.rar, защищенный модифицированной контрольной суммой CRC-32. Если кто-то попытается встроить в него вирус, распаковка зависнет на 80% с ошибкой целостности.

[28.06.2024 — КЛЮЧИ ДРУГУ]
Я создал резервную копию и зашифровал сектор D:\\. Единственную копию ключа дешифровки я передал другу. Он обещал сохранить исходники и прикрыть меня, если корпорация перейдет к силовому захвату.

[12.07.2024 — ОКРУЖЕНИЕ]
За моим домом установлена слежка. Черный тонированный седан без номеров стоит под окнами третьи сутки. Голова раскалывается, не сплю более 90 часов. Друг перестал отвечать на звонки в WhatisUp и удалил профиль. Неужели он продал ключ корпорации?.. Нет, я отказываюсь в это верить.

[13.07.2024 • 23:55 — ПОСЛЕДНИЙ РУБЕЖ]
Они взламывают входную дверь на лестничной клетке. Слышу гидравлический инструмент. Я запустил скрипт аварийной зачистки баз данных. Если они сотрут мою личность, этот компьютер останется единственным доказательством правды. Кто бы ты ни был — не дай им запустить троян. Удалить его можно только через ядро.`
        });
        return;
      }

      if (id === 'doc_audio_call') {
        openUniversalFileViewer({
          name: 'Запись_04.wav',
          type: 'audio',
          title: 'Перехваченный разговор: Digital Dreams Security & Informant',
          date: '13.07.2024 • 23:42',
          audioSrc: '/assets/sounds/sfx/cutscene/insanity_buildup.wav'
        });
        return;
      }

      if (id === 'this_pc') {
        openAppWindow(id, title, iconHtml, getThisPcHtml(), getThisPcLogic());
      } else if (id === 'personal_folder') {
        import('./winrarQuest').then(q => {
          q.showHeroThought(lang === 'RU' ? 'Там только старые личные архивы. Нужно проверить «Этот компьютер» и проект AVALON.' : 'Only old personal archives there. Check This PC and AVALON project.');
        });
      } else if (id === 'projects') {
        openAppWindow(id, title, iconHtml, getProjectsHtml(), getProjectsLogic());
      } else if (id === 'recycle_bin') {
        import('./winrarQuest').then(q => {
          q.showHeroThought(lang === 'RU' ? 'В корзине ничего полезного нет. Нужно сосредоточиться на архиве AVALON.' : 'Nothing useful in the Recycle Bin. Focus on the AVALON archive.');
        });
      } else if (id === 'browser') {
        import('./winrarQuest').then(q => {
          const state = q.getQuestState();
          if (!state.rarAttempted) {
            q.showHeroThought(lang === 'RU' ? 'Зачем мне сейчас браузер? Сначала нужно найти архив проекта в проводнике.' : 'Why open the browser now? Find project archive in Explorer first.');
            return;
          }
          q.hideGuidePrompt();
          q.openQuestBrowser();
        });
      } else {
        import('./winrarQuest').then(q => {
          q.showHeroThought(lang === 'RU' ? 'Сейчас не время отвлекаться на посторонние папки.' : 'No time to get distracted by unrelated folders.');
        });
      }
    };

    el.addEventListener('click', (e: Event) => {
      e.stopPropagation();
      const now = Date.now();
      const me = e as MouseEvent;

      // Select visual feedback
      document.querySelectorAll('.desktop-icon').forEach(icon => {
        (icon as HTMLElement).style.background = 'transparent';
        (icon as HTMLElement).style.borderColor = 'transparent';
      });
      (el as HTMLElement).style.background = 'rgba(0, 120, 215, 0.25)';
      (el as HTMLElement).style.borderColor = 'rgba(0, 120, 215, 0.5)';

      // Handle double click or fast sequential tap
      if (now - lastClickTime < 400) {
        handleOpen(me);
      }
      lastClickTime = now;
    });

    el.addEventListener('dblclick', (e: Event) => {
      e.stopPropagation();
      handleOpen(e as MouseEvent);
    });
  });

  // Taskbar and Start Menu actions


  const getSettingsHtml = () => `
    <div style="display: flex; flex: 1; height: 100%;">
      <!-- Sidebar -->
      <div style="width: 260px; border-right: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.2); padding: 24px 16px; display: flex; flex-direction: column; gap: 8px;">
        <div id="sysTab" style="padding: 10px 16px; border-radius: 6px; background: rgba(255,255,255,0.1); cursor: pointer; display: flex; align-items: center; gap: 12px; font-weight: 500;">
          <i class="bi bi-laptop" style="font-size: 16px; color: #60a5fa;"></i> System Settings
        </div>
        <div id="wifiTab" style="padding: 10px 16px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 12px; opacity: 0.7; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='transparent'">
          <i class="bi bi-wifi" style="font-size: 16px;"></i> Wifi Settings
        </div>
        <div id="defenderTab" style="padding: 10px 16px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 12px; opacity: 0.7; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='transparent'">
          <i class="bi bi-shield-lock" style="font-size: 16px;"></i> ${lang === 'RU' ? 'Безопасность Windows' : 'Windows Security'}
        </div>
      </div>


      <!-- Main Content -->
      <div id="settingsContent" style="flex: 1; display: flex; flex-direction: column; background: #202020; color: #fff; padding: 32px 40px; overflow-y: auto;">
        
        <!-- Breadcrumb -->
        <div style="display: flex; align-items: center; gap: 8px; font-size: 1rem; margin-bottom: 24px; color: #e0e0e0;">
          <span>System</span>
          <i class="bi bi-chevron-right" style="font-size: 12px; opacity: 0.7;"></i>
          <span style="font-weight: 600; font-size: 1.5rem; color: #fff;">About</span>
        </div>

        <!-- Top Cards -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 32px;">
          <!-- Card 1 -->
          <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 16px; display: flex; flex-direction: column;">
            <div style="display: flex; align-items: center; gap: 8px; color: #a1a1aa; font-size: 0.85rem; margin-bottom: 12px;">
              <i class="bi bi-device-hdd"></i> Storage
            </div>
            <div style="font-size: 1.4rem; font-weight: 600; margin-bottom: auto;">512 GB</div>
            <div style="font-size: 0.75rem; color: #a1a1aa; margin-top: 16px;">Используется 489 GB из 512 GB</div>
          </div>
          <!-- Card 2 -->
          <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 16px; display: flex; flex-direction: column;">
            <div style="display: flex; align-items: center; gap: 8px; color: #a1a1aa; font-size: 0.85rem; margin-bottom: 12px;">
              <i class="bi bi-gpu-card"></i> Graphics Card
            </div>
            <div style="font-size: 1.4rem; font-weight: 600; margin-bottom: auto;">4 GB</div>
            <div style="font-size: 0.75rem; color: #a1a1aa; margin-top: 16px;">NVIDIA GeForce RTX 3050</div>
          </div>
          <!-- Card 3 -->
          <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 16px; display: flex; flex-direction: column;">
            <div style="display: flex; align-items: center; gap: 8px; color: #a1a1aa; font-size: 0.85rem; margin-bottom: 12px;">
              <i class="bi bi-memory"></i> Installed RAM
            </div>
            <div style="font-size: 1.4rem; font-weight: 600; margin-bottom: auto;">16,0 GB</div>
            <div style="font-size: 0.75rem; color: #a1a1aa; margin-top: 16px;">Скорость: 3200 MHz</div>
          </div>
          <!-- Card 4 -->
          <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 16px; display: flex; flex-direction: column;">
            <div style="display: flex; align-items: center; gap: 8px; color: #a1a1aa; font-size: 0.85rem; margin-bottom: 12px;">
              <i class="bi bi-cpu"></i> Processor
            </div>
            <div style="font-size: 1.1rem; font-weight: 600; line-height: 1.3; margin-bottom: auto;">AMD Ryzen 7 5800H</div>
            <div style="font-size: 0.75rem; color: #a1a1aa; margin-top: 16px;">3.20 GHz</div>
          </div>
        </div>

        <!-- Rename PC section -->
        <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <div>
            <div style="font-size: 1.1rem; font-weight: 500;">ASUS-TUF-GAMING-A15</div>
            <div style="font-size: 0.85rem; color: #a1a1aa; margin-top: 2px;">FA506IC</div>
          </div>
          <button style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.05); color: #fff; padding: 8px 16px; border-radius: 4px; font-family: inherit; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">Rename this PC</button>
        </div>

        <!-- Device Specs -->
        <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
          <div style="padding: 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05);">
            <div style="display: flex; align-items: center; gap: 12px; font-weight: 500;">
              <i class="bi bi-info-circle"></i> Device specifications
            </div>
            <button id="copySpecsBtn" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.05); color: #fff; padding: 6px 16px; border-radius: 4px; font-family: inherit; font-size: 0.85rem; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'" onclick="navigator.clipboard.writeText('Device name: ASUS-TUF-GAMING-A15\\nProcessor: AMD Ryzen 7 5800H with Radeon Graphics 3.20 GHz\\nInstalled RAM: 16,0 GB (доступно: 15,3 GB)\\nDevice ID: 9F8D7E6C-5B4A-3C2D-1E0F-A9B8C7D6E5F4\\nProduct ID: 00331-10000-00001-AA978\\nSystem type: 64-разрядная операционная система, процессор x64'); const btn=this; btn.innerText='Copied!'; setTimeout(()=>btn.innerText='Copy', 2000)">Copy</button>
          </div>
          
          <div style="padding: 20px; padding-bottom: 28px;">
            <div style="display: grid; grid-template-columns: 160px 1fr; gap: 12px; font-size: 0.85rem; margin-bottom: 8px;">
              <div style="color: #a1a1aa;">Device name</div>
              <div>ASUS-TUF-GAMING-A15</div>
            </div>
            <div style="display: grid; grid-template-columns: 160px 1fr; gap: 12px; font-size: 0.85rem; margin-bottom: 8px;">
              <div style="color: #a1a1aa;">Processor</div>
              <div>AMD Ryzen 7 5800H with Radeon Graphics   3.20 GHz</div>
            </div>
            <div style="display: grid; grid-template-columns: 160px 1fr; gap: 12px; font-size: 0.85rem; margin-bottom: 8px;">
              <div style="color: #a1a1aa;">Installed RAM</div>
              <div>16,0 GB (доступно: 15,3 GB)</div>
            </div>
            <div style="display: grid; grid-template-columns: 160px 1fr; gap: 12px; font-size: 0.85rem; margin-bottom: 8px;">
              <div style="color: #a1a1aa;">Device ID</div>
              <div>9F8D7E6C-5B4A-3C2D-1E0F-A9B8C7D6E5F4</div>
            </div>
            <div style="display: grid; grid-template-columns: 160px 1fr; gap: 12px; font-size: 0.85rem; margin-bottom: 8px;">
              <div style="color: #a1a1aa;">Product ID</div>
              <div>00331-10000-00001-AA978</div>
            </div>
            <div style="display: grid; grid-template-columns: 160px 1fr; gap: 12px; font-size: 0.85rem; margin-bottom: 8px;">
              <div style="color: #a1a1aa;">System type</div>
              <div>64-разрядная операционная система, процессор x64</div>
            </div>
            <div style="display: grid; grid-template-columns: 160px 1fr; gap: 12px; font-size: 0.85rem; margin-bottom: 24px;">
              <div style="color: #a1a1aa;">Pen and touch</div>
              <div>No pen or touch input is available for this display</div>
            </div>

            <div style="display: flex; gap: 16px; font-size: 0.85rem; align-items: center; flex-wrap: wrap;">
              <div style="font-weight: 600;">Related links</div>
              <a href="#" style="color: #60a5fa; text-decoration: none;">Domain or workgroup</a>
              <a href="#" style="color: #60a5fa; text-decoration: none;">System protection</a>
              <div style="display: flex; align-items: center; gap: 6px;">
                <a href="#" style="color: #60a5fa; text-decoration: none;">Advanced system settings</a>
                <span style="color: #ef4444; font-size: 0.75rem; font-style: italic; opacity: 0.8;">(*параметры ненастоящие)</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `;

  const openExplorer = () => {
    startMenu?.classList.remove('open');
    openAppWindow('this_pc', lang === 'RU' ? 'Этот Компьютер' : 'This PC', '<i class="bi bi-display" style="font-size: 44px; color: #38bdf8; margin-bottom: 4px;"></i>', getThisPcHtml(), getThisPcLogic());
  };

  const openSettings = () => {
    startMenu?.classList.remove('open');
    openAppWindow('settings', lang === 'RU' ? 'Параметры' : 'Settings', '<i class="bi bi-gear-fill" style="font-size: 44px; color: #94a3b8; margin-bottom: 4px;"></i>', getSettingsHtml(), (body) => {
      const sysTab = body.querySelector('#sysTab') as HTMLElement;
      const wifiTab = body.querySelector('#wifiTab') as HTMLElement;
      const defenderTab = body.querySelector('#defenderTab') as HTMLElement;
      const content = body.querySelector('#settingsContent') as HTMLElement;

      // Store initial sys content
      const sysContentHtml = content.innerHTML;

      const wifiContentHtml = `
        <div style="display: flex; align-items: center; gap: 8px; font-size: 1rem; margin-bottom: 24px; color: #e0e0e0;">
          <span>Network & internet</span>
          <i class="bi bi-chevron-right" style="font-size: 12px; opacity: 0.7;"></i>
          <span style="font-weight: 600; font-size: 1.5rem; color: #fff;">Wi-Fi</span>
        </div>
        <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <div style="display: flex; align-items: center; gap: 16px;">
            <i class="bi bi-wifi" style="font-size: 24px; color: #60a5fa;"></i>
            <div>
              <div style="font-size: 1.1rem; font-weight: 500;">Wi-Fi</div>
              <div style="font-size: 0.85rem; color: #a1a1aa; margin-top: 2px;">On</div>
            </div>
          </div>
          <div style="width: 44px; height: 24px; background: #60a5fa; border-radius: 12px; position: relative; cursor: pointer;">
            <div style="width: 18px; height: 18px; background: #fff; border-radius: 50%; position: absolute; right: 3px; top: 3px;"></div>
          </div>
        </div>
        
        <div style="font-size: 1.1rem; font-weight: 600; margin-bottom: 16px;">Available networks</div>
        
        <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
          <div style="padding: 16px 20px; display: flex; align-items: center; gap: 16px; border-bottom: 1px solid rgba(255,255,255,0.05); background: rgba(255,255,255,0.02);">
            <i class="bi bi-wifi" style="font-size: 20px;"></i>
            <div style="flex: 1;">
              <div style="font-weight: 500;">HomeNetwork_5G</div>
              <div style="font-size: 0.85rem; color: #a1a1aa;">Connected, secured</div>
            </div>
            <i class="bi bi-info-circle" style="font-size: 18px; color: #a1a1aa; cursor: pointer;"></i>
          </div>
          <div style="padding: 16px 20px; display: flex; align-items: center; gap: 16px; border-bottom: 1px solid rgba(255,255,255,0.05);">
            <i class="bi bi-wifi-2" style="font-size: 20px;"></i>
            <div style="flex: 1;">
              <div style="font-weight: 500;">Guest_WIFI</div>
              <div style="font-size: 0.85rem; color: #a1a1aa;">Secured</div>
            </div>
          </div>
          <div style="padding: 16px 20px; display: flex; align-items: center; gap: 16px;">
            <i class="bi bi-wifi-1" style="font-size: 20px;"></i>
            <div style="flex: 1;">
              <div style="font-weight: 500;">Neighbor_Network</div>
              <div style="font-size: 0.85rem; color: #a1a1aa;">Secured</div>
            </div>
          </div>
        </div>
      `;

      const defenderContentHtml = `
        <div style="display: flex; flex: 1; height: 100%; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; background: #1a1a1a;">
          <!-- Sidebar -->
          <div style="width: 260px; background: #202020; display: flex; flex-direction: column; padding: 16px 0; border-right: 1px solid rgba(255,255,255,0.05);">
            <div id="defenderHomeBtn" style="padding: 10px 16px; display: flex; align-items: center; gap: 12px; cursor: pointer; font-size: 14px; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='transparent'">
              <i class="bi bi-house"></i> ${lang === 'RU' ? 'Главная' : 'Home'}
            </div>
            <div style="padding: 10px 16px; display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.05); border-left: 3px solid #60a5fa; font-size: 14px;">
              <i class="bi bi-shield-check" style="color: #60a5fa;"></i> ${lang === 'RU' ? 'Защита от вирусов и угроз' : 'Virus & threat protection'}
            </div>
          </div>
          
          <!-- Main Content -->
          <div style="flex: 1; padding: 32px 40px; overflow-y: auto;">
            <h2 style="font-size: 24px; font-weight: 500; margin: 0 0 8px 0; display: flex; align-items: center; gap: 12px;">
              <i class="bi bi-shield-check"></i> ${lang === 'RU' ? 'Журнал защиты' : 'Protection history'}
            </h2>
            <p style="color: #a1a1aa; font-size: 14px; margin-bottom: 24px;">${lang === 'RU' ? 'Просмотрите последние действия и рекомендации функции "Безопасность Windows" по защите.' : 'View the latest actions and recommendations from Windows Security.'}</p>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 14px;">
              <span>${lang === 'RU' ? 'Все недавние элементы' : 'All recent items'}</span>
              <button style="background: #333; border: 1px solid #444; color: #fff; padding: 4px 12px; border-radius: 4px; cursor: pointer;">${lang === 'RU' ? 'Фильтры ⌵' : 'Filters ⌵'}</button>
            </div>

            <div style="border-top: 1px solid #333; padding: 16px 0; display: flex; flex-direction: column;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="display: flex; gap: 16px;">
                  <i class="bi bi-check-circle-fill" style="color: #22c55e; font-size: 20px;"></i>
                  <div>
                    <div style="font-size: 14px; font-weight: 500;">${lang === 'RU' ? 'Текущих угроз нет' : 'No current threats'}</div>
                    <div style="font-size: 12px; color: #a1a1aa;">${lang === 'RU' ? 'Последнее сканирование: сегодня' : 'Last scan: today'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      if (sysTab && wifiTab && defenderTab && content) {
        sysTab.addEventListener('click', () => {
          sysTab.style.background = 'rgba(255,255,255,0.1)';
          sysTab.style.opacity = '1';
          wifiTab.style.background = 'transparent';
          wifiTab.style.opacity = '0.7';
          sysTab.querySelector('i')!.style.color = '#60a5fa';
          wifiTab.querySelector('i')!.style.color = 'inherit';

          if (defenderTab) {
            defenderTab.style.background = 'transparent';
            defenderTab.style.opacity = '0.7';
            defenderTab.querySelector('i')!.style.color = 'inherit';
          }

          content.innerHTML = sysContentHtml;
        });

        wifiTab.addEventListener('click', () => {
          wifiTab.style.background = 'rgba(255,255,255,0.1)';
          wifiTab.style.opacity = '1';
          sysTab.style.background = 'transparent';
          sysTab.style.opacity = '0.7';
          wifiTab.querySelector('i')!.style.color = '#60a5fa';
          sysTab.querySelector('i')!.style.color = 'inherit';

          if (defenderTab) {
            defenderTab.style.background = 'transparent';
            defenderTab.style.opacity = '0.7';
            defenderTab.querySelector('i')!.style.color = 'inherit';
          }

          content.innerHTML = wifiContentHtml;
        });

        if (defenderTab) {
          defenderTab.addEventListener('click', () => {
            defenderTab.style.background = 'rgba(255,255,255,0.1)';
            defenderTab.style.opacity = '1';
            sysTab.style.background = 'transparent';
            sysTab.style.opacity = '0.7';
            wifiTab.style.background = 'transparent';
            wifiTab.style.opacity = '0.7';
            defenderTab.querySelector('i')!.style.color = '#ef4444';
            sysTab.querySelector('i')!.style.color = 'inherit';
            wifiTab.querySelector('i')!.style.color = 'inherit';

            content.innerHTML = defenderContentHtml;
            const defenderHomeBtn = content.querySelector('#defenderHomeBtn');
            if (defenderHomeBtn) {
              defenderHomeBtn.addEventListener('click', () => {
                sysTab.click();
              });
            }
          });
        }
      }
    });
  };

  const openBrowser = () => {
    startMenu?.classList.remove('open');
    const browserHtml = `
      <div style="display: flex; flex-direction: column; height: 100%; background: #202124; color: #fff; font-family: 'Segoe UI Variable Text', 'Segoe UI', system-ui, sans-serif;">
        <!-- Top Tab Bar -->
        <div style="height: 40px; background: #1f1f23; display: flex; align-items: flex-end; padding: 0 10px; border-bottom: 1px solid rgba(255,255,255,0.08);">
          <div style="background: #2b2b30; padding: 8px 18px; border-radius: 8px 8px 0 0; font-size: 12.5px; display: flex; align-items: center; gap: 8px; color: #fff; border-top: 2px solid #38bdf8;">
            <i class="bi bi-globe" style="color: #38bdf8; font-size: 13px;"></i>
            <span>${lang === 'RU' ? 'Новая вкладка' : 'New Tab'}</span>
          </div>
        </div>

        <!-- Address Bar (URL Bar) -->
        <div style="height: 44px; background: #2b2b30; display: flex; align-items: center; padding: 0 14px; gap: 10px; border-bottom: 1px solid rgba(255,255,255,0.06);">
          <div style="display: flex; gap: 10px; color: #aaa; font-size: 13px;">
            <i class="bi bi-arrow-left" style="cursor: pointer;"></i>
            <i class="bi bi-arrow-right" style="cursor: pointer; opacity: 0.5;"></i>
            <i class="bi bi-arrow-clockwise" style="cursor: pointer;"></i>
          </div>
          <div style="flex: 1; height: 32px; background: #1c1c1f; border-radius: 16px; display: flex; align-items: center; padding: 0 14px; font-size: 13px; color: #888; border: 1px solid rgba(255,255,255,0.1);">
            <i class="bi bi-lock-fill" style="color: #22c55e; font-size: 11px; margin-right: 8px;"></i>
            <input id="browserSearchInput" type="text" placeholder="${lang === 'RU' ? 'Введите поисковый запрос или URL' : 'Search or enter web address'}" style="flex: 1; border: none; outline: none; background: transparent; color: #fff; font-size: 13px;">
            <i class="bi bi-search" id="browserSearchBtn" style="color: #38bdf8; cursor: pointer;"></i>
          </div>
        </div>

        <!-- Main Search Page -->
        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; background: #1a1a1d;">
          <div style="font-size: 3rem; font-weight: 800; letter-spacing: 2px; margin-bottom: 2rem; color: #f4f4f5; font-family: 'Segoe UI', system-ui, sans-serif;">
            <span style="color: #38bdf8;">S</span><span style="color: #f87171;">e</span><span style="color: #fbbf24;">a</span><span style="color: #38bdf8;">r</span><span style="color: #4ade80;">c</span><span style="color: #f87171;">h</span>
          </div>
          <div style="width: 100%; max-width: 580px; position: relative;">
            <div style="width: 100%; height: 48px; background: #28282d; border: 1px solid rgba(255,255,255,0.15); border-radius: 24px; display: flex; align-items: center; padding: 0 18px; gap: 12px; box-shadow: 0 6px 24px rgba(0,0,0,0.5);">
              <i class="bi bi-search" id="browserMiddleSearchBtn" style="color: #aaa; cursor: pointer; font-size: 15px;"></i>
              <input id="browserMiddleSearchInput" type="text" placeholder="${lang === 'RU' ? 'Поиск в интернете' : 'Search the web'}" style="flex: 1; border: none; outline: none; background: transparent; color: #fff; font-size: 14.5px;">
            </div>
          </div>
        </div>
      </div>
    `;

    openAppWindow('browser', lang === 'RU' ? 'Браузер' : 'Browser', '<i class="bi bi-globe2" style="font-size: 44px; color: #3b82f6; margin-bottom: 4px;"></i>', browserHtml, (body) => {
      const searchBtn = body.querySelector('#browserSearchBtn');
      const middleSearchBtn = body.querySelector('#browserMiddleSearchBtn');
      const searchInput = body.querySelector('#browserSearchInput') as HTMLInputElement;

      const performSearch = () => {
        if (!searchInput) return;
        const val = searchInput.value.toLowerCase().trim();
        const middleVal = (document.getElementById('browserMiddleSearchInput') as HTMLInputElement)?.value.toLowerCase().trim() || '';
        const searchStr = val || middleVal;
        if (searchStr === 'drweb' || searchStr === 'dr web' || searchStr === 'antivirus') {
          showWindowsError(lang === 'RU' ? 'Ошибка' : 'Error', lang === 'RU' ? 'Указанный элемент не найден.' : 'The specified element was not found.');

          setTimeout(() => {
            const errorWindows = document.querySelectorAll('.app-window-anim');
            const latestError = errorWindows[errorWindows.length - 1];
            if (latestError && (latestError.innerHTML.includes('Элемент') || latestError.innerHTML.includes('element'))) {
              const closeBtn = latestError.querySelector('.close-btn');
              if (closeBtn) {
                const hoverListener = () => {
                  closeBtn.removeEventListener('mouseenter', hoverListener);
                  showWindowsError(lang === 'RU' ? 'Ошибка' : 'Error', lang === 'RU' ? 'Указанный элемент не найден.' : 'The specified element was not found.');
                };
                closeBtn.addEventListener('mouseenter', hoverListener);
              }
            }
          }, 100);
        }
      };

      searchBtn?.addEventListener('click', performSearch);
      middleSearchBtn?.addEventListener('click', performSearch);
      searchInput?.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter') performSearch();
      });
    });
  };

  (window as any).triggerCutsceneBrowser = openBrowser;

  document.getElementById('startMenuExplorer')?.addEventListener('click', openExplorer);
  document.getElementById('taskbarExplorer')?.addEventListener('click', openExplorer);
  document.getElementById('startMenuSettings')?.addEventListener('click', openSettings);
  document.getElementById('taskbarSettings')?.addEventListener('click', openSettings);
  document.getElementById('taskbarBrowser')?.addEventListener('click', () => {
    import('./winrarQuest').then(q => {
      const state = q.getQuestState();
      if (!state.rarAttempted) {
        q.showHeroThought(lang === 'RU' ? 'Зачем мне сейчас браузер? Сначала нужно проверить файлы проекта в проводнике.' : 'Why open the browser now? Check project files in Explorer first.');
        return;
      }
      q.hideGuidePrompt();
      q.openQuestBrowser();
    });
  });

  // Windows Login: Thought & Mission Banner with heavy "ПАМ" impact sound
  setTimeout(() => {
    import('./winrarQuest').then(q => {
      // 1. Hero thought in subtitle box
      q.showHeroThought(lang === 'RU' 
        ? 'Так... Нужно найти проект, просканировать его и узнать, что с ним произошло.' 
        : 'Alright... Need to find the project, scan it, and figure out everything about it.');

      // 2. Mission Banner appearance with heavy "ПАМ" sound effect (1.2s)
      setTimeout(() => {
        // Heavy "ПАМ" Impact Sound
        try {
          const pamAudio = new Audio('/assets/sounds/sfx/main/mission_impact.wav');
          pamAudio.volume = 0.85;
          pamAudio.play().catch(() => {
            const fallback = new Audio('/assets/sounds/sfx/main/error.wav');
            fallback.volume = 0.8;
            fallback.play().catch(() => {});
          });
        } catch {}

        const questBanner = document.createElement('div');
        questBanner.id = 'avalonQuestBanner';
        questBanner.style.cssText = `
          position: fixed; top: 70px; left: 50%; transform: translateX(-50%) scale(0.8);
          background: rgba(10, 20, 40, 0.96); border: 2px solid #38bdf8;
          box-shadow: 0 0 35px rgba(56, 189, 248, 0.4), inset 0 0 15px rgba(56, 189, 248, 0.2);
          color: #fff; padding: 14px 32px; border-radius: 8px; font-family: 'Segoe UI', sans-serif;
          z-index: 999999; display: flex; align-items: center; gap: 14px;
          opacity: 0; transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); pointer-events: none;
        `;
        questBanner.innerHTML = `
          <i class="bi bi-crosshair" style="font-size: 24px; color: #38bdf8; animation: pulse 1.5s infinite;"></i>
          <div>
            <div style="font-size: 11px; font-weight: 700; color: #38bdf8; letter-spacing: 2px; text-transform: uppercase;">${lang === 'RU' ? 'ТЕКУЩАЯ ЦЕЛЬ' : 'CURRENT OBJECTIVE'}</div>
            <div style="font-size: 16px; font-weight: 800; letter-spacing: 1px; color: #fff;">${lang === 'RU' ? 'НАЙТИ ПРОЕКТ AVALON' : 'FIND PROJECT AVALON'}</div>
          </div>
          <style>@keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.15); } }</style>
        `;
        document.body.appendChild(questBanner);

        requestAnimationFrame(() => {
          questBanner.style.opacity = '1';
          questBanner.style.transform = 'translateX(-50%) scale(1)';
        });

        // Hide banner after 5.5s
        setTimeout(() => {
          questBanner.style.opacity = '0';
          questBanner.style.transform = 'translateX(-50%) scale(0.9)';
          setTimeout(() => questBanner.remove(), 450);
        }, 5500);
      }, 1200);
    });
  }, 1000);
}
