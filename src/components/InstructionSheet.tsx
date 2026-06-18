import React from 'react';
import { Smartphone, Shield, Key, Sparkles, CheckCircle } from 'lucide-react';
import { RobloxGame } from '../gamesData';

interface InstructionSheetProps {
  game: RobloxGame;
}

export const InstructionSheet: React.FC<InstructionSheetProps> = ({ game }) => {
  return (
    <div className="glass-morphism rounded-3xl p-5 md:p-6 shadow-2xl space-y-6 text-white bg-zinc-950/40 border border-white/5 backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2.5">
          <Smartphone className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white tracking-tight neon-text font-sans">Mobile Injection handbook</h2>
        </div>
        <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-400/20 px-2.5 py-1 rounded-xl font-mono font-bold tracking-tight">
          MOBILE RUNNERS READY
        </span>
      </div>

      {/* Warnings & Security */}
      <div className="p-4 bg-cyan-500/5 border border-cyan-400/20 rounded-2xl flex gap-3 text-cyan-200 text-xs">
        <Shield className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 animate-pulse" />
        <div className="space-y-1">
          <p className="font-bold text-white tracking-wide">Dynamic Anti-Detection</p>
          <p className="text-white/60 leading-relaxed font-sans">
            Zero features human-mimic packet delays and garbage collection masking. 
            Because you configured it with <span className="text-cyan-400 font-medium font-mono">Keyless Mode</span>, 
            the script will load instantly without any annoying dynamic URLs.
          </p>
        </div>
      </div>

      {/* Sequential Steps */}
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-white/5 text-cyan-400 text-xs font-mono font-bold border border-white/10 shrink-0">1</span>
            <div className="w-[1px] h-full bg-white/5 min-h-[40px]"></div>
          </div>
          <div className="pb-4">
            <h3 className="font-bold text-white text-sm">
              Prepare Cellphone / Emulator
            </h3>
            <p className="text-xs text-white/40 leading-relaxed mt-1 font-sans">
              Ensure you have a modern mobile executor updated and compatible with Roblox Mobile (Delta, Codex, Hydrogen, or Fluxus).
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-white/5 text-cyan-400 text-xs font-mono font-bold border border-white/10 shrink-0">2</span>
            <div className="w-[1px] h-full bg-white/5 min-h-[45px]"></div>
          </div>
          <div className="pb-4">
            <h3 className="font-bold text-white text-sm">Configure and Copy</h3>
            <p className="text-xs text-white/40 leading-relaxed mt-1">
              Adjust the sliders on the left (e.g. Walk Speed) to configure your preference. 
              Click the <span className="text-cyan-400 font-bold">COPY LOADSTRING</span> button to copy it to your clipboard.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-white/5 text-cyan-400 text-xs font-mono font-bold border border-white/10 shrink-0">3</span>
            <div className="w-[1px] h-full bg-white/5 min-h-[45px]"></div>
          </div>
          <div className="pb-4">
            <h3 className="font-bold text-white text-sm">Launch & Inject</h3>
            <p className="text-xs text-white/40 leading-relaxed mt-1">
              Launch Roblox on your phone. Start <span className="text-cyan-400 font-medium font-sans">{game.name}</span>. 
              Tap your floating executor icon, click paste, paste the loadstring, and hit <strong className="text-white">Execute</strong>.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-white/5 text-cyan-400 text-xs font-mono font-bold border border-cyan-500/20 shrink-0">4</span>
          </div>
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
              Enjoy Undetected!
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            </h3>
            <p className="text-xs text-white/40 leading-relaxed mt-1">
              The GUI HUD will slide in from index center. Use the mobile friendly HUD tools to toggle gameplay triggers and remain completely safe.
            </p>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-white/40">
        <span className="flex items-center gap-1 font-mono text-[10px]"><CheckCircle className="w-3.5 h-3.5 text-cyan-400" /> Status: UNDETECTED</span>
        <span className="flex items-center gap-1 font-mono text-[10px]"><Key className="w-3.5 h-3.5 text-cyan-400" /> Premium Keyless</span>
      </div>
    </div>
  );
};
