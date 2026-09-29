// src/developer.ts
import { initLanguageSelection } from './system';
import { initMainMenu } from './menu';
import { initPhone, renderPhoneUI, initWindowsDesktop } from './desktop';
import { openClimaxFriendChat } from './chat';

let isMenuOpen = false;

export function initDeveloperTools() {
  const keysPressed: { [key: string]: boolean } = {};

  window.addEventListener('keydown', (e) => {
    keysPressed[e.key.toLowerCase()] = true;

    // F + G shortcut (and fallback G + J)
    if ((keysPressed['f'] && keysPressed['g']) || (keysPressed['g'] && keysPressed['j'])) {
      toggleModMenu();
      keysPressed['f'] = false;
      keysPressed['g'] = false;
      keysPressed['j'] = false;
    }
  });

  window.addEventListener('keyup', (e) => {
    keysPressed[e.key.toLowerCase()] = false;
  });
}

function toggleModMenu() {
  if (isMenuOpen) {
    closeModMenu();
  } else {
    openModMenu();
  }
}

function openModMenu() {
  if (document.getElementById('dev-mod-menu')) return;
  isMenuOpen = true;

  const menu = document.createElement('div');
  menu.id = 'dev-mod-menu';
  menu.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(10, 15, 30, 0.98);
    border: 2px solid #38bdf8;
    padding: 24px 30px;
    z-index: 2147483647;
    color: #fff;
    font-family: 'Segoe UI', 'JetBrains Mono', monospace;
    border-radius: 12px;
    box-shadow: 0 0 50px rgba(56, 189, 248, 0.4), 0 20px 60px rgba(0,0,0,0.9);
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 380px;
    max-height: 90vh;
    overflow-y: auto;
  `;

  menu.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      <h2 style="margin: 0; color: #38bdf8; font-size: 1.1rem; font-weight: 700; letter-spacing: 1px;">⚙️ ПАНЕЛЬ РАЗРАБОТЧИКА (F+G)</h2>
      <span style="font-size: 0.75rem; color: #94a3b8;">F+G для закрытия</span>
    </div>
    
    <div style="font-size: 0.72rem; color: #94a3b8; margin-bottom: 8px;">Быстрый переход к любой сцене:</div>

    <button class="dev-btn" data-stage="menu">1. Главное меню</button>
    <button class="dev-btn" data-stage="phone_intro">2. Пролог: Телефон и чат</button>
    <button class="dev-btn" data-stage="desktop">3. Рабочий стол Windows</button>
    <button class="dev-btn" data-stage="avalon_rar">4. Ошибка AVALON.rar (CRC-32)</button>
    <button class="dev-btn" data-stage="defender_trojan">5. Защитник Windows & Троян</button>
    <button class="dev-btn" data-stage="matrix_scene">6. Перезагрузка & Матрица</button>
    <button class="dev-btn" data-stage="climax_chat">7. Финал: Телефон & Чат с другом</button>
    <button class="dev-btn" data-stage="ending_1" style="border-color: #38bdf8; color: #38bdf8;">8. Концовка 1 (Пробуждение / Сон)</button>
    <button class="dev-btn" data-stage="ending_2" style="border-color: #fbbf24; color: #fbbf24;">9. Концовка 2 (Предательство)</button>
    <button class="dev-btn" data-stage="ending_3" style="border-color: #f87171; color: #f87171;">10. Концовка 3 (Слияние с ядром)</button>
    
    <button class="dev-btn" style="margin-top: 10px; background: rgba(239,68,68,0.2); border-color: #ef4444;" id="close-dev-menu">ЗАКРЫТЬ</button>

    <style>
      .dev-btn {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: #fff;
        padding: 8px 12px;
        cursor: pointer;
        font-family: inherit;
        font-size: 0.82rem;
        border-radius: 6px;
        transition: all 0.15s;
        text-align: left;
      }
      .dev-btn:hover {
        background: rgba(56, 189, 248, 0.2);
        border-color: #38bdf8;
        transform: translateX(4px);
      }
    </style>
  `;

  document.body.appendChild(menu);

  menu.querySelectorAll('.dev-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const stage = (btn as HTMLElement).dataset.stage;
      if (stage) {
        jumpToStage(stage);
      } else if (btn.id === 'close-dev-menu') {
        closeModMenu();
      }
    });
  });
}

function closeModMenu() {
  const menu = document.getElementById('dev-mod-menu');
  if (menu) {
    menu.remove();
  }
  isMenuOpen = false;
}

function jumpToStage(stage: string) {
  // Stop all audio
  const audios = document.querySelectorAll('audio');
  audios.forEach(a => {
    try {
      a.pause();
      a.currentTime = 0;
      a.remove();
    } catch {}
  });

  // Clean overlays
  document.querySelectorAll('#matrixRainContainer, #finalEndingOverlay, #windowsRebootLoadingScreen, #cutsceneBlackout, #act2BlackoutOverlay, #climaxChoiceContainer, #heroThoughtBox, #winrarQuestModal, #questGuidePrompt, #winrarInstallerOverlay').forEach(el => el.remove());

  // Clear app
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = '';
  }

  document.body.style.background = '#000';
  document.body.style.overflow = 'hidden';
  document.body.style.filter = '';
  document.body.style.cursor = 'default';

  closeModMenu();

  switch (stage) {
    case 'lang':
      initLanguageSelection();
      break;
    case 'menu':
      initMainMenu();
      break;
    case 'phone_intro':
      initPhone();
      break;
    case 'phone_home':
      renderPhoneUI();
      setTimeout(() => {
        const lockScreen = document.getElementById('lockScreen');
        const homeScreen = document.getElementById('homeScreen');
        const phoneScreen = document.getElementById('phoneScreen');
        if (lockScreen && homeScreen && phoneScreen) {
          lockScreen.style.display = 'none';
          homeScreen.style.opacity = '1';
          phoneScreen.style.opacity = '1';
        }
      }, 100);
      break;
    case 'desktop':
      initWindowsDesktop();
      break;
    case 'avalon_rar':
      initWindowsDesktop();
      setTimeout(() => {
        import('./winrarQuest').then(q => {
          q.showExtractProgressModal(() => {});
        });
      }, 300);
      break;
    case 'defender_trojan':
      initWindowsDesktop();
      setTimeout(() => {
        import('./avalonCutscene').then(c => {
          c.startDefenderTrojanPhase();
        });
      }, 300);
      break;
    case 'matrix_scene':
      import('./avalonCutscene').then(c => {
        c.startMatrixUndertaleCutscene();
      });
      break;
    case 'climax_chat':
      renderPhoneUI();
      setTimeout(() => {
        const lockScreen = document.getElementById('lockScreen');
        const homeScreen = document.getElementById('homeScreen');
        const phoneScreen = document.getElementById('phoneScreen');
        if (lockScreen && homeScreen && phoneScreen) {
          lockScreen.style.display = 'none';
          homeScreen.style.opacity = '1';
          phoneScreen.style.opacity = '1';
        }
        openClimaxFriendChat();
      }, 100);
      break;
    case 'ending_1':
      import('./chat').then(c => {
        c.renderEndingScreen(1);
      });
      break;
    case 'ending_2':
      import('./chat').then(c => {
        c.renderEndingScreen(2);
      });
      break;
    case 'ending_3':
      import('./chat').then(c => {
        c.renderEndingScreen(3);
      });
      break;
  }
}
