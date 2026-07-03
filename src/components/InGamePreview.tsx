import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, X, Tv, ShieldCheck, Activity, Wifi, Cpu, Layers, 
  Terminal, Sparkles, Check, ChevronRight, Zap, Target, Eye, Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RobloxGame } from '../gamesData';
import { ForestSimulator } from './ForestSimulator';

interface InGamePreviewProps {
  game: RobloxGame;
  onClose: () => void;
  theme: 'studio-light' | 'studio-dark' | 'neon' | 'ultradark';
  triggerToast: (msg: string) => void;
  onImportToSandbox?: (code: string) => void;
}

export function InGamePreview({ game, onClose, theme, triggerToast, onImportToSandbox }: InGamePreviewProps) {
  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0); // 0 to 100 representing 5 seconds
  const [fps, setFps] = useState<number>(60);
  const [ping, setPing] = useState<number>(14);

  // Active toggles for preview hacks (users can interact live!)
  const [activeToggles, setActiveToggles] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {
      esp: true,
      autofarm: true,
      speed: true,
      magnet: false,
    };
    return initial;
  });

  // Dynamic values in gameplay
  const [coinsCollected, setCoinsCollected] = useState<number>(2450);
  const [levelProgress, setLevelProgress] = useState<number>(45);

  // Console log state
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    '[ZeroHub] Version 4.1.5 Loader Injected.',
    '[ZeroHub] Contacting secure bypass databases...',
    '[ZeroShield] Anti-cheat bypassed successfully.',
  ]);

  // Handle active game's raw Luau code or a mock compilation code
  const handleImport = () => {
    if (onImportToSandbox) {
      const codeToLoad = `-- ZeroHub Script Executor Loader for ${game.name}\n-- Loaded via live In-Game Simulator\n\n_G.WalkSpeed = ${game.settings.walkSpeed}\n_G.JumpPower = ${game.settings.jumpPower}\n_G.AutoFarm = ${activeToggles.autofarm ? 'true' : 'false'}\n_G.ESPActive = ${activeToggles.esp ? 'true' : 'false'}\n\nloadstring(game:HttpGet("${game.rawUrl}"))()`;
      onImportToSandbox(codeToLoad);
      triggerToast(`Imported ${game.name} compiled config to the Script Sandbox!`);
      onClose();
    }
  };

  // 5-second timer loop logic
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            // Loop restart: Reset values slightly for realistic flow
            setCoinsCollected((c) => c + Math.floor(Math.random() * 15) + 5);
            setLevelProgress((l) => (l >= 95 ? 10 : l + 5));
            
            // Add a cyclic log
            setConsoleLogs((logs) => {
              const currentLogs = [...logs];
              if (currentLogs.length > 6) currentLogs.shift();
              const possibleLogs = [
                `[ZeroHub] Syncing character location coordinates...`,
                `[ZeroHub] Magnetic pull executed on nearby loot items.`,
                `[ZeroShield] Blocking remote Roblox anti-cheat telemetry...`,
                `[ZeroHub] Compilation frame loaded (60.0 FPS).`,
                `[ZeroHub] Safe mode cycle completed.`,
              ];
              const randomLog = possibleLogs[Math.floor(Math.random() * possibleLogs.length)];
              return [...currentLogs, randomLog];
            });

            return 0;
          }
          return prev + 2; // Increments to reach 100 in ~5 seconds (50 steps)
        });

        // Add subtle variations to FPS and Ping
        setFps((f) => {
          const delta = Math.random() > 0.5 ? 1 : -1;
          const next = f + delta;
          return next > 62 ? 62 : next < 57 ? 57 : next;
        });

        setPing((p) => {
          const delta = Math.random() > 0.5 ? 1 : -1;
          const next = p + delta;
          return next > 22 ? 22 : next < 11 ? 11 : next;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Quick toggle helper
  const toggleFeature = (key: string) => {
    setActiveToggles(prev => {
      const next = { ...prev, [key]: !prev[key] };
      triggerToast(`Preview: ${key.toUpperCase()} toggled ${next[key] ? 'ON' : 'OFF'}`);
      
      // Add terminal feedback
      setConsoleLogs(logs => {
        const currentLogs = [...logs];
        if (currentLogs.length > 6) currentLogs.shift();
        return [...currentLogs, `[User Action] Modifying configuration: ${key.toUpperCase()} -> ${next[key] ? 'ENABLED' : 'DISABLED'}`];
      });

      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      
      {/* Outer Glow container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-4xl bg-[#08080c] border border-cyan-500/20 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden flex flex-col lg:flex-row relative z-10"
      >
        
        {/* Absolute Background Ambient Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

        {/* Left Section: Video Loop Simulator Space */}
        <div className="flex-1 p-5 flex flex-col gap-4 border-r border-white/5 bg-black/40">
          
          {game.id === 'nights_forest' ? (
            <div className="flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                  <div className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                    <Tv className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Real-Time Interactive Bypass Emulator</span>
                  </div>
                </div>
              </div>
              <ForestSimulator
                walkSpeed={game.settings.walkSpeed}
                jumpPower={game.settings.jumpPower}
                extraToggles={{
                  autoCollectTreasure: activeToggles.autofarm,
                  espChests: activeToggles.esp,
                  chopAllTrees: activeToggles.magnet,
                  teleportLostChildren: true
                }}
                extraSliders={{}}
                onClose={onClose}
              />
            </div>
          ) : (
            <>
              {/* Loop Header Stats */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
                  <div className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                    <Tv className="w-3.5 h-3.5 text-cyan-400" />
                    <span>5S In-Game Preview Loop</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 font-mono text-[9px] text-white/40">
                  <span className="flex items-center gap-1">
                    <Activity className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-300 font-bold">{fps} FPS</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Wifi className="w-3 h-3 text-cyan-400" />
                    <span className="text-cyan-300 font-bold">{ping} ms</span>
                  </span>
                  <span className="hidden sm:inline bg-zinc-900 border border-white/5 px-1.5 py-0.5 rounded text-white/50 text-[8px]">
                    1080P COMPILER LIVE
                  </span>
                </div>
              </div>

              {/* Interactive Player Frame (16:9 Screen) */}
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-zinc-950 shadow-inner flex items-center justify-center group">
                
                {/* The generated high-fidelity GUI image as background */}
                <img 
                  src="/src/assets/images/roblox_gui_preview_1782849040001.jpg" 
                  alt="Roblox script GUI preview backdrop" 
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover opacity-65 group-hover:scale-[1.01] transition-transform duration-700 pointer-events-none"
                />

                {/* Glowing Retro CRT Scanline Filter */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,0,0,0.25)_50%),_linear-gradient(90deg,_rgba(255,0,0,0.06),_rgba(0,255,0,0.02),_rgba(0,0,255,0.06))] bg-[length:100%_4px,_6px_100%] opacity-20" />

                {/* Live Green Laser Scan Sweep Line */}
                <div className="absolute left-0 right-0 h-[2px] bg-cyan-400/35 shadow-[0_0_10px_rgba(6,182,212,0.5)] top-0 animate-scanline pointer-events-none" />

                {/* Live Bounding Boxes Simulation (ESP) */}
                <AnimatePresence>
                  {activeToggles.esp && (
                    <>
                      {/* Target 1 */}
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, x: Math.sin(progress / 5) * 20, y: Math.cos(progress / 7) * 15 }}
                        exit={{ opacity: 0 }}
                        className="absolute top-[25%] left-[30%] border border-cyan-400 p-1 flex flex-col font-mono text-[7px] leading-none select-none pointer-events-none"
                        style={{ width: '45px', height: '80px' }}
                      >
                        <div className="absolute -top-3 left-0 bg-cyan-500 text-black px-1 py-0.2 font-black rounded-sm flex items-center gap-0.5 whitespace-nowrap uppercase">
                          <Target className="w-2 h-2" />
                          <span>Guest_1290</span>
                        </div>
                        <div className="mt-auto text-cyan-300 font-bold self-center bg-black/70 px-0.5 rounded">
                          Dist: {Math.floor(45 - (progress / 4))}m
                        </div>
                        
                        {/* Corner Bracket Accents */}
                        <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-cyan-300" />
                        <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-cyan-300" />
                        <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-cyan-300" />
                        <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-cyan-300" />
                      </motion.div>

                      {/* Target 2 - Chest Box */}
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, x: Math.cos(progress / 8) * -25, y: Math.sin(progress / 6) * 10 }}
                        exit={{ opacity: 0 }}
                        className="absolute top-[50%] right-[25%] border border-amber-400/80 p-1 flex flex-col font-mono text-[7px] leading-none select-none pointer-events-none"
                        style={{ width: '35px', height: '35px' }}
                      >
                        <div className="absolute -top-3 left-0 bg-amber-400 text-black px-1 py-0.2 font-black rounded-sm whitespace-nowrap uppercase">
                          💎 TREASURE CHEST
                        </div>
                        
                        <div className="absolute top-0 left-0 w-1 h-1 border-t border-l border-amber-300" />
                        <div className="absolute top-0 right-0 w-1 h-1 border-t border-r border-amber-300" />
                        <div className="absolute bottom-0 left-0 w-1 h-1 border-b border-l border-amber-300" />
                        <div className="absolute bottom-0 right-0 w-1 h-1 border-b border-r border-amber-300" />
                      </motion.div>

                      {/* Tracer Line simulation linking bottom screen to Guest_1290 */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <line 
                          x1="50%" 
                          y1="100%" 
                          x2={`calc(30% + ${Math.sin(progress / 5) * 20 + 22}px)`} 
                          y2={`calc(25% + ${Math.cos(progress / 7) * 15 + 80}px)`} 
                          stroke="#06b6d4" 
                          strokeWidth="0.75" 
                          strokeDasharray="3,3"
                          className="opacity-60" 
                        />
                      </svg>
                    </>
                  )}
                </AnimatePresence>

                {/* Floating Auto-Farm Particles Simulation */}
                <AnimatePresence>
                  {activeToggles.autofarm && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      {/* Mini floating coin indicators zooming into a magnet core */}
                      <div className="absolute top-[40%] left-[45%] w-8 h-8 rounded-full border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center animate-pulse">
                        <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
                      </div>
                      
                      {/* Dynamic looping particle 1 */}
                      {isPlaying && (
                        <motion.div 
                          animate={{ 
                            x: [150, 0], 
                            y: [-100, 0], 
                            scale: [1, 0.4], 
                            opacity: [0, 1, 0] 
                          }}
                          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeIn' }}
                          className="absolute top-[40%] left-[45%] text-[10px]"
                        >
                          🪙 +50G
                        </motion.div>
                      )}

                      {/* Dynamic looping particle 2 */}
                      {isPlaying && (
                        <motion.div 
                          animate={{ 
                            x: [-120, 0], 
                            y: [80, 0], 
                            scale: [1.2, 0.5], 
                            opacity: [0, 1, 0] 
                          }}
                          transition={{ duration: 0.9, repeat: Infinity, ease: 'easeIn', delay: 0.3 }}
                          className="absolute top-[40%] left-[45%] text-[10px]"
                        >
                          🪙 +120G
                        </motion.div>
                      )}
                    </div>
                  )}
                </AnimatePresence>

                {/* Walkspeed / Warp Lines Effect */}
                <AnimatePresence>
                  {activeToggles.speed && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden border border-transparent rounded-2xl">
                      {/* Fast panning lateral lines to resemble warp speed */}
                      <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-cyan-500/10 to-transparent flex flex-col justify-around">
                        {[1,2,3,4].map(i => (
                          <div key={i} className="h-[1px] w-8 bg-cyan-400/30 animate-warpLine" style={{ animationDelay: `${i * 0.2}s` }} />
                        ))}
                      </div>
                      <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-cyan-500/10 to-transparent flex flex-col justify-around">
                        {[1,2,3,4].map(i => (
                          <div key={i} className="h-[1px] w-8 bg-cyan-400/30 animate-warpLine self-end" style={{ animationDelay: `${i * 0.35}s` }} />
                        ))}
                      </div>
                      
                      {/* HUD Indicator */}
                      <div className="absolute top-4 left-4 bg-black/60 border border-cyan-500/20 px-2 py-1 rounded-lg text-[8px] font-mono font-bold tracking-wider text-cyan-300">
                        SPEED MULTIPLIER: {game.settings.walkSpeed} STUDS/S [WARP ON]
                      </div>
                    </div>
                  )}
                </AnimatePresence>

                {/* In-game Overlay Menu (Imitates ZeroHub Lua Screen GUI Interface!) */}
                <div className="absolute bottom-4 right-4 bg-zinc-950/85 border border-white/10 rounded-2xl p-2.5 w-[160px] font-mono text-[8px] space-y-1.5 shadow-[0_0_15px_rgba(0,0,0,0.8)] select-none">
                  
                  {/* GUI Title */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-1 select-none">
                    <span className="text-cyan-400 font-black tracking-wider uppercase flex items-center gap-1">
                      <Cpu className="w-2.5 h-2.5 text-cyan-400" />
                      ZeroHub v4
                    </span>
                    <span className="text-[6px] text-zinc-500 animate-pulse">● Connected</span>
                  </div>

                  {/* GUI Interactive Options */}
                  <div className="space-y-1">
                    {[
                      { id: 'esp', label: 'Player Tracers & ESP' },
                      { id: 'autofarm', label: 'Infinite Auto-Farm' },
                      { id: 'speed', label: 'God WalkSpeed (x75)' },
                    ].map((item) => (
                      <div 
                        key={item.id}
                        onClick={() => toggleFeature(item.id)}
                        className="flex items-center justify-between hover:bg-white/5 p-1 rounded cursor-pointer transition-colors"
                      >
                        <span className="text-zinc-300">{item.label}</span>
                        <div className={`w-5 h-2.5 rounded-full border transition-colors flex items-center p-0.2 relative ${
                          activeToggles[item.id] ? 'bg-cyan-500/20 border-cyan-400/50' : 'bg-black border-white/10'
                        }`}>
                          <div className={`w-1.8 h-1.8 rounded-full transition-all ${
                            activeToggles[item.id] ? 'bg-cyan-300 translate-x-2.5' : 'bg-zinc-600 translate-x-0'
                          }`} style={{ width: '7px', height: '7px' }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Live Counters */}
                  <div className="border-t border-white/5 pt-1.5 flex justify-between text-zinc-400 text-[6px]">
                    <span>LEVEL: 142</span>
                    <span className="text-emerald-400">GOLD: {coinsCollected}G</span>
                  </div>
                </div>

                {/* Big play overlay if paused */}
                {!isPlaying && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm transition-all duration-300">
                    <button
                      type="button"
                      onClick={() => setIsPlaying(true)}
                      className="w-12 h-12 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all transform hover:scale-110 cursor-pointer border-none"
                    >
                      <Play className="w-5 h-5 fill-black ml-0.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Loop Controller & Timeline scrubbing bar */}
              <div className="flex items-center gap-3 bg-black/45 border border-white/5 p-3 rounded-2xl shrink-0">
                
                {/* Play/Pause Button */}
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-1.5 rounded-xl border border-white/10 bg-zinc-950 text-white hover:text-cyan-400 hover:border-cyan-500/30 transition-all cursor-pointer flex items-center justify-center"
                  title={isPlaying ? "Pause Preview" : "Resume Preview"}
                >
                  {isPlaying ? (
                    <Pause className="w-3.5 h-3.5 fill-white" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-white" />
                  )}
                </button>

                {/* Loop progress bar */}
                <div className="flex-1 flex flex-col gap-1">
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden relative cursor-pointer">
                    <div 
                      className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-100 shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between font-mono text-[8px] text-zinc-500 font-bold select-none">
                    <span>00:0{Math.floor((progress / 20) % 6)} / 00:05</span>
                    <span className="uppercase text-cyan-400/60 flex items-center gap-0.5 animate-pulse">
                      <span>● LOOP RECORDED LIVE</span>
                    </span>
                  </div>
                </div>

                {/* Reset Loop Button */}
                <button
                  type="button"
                  onClick={() => {
                    setProgress(0);
                    setIsPlaying(true);
                    triggerToast('Preview loop restarted.');
                  }}
                  className="p-1.5 rounded-xl border border-white/10 bg-zinc-950 text-white hover:text-cyan-400 transition-all cursor-pointer"
                  title="Reset Video Loop"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}

        </div>

        {/* Right Section: Script Explainer / Compiler Controller */}
        <div className="w-full lg:w-[280px] p-5 flex flex-col justify-between bg-zinc-950/70">
          
          <div className="space-y-4">
            
            {/* Close modal */}
            <div className="flex items-start justify-between border-b border-white/5 pb-2.5">
              <div>
                <h3 className="text-xs font-black uppercase text-white font-mono">{game.emojiText} {game.name}</h3>
                <p className="text-[9px] text-zinc-400 mt-0.5">Automated visual layout mock</p>
              </div>
              <button 
                type="button"
                onClick={onClose}
                className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/5 hover:text-white text-zinc-400 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Core details */}
            <div className="space-y-3 font-sans text-xs">
              <div className="bg-[#050508]/60 border border-white/5 p-3 rounded-2xl space-y-1.5">
                <span className="text-[9px] font-mono text-cyan-400 font-bold uppercase block">Script Features Simulated</span>
                <ul className="space-y-1 text-[10px] text-zinc-300">
                  {game.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="truncate">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Exploit Debug Consol */}
              <div className="bg-black/80 rounded-2xl border border-white/5 p-3 space-y-1.5">
                <div className="flex items-center gap-1 border-b border-white/5 pb-1 shrink-0 font-mono text-[8px] text-zinc-500 font-black">
                  <Terminal className="w-3 h-3 text-cyan-400" />
                  <span>LUAU COMPILER LOGS</span>
                </div>
                <div className="space-y-1 font-mono text-[8px] text-zinc-400 h-[85px] overflow-y-auto scrollbar-none select-none">
                  {consoleLogs.map((log, i) => (
                    <div key={i} className="leading-normal">
                      <span className="text-zinc-600 mr-1">&gt;</span>
                      <span className={log.startsWith('[User') ? 'text-amber-400' : log.startsWith('[ZeroShield') ? 'text-cyan-400' : 'text-zinc-400'}>
                        {log}
                      </span>
                    </div>
                  ))}
                  <div className="w-1.5 h-3 bg-cyan-400/70 inline-block animate-pulse" />
                </div>
              </div>
            </div>

          </div>

          {/* Action buttons */}
          <div className="space-y-2 pt-4 border-t border-white/5 mt-4">
            
            <button
              type="button"
              onClick={handleImport}
              className="w-full py-2 bg-gradient-to-r from-cyan-400 to-indigo-500 hover:brightness-110 text-black text-[10px] font-mono font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 fill-black" />
              <span>Import to Sandbox</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const clipUrl = `${window.location.origin}/src/assets/images/roblox_gui_preview_1782849040001.jpg`;
                const shareText = `Check out this crazy in-game cheat simulator for ${game.name} on ZeroHub!`;
                if (navigator.share) {
                  navigator.share({
                    title: `${game.name} - ZeroHub Live Preview Clip`,
                    text: shareText,
                    url: clipUrl,
                  }).then(() => {
                    triggerToast('🎥 Video preview clip shared with friends!');
                  }).catch(() => {
                    navigator.clipboard.writeText(clipUrl);
                    triggerToast('📋 Video clip link copied to clipboard!');
                  });
                } else {
                  navigator.clipboard.writeText(clipUrl);
                  triggerToast('📋 Video clip link copied to clipboard!');
                }
              }}
              className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-mono font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_22px_rgba(16,185,129,0.45)]"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Preview Clip</span>
            </button>

            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(game.rawUrl);
                triggerToast('Roblox raw loadstring URL copied!');
              }}
              className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/5 text-white text-[10px] font-mono font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              <span>Copy Direct Link</span>
            </button>

            <p className="text-[8px] text-zinc-500 text-center font-mono select-none">
              Press Escape or click close button to return.
            </p>
          </div>

        </div>

      </motion.div>
    </div>
  );
}
