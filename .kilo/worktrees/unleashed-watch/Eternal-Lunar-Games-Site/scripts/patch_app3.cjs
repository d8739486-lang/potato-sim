const fs = require('fs');

const path = 'src/App.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace the line defining chaptersText
const targetStr = "const chaptersText = project.chaptersText || (isGame ? 'Играть онлайн' : 'Версия 1.20+');";
const replacementStr = `const modloaderText = project.modloader || 'Forge';
              const mcVersionText = project.mc_version || '1.20+';
              const chaptersText = project.chaptersText || (isGame ? 'Играть онлайн' : \`\${modloaderText} \${mcVersionText}\`);`;

content = content.replace(targetStr, replacementStr);

fs.writeFileSync(path, content, 'utf8');
console.log('App.tsx patched for mod versions.');
