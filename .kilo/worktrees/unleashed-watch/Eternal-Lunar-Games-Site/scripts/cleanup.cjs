const fs = require('fs');

function replaceInFile(path, replacements) {
    if (!fs.existsSync(path)) return;
    let content = fs.readFileSync(path, 'utf8');
    for (const [target, replacement] of replacements) {
        content = content.replace(target, replacement);
    }
    fs.writeFileSync(path, content, 'utf8');
}

replaceInFile('src/App.tsx', [
    ["import { Gamepad2, Terminal, Leaf, Worm, ArrowRight, Sparkles, Gpu } from 'lucide-react';", "import { Gamepad2, Terminal, ArrowRight, Sparkles } from 'lucide-react';"]
]);

replaceInFile('src/components/LoginModal.tsx', [
    ["z-[100]", "z-100"],
    ["flex md:block hidden w-full", "hidden md:block w-full"],
    ["hidden md:flex md:block w-full", "hidden md:block w-full"], // just in case
    ["block hidden md:flex", "hidden md:flex"], // depends on the exact line 71/86
]);

replaceInFile('src/components/ui/ImageCropper.tsx', [
    ["z-[100]", "z-100"]
]);

replaceInFile('src/features/api-keys/ApiKeysGenerator.tsx', [
    ["min-w-[700px]", "min-w-175"],
    ["hover:bg-white/[0.02]", "hover:bg-white/2"]
]);

console.log('Cleaned up IDE warnings!');
