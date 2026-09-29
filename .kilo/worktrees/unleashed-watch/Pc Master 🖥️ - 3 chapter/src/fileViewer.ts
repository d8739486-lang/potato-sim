import { getLanguage } from './system';
import { generateArchivalPhotoDataUrl } from './photoRenderer';

export interface IViewerFile {
  name: string;
  type: 'pdf' | 'image' | 'text' | 'audio' | 'code' | 'system';
  path?: string;
  title: string;
  date?: string;
  size?: string;
  content?: string;
  imageSrc?: string;
  audioSrc?: string;
}

const MINIMIZE_ICON = `<svg width="10" height="1" viewBox="0 0 10 1" style="pointer-events:none;"><rect width="10" height="1" fill="currentColor"/></svg>`;
const MAXIMIZE_ICON = `<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1" style="pointer-events:none;"><rect x="0.5" y="0.5" width="9" height="9"/></svg>`;
const RESTORE_ICON = `<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1" style="pointer-events:none;"><rect x="2.5" y="0.5" width="7" height="7"/><polyline points="0.5,2.5 0.5,9.5 7.5,9.5"/></svg>`;
const CLOSE_ICON = `<svg width="10" height="10" viewBox="0 0 10 10" stroke="currentColor" stroke-width="1.2" style="pointer-events:none;"><line x1="1" y1="1" x2="9" y2="9"/><line x1="9" y1="1" x2="1" y2="9"/></svg>`;

/**
 * Universal Windows File Viewer (Photos, PDF Articles, Notepad, Audio Logs)
 * Opens in Clean Fullscreen (above Taskbar) by default, with pixel-perfect Win11 controls & generous padding
 */
