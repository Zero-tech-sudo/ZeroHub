import React, { useState, useEffect, useRef } from 'react';
import { ScriptConfig, MapElement, LogMessage } from '../types';
import { INITIAL_MAP_ELEMENTS, MAP_LOCATIONS } from '../data';
import { Play, RotateCcw, Compass, MapPin, Eye, Zap, Flame, ShieldAlert, Crosshair, Gift } from 'lucide-react';

interface ForestSimulatorProps {
  config: ScriptConfig;
  onConfigChange: (newConfig: ScriptConfig) => void;
}

export const ForestSimulator: React.FC<ForestSimulatorProps> = ({ config, onConfigChange }) => {
  // Simulator State
  const [playerPos, setPlayerPos] = useState({ x: 15, y: 80 }); // start at camp
  const [mapElements, setMapElements] = useState<MapElement[]>(INITIAL_MAP_ELEMENTS);
  const [logs, setLogs] = useState<LogMessage[]>([
    { time: '16:53:35', type: 'info', text: 'Initializing Zero Script Executor...' },
    { time: '16:53:36', type: 'success', text: 'Anti-kick metamethod bypass injected successfully.' },
    { time: '16:53:36', type: 'success', text: 'Keyless credentials verification passed!' },
    { time: '16:53:37', type: 'info', text: 'Zero Script Mobile Interface successfully loaded.' }
  ]);
  const [daysSurvived, setDaysSurvived] = useState(43);
  const [warmth, setWarmth] = useState(90);
  const [floatingTexts, setFloatingTexts] = useState<{ id: string; x: number; y: number; text: string }[]>([]);
  const [guiDraggedPosition, setGuiDraggedPosition] = useState({ x: 16, y: 45 });
  const [isDraggingGui, setIsDraggingGui] = useState(false);
  const [currentMapName, setCurrentMapName] = useState('Spawn Camp');
  
  // Custom rapid macros stats
  const [activeMacro, setActiveMacro] = useState<'none' | 'logs-to-fire' | 'logs-to-scrap' | 'metals-to-scrap'>('none');
  const [woodCount, setWoodCount] = useState(8);
  const [metalCount, setMetalCount] = useState(14);
  const [macroStep, setMacroStep] = useState(0);

  // Say teleport & map autofarm state controllers
  const [typedDestination, setTypedDestination] = useState('');
  const [isAutoGatheringChests, setIsAutoGatheringChests] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const initialGuiPosRef = useRef({ x: 0, y: 0 });

  // Floating text creator helper
  const triggerFloatingText = (x: number, y: number, text: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setFloatingTexts((prev) => [...prev, { id, x, y, text }]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((ft) => ft.id !== id));
    }, 1500);
  };

  // Log helper
  const addLog = (text: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    setLogs((prev) => [...prev, { time: timeStr, type, text }].slice(-50)); // limit 55 logs
  };

  // Watch for walkspeed scale and print log
  useEffect(() => {
    addLog(`Physical speed configured to ${config.walkSpeed} units.`, 'info');
  }, [config.walkSpeed]);

  // Watch for fly toggle
  useEffect(() => {
    if (config.flyEnabled) {
      addLog(`Physic engine hooked: Flying and Noclip bounds override APPROVED.`, 'success');
      triggerFloatingText(playerPos.x, playerPos.y, 'FLY ACTIVE');
    } else {
      addLog(`Physic engine fly modules released. Standard gravity applied.`, 'warn');
    }
  }, [config.flyEnabled]);

  // Watch for Auto collect
  useEffect(() => {
    if (config.autoCollectTreasure) {
      addLog(`Magnet Loot-Aura engaged. Scanning radius: 45m.`, 'info');
    } else {
      addLog(`Magnet Loot-Aura suspended.`, 'warn');
    }
  }, [config.autoCollectTreasure]);

  // Watch for ESP toggles
  useEffect(() => {
    addLog(`Refreshed sensor overlay. Highlighting nearby caches...`, 'info');
  }, [config.espChests, config.espSupplies]);

  // Survival stats tick
  useEffect(() => {
    const interval = setInterval(() => {
      // Warmth drops in the spooky forest unless player is near campfire spawn
      const isNearCamp = Math.hypot(playerPos.x - 15, playerPos.y - 80) < 18;
      setWarmth((w) => {
        if (isNearCamp) {
          return Math.min(100, w + 4);
        } else {
          return Math.max(15, w - 2);
        }
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [playerPos]);

  // Magnet Auto-Collect effect
  useEffect(() => {
    if (!config.autoCollectTreasure) return;

    const interval = setInterval(() => {
      let collectedSomething = false;
      setMapElements((prevElements) => {
        return prevElements.map((elem) => {
          if (elem.collected) return elem;
          
          // Distance calculation
          const dist = Math.hypot(playerPos.x - elem.x, playerPos.y - elem.y);
          // If within range and matches filter
          const deservesCollect = 
            (elem.type === 'chest' && config.espChests) || 
            (elem.type === 'supply' && config.espSupplies);

          if (dist < 15 && deservesCollect) {
            collectedSomething = true;
            triggerFloatingText(elem.x, elem.y, `Auto-Mined // +100 Gold`);
            addLog(`Magnet Auto-Loot successful: Collected standard "${elem.name}".`, 'success');
            return { ...elem, collected: true };
          }
          return elem;
        });
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [playerPos, config.autoCollectTreasure, config.espChests, config.espSupplies]);

  // Fast Active Macro Bot Simulation
  useEffect(() => {
    if (activeMacro === 'none') {
      setMacroStep(0);
      return;
    }

    const interval = setInterval(() => {
      if (activeMacro === 'logs-to-fire') {
        if (macroStep === 0) {
          // step 1: fetch
          setPlayerPos({ x: 40, y: 56 });
          setCurrentMapName('Deep Woods (Pine Tree)');
          addLog('Macro Cycle [Active]: Teleporting instantly to collect Forest Logs...', 'info');
          triggerFloatingText(40, 56, '🪵 Fetching Log');
          setMacroStep(1);
        } else {
          // step 2: dump
          setPlayerPos({ x: 15, y: 80 });
          setCurrentMapName('Spawn Camp (Campfire)');
          addLog('Macro Cycle [Active]: Teleported to Central Fireplace & deposited Log.', 'success');
          triggerFloatingText(15, 80, '🔥 Log Placed!');
          setWarmth((w) => Math.min(100, w + 12));
          setWoodCount((w) => w + 1);
          setMacroStep(0);
        }
      } else if (activeMacro === 'logs-to-scrap') {
        if (macroStep === 0) {
          // step 1: fetch
          setPlayerPos({ x: 60, y: 64 });
          setCurrentMapName('Forest Thicket (Pine)');
          addLog('Macro Cycle [Active]: Teleported to Spruce trees to collect Logs...', 'info');
          triggerFloatingText(60, 64, '🪵 Fetching Log');
          setMacroStep(1);
        } else {
          // step 2: dump
          setPlayerPos({ x: 26, y: 76 });
          setCurrentMapName('Spawn Camp (Scrap Machine)');
          addLog('Macro Cycle [Active]: Teleported and deposited Log into Scrap Machine.', 'success');
          triggerFloatingText(26, 76, '⚙️ Log Loaded');
          setMetalCount((m) => m + 1);
          setMacroStep(0);
        }
      } else if (activeMacro === 'metals-to-scrap') {
        if (macroStep === 1) {
          // step 2: dump
          setPlayerPos({ x: 26, y: 76 });
          setCurrentMapName('Spawn Camp (Scrap Machine)');
          addLog('Macro Cycle [Active]: Teleported and dropped stray metal pieces to Scrap Machine.', 'success');
          triggerFloatingText(26, 76, '⚙️ Metals Loaded');
          setMetalCount((m) => m + 3);
          setMacroStep(0);
        } else {
          // step 1: fetch
          setPlayerPos({ x: 75, y: 75 });
          setCurrentMapName('Forgotten Stone Ruins');
          addLog('Macro Cycle [Active]: Teleporting to ruins to harvest stray scrap metals...', 'info');
          triggerFloatingText(75, 75, '🪙 Scrap Found');
          setMacroStep(1);
        }
      }
    }, 850);

    return () => clearInterval(interval);
  }, [activeMacro, macroStep]);

  // Handle manual movement inside the mockup (allows testing speed / flight)
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapContainerRef.current) return;
    const rect = mapContainerRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    // Move player with speed determining transition speed duration
    const dist = Math.hypot(clickX - playerPos.x, clickY - playerPos.y);
    addLog(`Teleporting to click vector: X=${clickX.toFixed(1)}, Y=${clickY.toFixed(1)}`, 'info');
    
    // Identify nearest zone name
    let nearestZone = 'Deep Woods';
    let minDist = 999;
    MAP_LOCATIONS.forEach((loc) => {
      const d = Math.hypot(clickX - loc.x, clickY - loc.y);
      if (d < minDist && d < 20) {
        minDist = d;
        nearestZone = loc.name;
      }
    });
    setCurrentMapName(nearestZone);

    setPlayerPos({ x: clickX, y: clickY });
    triggerFloatingText(clickX, clickY, config.flyEnabled ? 'FLYING GLIDE' : 'TELEPORTED');
  };

  // Teleport via HUD Locations
  const handleTeleportToLocation = (loc: typeof MAP_LOCATIONS[0]) => {
    setPlayerPos({ x: loc.x, y: loc.y });
    setCurrentMapName(loc.name);
    addLog(`Teleported directly to: ${loc.name} [Coords: ${loc.x * 12}, ${loc.y * 12}]`, 'success');
    triggerFloatingText(loc.x, loc.y, `Tween Complete`);
  };

  // Reset Simulation
  const handleReset = () => {
    setPlayerPos({ x: 15, y: 80 });
    setMapElements(INITIAL_MAP_ELEMENTS.map(item => ({ ...item, collected: false })));
    setCurrentMapName('Spawn Camp');
    setWarmth(100);
    setDaysSurvived(43);
    addLog('Resetting simulation environment. Player repositioned at Safe Camp.', 'warn');
  };

  // Humanely parsable Destination "Say Teleport" hook
  const handleCustomTeleportSay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedDestination.trim()) return;

    const input = typedDestination.toLowerCase().trim();
    
    // Check if user entered coordinates (e.g. "50, 45" or "X: 20 Y: 30")
    const coordMatch = input.match(/(\d+)\s*,\s*(\d+)/) || input.match(/x\s*=\s*(\d+)\s*y\s*=\s*(\d+)/);
    if (coordMatch) {
      const parsedX = Math.min(100, Math.max(0, parseInt(coordMatch[1])));
      const parsedY = Math.min(100, Math.max(0, parseInt(coordMatch[2])));
      setPlayerPos({ x: parsedX, y: parsedY });
      setCurrentMapName(`Say Warped Grid (${parsedX}, ${parsedY})`);
      addLog(`Say Command Hooked: Instantly telemetry-warped to coordinates X=${parsedX}, Y=${parsedY}!`, 'success');
      triggerFloatingText(parsedX, parsedY, `⚡ SAY WARPED`);
      setTypedDestination('');
      return;
    }

    // Otherwise check matches in target Locations or elements names
    const matchLocation = MAP_LOCATIONS.find(loc => loc.name.toLowerCase().includes(input));
    if (matchLocation) {
      setPlayerPos({ x: matchLocation.x, y: matchLocation.y });
      setCurrentMapName(matchLocation.name);
      addLog(`Say Command Hooked: Located "${matchLocation.name}" and sent coordinate warp requests!`, 'success');
      triggerFloatingText(matchLocation.x, matchLocation.y, `⚡ WARP: ${matchLocation.name}`);
      setTypedDestination('');
      return;
    }

    const matchElem = mapElements.find(el => el.name.toLowerCase().includes(input) && !el.collected);
    if (matchElem) {
      setPlayerPos({ x: matchElem.x, y: matchElem.y });
      setCurrentMapName(matchElem.name);
      addLog(`Say Command Hooked: Target "${matchElem.name}" identified. Initializing fast tween!`, 'success');
      triggerFloatingText(matchElem.x, matchElem.y, `⚡ WARP`);
      setTypedDestination('');
      return;
    }

    addLog(`Unable to resolve teleport target "${typedDestination}". Type coord pair (e.g. 40,50) or zone keyword (Camp, Tree, Ruins, Cabins, Marsh).`, 'error');
  };

  // Instantly auto collect treasure around the map in simulated cycles
  const handleAutoCollectAllTreasure = () => {
    if (isAutoGatheringChests) return;
    setIsAutoGatheringChests(true);
    addLog('⚡ Initiating complete map-wide Treasure Magnet sequence...', 'warn');

    // Get all chests that are not collected yet
    const uncollectedChests = mapElements.filter(elem => elem.type === 'chest' && !elem.collected);
    if (uncollectedChests.length === 0) {
      addLog('No uncollected chests remaining on the map!', 'error');
      setIsAutoGatheringChests(false);
      return;
    }

    let delay = 0;
    uncollectedChests.forEach((chest, index) => {
      setTimeout(() => {
        setPlayerPos({ x: chest.x, y: chest.y });
        setCurrentMapName(chest.name);
        
        // Collect this chest
        setMapElements((prev) => 
          prev.map(item => item.id === chest.id ? { ...item, collected: true } : item)
        );
        
        triggerFloatingText(chest.x, chest.y, `🪙 +100g`);
        addLog(`Auto-Collector: Teleported to ${chest.name} (X:${chest.x}, Y:${chest.y}) & extracted riches.`, 'success');

        // On last chest, teleport back to camp
        if (index === uncollectedChests.length - 1) {
          setTimeout(() => {
            setPlayerPos({ x: 15, y: 80 });
            setCurrentMapName('Spawn Camp');
            addLog('⚡ Treasure Magnet Autofarm complete! Teleported back to cabin.', 'success');
            setIsAutoGatheringChests(false);
          }, 800);
        }
      }, delay);
      delay += 850;
    });
  };

  // Simulated Mobile HUD drag start
  const handleGuiDragStart = (e: React.MouseEvent) => {
    setIsDraggingGui(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    initialGuiPosRef.current = { ...guiDraggedPosition };
    e.stopPropagation();
  };

  // Simulated Mobile HUD drag move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingGui) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      
      // Calculate new percentage positions
      const containerWidth = mapContainerRef.current?.clientWidth || 500;
      const containerHeight = mapContainerRef.current?.clientHeight || 400;
      
      const px = initialGuiPosRef.current.x + (dx / containerWidth) * 100;
      const py = initialGuiPosRef.current.y + (dy / containerHeight) * 100;
      
      setGuiDraggedPosition({
        x: Math.max(0, Math.min(65, px)),
        y: Math.max(0, Math.min(60, py))
      });
    };

    const handleMouseUp = () => {
      setIsDraggingGui(false);
    };

    if (isDraggingGui) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingGui]);

  // Color mappings
  const themeHexColor = config.espColor;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Play/Simulation Screen (8 Cols) */}
      <div className="lg:col-span-8 flex flex-col space-y-4">
        
        {/* Top Control Bar */}
        <div className="glass-morphism rounded-3xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Compass className="w-5 h-5 text-cyan-400" />
            <div>
              <div className="text-sm font-bold text-white neon-text">99 Nights In The Forest Simulator</div>
              <p className="text-[11px] text-white/40">Live testbed. Click on the map to walk/teleport and test Zero Script triggers.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-white/5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Map
            </button>
            <span className="text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-400/20 px-3 py-2 rounded-xl font-mono font-bold tracking-tight">
              STATUS: {config.fullyUndetectable ? 'UNDETECTABLE' : 'STANDARD'}
            </span>
          </div>
        </div>

        {/* Visual Map Render Viewport */}
        <div 
          ref={mapContainerRef}
          onClick={handleMapClick}
          className="relative aspect-[4/3] w-full rounded-2xl border border-white/5 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-950 via-zinc-900 to-black overflow-hidden select-none cursor-crosshair group shadow-2xl"
          style={{ imageRendering: 'pixelated' }}
        >
          {/* Spooky Fog Ambient filter */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(34,211,238,0.04),_transparent_60%)] pointer-events-none" />
          
          {/* Grid markings */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.015)_1px,_transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          {/* Survival statistics headers */}
          <div className="absolute top-4 left-4 z-20 flex gap-2 pointer-events-none text-xs font-mono">
            <div className="bg-black/45 backdrop-blur-md border border-white/5 p-2 rounded-xl flex items-center gap-2 text-white">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-zinc-200">Day {daysSurvived} / 99 Survival</span>
            </div>
            <div className="bg-black/45 backdrop-blur-md border border-white/5 p-2 rounded-xl flex items-center gap-2 text-white">
              <Flame className={`w-3.5 h-3.5 ${warmth < 30 ? 'text-red-400 animate-bounce' : 'text-orange-400'}`} />
              <span className="text-zinc-200">Warmth: {warmth}%</span>
              {warmth < 30 && <span className="text-red-400 font-bold ml-1 text-[10px]">FREEZING</span>}
            </div>
          </div>

          <div className="absolute top-4 right-4 z-20 pointer-events-none">
            <div className="bg-black/45 backdrop-blur-md border border-cyan-500/10 p-2 rounded-xl text-right">
              <div className="text-[10px] font-bold text-cyan-400 font-mono tracking-wider">ZONE AREA</div>
              <div className="text-xs font-bold text-white">{currentMapName}</div>
            </div>
          </div>

          {/* Interactive Legend in corner */}
          <div className="absolute bottom-4 left-4 z-20 bg-black/65 backdrop-blur-md border border-white/5 p-3.5 rounded-2xl text-[10px] space-y-2 pointer-events-none w-40">
            <div className="font-bold text-white/50 tracking-wider">MAP LEGEND</div>
            <div className="flex items-center gap-2 text-white/80">
              <span className="w-2.5 h-2.5 bg-yellow-400 rounded-sm" /> Gold Reward Chest
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <span className="w-2.5 h-2.5 bg-teal-400 rounded-full" /> Forest Supplies
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <span className="w-2.5 h-2.5 bg-red-500/20 border border-red-500 rounded-full" /> Threat (Witch Marsh)
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <span className="w-2.5 h-2.5 bg-cyan-500/15 border border-cyan-400/30 rounded" /> Spawn Camp
            </div>
          </div>

          {/* Floating Action Text items */}
          {floatingTexts.map((ft) => (
            <div
              key={ft.id}
              className="absolute z-40 transform -translate-x-1/2 -translate-y-1/2 font-mono text-[10px] font-bold text-cyan-400 bg-black/85 border border-cyan-500/25 px-2 py-1 rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.35)] animate-[bounce_1.5s_infinite]"
              style={{ left: `${ft.x}%`, top: `${ft.y}%` }}
            >
              {ft.text}
            </div>
          ))}

          {/* Render static zones / features */}
          {/* Campfire Base Zone */}
          <div className="absolute border border-dashed border-cyan-500/20 bg-cyan-500/5 rounded-full w-24 h-24 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center justify-center text-[10px] text-cyan-400 font-mono" style={{ left: '15%', top: '80%' }}>
            <Flame className="w-4 h-4 text-orange-400 animate-pulse mb-0.5" />
            Campfire Area
          </div>

          {/* Danger Marsh Area */}
          <div className="absolute border border-dashed border-red-500/20 bg-red-950/10 rounded-full w-20 h-20 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center justify-center text-[9px] text-red-400 font-mono" style={{ left: '25%', top: '25%' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping mb-1" />
            Danger Marsh
          </div>

          {/* MAP ELEMENTS (Chests & Supplies) */}
          {mapElements.map((elem) => {
            const isDeservedESP = 
              (elem.type === 'chest' && config.espChests) || 
              (elem.type === 'supply' && config.espSupplies) ||
              (elem.type === 'ruins' && config.espRuins);

            if (elem.collected) return null;

            return (
              <div
                key={elem.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 transition-all flex flex-col items-center"
                style={{ left: `${elem.x}%`, top: `${elem.y}%` }}
              >
                {/* Node Dot representation */}
                <div 
                  className={`w-3.5 h-3.5 rounded flex items-center justify-center transition-all shadow-[0_0_8px_rgba(255,255,255,0.15)] ${
                    elem.type === 'chest' 
                      ? 'bg-yellow-400 border border-yellow-200' 
                      : elem.type === 'supply' 
                      ? 'bg-teal-400 rounded-full border border-teal-200' 
                      : elem.type === 'camp'
                      ? 'bg-cyan-500 border border-cyan-300'
                      : 'bg-indigo-500'
                  }`}
                />

                {/* Laser Trailing Line to Player Dot (ESP Tracer effect) */}
                {isDeservedESP && (
                  <svg className="absolute overflow-visible w-0 h-0 pointer-events-none" style={{ zIndex: -1 }}>
                    <line
                      x1={0}
                      y1={0}
                      x2={`${((playerPos.x - elem.x) / 100) * (mapContainerRef.current?.clientWidth || 0)}`}
                      y2={`${((playerPos.y - elem.y) / 100) * (mapContainerRef.current?.clientHeight || 0)}`}
                      stroke={themeHexColor}
                      strokeWidth="1.2"
                      strokeDasharray="4,2"
                      opacity="0.8"
                    />
                  </svg>
                )}

                {/* Floating Tag name (ESP visual effect) */}
                {isDeservedESP && (
                  <div 
                    className="mt-1 flex flex-col items-center text-[8px] font-mono font-bold whitespace-nowrap bg-black/80 px-1.5 py-0.5 rounded-md border"
                    style={{ borderColor: themeHexColor, color: themeHexColor }}
                  >
                    <span>{elem.name}</span>
                    <span>{Math.round(Math.hypot(playerPos.x - elem.x, playerPos.y - elem.y))}m</span>
                  </div>
                )}
              </div>
            );
          })}

          {/* THE PLAYER REPRESENTATIVE DOT (LocalPlayer) */}
          <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center pointer-events-none"
            style={{ 
              left: `${playerPos.x}%`, 
              top: `${playerPos.y}%`,
              transition: `left ${1.5 / (config.walkSpeed / 16)}s ease-out, top ${1.5 / (config.walkSpeed / 16)}s ease-out`
            }}
          >
            {/* Flying levitation ring */}
            {config.flyEnabled && (
              <div 
                className="absolute rounded-full w-8 h-8 border animate-[ping_1.5s_infinite] opacity-60 transform scale-110" 
                style={{ borderColor: themeHexColor }}
              />
            )}

            {/* Glowing Aura */}
            <div 
              className={`w-5 h-5 rounded-full flex items-center justify-center relative p-1 shadow-2xl transition-all ${
                config.flyEnabled 
                  ? 'bg-zinc-950 scale-110' 
                  : 'bg-cyan-500'
              }`}
              style={{ 
                boxShadow: `0 0 20px 5px ${themeHexColor}40`,
                border: config.flyEnabled ? `2.5px solid ${themeHexColor}` : '2px solid #ffffff'
              }}
            >
              {config.flyEnabled ? (
                <Zap className="w-2.5 h-2.5 text-white stroke-[3px]" style={{ color: themeHexColor }} />
              ) : (
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              )}
            </div>

            {/* Float Tag Name */}
            <div className="mt-1 text-[9px] font-bold bg-zinc-950/95 text-white border border-white/5 px-2 py-0.5 rounded-md flex items-center gap-1">
              <span>LocalPlayer</span>
              {config.flyEnabled && <span className="text-[8px] text-cyan-400 font-mono">FLY</span>}
            </div>
          </div>

          {/* MOBILE HUD INTERACTION OVERLAY (Rayfield style GUI on Screen mockup!) */}
          <div 
            onClick={(e) => e.stopPropagation()} // stop click from moving player
            className="absolute z-30 rounded-2xl bg-black/85 backdrop-blur-xl border shadow-[0_15px_40px_rgba(0,0,0,0.85)] overflow-hidden w-[240px] select-none text-[10px] leading-tight"
            style={{ 
              left: `${guiDraggedPosition.x}%`, 
              top: `${guiDraggedPosition.y}%`,
              borderColor: 'rgba(34, 211, 238, 0.4)',
              boxShadow: `0 8px 30px rgba(0,0,0,0.8), 0 0 20px rgba(34, 211, 238, 0.15)`
            }}
          >
            {/* Drag Handle Header */}
            <div 
              onMouseDown={handleGuiDragStart}
              className="bg-white/5 border-b border-white/5 p-3 flex items-center justify-between cursor-move"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span className="font-bold tracking-tight text-white uppercase font-mono">ZERO_SCRIPT.lua</span>
              </div>
              <span className="text-[8px] text-white/55 bg-black/40 px-1.5 py-0.5 rounded-md font-mono">Mobile v2.4</span>
            </div>

            {/* Simulated UI Tabs */}
            <div className="bg-black/30 border-b border-white/5 px-2 py-1.5 flex gap-2 font-bold font-mono text-[8px] text-white/40">
              <span className="text-cyan-400 border-b pb-0.5 border-cyan-400">AUTOFARM</span>
              <span>VISUALS</span>
              <span>TELEPORTS</span>
            </div>

            {/* Simulated Frame content options */}
            <div className="p-2.5 space-y-2 max-h-[140px] overflow-y-auto">
              
              {/* Fly checkbox */}
              <div className="flex items-center justify-between p-1.5 px-2 bg-white/3 rounded-xl border border-white/5">
                <span className="text-white/80 font-semibold font-mono font-medium">Enables Flight.lua</span>
                <span 
                  onClick={() => onConfigChange({ ...config, flyEnabled: !config.flyEnabled })}
                  className="w-3.5 h-3.5 border rounded cursor-pointer flex items-center justify-center font-bold text-[8px]"
                  style={{ borderColor: config.flyEnabled ? themeHexColor : 'rgba(255,255,255,0.15)', color: themeHexColor }}
                >
                  {config.flyEnabled ? '✓' : ''}
                </span>
              </div>

              {/* Walk Speed Display */}
              <div className="space-y-1 p-1.5 bg-white/3 rounded-xl border border-white/5 overflow-hidden">
                <div className="flex justify-between items-center text-[9px]">
                  <span className="text-white/60 font-mono font-medium">Sprint Multi:</span>
                  <span className="text-white font-bold">{config.walkSpeed}</span>
                </div>
                <input 
                  type="range"
                  min="16"
                  max="250"
                  value={config.walkSpeed}
                  onChange={(e) => onConfigChange({ ...config, walkSpeed: parseInt(e.target.value) })}
                  className="w-full accent-cyan-400 h-1 cursor-pointer"
                />
              </div>

              {/* Highlight ESP */}
              <div className="flex items-center justify-between p-1.5 px-2 bg-white/3 rounded-xl border border-white/5">
                <span className="text-white/80 font-semibold font-mono font-medium">Highlight Chests</span>
                <span 
                  onClick={() => onConfigChange({ ...config, espChests: !config.espChests })}
                  className="w-3.5 h-3.5 border rounded cursor-pointer flex items-center justify-center font-bold text-[8px]"
                  style={{ borderColor: config.espChests ? themeHexColor : 'rgba(255,255,255,0.15)', color: themeHexColor }}
                >
                  {config.espChests ? '✓' : ''}
                </span>
              </div>

              {/* Direct Teleports list */}
              <div className="pt-2 border-t border-white/5">
                <div className="text-[8px] font-bold text-white/30 pb-1 font-mono">QUICK DIRECT TWEEN</div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button 
                    onClick={() => {
                      setPlayerPos({ x: 15, y: 80 });
                      setCurrentMapName('Spawn Camp');
                      addLog('Teleport command fired from Mobile HUD to Camp.', 'info');
                    }}
                    className="bg-white/3 hover:bg-white/10 text-white/80 p-1.5 text-[8px] font-mono rounded-lg transition-colors cursor-pointer"
                  >
                    🚩 Cabin
                  </button>
                  <button 
                    onClick={() => {
                      setPlayerPos({ x: 50, y: 45 });
                      setCurrentMapName('Sacred Ancient Tree');
                      addLog('Teleport command fired from Mobile HUD to Sacred Tree.', 'info');
                    }}
                    className="bg-white/3 hover:bg-white/10 text-white/80 p-1.5 text-[8px] font-mono rounded-lg transition-colors cursor-pointer"
                  >
                    🌳 Oak Tree
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Teleport Controller & Logs Tab (4 Cols) */}
      <div className="lg:col-span-4 flex flex-col space-y-4">
        
        {/* Say Teleport Target & Quick Auto-Collect */}
        <div className="glass-morphism rounded-3xl p-5 shadow-2xl space-y-4 text-white border border-white/5">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
            <Compass className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold tracking-tight uppercase neon-text">Say & Warp Console</h3>
          </div>
          
          <form onSubmit={handleCustomTeleportSay} className="space-y-2">
            <p className="text-[11px] text-white/45 leading-relaxed">
              Type coordinates (e.g. <strong className="text-cyan-400 font-mono">50, 45</strong>) or zone name to warp instantly.
            </p>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Warp destination? (e.g. 75, 75)"
                value={typedDestination}
                onChange={(e) => setTypedDestination(e.target.value)}
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/35 focus:outline-none focus:border-cyan-500/50 transition-colors font-sans"
              />
              <button 
                type="submit" 
                className="bg-cyan-500 hover:bg-cyan-400 font-bold text-white px-3 py-2 rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.3)] shrink-0"
              >
                WARP
              </button>
            </div>
          </form>

          <div className="border-t border-white/5 pt-3">
            <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono pb-1.5">Autofarm Shortcuts</h4>
            <button
              onClick={handleAutoCollectAllTreasure}
              disabled={isAutoGatheringChests}
              className={`w-full p-3 font-semibold rounded-2xl text-xs text-center border-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${
                isAutoGatheringChests
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse border-amber-500/30'
                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-300 hover:border-emerald-400/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
              }`}
            >
              <Zap className="w-4 h-4 text-emerald-400" />
              {isAutoGatheringChests ? 'Looting All Chests...' : '⚡ Auto Collect All Map Treasure'}
            </button>
          </div>
        </div>

        {/* Teleport List Card */}
        <div className="glass-morphism rounded-3xl p-5 shadow-2xl space-y-4 text-white">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold tracking-tight uppercase neon-text">Interactive Map Teleports</h3>
          </div>
          <p className="text-[11px] text-white/45">Clicking triggers coordinates execution. Tweens humanely to avoid Roblox teleport bans.</p>
          <div className="space-y-2.5">
            {MAP_LOCATIONS.map((loc) => (
              <button
                key={loc.name}
                onClick={() => handleTeleportToLocation(loc)}
                className="w-full text-left p-3.5 hover:bg-white/5 bg-black/25 rounded-2xl border border-white/5 hover:border-cyan-500/20 transition-all flex gap-3 text-xs justify-between items-center group cursor-pointer"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-white group-hover:text-cyan-400 transition-colors">{loc.name}</div>
                  <div className="text-[10px] text-white/40 line-clamp-1">{loc.desc}</div>
                </div>
                <Crosshair className="w-4 h-4 text-white/20 group-hover:text-cyan-400 shrink-0 transition-all" />
              </button>
            ))}
          </div>
        </div>

        {/* Macro Bot Automations Card */}
        <div className="glass-morphism rounded-3xl p-5 shadow-2xl space-y-4 text-white">
          <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold tracking-tight uppercase neon-text">Macro Bot Automator</h3>
            </div>
            {activeMacro !== 'none' && (
              <span className="text-[8px] bg-amber-500/10 text-amber-400 border border-amber-400/20 px-2 py-0.5 rounded font-mono font-bold animate-pulse">
                RUNNING FAST
              </span>
            )}
          </div>

          <p className="text-[11px] text-white/40 leading-relaxed">
            Instantly teleports, harvests resources from the dense wilderness, and delivers them back securely.
          </p>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-mono">
            <div className="bg-black/35 rounded-xl p-2 border border-white/5">
              <div className="text-white/40">TOTAL LOGS DELIVERED</div>
              <div className="text-xs font-bold text-amber-400">{woodCount} logs</div>
            </div>
            <div className="bg-black/35 rounded-xl p-2 border border-white/5">
              <div className="text-white/40">METALS PROCESSED</div>
              <div className="text-xs font-bold text-cyan-400">{metalCount} pieces</div>
            </div>
          </div>

          <div className="space-y-2">
            {/* Auto Logs -> Campfire */}
            <button
              onClick={() => {
                setActiveMacro('logs-to-fire');
                addLog('Macro started: Auto-logs delivery to Campfire active.', 'warn');
              }}
              className={`w-full p-3 rounded-2xl border text-left text-xs flex items-center justify-between transition-all cursor-pointer ${
                activeMacro === 'logs-to-fire'
                  ? 'bg-amber-500/10 border-amber-400/50 text-amber-300 font-bold shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                  : 'bg-black/30 border-white/5 text-white/75 hover:bg-white/5 hover:border-white/10'
              }`}
            >
              <span className="flex items-center gap-2">🪵 Auto Logs ➜ Campfire</span>
              <span className="text-[9px] bg-zinc-800 px-2 py-0.5 rounded font-mono">START</span>
            </button>

            {/* Auto Logs -> Scrap Machine */}
            <button
              onClick={() => {
                setActiveMacro('logs-to-scrap');
                addLog('Macro started: Auto-logs delivery to Scrap Machine active.', 'warn');
              }}
              className={`w-full p-3 rounded-2xl border text-left text-xs flex items-center justify-between transition-all cursor-pointer ${
                activeMacro === 'logs-to-scrap'
                  ? 'bg-blue-500/10 border-blue-400/50 text-blue-300 font-bold shadow-[0_0_10px_rgba(59,130,246,0.15)]'
                  : 'bg-black/30 border-white/5 text-white/75 hover:bg-white/5 hover:border-white/10'
              }`}
            >
              <span className="flex items-center gap-2">🪵 Auto Logs ➜ Scrap Machine</span>
              <span className="text-[9px] bg-zinc-800 px-2 py-0.5 rounded font-mono">START</span>
            </button>

            {/* Auto Metals -> Scrap Machine */}
            <button
              onClick={() => {
                setActiveMacro('metals-to-scrap');
                addLog('Macro started: Auto-metals delivery to Scrap Machine active.', 'warn');
              }}
              className={`w-full p-3 rounded-2xl border text-left text-xs flex items-center justify-between transition-all cursor-pointer ${
                activeMacro === 'metals-to-scrap'
                  ? 'bg-teal-500/10 border-teal-400/50 text-teal-300 font-bold shadow-[0_0_10px_rgba(20,184,166,0.15)]'
                  : 'bg-black/30 border-white/5 text-white/75 hover:bg-white/5 hover:border-white/10'
              }`}
            >
              <span className="flex items-center gap-2">🪙 Auto Metals ➜ Scrap Machine</span>
              <span className="text-[9px] bg-zinc-800 px-2 py-0.5 rounded font-mono">START</span>
            </button>

            {/* EMERGENCY STOP BUTTON */}
            {activeMacro !== 'none' ? (
              <button
                onClick={() => {
                  setActiveMacro('none');
                  addLog('Macro terminated: All automated physical runners HALTED.', 'error');
                }}
                className="w-full mt-2 p-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-2xl text-xs text-center border border-red-500 shadow-[0_4px_15px_rgba(220,38,38,0.3)] transition-all cursor-pointer animate-pulse"
              >
                🛑 STOP ACTIVE AUTOMATION
              </button>
            ) : (
              <button
                disabled
                className="w-full mt-2 p-3 bg-white/5 text-white/20 rounded-2xl text-xs text-center border border-white/5 font-semibold font-mono"
              >
                No active bot loops
              </button>
            )}
          </div>
        </div>

        {/* Executor Logs HUD */}
        <div className="glass-morphism rounded-3xl p-5 shadow-2xl flex-1 flex flex-col min-h-[180px] text-white">
          <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <h3 className="text-xs font-bold uppercase tracking-widest font-mono text-white/70">Zero Script Exec Logs</h3>
            </div>
            <span className="text-[9px] text-white/30 font-mono">Console Active</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 text-[10px] font-mono leading-relaxed max-h-[160px] pb-2 scrollbar-thin scrollbar-thumb-white/5">
            {logs.map((log, idx) => (
              <div key={idx} className="flex gap-1.5 items-start">
                <span className="text-white/30 shrink-0">[{log.time}]</span>
                <span className={`shrink-0 ${
                  log.type === 'success' 
                    ? 'text-cyan-400 font-bold' 
                    : log.type === 'warn' 
                    ? 'text-yellow-400' 
                    : log.type === 'error'
                    ? 'text-red-400'
                    : 'text-white/50'
                }`}>
                  {log.type === 'success' ? '✔' : log.type === 'warn' ? '⚠' : '>'}
                </span>
                <span className="text-white/70">{log.text}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
