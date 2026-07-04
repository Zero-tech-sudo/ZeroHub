const fs = require('fs');
let code = fs.readFileSync('src/components/LuaScriptView.tsx', 'utf8');

const regex = /const cleanScript[\s\S]*?const handleCopy = \(\) => {/g;
const replacement = `const finalScriptText = isComingSoon ? "-- Coming Soon!" : \`loadstring(game:HttpGet('\${game.rawUrl}', true))()\`;

  const handleCopy = () => {`;
code = code.replace(regex, replacement);
fs.writeFileSync('src/components/LuaScriptView.tsx', code);
