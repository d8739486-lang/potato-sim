import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';

interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

interface Enemy {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  size: number;
  type: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

// Minimal 2D Game Engine Hook
export function useGameEngine(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  matrixRef: React.RefObject<HTMLCanvasElement | null>
) {
  const gameState = useGameStore((s) => s.gameState);
  
  // Game State
  const player = useRef({ x: 0, y: 0, vx: 0, vy: 0, angle: 0 });
  const projectiles = useRef<Projectile[]>([]);
  const enemies = useRef<Enemy[]>([]);
  const particles = useRef<Particle[]>([]);
  const keys = useRef<{ [key: string]: boolean }>({});
  const mouse = useRef({ x: 0, y: 0, isDown: false });
  const portalTimer = useRef(0);
  const waveTimer = useRef(0);

  useEffect(() => {
    // Only run if we are in a playable state
    if (gameState !== 'SAFE_ZONE' && gameState !== 'PLAYING') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    // Input handlers
    const handleKeyDown = (e: KeyboardEvent) => { 
      keys.current[e.code] = true; 
      keys.current[e.key.toLowerCase()] = true; 
    };
    const handleKeyUp = (e: KeyboardEvent) => { 
      keys.current[e.code] = false; 
      keys.current[e.key.toLowerCase()] = false; 
    };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) mouse.current.isDown = true;
    };
    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) mouse.current.isDown = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    let animationFrameId: number;
    let lastShootTime = 0;

    const isMoving = () => {
      return keys.current['KeyW'] || keys.current['w'] || keys.current['ц'] || keys.current['ArrowUp'] ||
             keys.current['KeyS'] || keys.current['s'] || keys.current['ы'] || keys.current['ArrowDown'] ||
             keys.current['KeyA'] || keys.current['a'] || keys.current['ф'] || keys.current['ArrowLeft'] ||
             keys.current['KeyD'] || keys.current['d'] || keys.current['в'] || keys.current['ArrowRight'];
    };

