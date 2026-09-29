const fs = require('fs');

let dt = fs.readFileSync('src/desktop.ts', 'utf8');

// 1. Add CSS for animation
if (!dt.includes('taskbarItemIn')) {
    const cssToAdd = `
    @keyframes taskbarItemIn {
      0% { width: 0; opacity: 0; transform: translateY(10px) scale(0.8); margin: 0; }
      100% { width: 40px; opacity: 1; transform: translateY(0) scale(1); margin: 0; }
    }
    @keyframes taskbarItemOut {
      0% { width: 40px; opacity: 1; transform: scale(1); margin: 0; }
      100% { width: 0; opacity: 0; transform: scale(0.5); margin: 0; padding: 0; border: none; }
    }
    .taskbar-item.dynamic {
      animation: taskbarItemIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
      overflow: hidden;
    }
    .taskbar-item.dynamic.closing {
      animation: taskbarItemOut 0.2s ease-in forwards;
    }
`;
    dt = dt.replace('.system-tray {', cssToAdd + '\n    .system-tray {');
}

// 2. Add 'dynamic' class to newly created taskbar items
dt = dt.replace(
    "taskbarItem.className = 'taskbar-item';", 
    "taskbarItem.className = 'taskbar-item dynamic';"
);

// 3. Smooth close for taskbar items
const closeLogicOld = `      setTimeout(() => {
        overlay.remove();
        taskbarItem.remove();
        openWindows.delete(id);
      }, 200);`;

const closeLogicNew = `      taskbarItem.classList.add('closing');
      setTimeout(() => {
        overlay.remove();
        taskbarItem.remove();
        openWindows.delete(id);
      }, 200);`;

dt = dt.replace(closeLogicOld, closeLogicNew);

fs.writeFileSync('src/desktop.ts', dt, 'utf8');
console.log('Taskbar animations added');
