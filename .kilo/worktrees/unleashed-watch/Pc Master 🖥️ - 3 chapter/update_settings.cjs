const fs = require('fs');

let dt = fs.readFileSync('src/desktop.ts', 'utf8');

const newSettingsHtml = `
  const getSettingsHtml = () => \`
    <div style="display: flex; flex: 1; height: 100%;">
      <!-- Sidebar -->
      <div style="width: 260px; border-right: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.2); padding: 24px 16px; display: flex; flex-direction: column; gap: 8px;">
        <div style="padding: 10px 16px; border-radius: 6px; background: rgba(255,255,255,0.1); cursor: pointer; display: flex; align-items: center; gap: 12px; font-weight: 500;">
          <i class="bi bi-laptop" style="font-size: 16px; color: #60a5fa;"></i> System Settings
        </div>
        <div style="padding: 10px 16px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 12px; opacity: 0.7; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='transparent'">
          <i class="bi bi-wifi" style="font-size: 16px;"></i> Wifi Settings
        </div>
      </div>

      <!-- Main Content -->
      <div style="flex: 1; display: flex; flex-direction: column; background: #202020; color: #fff; padding: 32px 40px; overflow-y: auto;">
        
        <!-- Breadcrumb -->
        <div style="display: flex; align-items: center; gap: 8px; font-size: 1rem; margin-bottom: 24px; color: #e0e0e0;">
          <span>System</span>
          <i class="bi bi-chevron-right" style="font-size: 12px; opacity: 0.7;"></i>
          <span style="font-weight: 600; font-size: 1.5rem; color: #fff;">About</span>
        </div>

        <!-- Top Cards -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 32px;">
          <!-- Card 1 -->
          <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 16px; display: flex; flex-direction: column;">
            <div style="display: flex; align-items: center; gap: 8px; color: #a1a1aa; font-size: 0.85rem; margin-bottom: 12px;">
              <i class="bi bi-device-hdd"></i> Storage
            </div>
            <div style="font-size: 1.4rem; font-weight: 600; margin-bottom: auto;">512 GB</div>
            <div style="font-size: 0.75rem; color: #a1a1aa; margin-top: 16px;">Используется 489 GB из 512 GB</div>
          </div>
          <!-- Card 2 -->
          <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 16px; display: flex; flex-direction: column;">
            <div style="display: flex; align-items: center; gap: 8px; color: #a1a1aa; font-size: 0.85rem; margin-bottom: 12px;">
              <i class="bi bi-gpu-card"></i> Graphics Card
            </div>
            <div style="font-size: 1.4rem; font-weight: 600; margin-bottom: auto;">4 GB</div>
            <div style="font-size: 0.75rem; color: #a1a1aa; margin-top: 16px;">NVIDIA GeForce RTX 3050</div>
          </div>
          <!-- Card 3 -->
          <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 16px; display: flex; flex-direction: column;">
            <div style="display: flex; align-items: center; gap: 8px; color: #a1a1aa; font-size: 0.85rem; margin-bottom: 12px;">
              <i class="bi bi-memory"></i> Installed RAM
            </div>
            <div style="font-size: 1.4rem; font-weight: 600; margin-bottom: auto;">16,0 GB</div>
            <div style="font-size: 0.75rem; color: #a1a1aa; margin-top: 16px;">Скорость: 3200 MT/c</div>
          </div>
          <!-- Card 4 -->
          <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 16px; display: flex; flex-direction: column;">
            <div style="display: flex; align-items: center; gap: 8px; color: #a1a1aa; font-size: 0.85rem; margin-bottom: 12px;">
              <i class="bi bi-cpu"></i> Processor
            </div>
            <div style="font-size: 1.1rem; font-weight: 600; line-height: 1.3; margin-bottom: auto;">AMD Ryzen 7 5800H</div>
            <div style="font-size: 0.75rem; color: #a1a1aa; margin-top: 16px;">3.20 GHz</div>
          </div>
        </div>

        <!-- Rename PC section -->
        <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <div>
            <div style="font-size: 1.1rem; font-weight: 500;">ASUS-TUF-GAMING-A15</div>
            <div style="font-size: 0.85rem; color: #a1a1aa; margin-top: 2px;">FA506IC</div>
          </div>
          <button style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.05); color: #fff; padding: 8px 16px; border-radius: 4px; font-family: inherit; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">Rename this PC</button>
        </div>

        <!-- Device Specs -->
        <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
          <div style="padding: 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05);">
            <div style="display: flex; align-items: center; gap: 12px; font-weight: 500;">
              <i class="bi bi-info-circle"></i> Device specifications
            </div>
            <button style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.05); color: #fff; padding: 6px 16px; border-radius: 4px; font-family: inherit; font-size: 0.85rem; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">Copy</button>
          </div>
          
          <div style="padding: 20px;">
            <div style="display: grid; grid-template-columns: 160px 1fr; gap: 12px; font-size: 0.85rem; margin-bottom: 8px;">
              <div style="color: #a1a1aa;">Device name</div>
              <div>ASUS-TUF-GAMING-A15</div>
            </div>
            <div style="display: grid; grid-template-columns: 160px 1fr; gap: 12px; font-size: 0.85rem; margin-bottom: 8px;">
              <div style="color: #a1a1aa;">Processor</div>
              <div>AMD Ryzen 7 5800H with Radeon Graphics (3.20 GHz)</div>
            </div>
            <div style="display: grid; grid-template-columns: 160px 1fr; gap: 12px; font-size: 0.85rem; margin-bottom: 8px;">
              <div style="color: #a1a1aa;">Installed RAM</div>
              <div>16,0 GB (доступно: 15,3 GB)</div>
            </div>
            <div style="display: grid; grid-template-columns: 160px 1fr; gap: 12px; font-size: 0.85rem; margin-bottom: 8px;">
              <div style="color: #a1a1aa;">Device ID</div>
              <div>9F8D7E6C-5B4A-3C2D-1E0F-A9B8C7D6E5F4</div>
            </div>
            <div style="display: grid; grid-template-columns: 160px 1fr; gap: 12px; font-size: 0.85rem; margin-bottom: 8px;">
              <div style="color: #a1a1aa;">Product ID</div>
              <div>00331-10000-00001-AA978</div>
            </div>
            <div style="display: grid; grid-template-columns: 160px 1fr; gap: 12px; font-size: 0.85rem; margin-bottom: 8px;">
              <div style="color: #a1a1aa;">System type</div>
              <div>64-разрядная операционная система, процессор x64</div>
            </div>
            <div style="display: grid; grid-template-columns: 160px 1fr; gap: 12px; font-size: 0.85rem; margin-bottom: 24px;">
              <div style="color: #a1a1aa;">Pen and touch</div>
              <div>No pen or touch input is available for this display</div>
            </div>

            <div style="display: flex; gap: 16px; font-size: 0.85rem;">
              <div style="font-weight: 600;">Related links</div>
              <a href="#" style="color: #60a5fa; text-decoration: none;">Domain or workgroup</a>
              <a href="#" style="color: #60a5fa; text-decoration: none;">System protection</a>
              <a href="#" style="color: #60a5fa; text-decoration: none;">Advanced system settings</a>
            </div>
          </div>
        </div>

      </div>
    </div>
  \`;
`;

// Replace old function with new one
const oldFuncRegex = /const getSettingsHtml = \(\) => `[\s\S]*?`;\n/;
dt = dt.replace(oldFuncRegex, newSettingsHtml);

// Also need to update the storage numbers in 'This PC' HTML to match
dt = dt.replace("93%", "95%"); // C drive filling up
dt = dt.replace("62,4 GB free of 953 GB", "23.0 GB free of 512 GB"); // For C drive
dt = dt.replace("953 GB", "512 GB");

fs.writeFileSync('src/desktop.ts', dt, 'utf8');
console.log('Done!');
