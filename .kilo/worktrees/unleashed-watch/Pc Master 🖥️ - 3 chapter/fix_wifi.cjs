const fs = require('fs');

let dt = fs.readFileSync('src/desktop.ts', 'utf8');

// 1. Fix frequencies and RAM terminology
dt = dt.replace('AMD Ryzen 7 5800H with Radeon Graphics (3.20 GHz)', 'AMD Ryzen 7 5800H with Radeon Graphics   3.20 GHz');
dt = dt.replace('Скорость: 3200 MT/c', 'Скорость: 3200 MHz');

// 2. Add IDs for tabs
dt = dt.replace(
  '<div style="padding: 10px 16px; border-radius: 6px; background: rgba(255,255,255,0.1); cursor: pointer; display: flex; align-items: center; gap: 12px; font-weight: 500;">',
  '<div id="sysTab" style="padding: 10px 16px; border-radius: 6px; background: rgba(255,255,255,0.1); cursor: pointer; display: flex; align-items: center; gap: 12px; font-weight: 500;">'
);
dt = dt.replace(
  '<div style="padding: 10px 16px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 12px; opacity: 0.7; transition: all 0.2s;" onmouseover="this.style.background=\\\'rgba(255,255,255,0.05)\\\'\" onmouseout="this.style.background=\\\'transparent\\\'\">',
  '<div id="wifiTab" style="padding: 10px 16px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 12px; opacity: 0.7; transition: all 0.2s;" onmouseover="this.style.background=\\\'rgba(255,255,255,0.05)\\\'\" onmouseout="this.style.background=\\\'transparent\\\'\">'
);

// 3. Add ID to content area
dt = dt.replace(
  '<div style="flex: 1; display: flex; flex-direction: column; background: #202020; color: #fff; padding: 32px 40px; overflow-y: auto;">',
  '<div id="settingsContent" style="flex: 1; display: flex; flex-direction: column; background: #202020; color: #fff; padding: 32px 40px; overflow-y: auto;">'
);

// 4. Update openAppWindow call for settings to include customLogic
const oldSettingsCall = "openAppWindow('settings', lang === 'RU' ? 'Параметры' : 'Settings', '<i class=\"bi bi-gear-fill\" style=\"font-size: 44px; color: #94a3b8; margin-bottom: 4px;\"></i>', getSettingsHtml());";

const newSettingsCall = `openAppWindow('settings', lang === 'RU' ? 'Параметры' : 'Settings', '<i class="bi bi-gear-fill" style="font-size: 44px; color: #94a3b8; margin-bottom: 4px;"></i>', getSettingsHtml(), (body) => {
      const sysTab = body.querySelector('#sysTab');
      const wifiTab = body.querySelector('#wifiTab');
      const content = body.querySelector('#settingsContent');

      // Store initial sys content
      const sysContentHtml = content.innerHTML;

      const wifiContentHtml = \`
        <div style="display: flex; align-items: center; gap: 8px; font-size: 1rem; margin-bottom: 24px; color: #e0e0e0;">
          <span>Network & internet</span>
          <i class="bi bi-chevron-right" style="font-size: 12px; opacity: 0.7;"></i>
          <span style="font-weight: 600; font-size: 1.5rem; color: #fff;">Wi-Fi</span>
        </div>
        <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <div style="display: flex; align-items: center; gap: 16px;">
            <i class="bi bi-wifi" style="font-size: 24px; color: #60a5fa;"></i>
            <div>
              <div style="font-size: 1.1rem; font-weight: 500;">Wi-Fi</div>
              <div style="font-size: 0.85rem; color: #a1a1aa; margin-top: 2px;">On</div>
            </div>
          </div>
          <div style="width: 44px; height: 24px; background: #60a5fa; border-radius: 12px; position: relative; cursor: pointer;">
            <div style="width: 18px; height: 18px; background: #fff; border-radius: 50%; position: absolute; right: 3px; top: 3px;"></div>
          </div>
        </div>
        
        <div style="font-size: 1.1rem; font-weight: 600; margin-bottom: 16px;">Available networks</div>
        
        <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
          <div style="padding: 16px 20px; display: flex; align-items: center; gap: 16px; border-bottom: 1px solid rgba(255,255,255,0.05); background: rgba(255,255,255,0.02);">
            <i class="bi bi-wifi" style="font-size: 20px;"></i>
            <div style="flex: 1;">
              <div style="font-weight: 500;">HomeNetwork_5G</div>
              <div style="font-size: 0.85rem; color: #a1a1aa;">Connected, secured</div>
            </div>
            <i class="bi bi-info-circle" style="font-size: 18px; color: #a1a1aa; cursor: pointer;"></i>
          </div>
          <div style="padding: 16px 20px; display: flex; align-items: center; gap: 16px; border-bottom: 1px solid rgba(255,255,255,0.05);">
            <i class="bi bi-wifi-2" style="font-size: 20px;"></i>
            <div style="flex: 1;">
              <div style="font-weight: 500;">Guest_WIFI</div>
              <div style="font-size: 0.85rem; color: #a1a1aa;">Secured</div>
            </div>
          </div>
          <div style="padding: 16px 20px; display: flex; align-items: center; gap: 16px;">
            <i class="bi bi-wifi-1" style="font-size: 20px;"></i>
            <div style="flex: 1;">
              <div style="font-weight: 500;">Neighbor_Network</div>
              <div style="font-size: 0.85rem; color: #a1a1aa;">Secured</div>
            </div>
          </div>
        </div>
      \`;

      if (sysTab && wifiTab && content) {
        sysTab.addEventListener('click', () => {
          sysTab.style.background = 'rgba(255,255,255,0.1)';
          sysTab.style.opacity = '1';
          wifiTab.style.background = 'transparent';
          wifiTab.style.opacity = '0.7';
          sysTab.querySelector('i').style.color = '#60a5fa';
          wifiTab.querySelector('i').style.color = 'inherit';
          content.innerHTML = sysContentHtml;
        });

        wifiTab.addEventListener('click', () => {
          wifiTab.style.background = 'rgba(255,255,255,0.1)';
          wifiTab.style.opacity = '1';
          sysTab.style.background = 'transparent';
          sysTab.style.opacity = '0.7';
          wifiTab.querySelector('i').style.color = '#60a5fa';
          sysTab.querySelector('i').style.color = 'inherit';
          content.innerHTML = wifiContentHtml;
        });
      }
    });`;

dt = dt.replace(oldSettingsCall, newSettingsCall);

fs.writeFileSync('src/desktop.ts', dt, 'utf8');
console.log('Wifi settings added');
