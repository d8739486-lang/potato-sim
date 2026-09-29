const fs = require('fs');

let desktopContent = fs.readFileSync('src/desktop.ts', 'utf8');

// 1. Add global mouse tracking and fake cursor DOM
if (!desktopContent.includes('let globalMouseX = 0;')) {
    desktopContent = desktopContent.replace(
        "export function initWindowsDesktop(): void {",
        `export let globalMouseX = 0;
export let globalMouseY = 0;

window.addEventListener('mousemove', (e) => {
  globalMouseX = e.clientX;
  globalMouseY = e.clientY;
});

export function initWindowsDesktop(): void {`
    );
}

// 2. Add fake cursor to desktop innerHTML
const fakeCursorHtml = `
      <!-- Fake Cursor -->
      <img id="fakeCursor" src="/assets/images/phone/icons/cursor.png" style="position: fixed; width: 24px; height: 24px; pointer-events: none; z-index: 99999999; display: none; transition: transform 0.8s cubic-bezier(0.25, 1, 0.5, 1);" />
`;
// Let's just create the fake cursor dynamically inside the cutscene logic to avoid messing with desktop.ts innerHTML too much.

// 3. Update the avalon_folder click handler
const oldAvalonClick = `      if (id === 'avalon_folder') {
        showWindowsError('AVALON', lang === 'RU' ? "Катсцена AVALON (будет реализовано позже)" : "AVALON Cutscene (To be implemented)");
      }`;
const newAvalonClick = `      if (id === 'avalon_folder') {
        import('./avalonCutscene').then(module => module.startAvalonCutscene());
      }`;
desktopContent = desktopContent.replace(oldAvalonClick, newAvalonClick);

fs.writeFileSync('src/desktop.ts', desktopContent, 'utf8');
console.log('Updated desktop.ts for AVALON cutscene');