    // Game Loop
    const loop = (timestamp: number) => {
      const p = player.current;

      // 1. Update Physics
      const accel = 0.6;
      const friction = 0.92;
      const maxSpeed = 10;

      if (keys.current['KeyW'] || keys.current['w'] || keys.current['ц'] || keys.current['ArrowUp']) p.vy -= accel;
      if (keys.current['KeyS'] || keys.current['s'] || keys.current['ы'] || keys.current['ArrowDown']) p.vy += accel;
      if (keys.current['KeyA'] || keys.current['a'] || keys.current['ф'] || keys.current['ArrowLeft']) p.vx -= accel;
      if (keys.current['KeyD'] || keys.current['d'] || keys.current['в'] || keys.current['ArrowRight']) p.vx += accel;

      p.vx *= friction;
      p.vy *= friction;

      // Limit speed
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (speed > maxSpeed) {
        p.vx = (p.vx / speed) * maxSpeed;
        p.vy = (p.vy / speed) * maxSpeed;
      }

      p.x += p.vx;
      p.y += p.vy;

      // Safe Zone Boundaries (Fit screen)
      const ZONE_WIDTH = (canvas.width / 2) - 40;
      const ZONE_HEIGHT = (canvas.height / 2) - 40;
      const PLAYER_RADIUS = 20;
      
      let inPortalZone = false;
      
      if (gameState === 'SAFE_ZONE') {
        if (p.x < -ZONE_WIDTH + PLAYER_RADIUS) { p.x = -ZONE_WIDTH + PLAYER_RADIUS; p.vx = 0; }
        if (p.x > ZONE_WIDTH - PLAYER_RADIUS) { p.x = ZONE_WIDTH - PLAYER_RADIUS; p.vx = 0; }
        if (p.y < -ZONE_HEIGHT + PLAYER_RADIUS) { p.y = -ZONE_HEIGHT + PLAYER_RADIUS; p.vy = 0; }
        if (p.y > ZONE_HEIGHT - PLAYER_RADIUS) { p.y = ZONE_HEIGHT - PLAYER_RADIUS; p.vy = 0; }
        
        // Check Arena Gate Portal
        if (p.x > ZONE_WIDTH - 60 && p.x < ZONE_WIDTH - 20 && p.y > -150 && p.y < 150) {
          inPortalZone = true;
          portalTimer.current += 16.66; // Approx delta time for 60fps
          
          if (portalTimer.current >= 2000) {
            portalTimer.current = 0;
            useGameStore.getState().setGameState('PLAYING');
          }
        } else {
          portalTimer.current = Math.max(0, portalTimer.current - 33.33); // decay quickly
        }
        
        // Update HUD efficiently
        const currentProgress = Math.min(100, (portalTimer.current / 2000) * 100);
        const store = useGameStore.getState();
        if (store.hud.inPortalZone !== inPortalZone || Math.abs(store.hud.portalProgress - currentProgress) > 2) {
          useGameStore.setState({ 
            hud: { ...store.hud, inPortalZone, portalProgress: currentProgress } 
          });
        }
      } else if (gameState === 'PLAYING') {
        // Arena Boundaries
        const ARENA_WIDTH = canvas.width / 2;
        const ARENA_HEIGHT = canvas.height / 2;
        if (p.x < -ARENA_WIDTH + PLAYER_RADIUS) { p.x = -ARENA_WIDTH + PLAYER_RADIUS; p.vx = 0; }
        if (p.x > ARENA_WIDTH - PLAYER_RADIUS) { p.x = ARENA_WIDTH - PLAYER_RADIUS; p.vx = 0; }
        if (p.y < -ARENA_HEIGHT + PLAYER_RADIUS) { p.y = -ARENA_HEIGHT + PLAYER_RADIUS; p.vy = 0; }
        if (p.y > ARENA_HEIGHT - PLAYER_RADIUS) { p.y = ARENA_HEIGHT - PLAYER_RADIUS; p.vy = 0; }
      }

      // Aiming
      const renderX = (x: number) => x + canvas.width / 2;
      const renderY = (y: number) => y + canvas.height / 2;

      // Mouse is relative to screen, so dx/dy is from player's render pos
      const dx = mouse.current.x - renderX(p.x);
      const dy = mouse.current.y - renderY(p.y);
      p.angle = Math.atan2(dy, dx);

      // Shooting
      if (mouse.current.isDown && timestamp - lastShootTime > 150) {
        const bulletSpeed = 15;
        projectiles.current.push({
          x: p.x + Math.cos(p.angle) * 20,
          y: p.y + Math.sin(p.angle) * 20,
          vx: Math.cos(p.angle) * bulletSpeed,
          vy: Math.sin(p.angle) * bulletSpeed,
          life: 100
        });
        lastShootTime = timestamp;
      }

      // Engine Particles
      if (isMoving()) {
        // Spawn particles behind the ship
        const exhaustX = p.x - Math.cos(p.angle) * 15;
        const exhaustY = p.y - Math.sin(p.angle) * 15;
        for (let i = 0; i < 3; i++) {
          const spread = 0.5;
          const pAngle = p.angle + Math.PI + (Math.random() - 0.5) * spread;
          const pSpeed = Math.random() * 3 + 2;
          particles.current.push({
            x: exhaustX,
            y: exhaustY,
            vx: Math.cos(pAngle) * pSpeed + (Math.random() - 0.5),
            vy: Math.sin(pAngle) * pSpeed + (Math.random() - 0.5),
            life: 30 + Math.random() * 20,
            maxLife: 50,
            size: Math.random() * 4 + 2,
            color: Math.random() > 0.5 ? '#ff0055' : '#ffaa00'
          });
        }
      }

      // Update projectiles
      for (let i = projectiles.current.length - 1; i >= 0; i--) {
        const proj = projectiles.current[i];
        proj.x += proj.vx;
        proj.y += proj.vy;
        proj.life--;
        
        let hit = false;
        // Collision with enemies
        for (let j = enemies.current.length - 1; j >= 0; j--) {
          const en = enemies.current[j];
          const dist = Math.hypot(en.x - proj.x, en.y - proj.y);
          if (dist < en.size + 4) { // hit
             en.hp -= 10;
             hit = true;
             // Spawn hit particles
             for(let k=0; k<5; k++) {
               particles.current.push({
                 x: proj.x, y: proj.y,
                 vx: (Math.random()-0.5)*5, vy: (Math.random()-0.5)*5,
                 life: 10 + Math.random()*10, maxLife: 20, size: 3, color: '#00f2ff'
               });
             }
             if (en.hp <= 0) {
               enemies.current.splice(j, 1);
               useGameStore.setState(s => ({ enemiesRemaining: s.enemiesRemaining - 1 }));
               // Explosion
               for(let k=0; k<15; k++) {
                 particles.current.push({
                   x: en.x, y: en.y,
                   vx: (Math.random()-0.5)*10, vy: (Math.random()-0.5)*10,
                   life: 20 + Math.random()*20, maxLife: 40, size: Math.random()*5+2, color: '#ff0055'
                 });
               }
             }
             break;
          }
        }
        
        if (hit || proj.life <= 0) projectiles.current.splice(i, 1);
      }
      
      // Update Enemies (Arena only)
      if (gameState === 'PLAYING') {
        const store = useGameStore.getState();
        if (!store.isWaveActive && store.enemiesRemaining === 0) {
          waveTimer.current += 16.66;
          if (waveTimer.current > 3000) {
             const nextWave = store.currentWave + 1;
             const spawnCount = nextWave * 3;
             useGameStore.setState({ isWaveActive: true, currentWave: nextWave, enemiesRemaining: spawnCount });
             for(let i=0; i<spawnCount; i++) {
                // Spawn randomly along the edges
                const edge = Math.floor(Math.random() * 4);
                let ex = 0, ey = 0;
                if (edge === 0) { ex = Math.random() * canvas.width - canvas.width/2; ey = -canvas.height/2 - 50; }
                if (edge === 1) { ex = Math.random() * canvas.width - canvas.width/2; ey = canvas.height/2 + 50; }
                if (edge === 2) { ex = -canvas.width/2 - 50; ey = Math.random() * canvas.height - canvas.height/2; }
                if (edge === 3) { ex = canvas.width/2 + 50; ey = Math.random() * canvas.height - canvas.height/2; }
                
                enemies.current.push({
                   x: ex, y: ey, vx: 0, vy: 0, hp: 30 + nextWave*5, maxHp: 30 + nextWave*5, size: 15, type: 'basic'
                });
             }
             waveTimer.current = 0;
          }
        } else if (store.isWaveActive && enemies.current.length === 0) {
          useGameStore.setState({ isWaveActive: false });
        }
        
        // Enemy AI
        for (let i = enemies.current.length - 1; i >= 0; i--) {
           const en = enemies.current[i];
           const angle = Math.atan2(p.y - en.y, p.x - en.x);
           en.vx += Math.cos(angle) * 0.1;
           en.vy += Math.sin(angle) * 0.1;
           // Friction
           en.vx *= 0.95;
           en.vy *= 0.95;
           en.x += en.vx;
           en.y += en.vy;
           
           // Player collision
           const dist = Math.hypot(en.x - p.x, en.y - p.y);
           if (dist < en.size + PLAYER_RADIUS) {
              // Push back
              p.vx += Math.cos(angle) * 10;
              p.vy += Math.sin(angle) * 10;
              en.hp -= 5; // take some damage from crash
              useGameStore.setState(s => ({ playerHp: Math.max(0, s.playerHp - 10) }));
           }
        }
      }

      // Update particles
      for (let i = particles.current.length - 1; i >= 0; i--) {
        const pt = particles.current[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life--;
        pt.size *= 0.95; // shrink
        if (pt.life <= 0 || pt.size < 0.5) particles.current.splice(i, 1);
      }

      // 2. Render
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const worldX = cx; // Camera is static at center
      const worldY = cy;

      if (gameState === 'SAFE_ZONE') {
        // Draw grid
        ctx.strokeStyle = 'rgba(0, 242, 255, 0.05)';
        ctx.lineWidth = 1;
        const gridSize = 100;
        
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x += gridSize) {
          ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height);
        }
        for (let y = 0; y < canvas.height; y += gridSize) {
          ctx.moveTo(0, y); ctx.lineTo(canvas.width, y);
        }
        ctx.stroke();

        // Draw boundary walls
        ctx.strokeStyle = '#00f2ff';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#00f2ff';
        ctx.shadowBlur = 15;
        ctx.strokeRect(worldX - ZONE_WIDTH, worldY - ZONE_HEIGHT, ZONE_WIDTH * 2, ZONE_HEIGHT * 2);
        ctx.shadowBlur = 0; // reset
        
        // Draw dashed safe-zone inner line
        ctx.strokeStyle = 'rgba(0, 242, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 10]);
        ctx.strokeRect(worldX - ZONE_WIDTH + 10, worldY - ZONE_HEIGHT + 10, ZONE_WIDTH * 2 - 20, ZONE_HEIGHT * 2 - 20);
        ctx.setLineDash([]);

        // DECORATIONS (Scaled down and brought closer)
        // Group of crates near warehouse
        ctx.fillStyle = 'rgba(255, 165, 0, 0.2)';
        ctx.strokeStyle = 'rgba(255, 165, 0, 0.6)';
        ctx.lineWidth = 2;
        [
          {x: -ZONE_WIDTH + 50, y: -ZONE_HEIGHT + 50, w: 40, h: 40}, 
          {x: -ZONE_WIDTH + 100, y: -ZONE_HEIGHT + 60, w: 60, h: 60}, 
          {x: -ZONE_WIDTH + 60, y: -ZONE_HEIGHT + 130, w: 50, h: 50},
        ].forEach(c => {
          ctx.fillRect(worldX + c.x, worldY + c.y, c.w, c.h);
          ctx.strokeRect(worldX + c.x, worldY + c.y, c.w, c.h);
        });

        // Glowing tech pillars
        ctx.fillStyle = 'rgba(0, 242, 255, 0.1)';
        ctx.strokeStyle = 'rgba(0, 242, 255, 0.5)';
        ctx.shadowColor = '#00f2ff';
        ctx.shadowBlur = 10;
        [
          {x: -200, y: -150}, {x: 200, y: -150}, {x: -200, y: 150}, {x: 200, y: 150},
        ].forEach(p => {
          ctx.beginPath();
          ctx.arc(worldX + p.x, worldY + p.y, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        });
        ctx.shadowBlur = 0;

        // Safe zone elements
        // Landing Pad
        ctx.strokeStyle = 'rgba(0, 255, 106, 0.3)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(worldX, worldY, 80, 0, Math.PI * 2);
        ctx.stroke();
        
        // Warehouse (Left-Top)
        ctx.fillStyle = 'rgba(255, 165, 0, 0.1)';
        ctx.strokeStyle = 'rgba(255, 165, 0, 0.8)';
        ctx.fillRect(worldX - ZONE_WIDTH + 20, worldY - 100, 100, 200);
        ctx.strokeRect(worldX - ZONE_WIDTH + 20, worldY - 100, 100, 200);
        ctx.fillStyle = 'rgba(255, 165, 0, 0.8)';
        ctx.font = '14px Orbitron';
        ctx.fillText('WAREHOUSE', worldX - ZONE_WIDTH + 30, worldY - 110);

        // Shop (Bottom)
        ctx.fillStyle = 'rgba(200, 0, 255, 0.1)';
        ctx.strokeStyle = 'rgba(200, 0, 255, 0.8)';
        ctx.fillRect(worldX - 100, worldY + ZONE_HEIGHT - 120, 200, 100);
        ctx.strokeRect(worldX - 100, worldY + ZONE_HEIGHT - 120, 200, 100);
        ctx.fillStyle = 'rgba(200, 0, 255, 0.8)';
        ctx.fillText('PARTS SHOP', worldX - 45, worldY + ZONE_HEIGHT - 130);

        // Arena Gate (Right)
        const progressRatio = portalTimer.current / 2000;
        const rColor = Math.floor(255 - progressRatio * 255);
        const gColor = Math.floor(progressRatio * 242);
        const bColor = Math.floor(progressRatio * 255);
        
        ctx.fillStyle = `rgba(${rColor}, ${gColor}, ${bColor}, 0.1)`;
        ctx.strokeStyle = `rgba(${rColor}, ${gColor}, ${bColor}, 0.8)`;
        ctx.fillRect(worldX + ZONE_WIDTH - 60, worldY - 150, 40, 300);
        ctx.strokeRect(worldX + ZONE_WIDTH - 60, worldY - 150, 40, 300);
        
        // Fill based on progress
        if (progressRatio > 0) {
          ctx.fillStyle = `rgba(0, 242, 255, 0.4)`;
          ctx.fillRect(worldX + ZONE_WIDTH - 60, worldY + 150 - (300 * progressRatio), 40, 300 * progressRatio);
        }
        
        ctx.fillStyle = `rgba(${rColor}, ${gColor}, ${bColor}, 0.8)`;
        ctx.fillText(inPortalZone ? 'INITIATING JUMP...' : 'ARENA PORTAL', worldX + ZONE_WIDTH - 150, worldY - 160);
      } else if (gameState === 'PLAYING') {
        // Render Arena Grid Background
        ctx.strokeStyle = 'rgba(255, 0, 85, 0.05)';
        ctx.lineWidth = 1;
        const gridSize = 100;
        
        // Dynamic grid movement based on player position to give sense of vastness
        const offsetX = (worldX - p.x) % gridSize;
        const offsetY = (worldY - p.y) % gridSize;
        
        ctx.beginPath();
        for (let x = offsetX - gridSize; x < canvas.width; x += gridSize) {
          ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height);
        }
        for (let y = offsetY - gridSize; y < canvas.height; y += gridSize) {
          ctx.moveTo(0, y); ctx.lineTo(canvas.width, y);
        }
        ctx.stroke();

        // Arena Border Warning
        const distToX = Math.min(Math.abs((canvas.width/2) - p.x), Math.abs((-canvas.width/2) - p.x));
        const distToY = Math.min(Math.abs((canvas.height/2) - p.y), Math.abs((-canvas.height/2) - p.y));
        const minDist = Math.min(distToX, distToY);
        
        if (minDist < 100) {
           ctx.fillStyle = `rgba(255, 0, 0, ${1 - minDist/100})`;
           ctx.fillRect(0, 0, canvas.width, 10);
           ctx.fillRect(0, canvas.height-10, canvas.width, 10);
           ctx.fillRect(0, 0, 10, canvas.height);
           ctx.fillRect(canvas.width-10, 0, 10, canvas.height);
        }
      }

