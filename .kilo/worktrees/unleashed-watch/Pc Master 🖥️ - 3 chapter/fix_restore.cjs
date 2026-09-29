const fs = require('fs');

let content = fs.readFileSync('src/desktop.ts', 'utf8');

const missingBlock = `              <img src="/assets/images/phone/icons/icon_settings.png" style="width: 60px; height: 60px; border-radius: 15px; background: rgba(255,255,255,0.1); backdrop-filter: blur(10px);">
              <div class="app-label" style="font-size: 0.7rem; color: #fff;">\${lang === 'RU' ? 'Настройки' : 'Settings'}</div>
            </div>
          </div>
          <div class="dock" style="background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(20px); border-radius: 30px; padding: 20px; display: flex; justify-content: center; gap: 20px; margin: 0 20px;">
            <div class="app-icon" data-app="messages"><img src="/assets/images/phone/icons/icon_messages.png" style="width: 60px; height: 60px; border-radius: 15px; background: rgba(255,255,255,0.1); backdrop-filter: blur(10px);"></div>
            <div class="app-icon" data-app="calls"><img src="/assets/images/phone/icons/icon_calls.png" style="width: 60px; height: 60px; border-radius: 15px; background: rgba(255,255,255,0.1); backdrop-filter: blur(10px);"></div>
          </div>
        </div>
      </div>
    </div>
  \`;

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
      unlockSound.play().catch(() => {});

      lockScreen.style.transform = 'translateY(-110%)';
      
      // Sync home screen appearance
      setTimeout(() => {
        homeScreen.style.opacity = '1';
        lockScreen.style.display = 'none';
        document.getElementById('goalNotify')?.classList.add('visible');
      }, 400); // Trigger mid-animation for smoothness
  };

  lockScreen.addEventListener('click', handleUnlock);

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

  // App listener`;

content = content.replace("            <div class=\"app-icon\" data-app=\"settings\" style=\"cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 8px;\">\n\n  // App listener", "            <div class=\"app-icon\" data-app=\"settings\" style=\"cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 8px;\">\n" + missingBlock);

content = content.replace("            <div class=\"app-icon\" data-app=\"settings\" style=\"cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 8px;\">\r\n\r\n  // App listener", "            <div class=\"app-icon\" data-app=\"settings\" style=\"cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 8px;\">\r\n" + missingBlock);

fs.writeFileSync('src/desktop.ts', content, 'utf8');
console.log('Restored missing block');
