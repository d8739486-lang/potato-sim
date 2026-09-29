// src/winrarQuest.ts
import { getLanguage } from './system';
import { settings } from './menu';

export interface IQuestAudio {
  playClick: () => void;
  playKeyboard: () => void;
  playDownloadFinish: () => void;
  playError: () => void;
}

const questAudio: IQuestAudio = {
  playClick: () => {
    try {
      const a = new Audio('/assets/sounds/sfx/main/btn_click.wav');
      a.volume = (settings.sfxVolume / 100) * (settings.masterVolume / 100);
      a.play().catch(() => {});
    } catch (e) {}
  },
  playKeyboard: () => {
    try {
      const a = new Audio('/assets/sounds/sfx/intro/whatisup/type.wav');
      a.volume = 0.4 * (settings.sfxVolume / 100) * (settings.masterVolume / 100);
      a.play().catch(() => {});
    } catch (e) {}
  },
  playDownloadFinish: () => {
    try {
      const a = new Audio('/assets/sounds/sfx/intro/whatisup/receive_message.wav');
      a.volume = (settings.sfxVolume / 100) * (settings.masterVolume / 100);
      a.play().catch(() => {});
    } catch (e) {}
  },
  playError: () => {
    try {
      const a = new Audio('/assets/sounds/sfx/main/error.wav');
      a.volume = (settings.sfxVolume / 100) * (settings.masterVolume / 100);
      a.play().catch(() => {});
    } catch (e) {}
  }
};

let questState = {
  rarAttempted: false,
  winrarDownloaded: false,
  winrarInstalled: false,
  avalonExtracted: false
};

export function getQuestState() {
  return questState;
}

/**
 * Creates floating guide tooltip over a target coordinate or element
 */
export function showGuidePrompt(text: string, x: number, y: number): HTMLElement {
  const existing = document.getElementById('questGuidePrompt');
  if (existing) existing.remove();

  const prompt = document.createElement('div');
  prompt.id = 'questGuidePrompt';
  prompt.style.cssText = `
    position: fixed; left: ${x}px; top: ${y - 54}px;
    background: rgba(15, 23, 42, 0.96);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(56, 189, 248, 0.5);
    box-shadow: 0 8px 30px rgba(0,0,0,0.7), 0 0 15px rgba(56, 189, 248, 0.3);
    color: #fff; padding: 7px 16px; border-radius: 6px;
    font-size: 13px; font-weight: 500; z-index: 10000000;
    box-sizing: border-box; max-width: calc(100vw - 40px);
    transform: translateX(-50%);
    display: flex; align-items: center; gap: 8px;
    animation: promptPulse 1.8s infinite ease-in-out;
  `;

  prompt.innerHTML = `
    <style>
      @keyframes promptPulse {
        0%, 100% { transform: translateX(-50%) translateY(0); }
        50% { transform: translateX(-50%) translateY(-6px); }
      }
    </style>
    <i class="bi bi-cursor-fill" style="color: #38bdf8; font-size: 14px;"></i>
    <span>${text}</span>
  `;

  document.body.appendChild(prompt);
  return prompt;
}

export function hideGuidePrompt() {
  const existing = document.getElementById('questGuidePrompt');
  if (existing) existing.remove();
}

/**
 * Step 1: Unknown Archive Modal when player double clicks AVALON.rar
 */