      // Draw Particles
      ctx.globalCompositeOperation = 'screen';
      particles.current.forEach(pt => {
        ctx.beginPath();
        ctx.arc(renderX(pt.x), renderY(pt.y), pt.size, 0, Math.PI * 2);
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';

      // Draw projectiles
      ctx.fillStyle = '#00f2ff';
      ctx.shadowColor = '#00f2ff';
      ctx.shadowBlur = 10;
      projectiles.current.forEach(proj => {
        ctx.beginPath();
        ctx.arc(renderX(proj.x), renderY(proj.y), 4, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.shadowBlur = 0;

      // Draw Enemies
      enemies.current.forEach(en => {
        ctx.save();
        ctx.translate(renderX(en.x), renderY(en.y));
        const angle = Math.atan2(p.y - en.y, p.x - en.x);
        ctx.rotate(angle);
        
        // Enemy shape
        ctx.beginPath();
        ctx.moveTo(en.size, 0);
        ctx.lineTo(-en.size, en.size);
        ctx.lineTo(-en.size/2, 0);
        ctx.lineTo(-en.size, -en.size);
        ctx.closePath();
        
        ctx.fillStyle = 'rgba(255, 0, 85, 0.2)';
        ctx.fill();
        ctx.strokeStyle = '#ff0055';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#ff0055';
        ctx.shadowBlur = 15;
        ctx.stroke();
        
        // HP Bar
        ctx.rotate(-angle); // reset rotation for UI
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(-en.size, -en.size - 10, en.size * 2, 4);
        ctx.fillStyle = '#ff0055';
        ctx.fillRect(-en.size, -en.size - 10, (en.size * 2) * (en.hp / en.maxHp), 4);
        
        ctx.restore();
      });

      // Draw Player (dynamic position)
      ctx.save();
      ctx.translate(renderX(p.x), renderY(p.y));
      ctx.rotate(p.angle);
      
      // Ship shape (Triangle)
      ctx.beginPath();
      ctx.moveTo(20, 0);
      ctx.lineTo(-15, 15);
      ctx.lineTo(-10, 0);
      ctx.lineTo(-15, -15);
      ctx.closePath();
      
      ctx.fillStyle = 'rgba(0, 242, 255, 0.1)';
      ctx.fill();
      ctx.strokeStyle = '#00f2ff';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#00f2ff';
      ctx.shadowBlur = 10;
      ctx.stroke();
      
      ctx.restore();

      // Draw Crosshair at Mouse Position
      ctx.strokeStyle = 'rgba(0, 242, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(mouse.current.x, mouse.current.y, 10, 0, Math.PI * 2);
      ctx.moveTo(mouse.current.x - 15, mouse.current.y);
      ctx.lineTo(mouse.current.x + 15, mouse.current.y);
      ctx.moveTo(mouse.current.x, mouse.current.y - 15);
      ctx.lineTo(mouse.current.x, mouse.current.y + 15);
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(mouse.current.x, mouse.current.y, 2, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [gameState, canvasRef]);
}
