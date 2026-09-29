// src/menu.ts
import { getLanguage } from './system';

// Global settings state
export const settings = {
  masterVolume: 50,
  musicVolume: 40,
  sfxVolume: 60
};

let isMenuLocked = false;

function playAudio(path: string, volume: number): HTMLAudioElement {
  const audio = new Audio(path);
  audio.volume = volume;
  audio.play().catch(e => console.log("Audio play blocked:", e));
  return audio;
}

export function initMainMenu(): void {
  isMenuLocked = true; // Lock buttons initially
  const app = document.getElementById('app') || document.body;
  const lang = getLanguage();
  
  const style = document.createElement('style');
  style.textContent = `
    .menu-container {
      position: fixed; inset: 0; display: flex; flex-direction: column;
      align-items: center; justify-content: center; color: #fff; overflow: hidden;
      background: #000;
      opacity: 0;
      transition: opacity 1.5s ease-in-out;
    }

    .menu-container.visible {
      opacity: 1;
    }

    @keyframes breathing {
      0% { transform: scale(1.1); }
      50% { transform: scale(1.2); }
      100% { transform: scale(1.1); }
    }

    .background-wallpaper {
      position: absolute; inset: -5%;
      background: url('/assets/images/menu_bg.png') center/cover no-repeat;
      filter: blur(10px) brightness(0.4); 
      z-index: -1;
      animation: breathing 30s ease-in-out infinite;
    }

    .menu-container.visible .background-wallpaper {
      transform: scale(1);
    }

    .vignette {
      position: absolute; inset: 0;
      background: radial-gradient(circle at center, transparent 10%, rgba(0,0,0,0.95) 100%);
      pointer-events: none; z-index: 1;
    }

    .scanlines {
      position: absolute; inset: 0;
      background: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0) 100%);
      background-size: 100% 4px; pointer-events: none; z-index: 10; opacity: 0.3;
    }

    .title-group { 
      text-align: center; 
      margin-bottom: 6rem; 
      z-index: 20;
      opacity: 0;
      transform: translateY(20px);
      transition: transform 1.5s cubic-bezier(0.165, 0.84, 0.44, 1), opacity 1.5s ease-out;
    }

    .menu-container.ui-visible .title-group {
      opacity: 1;
      transform: translateY(0);
    }

    .episode-tag {
      font-family: 'JetBrains Mono', monospace;
      font-size: 1rem; letter-spacing: 8px; opacity: 0.9; margin-bottom: 0.8rem;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.7);
    }

    .main-title {
      font-family: 'Orbitron', sans-serif;
      font-size: 5.5rem; font-weight: 900; letter-spacing: 0.8rem; margin: 0;
      text-shadow: 0 0 20px rgba(0,0,0,1), 0 0 40px rgba(255,255,255,0.1);
      line-height: 1;
    }

    .chapter-tag {
      font-family: 'JetBrains Mono', monospace;
      font-size: 1.2rem; letter-spacing: 6px; margin-top: 1.5rem;
      opacity: 0.5; border-top: 1px solid rgba(255,255,255,0.1);
      padding-top: 0.8rem; display: inline-block;
      text-transform: uppercase;
    }

    .menu-buttons { 
      display: flex; 
      flex-direction: column; 
      gap: 1.5rem; 
      width: 320px; 
      z-index: 20;
      opacity: 0;
      transform: translateY(20px);
      transition: transform 1.5s cubic-bezier(0.165, 0.84, 0.44, 1) 0s, opacity 1.5s ease-out 0s;
      align-items: center;
      margin-bottom: 2rem;
    }

    .menu-container.ui-visible .menu-buttons {
      opacity: 1;
      transform: translateY(0);
    }

    .menu-button {
      background: rgba(255,255,255,0.03); 
      border: 1px solid rgba(255,255,255,0.1);
      color: rgba(255,255,255,0.6); 
      padding: 1.2rem; 
      font-family: 'JetBrains Mono', monospace;
      font-size: 1.1rem; 
      cursor: pointer; 
      transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1); 
      text-transform: lowercase;
      backdrop-filter: blur(10px); 
      letter-spacing: 3px;
      border-radius: 4px;
      position: relative;
      overflow: hidden;
      width: 100%;
    }

    .menu-button::after {
      content: '';
      position: absolute;
      top: 0; left: -100%; width: 100%; height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
      transition: 0.6s;
    }

    .menu-button:hover::after {
      left: 100%;
    }

    .bottom-info-group {
      position: absolute;
      bottom: 2rem;
      left: 0;
      right: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      z-index: 20;
      pointer-events: none;
    }

    .update-log-btn {
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.2);
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
      letter-spacing: 2px;
      cursor: pointer;
      text-transform: lowercase;
      transition: color 0.3s ease, letter-spacing 0.3s ease, transform 0.3s ease;
      padding: 0.5rem 1rem;
      pointer-events: auto;
    }

    .menu-container.ui-visible .update-log-btn {
      /* Follows parent .menu-buttons animation */
    }

    .update-log-btn:hover {
      color: rgba(255, 255, 255, 0.6);
      letter-spacing: 4px;
      transform: scale(1.15) !important;
    }

    /* Logs Modal Styles */
    .logs-modal {
      position: fixed;
      bottom: -100%;
      left: 50%;
      transform: translateX(-50%);
      width: 600px;
      height: 70vh;
      background: rgba(10, 10, 15, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-bottom: none;
      border-radius: 20px 20px 0 0;
      backdrop-filter: blur(20px);
      z-index: 150;
      transition: bottom 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
      padding: 3rem;
      color: #fff;
      display: flex;
      flex-direction: column;
    }

    .logs-modal.active {
      bottom: 0;
    }

    .logs-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 1rem;
    }

    .logs-title {
      font-family: 'Orbitron', sans-serif;
      font-size: 1.2rem;
      letter-spacing: 4px;
      color: rgba(255, 255, 255, 0.8);
    }

    .close-logs {
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.3);
      cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
      transition: color 0.3s;
    }

    .close-logs:hover {
      color: #fff;
    }

    .logs-content {
      overflow-y: auto;
      flex: 1;
      padding-right: 1rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.85rem;
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.6);
      display: flex;
      flex-direction: column; /* Newer versions at top */
    }

    .logs-content h2 { color: #fff; font-size: 1rem; margin-top: 2rem; }
    .logs-content h3 { color: rgba(255, 255, 255, 0.8); font-size: 0.9rem; margin-top: 1.5rem; }
    .logs-content ul { list-style: none; padding-left: 1rem; }
    .logs-content li { margin-bottom: 0.5rem; position: relative; }
    .logs-content li::before { content: '>'; position: absolute; left: -1rem; opacity: 0.5; }

    /* Custom Scrollbar for Logs */
    .logs-content::-webkit-scrollbar { width: 4px; }
    .logs-content::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); }
    .logs-content::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.15); border-radius: 2px; }

    .version-tag {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.65rem;
      opacity: 0;
      color: rgba(255, 255, 255, 0.15);
      letter-spacing: 2px;
      transition: opacity 2s ease-out 1.2s;
    }

    .menu-container.ui-visible .version-tag {
      opacity: 1;
    }

    /* Dark Theme Settings Panel */
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.7);
      display: flex; align-items: center; justify-content: center;
      z-index: 100; opacity: 0; transition: opacity 0.3s ease;
      backdrop-filter: blur(8px);
    }
    .modal-overlay.active { opacity: 1; }

    .modal-content {
      background: rgba(15, 15, 20, 0.95);
      padding: 3rem; 
      border-radius: 12px; width: 450px;
      transform: translateY(20px); transition: transform 0.4s ease;
      color: #fff;
      font-family: 'JetBrains Mono', monospace;
      box-shadow: 0 20px 50px rgba(0,0,0,0.5);
      border: 1px solid rgba(255,255,255,0.1);
    }
    .modal-overlay.active .modal-content { transform: translateY(0); }

    .settings-row { margin-bottom: 2.5rem; }
    .settings-row label { 
      display: block; font-size: 0.8rem; margin-bottom: 1.5rem; 
      color: rgba(255,255,255,0.6); letter-spacing: 2px; text-transform: uppercase;
    }
    
    input[type=range] { -webkit-appearance: none; width: 100%; background: transparent; }
    input[type=range]::-webkit-slider-runnable-track { 
      width: 100%; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px;
    }
    input[type=range]::-webkit-slider-thumb {
      height: 18px; width: 18px; border-radius: 50%; background: #fff;
      cursor: pointer; -webkit-appearance: none; margin-top: -7px;
    }
  `;
  document.head.appendChild(style);

  app.innerHTML = `
    <div class="menu-container">
      <div class="background-wallpaper"></div>
      <div class="vignette"></div>
      <div class="scanlines"></div>
      
      <div class="title-group">
        <div class="episode-tag">EPISODE - UNKNOWN</div>
        <h1 class="main-title">PC MASTER</h1>
        <div class="chapter-tag">${lang === 'RU' ? '- ГЛАВА 3 -' : '- CHAPTER 3 -'}</div>
      </div>

      <div class="menu-buttons">
        <button id="playBtn" class="menu-button">${lang === 'RU' ? 'играть' : 'play'}</button>
        <button id="settingsBtn" class="menu-button">${lang === 'RU' ? 'настройки' : 'settings'}</button>
        <button id="updateLogBtn" class="update-log-btn">- ${lang === 'RU' ? (localStorage.getItem('pc_master_game_completed') === 'true' ? 'апдейт логи' : '<i class="bi bi-lock-fill" style="font-size: 13px; margin-right: 4px;"></i> апдейт логи') : (localStorage.getItem('pc_master_game_completed') === 'true' ? 'update logs' : '<i class="bi bi-lock-fill" style="font-size: 13px; margin-right: 4px;"></i> update logs')} -</button>
      </div>

      <div class="bottom-info-group">
        <div class="version-tag">V0.0.7</div>
      </div>

      <audio id="bgMusic" loop>
        <source src="/assets/sounds/soundtracks/main_menu.mp3" type="audio/mpeg">
      </audio>
    </div>
  `;

  // Trigger appearance
  requestAnimationFrame(() => {
    document.querySelector('.menu-container')?.classList.add('visible');

    // 1-second silence/delay before UI elements appear
    setTimeout(() => {
      playAudio('/assets/sounds/sfx/menu_appear.mp3', (settings.sfxVolume / 100) * (settings.masterVolume / 100));
      document.querySelector('.menu-container')?.classList.add('ui-visible');
      
      // Unlock menu buttons after animation finishes (1.5s transition + small buffer)
      setTimeout(() => {
        isMenuLocked = false;
      }, 1500);
    }, 1000);
  });

  // Play music
  const bgMusic = document.getElementById('bgMusic') as HTMLAudioElement;
  if (bgMusic) {
    bgMusic.volume = (settings.musicVolume / 100) * (settings.masterVolume / 100);
    bgMusic.play().catch(e => console.log("Music blocked:", e));
  }

  const handleButtonClick = (action: () => void) => {
    if (isMenuLocked) return;
    isMenuLocked = true;
    playAudio('/assets/sounds/sfx/main/btn_select.wav', (settings.sfxVolume / 100) * (settings.masterVolume / 100));
    action();
  };

  document.getElementById('playBtn')?.addEventListener('click', () => handleButtonClick(handlePlay));
  document.getElementById('settingsBtn')?.addEventListener('click', () => handleButtonClick(handleSettings));
  document.getElementById('updateLogBtn')?.addEventListener('click', () => {
    if (isMenuLocked) return; 
    playAudio('/assets/sounds/sfx/main/btn_select.wav', (settings.sfxVolume / 100) * (settings.masterVolume / 100));
    handleUpdateLogs();
  });
}

