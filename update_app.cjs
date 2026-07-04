const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Remove showComparison state
content = content.replace(/const \[showComparison, setShowComparison\] = useState<boolean>\(false\);\n/, '');

// Replace the entire block from {/* Customizer Toggle Header / Tab Selector */} to the end of the showComparison ternary
const blockRegex = /\{\/\* Customizer Toggle Header \/ Tab Selector \*\/\}[\s\S]*?\{\/\* Quick Promo Carousel cards \*\/\}/;

const replacement = `<div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch flex-1">
                  <div className="md:col-span-12 flex flex-col h-full font-mono transition-all duration-300">
                    <div className="bg-black/40 p-4 rounded-xl border border-white/5 font-mono shadow-inner flex items-center justify-between">
                      <pre className="text-cyan-300 whitespace-pre overflow-x-auto select-all text-xs">
                        {\`loadstring(game:HttpGet('\${activeGame.rawUrl}'))()\`}
                      </pre>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(\`loadstring(game:HttpGet('\${activeGame.rawUrl}'))()\`);
                          triggerToast("Copied loadstring to clipboard!");
                        }}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors flex-shrink-0 ml-4 cursor-pointer"
                        title="Copy Script"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="mt-4">
                      <InstructionSheet game={activeGame} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Promo Carousel cards */}`;

content = content.replace(blockRegex, replacement);

fs.writeFileSync('src/App.tsx', content);