export function triggerUnknownArchiveAlert(_clickX?: number, _clickY?: number) {
  questState.rarAttempted = true;
  questAudio.playError();
  const lang = getLanguage();

  const overlay = document.createElement('div');
  overlay.style.cssText = 'position: fixed; inset: 0; background: transparent; display: flex; align-items: center; justify-content: center; z-index: 999999;';

  const modal = document.createElement('div');
  modal.style.cssText = 'width: 440px; background: #202020; border-radius: 8px; border: 1px solid rgba(255,255,255,0.12); box-shadow: 0 20px 60px rgba(0,0,0,0.8); display: flex; flex-direction: column; overflow: hidden; color: #fff; font-family: "Segoe UI", sans-serif;';
  
  modal.innerHTML = `
    <div style="height: 36px; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; font-size: 13px; background: #181818; border-bottom: 1px solid rgba(255,255,255,0.06);">
      <span>${lang === 'RU' ? 'Неизвестный тип файла' : 'Unknown File Type'}</span>
      <span id="closeUnassocModal" style="cursor: pointer; opacity: 0.6;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.6'">✕</span>
    </div>
    <div style="padding: 24px; display: flex; gap: 16px; align-items: flex-start;">
      <i class="bi bi-question-diamond-fill" style="font-size: 36px; color: #fbbf24; shrink: 0;"></i>
      <div>
        <div style="font-size: 15px; font-weight: 600;">AVALON.rar</div>
        <div style="font-size: 13px; color: #a1a1aa; margin-top: 4px; line-height: 1.4;">
          ${lang === 'RU' ? 'Для открытия файлов .rar требуется приложение архиватор (например, WinRAR).' : 'An archiver app (such as WinRAR) is required to open .rar files.'}
        </div>
      </div>
    </div>
    <div style="padding: 12px 20px; background: #181818; display: flex; justify-content: flex-end; gap: 10px; border-top: 1px solid rgba(255,255,255,0.05);">
      <button id="okUnassocModal" style="background: #0078d4; border: none; color: #fff; padding: 6px 24px; border-radius: 4px; cursor: pointer; font-size: 13px;">${lang === 'RU' ? 'Понятно' : 'Got it'}</button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  const closeFn = (e: MouseEvent) => {
    questAudio.playClick();
    overlay.remove();
    startAutomatedPreparationCutscene(e.clientX, e.clientY);
  };

  modal.querySelector('#closeUnassocModal')?.addEventListener('click', (e) => closeFn(e as MouseEvent));
  modal.querySelector('#okUnassocModal')?.addEventListener('click', (e) => closeFn(e as MouseEvent));
}

/**
 * Full autonomous cinematic cutscene:
 * Hero automatically opens browser, moves to search bar, types with realistic pacing,
 * views search loading, downloads WinRAR, runs 10-second installer, extracts AVALON.rar,
 * closes windows, returns to desktop, and hovers over AVALON for the player to double click!
 */
export async function startAutomatedPreparationCutscene(startX?: number, startY?: number) {
  const lang = getLanguage();
  const { createCinematicCursor } = await import('./investigationCutscene');
  // Starts directly from player's exact button click coordinate
  const cursor = createCinematicCursor(startX, startY);

  showHeroThought(lang === 'RU' ? 'Сейчас быстро скачаю WinRAR, установлю и распакую проект...' : 'I will quickly download WinRAR, install and extract the project...');
  await new Promise(r => setTimeout(r, 900));

  // 1. Glide to browser icon on taskbar & click
  const tbBrowser = document.getElementById('taskbarBrowser');
  if (tbBrowser) {
    const rect = tbBrowser.getBoundingClientRect();
    await cursor.moveTo(rect.left + rect.width / 2, rect.top + rect.height / 2, 600);
    await cursor.clickAnim();
  }

  // 2. Open browser window
  openQuestBrowser();
  await new Promise(r => setTimeout(r, 450));
  const browserWindow = document.getElementById('questBrowserWindow');

  if (browserWindow) {
    showHeroThought(lang === 'RU' ? 'Ищу официальный сайт WinRAR...' : 'Searching for official WinRAR site...');
    // 2.1 Glide to the search input bar
    const searchBox = browserWindow.querySelector('#browserSearchBox') as HTMLElement;
    const searchInput = browserWindow.querySelector('#browserSearchInput') as HTMLElement;
    if (searchBox) {
      const sRect = searchBox.getBoundingClientRect();
      await cursor.moveTo(sRect.left + 80, sRect.top + sRect.height / 2, 550);
      await cursor.clickAnim();
    }

    // 2.2 Realistic human typing simulation
    const targetText = lang === 'RU' ? 'скачать winrar официальный сайт' : 'download winrar official site';
    for (let i = 1; i <= targetText.length; i++) {
      if (searchInput) searchInput.innerText = targetText.slice(0, i);
      questAudio.playKeyboard();
      await new Promise(r => setTimeout(r, 50));
    }

    // 2.3 Search submit & loading animation
    if (searchBox) {
      const sRect = searchBox.getBoundingClientRect();
      await cursor.moveTo(sRect.left + 24, sRect.top + sRect.height / 2, 350);
      await cursor.clickAnim();
    }

    const webContent = browserWindow.querySelector('#browserWebContent') as HTMLElement;
    if (webContent) {
      webContent.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 16px; color: #a78bfa;">
          <div style="width: 42px; height: 42px; border: 3px solid rgba(167, 139, 250, 0.2); border-top-color: #a78bfa; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
          <div style="font-size: 14px; color: #ccc;">${lang === 'RU' ? 'Поиск в сети...' : 'Searching...'}</div>
        </div>
        <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
      `;
      await new Promise(r => setTimeout(r, 700));
    }

    // 2.4 Render search results
    renderSearchResults(browserWindow);
    await new Promise(r => setTimeout(r, 500));

    // 2.5 Glide to Download button on official site card
    const dlBtn = browserWindow.querySelector('#downloadWinrarBtn') as HTMLElement;
    if (dlBtn) {
      showHeroThought(lang === 'RU' ? 'Скачиваю установщик архиватора...' : 'Downloading archiver installer...');
      const bRect = dlBtn.getBoundingClientRect();
      await cursor.moveTo(bRect.left + bRect.width / 2, bRect.top + bRect.height / 2, 600);
      await cursor.clickAnim();
      startDownloadAnimation(browserWindow);
      await new Promise(r => setTimeout(r, 1300));
    }

    // 2.6 Glide to Run Installer button in tray
    const runBtn = browserWindow.querySelector('#trayRunInstallerBtn') as HTMLElement;
    if (runBtn) {
      const rRect = runBtn.getBoundingClientRect();
      await cursor.moveTo(rRect.left + rRect.width / 2, rRect.top + rRect.height / 2, 500);
      await cursor.clickAnim();
    }
    browserWindow.remove();
  }

  // 3. WinRAR Setup Wizard opens (10-second realistic installation)
  showHeroThought(lang === 'RU' ? 'Устанавливаю WinRAR в систему...' : 'Installing WinRAR to system...');
  await new Promise(r => setTimeout(r, 400));
  openWinrarInstallerModal(() => {});

  const setupOverlay = document.getElementById('winrarInstallerOverlay');
  if (setupOverlay) {
    const installBtn = setupOverlay.querySelector('#startInstallBtn') as HTMLElement;
    if (installBtn) {
      const sRect = installBtn.getBoundingClientRect();
      await cursor.moveTo(sRect.left + sRect.width / 2, sRect.top + sRect.height / 2, 550);
      await cursor.clickAnim();
      installBtn.click();
      
      // Wait for the full 10-second installation
      await new Promise(r => setTimeout(r, 10500));
    }

    const finishBtn = setupOverlay.querySelector('#finishInstallBtn') as HTMLElement;
    if (finishBtn) {
      const fRect = finishBtn.getBoundingClientRect();
      await cursor.moveTo(fRect.left + fRect.width / 2, fRect.top + fRect.height / 2, 450);
      await cursor.clickAnim();
      finishBtn.click();
      await new Promise(r => setTimeout(r, 400));
    }
  }

  // 4. Extract AVALON.rar inside Explorer (Documents)
  questState.winrarInstalled = true;
  showHeroThought(lang === 'RU' ? 'Теперь распаковываю архив AVALON...' : 'Now extracting AVALON archive...');

  // Ensure Explorer shows updated Documents view
  const sideDocs = document.getElementById('sideDocs');
  if (sideDocs) {
    sideDocs.click();
    await new Promise(r => setTimeout(r, 450));
  }

  // Find AVALON.rar in Explorer Documents view
  let rarItem = document.querySelector('#expAvalonArchiveWinrar, #expAvalonUnassocRar, [id*="Avalon"]') as HTMLElement;
  let rarX = 210;
  let rarY = 190;

  if (rarItem) {
    const rarRect = rarItem.getBoundingClientRect();
    if (rarRect.width > 0 && rarRect.height > 0) {
      rarX = rarRect.left + rarRect.width / 2;
      rarY = rarRect.top + rarRect.height / 2;
    }
  }

  // Glide directly to AVALON.rar in Explorer
  await cursor.moveTo(rarX, rarY, 650);
  await cursor.rightClickAnim();

  // Await the FULL extraction cycle including 10s progress and CRC-32 confirmation
  await new Promise<void>((resolve) => {
    triggerArchiveContextMenu(rarX, rarY, () => {
      resolve();
    });

    setTimeout(async () => {
      const ctxExtract = document.getElementById('ctxExtractBtn');
      if (ctxExtract) {
        const cRect = ctxExtract.getBoundingClientRect();
        await cursor.moveTo(cRect.left + cRect.width / 2, cRect.top + cRect.height / 2, 450);
        await cursor.clickAnim();
        ctxExtract.click();
      }
    }, 300);
  });

  questState.avalonExtracted = true;

  // 5. AFTER extraction is 100% complete, glide to top-right [ ✕ ] to close Explorer window
  const closeX = window.innerWidth - 26;
  const closeY = 20;
  await cursor.moveTo(closeX, closeY, 600);
  await cursor.clickAnim();

  // Close any open Explorer / app windows
  const appWindows = document.querySelectorAll('.app-window-anim');
  appWindows.forEach(w => w.remove());
  const dynamicTaskbarItems = document.querySelectorAll('.taskbar-item.dynamic');
  dynamicTaskbarItems.forEach(t => t.remove());

  // 6. Spawn / Reveal AVALON project icon on Desktop and hover over it
  await new Promise(r => setTimeout(r, 300));
  const desktopGrid = document.querySelector('#desktop > div:first-child');
  let avalonIcon = document.querySelector('.desktop-icon[data-id="avalon_extracted"]') as HTMLElement;
  if (!avalonIcon && desktopGrid) {
    avalonIcon = document.createElement('div');
    avalonIcon.className = 'desktop-icon';
    avalonIcon.dataset.id = 'avalon_extracted';
    avalonIcon.innerHTML = `
      <i class="bi bi-folder-fill" style="font-size: 44px; color: #fbbf24; margin-bottom: 4px;"></i>
      <span>AVALON</span>
    `;
    desktopGrid.appendChild(avalonIcon);
  }

  showHeroThought(lang === 'RU' ? 'Готово. Проект AVALON распакован на рабочем столе. Нажмите 2 раза ЛКМ для запуска.' : 'Ready. AVALON project extracted on desktop. Double click LMB to launch.');

  if (avalonIcon) {
    const aRect = avalonIcon.getBoundingClientRect();
    const targetX = aRect.left + aRect.width / 2;
    const targetY = aRect.top + aRect.height / 2;

    // Smoothly glide cursor right onto the AVALON icon
    await cursor.moveTo(targetX, targetY, 650);

    const launchClimax = (e: MouseEvent) => {
      cursor.destroy();
      document.body.style.cursor = 'default';
      import('./avalonCutscene').then(m => m.startAvalonCutscene(e.clientX, e.clientY));
    };

    avalonIcon.addEventListener('dblclick', launchClimax, { once: true });
    avalonIcon.addEventListener('click', launchClimax, { once: true });
    window.addEventListener('click', () => {
      launchClimax({ clientX: targetX, clientY: targetY } as MouseEvent);
    }, { once: true });
  } else {
    cursor.destroy();
    document.body.style.cursor = 'default';
  }
}

