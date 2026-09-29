import { getLanguage } from './system';

export function showPhoneAlert(message: string, container?: HTMLElement) {
  const activeApp = container || (document.querySelector('.app-full-screen[style*="display: flex"]') as HTMLElement) || document.getElementById('phoneScreen');
  if (!activeApp) return;

  // Clear existing alerts
  document.querySelectorAll('.phone-alert').forEach(a => a.remove());

  const alertBox = document.createElement('div');
  alertBox.className = 'phone-alert';
  alertBox.style.cssText = `
    position: absolute; bottom: 80px; left: 50%; transform: translateX(-50%) translateY(20px);
    background: rgba(40,40,40,0.95); color: #fff; padding: 12px 24px;
    border-radius: 20px; font-size: 0.9rem; font-family: 'Inter', sans-serif;
    z-index: 9999; box-shadow: 0 4px 15px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1);
    opacity: 0; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    white-space: nowrap; max-width: 80%; text-overflow: ellipsis; overflow: hidden; pointer-events: none;
  `;
  alertBox.innerText = message;
  activeApp.appendChild(alertBox);

  requestAnimationFrame(() => {
    alertBox.style.opacity = '1';
    alertBox.style.transform = 'translateX(-50%) translateY(0)';
  });

  setTimeout(() => {
    alertBox.style.opacity = '0';
    alertBox.style.transform = 'translateX(-50%) translateY(10px)';
    setTimeout(() => alertBox.remove(), 300);
  }, 2500);
}

export function createPhoneApp(appId: string, title: string, contentHtml: string): HTMLElement | null {
  const screen = document.getElementById('phoneScreen');
  if (!screen) return null;

  let appContainer = document.getElementById(appId);
  if (appContainer) {
      appContainer.style.display = 'flex';
      setTimeout(() => appContainer!.style.opacity = '1', 10);
      return appContainer;
  }

  appContainer = document.createElement('div');
  appContainer.id = appId;
  appContainer.className = 'app-full-screen';
  appContainer.style.cssText = `
    position: absolute; inset: 0; background: #000; z-index: 500;
    display: flex; flex-direction: column; color: #fff;
    font-family: 'Inter', sans-serif; opacity: 0; transition: opacity 0.3s ease;
  `;

  const header = document.createElement('div');
  header.className = 'app-header';
  header.style.cssText = `
    height: 100px; padding-top: 40px; display: flex; align-items: center;
    padding-left: 20px; padding-right: 20px; border-bottom: 1px solid rgba(255,255,255,0.1);
    background: rgba(10,10,10,0.9); backdrop-filter: blur(10px);
  `;
  header.innerHTML = `<h1 class="app-title" style="font-size: 1.5rem; font-weight: 700;">${title}</h1>`;
  appContainer.appendChild(header);

  const contentArea = document.createElement('div');
  contentArea.className = 'app-content-area';
  contentArea.style.cssText = `flex: 1; overflow-y: auto; padding: 20px; position: relative;`;
  contentArea.innerHTML = contentHtml;
  appContainer.appendChild(contentArea);

  const homeBar = document.createElement('div');
  homeBar.style.cssText = `height: 40px; display: flex; justify-content: center; align-items: center; cursor: pointer; background: transparent;`;
  homeBar.innerHTML = `<div style="width: 120px; height: 5px; background: #555; border-radius: 5px;"></div>`;
  homeBar.addEventListener('click', () => {
    // Remove all alerts immediately so nothing leaks to home screen
    document.querySelectorAll('.phone-alert').forEach(a => a.remove());
    appContainer!.style.opacity = '0';
    setTimeout(() => appContainer!.style.display = 'none', 300);
  });
  appContainer.appendChild(homeBar);

  screen.appendChild(appContainer);
  setTimeout(() => appContainer!.style.opacity = '1', 10);
  
  return appContainer;
}