export function openUniversalFileViewer(file: IViewerFile): void {
  const lang = getLanguage();
  const fileId = `fileViewer_${file.name.replace(/[^a-zA-Z0-9]/g, '_')}`;
  const existing = document.getElementById(fileId);
  
  if (existing) {
    if (existing.style.display === 'none') {
      existing.style.display = 'flex';
      requestAnimationFrame(() => {
        existing.style.opacity = '1';
        existing.style.transform = 'scale(1)';
      });
    }
    existing.style.zIndex = `${Date.now()}`;
    return;
  }

  // Play opening click
  try {
    const sfx = new Audio('/assets/sounds/sfx/main/click.wav');
    sfx.volume = 0.4;
    sfx.play().catch(() => {});
  } catch {}

  const win = document.createElement('div');
  win.id = fileId;
  win.className = 'universal-file-window';
  win.style.cssText = `
    position: fixed; top: 0px; left: 0px; width: 100vw; max-width: 100vw; height: calc(100vh - 48px); max-height: calc(100vh - 48px);
    margin: 0px; padding: 0px; box-sizing: border-box;
    background: rgba(18, 18, 18, 0.98); backdrop-filter: blur(30px);
    border: none; border-bottom: 1px solid rgba(255, 255, 255, 0.1); border-radius: 0px;
    box-shadow: none; color: #fff;
    font-family: 'Segoe UI Variable Text', 'Segoe UI', system-ui, sans-serif; z-index: 999990;
    display: flex; flex-direction: column; overflow: hidden; opacity: 1; pointer-events: auto;
    transform: none;
    transition: width 0.2s cubic-bezier(0.16, 1, 0.3, 1), height 0.2s cubic-bezier(0.16, 1, 0.3, 1), top 0.2s, left 0.2s, border-radius 0.2s, opacity 0.15s ease;
  `;

  // Title Bar based on file type
  let iconHtml = '<i class="bi bi-file-earmark-text" style="color: #60a5fa; font-size: 15px;"></i>';
  let appName = 'Блокнот';
  if (file.type === 'pdf') {
    iconHtml = '<i class="bi bi-file-earmark-pdf-fill" style="color: #f87171; font-size: 15px;"></i>';
    appName = lang === 'RU' ? 'Просмотр документов PDF' : 'PDF Document Viewer';
  } else if (file.type === 'image') {
    iconHtml = '<i class="bi bi-image" style="color: #e2e8f0; font-size: 15px;"></i>';
    appName = lang === 'RU' ? 'Фотографии Windows (Ч/Б Архив)' : 'Windows Photos';
  } else if (file.type === 'audio') {
    iconHtml = '<i class="bi bi-music-note-beamed" style="color: #a78bfa; font-size: 15px;"></i>';
    appName = lang === 'RU' ? 'Проигрыватель Windows Media' : 'Windows Media Player';
  } else if (file.type === 'code' || file.type === 'system') {
    iconHtml = '<i class="bi bi-file-earmark-code" style="color: #c084fc; font-size: 15px;"></i>';
    appName = 'Code Editor';
  }

  win.innerHTML = `
    <style>
      #${fileId} .viewer-content-body::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      #${fileId} .viewer-content-body::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.35);
      }
      #${fileId} .viewer-content-body::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.22);
        border-radius: 4px;
      }
      #${fileId} .viewer-content-body::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.4);
      }
    </style>

    <!-- Window Header -->
    <div class="viewer-win-header" style="height: 38px; background: rgba(18, 18, 18, 0.98); display: flex; align-items: center; justify-content: space-between; padding-left: 14px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); user-select: none; cursor: default;">
      <div style="display: flex; align-items: center; gap: 8px; font-size: 12.5px; font-weight: 400; color: #ddd; pointer-events: none;">
        ${iconHtml}
        <span>${file.name} — ${appName}</span>
      </div>
      <div style="display: flex; align-items: center; height: 100%;">
        <button class="win-btn win-min-btn" title="Свернуть" style="width: 46px; height: 100%; background: transparent; border: none; color: #ccc; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.15s;" onmouseover="this.style.background='rgba(255,255,255,0.08)'; this.style.color='#fff'" onmouseout="this.style.background='transparent'; this.style.color='#ccc'">${MINIMIZE_ICON}</button>
        <button class="win-btn win-max-btn" title="Восстановить" style="width: 46px; height: 100%; background: transparent; border: none; color: #ccc; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.15s;" onmouseover="this.style.background='rgba(255,255,255,0.08)'; this.style.color='#fff'" onmouseout="this.style.background='transparent'; this.style.color='#ccc'">${RESTORE_ICON}</button>
        <button class="win-btn win-close-btn" title="Закрыть" style="width: 46px; height: 100%; background: transparent; border: none; color: #ccc; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.15s;" onmouseover="this.style.background='#e81123'; this.style.color='#fff'" onmouseout="this.style.background='transparent'; this.style.color='#ccc'">${CLOSE_ICON}</button>
      </div>
    </div>

    <!-- Viewer Body with Custom Scrollbar -->
    <div class="viewer-content-body" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; background: #121212; position: relative;">
      ${renderViewerContent(file, lang)}
    </div>
  `;

  document.body.appendChild(win);

  // 1. Create Taskbar Item with Smooth CSS Animation
  const taskbarCenter = document.querySelector('.taskbar-center');
  let taskbarItem: HTMLElement | null = null;
  if (taskbarCenter) {
    taskbarItem = document.createElement('div');
    taskbarItem.className = 'taskbar-item dynamic';
    taskbarItem.id = `tb_${fileId}`;
    taskbarItem.style.cssText = 'position: relative; width: 40px; height: 40px; border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; background: rgba(255,255,255,0.15); border-bottom: 2px solid #38bdf8; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); animation: taskbarItemIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;';
    taskbarItem.innerHTML = iconHtml.replace(/font-size:\s*\d+px;/g, 'font-size: 20px; margin-bottom: 0;');
    taskbarItem.title = file.name;

    taskbarItem.addEventListener('click', () => {
      if (win.style.display === 'none') {
        win.style.display = 'flex';
        requestAnimationFrame(() => {
          win.style.opacity = '1';
          win.style.transform = 'scale(1)';
        });
        taskbarItem!.style.background = 'rgba(255,255,255,0.15)';
        taskbarItem!.style.borderBottom = '2px solid #38bdf8';
        win.style.zIndex = `${Date.now()}`;
      } else {
        win.style.opacity = '0';
        win.style.transform = 'scale(0.95) translateY(12px)';
        setTimeout(() => {
          win.style.display = 'none';
        }, 180);
        taskbarItem!.style.background = 'transparent';
        taskbarItem!.style.borderBottom = 'none';
      }
    });

    taskbarCenter.appendChild(taskbarItem);
  }

  // 2. Window Controls Handling (Starts Fullscreen by default!)
  let isMaximized = true;
  let prevRect = { top: '5%', left: '8%', width: '84vw', height: 'calc(100vh - 48px - 10%)', borderRadius: '8px' };

  // Maximize / Restore
  const maxBtn = win.querySelector('.win-max-btn') as HTMLElement;
  const header = win.querySelector('.viewer-win-header') as HTMLElement;

  const toggleMaximize = () => {
    if (!isMaximized) {
      prevRect = {
        top: win.style.top || '5%',
        left: win.style.left || '8%',
        width: win.style.width || '84vw',
        height: win.style.height || 'calc(100vh - 48px - 10%)',
        borderRadius: win.style.borderRadius || '8px'
      };
      win.style.top = '0px';
      win.style.left = '0px';
      win.style.width = '100vw';
      win.style.maxWidth = '100vw';
      win.style.height = 'calc(100vh - 48px)';
      win.style.maxHeight = 'calc(100vh - 48px)';
      win.style.borderRadius = '0px';
      if (header) header.style.cursor = 'default';
      maxBtn.innerHTML = RESTORE_ICON;
      maxBtn.title = 'Восстановить';
      isMaximized = true;
    } else {
      win.style.top = prevRect.top;
      win.style.left = prevRect.left;
      win.style.width = prevRect.width;
      win.style.maxWidth = 'calc(100vw - 32px)';
      win.style.height = prevRect.height;
      win.style.maxHeight = 'calc(100vh - 48px - 10%)';
      win.style.borderRadius = prevRect.borderRadius;
      if (header) header.style.cursor = 'move';
      maxBtn.innerHTML = MAXIMIZE_ICON;
      maxBtn.title = 'Развернуть';
      isMaximized = false;
    }
  };
  maxBtn.addEventListener('click', toggleMaximize);

  // Minimize with Smooth Transition
  const minBtn = win.querySelector('.win-min-btn') as HTMLElement;
  minBtn.addEventListener('click', () => {
    win.style.opacity = '0';
    win.style.transform = 'scale(0.95) translateY(12px)';
    setTimeout(() => {
      win.style.display = 'none';
    }, 180);
    if (taskbarItem) {
      taskbarItem.style.background = 'transparent';
      taskbarItem.style.borderBottom = 'none';
    }
  });

  // Close with Smooth Taskbar Removal
  const closeBtn = win.querySelector('.win-close-btn') as HTMLElement;
  closeBtn.addEventListener('click', () => {
    win.style.opacity = '0';
    win.style.transform = 'scale(0.95)';
    if (taskbarItem) {
      taskbarItem.classList.add('closing');
    }
    setTimeout(() => {
      win.remove();
      if (taskbarItem) taskbarItem.remove();
    }, 200);
  });

  // Dragging support (disabled when maximized!)
  makeDraggable(win, () => isMaximized);
}

