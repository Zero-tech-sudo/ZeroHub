import React from 'react';
import { Sliders, ShieldAlert, Palette, SlidersHorizontal, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';
import { RobloxGame } from '../gamesData';

interface ScriptConfiguratorProps {
  game: RobloxGame;
  customValues: {
    walkSpeed: number;
    jumpPower: number;
    extraToggles: Record<string, boolean>;
    extraSliders: Record<string, number>;
  };
  onChange: (newValues: {
    walkSpeed: number;
    jumpPower: number;
    extraToggles: Record<string, boolean>;
    extraSliders: Record<string, number>;
  }) => void;
}

export const ScriptConfigurator: React.FC<ScriptConfiguratorProps> = ({ game, customValues, onChange }) => {
  const handleWalkSpeedChange = (val: number) => {
    onChange({
      ...customValues,
      walkSpeed: val
    });
  };

  const handleJumpPowerChange = (val: number) => {
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
    onChange({
      ...customValues,
      extraSliders: {
        ...customValues.extraSliders,
        [key]: val
      }
    });
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
        <div className="black-glass-morphism p-4 rounded-2xl border border-white/5 space-y-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-white/80 font-medium">Walk Speed (Studs/s)</span>
            <span className="font-mono font-bold text-xs text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/20">{customValues.walkSpeed}</span>
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
        <div className="black-glass-morphism p-4 rounded-2xl border border-white/5 space-y-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-white/80 font-medium">Jump Power (Height scale)</span>
            <span className="font-mono font-bold text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">{customValues.jumpPower}</span>
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
          return (
            <div key={slider.key} className="black-glass-morphism p-4 rounded-2xl border border-white/5 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/80 font-medium">{slider.label}</span>
                <span className="font-mono font-bold text-xs text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded border border-indigo-400/20">
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

      {/* Premium Keyless status */}
      <div className="p-3 bg-cyan-950/15 rounded-xl border border-cyan-500/10 flex items-center gap-2.5 text-[10px] text-cyan-300">
        <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>This compiled script utilizes bypass tunnels to operate without annoying key links.</span>
      </div>
    </div>
  );
};
