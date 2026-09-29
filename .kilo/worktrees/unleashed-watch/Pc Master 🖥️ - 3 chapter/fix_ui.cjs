const fs = require('fs');

let dt = fs.readFileSync('src/desktop.ts', 'utf8');

dt = dt.replace("titleDiv.style.cssText = 'display: flex; align-items: center; gap: 10px; font-size: 0.85rem; opacity: 0.9; font-weight: 500;';", "titleDiv.style.cssText = 'display: flex; align-items: center; gap: 10px; font-size: 0.85rem; opacity: 0.9; font-weight: 500; color: #fff;';");

dt = dt.replace("contentContainer.style.cssText = 'width: 800px; height: 500px; background: rgba(20,20,20,0.95); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.5);';", "contentContainer.style.cssText = 'width: 100%; height: calc(100% - 48px); margin-bottom: 48px; background: rgba(20,20,20,0.95); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1); border-radius: 0; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.5);';");

dt = dt.replace("const getRecycleBinHtml = () => `\n    <div style=\"padding: 24px; display: flex; gap: 24px; flex-wrap: wrap;\">\n      </div>\n    </div>\n  `;", "const getRecycleBinHtml = () => `\n    <div style=\"padding: 24px; display: flex; gap: 24px; flex-wrap: wrap;\">\n      <div style=\"display:flex; flex-direction:column; align-items:center; width: 100%; padding: 10px; opacity: 0.5;\">\n        <span style=\"font-size: 1rem; text-align: center;\">${lang === 'RU' ? 'Корзина пуста' : 'Recycle Bin is empty'}</span>\n      </div>\n    </div>\n  `;");

fs.writeFileSync('src/desktop.ts', dt, 'utf8');

let mnu = fs.readFileSync('src/menu.ts', 'utf8');
mnu = mnu.replace('V0.0.2 DEMO', 'V0.0.3 DEMO');
mnu = mnu.replace('V0.0.2 DEMO (ТЕКУЩАЯ)', 'V0.0.3 DEMO (ТЕКУЩАЯ)');
fs.writeFileSync('src/menu.ts', mnu, 'utf8');

let upd = fs.readFileSync('update_log.md', 'utf8');
upd = upd.replace('## [0.0.1]', '## [0.0.3] - 2026-07-13\n### DESKTOP UPDATES\n- Реализована полноценная логика окон (на весь экран).\n- Добавлен "изношенный" вид системы (заполненный диск C:, меньше ОЗУ).\n- Исправлены цвета заголовков окон.\n- Настроено плавное появление иконок.\n\n## [0.0.1]');
fs.writeFileSync('update_log.md', upd, 'utf8');

// Also for desktop icons smooth appearance, let's update style.css
let css = fs.readFileSync('src/style.css', 'utf8');
if(!css.includes('@keyframes fadeInIcon')) {
    css += `\n
@keyframes fadeInIcon {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.desktop-icon {
  animation: fadeInIcon 0.5s ease-out forwards;
}
.desktop-icon:nth-child(1) { animation-delay: 0.1s; }
.desktop-icon:nth-child(2) { animation-delay: 0.2s; }
.desktop-icon:nth-child(3) { animation-delay: 0.3s; }
.desktop-icon:nth-child(4) { animation-delay: 0.4s; }
`;
    fs.writeFileSync('src/style.css', css, 'utf8');
}

console.log('Fixed UI issues');
