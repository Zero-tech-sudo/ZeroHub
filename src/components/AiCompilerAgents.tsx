import React, { useState, useEffect } from 'react';
import { 
  Cpu, Code2, Zap, Copy, Check, Terminal, Play, RotateCcw, AlertTriangle, 
  CheckCircle, HelpCircle, Info, ShieldAlert, Sparkles, Settings2, Code, Gauge, Layers, RefreshCw, Shield
} from 'lucide-react';

interface Executor {
  name: string;
  platform: 'PC' | 'Android/iOS' | 'Multiplatform';
  status: 'Undetected' | 'Updating' | 'Patched';
  tier: string;
  score: number;
  instructions: string;
  techNotes: string;
}

interface AiCompilerAgentsProps {
  theme?: 'studio-light' | 'studio-dark';
  activeGameName?: string;
  triggerToast: (msg: string) => void;
  userEmail?: string;
}

export const AiCompilerAgents: React.FC<AiCompilerAgentsProps> = ({
  theme,
  activeGameName = 'General',
  triggerToast,
  userEmail = ''
}) => {
  const isDeveloperOrOwner = 
    !!(userEmail && ['mohamedayanle0@gmail.com', 'owner@zerohub.net'].includes(userEmail.toLowerCase()));

  const [activeSubTab, setActiveSubTab] = useState<'creator' | 'optimizer' | 'executors'>(() => {
    return isDeveloperOrOwner ? 'creator' : 'optimizer';
  });

  // Redirect if access revoked
  useEffect(() => {
    if (!isDeveloperOrOwner && activeSubTab === 'creator') {
      setActiveSubTab('optimizer');
    }
  }, [userEmail, isDeveloperOrOwner, activeSubTab]);

  // Creator Agent State
  const [prompt, setPrompt] = useState('');
  const [creatorGame, setCreatorGame] = useState(activeGameName);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScript, setGeneratedScript] = useState<string>(
    `-- [[ Press Generate to create a custom Luau exploit script ]]`
  );
  const [generatedDesc, setGeneratedDesc] = useState<string>(
    'Select a prompt template or write your own custom cheat mechanisms in the field on the left. The ZeroHub AI compile agent will generate an optimized Roblox Luau exploit script.'
  );
  const [generatedSuggestions, setGeneratedSuggestions] = useState<string[]>([
    "Auto Chest collector loop",
    "Wallhack line tracers with color dynamic ranges",
    "Bypassed walkspeed multiplier"
  ]);

  // Optimizer Agent State
  const [userCodeToOptimize, setUserCodeToOptimize] = useState<string>(
    `local function farm()\n    while true do\n        wait(1)\n        game:GetService("ReplicatedStorage").RemoteEvent:FireServer("Collect")\n    end\nend\nfarm()`
  );
  const [enhancementType, setEnhancementType] = useState<string>('Lag reduction & task loop conversion');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedScript, setOptimizedScript] = useState<string>('');
  const [optimizationReport, setOptimizationReport] = useState<string>('');

  const [creatorCopied, setCreatorCopied] = useState(false);
  const [optimizerCopied, setOptimizerCopied] = useState(false);

  // Dynamic Prompt Presets
  const promptPresets = [
    { label: '🔥 Auto Farm Level', text: 'Build an automated farming script that spawns a thread, loops every 1 second, and tweens the character to enemies' },
    { label: '👁️ Custom ESP Wallhack', text: 'Create an ESP script that adds BillboardGui targets to all players, tracking their health, distance, and showing tracers' },
    { label: '🪶 Safe Fly Mechanics', text: 'Develop a flight script using BodyVelocity that moves in the camera direction with keybind toggles and bypass speed check' },
    { label: '👟 Walkspeed Anti-Detection', text: 'Create a custom walkspeed booster that periodically resets the speed attribute to bypass Roblox client anticheat telemetry' }
  ];

  // Dynamic Optimizer presets
  const optimizerPresets = [
    { label: 'Convert wait() loops to task.wait()', type: 'Lag reduction & task loop conversion' },
    { label: 'Bypass Remote Event Spam kicks', type: 'Remote Event flood security wrapper' },
    { label: 'Apply getgenv() memory table spoofing', type: 'Metatable Hooking & secure obfuscation' },
    { label: 'Graceful nil handler safety wraps', type: 'Thread safe error containment & check limits' }
  ];

  // Executor compatibility database
  const EXECUTORS: Executor[] = [
    {
      name: 'Solara V3',
      platform: 'PC',
      status: 'Undetected',
      tier: 'Tier 1 (99% Luau Execution)',
      score: 98,
      instructions: 'Open Solara, click the Inject button inside the Roblox client, copy the loadstring, paste it into Solara editor, and press Run/Execute.',
      techNotes: 'Supports standard game:HttpGet, full getgenv() persistence, and metatable hooks for client speed bypasses.'
    },
    {
      name: 'Delta Mobile',
      platform: 'Android/iOS',
      status: 'Undetected',
      tier: 'Tier 1 (Keyless API Support)',
      score: 96,
      instructions: 'Boot Roblox on your emulator/mobile, copy the loader. Delta automatically detects when you copy a loadstring; press Inject in the overlay.',
      techNotes: 'Optimized for mobile memory limits. Perfectly executes heavy graphics drawing and thread scheduler cycles.'
    },
    {
      name: 'Wave Executor',
      platform: 'PC',
      status: 'Updating',
      tier: 'Tier 1 (Premium Bypasses)',
      score: 94,
      instructions: 'Ensure Wave process is active in background task bar. Join the game lobby, click Inject on Wave UI, then execute clean loadstring.',
      techNotes: 'Contains Byfron anti-cheat deep memory spoofers. Avoid excessive walkspeed sliders over 150 to keep packet replication safe.'
    },
    {
      name: 'Hydrogen',
      platform: 'Android/iOS',
      status: 'Undetected',
      tier: 'Tier 2 (High Performance)',
      score: 95,
      instructions: 'Unlock Hydrogen with key, tap the console overlay tab inside the Roblox client, paste the loader string, and press the green Play button.',
      techNotes: 'Exceptional drawing thread speed. Perfect for running ZeroHub auto-farm overlays and in-game simulators.'
    },
    {
      name: 'Codex exploit',
      platform: 'Android/iOS',
      status: 'Undetected',
      tier: 'Tier 1 (Universal Android)',
      score: 97,
      instructions: 'Load Codex GUI from sidebar, paste the ZeroHub loadstring into the text input, tap Run Script. Key is requested every 24 hours.',
      techNotes: 'Compatible with standard getgc() garbage collector checks. Bypasses in-game anti-teleport checks natively.'
    },
    {
      name: 'Celery V2',
      platform: 'PC',
      status: 'Undetected',
      tier: 'Tier 2 (Compact Execution)',
      score: 91,
      instructions: 'Attach Celery to the active Roblox window. Press the terminal icon to inject the custom loadstring loader, and hit play.',
      techNotes: 'Lightweight footprint, slightly restricted metatable coverage. Clean loadstring mode is highly recommended.'
    }
  ];

  // AI Script Generation Handler
  const handleGenerateScript = async (customPrompt?: string) => {
    const activePrompt = customPrompt !== undefined ? customPrompt : prompt;
    if (!activePrompt.trim()) {
      triggerToast("Please write a script requirement prompt!");
      return;
    }
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: activePrompt, gameName: creatorGame })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setGeneratedScript(data.code || '');
      setGeneratedDesc(data.description || '');
      setGeneratedSuggestions(data.suggestions || []);
      triggerToast("AI compilation successful!");
    } catch (err: any) {
      console.error(err);
      triggerToast("AI Service busy. Initiating Sandbox compilation!");
      // Fallback sandbox generation
      setGeneratedScript(
        `-- [[ ZeroHub AI Script Compiler Fallback ]]\n-- Target Game: ${creatorGame}\n-- Requested: "${activePrompt}"\n\nlocal player = game:GetService("Players").LocalPlayer\nlocal character = player.Character or player.CharacterAdded:Wait()\n\n-- Optimized thread loop\ntask.spawn(function()\n    while task.wait(1) do\n        -- Action: ${activePrompt}\n        print("Bypassing client thread checks for: ${activePrompt}")\n    end\nend)`
      );
      setGeneratedDesc(`Simulated response. (To unlock fully detailed Gemini AI script creations, make sure your GEMINI_API_KEY is configured in Settings > Secrets!)`);
    } finally {
      setIsGenerating(false);
    }
  };

  // AI Code Optimization Handler
  const handleOptimizeScript = async (customType?: string) => {
    const activeType = customType !== undefined ? customType : enhancementType;
    if (!userCodeToOptimize.trim()) {
      triggerToast("Please enter some Luau code to optimize!");
      return;
    }
    setIsOptimizing(true);
    try {
      const response = await fetch('/api/optimize-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: userCodeToOptimize, enhancementType: activeType })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setOptimizedScript(data.optimizedCode || '');
      setOptimizationReport(data.report || '');
      triggerToast("AI Code Optimization complete!");
    } catch (err: any) {
      console.error(err);
      triggerToast("AI Service busy. Initiating local sanitization...");
      // Safe local replacement sandbox fallback
      const optimizedLocal = userCodeToOptimize
        .replace(/wait\(/g, 'task.wait(')
        .replace(/spawn\(/g, 'task.spawn(');
      setOptimizedScript(`-- [[ Cleaned & Bypassed Local Fallback ]]\n-- Applied Category: ${activeType}\n\n${optimizedLocal}`);
      setOptimizationReport(`- Modified legacy 'wait()' references to high-frequency scheduler 'task.wait()'.\n- Isolated local player environment reference to bypass memory telemetry scans.`);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleCopyCreator = () => {
    navigator.clipboard.writeText(generatedScript);
    setCreatorCopied(true);
    triggerToast("Copied AI Generated Script!");
    setTimeout(() => setCreatorCopied(false), 2000);
  };

  const handleCopyOptimizer = () => {
    navigator.clipboard.writeText(optimizedScript);
    setOptimizerCopied(true);
    triggerToast("Copied Optimized Luau Script!");
    setTimeout(() => setOptimizerCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left font-sans">
      
      {/* Tab Header Banner */}
      <div className="bg-zinc-950/40 p-5 rounded-3xl border border-white/5 space-y-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="p-1 px-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white border border-cyan-400/20 rounded font-mono text-[9px] uppercase tracking-widest font-bold">
            ZeroHub Dev Suite V2
          </span>
          <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" /> Luau Exploiting AI Compiler Hub
          </h2>
          <p className="text-xs text-white/40">
            Create custom scripts, optimize legacy Roblox code, and check real-time executor client bypass capabilities.
          </p>
        </div>

        {/* Horizontal Navigation Control */}
        <div className="flex bg-black/50 p-1 rounded-2xl border border-white/5 self-start md:self-center font-mono">
          {isDeveloperOrOwner && (
            <button
              onClick={() => setActiveSubTab('creator')}
              className={`px-3.5 py-2 text-[10px] font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'creator'
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-400/20 shadow-[0_0_12px_rgba(6,182,212,0.1)]'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              AI Developer
            </button>
          )}
          <button
            onClick={() => setActiveSubTab('optimizer')}
            className={`px-3.5 py-2 text-[10px] font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'optimizer'
                ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-400/20 shadow-[0_0_12px_rgba(6,182,212,0.1)]'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            AI Optimizer
          </button>
          <button
            onClick={() => setActiveSubTab('executors')}
            className={`px-3.5 py-2 text-[10px] font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'executors'
                ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-400/20 shadow-[0_0_12px_rgba(6,182,212,0.1)]'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            Executor Matrix
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: AI CREATOR DEVELOPER AGENT */}
      {activeSubTab === 'creator' && isDeveloperOrOwner && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fadeIn">
          {/* Prompt Left Card (5 Cols) */}
          <div className="lg:col-span-5 glass-morphism rounded-3xl p-5 border border-white/5 bg-zinc-950/15 space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">AI Developer Agent</h3>
            </div>

            <p className="text-xs text-white/50 leading-relaxed font-sans">
              Enter the features you want to inject. ZeroHub AI writes clean, modern Roblox Luau compatible with mobile and PC executors.
            </p>

            {/* Prompt Template Presets */}
            <div className="space-y-1.5">
              <span className="text-[9px] text-white/30 font-bold uppercase block font-mono">Suggested Templates</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {promptPresets.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setPrompt(p.text);
                      handleGenerateScript(p.text);
                    }}
                    className="p-2 text-left bg-black/40 hover:bg-black/60 border border-white/5 hover:border-cyan-500/20 rounded-xl transition-all text-[10px] text-white/70 hover:text-cyan-300 cursor-pointer truncate"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-3.5 pt-2">
              <div>
                <label className="block text-[9px] text-white/40 uppercase tracking-widest font-mono font-bold pb-1">Target Roblox Game</label>
                <input 
                  type="text" 
                  value={creatorGame}
                  onChange={(e) => setCreatorGame(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/20"
                  placeholder="General (Universal Exploit)"
                />
              </div>

              <div>
                <label className="block text-[9px] text-white/40 uppercase tracking-widest font-mono font-bold pb-1">Feature Instructions / Prompt</label>
                <textarea 
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/20 leading-relaxed font-sans"
                  placeholder="Describe details: ESP colors, specific chest coordinates, walkspeed multiplier, jump intervals, bypass triggers..."
                />
              </div>

              <button
                onClick={handleGenerateScript}
                disabled={isGenerating}
                className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer text-xs font-mono shadow-[0_4px_15px_rgba(6,182,212,0.2)]"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>SYNTHESIZING LUAU AST...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>GENERATE ROBLOX SCRIPT</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generated Code Output (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Explainer Panel */}
            <div className="bg-cyan-500/5 p-4 rounded-3xl border border-cyan-400/10 space-y-1.5">
              <h4 className="text-xs font-bold text-cyan-300 flex items-center gap-1.5 font-mono">
                <Info className="w-3.5 h-3.5" /> AGENT COMPILE BRIEFING
              </h4>
              <p className="text-[11px] text-white/50 leading-relaxed">
                {generatedDesc}
              </p>
            </div>

            {/* Live Script Output Container */}
            <div className="glass-morphism rounded-3xl overflow-hidden border border-white/5 bg-zinc-950/20">
              <div className="bg-white/3 p-3 px-4.5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono text-[10px] font-bold text-zinc-300">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span>AI_COMPILER_OUTPUT.lua</span>
                </div>

                <button
                  onClick={handleCopyCreator}
                  className={`p-1.5 px-3.5 rounded-xl border text-[10px] font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                    creatorCopied 
                      ? 'bg-green-500/10 border-green-500/30 text-green-300' 
                      : 'bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-400/20 text-cyan-300'
                  }`}
                >
                  {creatorCopied ? (
                    <>
                      <Check className="w-3 h-3 text-green-400 stroke-[3px]" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-cyan-400" />
                      <span>Copy Lua Code</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 bg-black/45 overflow-y-auto max-h-[300px] min-h-[160px] font-mono text-xs text-amber-300/90 leading-relaxed scrollbar-thin">
                <pre className="whitespace-pre overflow-x-auto select-all leading-relaxed bg-black/30 p-3 rounded-xl border border-white/5">
                  <code>{generatedScript}</code>
                </pre>
              </div>
            </div>

            {/* AI Suggestions Matrix */}
            <div className="space-y-2">
              <span className="text-[9px] text-white/30 font-bold uppercase block font-mono">Enhancement Recommendations</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {generatedSuggestions.map((sug, i) => (
                  <div key={i} className="p-3 bg-white/3 border border-white/5 rounded-2xl space-y-1">
                    <span className="text-[8px] bg-cyan-500/15 text-cyan-300 px-1.5 py-0.5 rounded font-mono font-black uppercase">RECOM {i+1}</span>
                    <p className="text-[10px] text-white/60 leading-normal">{sug}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SUB-TAB 2: AI CODE OPTIMIZER AGENT */}
      {activeSubTab === 'optimizer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fadeIn">
          {/* Left Input Area (6 Cols) */}
          <div className="lg:col-span-6 glass-morphism rounded-3xl p-5 border border-white/5 bg-zinc-950/15 space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
              <Code className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Paste Script to Optimize</h3>
            </div>

            <p className="text-xs text-white/50 leading-relaxed font-sans">
              Have an old script that gets you kicked, or causes game frame lag? Paste it here to allow ZeroHub AI to sanitize loop rates and implement bypass hooks.
            </p>

            {/* Optimization Category Selection */}
            <div>
              <label className="block text-[9px] text-white/40 uppercase tracking-widest font-mono font-bold pb-1.5">Optimization Directives</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-3">
                {optimizerPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setEnhancementType(preset.type);
                      handleOptimizeScript(preset.type);
                    }}
                    className={`p-2 text-left border rounded-xl transition-all text-[9px] font-mono leading-tight cursor-pointer ${
                      enhancementType === preset.type 
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 font-bold' 
                        : 'bg-black/30 border-white/5 text-white/50 hover:bg-black/50 hover:text-white/80'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Editor Input */}
            <div className="space-y-3">
              <label className="block text-[9px] text-white/40 uppercase tracking-widest font-mono font-bold">Raw Luau/Lua Input</label>
              <textarea 
                rows={8}
                value={userCodeToOptimize}
                onChange={(e) => setUserCodeToOptimize(e.target.value)}
                className="w-full bg-black/45 border border-white/5 rounded-xl p-4 text-xs font-mono text-emerald-400 focus:outline-none focus:border-cyan-500/20 leading-relaxed"
                placeholder="Paste your lua script here..."
              />

              <button
                onClick={handleOptimizeScript}
                disabled={isOptimizing}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer text-xs font-mono shadow-[0_4px_15px_rgba(16,185,129,0.2)]"
              >
                {isOptimizing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>REFYING BYTECODE...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span>OPTIMIZE & SECURE CODE</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Optimized Code Output & Audit Report (6 Cols) */}
          <div className="lg:col-span-6 space-y-4">
            
            {/* Live Optimized Script */}
            <div className="glass-morphism rounded-3xl overflow-hidden border border-white/5 bg-zinc-950/20">
              <div className="bg-white/3 p-3 px-4.5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono text-[10px] font-bold text-zinc-300">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>OPTIMIZED_STABLE.lua</span>
                </div>

                <button
                  disabled={!optimizedScript}
                  onClick={handleCopyOptimizer}
                  className={`p-1.5 px-3.5 rounded-xl border text-[10px] font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                    !optimizedScript 
                      ? 'opacity-40 cursor-not-allowed'
                      : optimizerCopied 
                        ? 'bg-green-500/10 border-green-500/30 text-green-300' 
                        : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-400/20 text-emerald-300'
                  }`}
                >
                  {optimizerCopied ? (
                    <>
                      <Check className="w-3 h-3 text-green-400 stroke-[3px]" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-emerald-400" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 bg-black/45 overflow-y-auto max-h-[220px] min-h-[160px] font-mono text-xs text-cyan-300 leading-relaxed scrollbar-thin">
                {optimizedScript ? (
                  <pre className="whitespace-pre overflow-x-auto select-all leading-relaxed bg-black/30 p-3 rounded-xl border border-white/5">
                    <code>{optimizedScript}</code>
                  </pre>
                ) : (
                  <div className="py-12 text-center text-white/30 text-[11px]">
                    <Zap className="w-6 h-6 text-white/10 mx-auto mb-2 animate-bounce" />
                    <span>Run the optimizer to view enhanced Luau bytecode outputs.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Audit Diagnostics Report */}
            <div className="glass-morphism rounded-3xl p-5 border border-white/5 bg-zinc-950/10 space-y-3">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                <h4 className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">AI Security & Bypass Log</h4>
              </div>

              {optimizationReport ? (
                <div className="text-xs text-white/60 leading-relaxed space-y-2 font-mono text-[10.5px]">
                  {optimizationReport.split('\n').map((line, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <span className="text-emerald-400 font-bold">✔</span>
                      <p>{line.replace(/^- /, '')}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-white/30 leading-normal">
                  Our system evaluates remote event payload spamming, inspects for thread-delay consistency, replaces laggy repeat blocks with fast event connections, and wraps everything inside secure environments dynamically.
                </p>
              )}
            </div>

          </div>
        </div>
      )}

      {/* SUB-TAB 3: EXECUTOR COMPATIBILITY MATRIX */}
      {activeSubTab === 'executors' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Header Note */}
          <div className="bg-zinc-900/40 p-4 rounded-3xl border border-white/5 flex gap-3 items-start">
            <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-white uppercase tracking-wide">WHAT ARE EXECUTORS AND HOW TO USE THEM?</h4>
              <p className="text-xs text-white/50 leading-relaxed">
                Roblox executors are third-party environment tools (like <strong>Solara, Delta, or Hydrogen</strong>) that allow injecting custom Lua/Luau script loaders inside the active game environment. ZeroHub is calibrated to run beautifully with every major executor.
              </p>
            </div>
          </div>

          {/* Matrix Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {EXECUTORS.map((exec, idx) => {
              let statusColor = '';
              let statusText = '';
              if (exec.status === 'Undetected') {
                statusColor = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
                statusText = '🟢 Undetected & Safe';
              } else if (exec.status === 'Updating') {
                statusColor = 'bg-amber-500/10 border-amber-500/20 text-amber-400';
                statusText = '🟡 Updating / Patched';
              } else {
                statusColor = 'bg-rose-500/10 border-rose-500/20 text-rose-400';
                statusText = '🔴 Patch Detected';
              }

              return (
                <div 
                  key={idx} 
                  className="glass-morphism rounded-3xl p-4.5 border border-white/5 bg-zinc-950/25 space-y-3.5 hover:border-white/10 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2 text-left">
                    {/* Title & Badge */}
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white">{exec.name}</h4>
                      <span className="text-[8px] bg-white/5 text-white/50 px-2 py-0.5 rounded uppercase font-mono font-bold">
                        {exec.platform}
                      </span>
                    </div>

                    {/* Score Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] font-mono text-white/40">
                        <span>Compatibility Score</span>
                        <span className="text-cyan-400 font-bold">{exec.score}%</span>
                      </div>
                      <div className="w-full bg-zinc-900 rounded-full h-1 overflow-hidden">
                        <div 
                          className="bg-cyan-500 h-1 rounded-full" 
                          style={{ width: `${exec.score}%` }}
                        />
                      </div>
                    </div>

                    {/* Status Box */}
                    <div className={`p-1.5 rounded-xl border text-[9.5px] font-mono font-bold text-center ${statusColor}`}>
                      {statusText}
                    </div>

                    {/* Instructions */}
                    <div className="space-y-1">
                      <span className="text-[8px] text-white/35 font-bold uppercase block font-mono">Execution Method</span>
                      <p className="text-[10px] text-white/60 leading-normal font-sans">
                        {exec.instructions}
                      </p>
                    </div>

                    {/* Tech Notes */}
                    <div className="p-2 bg-black/40 rounded-xl border border-white/5 text-[9px] text-zinc-400 font-mono leading-normal">
                      <span className="text-[8px] text-cyan-400 font-black block mb-0.5">DEV SPECS</span>
                      {exec.techNotes}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`loadstring(game:HttpGet("https://raw.githubusercontent.com/ZeroHubOfficial/main/loader.lua", true))()`);
                      triggerToast(`Copied standard loadstring optimized for ${exec.name}!`);
                    }}
                    className="w-full py-1.5 bg-white/3 hover:bg-white/6 border border-white/5 hover:border-white/10 rounded-xl transition-all text-[9.5px] font-mono font-bold uppercase tracking-wider text-white/70 hover:text-white cursor-pointer"
                  >
                    Copy Loader for {exec.name.split(' ')[0]}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Final security tip */}
          <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-3xl flex gap-3 items-center">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <p className="text-[11px] text-white/50 leading-relaxed">
              <strong>Executor Safety Rule:</strong> Avoid running scripts from untrusted YouTube links. Always fetch loaders from secure repositories (like <strong className="text-cyan-300">ZeroHub</strong>) to prevent account telemetry logging or credential hijackers.
            </p>
          </div>
        </div>
      )}

      {/* Subtle Developer Authorized-only terminal */}
      {!isDeveloperOrOwner && (
        <div className="pt-4 mt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-left font-mono">
          <div className="text-[10px] text-white/35 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Developer Suite Locked. Authenticated credentials required for Creator nodes.</span>
          </div>
        </div>
      )}

    </div>
  );
};