/**
 * Shows subtitle thought of the protagonist on a distinct cinematic top layer in a blue framed box
 */
export function showHeroThought(text: string) {
  const existing = document.getElementById('heroThoughtBox');
  if (existing) existing.remove();

  const box = document.createElement('div');
  box.id = 'heroThoughtBox';
  box.style.cssText = `
    position: fixed; bottom: 70px; left: 50%; transform: translateX(-50%);
    background: rgba(8, 14, 26, 0.95);
    border: 1px solid rgba(56, 189, 248, 0.4);
    box-shadow: 0 10px 40px rgba(0,0,0,0.85), 0 0 20px rgba(56, 189, 248, 0.2);
    color: #38bdf8; padding: 10px 24px; border-radius: 8px;
    font-size: 14px; font-weight: 500; font-family: 'Segoe UI', sans-serif;
    z-index: 2147483646; width: auto; max-width: calc(100vw - 60px); text-align: center;
    line-height: 1.5; opacity: 0; transition: opacity 0.4s ease;
    text-shadow: 0 2px 8px rgba(0,0,0,0.9); box-sizing: border-box;
    pointer-events: none;
  `;
  box.innerHTML = `<i>${text}</i>`;
  document.body.appendChild(box);
  requestAnimationFrame(() => box.style.opacity = '1');
  setTimeout(() => {
    box.style.opacity = '0';
    setTimeout(() => box.remove(), 400);
  }, 6000);
}

/**
 * Guides user to the Browser icon on Taskbar/Desktop
 */
export function guideUserToBrowser() {
  const lang = getLanguage();
  const tbBrowser = document.getElementById('taskbarBrowser');
  const desktopBrowser = document.querySelector('.desktop-icon[data-id="browser"]');

  const openAction = () => {
    hideGuidePrompt();
    openQuestBrowser();
  };

  if (tbBrowser) {
    const rect = tbBrowser.getBoundingClientRect();
    const prompt = showGuidePrompt(lang === 'RU' ? 'Нажмите ЛКМ, чтобы открыть Браузер' : 'Click LMB to open Browser', rect.left + rect.width / 2, rect.top);
    prompt.style.pointerEvents = 'auto';
    prompt.style.cursor = 'pointer';
    prompt.addEventListener('click', openAction);
    tbBrowser.addEventListener('click', openAction, { once: true });
  }

  desktopBrowser?.addEventListener('dblclick', openAction, { once: true });
}

/**
 * Step 2: Open realistic dark browser with search bar and download tray
 */
