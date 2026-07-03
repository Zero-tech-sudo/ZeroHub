import React, { useState, useEffect } from 'react';
import { Terminal, Copy, Check, Info, Zap, Settings as SettingsIcon, Sliders, Eye, EyeOff, Plus, Minus, Play, Cpu, Loader2, Sparkles, RefreshCw, Flame, ShieldAlert, Square, X, Code } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RobloxGame } from '../gamesData';
import { ForestSimulator } from './ForestSimulator';
import { generateLuaScript } from '../data';

interface LuaScriptViewProps {
  game: RobloxGame;
  customValues: {
    walkSpeed: number;
    jumpPower: number;
    extraToggles: Record<string, boolean>;
    extraSliders: Record<string, number>;
    chainedScripts?: string;
  };
  isDevOrOwner?: boolean;
}

export const LuaScriptView: React.FC<LuaScriptViewProps> = ({ game, customValues, isDevOrOwner = false }) => {
  const [copied, setCopied] = useState(false);
  const [loaderType, setLoaderType] = useState<'clean' | 'advanced' | 'raw_source'>('clean');

  const generateRawSourceScript = () => {
    const config = {
      walkSpeed: customValues.walkSpeed,
      flySpeed: customValues.extraSliders.flySpeed ?? 45,
      jumpPower: customValues.jumpPower,
      espColor: '#06b6d4',
      espChests: customValues.extraToggles.espChests ?? true,
      espSupplies: customValues.extraToggles.espSupplies ?? true,
      espRuins: customValues.extraToggles.espRuins ?? true,
      flyEnabled: customValues.extraToggles.flyEnabled ?? false,
      noclipEnabled: customValues.extraToggles.noclipEnabled ?? false,
      autoCollectTreasure: customValues.extraToggles.autoCollectTreasure ?? true,
      killAura: customValues.extraToggles.killAura ?? false,
      chopAllTrees: customValues.extraToggles.chopAllTrees ?? false,
      autoSaplings: customValues.extraToggles.autoSaplings ?? false,
      bringItems: customValues.extraToggles.bringItems ?? false,
      teleportLostChildren: customValues.extraToggles.teleportLostChildren ?? false,
      executor: 'delta' as const,
      scriptTheme: 'cyber' as const,
      fullyUndetectable: true,
      keylessMode: true
    };
    return generateLuaScript(config);
  };

  // Parse custom and game delimited script blocks or arrays of scripts
  const parseChainedUrls = (primaryUrl: string, chainedScripts?: string): string[] => {
    const urls: string[] = [];
    
    const addUrl = (url: string) => {
      const trimmed = url.trim();
      if (trimmed && (trimmed.startsWith('http://') || trimmed.startsWith('https://')) && !urls.includes(trimmed)) {
        urls.push(trimmed);
      }
    };

    const processText = (text: string) => {
      const trimmed = text.trim();
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            parsed.forEach(item => {
              if (typeof item === 'string') addUrl(item);
            });
            return;
          }
        } catch (e) {
          // Fallback to split if JSON parse fails
        }
      }
      const parts = trimmed.split(/[|;,\n]+/);
      parts.forEach(addUrl);
    };

    if (primaryUrl) {
      processText(primaryUrl);
    }

    if (chainedScripts) {
      processText(chainedScripts);
    }

    return urls;
  };

  const chainedUrls = parseChainedUrls(game.rawUrl, customValues.chainedScripts);

  // Script theme settings inside the code view container (separate from website)
  const [showSettings, setShowSettings] = useState(false);
  const [scriptColor, setScriptColor] = useState<'cyan' | 'amber' | 'emerald' | 'ruby' | 'purple' | 'blue' | 'white'>(() => {
    return (localStorage.getItem('zerohub-script-color') as any) || 'amber';
  });
  const [fontSize, setFontSize] = useState<number>(() => {
    return Number(localStorage.getItem('zerohub-script-fontsize') || '12');
  });
  const [showComments, setShowComments] = useState<boolean>(() => {
    return localStorage.getItem('zerohub-script-comments') !== 'false';
  });

  // Dynamic compiler loading animation states
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilingProgress, setCompilingProgress] = useState(0);
  const [compilingStepText, setCompilingStepText] = useState('');

  // Interactive Level 7 executor simulation states
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [executionStep, setExecutionStep] = useState(0);
  const [simulatedWalkSpeed, setSimulatedWalkSpeed] = useState(customValues.walkSpeed);
  const [simulatedNoclip, setSimulatedNoclip] = useState(false);
  const [simulatedFly, setSimulatedFly] = useState(false);
  const [simulatedEsp, setSimulatedEsp] = useState(true);

  // Sync simulator speed on customValue changes
  useEffect(() => {
    setSimulatedWalkSpeed(customValues.walkSpeed);
  }, [customValues.walkSpeed]);

  // Trigger compiler loading animation whenever game.id or loaderType changes
  useEffect(() => {
    setIsCompiling(true);
    setCompilingProgress(0);
    
    const steps = [
      'Initializing ZeroHub Luau Compiler v4.5...',
      'Securing cloud CDN loadstring endpoint...',
      'Decrypting and verifying Roblox client bypass hashes...',
      `Configuring walker speed variables to ${customValues.walkSpeed}...`,
      'Assembling secure anti-cheat & memory-shield wrappers...',
      'Structuring final polymorphic executor bytecode...',
      'Polymorphic script compiled and loaded successfully!'
    ];
    
    let currentStep = 0;
    setCompilingStepText(steps[0]);

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setCompilingStepText(steps[currentStep]);
        setCompilingProgress((currentStep / (steps.length - 1)) * 100);
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsCompiling(false);
        }, 120);
      }
    }, 110);

    return () => clearInterval(interval);
  }, [game.id, loaderType]);

  const startExecutionSimulation = () => {
    setIsExecuting(true);
    setExecutionStep(0);
    setExecutionLogs([]);

    const baseLogs = [
      '🔧 [Delta Injector] Attaching Delta Level 7 Executor API...',
      '🔍 [Delta Injector] Locating active Roblox client processes...',
      '📌 [Delta Injector] Hooked RobloxPlayerBeta.exe successfully (PID: 28941) at 0x7FFA830C0000',
      '🛡️ [Delta Bypass] Bypassing anti-cheat & memory-shield registers...',
      '🌐 [GitHub Linker] Verifying active master connection with raw.githubusercontent.com...',
      '✅ [GitHub Linker] Repository synced 100%! Connected securely to: ZeroHub-Roblox/scripts',
    ];

    const logs = [...baseLogs];
    
    if (chainedUrls.length > 1) {
      logs.push(`🔗 [Chainer] Detected ${chainedUrls.length} combined utility loadstrings to chain...`);
      chainedUrls.forEach((url, idx) => {
        logs.push(`📡 [CDN Loader] Handshaking secure Cloudflare CDN for Module ${idx + 1}...`);
        logs.push(`📦 [GitHub Fetch] Downloading bytecode chunk from "${url.substring(0, 42)}..."`);
        logs.push(`⚡ [VM Compiler] Translating Luau registers for Module ${idx + 1}...`);
      });
    } else {
      logs.push(`📡 [CDN Loader] Handshaking secure CDN tunnels...`);
      logs.push(`📦 [GitHub Fetch] Fetching live: "${game.rawUrl.substring(0, 50)}..."`);
      logs.push('⚡ [VM Compiler] Translating Luau VM code registers...');
    }

    logs.push('🚀 [Delta Loader] SECURE LOADSTRING EXECUTED IN CLIENT ENVIRONMENT!');
    logs.push('✨ [ZeroHub HUD] Welcome, Void User! Spawning ZeroHub Premium HUD GUI...');

    let currentLog = 0;
    const logTimer = setInterval(() => {
      if (currentLog < logs.length) {
        setExecutionLogs(prev => [...prev, logs[currentLog]]);
        setExecutionStep(currentLog + 1);
        currentLog++;
      } else {
        clearInterval(logTimer);
      }
    }, 280);
  };

  const isComingSoon = false;

  // Save options to localStorage on change
  useEffect(() => {
    localStorage.setItem('zerohub-script-color', scriptColor);
  }, [scriptColor]);

  useEffect(() => {
    localStorage.setItem('zerohub-script-fontsize', String(fontSize));
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('zerohub-script-comments', String(showComments));
  }, [showComments]);

  // Automatically wraps individual script URLs into a single, cohesive loadstring execution block using an array-to-loadstring converter
  const wrapScriptsInCohesiveLoadstring = (urls: string[]): string => {
    if (urls.length === 0) return '';
    if (urls.length === 1) {
      return `loadstring(game:HttpGet("${urls[0]}", true))()`;
    }
    
    // High-efficiency array-to-loadstring converter block with pcall safety
    const formattedUrls = urls.map(url => `    "${url.trim()}"`).join(',\n');
    return `-- [[ ZeroHub Cohesive Multi-Script Execution Block ]]\n` +
      `local ZeroHubScripts = {\n${formattedUrls}\n}\n\n` +
      `for _, scriptUrl in ipairs(ZeroHubScripts) do\n` +
      `    local success, err = pcall(function()\n` +
      `        loadstring(game:HttpGet(scriptUrl, true))()\n` +
      `    end)\n` +
      `    if not success then\n` +
      `        warn("[ZeroHub Loader] Execution failed for Module: " .. tostring(scriptUrl) .. " | Error: " .. tostring(err))\n` +
      `    end\n` +
      `end`;
  };

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
      if (key !== 'chainedScripts') {
        configLines.push(`    ${key} = ${val ? 'true' : 'false'},`);
      }
    });

    // Inject custom game-specific sliders
    Object.entries(customValues.extraSliders).forEach(([key, val]) => {
      configLines.push(`    ${key} = ${val},`);
    });

    configLines.push(`    Theme = "cyber",`);
    configLines.push(`    Keyless = true`);
    configLines.push(`}`);
    configLines.push(``);
    
    configLines.push(wrapScriptsInCohesiveLoadstring(chainedUrls));
    
    return configLines.join('\n');
  };

  const cleanScript = isComingSoon 
    ? `-- [[ Zero Script Hub ]]\n-- Coming Soon!` 
    : wrapScriptsInCohesiveLoadstring(chainedUrls);
  
  const displayedScript = 
    loaderType === 'clean' 
      ? cleanScript 
      : loaderType === 'advanced'
        ? generateAdvancedScript()
        : generateRawSourceScript();

  // Strip or retain comments based on settings
  const getFinalScript = () => {
    if (showComments) return displayedScript;
    return displayedScript
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n')
      .replace(/\n\n+/g, '\n'); // clean up consecutive empty lines
  };

  const finalScriptText = getFinalScript();

  const handleCopy = () => {
    navigator.clipboard.writeText(finalScriptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = finalScriptText.split('\n').length;
  const byteCount = new Blob([finalScriptText]).size;

  const colorMap = {
    cyan: '#22d3ee',
    amber: '#fbbf24',
    emerald: '#34d399',
    ruby: '#fb7185',
    purple: '#c084fc',
    blue: '#60a5fa',
    white: '#f4f4f5'
  };

  const activeColorHex = colorMap[scriptColor];

  return (
    <div className="glass-morphism rounded-3xl overflow-hidden shadow-2xl flex flex-col h-full border border-white/5 bg-zinc-950/40 backdrop-blur-xl relative">

      {/* Top Banner and Tabs */}
      <div className="bg-white/3 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:px-5 gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4" style={{ color: activeColorHex }} />
            <span className="text-xs font-mono text-zinc-100 font-bold tracking-tight">
              Zero Loader / <span className="font-sans" style={{ color: activeColorHex }}>{game.name}</span>
            </span>
          </div>
          {/* GitHub Connection Badge */}
          <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-400/30 text-emerald-400 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold shadow-[0_0_10px_rgba(16,185,129,0.15)] select-none">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span>GitHub Connected</span>
          </div>
        </div>

        {/* Dynamic Loader Switcher */}
        <div className="flex bg-black/40 p-0.5 rounded-xl border border-white/5 self-start sm:self-center flex-wrap gap-1">
          <button
            onClick={() => setLoaderType('clean')}
            className={`px-3 py-1 text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              loaderType === 'clean'
                ? 'bg-white/5 text-white border border-white/10'
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
                ? 'bg-white/5 text-white border border-white/10'
                : 'text-white/40 hover:text-white/70 border border-transparent'
            }`}
          >
            <SettingsIcon className="w-3 h-3 text-cyan-400" />
            Injected Loader
          </button>
          <button
            onClick={() => setLoaderType('raw_source')}
            className={`px-3 py-1 text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              loaderType === 'raw_source'
                ? 'bg-white/5 text-white border border-white/10'
                : 'text-white/40 hover:text-white/70 border border-transparent'
            }`}
          >
            <Code className="w-3 h-3 text-emerald-400" />
            Full Raw Script
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-mono text-white/30 hidden xl:inline mr-2">
            {lineCount} {lineCount === 1 ? 'line' : 'lines'} | {byteCount} bytes
          </span>

          {/* SIMULATE RUN BUTTON */}
          <button
            onClick={startExecutionSimulation}
            disabled={isCompiling || isComingSoon}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all duration-300 flex items-center gap-1.5 cursor-pointer select-none active:scale-95 border ${
              isExecuting
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                : 'bg-amber-500/5 hover:bg-amber-500/15 border-amber-500/20 hover:border-amber-500/40 text-amber-300 hover:text-amber-100'
            } ${isComingSoon ? 'opacity-40 cursor-not-allowed' : ''}`}
            title="Simulate loading & running the script inside an attached executor"
          >
            <Play className={`w-3.5 h-3.5 ${isExecuting ? 'animate-pulse' : ''}`} />
            <span>{isExecuting ? 'EXECUTING...' : 'RUN SIMULATOR'}</span>
          </button>

          {/* SCRIPT SETTINGS TOGGLE */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center cursor-pointer border select-none ${
              showSettings 
                ? 'bg-white/10 border-white/20 text-white shadow-[0_0_10px_rgba(255,255,255,0.1)]' 
                : 'bg-white/3 hover:bg-white/5 border-white/5 text-white/60 hover:text-white'
            }`}
            title="Configure script settings & colors"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* COPY BUTTON */}
          <button
            onClick={handleCopy}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-1.5 cursor-pointer select-none ${
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
                <Copy className="w-3.5 h-3.5" /> COPY SCRIPT
              </>
            )}
          </button>
        </div>
      </div>

      {/* SCRIPT SPECIFIC SETTINGS DRAWER */}
      {showSettings && (
        <div className="bg-black/85 border-b border-white/5 p-4 text-left space-y-4 font-sans relative z-10 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-zinc-300 flex items-center gap-1.5 font-mono">
              <Sliders className="w-3.5 h-3.5" style={{ color: activeColorHex }} />
              Script Customizer
            </h4>
            <span className="text-[10px] text-zinc-500 font-mono">Changes only affect script output color</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Color Setting */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-zinc-400 block font-mono">Script Display Color</label>
              <div className="flex flex-wrap gap-1.5 items-center">
                {(Object.keys(colorMap) as Array<keyof typeof colorMap>).map((color) => {
                  const hex = colorMap[color];
                  const isSelected = scriptColor === color;
                  return (
                    <button
                      key={color}
                      onClick={() => setScriptColor(color)}
                      style={{ backgroundColor: hex, boxShadow: isSelected ? `0 0 10px ${hex}` : undefined }}
                      className={`w-5 h-5 rounded-full border transition-all cursor-pointer relative flex items-center justify-center ${
                        isSelected ? 'border-white scale-110' : 'border-white/10 hover:scale-105'
                      }`}
                      title={`${color.toUpperCase()} Theme`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-black stroke-[3px]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Font Sizer */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-zinc-400 block font-mono">Script Font Size</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFontSize(prev => Math.max(10, prev - 1))}
                  className="w-7 h-7 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-white hover:bg-white/10 transition-all cursor-pointer"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-xs font-mono text-white font-bold min-w-12 text-center bg-black/40 p-1 rounded-md border border-white/5">
                  {fontSize}px
                </span>
                <button
                  onClick={() => setFontSize(prev => Math.min(18, prev + 1))}
                  className="w-7 h-7 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-white hover:bg-white/10 transition-all cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Script Comments Switcher */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-zinc-400 block font-mono">Format Option</label>
              <button
                onClick={() => setShowComments(!showComments)}
                className={`w-full p-2 rounded-xl text-xs font-bold transition-all border flex items-center justify-between cursor-pointer ${
                  showComments 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' 
                    : 'bg-white/5 border-white/10 text-white/50'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {showComments ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{showComments ? 'Retain Lua Comments' : 'Strip Lua Comments'}</span>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/35">
                  {showComments ? 'FULL' : 'CLEAN'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Code Editor Panel or Executor Simulation Panel */}
      <div className="p-5 bg-black/45 flex-1 overflow-y-auto max-h-[460px] min-h-[220px] font-mono leading-relaxed relative scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">
        <AnimatePresence mode="wait">
          {isExecuting ? (
            <motion.div 
              key="executor-simulation"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-4 text-left"
            >
              {/* Virtual Executor Window Frame */}
              <div className="bg-zinc-950 border border-amber-500/30 rounded-2xl overflow-hidden shadow-2xl relative">
                
                {/* Executor Window Header */}
                <div className="bg-zinc-900 border-b border-white/5 px-4 py-2.5 flex items-center justify-between text-[11px] font-mono font-bold text-zinc-400">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <span>DELTA EXECUTOR v4.5</span>
                    <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded">ATTACHED</span>
                  </div>
                  <button 
                    onClick={() => setIsExecuting(false)}
                    className="p-1 rounded bg-white/5 hover:bg-red-500/20 hover:text-red-400 transition-all cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                <div className="p-4 space-y-3 font-mono text-[11px] min-h-[180px] flex flex-col justify-between">
                  {/* Console Logs area */}
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto text-zinc-300">
                    {executionLogs.map((log, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`leading-relaxed ${
                          log.includes('SUCCESS') ? 'text-emerald-400 font-extrabold' : 
                          log.includes('Welcome') ? 'text-cyan-400 font-extrabold' : 'text-zinc-300'
                        }`}
                      >
                        {log}
                      </motion.div>
                    ))}
                    {executionStep < 9 && (
                      <div className="flex items-center gap-1.5 text-amber-400/80 animate-pulse">
                        <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                        <span>Running Level-7 payload loader...</span>
                      </div>
                    )}
                  </div>

                  {/* Execution Progress Bar */}
                  {executionStep < 9 && (
                    <div className="space-y-1 mt-3">
                      <div className="flex justify-between text-[9px] text-zinc-500">
                        <span>Bytecode processing...</span>
                        <span>{Math.round((executionStep / 9) * 100)}%</span>
                      </div>
                      <div className="w-full bg-zinc-900 h-1 rounded overflow-hidden">
                        <div 
                          className="bg-amber-400 h-full transition-all duration-300"
                          style={{ width: `${(executionStep / 9) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Interactive Floating ZeroHub HUD GUI - Injected inside Roblox Player Client */}
                  {executionStep >= 9 && (
                    game.id === 'nights_forest' ? (
                      <div className="mt-2 text-left">
                        <ForestSimulator
                          walkSpeed={simulatedWalkSpeed}
                          jumpPower={customValues.jumpPower}
                          extraToggles={customValues.extraToggles}
                          extraSliders={customValues.extraSliders}
                          onClose={() => setIsExecuting(false)}
                        />
                      </div>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="mt-2 bg-gradient-to-b from-zinc-900 to-black border border-cyan-500/40 rounded-xl p-4 shadow-[0_0_30px_rgba(6,182,212,0.15)] relative overflow-hidden"
                      >
                        {/* ZeroHub HUD Background Matrix Grid Overlay */}
                        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />

                        {/* HUD Header */}
                        <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3 relative z-10">
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-cyan-400 animate-bounce" />
                            <span className="text-xs font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-300 uppercase">
                              ZeroHub Roblox HUD
                            </span>
                          </div>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-bold uppercase tracking-widest animate-pulse">
                            Active Bypass
                          </span>
                        </div>

                        {/* Mock HUD Features */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
                          {/* Memory Speeder Slider */}
                          <div className="space-y-1.5 bg-white/2 p-2 rounded-lg border border-white/5">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-zinc-400 font-bold">👟 WalkSpeed Alterer</span>
                              <span className="text-cyan-400 font-mono font-bold">{simulatedWalkSpeed} / 250</span>
                            </div>
                            <input 
                              type="range" 
                              min="16" 
                              max="250"
                              value={simulatedWalkSpeed}
                              onChange={(e) => setSimulatedWalkSpeed(Number(e.target.value))}
                              className="w-full h-1 bg-black rounded-lg appearance-none cursor-pointer accent-cyan-500"
                            />
                          </div>

                          {/* Toggles Column */}
                          <div className="space-y-1.5 text-[10px]">
                            <button 
                              onClick={() => setSimulatedFly(!simulatedFly)}
                              className={`w-full p-2 rounded-lg border flex items-center justify-between transition-all cursor-pointer font-bold ${
                                simulatedFly 
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.05)]' 
                                  : 'bg-black/30 border-white/5 text-zinc-500 hover:text-zinc-300'
                              }`}
                            >
                              <span>🛸 Infinite Jump Fly</span>
                              <span>{simulatedFly ? 'ON' : 'OFF'}</span>
                            </button>

                            <button 
                              onClick={() => setSimulatedNoclip(!simulatedNoclip)}
                              className={`w-full p-2 rounded-lg border flex items-center justify-between transition-all cursor-pointer font-bold ${
                                simulatedNoclip 
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.05)]' 
                                  : 'bg-black/30 border-white/5 text-zinc-500 hover:text-zinc-300'
                              }`}
                            >
                              <span>🌀 Noclip (Pass Walls)</span>
                              <span>{simulatedNoclip ? 'ON' : 'OFF'}</span>
                            </button>
                          </div>
                        </div>

                        <div className="mt-3.5 pt-2.5 border-t border-white/5 flex items-center justify-between text-[9px] text-zinc-500">
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            <span>Status: In-game HUD fully responsive</span>
                          </div>
                          <button 
                            onClick={() => {
                              setIsExecuting(false);
                            }}
                            className="px-2 py-1 rounded bg-white/5 hover:bg-white/15 text-[9px] text-white transition-all font-mono uppercase font-bold cursor-pointer"
                          >
                            Return to Code
                          </button>
                        </div>
                      </motion.div>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          ) : isCompiling ? (
            <motion.div 
              key="compiler-loading"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex flex-col items-center justify-center py-14 px-6 bg-black/60 rounded-2xl border border-white/5 space-y-4 animate-pulse min-h-[220px]"
            >
              <div className="w-12 h-12 rounded-full bg-cyan-500/5 border border-cyan-500/20 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
              </div>
              
              <div className="space-y-2 text-center w-full max-w-xs">
                <span className="text-xs font-mono text-zinc-300 font-extrabold uppercase tracking-widest block">
                  Compiling Polymorphic VM...
                </span>
                
                <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden border border-white/5">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full transition-all duration-100 ease-out" 
                    style={{ width: `${compilingProgress}%` }}
                  />
                </div>
              </div>

              <div className="text-[10px] font-mono text-cyan-400 max-w-sm truncate">
                {compilingStepText}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="code-editor-panel"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div className="text-[10px] text-zinc-400 bg-white/5 border border-white/5 rounded-xl px-3 py-2 leading-relaxed flex items-start gap-2.5 text-left">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  {loaderType === 'clean' ? (
                    <span>
                      <strong className="text-white/80 font-semibold font-sans">Clean Loadstring (Recommended)</strong>: Copy and paste this launcher script into Level 7 executors (such as <strong className="text-white/80">Delta</strong>, <strong className="text-white/80">Xeno</strong>, <strong className="text-white/80">Wave</strong>, or <strong className="text-white/80">Solara</strong>) inside your Roblox client to launch.
                    </span>
                  ) : (
                    <span>
                      <strong className="text-white/80 font-semibold font-sans">Custom Injected Loader</strong>: Copy this script to preload customized parameters like walking speed, jump power, or auto-farm behaviors directly inside your executor environment.
                    </span>
                  )}
                </span>
              </div>

              <pre 
                style={{ color: activeColorHex, fontSize: `${fontSize}px` }}
                className="whitespace-pre overflow-x-auto select-all bg-black/40 p-4 rounded-xl border border-white/5 font-mono selection:bg-cyan-500/20 shadow-inner leading-relaxed text-left transition-all duration-300"
              >
                <code>{finalScriptText}</code>
              </pre>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Meta/Tips Footer */}
      <div className="bg-black/20 p-3.5 px-5 border-t border-white/5 text-[11px] text-white/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>
            Auto-updates instantly live on the cloud. Paste and execute this loadstring in Delta or Xeno.
          </span>
        </div>
        <span className="text-[9px] uppercase tracking-wider font-mono text-zinc-500 font-bold hidden sm:inline select-none">
          Script Theme: <span style={{ color: activeColorHex }}>{scriptColor}</span>
        </span>
      </div>
    </div>
  );
};
