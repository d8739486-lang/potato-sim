const fs = require('fs');

let content = fs.readFileSync('src/desktop.ts', 'utf8');

// Replace the div inside recycle bin with the recycle-item class and cursor pointer
content = content.replace(/<div style="display:flex; flex-direction:column; align-items:center; width: 80px; opacity: 0\.7;">/g, '<div class="recycle-item" style="display:flex; flex-direction:column; align-items:center; width: 80px; opacity: 0.7; cursor: pointer;">');

// Add getRecycleBinLogic
const logicStr = `  const getRecycleBinHtml = () => \``;
const newLogicStr = `  const getRecycleBinLogic = () => (body: HTMLElement) => {
    body.querySelectorAll('.recycle-item').forEach(el => {
      el.addEventListener('dblclick', () => {
        showWindowsError(lang === 'RU' ? 'Ошибка чтения' : 'Read Error', 
                         lang === 'RU' ? 'Файл поврежден и не может быть восстановлен.' : 'The file is damaged and cannot be restored.');
      });
    });
  };

  const getRecycleBinHtml = () => \``;
content = content.replace(logicStr, newLogicStr);

// Attach it to recycle bin opening
const openStr = `openAppWindow(id, title, iconHtml, getRecycleBinHtml());`;
const newOpenStr = `openAppWindow(id, title, iconHtml, getRecycleBinHtml(), getRecycleBinLogic());`;
content = content.replace(openStr, newOpenStr);

fs.writeFileSync('src/desktop.ts', content, 'utf8');
console.log('Added recycle bin logic');
