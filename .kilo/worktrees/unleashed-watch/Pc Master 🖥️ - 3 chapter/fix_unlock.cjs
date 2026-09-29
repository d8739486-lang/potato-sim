const fs = require('fs');
let content = fs.readFileSync('src/desktop.ts', 'utf8');

const replacement = `      </div>
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
  lockScreen.addEventListener('touchstart', (e) => { startY = e.touches[0].clientY; isDragging = true; }, { passive: true });`;

content = content.replace(/      <\/div>\r?\n    <\/div>\r?\n  `;\r?\n\r?\n  lockScreen\.addEventListener\('mousedown', \(e\) => { startY = e\.clientY; isDragging = true; }\);\r?\n  lockScreen\.addEventListener\('touchstart', \(e\) => { startY = e\.touches\[0\]\.clientY; isDragging = true; }, { passive: true }\);/m, replacement);

fs.writeFileSync('src/desktop.ts', content, 'utf8');
console.log('Fixed double unlock bug');
