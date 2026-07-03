import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Shield, Flame, Zap, HelpCircle, AlertTriangle, Eye, RefreshCw, Star, Info } from 'lucide-react';

interface ForestSimulatorProps {
  walkSpeed: number;
  jumpPower: number;
  extraToggles: Record<string, boolean>;
  extraSliders: Record<string, number>;
  onClose: () => void;
}

interface SimItem {
  id: string;
  type: 'chest' | 'wood' | 'child';
  x: number;
  y: number;
  collected: boolean;
  spawnTime: number;
}

interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
}

export const ForestSimulator: React.FC<ForestSimulatorProps> = ({
  walkSpeed,
  jumpPower,
  extraToggles,
  extraSliders,
  onClose
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Game simulation state
  const [playerX, setPlayerX] = useState<number>(150);
  const [playerY, setPlayerY] = useState<number>(130);
  const [campfireFuel, setCampfireFuel] = useState<number>(85);
  const [chestsCollected, setChestsCollected] = useState<number>(0);
  const [childrenSaved, setChildrenSaved] = useState<number>(0);
  const [warmth, setWarmth] = useState<number>(95);
  const [nightsSurvived, setNightsSurvived] = useState<number>(98);
  const [simLog, setSimLog] = useState<string[]>(['[ZeroHub] 99 Nights script initialized.', '[ZeroShield] Anti-Cheat bypass: ACTIVE.']);
  const [items, setItems] = useState<SimItem[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);

  // Simulation settings override (allows user to play with toggles in real-time)
  const [autoLoot, setAutoLoot] = useState(extraToggles['autoCollectTreasure'] !== false);
  const [espEnabled, setEspEnabled] = useState(extraToggles['espChests'] !== false);
  const [autoWood, setAutoWood] = useState(extraToggles['chopAllTrees'] !== false);
  const [autoWarp, setAutoWarp] = useState(extraToggles['teleportLostChildren'] !== false);
  const [simSpeed, setSimSpeed] = useState(walkSpeed);

  // Sync with prop changes
  useEffect(() => {
    setAutoLoot(extraToggles['autoCollectTreasure'] !== false);
    setEspEnabled(extraToggles['espChests'] !== false);
    setAutoWood(extraToggles['chopAllTrees'] !== false);
    setAutoWarp(extraToggles['teleportLostChildren'] !== false);
  }, [extraToggles]);

  useEffect(() => {
    setSimSpeed(walkSpeed);
  }, [walkSpeed]);

  const addLog = (text: string) => {
    setSimLog((prev) => [text, ...prev.slice(0, 10)]);
  };

  const spawnFloatingText = (text: string, x: number, y: number, color: string = 'text-cyan-400') => {
    const id = `f_${Date.now()}_${Math.random()}`;
    setFloatingTexts((prev) => [...prev, { id, text, x, y, color }]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((t) => t.id !== id));
    }, 1200);
  };

  // Initial Spawning of items
  useEffect(() => {
    const initialItems: SimItem[] = [
      { id: 'c1', type: 'chest', x: 50, y: 60, collected: false, spawnTime: Date.now() },
      { id: 'c2', type: 'chest', x: 250, y: 50, collected: false, spawnTime: Date.now() },
      { id: 'w1', type: 'wood', x: 80, y: 150, collected: false, spawnTime: Date.now() },
      { id: 'w2', type: 'wood', x: 220, y: 140, collected: false, spawnTime: Date.now() },
      { id: 'ch1', type: 'child', x: 120, y: 40, collected: false, spawnTime: Date.now() }
    ];
    setItems(initialItems);
  }, []);

  // Main simulation tick loop
  useEffect(() => {
    let lastTime = performance.now();
    let frameId: number;

    const gameLoop = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      // 1. Decay campfire fuel
      setCampfireFuel((prev) => {
        const next = prev - delta * 3.5;
        return next < 0 ? 0 : next;
      });

      // 2. Adjust night count slowly
      if (Math.random() < 0.001) {
        setNightsSurvived((prev) => {
          if (prev < 99) {
            addLog(`🌅 Day break! Survived Night ${prev}. Starting Night ${prev + 1}...`);
            return prev + 1;
          }
          return prev;
        });
      }

      setItems((prevItems) => {
        let currentX = playerX;
        let currentY = playerY;
        const campfireX = 150;
        const campfireY = 100;

        // Auto wood feeder logic
        if (autoWood) {
          // If fuel drops, simulate automatic transport of wood logs to campfire
          prevItems.forEach((item) => {
            if (item.type === 'wood' && !item.collected && campfireFuel < 70) {
              item.collected = true;
              setCampfireFuel((f) => Math.min(100, f + 25));
              spawnFloatingText('🪵 +1 Log Fed', campfireX, campfireY - 10, 'text-amber-400');
              addLog('🔥 [Auto-Feeder] Fed 1x Dense Wood Log into fireplace.');
              // Respawn wood log in 4 seconds
              setTimeout(() => {
                setItems((curr) => curr.map((i) => i.id === item.id ? { ...i, collected: false, x: 40 + Math.random() * 220, y: 40 + Math.random() * 120 } : i));
              }, 4000);
            }
          });
        }

        // Auto warp lost children logic
        if (autoWarp) {
          prevItems.forEach((item) => {
            if (item.type === 'child' && !item.collected) {
              item.collected = true;
              setChildrenSaved((c) => c + 1);
              spawnFloatingText('👶 Child Rescued!', campfireX, campfireY + 15, 'text-emerald-400');
              addLog('🌀 [Auto-Warp] Teleported lost child safely to Campfire circle.');
              // Respawn child in 6 seconds
              setTimeout(() => {
                setItems((curr) => curr.map((i) => i.id === item.id ? { ...i, collected: false, x: 40 + Math.random() * 220, y: 40 + Math.random() * 120 } : i));
              }, 6000);
            }
          });
        }

        // Auto loot chest magnet movement logic
        if (autoLoot) {
          // Find closest uncollected chest
          const targetChest = prevItems.find((i) => i.type === 'chest' && !i.collected);
          if (targetChest) {
            const dx = targetChest.x - currentX;
            const dy = targetChest.y - currentY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 4) {
              // Move player towards chest proportional to WalkSpeed setting
              // speed ratio walkspeed of 16 is ~30px/s, walkspeed 250 is ~200px/s
              const speedPx = 30 + (simSpeed - 16) * 0.8;
              const moveDist = speedPx * delta;
              currentX += (dx / distance) * moveDist;
              currentY += (dy / distance) * moveDist;
            } else {
              // Collected chest!
              targetChest.collected = true;
              setChestsCollected((c) => c + 1);
              spawnFloatingText('🎁 +100 Gold', targetChest.x, targetChest.y, 'text-cyan-400');
              addLog(`💰 [Loot-Magnet] Magnetic-grabbed Ancient Treasure Chest!`);
              
              // Respawn chest elsewhere in 3 seconds
              const chestId = targetChest.id;
              setTimeout(() => {
                setItems((curr) => curr.map((i) => i.id === chestId ? { ...i, collected: false, x: 30 + Math.random() * 240, y: 35 + Math.random() * 130 } : i));
              }, 3000);
            }
          } else {
            // No chests, hover near campfire
            const dx = campfireX - currentX;
            const dy = campfireY + 25 - currentY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 4) {
              currentX += (dx / dist) * 20 * delta;
              currentY += (dy / dist) * 20 * delta;
            }
          }
        } else {
          // No auto loot, just float slightly around the campfire campfire area
          const angle = time * 0.001;
          currentX = campfireX + Math.sin(angle) * 35;
          currentY = campfireY + 20 + Math.cos(angle) * 15;
        }

        setPlayerX(currentX);
        setPlayerY(currentY);

        // Calculate player warmth level
        const distToFire = Math.sqrt((currentX - campfireX) ** 2 + (currentY - campfireY) ** 2);
        const warmthTarget = Math.max(20, Math.round(100 - distToFire * 0.4 + (campfireFuel * 0.2)));
        setWarmth((w) => {
          const diff = warmthTarget - w;
          return Math.round(w + diff * 0.08);
        });

        return [...prevItems];
      });

      frameId = requestAnimationFrame(gameLoop);
    };

    frameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(frameId);
  }, [playerX, playerY, autoLoot, autoWood, autoWarp, simSpeed, campfireFuel]);

  const campfireRadius = 15 + (campfireFuel / 100) * 22;

  return (
    <div className="bg-zinc-950 border border-emerald-500/30 rounded-2xl overflow-hidden shadow-[0_0_35px_rgba(16,185,129,0.15)] flex flex-col font-mono text-xs">
      
      {/* Simulation Header */}
      <div className="bg-zinc-900 border-b border-white/5 p-3 flex items-center justify-between text-zinc-400">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="font-bold tracking-tight text-white flex items-center gap-1">
            FOREST BYPASS EMULATOR: <span className="text-emerald-400 text-[11px]">99 NIGHTS</span>
          </span>
          <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg animate-pulse">
            PREVIEW ACTIVE
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-[10px] text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded-lg border border-white/5 transition-all cursor-pointer"
        >
          Return to Code
        </button>
      </div>

      {/* Simulator Sandbox Body */}
      <div className="grid grid-cols-1 md:grid-cols-12 border-b border-white/5">
        
        {/* 2D Map Area (8 Cols) */}
        <div className="md:col-span-8 bg-zinc-950 p-4 flex flex-col items-center justify-center relative min-h-[220px] overflow-hidden select-none border-b md:border-b-0 md:border-r border-white/5">
          {/* Night Map Floor */}
          <div className="absolute inset-0 bg-radial-gradient opacity-10 pointer-events-none" />
          <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
          
          {/* Scanline overlay for retro CRT effect */}
          <div className="absolute inset-0 bg-scanlines opacity-[0.02] pointer-events-none" />

          {/* Interactive Forest canvas frame */}
          <div className="w-full h-[180px] bg-emerald-950/10 border border-emerald-500/15 rounded-xl relative overflow-hidden bg-[radial-gradient(circle_at_center,_#022c22_0%,_#09090b_85%)]">
            
            {/* Campfire Ring (Draws warmth radius) */}
            <div 
              style={{
                left: '150px',
                top: '100px',
                width: `${campfireRadius * 3}px`,
                height: `${campfireRadius * 3}px`,
                transform: 'translate(-50%, -50%)'
              }}
              className="absolute rounded-full border border-dashed border-amber-500/10 bg-amber-500/3 transition-all duration-300 pointer-events-none"
            />

            {/* Glowing campfire spark particles */}
            <div 
              className="absolute w-3 h-3 left-[150px] top-[100px] -translate-x-1/2 -translate-y-1/2 bg-amber-500/30 rounded-full blur-[8px] animate-pulse"
              style={{ transform: `translate(-50%, -50%) scale(${1 + campfireFuel / 120})` }}
            />

            {/* Campfire (Center) */}
            <div className="absolute left-[150px] top-[100px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center cursor-pointer pointer-events-none">
              <Flame 
                className="w-5 h-5 text-amber-500 animate-bounce" 
                style={{ 
                  color: campfireFuel > 30 ? '#f59e0b' : '#f97316', 
                  opacity: campfireFuel > 0 ? 0.3 + (campfireFuel / 100) * 0.7 : 0.1 
                }} 
              />
              <span className="text-[7px] font-bold text-amber-400 font-mono">FIRE</span>
            </div>

            {/* Render Spawns (Chests, Wood logs, Children) */}
            {items.map((item) => {
              if (item.collected) return null;

              // Draw ESP tags if ESP is enabled
              return (
                <div 
                  key={item.id}
                  style={{ left: `${item.x}px`, top: `${item.y}px` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 group flex flex-col items-center"
                >
                  {/* ESP Neon Box */}
                  {espEnabled && (
                    <div className="absolute -inset-1.5 border border-cyan-400/50 bg-cyan-500/5 rounded animate-pulse pointer-events-none">
                      <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[6px] bg-black/85 text-cyan-300 font-bold uppercase tracking-wider px-1 border border-cyan-500/20 whitespace-nowrap">
                        {item.type.toUpperCase()}
                      </span>
                    </div>
                  )}

                  <span className="text-[11px] filter drop-shadow-[0_0_4px_rgba(255,255,255,0.4)]">
                    {item.type === 'chest' ? '🎁' : item.type === 'wood' ? '🪵' : '👶'}
                  </span>
                </div>
              );
            })}

            {/* Draw lines from Player to items when ESP is active */}
            {espEnabled && items.map((item) => {
              if (item.collected) return null;
              const dx = item.x - playerX;
              const dy = item.y - playerY;
              const length = Math.sqrt(dx * dx + dy * dy);
              const angle = Math.atan2(dy, dx) * (180 / Math.PI);
              return (
                <div
                  key={`line_${item.id}`}
                  style={{
                    left: `${playerX}px`,
                    top: `${playerY}px`,
                    width: `${length}px`,
                    transform: `rotate(${angle}deg)`,
                    transformOrigin: 'left center'
                  }}
                  className="absolute h-[1px] bg-gradient-to-r from-cyan-400/40 to-transparent pointer-events-none z-0"
                />
              );
            })}

            {/* Animated Player character */}
            <div 
              style={{ left: `${playerX}px`, top: `${playerY}px` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-75 z-10 flex flex-col items-center"
            >
              {/* ZeroHub User highlight circle */}
              <div className="absolute -inset-2 bg-emerald-500/10 border border-emerald-400/40 rounded-full animate-ping pointer-events-none" />
              
              <div className="bg-emerald-950 border border-emerald-400/70 p-1 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                <span className="text-[10px] filter drop-shadow">👤</span>
              </div>
              <span className="text-[6.5px] font-bold text-white uppercase bg-black/80 px-1 rounded border border-emerald-500/30 mt-0.5 whitespace-nowrap tracking-wide">
                VoidUser (SPD:{simSpeed})
              </span>
            </div>

            {/* Floating floating texts effects */}
            {floatingTexts.map((text) => (
              <motion.span
                key={text.id}
                initial={{ opacity: 1, y: text.y, scale: 0.8 }}
                animate={{ opacity: 0, y: text.y - 25, scale: 1.1 }}
                style={{ left: `${text.x}px` }}
                className={`absolute text-[8px] font-extrabold uppercase font-mono tracking-wider ${text.color} pointer-events-none z-20 whitespace-nowrap`}
              >
                {text.text}
              </motion.span>
            ))}

            {/* Temperature warning flash */}
            {warmth < 35 && (
              <div className="absolute inset-0 border border-rose-500/30 bg-rose-500/5 animate-pulse flex items-center justify-center pointer-events-none">
                <span className="text-[8px] bg-black/90 border border-rose-500/40 text-rose-400 font-extrabold tracking-widest px-2 py-0.5 uppercase">
                  ⚠️ freezing warning: get near campfire!
                </span>
              </div>
            )}
          </div>

          {/* Quick Sandbox Controls (under play view) */}
          <div className="w-full mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[9px] relative z-10">
            <button
              onClick={() => setAutoLoot(!autoLoot)}
              className={`p-1.5 border rounded-lg transition-all flex items-center justify-between font-bold cursor-pointer ${
                autoLoot ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300' : 'bg-black/35 border-white/5 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <span>🎁 LOOT MAGNET</span>
              <span className="opacity-50">{autoLoot ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={() => setEspEnabled(!espEnabled)}
              className={`p-1.5 border rounded-lg transition-all flex items-center justify-between font-bold cursor-pointer ${
                espEnabled ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300' : 'bg-black/35 border-white/5 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <span>🟢 CHEST ESP</span>
              <span className="opacity-50">{espEnabled ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={() => setAutoWood(!autoWood)}
              className={`p-1.5 border rounded-lg transition-all flex items-center justify-between font-bold cursor-pointer ${
                autoWood ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' : 'bg-black/35 border-white/5 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <span>🪵 AUTO WOOD</span>
              <span className="opacity-50">{autoWood ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={() => setAutoWarp(!autoWarp)}
              className={`p-1.5 border rounded-lg transition-all flex items-center justify-between font-bold cursor-pointer ${
                autoWarp ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' : 'bg-black/35 border-white/5 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <span>👶 CHILDS WARP</span>
              <span className="opacity-50">{autoWarp ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>

        {/* Stats Dashboard & Telemetry Logs (4 Cols) */}
        <div className="md:col-span-4 bg-zinc-900/40 p-4 space-y-4">
          
          {/* Active Stats Panel */}
          <div className="space-y-2 text-[10px] text-zinc-300">
            <h4 className="text-[10px] uppercase font-bold text-zinc-400 border-b border-white/5 pb-1 font-mono flex items-center justify-between">
              <span>📊 Live Telemetry</span>
              <span className="text-emerald-400">Night {nightsSurvived}/99</span>
            </h4>
            
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Body Warmth:</span>
                <span className={`font-bold ${warmth < 40 ? 'text-rose-400 animate-pulse' : warmth < 70 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {warmth}%
                </span>
              </div>
              <div className="w-full bg-black/60 h-1 rounded overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${warmth < 40 ? 'bg-rose-500' : warmth < 70 ? 'bg-amber-500' : 'bg-emerald-400'}`}
                  style={{ width: `${warmth}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Campfire Flame:</span>
                <span className={`font-bold ${campfireFuel < 30 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`}>
                  {Math.round(campfireFuel)}%
                </span>
              </div>
              <div className="w-full bg-black/60 h-1 rounded overflow-hidden">
                <div 
                  className="bg-amber-500 h-full transition-all duration-300"
                  style={{ width: `${campfireFuel}%` }}
                />
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-white/5">
                <span className="text-zinc-500">Chests Pulled:</span>
                <span className="text-cyan-400 font-bold font-mono">{chestsCollected}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Children Rescued:</span>
                <span className="text-emerald-400 font-bold font-mono">{childrenSaved}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-500">WalkSpeed Shift:</span>
                <span className="text-white font-bold font-mono">{simSpeed} studs/s</span>
              </div>
            </div>
          </div>

          {/* Scrolling Log console */}
          <div className="space-y-1.5">
            <h4 className="text-[10px] uppercase font-bold text-zinc-400 border-b border-white/5 pb-1 font-mono">
              📟 Injected Console Output
            </h4>
            <div className="bg-black/80 rounded-xl p-2.5 h-[105px] overflow-y-auto text-[8.5px] font-mono leading-relaxed space-y-1 text-zinc-400 scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">
              {simLog.map((log, index) => (
                <div key={index} className="truncate">
                  <span className="text-cyan-500/70 select-none">&gt;</span> {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Simulator Info Footer */}
      <div className="bg-zinc-950 p-3 text-[10px] text-zinc-500 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-emerald-400" />
          This interactive preview simulates live code running in our Roblox level-7 container.
        </span>
        <button
          onClick={() => {
            setCampfireFuel(100);
            setChestsCollected(0);
            setChildrenSaved(0);
            setNightsSurvived(98);
            addLog('🔄 Restarting forest survival simulation...');
            spawnFloatingText('RESTARTED', 150, 100, 'text-cyan-400');
          }}
          className="text-zinc-400 hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer font-bold uppercase tracking-wider text-[9px]"
        >
          <RefreshCw className="w-3 h-3" /> Reset
        </button>
      </div>
    </div>
  );
};