function handleUpdateLogs(): void {
  const app = document.getElementById('app') || document.body;
  const lang = getLanguage();
  const isCompleted = localStorage.getItem('pc_master_game_completed') === 'true';

  // Prevent multiple modals open at once (no spam)
  if (document.querySelector('.logs-modal')) return;

  const modal = document.createElement('div');
  modal.className = 'logs-modal';
  
  if (!isCompleted) {
    modal.innerHTML = `
      <div class="logs-header">
        <div class="logs-title" style="color: #ef4444; letter-spacing: 3px;">${lang === 'RU' ? 'ДОСТУП ОГРАНИЧЕН' : 'ACCESS RESTRICTED'}</div>
        <button class="close-logs" style="cursor: pointer;">${lang === 'RU' ? '[ЗАКРЫТЬ]' : '[CLOSE]'}</button>
      </div>
      <div class="logs-content" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 3rem 1.5rem;">
        <div style="width: 70px; height: 70px; border-radius: 50%; background: rgba(239, 68, 68, 0.1); border: 2px solid rgba(239, 68, 68, 0.4); display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem;">
          <i class="bi bi-lock-fill" style="font-size: 2rem; color: #ef4444;"></i>
        </div>
        <h2 style="font-size: 1.2rem; color: #fff; margin-bottom: 0.8rem; letter-spacing: 2px; font-weight: 600;">
          ${lang === 'RU' ? 'ИСТОРИЯ ОБНОВЛЕНИЙ ЗАБЛОКИРОВАНА' : 'UPDATE HISTORY IS LOCKED'}
        </h2>
        <p style="color: #a1a1aa; font-size: 0.95rem; line-height: 1.6; max-width: 440px; margin: 0 auto;">
          ${lang === 'RU' ? 'Чтобы избежать сюжетных спойлеров, список обновлений станет доступен только после полного прохождения игры.' : 'To avoid story spoilers, the update log will be unlocked only after completing the game.'}
        </p>
      </div>
    `;
    app.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('active'));

    modal.querySelector('.close-logs')?.addEventListener('click', () => {
      playAudio('/assets/sounds/sfx/main/btn_click.wav', (settings.sfxVolume / 100) * (settings.masterVolume / 100));
      modal.classList.remove('active');
      setTimeout(() => {
        modal.remove();
        isMenuLocked = false;
      }, 600);
    });
    return;
  }

  modal.innerHTML = `
    <div class="logs-header">
      <div class="logs-title">${lang === 'RU' ? 'ИСТОРИЯ ОБНОВЛЕНИЙ' : 'UPDATE HISTORY'}</div>
      <button class="close-logs">${lang === 'RU' ? '[ЗАКРЫТЬ]' : '[CLOSE]'}</button>
    </div>
    <div class="logs-content">
      <div>
        <h2>V0.0.7 (ТЕКУЩАЯ)</h2>
        <h3>УНИВЕРСАЛЬНЫЙ ПРОСМОТРЩИК ФАЙЛОВ, ОКОННЫЙ МЕНЕДЖЕР WIN11 И ГЛУБОКИЙ ЛОР</h3>
        <ul>
          <li><b>Универсальный просмотрщик документов (Universal File Viewer):</b> полноценный просмотр PDF-газет, фотоальбомов, аудиоплеера и Блокнота с мгновенным открытием.</li>
          <li><b>Оконный менеджер Windows 11:</b> открытие на весь экран по умолчанию, аутентичные системные кнопки (<code>—</code>, <code>□</code>, <code>❐</code>, <code>✕</code>), блокировка перетаскивания при максимизации и интеграция с панелью задач (Taskbar).</li>
          <li><b>Кастомные скроллбары:</b> стильные темные полосы прокрутки с плавной подсветкой и комфортными отступами контента.</li>
          <li><b>Масштабный лор главного героя:</b> газета «Вестник Столицы» от 14 июля 2024 с 6 главами расследования взлома Digital Dreams, гибели родителей в 2018 году и дистанционного стирания личности.</li>
          <li><b>Личный дневник разработчика (Заметки.txt):</b> 8 хронологических записей 2023–2024 о создании AVALON, обнаружении трояна Wacatac, шантаже руководства и разделении архива.</li>
          <li><b>Винтажный ч/б фотоархив:</b> фотографии семьи 1999 года со стёртым лицом ребёнка и ночной офис разработки Digital Dreams.</li>
          <li><b>10-секундная распаковка и WinRAR CRC-32 Error:</b> диагностическая ошибка контрольной суммы на 80% с автоматическим наведением курсора героя.</li>
          <li><b>Аналоговый хоррор в катсцене:</b> разрыв экрана, цветовые сдвиги и шум вместо тряски окна при приближении курсора к кнопке удаления.</li>
          <li><b>Редизайн браузера:</b> строгий темный минималистичный интерфейс в стиле Chrome/Edge.</li>
          <li><b>Анти-спойлер система главного меню:</b> модальное окно защиты истории обновлений до финала игры.</li>
        </ul>
      </div>

      <div>
        <h2>V0.0.61</h2>
        <h3>ТРОЯН, ВЗРЫВ КИНЕСКОПА, МАТРИЦА И АНАЛОГОВЫЙ ХОРРОР</h3>
        <ul>
          <li><b>Windows Defender & Trojan Alert:</b> обнаружение критической угрозы <code>Trojan:Win32/Wacatac.B!ml</code> и кнопка «Удалить троян».</li>
          <li><b>Кинематографичное приближение мыши:</b> плавная радиальная виньетка, нагнетающий звук помех с Fade In 0.7с, зависание и резкое обесточивание ПК.</li>
          <li><b>Экран перезагрузки с ТВ-помехами:</b> перезагрузка с цепочкой ТВ-рывков (0.3с и 0.5с), паузой в тишине и взрывом кинескопа с разбитым стеклом.</li>
          <li><b>Зеленая Матрица & Undertale диалоги:</b> падающий цифровой дождь с начальным стробоскопом, 30-секундный монолог неизвестного с воспоминаниями о прошлом и вопросом о честности друга.</li>
          <li><b>Встроенный 8-битный синтезатор:</b> аутентичные речевые блипы Undertale для каждой буквы без внешних задержек.</li>
          <li><b>Саундтрек Матрицы:</b> плавная регулировка громкости и Fade In 0.6с для трека <code>matrix_music.wav</code>.</li>
          <li><b>Переход в Акт 2:</b> переход в искаженную систему (Corrupted OS).</li>
          <li><b>Мобильные «Файлы»:</b> добавлена навигация внутрь папок («Загрузки») со статусом «Папка пуста» и кнопкой «Назад».</li>
        </ul>
      </div>

      <div>
        <h2>V0.0.5</h2>
        <h3>ГАЛЕРЕЯ, БОЛЬШЕ ИНТЕРАКТИВА И ФИНАЛ КАТСЦЕНЫ</h3>
        <ul>
          <li>Реализовано приложение «Файлы» и «Галерея» с просмотром добавленных картинок и GIF-видео.</li>
          <li>Внутриигровые уведомления теперь отображаются прямо в игре (а не системными уведомлениями браузера).</li>
          <li>Полностью заблокировано системное контекстное меню (ПКМ) во всей игре для большего погружения.</li>
          <li>Иконка браузера на рабочем столе теперь не реагирует на клики пользователя вне катсцены.</li>
          <li>Исправлен критический баг с зависанием курсора на кнопке «Удалить» в катсцене AVALON.</li>
          <li>Добавлен полноценный интерактив в катсцену: теперь игрок сам должен провести мышкой к кнопке «Удалить» и кликнуть по ней.</li>
          <li>Финал катсцены: поиск DrWeb, ошибка "Указанный элемент не найден", закрытие браузера, субтитры "Перезагружу-ка компьютер...", долгая и глючная загрузка Windows.</li>
          <li>Реализован полноценный интерфейс ASUS ROG UEFI BIOS Utility (EZ Mode) после перезагрузки.</li>
        </ul>
      </div>

      <div>
        <h2>V0.0.4</h2>
        <h3>UI/UX & CUTSCENE EXPANSION</h3>
        <ul>
          <li>Добавлены эффекты подсветки/выделения при наведении на кнопки.</li>
          <li>В меню добавлена забавная кнопка «Copy», которая реально позволяет копировать текст.</li>
          <li>Папка AVALON и браузер на рабочем столе поменялись местами.</li>
          <li>Настройки: раздел «Безопасность Windows» полностью повторяет окно из катсцены (пока без угроз).</li>
          <li>Добавлена иконка браузера, которая открывается исключительно по сюжету в катсцене.</li>
          <li>Катсцена AVALON: настроена идеальная скорость, добавлен оригинальный звук ошибки Windows, убраны смайлики из сабов героя.</li>
          <li>Сюжет (AVALON): герой 1 секунду ждет, кликает еще раз, через 0.7 сек спамит кликами. Defender закрывается сам, появляется мысль героя, он открывает браузер, гуглит DrWeb и получает отказ в доступе!</li>
          <li>Главное меню: кнопки заблокированы до полного завершения анимации появления.</li>
          <li>Экран блокировки телефона: теперь разблокируется свайпом (перетягиванием), а не кликом.</li>
          <li>Чат: убраны точки в конце последних сообщений друга.</li>
          <li>Увеличена нижняя панель на 3%.</li>
        </ul>
      </div>

      <div>
        <h2>V0.0.3</h2>
        <h3>ПОГРУЖЕНИЕ И DESKTOP UPDATES</h3>
        <ul>
          <li>Реализована первая интерактивная катсцена с другом.</li>
          <li>Внедрена система блокировки ввода во время диалогов.</li>
          <li>Добавлена плавная прокрутка чата без видимых полос.</li>
          <li>Упрощен переход в игру (затухание).</li>
          <li>Улучшена атмосфера и тайминги диалогов.</li>
          <li>Реализована полноценная логика окон (на весь экран).</li>
          <li>Добавлено полноценное окно параметров (System Settings) в стиле Win11.</li>
          <li>Характеристики ПК изменены на ASUS TUF Gaming A15 (изношенный вид).</li>
          <li>Исправлен баг с черным текстом в окнах (теперь белый).</li>
          <li>Настроено плавное появление иконок рабочего стола.</li>
          <li>Сделака кликабельной вкладка "Wifi Settings" в параметрах.</li>
          <li>Исправлено отображение частот процессора и скорости ОЗУ.</li>
          <li>Заполнен раздел "Корзина" одинаковыми серыми иконками файлов.</li>
          <li>Добавлено примечание в параметрах, что они ненастоящие.</li>
          <li>Увеличена скорость набора текста героем в чате (в 2.5 раза).</li>
          <li>Добавлена поддержка звука стартапа ОС при включении.</li>
        </ul>
      </div>

      <div>
        <h2>V0.0.2 DEMO</h2>
        <h3>SYSTEM ADDITIONS</h3>
        <ul>
          <li>Добавлен звук ошибки Windows и новые иконки для файлов и папок.</li>
          <li>Субтитры кат-сцены немного подняты для читабельности.</li>
          <li>Добавлено меню настроек (фейковое железо Asus/Hp Victus).</li>
        </ul>
      </div>

      <div>
        <h2>V0.0.1 PROTOTYPE</h2>
        <h3>РЕВОЛЮЦИЯ ИНТЕРФЕЙСА</h3>
        <ul>
          <li>Реализован высококачественный экран выбора языка.</li>
          <li>Добавлена синхронизация ассетов в реальном времени (Прелоадер).</li>
          <li>Переработан дизайн главного меню в эстетике "EPISODE - UNKNOWN".</li>
          <li>Добавлен атмосферный фоновый звук (Эмбиент).</li>
          <li>Внедрены плавные CSS-переходы и анимации.</li>
          <li>Добавлена интерактивная панель логов обновлений.</li>
        </ul>
      </div>

      <div>
        <h2>V0.0.0 - НАЧАЛО</h2>
        <h3>БАЗОВЫЕ СИСТЕМЫ</h3>
        <ul>
          <li>Инициализация проекта на Vite + TypeScript.</li>
          <li>Базовая структура меню и логика загрузки.</li>
        </ul>
      </div>
    </div>
  `;

  app.appendChild(modal);
  
  // Slide up
  requestAnimationFrame(() => modal.classList.add('active'));

  modal.querySelector('.close-logs')?.addEventListener('click', () => {
    playAudio('/assets/sounds/sfx/main/btn_click.wav', (settings.sfxVolume / 100) * (settings.masterVolume / 100));
    modal.classList.remove('active');
    setTimeout(() => app.removeChild(modal), 600);
  });
}

