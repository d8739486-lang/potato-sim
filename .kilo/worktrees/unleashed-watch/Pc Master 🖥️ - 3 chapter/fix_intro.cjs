const fs = require('fs');

let dt = fs.readFileSync('src/desktop.ts', 'utf8');

const replacement = `  app.appendChild(overlay);

  // Sequence: 3.4 seconds total
  const alarm = new Audio('/assets/sounds/sfx/intro/alarm.mp3');
  alarm.loop = true;
  alarm.volume = (settings.sfxVolume / 100) * (settings.masterVolume / 100);
  alarm.play().catch(() => {});

  // Show text immediately
  setTimeout(() => { introText.style.opacity = '0.6'; }, 500);

  // Stop alarm and finish earlier (0.8s faster)
  setTimeout(() => {
    alarm.pause();
    const alarmOff = new Audio('/assets/sounds/sfx/intro/alarm_off.mp3');
    alarmOff.volume = (settings.sfxVolume / 100) * (settings.masterVolume / 100);
    alarmOff.play().catch(() => {});

    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.remove();
      renderPhoneUI();
    }, 1000);
  }, 3400);
}

export function renderPhoneUI(): void {`;

dt = dt.replace("  app.appendChild(overlay);\n\nexport function renderPhoneUI(): void {", replacement);

fs.writeFileSync('src/desktop.ts', dt, 'utf8');
console.log('Fixed cutscene timeout deletion');
