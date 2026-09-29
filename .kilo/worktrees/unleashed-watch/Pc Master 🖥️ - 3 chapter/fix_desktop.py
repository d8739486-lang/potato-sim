import os
import sys

filepath = 'src/desktop.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Let's restore from the last good backup or just rewrite the missing pieces cleanly.
# The `openAppWindow` function is broken. Let's find the start of `openAppWindow` and the start of `getRecycleBinHtml` and replace everything in between.

import re

# Find openAppWindow
start_match = re.search(r'function openAppWindow\(', content)
if not start_match:
    print("Cannot find openAppWindow")
    sys.exit(1)

# Find getRecycleBinHtml
end_match = re.search(r'const getRecycleBinHtml = \(\) => `', content)
if not end_match:
    print("Cannot find getRecycleBinHtml")
    sys.exit(1)

new_content = content[:start_match.start()] + """function openAppWindow(id: string, title: string, iconHtml: string, htmlContent: string, customLogic?: (body: HTMLElement) => void): void {
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
    overlay.style.cssText = \`position: absolute; inset: 0; background: transparent; display: flex; align-items: center; justify-content: center; z-index: \${getTopZIndex()};\`;

    const contentContainer = document.createElement('div');
    contentContainer.style.cssText = 'width: 800px; height: 500px; background: rgba(20,20,20,0.95); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.5);';

    const header = document.createElement('div');
    header.style.cssText = 'height: 40px; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; border-bottom: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.4);';

    const titleDiv = document.createElement('div');
    titleDiv.style.cssText = 'display: flex; align-items: center; gap: 10px; font-size: 0.85rem; opacity: 0.9; font-weight: 500;';
    
    // Convert icon size for header
    const headerIconHtml = iconHtml.replace(/font-size:\s*\\d+px;?/g, 'font-size: 16px; margin-bottom: 0;');
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
    taskbarItem.className = 'taskbar-item';
    taskbarItem.style.background = 'rgba(255, 255, 255, 0.2)';
    const tbIconHtml = iconHtml.replace(/font-size:\s*\\d+px;?/g, 'font-size: 20px; margin-bottom: 0;');
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

  // App Contents & Logics
  const getThisPcHtml = () => `
    <div style="display: flex; flex: 1;">
      <div style="width: 250px; border-right: 1px solid rgba(255,255,255,0.1); padding: 16px; background: rgba(0,0,0,0.2);">
        <!-- Sidebar -->
        <div style="margin-bottom: 20px;">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px; cursor:pointer;"><i class="bi bi-pc-display" style="font-size: 16px; color: #60a5fa;"></i> <span>${lang === 'RU' ? 'Этот компьютер' : 'This PC'}</span></div>
          <div style="padding-left: 24px; font-size: 0.85rem; opacity: 0.8; display:flex; flex-direction:column; gap:12px;">
            <div style="display:flex; align-items:center; gap:6px; cursor:pointer;"><i class="bi bi-device-hdd-fill" style="font-size: 14px; color: #64748b;"></i> System (C:)</div>
            <div style="display:flex; align-items:center; gap:6px; cursor:pointer;"><i class="bi bi-device-hdd-fill" style="font-size: 14px; color: #64748b;"></i> Новый том (F:)</div>
          </div>
        </div>
      </div>
      <div style="flex: 1; padding: 24px;">
        <div style="font-size: 1.1rem; margin-bottom: 24px; font-weight: 500;">${lang === 'RU' ? 'Устройства и диски' : 'Devices and drives'}</div>
        <div style="display: flex; gap: 20px; flex-wrap: wrap;">
          <div style="display: flex; gap: 12px; width: 280px; background: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px; transition: background 0.2s; cursor: pointer;" onmouseenter="this.style.background='rgba(255,255,255,0.1)'" onmouseleave="this.style.background='rgba(255,255,255,0.05)'">
            <i class="bi bi-device-hdd-fill" style="font-size: 32px; color: #ef4444;"></i>
            <div style="flex: 1;">
              <div style="font-size: 0.9rem; margin-bottom: 4px; color: #ef4444;">System (C:)</div>
              <div style="height: 12px; background: rgba(255,255,255,0.1); border-radius: 6px; overflow: hidden; margin-bottom: 4px;">
                <div style="width: 93%; height: 100%; background: #ef4444;"></div>
              </div>
              <div style="font-size: 0.75rem; opacity: 0.7; color: #fca5a5;">62,4 GB free of 953 GB</div>
            </div>
          </div>
          <div style="display: flex; gap: 12px; width: 280px; background: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px; transition: background 0.2s; cursor: pointer;" onmouseenter="this.style.background='rgba(255,255,255,0.1)'" onmouseleave="this.style.background='rgba(255,255,255,0.05)'">
            <i class="bi bi-device-hdd-fill" style="font-size: 32px; color: #64748b;"></i>
            <div style="flex: 1;">
              <div style="font-size: 0.9rem; margin-bottom: 4px;">Новый том (F:)</div>
              <div style="height: 12px; background: rgba(255,255,255,0.1); border-radius: 6px; overflow: hidden; margin-bottom: 4px;">
                <div style="width: 51%; height: 100%; background: #0078d4;"></div>
              </div>
              <div style="font-size: 0.75rem; opacity: 0.7;">45,6 GB free of 94,3 GB</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  \`;

  const getPersonalHtml = () => \`
    <div style="flex: 1; display: flex; align-items: center; justify-content: center;">
      <div id="passwordContainer" style="background: rgba(0,0,0,0.6); padding: 32px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); text-align: center; transition: all 0.2s; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
        <div style="font-size: 1.2rem; margin-bottom: 16px;">\${lang === 'RU' ? 'Введите пароль' : 'Enter Password'}</div>
        <div style="display: flex; gap: 8px;">
          <input type="password" id="personalPassword" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #fff; padding: 8px 12px; border-radius: 6px; outline: none; width: 200px;">
          <button id="personalSubmit" style="background: #0078d4; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">OK</button>
        </div>
      </div>
      <style>
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-10px); }
          40%, 80% { transform: translateX(10px); }
        }
        .shake-error {
          animation: shake 0.4s ease-in-out;
          border-color: #ff4444 !important;
          box-shadow: 0 0 15px rgba(255, 68, 68, 0.4) !important;
        }
      </style>
    </div>
  \`;

  const getPersonalLogic = () => (body: HTMLElement) => {
    const submitBtn = body.querySelector('#personalSubmit');
    const container = body.querySelector('#passwordContainer');
    submitBtn?.addEventListener('click', () => {
      container?.classList.remove('shake-error');
      void (container as HTMLElement).offsetWidth; // trigger reflow
      container?.classList.add('shake-error');
    });
  };

  const getProjectsHtml = () => \`
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
  \`;
  const getProjectsLogic = () => (body: HTMLElement) => {
    body.querySelectorAll('.archive-item').forEach(el => {
      el.addEventListener('dblclick', () => {
        showWindowsError(lang === 'RU' ? 'Ошибка приложения' : 'Application Error', lang === 'RU' ? 'Установите WinRAR для открытия архивов!' : 'Please install WinRAR to open archives!');
      });
    });
  };

  """ + content[end_match.start():]

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Fixed!")