export function openPhoneFiles() {
  const lang = getLanguage();
  const mainListHtml = `
    <div id="filesRootList" style="display: flex; flex-direction: column; gap: 15px;">
      <div id="fileDocBtn" style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px; display: flex; align-items: center; gap: 15px; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">
        <div style="width: 40px; height: 40px; background: #3b82f6; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
          <i class="bi bi-file-earmark-text" style="font-size: 20px; color: #fff;"></i>
        </div>
        <div>
          <div style="font-weight: bold;">Document.pdf</div>
          <div style="font-size: 0.8rem; color: #aaa;">12 KB - 10:45</div>
        </div>
      </div>
      <div id="fileDirBtn" style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px; display: flex; align-items: center; gap: 15px; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">
        <div style="width: 40px; height: 40px; background: #eab308; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
          <i class="bi bi-folder-fill" style="font-size: 20px; color: #fff;"></i>
        </div>
        <div>
          <div style="font-weight: bold;">Downloads</div>
          <div style="font-size: 0.8rem; color: #aaa;">0 items</div>
        </div>
      </div>
    </div>
  `;

  const appContainer = createPhoneApp('filesApp', lang === 'RU' ? 'Файлы' : 'Files', mainListHtml);
  if (!appContainer) return;

  const header = appContainer.querySelector('.app-header') as HTMLElement;
  const contentArea = appContainer.querySelector('.app-content-area') as HTMLElement;

  const renderRoot = () => {
    if (header) {
      header.innerHTML = `<h1 class="app-title" style="font-size: 1.5rem; font-weight: 700;">${lang === 'RU' ? 'Файлы' : 'Files'}</h1>`;
    }
    if (contentArea) {
      contentArea.innerHTML = mainListHtml;
      bindRootEvents();
    }
  };

  const renderFolder = (folderName: string) => {
    if (header) {
      header.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px; width: 100%;">
          <button id="filesBackBtn" style="background: none; border: none; color: #60a5fa; font-size: 1.1rem; cursor: pointer; display: flex; align-items: center; gap: 4px; padding: 4px 8px; margin-left: -8px;">
            <i class="bi bi-chevron-left" style="font-size: 1.2rem;"></i>
            <span>${lang === 'RU' ? 'Назад' : 'Back'}</span>
          </button>
          <h1 class="app-title" style="font-size: 1.3rem; font-weight: 700; margin: 0;">${folderName}</h1>
        </div>
      `;
      const backBtn = header.querySelector('#filesBackBtn');
      backBtn?.addEventListener('click', () => {
        renderRoot();
      });
    }

    if (contentArea) {
      contentArea.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 350px; color: #666; text-align: center;">
          <i class="bi bi-folder2-open" style="font-size: 54px; color: #444; margin-bottom: 12px;"></i>
          <div style="font-size: 1.15rem; color: #bbb; font-weight: 600;">${lang === 'RU' ? 'Пусто' : 'Empty'}</div>
          <div style="font-size: 0.85rem; color: #777; margin-top: 6px;">${lang === 'RU' ? 'Папка пуста' : 'Folder is empty'}</div>
        </div>
      `;
    }
  };

  const bindRootEvents = () => {
    const fileDocBtn = contentArea?.querySelector('#fileDocBtn');
    if (fileDocBtn) {
      fileDocBtn.addEventListener('click', () => {
        showPhoneAlert(lang === 'RU' ? 'Файл поврежден' : 'File corrupted', contentArea);
      });
    }

    const fileDirBtn = contentArea?.querySelector('#fileDirBtn');
    if (fileDirBtn) {
      fileDirBtn.addEventListener('click', () => {
        renderFolder('Downloads');
      });
    }
  };

  bindRootEvents();
}