function renderViewerContent(file: IViewerFile, lang: string): string {
  if (file.type === 'pdf') {
    // 3X Expanded Investigation Newspaper / Police Dossier
    return `
      <div style="padding: 36px 24px 80px 24px; display: flex; justify-content: center; background: #161616; box-sizing: border-box;">
        <div style="width: 100%; max-width: 720px; background: #fbf9f4; color: #1a1a1a; padding: 46px 52px; box-shadow: 0 12px 50px rgba(0,0,0,0.7); border-radius: 4px; font-family: 'Times New Roman', Times, serif; line-height: 1.7;">
          
          <!-- Newspaper Header & Masthead -->
          <div style="border-bottom: 3px double #111; padding-bottom: 16px; margin-bottom: 24px; text-align: center;">
            <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 4px; color: #555; margin-bottom: 6px;">
              ${lang === 'RU' ? 'ВЕСТНИК СТОЛИЦЫ • СПЕЦИАЛЬНЫЙ ВЫПУСК РАССЛЕДОВАНИЙ' : 'CITY CHRONICLE • SPECIAL INVESTIGATION REPORT'}
            </div>
            <div style="font-size: 28px; font-weight: 900; line-height: 1.15; font-family: 'Georgia', serif; color: #050505;">
              ${file.title}
            </div>
            <div style="font-size: 12px; color: #666; margin-top: 12px; font-style: italic; display: flex; justify-content: space-between; border-top: 1px solid #ddd; padding-top: 6px;">
              <span>${file.date || '14.07.2024'}</span>
              <span>№ 194 (7049) • Тираж изъят</span>
              <span style="color: #b91c1c; font-weight: bold;">[ДЕЛО #A-7049 / ЗАСЕКРЕЧЕНО]</span>
            </div>
          </div>

          <!-- Newspaper Multi-Column / Multi-Chapter Body -->
          <div style="font-size: 14px; color: #222; text-align: justify;">
            ${file.content || ''}
          </div>

          <!-- Newspaper Footer -->
          <div style="margin-top: 36px; border-top: 2px solid #222; padding-top: 14px; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #555; font-family: 'Segoe UI', sans-serif;">
            <div>
              <strong>Архив следственного управления</strong> • Отдел киберразведки
            </div>
            <div style="background: rgba(239,68,68,0.12); border: 1px solid #ef4444; color: #b91c1c; font-weight: bold; padding: 4px 12px; border-radius: 3px; font-size: 10.5px; letter-spacing: 1px;">
              ЗАКРЫТЫЙ МАТЕРИАЛ ДЕЛА
            </div>
          </div>

        </div>
      </div>
    `;
  }

  if (file.type === 'image') {
    // High-Definition Photorealistic 35mm Analog Photo
    const imgSrc = generateArchivalPhotoDataUrl(file.name);

    return `
      <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 28px; background: #0c0c0d; box-sizing: border-box;">
        <div style="position: relative; background: #fdfdfd; padding: 14px 14px 44px 14px; box-shadow: 0 20px 65px rgba(0,0,0,0.95); border-radius: 3px; max-width: 92%; max-height: 85%; display: flex; flex-direction: column; align-items: center;">
          
          <!-- B&W Photographic Image Frame -->
          <div style="position: relative; width: 560px; max-width: 100%; height: 380px; background: #111; overflow: hidden; display: flex; align-items: center; justify-content: center;">
            <img src="${imgSrc}" alt="${file.title}" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
          </div>

          <!-- Polaroid Vintage Bottom Caption -->
          <div style="position: absolute; bottom: 12px; left: 18px; right: 18px; display: flex; justify-content: space-between; align-items: center; font-family: 'Courier New', monospace; font-size: 11.5px; color: #333;">
            <span style="font-weight: bold; color: #111;">${file.title}</span>
            <span style="color: #666;">${file.date || '18.08.1999'}</span>
          </div>
        </div>

        <div style="margin-top: 18px; font-size: 12px; color: #777; font-family: 'Segoe UI', sans-serif;">
          Чёрно-белый фотоархив • Плёнка 35mm • Архивный снимок
        </div>
      </div>
    `;
  }

  if (file.type === 'audio') {
    return `
      <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 36px; background: radial-gradient(circle at 50% 30%, #1e1e24 0%, #0a0a0c 100%);">
        <div style="width: 90px; height: 90px; border-radius: 50%; background: rgba(56, 189, 248, 0.1); border: 2px solid #38bdf8; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; box-shadow: 0 0 45px rgba(56, 189, 248, 0.28);">
          <i class="bi bi-mic-fill" style="font-size: 40px; color: #38bdf8;"></i>
        </div>
        <div style="font-size: 19px; font-weight: 600; color: #fff; margin-bottom: 6px;">${file.title}</div>
        <div style="font-size: 12.5px; color: #888; margin-bottom: 28px;">${file.date || '14.07.2024'} • Перехваченная аудиозапись</div>
        
        <!-- Audio waveform simulation -->
        <div style="display: flex; gap: 4px; align-items: center; height: 46px; margin-bottom: 28px;">
          ${Array.from({ length: 36 }).map((_, i) => `<div style="width: 4px; height: ${12 + Math.abs(Math.sin(i * 0.45)) * 28}px; background: #38bdf8; border-radius: 2px; opacity: ${0.4 + (i % 4) * 0.15};"></div>`).join('')}
        </div>

        <audio controls style="width: 100%; max-width: 460px;" src="${file.audioSrc || '/assets/sounds/sfx/cutscene/insanity_buildup.wav'}"></audio>
      </div>
    `;
  }

  // Default: Notepad / Code Viewer with comfortable padding
  return `
    <div style="padding: 28px 36px 64px 36px; font-family: 'Consolas', 'Courier New', monospace; font-size: 13.5px; line-height: 1.7; color: #e4e4e7; white-space: pre-wrap; word-break: break-word; background: #121212; min-height: 100%; box-sizing: border-box;">${file.content || ''}</div>
  `;
}



function makeDraggable(el: HTMLElement, isMaximizedFn: () => boolean) {
  const header = el.querySelector('.viewer-win-header') as HTMLElement;
  if (!header) return;

  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let initLeft = 0;
  let initTop = 0;

  header.addEventListener('mousedown', (e) => {
    if (isMaximizedFn()) return; // Lock dragging when in fullscreen maximize!
    if ((e.target as HTMLElement).classList.contains('win-btn')) return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    initLeft = el.offsetLeft;
    initTop = el.offsetTop;

    const onMove = (me: MouseEvent) => {
      if (!isDragging) return;
      el.style.left = `${initLeft + (me.clientX - startX)}px`;
      el.style.top = `${initTop + (me.clientY - startY)}px`;
    };

    const onUp = () => {
      isDragging = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  });
}
