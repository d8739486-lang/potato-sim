// src/main.ts
import { initPreloader } from './system';

document.addEventListener('DOMContentLoaded', () => {
  // Disable default right-click context menu
  document.addEventListener('contextmenu', (e) => e.preventDefault());
  
  // Global button click throttle (1 second limit)
  const buttonTimestamps = new WeakMap<HTMLElement, number>();
  
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    // Apply to buttons, taskbar items, and app icons (exclude desktop icons to preserve double-click)
    const btn = target.closest('button, .taskbar-item, .app-icon, .system-btn, .close-btn') as HTMLElement;
    
    if (btn) {
      const now = Date.now();
      const lastClick = buttonTimestamps.get(btn) || 0;
      if (now - lastClick < 1000) {
        e.stopPropagation();
        e.preventDefault();
        return;
      }
      buttonTimestamps.set(btn, now);
    }
  }, true); // Use capture phase
  
  initPreloader();
});
