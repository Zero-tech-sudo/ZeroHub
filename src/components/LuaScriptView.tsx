import React, { useState } from 'react';
import { Terminal, Copy, Check, Info, Zap, Settings as SettingsIcon } from 'lucide-react';
import { RobloxGame } from '../gamesData';

interface LuaScriptViewProps {
  game: RobloxGame;
  customValues: {
    walkSpeed: number;
    jumpPower: number;
    extraToggles: Record<string, boolean>;
    extraSliders: Record<string, number>;
  };
}

export const LuaScriptView: React.FC<LuaScriptViewProps> = ({ game, customValues }) => {
  const [copied, setCopied] = useState(false);
  const [loaderType, setLoaderType] = useState<'clean' | 'advanced'>('clean');

  const isComingSoon = game.id === 'nights_forest' || (game.rawUrl && game.rawUrl.includes('nightsintheforest.lua'));

  // Compute advanced loader script with custom injected parameters
  const generateAdvancedScript = () => {
    if (isComingSoon) {
      return `-- [[ Zero Script Hub ]]\n-- Injected Loader for ${game.name}\n-- Coming Soon!`;
    }
    const configLines: string[] = [];
    configLines.push(`-- [[ Zero Script Hub - Injected Parameters ]]`);
    configLines.push(`_G.ZeroConfig = {`);
    configLines.push(`    Walkspeed = ${customValues.walkSpeed},`);
    configLines.push(`    JumpPower = ${customValues.jumpPower},`);
    
    // Inject custom game-specific toggles
    Object.entries(customValues.extraToggles).forEach(([key, val]) => {
      // capitalize first letter key to conform to roblox script conventions or keep literal
      const formattedKey = key;
      configLines.push(`    ${formattedKey} = ${val ? 'true' : 'false'},`);
    });

    // Inject custom game-specific sliders
    Object.entries(customValues.extraSliders).forEach(([key, val]) => {
      configLines.push(`    ${key} = ${val},`);
    });

    configLines.push(`    Theme = "cyber",`);
    configLines.push(`    Keyless = true`);
    configLines.push(`}`);
    configLines.push(``);
    configLines.push(`loadstring(game:HttpGet("${game.rawUrl}", true))()`);
    
    return configLines.join('\n');
  };

  const cleanScript = isComingSoon 
    ? `-- [[ Zero Script Hub ]]\n-- Coming Soon!` 
    : `loadstring(game:HttpGet("${game.rawUrl}", true))()`;
  const displayedScript = loaderType === 'clean' ? cleanScript : generateAdvancedScript();

  const handleCopy = () => {
    navigator.clipboard.writeText(displayedScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = displayedScript.split('\n').length;
  const byteCount = new Blob([displayedScript]).size;

  return (
    <div className="glass-morphism rounded-3xl overflow-hidden shadow-2xl flex flex-col h-full border border-white/5 bg-zinc-950/40 backdrop-blur-xl">
      {/* Top Banner and Tabs */}
      <div className="bg-white/3 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:px-5 gap-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono text-zinc-100 font-bold tracking-tight">
            Zero Loader / <span className="text-cyan-400 font-sans">{game.name}</span>
          </span>
        </div>

        {/* Dynamic Loader Switcher */}
        <div className="flex bg-black/40 p-0.5 rounded-xl border border-white/5 self-start sm:self-center">
          <button
            onClick={() => setLoaderType('clean')}
            className={`px-3 py-1 text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              loaderType === 'clean'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-white/40 hover:text-white/70 border border-transparent'
            }`}
          >
            <Zap className="w-3 h-3 text-amber-400" />
            Compact Loader
          </button>
          <button
            onClick={() => setLoaderType('advanced')}
            className={`px-3 py-1 text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              loaderType === 'advanced'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-white/40 hover:text-white/70 border border-transparent'
            }`}
          >
            <SettingsIcon className="w-3 h-3 text-cyan-400" />
            Injected Loader
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-white/30 hidden lg:inline">
            {lineCount} {lineCount === 1 ? 'line' : 'lines'} | {byteCount} bytes
          </span>
          <button
            onClick={handleCopy}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
              copied
                ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                : 'accent-button text-white shadow-[0_4px_12px_rgba(6,182,212,0.15)] hover:shadow-[0_4px_20px_rgba(6,182,212,0.3)]'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3px]" /> COPIED!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> COPY LOADSTRING
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Editor Panel */}
      <div className="p-5 bg-black/45 flex-1 overflow-y-auto max-h-[460px] min-h-[160px] font-mono text-xs text-cyan-300/90 leading-relaxed scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">
        <div className="space-y-4">
          <div className="text-[10px] text-zinc-400 bg-white/5 border border-white/5 rounded-xl px-3 py-2 leading-relaxed flex items-start gap-2.5">
            <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>
              {loaderType === 'clean' ? (
                <span>
                  <strong className="text-white/80 font-semibold font-sans">Clean Loadstring (Recommended)</strong>: This is the exact, ultra-compact launcher script. Copy and execute it to automatically fetch the updated cloud features dynamically. No bulky configs required!
                </span>
              ) : (
                <span>
                  <strong className="text-white/80 font-semibold font-sans">Custom Injected Loader</strong>: Use this if you want to preload customized walking, jumping, or autofarm behaviors directly in Roblox global environment.
                </span>
              )}
            </span>
          </div>
          <pre className="whitespace-pre overflow-x-auto select-all bg-black/40 p-4 rounded-xl border border-white/5 font-mono text-xs text-amber-300/95 selection:bg-cyan-500/20 shadow-inner leading-relaxed">
            <code>{displayedScript}</code>
          </pre>
        </div>
      </div>

      {/* Meta/Tips Footer */}
      <div className="bg-black/20 p-3.5 px-5 border-t border-white/5 text-[11px] text-white/40 flex items-center gap-2">
        <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <span>
          Auto-updates instantly live on the cloud. When we push a patch, your loader script remains 100% untouched.
        </span>
      </div>
    </div>
  );
};