export function openQuestBrowser() {
  const lang = getLanguage();
  questAudio.playClick();

  const overlay = document.createElement('div');
  overlay.id = 'questBrowserWindow';
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100vw; max-width: 100vw; height: calc(100vh - 48px);
    background: #0e0c1b; z-index: 9999999; display: flex; flex-direction: column;
    font-family: 'Segoe UI', sans-serif; color: #fff; overflow: hidden; box-sizing: border-box;
  `;

  overlay.innerHTML = `
    <!-- Custom Scrollbar & Browser Animations Style -->
    <style>
      #questBrowserWindow ::-webkit-scrollbar {
        width: 8px;
      }
      #questBrowserWindow ::-webkit-scrollbar-track {
        background: #181818;
      }
      #questBrowserWindow ::-webkit-scrollbar-thumb {
        background: #333;
        border-radius: 4px;
      }
      #questBrowserWindow ::-webkit-scrollbar-thumb:hover {
        background: #555;
      }
      @keyframes traySlideDown {
        0% { opacity: 0; transform: translateY(-10px) scale(0.98); }
        100% { opacity: 1; transform: translateY(0) scale(1); }
      }
    </style>

    <!-- Browser Top Bar / Tabs -->
    <div style="height: 40px; background: #181818; display: flex; align-items: center; justify-content: space-between; padding: 0 10px 0 14px; border-bottom: 1px solid rgba(255,255,255,0.06); box-sizing: border-box;">
      <div style="display: flex; align-items: center; gap: 6px;">
        <div style="background: #242424; color: #fff; padding: 6px 16px; border-radius: 8px 8px 0 0; font-size: 12px; display: flex; align-items: center; gap: 8px; border-top: 2px solid #38bdf8;">
          <i class="bi bi-globe" style="color: #38bdf8; font-size: 13px;"></i>
          <span style="font-weight: 500;">${lang === 'RU' ? 'Новая вкладка' : 'New Tab'}</span>
        </div>
        <div style="width: 26px; height: 26px; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #888; cursor: pointer; font-size: 14px;">+</div>
      </div>

      <!-- Right Browser Controls -->
      <div style="display: flex; align-items: center; gap: 8px;">
        <!-- Download Tray Button -->
        <div id="browserDownloadBtn" title="${lang === 'RU' ? 'Загрузки' : 'Downloads'}" style="position: relative; width: 34px; height: 30px; border-radius: 4px; background: rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.15s;" onmouseover="this.style.background='rgba(255,255,255,0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.08)'">
          <i class="bi bi-download" style="font-size: 14px; color: #ddd;"></i>
          <span id="downloadBadge" style="display: none; position: absolute; top: -2px; right: -2px; width: 8px; height: 8px; background: #22c55e; border-radius: 50%; border: 2px solid #181818;"></span>
        </div>

        <!-- Standard Windows Close Button -->
        <div id="closeBrowserBtn" title="${lang === 'RU' ? 'Закрыть' : 'Close'}" style="width: 44px; height: 30px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 14px; border-radius: 4px; transition: background 0.15s, color 0.15s; color: #ccc;" onmouseover="this.style.background='#e81123'; this.style.color='#fff';" onmouseout="this.style.background='transparent'; this.style.color='#ccc';">✕</div>
      </div>
    </div>

    <!-- Browser URL Bar -->
    <div style="height: 44px; background: #202020; display: flex; align-items: center; padding: 0 16px; gap: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); box-sizing: border-box;">
      <div style="display: flex; gap: 10px; color: #888; font-size: 14px;">
        <i class="bi bi-arrow-left" style="cursor: pointer;"></i>
        <i class="bi bi-arrow-right" style="cursor: pointer;"></i>
        <i class="bi bi-arrow-clockwise" style="cursor: pointer;"></i>
      </div>
      <div style="flex: 1; height: 30px; background: #161616; border-radius: 15px; display: flex; align-items: center; padding: 0 14px; font-size: 13px; color: #888; border: 1px solid #333;">
        <i class="bi bi-lock-fill" style="color: #22c55e; font-size: 11px; margin-right: 8px;"></i>
        <span id="browserUrlText">https://search.net/</span>
      </div>
    </div>

    <!-- Download Tray Flyout Menu -->
    <div id="downloadTrayMenu" style="display: none; position: absolute; top: 44px; right: 16px; width: 380px; max-width: calc(100vw - 32px); background: #202020; border-radius: 8px; border: 1px solid #383838; box-shadow: 0 16px 50px rgba(0,0,0,0.8); padding: 16px; z-index: 10000000; box-sizing: border-box; animation: traySlideDown 0.2s ease;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
        <div style="font-size: 14px; font-weight: 600; color: #fff;">${lang === 'RU' ? 'Загрузки' : 'Downloads'}</div>
        <span id="closeTrayMenu" style="cursor: pointer; font-size: 14px; color: #888; padding: 2px 6px;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#888'">✕</span>
      </div>
      
      <div id="trayFileCard" style="display: flex; flex-direction: column; gap: 10px; padding: 12px; background: #181818; border-radius: 6px; border: 1px solid #2e2e2e;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <i class="bi bi-file-earmark-zip-fill" style="font-size: 32px; color: #38bdf8;"></i>
          <div style="flex: 1;">
            <div style="font-size: 13px; font-weight: 600; color: #fff;">winrar-x64-701ru.exe</div>
            <div id="trayDownloadStatus" style="font-size: 12px; color: #38bdf8; margin-top: 2px;">
              ${lang === 'RU' ? 'Подготовка к скачиванию...' : 'Preparing download...'}
            </div>
            <div id="trayProgressBarBox" style="width: 100%; height: 5px; background: #282828; border-radius: 3px; margin-top: 8px; overflow: hidden;">
              <div id="trayProgressFill" style="width: 0%; height: 100%; background: #38bdf8; transition: width 0.2s ease;"></div>
            </div>
          </div>
        </div>

        <!-- Action buttons after download -->
        <div id="trayActionsBox" style="display: none; align-items: center; gap: 8px; margin-top: 4px; padding-top: 8px; border-top: 1px solid #282828;">
          <button id="trayRunInstallerBtn" style="flex: 1; background: #22c55e; color: #000; border: none; padding: 7px 12px; border-radius: 5px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;" onmouseover="this.style.background='#16a34a'" onmouseout="this.style.background='#22c55e'">
            <i class="bi bi-play-circle-fill"></i>
            <span>${lang === 'RU' ? 'Установить WinRAR' : 'Run Installer'}</span>
          </button>
          <button id="trayShowFolderBtn" style="background: rgba(255,255,255,0.08); color: #fff; border: 1px solid rgba(255,255,255,0.1); padding: 7px 12px; border-radius: 5px; font-size: 12px; cursor: pointer;" onmouseover="this.style.background='rgba(255,255,255,0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.08)'">
            <i class="bi bi-folder2-open"></i>
            <span>${lang === 'RU' ? 'В папке' : 'Show folder'}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Browser Main Web Page Content -->
    <div id="browserWebContent" style="flex: 1; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; overflow-y: auto; background: #141414; box-sizing: border-box; padding: 20px;">
      
      <!-- Search Engine Home View (Clean Modern Google/Web style) -->
      <div id="searchHomeView" style="display: flex; flex-direction: column; align-items: center; width: 100%; max-width: 650px; padding: 0 20px; box-sizing: border-box;">
        <div style="font-size: 3.2rem; font-weight: 700; letter-spacing: -1px; margin-bottom: 24px; color: #fff; font-family: 'Segoe UI', system-ui, sans-serif;">
          <span style="color: #4285f4;">S</span><span style="color: #ea4335;">e</span><span style="color: #fbbc05;">a</span><span style="color: #4285f4;">r</span><span style="color: #34a853;">c</span><span style="color: #ea4335;">h</span>
        </div>

        <div id="browserSearchBox" style="width: 100%; height: 48px; background: #202124; border: 1px solid #3c4043; border-radius: 24px; display: flex; align-items: center; padding: 0 20px; gap: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.3); cursor: text; box-sizing: border-box; transition: border-color 0.2s, box-shadow 0.2s;">
          <i class="bi bi-search" style="font-size: 16px; color: #9aa0a6;"></i>
          <span id="browserSearchInput" style="font-size: 14.5px; color: #e8eaed; flex: 1; white-space: nowrap; overflow: hidden;"></span>
          <span id="searchCaret" style="width: 2px; height: 18px; background: #38bdf8; animation: blink 1s infinite;"></span>
        </div>

        <!-- Quick access shortcuts -->
        <div style="display: flex; gap: 24px; margin-top: 36px; justify-content: center; flex-wrap: wrap;">
          <div style="display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: default;">
            <div style="width: 44px; height: 44px; border-radius: 50%; background: #242424; border: 1px solid #333; display: flex; align-items: center; justify-content: center; color: #ff0000; font-size: 20px;">
              <i class="bi bi-youtube"></i>
            </div>
            <span style="font-size: 11px; color: #aaa;">YouTube</span>
          </div>

          <div style="display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: default;">
            <div style="width: 44px; height: 44px; border-radius: 50%; background: #242424; border: 1px solid #333; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 20px;">
              <i class="bi bi-github"></i>
            </div>
            <span style="font-size: 11px; color: #aaa;">GitHub</span>
          </div>

          <div style="display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: default;">
            <div style="width: 44px; height: 44px; border-radius: 50%; background: #242424; border: 1px solid #333; display: flex; align-items: center; justify-content: center; color: #38bdf8; font-size: 20px;">
              <i class="bi bi-book"></i>
            </div>
            <span style="font-size: 11px; color: #aaa;">Wiki</span>
          </div>

          <div style="display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: default;">
            <div style="width: 44px; height: 44px; border-radius: 50%; background: #242424; border: 1px solid #333; display: flex; align-items: center; justify-content: center; color: #34a853; font-size: 20px;">
              <i class="bi bi-envelope"></i>
            </div>
            <span style="font-size: 11px; color: #aaa;">Mail</span>
          </div>
        </div>


      </div>

    </div>
  `;

  document.body.appendChild(overlay);

  // Close button
  const closeBtn = overlay.querySelector('#closeBrowserBtn');
  closeBtn?.addEventListener('click', () => {
    questAudio.playClick();
    overlay.remove();
    hideGuidePrompt();
    if (questState.winrarDownloaded && !questState.winrarInstalled) {
      showHeroThought(lang === 'RU' ? 'Установщик скачан!' : 'Installer downloaded!');
    }
  });

  // Tray Toggle Button
  const trayBtn = overlay.querySelector('#browserDownloadBtn');
  const trayMenu = overlay.querySelector('#downloadTrayMenu') as HTMLElement;
  const closeTray = overlay.querySelector('#closeTrayMenu');
  
  trayBtn?.addEventListener('click', () => {
    if (trayMenu) {
      trayMenu.style.display = trayMenu.style.display === 'none' ? 'block' : 'none';
    }
  });
  closeTray?.addEventListener('click', () => {
    if (trayMenu) trayMenu.style.display = 'none';
  });

  // Step 2.1: Realistic Key typing simulation (1 char per keystroke)
  const targetQuery = lang === 'RU' ? 'скачать winrar официальный сайт' : 'download winrar official site';
  let typedLen = 0;
  const searchInput = overlay.querySelector('#browserSearchInput') as HTMLElement;

  const keyHandler = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && typedLen > 4) {
      typedLen = targetQuery.length;
      searchInput.innerText = targetQuery;
      window.removeEventListener('keydown', keyHandler);
      renderSearchResults(overlay);
      return;
    }

    if (typedLen < targetQuery.length) {
      typedLen += 1;
      searchInput.innerText = targetQuery.substring(0, typedLen);
      questAudio.playKeyboard();

      if (typedLen >= targetQuery.length) {
        window.removeEventListener('keydown', keyHandler);
        setTimeout(() => {
          renderSearchResults(overlay);
        }, 500);
      }
    }
  };
  window.addEventListener('keydown', keyHandler);
}

/**
 * Step 2.2: Show realistic Search Engine Results Page (SERP) with multiple sites (Centered & Symmetrical)
 */
function renderSearchResults(browserWindow: HTMLElement) {
  const lang = getLanguage();
  const webContent = browserWindow.querySelector('#browserWebContent') as HTMLElement;
  const urlText = browserWindow.querySelector('#browserUrlText') as HTMLElement;
  if (urlText) urlText.innerText = 'https://search.net/search?q=download+winrar';

  webContent.style.justifyContent = 'flex-start';
  webContent.style.alignItems = 'center';
  webContent.style.padding = '24px 20px';
  webContent.style.background = '#141414';

  webContent.innerHTML = `
    <div style="width: 100%; max-width: 800px; display: flex; flex-direction: column; gap: 16px; box-sizing: border-box;">
      
      <!-- Top Search Bar in SERP -->
      <div style="display: flex; align-items: center; gap: 16px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 14px;">
        <div style="font-size: 1.3rem; font-weight: 700; color: #fff; font-family: 'Segoe UI', sans-serif;">
          <span style="color: #4285f4;">S</span><span style="color: #ea4335;">e</span><span style="color: #fbbc05;">a</span><span style="color: #4285f4;">r</span><span style="color: #34a853;">c</span><span style="color: #ea4335;">h</span>
        </div>
        <div style="flex: 1; height: 38px; background: #202124; border: 1px solid #3c4043; border-radius: 20px; display: flex; align-items: center; padding: 0 16px; gap: 10px;">
          <input type="text" value="${lang === 'RU' ? 'скачать winrar официальный сайт' : 'download winrar official site'}" readonly style="flex: 1; background: transparent; border: none; outline: none; color: #e8eaed; font-size: 13.5px;">
          <i class="bi bi-search" style="color: #9aa0a6;"></i>
        </div>
      </div>

      <!-- Search Stats -->
      <div style="font-size: 12px; color: #71717a;">
        ${lang === 'RU' ? 'Результатов: примерно 4,820,000 (0.24 сек.)' : 'About 4,820,000 results (0.24 seconds)'}
      </div>

      <!-- Result 1: Official WinRAR Site (Target) -->
      <div id="serpOfficialWinrar" style="background: #202124; border: 1px solid #38bdf8; border-radius: 8px; padding: 18px 22px; display: flex; flex-direction: column; gap: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
        <div style="display: flex; align-items: center; gap: 12px;">
          <i class="bi bi-file-earmark-zip-fill" style="font-size: 26px; color: #38bdf8;"></i>
          <div>
            <div style="font-size: 12px; color: #22c55e;">https://www.win-rar.com/download.html</div>
            <div style="font-size: 16px; font-weight: 600; color: #60a5fa;">
              ${lang === 'RU' ? 'WinRAR archiver, a powerful tool to process RAR and ZIP (Официальный сайт)' : 'WinRAR archiver, official download (RAR & ZIP)'}
            </div>
          </div>
          <span style="margin-left: auto; background: rgba(34, 197, 94, 0.15); border: 1px solid #22c55e; color: #4ade80; font-size: 11px; padding: 2px 8px; border-radius: 8px;">Official</span>
        </div>
        <p style="font-size: 13px; color: #bdc1c6; line-height: 1.5; margin: 0;">
          ${lang === 'RU' ? 'Официальный дистрибутив архиватора WinRAR 7.01 для Windows (64-bit / 32-bit). Надежное сжатие, шифрование и распаковка любых архивных форматов.' : 'Official WinRAR 7.01 installer for Windows (64-bit / 32-bit). Powerful compression and extraction.'}
        </p>
        <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 12px; margin-top: 4px;">
          <div style="font-size: 12px; color: #9aa0a6;">winrar-x64-701ru.exe • 3.4 MB</div>
          <button id="downloadWinrarBtn" style="background: #0078d4; color: #fff; border: none; padding: 8px 24px; border-radius: 4px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: background 0.2s;" onmouseover="this.style.background='#106ebe'" onmouseout="this.style.background='#0078d4'">
            <i class="bi bi-download"></i>
            <span>${lang === 'RU' ? 'Скачать WinRAR (64-bit)' : 'Download WinRAR (64-bit)'}</span>
          </button>
        </div>
      </div>

      <!-- Result 2: Softportal Catalog -->
      <div style="background: #181818; border: 1px solid #282828; border-radius: 8px; padding: 14px 18px; display: flex; flex-direction: column; gap: 4px;">
        <div style="font-size: 12px; color: #71717a;">https://softportal.com/software-46-winrar.html</div>
        <div style="font-size: 15px; font-weight: 500; color: #8ab4f8;">WinRAR 7.01 - Каталог программ | SoftPortal</div>
        <p style="font-size: 12.5px; color: #9aa0a6; margin: 0; line-height: 1.4;">
          ${lang === 'RU' ? 'Скачать WinRAR бесплатно на русском языке. Один из самых известных архиваторов с поддержкой RAR, ZIP, CAB, ARJ, TAR, ISO.' : 'Download WinRAR for free. Popular archive utility supporting RAR, ZIP, CAB, TAR.'}
        </p>
      </div>

      <!-- Result 3: Wikipedia -->
      <div style="background: #181818; border: 1px solid #282828; border-radius: 8px; padding: 14px 18px; display: flex; flex-direction: column; gap: 4px;">
        <div style="font-size: 12px; color: #71717a;">https://ru.wikipedia.org/wiki/WinRAR</div>
        <div style="font-size: 15px; font-weight: 500; color: #8ab4f8;">WinRAR — Википедия</div>
        <p style="font-size: 12.5px; color: #9aa0a6; margin: 0; line-height: 1.4;">
          ${lang === 'RU' ? 'WinRAR — файловый архиватор для 32- и 64-разрядных операционных систем Windows, созданный Евгением Рошалем.' : 'WinRAR is a trialware file archiver utility for Windows, developed by Eugene Roshal.'}
        </p>
      </div>

    </div>
  `;

  const downloadBtn = webContent.querySelector('#downloadWinrarBtn') as HTMLElement;
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      startDownloadAnimation(browserWindow);
    });
  }
}

/**
 * Step 2.3: Animate download flying into top-right tray smoothly
 */
function startDownloadAnimation(browserWindow: HTMLElement) {
  const lang = getLanguage();
  questAudio.playClick();

  const downloadTray = browserWindow.querySelector('#downloadTrayMenu') as HTMLElement;
  const downloadBadge = browserWindow.querySelector('#downloadBadge') as HTMLElement;
  const progressFill = browserWindow.querySelector('#trayProgressFill') as HTMLElement;
  const trayStatus = browserWindow.querySelector('#trayDownloadStatus') as HTMLElement;
  const actionsBox = browserWindow.querySelector('#trayActionsBox') as HTMLElement;
  const runInstallerBtn = browserWindow.querySelector('#trayRunInstallerBtn') as HTMLElement;
  const showFolderBtn = browserWindow.querySelector('#trayShowFolderBtn') as HTMLElement;

  if (downloadTray) downloadTray.style.display = 'block';
  if (downloadBadge) downloadBadge.style.display = 'block';

  let progress = 0;
  const interval = setInterval(() => {
    progress += 35;
    if (progress > 100) progress = 100;
    if (progressFill) progressFill.style.width = `${progress}%`;
    if (trayStatus) {
      trayStatus.innerText = `${lang === 'RU' ? 'Скачивание...' : 'Downloading...'} ${Math.round(progress * 0.034 * 10) / 10} / 3.4 MB`;
    }

    if (progress >= 100) {
      clearInterval(interval);
      questState.winrarDownloaded = true;
      questAudio.playDownloadFinish();

      if (trayStatus) {
        trayStatus.innerText = lang === 'RU' ? 'Загрузка завершена (3.4 MB)' : 'Download complete (3.4 MB)';
        trayStatus.style.color = '#22c55e';
      }

      if (actionsBox) {
        actionsBox.style.display = 'flex';
      }

      if (runInstallerBtn) {
        // Clicking in browser prompts hero to go to Downloads folder
        runInstallerBtn.onclick = () => {
          browserWindow.remove();
          showHeroThought(lang === 'RU' ? 'Установщик сохранен в Загрузках! Откроем проводник, перейдем в «Загрузки» и запустим его 2 раза ЛКМ.' : 'Installer saved in Downloads! Open Explorer, go to Downloads and double-click to install.');
        };
      }

      if (showFolderBtn) {
        showFolderBtn.onclick = () => {
          browserWindow.remove();
          showHeroThought(lang === 'RU' ? 'Открываем проводник... Перейдите в «Загрузки» и запустите winrar-x64-701ru.exe 2 раза ЛКМ.' : 'Opening Explorer... Go to Downloads and double-click winrar-x64-701ru.exe to install.');
        };
      }

      showHeroThought(lang === 'RU' ? 'Установщик скачан в Загрузки! Перейдите в проводник и запустите его 2 раза ЛКМ.' : 'Installer downloaded to Downloads! Go to Explorer and double-click to launch.');
    }
  }, 250);
}

/**
 * Step 3: WinRAR Setup Installer Wizard
 */
export function openWinrarInstallerModal(onComplete: () => void) {
  questAudio.playClick();

  // Ensure any dangling browser or prompts are cleaned
  const browser = document.getElementById('questBrowserWindow');
  if (browser) browser.remove();
  hideGuidePrompt();

  const overlay = document.createElement('div');
  overlay.id = 'winrarInstallerOverlay';
  overlay.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100000000;';

  const modal = document.createElement('div');
  modal.style.cssText = 'width: 520px; background: #262626; border-radius: 8px; border: 1px solid #444; box-shadow: 0 20px 60px rgba(0,0,0,0.9); display: flex; flex-direction: column; overflow: hidden; color: #fff; font-family: "Segoe UI", sans-serif;';
  
  modal.innerHTML = `
    <div style="height: 38px; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; font-size: 13px; background: #1c1c1c; border-bottom: 1px solid rgba(255,255,255,0.06);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <i class="bi bi-file-earmark-zip-fill" style="color: #a78bfa;"></i>
        <span>Установка WinRAR 7.01 (64-разрядная)</span>
      </div>
      <div id="closeInstallerModal" style="cursor: pointer; opacity: 0.7; padding: 2px 6px;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.7'">✕</div>
    </div>

    <div id="installerBody" style="padding: 24px; display: flex; flex-direction: column; gap: 16px;">
      <div style="font-size: 14px; font-weight: 600;">Папка назначения:</div>
      <div style="display: flex; gap: 8px;">
        <input type="text" value="C:\\Program Files\\WinRAR" readonly style="flex: 1; background: #181818; border: 1px solid #444; color: #ccc; padding: 6px 12px; border-radius: 4px; font-size: 13px;">
        <button style="background: #333; border: 1px solid #555; color: #fff; padding: 6px 16px; border-radius: 4px; font-size: 12px;">Обзор...</button>
      </div>

      <div style="font-size: 12px; color: #888; line-height: 1.5; background: #1c1c1c; padding: 12px; border-radius: 6px; border: 1px solid #333;">
        Нажимая кнопку «Установить», вы соглашаетесь с условиями лицензионного соглашения WinRAR.
      </div>
    </div>

    <div id="installerFooter" style="padding: 14px 20px; background: #1c1c1c; display: flex; justify-content: flex-end; gap: 10px; border-top: 1px solid rgba(255,255,255,0.06);">
      <button id="startInstallBtn" style="background: #0078d4; border: none; color: #fff; padding: 8px 24px; border-radius: 4px; cursor: pointer; font-size: 13px; font-weight: 600; transition: background 0.15s;" onmouseover="this.style.background='#006cc1'" onmouseout="this.style.background='#0078d4'">
        Установить
      </button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  const closeBtn = modal.querySelector('#closeInstallerModal');
  closeBtn?.addEventListener('click', () => {
    overlay.remove();
  });

  const startInstallBtn = modal.querySelector('#startInstallBtn') as HTMLElement;
  const installerBody = modal.querySelector('#installerBody') as HTMLElement;
  const installerFooter = modal.querySelector('#installerFooter') as HTMLElement;

  if (startInstallBtn) {
    startInstallBtn.addEventListener('click', () => {
      questAudio.playClick();

      // Progress bar copying simulation
      installerBody.innerHTML = `
        <div style="font-size: 13px; margin-bottom: 8px;" id="installStatusText">Копирование файлов: WinRAR.exe...</div>
        <div style="width: 100%; height: 16px; background: #181818; border-radius: 8px; overflow: hidden; border: 1px solid #333;">
          <div id="installProgressFill" style="width: 0%; height: 100%; background: #22c55e; transition: width 0.3s ease;"></div>
        </div>
        <div style="font-size: 11px; color: #777; margin-top: 6px;" id="installFileDetail">C:\\Program Files\\WinRAR\\RarExt.dll</div>
      `;
      installerFooter.innerHTML = `<button disabled style="background: #333; border: none; color: #666; padding: 8px 24px; border-radius: 4px; font-size: 13px;">Установка...</button>`;

      const files = ['WinRAR.exe', 'RarExt.dll', 'Formats.dll', 'Default.theme', 'WinRAR.chm', 'Uninstall.exe'];
      let idx = 0;
      let pct = 0;

      const timer = setInterval(() => {
        pct += 10;
        if (pct > 100) pct = 100;
        idx = (idx + 1) % files.length;
        
        const fill = modal.querySelector('#installProgressFill') as HTMLElement;
        const statusText = modal.querySelector('#installStatusText') as HTMLElement;
        const fileDetail = modal.querySelector('#installFileDetail') as HTMLElement;

        if (fill) fill.style.width = `${pct}%`;
        if (statusText) statusText.innerText = `Копирование файлов: ${files[idx]}...`;
        if (fileDetail) fileDetail.innerText = `C:\\Program Files\\WinRAR\\${files[idx]}`;

        if (pct >= 100) {
          clearInterval(timer);
          questState.winrarInstalled = true;
          questAudio.playDownloadFinish();

          // Finished step
          installerBody.innerHTML = `
            <div style="display: flex; gap: 16px; align-items: center;">
              <i class="bi bi-check-circle-fill" style="font-size: 38px; color: #22c55e;"></i>
              <div>
                <div style="font-size: 15px; font-weight: 600;">WinRAR успешно установлен!</div>
                <div style="font-size: 12px; color: #888; margin-top: 2px;">Ассоциации файлов .RAR и .ZIP привязаны к WinRAR.</div>
              </div>
            </div>
          `;
          installerFooter.innerHTML = `
            <button id="finishInstallBtn" style="background: #22c55e; border: none; color: #000; padding: 8px 28px; border-radius: 4px; cursor: pointer; font-size: 13px; font-weight: 600;">
              Готово
            </button>
          `;

          const finishBtn = modal.querySelector('#finishInstallBtn') as HTMLElement;
          finishBtn?.addEventListener('click', () => {
            questAudio.playClick();
            overlay.remove();
            showHeroThought('Отлично, WinRAR установлен! Теперь вернемся в «Документы» и распакуем AVALON.rar.');
            onComplete();
          });
        }
      }, 1000);
    });
  }
}

