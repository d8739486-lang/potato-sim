const fs = require('fs');

// Fix chat.ts
let chatContent = fs.readFileSync('src/chat.ts', 'utf8');
chatContent = chatContent.replace('const friendReply = async (text: string, delay: number = 2000, typingCycles: number = 1) => {', 'const friendReply = async (text: string, delay: number = 2000) => {');
chatContent = chatContent.replace('  const updateGoal = (text: string) => {', '  const _updateGoal = (text: string) => {');
fs.writeFileSync('src/chat.ts', chatContent, 'utf8');

// Fix desktop.ts
let desktopContent = fs.readFileSync('src/desktop.ts', 'utf8');

// Remove unused 'lang' in initWindowsDesktop
desktopContent = desktopContent.replace('const lang = getLanguage();\n  \n  // Windows 11 Boot Sequence', '// Windows 11 Boot Sequence');

// Fix style cast in elements
desktopContent = desktopContent.replace(/const content = el.querySelector\('\.app-content'\);/g, 'const content = el.querySelector(\'.app-content\') as HTMLElement;');
desktopContent = desktopContent.replace(/const winEl = document.getElementById\(windowId\);/g, 'const winEl = document.getElementById(windowId) as HTMLElement;');
desktopContent = desktopContent.replace(/const contentEl = winEl\.querySelector\('\.app-content'\);/g, 'const contentEl = winEl.querySelector(\'.app-content\') as HTMLElement;');
desktopContent = desktopContent.replace(/winEl.style./g, 'if (winEl) winEl.style.');
desktopContent = desktopContent.replace(/contentEl.style./g, 'if (contentEl) contentEl.style.');
desktopContent = desktopContent.replace(/content.style./g, 'if (content) content.style.');

// More general fixes for Element to HTMLElement
desktopContent = desktopContent.replace(/const startMenu = document.getElementById\('startMenu'\);/g, 'const startMenu = document.getElementById(\'startMenu\') as HTMLElement;');
desktopContent = desktopContent.replace(/const searchMenu = document.getElementById\('searchMenu'\);/g, 'const searchMenu = document.getElementById(\'searchMenu\') as HTMLElement;');

fs.writeFileSync('src/desktop.ts', desktopContent, 'utf8');
console.log('Fixed TS errors.');
