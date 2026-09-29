const fs = require('fs');
const path = require('path');
const p = path.join('c:', 'Users', 'user', 'Desktop', 'Projects', 'Pc Master 🖥️ - 3 chapter', 'src', 'desktop.ts');
let text = fs.readFileSync(p, 'utf8');

const target = `          content.innerHTML = wifiContentHtml;
        });
  document.getElementById('startMenuExplorer')?.addEventListener('click', openExplorer);`;

const target2 = `          content.innerHTML = wifiContentHtml;
        });
      }
    });
  };

  document.getElementById('startMenuExplorer')?.addEventListener('click', openExplorer);`;

const replacement = `          content.innerHTML = wifiContentHtml;
        });

        if (defenderTab) {
          defenderTab.addEventListener('click', () => {
            defenderTab.style.background = 'rgba(255,255,255,0.1)';
            defenderTab.style.opacity = '1';
            sysTab.style.background = 'transparent';
            sysTab.style.opacity = '0.7';
            wifiTab.style.background = 'transparent';
            wifiTab.style.opacity = '0.7';
            defenderTab.querySelector('i').style.color = '#ef4444'; 
            sysTab.querySelector('i').style.color = 'inherit';
            wifiTab.querySelector('i').style.color = 'inherit';
            
            content.innerHTML = defenderContentHtml;
          });
        }
      }
    });
  };

  const openBrowser = () => {
    startMenu?.classList.remove('open');
    const browserHtml = \`
      <div style="display: flex; flex-direction: column; height: 100%; background: #fff; color: #000;">
        <div style="display: flex; align-items: center; gap: 8px; padding: 8px 16px; background: #f1f3f4; border-bottom: 1px solid #ddd;">
          <div style="display: flex; gap: 8px; margin-right: 16px;">
            <i class="bi bi-arrow-left" style="font-size: 16px; color: #5f6368; cursor: pointer;"></i>
            <i class="bi bi-arrow-right" style="font-size: 16px; color: #5f6368; opacity: 0.5;"></i>
            <i class="bi bi-arrow-clockwise" style="font-size: 16px; color: #5f6368; cursor: pointer;"></i>
          </div>
          <div style="flex: 1; background: #fff; border-radius: 16px; border: 1px solid #ddd; padding: 6px 16px; display: flex; align-items: center; gap: 8px;">
            <i class="bi bi-google" style="color: #4285f4;"></i>
            <input id="browserSearchInput" type="text" placeholder="\${lang === 'RU' ? 'Введите поисковый запрос' : 'Search'}" style="flex: 1; border: none; outline: none; font-family: inherit; font-size: 14px; background: transparent; color: #000;">
            <i class="bi bi-send" id="browserSearchBtn" style="color: #4285f4; cursor: pointer;"></i>
          </div>
        </div>
        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px;">
          <h1 style="font-size: 3rem; margin: 0 0 32px 0; display: flex; gap: 4px;">
            <span style="color: #4285f4;">G</span>
            <span style="color: #ea4335;">o</span>
            <span style="color: #fbbc05;">o</span>
            <span style="color: #4285f4;">g</span>
            <span style="color: #34a853;">l</span>
            <span style="color: #ea4335;">e</span>
          </h1>
          <div style="width: 100%; max-width: 580px; position: relative;">
            <input type="text" style="width: 100%; padding: 12px 24px; border-radius: 24px; border: 1px solid #dfe1e5; outline: none; box-shadow: 0 1px 6px rgba(32,33,36,0.1); font-size: 16px;">
            <div style="position: absolute; right: 16px; top: 12px; display: flex; gap: 12px;">
              <i class="bi bi-mic" style="color: #4285f4;"></i>
              <i class="bi bi-camera" style="color: #4285f4;"></i>
            </div>
          </div>
        </div>
      </div>
    \`;

    openAppWindow('browser', lang === 'RU' ? 'Браузер' : 'Browser', '<i class="bi bi-globe2" style="font-size: 44px; color: #3b82f6; margin-bottom: 4px;"></i>', browserHtml, (body) => {
      const searchBtn = body.querySelector('#browserSearchBtn');
      const searchInput = body.querySelector('#browserSearchInput');

      const performSearch = () => {
        const val = searchInput.value.toLowerCase().trim();
        if (val === 'drweb' || val === 'dr web' || val === 'antivirus') {
          showWindowsError(lang === 'RU' ? 'Отказано в доступе' : 'Access Denied', lang === 'RU' ? 'У вас нет прав для выполнения этой операции. Обратитесь к администратору сети.' : 'You do not have permission to perform this operation. Contact your network administrator.');
          
          setTimeout(() => {
            const errorWindows = document.querySelectorAll('.app-window-anim');
            const latestError = errorWindows[errorWindows.length - 1];
            if (latestError && (latestError.innerHTML.includes('Отказано в доступе') || latestError.innerHTML.includes('Access Denied'))) {
              const closeBtn = latestError.querySelector('.close-btn');
              if (closeBtn) {
                const hoverListener = () => {
                  closeBtn.removeEventListener('mouseenter', hoverListener);
                  showWindowsError(lang === 'RU' ? 'Отказано в доступе' : 'Access Denied', lang === 'RU' ? 'У вас нет прав для выполнения этой операции. Обратитесь к администратору сети.' : 'You do not have permission to perform this operation. Contact your network administrator.');
                };
                closeBtn.addEventListener('mouseenter', hoverListener);
              }
            }
          }, 100);
        }
      };

      searchBtn?.addEventListener('click', performSearch);
      searchInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') performSearch();
      });
    });
  };

  document.getElementById('startMenuExplorer')?.addEventListener('click', openExplorer);`;

if (text.includes(target)) {
    text = text.replace(target, replacement);
    fs.writeFileSync(p, text, 'utf8');
    console.log('SUCCESS TARGET 1');
} else if (text.includes(target2)) {
    text = text.replace(target2, replacement);
    fs.writeFileSync(p, text, 'utf8');
    console.log('SUCCESS TARGET 2');
} else {
    console.log('NOT FOUND');
}
