const fs = require('fs');

const files = [
  'src/store/gameStore.ts',
  'src/components/Warehouse.tsx',
  'src/components/UnlockModal.tsx',
  'src/components/Shop.tsx',
  'src/components/PotatoRainOverlay.tsx',
  'src/components/Field.tsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  if (file.includes('Field.tsx')) {
    // For Field.tsx we have sprinklerAudioRef and regular audio
    if (!content.includes('const maxVol = useGameStore.getState().getSoundVol(0.1);')) {
      content = content.replace(
        'sprinklerAudioRef.current.volume = currentVol + (targetVolume * 0.1 - currentVol) * 0.5; // Max vol 0.1',
        'const maxVol = useGameStore.getState().getSoundVol(0.1);\n      sprinklerAudioRef.current.volume = currentVol + (targetVolume * maxVol - currentVol) * 0.5;'
      );
      changed = true;
    }
  }

  // Generic audio.volume = X;
  const regex = /audio\.volume\s*=\s*([0-9.]+);/g;
  if (regex.test(content)) {
    content = content.replace(regex, (match, vol) => {
      // Don't replace if it's already using getSoundVol
      return `audio.volume = useGameStore.getState().getSoundVol(${vol});`;
    });
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
  }
});