/**
 * Step 4: Context Menu Extraction Simulation
 */
export function triggerArchiveContextMenu(x: number, y: number, onExtractDone: () => void) {
  questAudio.playClick();
  const existing = document.getElementById('archiveContextMenu');
  if (existing) existing.remove();

  const menu = document.createElement('div');
  menu.id = 'archiveContextMenu';
  menu.style.cssText = `
    position: fixed; left: ${x}px; top: ${y}px;
    width: 240px; background: #262626; border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 10px 40px rgba(0,0,0,0.8);
    padding: 6px; z-index: 999999; color: #fff; font-family: 'Segoe UI', sans-serif;
  `;

  menu.innerHTML = `
    <div id="ctxOpenInWinrar" class="ctx-item" style="padding: 8px 12px; border-radius: 4px; font-size: 13px; display: flex; align-items: center; gap: 10px; cursor: pointer; color: #ccc;" onmouseover="this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.background='transparent'">
      <i class="bi bi-file-earmark-zip-fill" style="color: #a78bfa;"></i>
      <span>Открыть в WinRAR</span>
    </div>
    
    <div id="ctxExtractBtn" class="ctx-item" style="padding: 8px 12px; border-radius: 4px; font-size: 13px; display: flex; align-items: center; gap: 10px; cursor: pointer; background: rgba(139, 92, 246, 0.2); border: 1px solid rgba(139, 92, 246, 0.5); color: #fff; font-weight: 600;" onmouseover="this.style.background='rgba(139, 92, 246, 0.3)'" onmouseout="this.style.background='rgba(139, 92, 246, 0.2)'">
      <i class="bi bi-folder-symlink-fill" style="color: #fbbf24;"></i>
      <span>Извлечь в AVALON\\</span>
    </div>

    <div style="height: 1px; background: rgba(255,255,255,0.08); margin: 4px 0;"></div>

    <div class="ctx-item" style="padding: 8px 12px; border-radius: 4px; font-size: 13px; display: flex; align-items: center; gap: 10px; color: #888;">
      <i class="bi bi-info-circle"></i>
      <span>Свойства</span>
    </div>
  `;

  document.body.appendChild(menu);

  const startExtract = () => {
    menu.remove();
    showExtractProgressModal(onExtractDone);
  };

  const extractBtn = menu.querySelector('#ctxExtractBtn') as HTMLElement;
  const openBtn = menu.querySelector('#ctxOpenInWinrar') as HTMLElement;
  extractBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    startExtract();
  });
  openBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    startExtract();
  });

  const closeHandler = () => {
    menu.remove();
    window.removeEventListener('click', closeHandler);
  };
  setTimeout(() => window.addEventListener('click', closeHandler), 10);
}

