/**
 * High-Definition Photorealistic Analog Photo Engine
 * Generates rich, atmospheric 35mm monochrome archival photographs with realistic lighting,
 * authentic film grain, lens scratches, vintage date stamps and redacted glitch overlays.
 */

export function generateArchivalPhotoDataUrl(photoId: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const w = canvas.width;
  const h = canvas.height;

  if (photoId.includes('Семья') || photoId.includes('Family') || photoId.includes('1999')) {
    render1999FamilyPhoto(ctx, w, h);
  } else if (photoId.includes('Офис') || photoId.includes('Команда') || photoId.includes('Office') || photoId.includes('Концепт')) {
    renderDigitalDreamsOfficePhoto(ctx, w, h);
  } else {
    renderServerRoomCCTVPhoto(ctx, w, h);
  }

  // Apply real 35mm analog film grain, scratches, vignette & analog timestamp
  applyAnalogFilmEffects(ctx, w, h, photoId.includes('1999') ? "'99  8 18" : "'23 11 02");

  return canvas.toDataURL('image/png');
}

/**
 * 1. 1999 Living Room Family Portrait (Monochrome Noir Analog Film)
 */
function render1999FamilyPhoto(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Background Room & Wallpaper with retro vertical striped texture
  const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
  bgGrad.addColorStop(0, '#1c1b19');
  bgGrad.addColorStop(0.7, '#2a2825');
  bgGrad.addColorStop(1, '#141312');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Wallpaper stripes
  ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
  for (let x = 0; x < w; x += 18) {
    ctx.fillRect(x, 0, 9, h * 0.7);
  }

  // Wooden baseboard & floor
  ctx.fillStyle = '#100f0e';
  ctx.fillRect(0, h * 0.72, w, h * 0.28);
  ctx.fillStyle = '#0a0a09';
  ctx.fillRect(0, h * 0.71, w, 6);

  // Background framed picture on the wall
  ctx.fillStyle = '#111';
  ctx.fillRect(w * 0.12, h * 0.15, 120, 90);
  ctx.strokeStyle = '#3a3834';
  ctx.lineWidth = 4;
  ctx.strokeRect(w * 0.12, h * 0.15, 120, 90);
  ctx.fillStyle = '#222';
  ctx.fillRect(w * 0.14, h * 0.18, 95, 66);

  // Retro floor lamp with warm light cone
  const lampX = w * 0.86;
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(lampX, h * 0.1);
  ctx.lineTo(lampX, h * 0.75);
  ctx.stroke();

  // Lamp shade
  ctx.fillStyle = '#666';
  ctx.beginPath();
  ctx.moveTo(lampX - 35, h * 0.2);
  ctx.lineTo(lampX + 35, h * 0.2);
  ctx.lineTo(lampX + 22, h * 0.1);
  ctx.lineTo(lampX - 22, h * 0.1);
  ctx.closePath();
  ctx.fill();

  // Lamp light radial glow
  const lampGlow = ctx.createRadialGradient(lampX, h * 0.2, 10, lampX, h * 0.2, 360);
  lampGlow.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
  lampGlow.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
  lampGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = lampGlow;
  ctx.fillRect(0, 0, w, h);

  // Large retro fabric sofa
  ctx.fillStyle = '#1f1e1c';
  ctx.beginPath();
  ctx.roundRect(w * 0.18, h * 0.45, w * 0.64, h * 0.32, [24, 24, 8, 8]);
  ctx.fill();
  ctx.fillStyle = '#161514';
  ctx.fillRect(w * 0.22, h * 0.62, w * 0.56, h * 0.15);

  // --- Father Silhouette & Suit (Left) ---
  const fatherX = w * 0.32;
  // Body & Jacket
  ctx.fillStyle = '#151515';
  ctx.beginPath();
  ctx.moveTo(fatherX - 60, h * 0.75);
  ctx.quadraticCurveTo(fatherX - 55, h * 0.42, fatherX, h * 0.4);
  ctx.quadraticCurveTo(fatherX + 55, h * 0.42, fatherX + 50, h * 0.75);
  ctx.closePath();
  ctx.fill();
  // Collar & Tie
  ctx.fillStyle = '#444';
  ctx.beginPath();
  ctx.moveTo(fatherX - 10, h * 0.4);
  ctx.lineTo(fatherX + 10, h * 0.4);
  ctx.lineTo(fatherX, h * 0.52);
  ctx.closePath();
  ctx.fill();
  // Head & Hair
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.ellipse(fatherX, h * 0.31, 32, 42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.ellipse(fatherX, h * 0.28, 35, 24, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  // --- Mother Silhouette & Dress (Right) ---
  const motherX = w * 0.68;
  // Dress
  ctx.fillStyle = '#1a1918';
  ctx.beginPath();
  ctx.moveTo(motherX - 55, h * 0.75);
  ctx.quadraticCurveTo(motherX - 50, h * 0.44, motherX, h * 0.42);
  ctx.quadraticCurveTo(motherX + 50, h * 0.44, motherX + 45, h * 0.75);
  ctx.closePath();
  ctx.fill();
  // Head & Wavy 90s Hair
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.ellipse(motherX, h * 0.33, 38, 48, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#242322';
  ctx.beginPath();
  ctx.ellipse(motherX, h * 0.33, 28, 36, 0, 0, Math.PI * 2);
  ctx.fill();

  // --- Young Child (Center) with Redacted Glitch Box ---
  const childX = w * 0.5;
  // Child body & sweater
  ctx.fillStyle = '#2b2a28';
  ctx.beginPath();
  ctx.moveTo(childX - 38, h * 0.75);
  ctx.quadraticCurveTo(childX - 35, h * 0.52, childX, h * 0.5);
  ctx.quadraticCurveTo(childX + 35, h * 0.52, childX + 38, h * 0.75);
  ctx.closePath();
  ctx.fill();
  // Small head silhouette
  ctx.fillStyle = '#1c1c1c';
  ctx.beginPath();
  ctx.ellipse(childX, h * 0.43, 24, 28, 0, 0, Math.PI * 2);
  ctx.fill();

  // Heavy Redacted Analog Glitch & Noise Block over Child's Head
  const glitchX = childX - 44;
  const glitchY = h * 0.34;
  const glitchW = 88;
  const glitchH = 92;

  ctx.fillStyle = '#050505';
  ctx.fillRect(glitchX, glitchY, glitchW, glitchH);

  // Digital Glitch Horizontal Static Bands
  for (let i = 0; i < glitchH; i += 3) {
    const shade = Math.floor(Math.random() * 220);
    ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
    const bandW = Math.random() > 0.3 ? glitchW : Math.random() * glitchW;
    ctx.fillRect(glitchX, glitchY + i, bandW, 2);
  }

  // Redacted Stamp Label
  ctx.fillStyle = '#000';
  ctx.fillRect(glitchX + 6, glitchY + 32, glitchW - 12, 24);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1;
  ctx.strokeRect(glitchX + 6, glitchY + 32, glitchW - 12, 24);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('[СТЁРТО]', childX, glitchY + 48);
}

/**
 * 2. Digital Dreams Corporate HQ Night Espionage Photo
 */
function renderDigitalDreamsOfficePhoto(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Dark rainy night sky
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#0a0c10');
  sky.addColorStop(0.6, '#141824');
  sky.addColorStop(1, '#08090c');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // Distant City Skyline Silhouettes
  ctx.fillStyle = '#0f1118';
  for (let i = 0; i < 15; i++) {
    const bw = 40 + (i * 27) % 50;
    const bh = 150 + ((i * 47) % 180);
    ctx.fillRect(i * 55, h * 0.7 - bh, bw, bh);
  }

  // Main Digital Dreams Skyscraper (Brutalist Modernist)
  const towerX = w * 0.22;
  const towerW = w * 0.56;
  const towerGrad = ctx.createLinearGradient(towerX, 0, towerX + towerW, 0);
  towerGrad.addColorStop(0, '#181b24');
  towerGrad.addColorStop(0.5, '#222634');
  towerGrad.addColorStop(1, '#12141c');
  ctx.fillStyle = towerGrad;
  ctx.fillRect(towerX, h * 0.08, towerW, h * 0.7);

  // Tower Glass Window Grid with Random Office Lights at 3 AM
  const rows = 18;
  const cols = 12;
  const winW = towerW / (cols + 2);
  const winH = (h * 0.65) / (rows + 2);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const wx = towerX + 16 + c * (winW + 4);
      const wy = h * 0.12 + r * (winH + 4);
      
      const isLit = ((r * 7 + c * 13) % 5 === 0) || (r === 6 && c >= 4 && c <= 8);
      if (isLit) {
        ctx.fillStyle = 'rgba(240, 245, 255, 0.75)';
      } else {
        ctx.fillStyle = 'rgba(10, 15, 25, 0.8)';
      }
      ctx.fillRect(wx, wy, winW, winH);
    }
  }

  // Illuminated Rooftop Corporate Logo Sign
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('DIGITAL DREAMS CORP • R&D', w * 0.5, h * 0.06);

  // Wet Asphalt Ground with Rain Reflections
  ctx.fillStyle = '#06070a';
  ctx.fillRect(0, h * 0.75, w, h * 0.25);

  const puddleGrad = ctx.createLinearGradient(0, h * 0.75, 0, h);
  puddleGrad.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
  puddleGrad.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
  ctx.fillStyle = puddleGrad;
  ctx.fillRect(towerX, h * 0.75, towerW, h * 0.25);
}

/**
 * 3. CCTV Server Room Breach Photography
 */
function renderServerRoomCCTVPhoto(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Hallway Perspective
  ctx.fillStyle = '#0c0d12';
  ctx.fillRect(0, 0, w, h);

  const centerX = w * 0.5;
  const centerY = h * 0.45;

  // Server Racks Left & Right
  for (let i = 0; i < 6; i++) {
    const leftX = w * (0.05 + i * 0.06);
    const rightX = w * (0.95 - i * 0.06);

    ctx.fillStyle = `rgb(${15 + i * 4}, ${16 + i * 4}, ${20 + i * 4})`;
    ctx.beginPath();
    ctx.moveTo(leftX, 0);
    ctx.lineTo(leftX + 35, 0);
    ctx.lineTo(centerX - 40 + i * 8, centerY);
    ctx.lineTo(centerX - 60 + i * 8, centerY);
    ctx.closePath();
    ctx.fill();

    // Server LED indicator lights
    for (let l = 0; l < 8; l++) {
      const ly = h * (0.15 + l * 0.08);
      ctx.fillStyle = l % 2 === 0 ? 'rgba(255, 255, 255, 0.85)' : 'rgba(100, 100, 100, 0.4)';
      ctx.fillRect(leftX + 8, ly, 4, 3);
      ctx.fillRect(rightX - 12, ly, 4, 3);
    }
  }

  // CCTV HUD OSD Overlay
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.font = 'bold 12px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('CAM 04 • CLUSTER SERVER ROOM AVALON', 30, 40);
  ctx.fillText('14.07.2024  03:14:08  REC [●]', 30, 60);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1;
  // Crosshair
  ctx.beginPath();
  ctx.moveTo(centerX - 20, centerY);
  ctx.lineTo(centerX + 20, centerY);
  ctx.moveTo(centerX, centerY - 20);
  ctx.lineTo(centerX, centerY + 20);
  ctx.stroke();
}

/**
 * Applies authentic 35mm film grain, dust scratches, lens vignette and digital date stamp
 */
function applyAnalogFilmEffects(ctx: CanvasRenderingContext2D, w: number, h: number, dateStamp: string) {
  // 1. Film Vignette
  const vignette = ctx.createRadialGradient(w / 2, h / 2, w * 0.25, w / 2, h / 2, w * 0.65);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(0.7, 'rgba(0,0,0,0.3)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.85)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);

  // 2. 35mm Film Grain Simulation
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 32;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  // 3. Analog Film Scratches & Hair
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 0.8;
  for (let s = 0; s < 7; s++) {
    const sx = Math.random() * w;
    ctx.beginPath();
    ctx.moveTo(sx, 0);
    ctx.lineTo(sx + (Math.random() - 0.5) * 20, h);
    ctx.stroke();
  }

  // 4. Vintage 1990s Orange/Amber Digital Quartz Date Stamp in Bottom-Right
  ctx.fillStyle = '#ff7700';
  ctx.font = 'bold 22px "Courier New", monospace';
  ctx.textAlign = 'right';
  ctx.shadowColor = '#ff3300';
  ctx.shadowBlur = 8;
  ctx.fillText(dateStamp, w - 30, h - 30);
  ctx.shadowBlur = 0;
}
