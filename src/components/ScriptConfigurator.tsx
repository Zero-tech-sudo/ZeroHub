import React from 'react';
import { Sliders, ShieldAlert, Palette, SlidersHorizontal, ToggleLeft, ToggleRight, Sparkles, Download, Lock } from 'lucide-react';
import { RobloxGame } from '../gamesData';

interface ScriptConfiguratorProps {
  game: RobloxGame;
  customValues: {
    walkSpeed: number;
    jumpPower: number;
    extraToggles: Record<string, boolean>;
    extraSliders: Record<string, number>;
    chainedScripts?: string;
  };
  onChange: (newValues: {
    walkSpeed: number;
    jumpPower: number;
    extraToggles: Record<string, boolean>;
    extraSliders: Record<string, number>;
    chainedScripts?: string;
  }) => void;
  sessionUser?: any;
  allCustomStates?: Record<string, any>;
  triggerToast?: (msg: string) => void;
  allGames?: RobloxGame[];
}

export const ScriptConfigurator: React.FC<ScriptConfiguratorProps> = ({ 
  game, 
  customValues, 
  onChange,
  sessionUser,
  allCustomStates,
  triggerToast,
  allGames = []
}) => {
  const [activeSliderFlashes, setActiveSliderFlashes] = React.useState<Record<string, boolean>>({});
  const flashTimers = React.useRef<Record<string, NodeJS.Timeout>>({});

  const chainedScriptsVal = customValues.chainedScripts || '';

  const getChainedUrlList = (): string[] => {
    if (!chainedScriptsVal.trim()) return [];
    const trimmedVal = chainedScriptsVal.trim();
    if (trimmedVal.startsWith('[') && trimmedVal.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmedVal);
        if (Array.isArray(parsed)) return parsed.filter((x): x is string => typeof x === 'string');
      } catch (e) {}
    }
    return trimmedVal.split(/[|;,\n]+/).map(x => x.trim()).filter(Boolean);
  };

  const chainedUrls = getChainedUrlList();

  const updateChainedUrls = (newUrls: string[]) => {
    const unique = Array.from(new Set(newUrls.filter(Boolean)));
    const serialized = unique.join(' | ');
    onChange({
      ...customValues,
      chainedScripts: serialized
    });
  };

  const presets = [
    { name: '🛡️ Anti-Cheat Bypass', url: 'https://raw.githubusercontent.com/ZeroHub-Roblox/scripts/main/modules/bypass.lua' },
    { name: '⚡ FPS Booster & Optimizer', url: 'https://raw.githubusercontent.com/ZeroHub-Roblox/scripts/main/modules/fps_boost.lua' },
    { name: '👁️ Universal ESP Assist', url: 'https://raw.githubusercontent.com/ZeroHub-Roblox/scripts/main/modules/esp_assist.lua' },
    { name: '🛰️ Universal Chat Logger', url: 'https://raw.githubusercontent.com/ZeroHub-Roblox/scripts/main/modules/chat_logger.lua' }
  ];

  const togglePreset = (url: string) => {
    if (chainedUrls.includes(url)) {
      updateChainedUrls(chainedUrls.filter(u => u !== url));
      if (triggerToast) triggerToast('Removed utility module from script chain!');
    } else {
      updateChainedUrls([...chainedUrls, url]);
      if (triggerToast) triggerToast('Added utility module to script chain!');
    }
  };

  const otherGames = allGames.filter(g => g.id !== game.id);

  const toggleGameScript = (url: string) => {
    if (chainedUrls.includes(url)) {
      updateChainedUrls(chainedUrls.filter(u => u !== url));
      if (triggerToast) triggerToast('Removed script from script chain!');
    } else {
      updateChainedUrls([...chainedUrls, url]);
      if (triggerToast) triggerToast('Chained game script in loadstring execution block!');
    }
  };

  const triggerFlash = (key: string) => {
    if (flashTimers.current[key]) {
      clearTimeout(flashTimers.current[key]);
    }
    setActiveSliderFlashes(prev => ({ ...prev, [key]: true }));
    flashTimers.current[key] = setTimeout(() => {
      setActiveSliderFlashes(prev => ({ ...prev, [key]: false }));
    }, 500);
  };

  React.useEffect(() => {
    return () => {
      Object.values(flashTimers.current).forEach(clearTimeout);
    };
  }, []);

  const handleWalkSpeedChange = (val: number) => {
    triggerFlash('walkSpeed');
    onChange({
      ...customValues,
      walkSpeed: val
    });
  };

  const handleJumpPowerChange = (val: number) => {
    triggerFlash('jumpPower');
    onChange({
      ...customValues,
      jumpPower: val
    });
  };

  const handleToggleChange = (key: string, currentVal: boolean) => {
    onChange({
      ...customValues,
      extraToggles: {
        ...customValues.extraToggles,
        [key]: !currentVal
      }
    });
  };

  const handleSliderChange = (key: string, val: number) => {
    triggerFlash(key);
    onChange({
      ...customValues,
      extraSliders: {
        ...customValues.extraSliders,
        [key]: val
      }
    });
  };

  const handleExportAllConfigs = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
        JSON.stringify({
          exportedBy: sessionUser?.email || sessionUser?.displayName || "Authenticated User",
          exportedAt: new Date().toISOString(),
          appName: "ZeroHub Roblox Exploit Workspace",
          configs: allCustomStates || {}
        }, null, 2)
      );
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `zerohub-configs-${sessionUser?.displayName?.toLowerCase().replace(/\s+/g, '-') || 'user'}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      if (triggerToast) {
        triggerToast("Successfully exported all customized game profiles as JSON!");
      }
    } catch (err) {
      console.error(err);
      if (triggerToast) {
        triggerToast("Failed to export configurations.");
      }
    }
  };

  return (
    <div className="glass-morphism rounded-3xl p-5 md:p-6 shadow-2xl space-y-6 text-white bg-zinc-950/40 border border-white/5 backdrop-blur-xl">
      
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-white/5 pb-3.5">
        <Sliders className="w-5 h-5 text-cyan-400" />
        <div>
          <h2 className="text-base font-bold text-white tracking-tight font-sans neon-text">Customize {game.emojiText} {game.name}</h2>
          <p className="text-xs text-white/40">Calibrate the live in-game active cheat parameters</p>
        </div>
      </div>

      {/* Speed & Physics Sliders */}
      <div className="space-y-4">
        <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest flex items-center gap-1.5 font-mono">
          <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" /> Character Physics
        </label>

        {/* Walk Speed */}
        <div className={`black-glass-morphism p-4 rounded-2xl border space-y-2.5 transition-all duration-300 origin-center ${
          activeSliderFlashes['walkSpeed']
            ? 'border-cyan-500/50 bg-cyan-950/25 shadow-[0_0_20px_rgba(6,182,212,0.25)] scale-[1.015]'
            : 'border-white/5'
        }`}>
          <div className="flex justify-between items-center text-xs">
            <span className="text-white/80 font-medium">Walk Speed (Studs/s)</span>
            <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded border transition-all duration-300 ${
              activeSliderFlashes['walkSpeed']
                ? 'text-cyan-300 bg-cyan-400/35 border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.4)] scale-110'
                : 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20'
            }`}>{customValues.walkSpeed}</span>
          </div>
          <div className="relative flex items-center">
            <input
              type="range"
              min="16"
              max="250"
              value={customValues.walkSpeed}
              onChange={(e) => handleWalkSpeedChange(parseInt(e.target.value))}
              className="w-full accent-cyan-400 h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <p className="text-[9px] text-white/30">Roblox standard default is 16. Higher allows instant bypass traversal.</p>
        </div>

        {/* Jump Power */}
        <div className={`black-glass-morphism p-4 rounded-2xl border space-y-2.5 transition-all duration-300 origin-center ${
          activeSliderFlashes['jumpPower']
            ? 'border-emerald-500/50 bg-emerald-950/25 shadow-[0_0_20px_rgba(16,185,129,0.25)] scale-[1.015]'
            : 'border-white/5'
        }`}>
          <div className="flex justify-between items-center text-xs">
            <span className="text-white/80 font-medium">Jump Power (Height scale)</span>
            <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded border transition-all duration-300 ${
              activeSliderFlashes['jumpPower']
                ? 'text-emerald-300 bg-emerald-400/35 border-emerald-400/50 shadow-[0_0_12px_rgba(16,185,129,0.4)] scale-110'
                : 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
            }`}>{customValues.jumpPower}</span>
          </div>
          <div className="relative flex items-center">
            <input
              type="range"
              min="50"
              max="300"
              value={customValues.jumpPower}
              onChange={(e) => handleJumpPowerChange(parseInt(e.target.value))}
              className="w-full accent-emerald-400 h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <p className="text-[9px] text-white/30">Roblox standard default is 50. Controls jumping vertical limits.</p>
        </div>

        {/* Custom Game Sliders */}
        {game.settings.extraSliders.map((slider) => {
          const currentVal = customValues.extraSliders[slider.key] ?? slider.val;
          const isFlashing = activeSliderFlashes[slider.key];
          return (
            <div 
              key={slider.key} 
              className={`black-glass-morphism p-4 rounded-2xl border space-y-2.5 transition-all duration-300 origin-center ${
                isFlashing
                  ? 'border-indigo-500/50 bg-indigo-950/25 shadow-[0_0_20px_rgba(99,102,241,0.25)] scale-[1.015]'
                  : 'border-white/5'
              }`}
            >
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/80 font-medium">{slider.label}</span>
                <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded border transition-all duration-300 ${
                  isFlashing
                    ? 'text-indigo-300 bg-indigo-400/35 border-indigo-400/50 shadow-[0_0_12px_rgba(99,102,241,0.4)] scale-110'
                    : 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20'
                }`}>
                  {currentVal} {slider.unit}
                </span>
              </div>
              <div className="relative flex items-center">
                <input
                  type="range"
                  min={slider.min}
                  max={slider.max}
                  value={currentVal}
                  onChange={(e) => handleSliderChange(slider.key, parseInt(e.target.value))}
                  className="w-full accent-indigo-400 h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Hacks Features Toggles */}
      <div className="space-y-3">
        <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest flex items-center gap-1.5 font-mono">
          <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" /> Active Cheat Modules
        </label>

        {game.settings.extraToggles.map((toggle) => {
          const isChecked = customValues.extraToggles[toggle.key] ?? toggle.val;
          return (
            <div key={toggle.key} className="flex items-center justify-between p-3.5 black-glass-morphism border border-white/5 rounded-2xl hover:border-white/10 transition-all">
              <div>
                <div className="text-xs font-bold text-white/95 flex items-center gap-1.5">
                  {toggle.label}
                  {toggle.label.toLowerCase().includes('aura') && (
                    <span className="text-[8px] bg-rose-500/15 text-rose-400 px-1 py-0.5 rounded font-mono border border-rose-500/20">AURA</span>
                  )}
                  {toggle.label.toLowerCase().includes('magnet') && (
                    <span className="text-[8px] bg-amber-500/15 text-amber-400 px-1 py-0.5 rounded font-mono border border-amber-500/20 font-bold">OP</span>
                  )}
                </div>
                <p className="text-[9px] text-white/35 mt-0.5">Enables automated hooks inside {game.name}</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggleChange(toggle.key, isChecked)}
                className="transition-transform active:scale-95 cursor-pointer focus:outline-none"
              >
                {isChecked ? (
                  <ToggleRight className="w-9 h-9 text-cyan-400" />
                ) : (
                  <ToggleLeft className="w-9 h-9 text-white/20" />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Loadstring Chaining & Multi-Module Combiner */}
      <div className="space-y-4 border-t border-white/5 pt-4">
        <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Loadstring Chaining & Multi-Module Combiner
        </label>
        
        <div className="black-glass-morphism p-4 rounded-2xl border border-white/5 space-y-3.5">
          <p className="text-[10.5px] text-white/50 leading-relaxed font-sans">
            Combine multiple utility modules or other scripts in the database into one unified loadstring execution block.
          </p>

          {/* Preset Modules */}
          <div className="space-y-2">
            <span className="block text-[9px] uppercase font-mono font-bold text-white/35">Preset Utility Modules</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {presets.map((preset) => {
                const isSelected = chainedUrls.includes(preset.url);
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => togglePreset(preset.url)}
                    className={`p-2.5 rounded-xl border text-left text-[11px] transition-all flex items-center justify-between cursor-pointer group ${
                      isSelected 
                        ? 'bg-cyan-500/10 border-cyan-400/40 text-cyan-300 font-semibold' 
                        : 'bg-black/30 border-white/5 text-white/50 hover:bg-black/50 hover:border-white/10 hover:text-white'
                    }`}
                  >
                    <span>{preset.name}</span>
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[8px] font-bold transition-all ${
                      isSelected ? 'bg-cyan-400 border-cyan-400 text-black' : 'border-white/20 text-transparent'
                    }`}>
                      ✓
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Database Scripts Chaining */}
          {otherGames.length > 0 && (
            <div className="space-y-2">
              <span className="block text-[9px] uppercase font-mono font-bold text-white/35">Chain with Other Games</span>
              <div className="flex flex-wrap gap-1.5">
                {otherGames.map((g) => {
                  const isSelected = chainedUrls.includes(g.rawUrl);
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => toggleGameScript(g.rawUrl)}
                      className={`px-2.5 py-1.5 rounded-xl border text-[10.5px] transition-all flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300 font-semibold shadow-[0_0_8px_rgba(99,102,241,0.15)]'
                          : 'bg-black/30 border-white/5 text-white/45 hover:bg-black/50 hover:border-white/10 hover:text-white/80'
                      }`}
                    >
                      <span>{g.emojiText}</span>
                      <span>{g.name.split(' [')[0]}</span>
                      {isSelected && <span className="text-[8px] bg-indigo-400 text-black rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold font-mono">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Custom Text Area for direct URL input */}
          <div className="space-y-1.5">
            <span className="block text-[9px] uppercase font-mono font-bold text-white/35">Custom Delimited Script URLs / JSON Array</span>
            <textarea
              rows={3}
              value={chainedScriptsVal}
              onChange={(e) => {
                onChange({
                  ...customValues,
                  chainedScripts: e.target.value
                });
              }}
              placeholder="e.g. https://my-script.com/bypass.lua | https://my-script.com/fps.lua (Separated by '|', commas, or newlines)"
              className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/30 font-mono leading-relaxed"
            />
            <p className="text-[9px] text-white/30 font-sans leading-normal">
              You can manually paste multiple raw loader URLs. Chaining automatically compiles them into an optimized single execution loadstring loop.
            </p>
          </div>
        </div>
      </div>

      {/* Backup & Export configurations */}
      <div className="p-4 bg-zinc-900/50 border border-white/5 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export Configurations</span>
            </h4>
            <p className="text-[10px] text-white/40 leading-relaxed">Backup your customized speed, physical parameters, and active cheat selections as a JSON file.</p>
          </div>
        </div>

        {sessionUser ? (
          <button
            type="button"
            onClick={handleExportAllConfigs}
            className="w-full py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/25 hover:border-cyan-400/40 text-cyan-300 hover:text-white text-[10px] font-mono font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.03)]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export All Configs (.json)</span>
          </button>
        ) : (
          <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-center gap-2 text-[10px] text-amber-400">
            <Lock className="w-3.5 h-3.5 shrink-0" />
            <span>Sign in to backup & export configs.</span>
          </div>
        )}
      </div>

      {/* Premium Keyless status */}
      <div className="p-3 bg-cyan-950/15 rounded-xl border border-cyan-500/10 flex items-center gap-2.5 text-[10px] text-cyan-300">
        <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>This compiled script utilizes bypass tunnels to operate without annoying key links.</span>
      </div>
    </div>
  );
};