/**
 * Step 5: WinRAR Extract Progress Dialog with Realistic 10s Duration and Checksum Error Prompt
 */
export function showExtractProgressModal(onDone: () => void) {
  questAudio.playClick();
  const lang = getLanguage();

  const overlay = document.createElement('div');
  overlay.id = 'winrarExtractOverlay';
  overlay.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(2px); display: flex; align-items: center; justify-content: center; z-index: 999999;';

  const modal = document.createElement('div');
  modal.style.cssText = 'width: 440px; background: #242424; border-radius: 8px; border: 1px solid #444; box-shadow: 0 16px 50px rgba(0,0,0,0.8); display: flex; flex-direction: column; overflow: hidden; color: #fff; font-family: "Segoe UI", sans-serif;';
  
  modal.innerHTML = `
    <div style="height: 36px; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; font-size: 13px; background: #1c1c1c; border-bottom: 1px solid rgba(255,255,255,0.06);">
      <span>${lang === 'RU' ? 'Извлечение из AVALON.rar' : 'Extracting from AVALON.rar'}</span>
      <span style="font-size: 11px; color: #888;">WinRAR</span>
    </div>
    <div style="padding: 20px; display: flex; flex-direction: column; gap: 10px;">
      <div style="font-size: 12px; color: #ccc;" id="extractCurrentFile">${lang === 'RU' ? 'Извлечение: avalon_core.dll...' : 'Extracting: avalon_core.dll...'}</div>
      <div style="width: 100%; height: 14px; background: #181818; border-radius: 7px; overflow: hidden; border: 1px solid #333;">
        <div id="extractProgressFill" style="width: 0%; height: 100%; background: #0078d4; transition: width 0.3s ease;"></div>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 11px; color: #777;">
        <span id="extractSpeed">${lang === 'RU' ? 'Скорость: 68.5 MB/s' : 'Speed: 68.5 MB/s'}</span>
        <span id="extractPercent">0%</span>
      </div>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  let p = 0;
  const files = ['avalon_core.dll', 'engine_render.sys', 'assets.pak', 'Avalon.exe', 'game_logic.bin', 'textures_01.dat'];
  let fIdx = 0;
  let hasStalled = false;

  const t = setInterval(() => {
    if (!hasStalled) {
      p += 8;
      fIdx = (fIdx + 1) % files.length;
      
      const fill = modal.querySelector('#extractProgressFill') as HTMLElement;
      const fileLabel = modal.querySelector('#extractCurrentFile') as HTMLElement;
      const pctLabel = modal.querySelector('#extractPercent') as HTMLElement;

      if (fill) fill.style.width = `${Math.min(80, p)}%`;
      if (pctLabel) pctLabel.innerText = `${Math.min(80, p)}%`;
      if (fileLabel) fileLabel.innerText = `${lang === 'RU' ? 'Извлечение:' : 'Extracting:'} ${files[fIdx]}...`;

      if (p >= 80) {
        hasStalled = true;
        clearInterval(t);

        // Play error sound and show WinRAR Diagnostic Error Dialog
        const errSound = new Audio('/assets/sounds/sfx/main/error.wav');
        errSound.volume = 0.6;
        errSound.play().catch(() => {});

        const errorDialog = document.createElement('div');
        errorDialog.id = 'winrarCrcErrorDialog';
        errorDialog.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 10000000; display: flex; align-items: center; justify-content: center;';
        errorDialog.innerHTML = `
          <div style="width: 460px; background: #242424; border-radius: 8px; border: 1px solid #555; box-shadow: 0 20px 60px rgba(0,0,0,0.9); overflow: hidden; color: #fff; font-family: 'Segoe UI', sans-serif;">
            <div style="background: #1b1b1b; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #333;">
              <span style="font-size: 13px; font-weight: 600;">${lang === 'RU' ? 'Диагностические сообщения WinRAR' : 'WinRAR Diagnostic Messages'}</span>
              <span style="font-size: 12px; color: #888;">✕</span>
            </div>
            <div style="padding: 20px; display: flex; gap: 16px; align-items: flex-start;">
              <div style="width: 36px; height: 36px; border-radius: 50%; background: rgba(239,68,68,0.15); border: 2px solid #ef4444; color: #ef4444; font-size: 20px; font-weight: bold; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">!</div>
              <div>
                <div style="font-size: 13px; font-weight: 600; color: #f87171; margin-bottom: 6px;">${lang === 'RU' ? 'Ошибка контрольной суммы CRC-32' : 'Checksum Error CRC-32'}</div>
                <div style="font-size: 12.5px; color: #ccc; line-height: 1.4;">
                  ${lang === 'RU' ? 'C:\\Users\\user\\Desktop\\AVALON.rar: Ошибка контрольной суммы в avalon_core.dll. Файл поврежден или модифицирован.<br/><br/><strong>Всё равно продолжить извлечение и сохранить поврежденные файлы?</strong>' : 'C:\\Users\\user\\Desktop\\AVALON.rar: Checksum error in avalon_core.dll. File is damaged or modified.<br/><br/><strong>Continue extraction and keep broken files?</strong>'}
                </div>
              </div>
            </div>
            <div style="padding: 12px 20px; background: #1b1b1b; border-top: 1px solid #333; display: flex; justify-content: flex-end; gap: 12px;">
              <button id="winrarErrorContinueBtn" style="background: #0078d4; color: #fff; border: none; padding: 7px 24px; border-radius: 4px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.2s;">${lang === 'RU' ? 'Да (Продолжить)' : 'Yes (Continue)'}</button>
              <button style="background: rgba(255,255,255,0.08); color: #fff; border: 1px solid #444; padding: 7px 20px; border-radius: 4px; font-size: 13px; cursor: default;">${lang === 'RU' ? 'Отмена' : 'Cancel'}</button>
            </div>
          </div>
        `;
        document.body.appendChild(errorDialog);

        const continueExtract = () => {
          errorDialog.remove();
          showHeroThought(lang === 'RU' ? 'Странно... контрольная сумма не совпадает. Но выбора нет, нужно распаковать.' : 'Strange... checksum mismatch. But no choice, must extract.');
          
          // Resume progress from 80% to 100%
          let p2 = 80;
          const t2 = setInterval(() => {
            p2 += 10;
            const fill = modal.querySelector('#extractProgressFill') as HTMLElement;
            const pctLabel = modal.querySelector('#extractPercent') as HTMLElement;
            if (fill) fill.style.width = `${Math.min(100, p2)}%`;
            if (pctLabel) pctLabel.innerText = `${Math.min(100, p2)}%`;

            if (p2 >= 100) {
              clearInterval(t2);
              questState.avalonExtracted = true;
              questAudio.playDownloadFinish();
              setTimeout(() => {
                overlay.remove();
                showHeroThought(lang === 'RU' ? 'Архив успешно распакован! Откроем папку AVALON...' : 'Archive successfully extracted! Opening AVALON...');
                onDone();
              }, 500);
            }
          }, 250);
        };

        const continueBtn = errorDialog.querySelector('#winrarErrorContinueBtn') as HTMLElement;
        continueBtn?.addEventListener('click', continueExtract);

        // Automated cutscene cursor movement to [Да]
        setTimeout(async () => {
          const fakeCursor = document.getElementById('cinematicCursor') || document.getElementById('cutsceneFakeCursor') || document.getElementById('cinematicFakeCursor');
          if (fakeCursor && continueBtn) {
            const btnRect = continueBtn.getBoundingClientRect();
            fakeCursor.style.transition = 'transform 600ms cubic-bezier(0.22, 0.8, 0.36, 1)';
            fakeCursor.style.transform = `translate(${btnRect.left + btnRect.width / 2}px, ${btnRect.top + btnRect.height / 2}px)`;
            await new Promise(r => setTimeout(r, 800));
            continueBtn.style.background = '#005a9e';
            await new Promise(r => setTimeout(r, 150));
            continueBtn.style.background = '#0078d4';
            continueExtract();
          }
        }, 800);
      }
    }
  }, 750);
}