function fadeAudioOut(audio: HTMLAudioElement, duration: number): void {
  const startVolume = audio.volume;
  const stepTime = 50; // ms
  const steps = duration / stepTime;
  const volumeStep = startVolume / steps;

  const fadeInterval = setInterval(() => {
    if (audio.volume > volumeStep) {
      audio.volume -= volumeStep;
    } else {
      audio.volume = 0;
      audio.pause();
      clearInterval(fadeInterval);
    }
  }, stepTime);
}

function handlePlay(): void {
  const container = document.querySelector('.menu-container') as HTMLElement;
  const bgMusic = document.getElementById('bgMusic') as HTMLAudioElement;
  
  if (container) {
    // Simple fade to black
    container.style.transition = 'opacity 1s ease-in-out';
    container.style.opacity = '0';
    
    // Smoothly fade out music
    if (bgMusic) {
      fadeAudioOut(bgMusic, 1000);
    }
    
    setTimeout(() => {
      import('./desktop').then(m => m.initPhone());
    }, 1000);
  }
}

function handleSettings(): void {
  const app = document.getElementById('app') || document.body;
  const lang = getLanguage();
  
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';
  
  modalOverlay.innerHTML = `
    <div class="modal-content" style="position:relative;">
      <h2 style="margin-top: 0; font-size: 1.4rem; margin-bottom: 2.5rem; letter-spacing: 1px; color: #fff;">
        ${lang === 'RU' ? 'НАСТРОЙКИ' : 'SETTINGS'}
      </h2>
      
      <div class="settings-row">
        <label>${lang === 'RU' ? 'ОБЩАЯ ГРОМКОСТЬ' : 'MASTER VOLUME'}</label>
        <input type="range" id="masterVolume" min="0" max="100" value="${settings.masterVolume}">
      </div>
      
      <div class="settings-row">
        <label>${lang === 'RU' ? 'ГРОМКОСТЬ МУЗЫКИ' : 'MUSIC VOLUME'}</label>
        <input type="range" id="musicVolume" min="0" max="100" value="${settings.musicVolume}">
      </div>
      
      <div class="settings-row">
        <label>${lang === 'RU' ? 'ГРОМКОСТЬ ЗВУКОВ' : 'SFX VOLUME'}</label>
        <input type="range" id="sfxVolume" min="0" max="100" value="${settings.sfxVolume}">
      </div>

      <button id="closeSettings" class="menu-button" style="width: 100%; margin-top: 1rem; color:#fff; background:rgba(255,255,255,0.1);">
        ${lang === 'RU' ? 'назад' : 'back'}
      </button>
    </div>
  `;
  
  app.appendChild(modalOverlay);
  
  const masterSlider = modalOverlay.querySelector('#masterVolume') as HTMLInputElement;
  const musicSlider = modalOverlay.querySelector('#musicVolume') as HTMLInputElement;
  const sfxSlider = modalOverlay.querySelector('#sfxVolume') as HTMLInputElement;

  const updateSettings = () => {
    settings.masterVolume = parseInt(masterSlider.value);
    settings.musicVolume = parseInt(musicSlider.value);
    settings.sfxVolume = parseInt(sfxSlider.value);

    // Apply sounds/music
    const bgMusic = document.getElementById('bgMusic') as HTMLAudioElement;
    if (bgMusic) bgMusic.volume = (settings.musicVolume / 100) * (settings.masterVolume / 100);
  };

  masterSlider.addEventListener('input', updateSettings);
  musicSlider.addEventListener('input', updateSettings);
  sfxSlider.addEventListener('input', updateSettings);
  
  requestAnimationFrame(() => modalOverlay.classList.add('active'));
  
  document.getElementById('closeSettings')?.addEventListener('click', () => {
    playAudio('/assets/sounds/sfx/main/btn_click.wav', (settings.sfxVolume / 100) * (settings.masterVolume / 100));
    modalOverlay.classList.remove('active');
    setTimeout(() => app.removeChild(modalOverlay), 300);
    isMenuLocked = false; // Release lock on settings close
  });
}