export function openPhoneGallery() {
  const lang = getLanguage();
  const html = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
      <div style="aspect-ratio: 1; background: url('/assets/images/phone/gallery/1.jpg') center/cover; background-color: #333; border-radius: 10px; cursor: pointer;"></div>
      <div style="aspect-ratio: 1; background: url('/assets/images/phone/gallery/2.jpg') center/cover; background-color: #333; border-radius: 10px; cursor: pointer;"></div>
      <div style="aspect-ratio: 1; background: url('/assets/images/phone/gallery/3.jpg') center/cover; background-color: #333; border-radius: 10px; cursor: pointer;"></div>
      <div style="aspect-ratio: 1; background: url('/assets/images/phone/gallery/4.jpg') center/cover; background-color: #333; border-radius: 10px; cursor: pointer;"></div>
      <div style="aspect-ratio: 1; background: url('/assets/images/phone/gallery/5.jpg') center/cover; background-color: #333; border-radius: 10px; cursor: pointer;"></div>
      <div style="aspect-ratio: 1; background: url('/assets/images/phone/gallery/video.gif') center/cover; background-color: #000; border-radius: 10px; cursor: pointer;"></div>
    </div>
  `;
  createPhoneApp('galleryApp', lang === 'RU' ? 'Галерея' : 'Gallery', html);
}

export function openPhoneSettings() {
  const lang = getLanguage();
  const html = `
    <div style="display: flex; flex-direction: column; gap: 1px; background: rgba(255,255,255,0.05); border-radius: 10px; overflow: hidden;">
      <div style="padding: 15px; display: flex; align-items: center; gap: 15px; background: rgba(255,255,255,0.05);">
        <i class="bi bi-wifi" style="font-size: 20px; color: #60a5fa;"></i>
        <span style="flex: 1;">Wi-Fi</span>
        <span style="color: #aaa; font-size: 0.9rem;">On</span>
      </div>
      <div style="padding: 15px; display: flex; align-items: center; gap: 15px; background: rgba(255,255,255,0.05);">
        <i class="bi bi-bluetooth" style="font-size: 20px; color: #3b82f6;"></i>
        <span style="flex: 1;">Bluetooth</span>
        <span style="color: #aaa; font-size: 0.9rem;">Off</span>
      </div>
      <div style="padding: 15px; display: flex; align-items: center; gap: 15px; background: rgba(255,255,255,0.05);">
        <i class="bi bi-bell-fill" style="font-size: 20px; color: #ef4444;"></i>
        <span style="flex: 1;">${lang === 'RU' ? 'Уведомления' : 'Notifications'}</span>
      </div>
    </div>
  `;
  createPhoneApp('settingsApp', lang === 'RU' ? 'Настройки' : 'Settings', html);
}

export function openPhoneMessages() {
  const lang = getLanguage();
  const html = `
    <div style="display: flex; flex-direction: column; gap: 1px;">
      <div style="padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.1);">
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
          <span style="font-weight: bold;">+1 234 567 890</span>
          <span style="font-size: 0.8rem; color: #aaa;">09:41</span>
        </div>
        <div style="color: #aaa; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          ${lang === 'RU' ? 'Ваш код подтверждения: 123456' : 'Your verification code is: 123456'}
        </div>
      </div>
    </div>
  `;
  createPhoneApp('messagesApp', lang === 'RU' ? 'Сообщения' : 'Messages', html);
}

export function openPhoneCalls() {
  const lang = getLanguage();
  const html = `
    <div style="display: flex; flex-direction: column; gap: 1px;">
      <div style="padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; gap: 15px;">
        <i class="bi bi-telephone-inbound-fill" style="color: #ef4444; font-size: 20px;"></i>
        <div style="flex: 1;">
          <div style="font-weight: bold; color: #ef4444;">${lang === 'RU' ? 'Неизвестный номер' : 'Unknown Number'}</div>
          <div style="font-size: 0.8rem; color: #aaa;">${lang === 'RU' ? 'Вчера' : 'Yesterday'}</div>
        </div>
      </div>
    </div>
  `;
  createPhoneApp('callsApp', lang === 'RU' ? 'Вызовы' : 'Calls', html);
}
