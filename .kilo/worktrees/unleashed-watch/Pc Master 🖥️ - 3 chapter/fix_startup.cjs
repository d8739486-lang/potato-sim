const fs = require('fs');

let dt = fs.readFileSync('src/desktop.ts', 'utf8');

// I need to add back the setTimeout block right before `function renderWindowsDesktop(): void {`
const block = `  setTimeout(() => {
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

function renderWindowsDesktop(): void {`;

dt = dt.replace("function renderWindowsDesktop(): void {", block);

fs.writeFileSync('src/desktop.ts', dt, 'utf8');
console.log('Fixed boot screen timeout and added startup sound');
