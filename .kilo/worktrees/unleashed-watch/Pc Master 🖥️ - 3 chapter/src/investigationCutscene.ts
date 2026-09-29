/**
 * Investigation Cutscene Engine with Autonomous Smooth Animated Cursor
 * Supports branching paths [1], [2], [3] and QTE player mouse actions
 */

export interface ICinematicCursor {
  element: HTMLElement;
  moveTo: (x: number, y: number, durationMs?: number) => Promise<void>;
  clickAnim: () => Promise<void>;
  doubleClickAnim: () => Promise<void>;
  rightClickAnim: () => Promise<void>;
  destroy: () => void;
}

let globalMouseX = window.innerWidth / 2;
let globalMouseY = window.innerHeight / 2;

if (typeof window !== 'undefined') {
  window.addEventListener('mousemove', (e) => {
    globalMouseX = e.clientX;
    globalMouseY = e.clientY;
  });
}

export function getGlobalMousePos() {
  return { x: globalMouseX, y: globalMouseY };
}

export function createCinematicCursor(startX = globalMouseX, startY = globalMouseY): ICinematicCursor {
  const existing = document.getElementById('cinematicFakeCursor');
  if (existing) existing.remove();

  // 1. Hide real OS cursor globally across the entire screen
  let cursorNoneStyle = document.getElementById('cinematicCursorNoneStyle') as HTMLStyleElement;
  if (!cursorNoneStyle) {
    cursorNoneStyle = document.createElement('style');
    cursorNoneStyle.id = 'cinematicCursorNoneStyle';
    cursorNoneStyle.innerHTML = `* { cursor: none !important; }`;
    document.head.appendChild(cursorNoneStyle);
  }

  // 2. Exact in-game cursor matching Avalon cutscene design (with maximum z-index to stay on top of all windows)
  const cursor = document.createElement('div');
  cursor.id = 'cinematicFakeCursor';
  cursor.style.cssText = `
    position: fixed; left: 0; top: 0;
    width: 24px; height: 32px;
    z-index: 2147483647; pointer-events: none;
    transform: translate(${startX}px, ${startY}px);
    transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
    filter: drop-shadow(0 4px 10px rgba(0,0,0,0.85));
  `;

  cursor.innerHTML = `
    <svg width="24" height="32" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 0V22L6 17L10.5 26L13.5 24.5L9 15.5L16 15.5L0 0Z" fill="white" stroke="black" stroke-width="2" stroke-linejoin="miter"/>
    </svg>
  `;

  document.body.appendChild(cursor);

  let curX = startX;
  let curY = startY;

  return {
    element: cursor,
    moveTo(x: number, y: number, durationMs = 600): Promise<void> {
      return new Promise((resolve) => {
        curX = x;
        curY = y;
        cursor.style.transition = `transform ${durationMs}ms cubic-bezier(0.22, 1, 0.36, 1)`;
        cursor.style.transform = `translate(${x}px, ${y}px)`;
        setTimeout(resolve, durationMs + 50);
      });
    },
    clickAnim(): Promise<void> {
      return new Promise((resolve) => {
        cursor.style.transform = `translate(${curX}px, ${curY}px) scale(0.85)`;
        setTimeout(() => {
          cursor.style.transform = `translate(${curX}px, ${curY}px) scale(1)`;
          setTimeout(resolve, 150);
        }, 120);
      });
    },
    doubleClickAnim(): Promise<void> {
      return new Promise((resolve) => {
        cursor.style.transform = `translate(${curX}px, ${curY}px) scale(0.85)`;
        setTimeout(() => {
          cursor.style.transform = `translate(${curX}px, ${curY}px) scale(1)`;
          setTimeout(() => {
            cursor.style.transform = `translate(${curX}px, ${curY}px) scale(0.85)`;
            setTimeout(() => {
              cursor.style.transform = `translate(${curX}px, ${curY}px) scale(1)`;
              setTimeout(resolve, 150);
            }, 100);
          }, 100);
        }, 100);
      });
    },
    rightClickAnim(): Promise<void> {
      return new Promise((resolve) => {
        cursor.style.transform = `translate(${curX}px, ${curY}px) rotate(10deg) scale(0.9)`;
        setTimeout(() => {
          cursor.style.transform = `translate(${curX}px, ${curY}px) rotate(0deg) scale(1)`;
          setTimeout(resolve, 150);
        }, 120);
      });
    },
    destroy() {
      cursor.remove();
      const style = document.getElementById('cinematicCursorNoneStyle');
      if (style) style.remove();
    }
  };
}

/**
 * Creates an interactive QTE prompt that blocks until player clicks required mouse button
 */
export function waitForPlayerClick(
  promptText: string,
  targetX: number,
  targetY: number,
  mouseButton: 'left' | 'right' | 'double' = 'left'
): Promise<void> {
  return new Promise((resolve) => {
    const existing = document.getElementById('questGuidePrompt');
    if (existing) existing.remove();

    const prompt = document.createElement('div');
    prompt.id = 'questGuidePrompt';
    prompt.style.cssText = `
      position: fixed; left: ${targetX}px; top: ${targetY - 54}px;
      background: rgba(15, 23, 42, 0.96);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(56, 189, 248, 0.5);
      box-shadow: 0 8px 30px rgba(0,0,0,0.7), 0 0 15px rgba(56, 189, 248, 0.3);
      color: #fff; padding: 8px 18px; border-radius: 6px;
      font-size: 13.5px; font-weight: 600; font-family: 'Segoe UI', sans-serif;
      z-index: 10000000; box-sizing: border-box; max-width: calc(100vw - 40px);
      transform: translateX(-50%); cursor: pointer;
      display: flex; align-items: center; gap: 8px;
      animation: promptPulse 1.8s infinite ease-in-out;
    `;

    const icon = mouseButton === 'right' ? 'bi-mouse-fill' : 'bi-cursor-fill';
    prompt.innerHTML = `
      <i class="bi ${icon}" style="color: #38bdf8; font-size: 15px;"></i>
      <span>${promptText}</span>
    `;

    document.body.appendChild(prompt);

    const onDone = () => {
      prompt.remove();
      resolve();
    };

    if (mouseButton === 'left') {
      const clickHandler = () => {
        window.removeEventListener('mousedown', clickHandler);
        onDone();
      };
      window.addEventListener('mousedown', clickHandler);
    } else if (mouseButton === 'right') {
      const contextHandler = (e: MouseEvent) => {
        e.preventDefault();
        window.removeEventListener('contextmenu', contextHandler);
        onDone();
      };
      window.addEventListener('contextmenu', contextHandler);
    } else if (mouseButton === 'double') {
      let clickCount = 0;
      let clickTimer: any = null;
      const dblHandler = () => {
        clickCount++;
        if (clickCount === 1) {
          clickTimer = setTimeout(() => { clickCount = 0; }, 400);
        } else if (clickCount >= 2) {
          clearTimeout(clickTimer);
          window.removeEventListener('mousedown', dblHandler);
          onDone();
        }
      };
      window.addEventListener('mousedown', dblHandler);
    }
  });
}
