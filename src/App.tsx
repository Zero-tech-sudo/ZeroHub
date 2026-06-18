import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Info, Flame, Trees, Sparkles, Plus, Search, 
  Terminal, History, HelpCircle, Gamepad2, Settings as SettingsIcon,
  ChevronRight, ExternalLink, Zap, Check, Gift, Layers, CheckCircle, Share2,
  LogIn, LogOut, Sun, Moon, Database
} from 'lucide-react';
import { ScriptConfig } from './types';
import { ScriptConfigurator } from './components/ScriptConfigurator';
import { LuaScriptView } from './components/LuaScriptView';
import { ForestSimulator } from './components/ForestSimulator';
import { InstructionSheet } from './components/InstructionSheet';
import { INITIAL_GAMES, INITIAL_CHANGELOGS, RobloxGame, ChangeLogEntry } from './gamesData';
import { AuthModal } from './components/AuthModal';
import { AnimatePresence } from 'motion/react';

// Firebase imports
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, setDoc, getDoc, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from './firebase';

export default function App() {
  // Website Views: 'directory' | 'changelog' | 'education' | 'simulator'
  const [activeTab, setActiveTab] = useState<'directory' | 'simulator' | 'changelog' | 'education'>('directory');
  
  // Theme State
  const [theme, setTheme] = useState<'neon' | 'ultradark'>(() => {
    return (localStorage.getItem('voidware-theme') as 'neon' | 'ultradark') || 'neon';
  });

  const toggleTheme = (newTheme: 'neon' | 'ultradark') => {
    setTheme(newTheme);
    localStorage.setItem('voidware-theme', newTheme);
  };

  // Auth States
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [mockUser, setMockUser] = useState<{ uid: string; displayName: string; photoURL: string; email: string } | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const sessionUser = currentUser || mockUser;

  const handleSandboxSignIn = () => {
    setMockUser({
      uid: 'sandbox_user_1337',
      displayName: 'Void Explorer',
      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face',
      email: 'mohamedayanle0@gmail.com'
    });
    triggerToast("Sandbox Session activated offline!");
  };

  // Script Directory State
  const [games, setGames] = useState<RobloxGame[]>(INITIAL_GAMES);
  const [selectedGameId, setSelectedGameId] = useState<string>('nights_forest');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // "Add Custom Script" form toggler and state
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [formGameName, setFormGameName] = useState<string>('');
  const [formRawUrl, setFormRawUrl] = useState<string>('');
  const [formEmojiText, setFormEmojiText] = useState<string>('🎮');
  const [formCategory, setFormCategory] = useState<RobloxGame['category']>('custom');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formFeatures, setFormFeatures] = useState<string>('');
  const [formStatus, setFormStatus] = useState<RobloxGame['status']>('Undetected');

  // Notification Toast For Interactions/Sync
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Custom configuration mappings per game
  const [gameCustomStates, setGameCustomStates] = useState<Record<string, {
    walkSpeed: number;
    jumpPower: number;
    extraToggles: Record<string, boolean>;
    extraSliders: Record<string, number>;
  }>>({
    nights_forest: {
      walkSpeed: 75,
      jumpPower: 120,
      extraToggles: { autoCollectTreasure: true, espChests: true, chopAllTrees: false, teleportLostChildren: false },
      extraSliders: { flySpeed: 45 }
    },
    blade_ball: {
      walkSpeed: 64,
      jumpPower: 50,
      extraToggles: { autoParry: true, soundShield: false, visualPaths: true },
      extraSliders: { parryRadius: 28, spamInterval: 4 }
    },
    blox_fruits: {
      walkSpeed: 80,
      jumpPower: 60,
      extraToggles: { masteryFarm: false, levelFarm: true, bypassIslands: true },
      extraSliders: { attackDelay: 1 }
    },
    doors: {
      walkSpeed: 22,
      jumpPower: 50,
      extraToggles: { entityEsp: true, puzzleSolver: false, escapeEsp: true },
      extraSliders: {}
    },
    bedwars: {
      walkSpeed: 45,
      jumpPower: 95,
      extraToggles: { scaffold: true, killAura: true, tracers: false },
      extraSliders: { auraRange: 6 }
    }
  });

  const activeGame = games.find(g => g.id === selectedGameId) || games[0];

  // Safely retrieve custom state values for the active game
  const activeCustomState = gameCustomStates[activeGame.id] || {
    walkSpeed: activeGame.settings.walkSpeed,
    jumpPower: activeGame.settings.jumpPower,
    extraToggles: activeGame.settings.extraToggles.reduce((acc, t) => ({ ...acc, [t.key]: t.val }), {}),
    extraSliders: activeGame.settings.extraSliders.reduce((acc, s) => ({ ...acc, [s.key]: s.val }), {})
  };

  const handleCustomStateChange = (newValues: typeof activeCustomState) => {
    setGameCustomStates({
      ...gameCustomStates,
      [activeGame.id]: newValues
    });
  };

  // Convert active custom values to ScriptConfig compatible object for the legacy simulator component
  const legacyConfigEquivalent: ScriptConfig = {
    walkSpeed: activeCustomState.walkSpeed,
    flySpeed: activeCustomState.extraSliders.flySpeed ?? 45,
    jumpPower: activeCustomState.jumpPower,
    espColor: '#06b6d4',
    espChests: activeCustomState.extraToggles.espChests ?? false,
    espSupplies: activeCustomState.extraToggles.espSupplies ?? false,
    espRuins: false,
    flyEnabled: false,
    noclipEnabled: false,
    autoCollectTreasure: activeCustomState.extraToggles.autoCollectTreasure ?? false,
    killAura: activeCustomState.extraToggles.killAura ?? false,
    chopAllTrees: activeCustomState.extraToggles.chopAllTrees ?? false,
    autoSaplings: false,
    bringItems: false,
    teleportLostChildren: activeCustomState.extraToggles.teleportLostChildren ?? false,
    executor: 'delta',
    scriptTheme: 'cyber',
    fullyUndetectable: true,
    keylessMode: true
  };

  const setLegacyConfigEquivalent = (updated: ScriptConfig) => {
    // Allows physical movements/toggles inside ForestSimulator to stream back into active custom state
    setGameCustomStates({
      ...gameCustomStates,
      nights_forest: {
        walkSpeed: updated.walkSpeed,
        jumpPower: updated.jumpPower,
        extraToggles: {
          ...activeCustomState.extraToggles,
          espChests: updated.espChests,
          autoCollectTreasure: updated.autoCollectTreasure,
          chopAllTrees: updated.chopAllTrees,
          teleportLostChildren: updated.teleportLostChildren
        },
        extraSliders: {
          ...activeCustomState.extraSliders,
          flySpeed: updated.flySpeed
        }
      }
    });
  };

  // Authentication state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Sync custom scripts from database or sandbox storage
  useEffect(() => {
    if (!sessionUser) {
      setGames(INITIAL_GAMES);
      return;
    }

    if (sessionUser.uid === 'sandbox_user_1337') {
      const saved = localStorage.getItem('voidware-saved-scripts');
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as RobloxGame[];
          const upgraded = parsed.map(game => {
            if (game.rawUrl) {
              return {
                ...game,
                rawUrl: game.rawUrl
                  .replace(/raw\.githubusercontent\.com/g, 'files.vapevoidware.xyz')
                  .replace(/rawgithubusercontent\.com/g, 'files.vapevoidware.xyz')
              };
            }
            return game;
          });
          setGames([...INITIAL_GAMES, ...upgraded]);
        } catch (e) {
          console.error(e);
        }
      }
      return;
    }

    const q = query(
      collection(db, 'custom_scripts'),
      where('userId', '==', sessionUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cloudScripts: RobloxGame[] = [];
      snapshot.forEach((docSnap) => {
        const cs = docSnap.data() as RobloxGame;
        if (cs.rawUrl) {
          cs.rawUrl = cs.rawUrl
            .replace(/raw\.githubusercontent\.com/g, 'files.vapevoidware.xyz')
            .replace(/rawgithubusercontent\.com/g, 'files.vapevoidware.xyz');
        }
        cloudScripts.push(cs);
      });

      const merged = [...INITIAL_GAMES];
      cloudScripts.forEach((cs) => {
        if (!merged.some(g => g.id === cs.id)) {
          merged.push(cs);
        }
      });
      setGames(merged);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'custom_scripts');
    });

    return () => unsubscribe();
  }, [sessionUser]);

  // Load configured cheating values from database on game selection
  useEffect(() => {
    if (!sessionUser) return;

    if (sessionUser.uid === 'sandbox_user_1337') {
      const saved = localStorage.getItem(`voidware-config-${activeGame.id}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setGameCustomStates(prev => ({
            ...prev,
            [activeGame.id]: parsed
          }));
        } catch (e) {
          console.error(e);
        }
      }
      return;
    }

    const configId = `${sessionUser.uid}_${activeGame.id}`;
    const configRef = doc(db, 'user_configs', configId);

    const fetchConfig = async () => {
      try {
        const docSnap = await getDoc(configRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setGameCustomStates(prev => ({
            ...prev,
            [activeGame.id]: {
              walkSpeed: data.walkSpeed,
              jumpPower: data.jumpPower,
              extraToggles: data.extraToggles || {},
              extraSliders: data.extraSliders || {}
            }
          }));
          triggerToast(`Loaded saved metadata for ${activeGame.name}`);
        }
      } catch (error) {
        console.info("Config does not exist yet. Using defaults.");
      }
    };

    fetchConfig();
  }, [sessionUser, activeGame.id]);

  // Save current cheating configurations to database on change (debounced to preserve cloud writes quota)
  useEffect(() => {
    if (!sessionUser) return;

    const stateToSave = gameCustomStates[activeGame.id];
    if (!stateToSave) return;

    if (sessionUser.uid === 'sandbox_user_1337') {
      localStorage.setItem(`voidware-config-${activeGame.id}`, JSON.stringify(stateToSave));
      return;
    }

    const configId = `${sessionUser.uid}_${activeGame.id}`;
    const configRef = doc(db, 'user_configs', configId);

    const timer = setTimeout(async () => {
      try {
        await setDoc(configRef, {
          userId: sessionUser.uid,
          gameId: activeGame.id,
          walkSpeed: stateToSave.walkSpeed,
          jumpPower: stateToSave.jumpPower,
          extraToggles: stateToSave.extraToggles,
          extraSliders: stateToSave.extraSliders,
          updatedAt: new Date().toISOString()
        });
        triggerToast(`Cloud-saved settings for ${activeGame.name}`);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `user_configs/${configId}`);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [sessionUser, activeGame.id, JSON.stringify(gameCustomStates[activeGame.id])]);

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      triggerToast("Signed in via Cloud Google account!");
    } catch (err) {
      console.warn("Firebase Auth popup failed or unconfigured, logging into Local Sandbox Session.");
      setMockUser({
        uid: 'sandbox_user_1337',
        displayName: 'Void Explorer',
        photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face',
        email: 'mohamedayanle0@gmail.com'
      });
      triggerToast("Mock Sandbox Session online!");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    }
    setMockUser(null);
    triggerToast("Logged out successfully.");
  };

  const submitCustomScript = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formGameName.trim() || !formRawUrl.trim()) return;

    let finalRawUrl = formRawUrl.trim();
    const needsMigration = /raw\.githubusercontent\.com|rawgithubusercontent\.com/i.test(finalRawUrl);
    
    if (needsMigration) {
      finalRawUrl = finalRawUrl
        .replace(/raw\.githubusercontent\.com/gi, 'files.vapevoidware.xyz')
        .replace(/rawgithubusercontent\.com/gi, 'files.vapevoidware.xyz');
    }

    const newId = `custom_${Date.now()}`;
    const featureList = formFeatures.trim() 
      ? formFeatures.split(',').map(f => f.trim()) 
      : ['Custom Lua Thread', 'Fast Loadstring execution'];

    const newGame: RobloxGame = {
      id: newId,
      name: formGameName,
      category: formCategory,
      rawUrl: finalRawUrl,
      emojiText: formEmojiText,
      description: formDescription.trim() || 'Custom user added script executed instantly through our modular web wrapper.',
      status: formStatus,
      releaseDate: new Date().toISOString().split('T')[0],
      features: featureList,
      settings: {
        walkSpeed: 16,
        jumpPower: 50,
        extraToggles: [],
        extraSliders: []
      }
    };

    // If session user exists, sync to Firestore
    if (sessionUser) {
      if (sessionUser.uid === 'sandbox_user_1337') {
        const stored = localStorage.getItem('voidware-saved-scripts');
        const savedList = stored ? JSON.parse(stored) : [];
        savedList.push(newGame);
        localStorage.setItem('voidware-saved-scripts', JSON.stringify(savedList));
        setGames([...games, newGame]);
      } else {
        const scriptRef = doc(db, 'custom_scripts', newId);
        try {
          await setDoc(scriptRef, {
            id: newId,
            name: formGameName,
            category: formCategory,
            rawUrl: finalRawUrl,
            emojiText: formEmojiText,
            description: formDescription.trim() || 'Custom user added script executed instantly through our modular web wrapper.',
            status: formStatus,
            userId: sessionUser.uid,
            createdAt: new Date().toISOString()
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, `custom_scripts/${newId}`);
        }
      }
      triggerToast(
        needsMigration 
          ? `Auto-upgraded your source to Zero Files & Synced!` 
          : `Synced "${formGameName}" to your persistent cloud collection!`
      );
    } else {
      // Just local UI state
      setGames([...games, newGame]);
      triggerToast(
        needsMigration 
          ? `Auto-upgraded source to Zero Files & Added script!` 
          : `Added "${formGameName}" to transient list. Log in to sync to cloud!`
      );
    }

    setGameCustomStates({
      ...gameCustomStates,
      [newId]: {
        walkSpeed: 16,
        jumpPower: 50,
        extraToggles: {},
        extraSliders: {}
      }
    });

    setSelectedGameId(newId);
    setShowAddForm(false);
    
    // reset inputs
    setFormGameName('');
    setFormRawUrl('');
    setFormEmojiText('🎮');
    setFormDescription('');
    setFormFeatures('');
  };

  const filteredGames = games.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          game.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || game.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div id="zero-script-app" className={`min-h-screen font-sans selection:bg-cyan-500/20 selection:text-cyan-300 relative overflow-x-hidden transition-colors duration-300 ${
      theme === 'ultradark' ? 'theme-ultradark bg-[#000000] text-zinc-100' : 'bg-[#06060c] text-white'
    }`}>
      
      {/* Background neon elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-950/20 blur-[130px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-950/15 blur-[130px] rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6 relative z-10">
        
        {/* Navigation / Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1 px-2.5 bg-cyan-500/10 text-cyan-400 border border-cyan-400/20 rounded font-mono text-[9px] uppercase tracking-widest font-bold">
                Zero Script Vault
              </span>
              <span className="flex items-center gap-1 text-[9px] text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded font-bold font-mono">
                <Sparkles className="w-3 h-3 text-cyan-400" /> INSTANT LOADSTRINGS
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2 font-mono">
              <Zap className="w-6 h-6 text-cyan-400 fill-cyan-400/20" />
              ZERO <span className="text-cyan-400 font-normal font-sans">// Mobile Directory</span>
            </h1>
            <p className="text-xs text-white/50">
              Get modular external scripts, fine-tune physical configs, and copy high-performance executor loadstrings.
            </p>
          </div>

          {/* Tabs and Controls Station */}
          <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-4 self-stretch xl:self-center shrink-0">
            {/* Tab Selection */}
            <div className="flex flex-wrap bg-black/45 p-1 rounded-2xl border border-white/5 shrink-0">
              <button
                onClick={() => setActiveTab('directory')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'directory'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-extrabold'
                    : 'text-white/40 hover:text-white/70 border border-transparent'
                }`}
              >
                <Gamepad2 className="w-4 h-4" />
                Game Database
              </button>
              <button
                onClick={() => setActiveTab('simulator')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'simulator'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-extrabold'
                    : 'text-white/40 hover:text-white/70 border border-transparent'
                }`}
              >
                <Flame className="w-4 h-4" />
                Forest Sandbox
              </button>
              <button
                onClick={() => setActiveTab('changelog')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'changelog'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-extrabold'
                    : 'text-white/40 hover:text-white/70 border border-transparent'
                }`}
              >
                <History className="w-4 h-4" />
                Change Logs
              </button>
              <button
                onClick={() => setActiveTab('education')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'education'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-extrabold'
                    : 'text-white/40 hover:text-white/70 border border-transparent'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                How it Works
              </button>
            </div>

            {/* Quick Toolbar Station (Theme & Sync status) */}
            <div className="flex items-center gap-2 self-start xl:self-center">
              {/* Theme Selector */}
              <div className="flex bg-black/45 p-1 rounded-2xl border border-white/5 items-center">
                <button
                  type="button"
                  onClick={() => toggleTheme('neon')}
                  className={`p-1.5 px-3 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    theme === 'neon'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-extrabold shadow-[0_0_8px_rgba(6,182,212,0.15)]'
                      : 'text-white/40 hover:text-white/70 border border-transparent'
                  }`}
                  title="Neon Cyan Theme"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline font-mono">Neon</span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleTheme('ultradark')}
                  className={`p-1.5 px-3 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    theme === 'ultradark'
                      ? 'bg-white text-black border border-white font-black'
                      : 'text-white/40 hover:text-white/70 border border-transparent'
                  }`}
                  title="High-Contrast Ultra-Dark Theme"
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline font-mono">Ultra-Dark</span>
                </button>
              </div>

              {/* Login Button / Avatar */}
              {sessionUser ? (
                <div className="flex items-center gap-2 bg-black/45 p-1 pr-2.5 rounded-2xl border border-white/5">
                  <img
                    src={sessionUser.photoURL}
                    referrerPolicy="no-referrer"
                    alt={sessionUser.displayName}
                    className="w-7 h-7 rounded-lg border border-white/10"
                    title={sessionUser.email}
                  />
                  <div className="hidden md:flex flex-col text-left">
                    <span className="text-[10px] font-bold text-white max-w-[80px] truncate">{sessionUser.displayName}</span>
                    <span className="text-[8px] font-mono text-cyan-400 tracking-tight font-extrabold uppercase">Cloud Sync</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="text-[9px] text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 p-1 rounded border border-rose-500/20 cursor-pointer font-bold font-mono"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/25 p-2 px-3.5 text-cyan-300 font-bold rounded-2xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_2px_8px_rgba(6,182,212,0.1)] hover:shadow-[0_4px_12px_rgba(6,182,212,0.2)] font-mono active:scale-95"
                  title="Sign in or register to enable Firestore sync"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Cloud Login</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Inner Tab Content */}
        {activeTab === 'directory' && (
          <div className="space-y-6">
            
            {/* Database Search & Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-zinc-950/30 p-4 rounded-3xl border border-white/5 backdrop-blur-md">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                {/* Search field */}
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="text"
                    placeholder="Search Roblox game scripts... (e.g. Blox Fruits)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/30 font-sans"
                  />
                </div>
                
                {/* Category filter */}
                <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5 font-mono text-[10px] uppercase font-bold text-center">
                  {['all', 'popular', 'combat', 'farming', 'survival', 'custom'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all ${
                        categoryFilter === cat 
                          ? 'bg-zinc-800 text-cyan-300 font-bold border border-white/5' 
                          : 'text-white/45 hover:text-white/70'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add Custom script button */}
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-cyan-500 hover:bg-cyan-400 font-bold text-white px-4 py-2.5 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_4px_12px_rgba(6,182,212,0.25)] hover:shadow-[0_4px_22px_rgba(6,182,212,0.4)] shrink-0 font-sans"
              >
                <Plus className="w-4 h-4" />
                Add Game Script
              </button>
            </div>

            {/* Expandable Add Script Form Content */}
            {showAddForm && (
              <div className="glass-morphism rounded-3xl p-6 border-2 border-dashed border-cyan-500/20 bg-cyan-950/5 space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-1.5 font-mono">
                    <Plus className="w-4 h-4 text-cyan-400" /> ADD NEW ROBLOX GAME LOADER
                  </h3>
                  <button 
                    onClick={() => setShowAddForm(false)}
                    className="text-xs text-white/40 hover:text-white/75 bg-white/5 px-2.5 py-1 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                <form onSubmit={submitCustomScript} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] text-white/50 uppercase tracking-widest font-mono font-bold pb-1">Game Title *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Adopt Me" 
                        value={formGameName}
                        onChange={(e) => setFormGameName(e.target.value)}
                        className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-white placeholder-white/20 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-zinc-400 uppercase tracking-widest font-mono font-bold pb-1">
                        Zero Source URL (files.vapevoidware.xyz or Raw GitHub) *
                      </label>
                      <input 
                        type="url" 
                        required
                        placeholder="e.g. https://files.vapevoidware.xyz/Zero/main/main.lua" 
                        value={formRawUrl}
                        onChange={(e) => setFormRawUrl(e.target.value)}
                        className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-white placeholder-white/20 focus:outline-none font-mono text-[11px]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-white/50 uppercase tracking-widest font-mono font-bold pb-1">Category & Genre</label>
                        <select 
                          value={formCategory}
                          onChange={(e) => setFormCategory(e.target.value as any)}
                          className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-white focus:outline-none"
                        >
                          <option value="popular">Popular</option>
                          <option value="combat">Combat</option>
                          <option value="farming">Farming</option>
                          <option value="survival">Survival</option>
                          <option value="custom">Custom</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-white/50 uppercase tracking-widest font-mono font-bold pb-1">Emoji Icon</label>
                        <input 
                          type="text" 
                          placeholder="e.g. 🐶" 
                          value={formEmojiText}
                          onChange={(e) => setFormEmojiText(e.target.value)}
                          className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-white placeholder-white/20 text-center text-sm focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] text-white/50 uppercase tracking-widest font-mono font-bold pb-1">Description</label>
                      <textarea 
                        rows={2}
                        placeholder="Provide summary describing what features are wrapped..." 
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-white placeholder-white/20 focus:outline-none font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-white/50 uppercase tracking-widest font-mono font-bold pb-1">List of Features (comma-separated)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Teleport Auto, Instant Coin Grab, Infinite Jump" 
                        value={formFeatures}
                        onChange={(e) => setFormFeatures(e.target.value)}
                        className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-white placeholder-white/20 focus:outline-none"
                      />
                    </div>

                    <div className="flex justify-end pt-3">
                      <button 
                        type="submit" 
                        className="bg-emerald-500 hover:bg-emerald-400 font-bold text-white px-5 py-2.5 rounded-xl text-xs transition-all cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                      >
                        ✔ Add Script to Database
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* Main Interactive Website Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Catalog (4 Cois): Cards of Games */}
              <div className="lg:col-span-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-white/40 pb-1">
                  <span>GAME COLLECTION ({filteredGames.length})</span>
                  <span>CLICK TO LOAD CONFIG</span>
                </div>
                
                <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/5">
                  {filteredGames.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 bg-zinc-950/20 border border-white/5 rounded-3xl text-center">
                      <Gamepad2 className="w-8 h-8 text-white/20 mb-2 animate-pulse" />
                      <div className="text-xs text-white/40">No matching game scripts found. Try adding yours using the button above!</div>
                    </div>
                  ) : (
                    filteredGames.map((game) => {
                      const isSelected = game.id === selectedGameId;
                      
                      // Status color
                      const statusColor = {
                        Undetected: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/20',
                        Updated: 'bg-cyan-400/15 text-cyan-300 border-cyan-400/20',
                        Testing: 'bg-amber-400/15 text-amber-300 border-amber-400/20',
                        Patching: 'bg-rose-400/15 text-rose-300 border-rose-400/20',
                      }[game.status] || 'bg-zinc-400/10 text-zinc-300 border-zinc-400/10';

                      return (
                        <button
                          key={game.id}
                          onClick={() => setSelectedGameId(game.id)}
                          className={`w-full p-4 rounded-3xl border text-left transition-all relative cursor-pointer overflow-hidden flex flex-col gap-2 ${
                            isSelected
                              ? 'bg-cyan-500/10 border-cyan-400 text-cyan-50 font-semibold shadow-[0_0_20px_rgba(6,182,212,0.15)] bg-zinc-900/60'
                              : 'bg-zinc-950/40 border-white/5 text-white/70 hover:bg-zinc-900/40 hover:border-white/10'
                          }`}
                        >
                          {/* Inner glowing tag */}
                          {isSelected && (
                            <div className="absolute right-0 top-0 bottom-0 w-[4px] bg-cyan-400" />
                          )}

                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <span className="text-xl bg-black/40 w-8 h-8 rounded-xl flex items-center justify-center border border-white/5">
                                {game.emojiText}
                              </span>
                              <div>
                                <h3 className="text-xs font-bold text-white tracking-wide">{game.name}</h3>
                                <span className="text-[9px] text-white/35 font-mono uppercase font-semibold">{game.category} game</span>
                              </div>
                            </span>
                            <span className={`text-[8px] border px-2 py-0.5 rounded-md font-mono font-bold ${statusColor}`}>
                              {game.status.toUpperCase()}
                            </span>
                          </div>

                          <p className="text-[10px] text-white/40 leading-relaxed font-sans line-clamp-2">
                            {game.description}
                          </p>

                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {game.features.slice(0, 2).map((feat, idx) => (
                              <span key={idx} className="text-[9px] bg-black/30 border border-white/5 px-2 py-0.5 rounded-lg text-white/50">
                                ✔ {feat}
                              </span>
                            ))}
                            {game.features.length > 2 && (
                              <span className="text-[8px] text-white/30 self-center">
                                +{game.features.length - 2} more
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Left quick guides promo */}
                <div className="p-4 bg-zinc-950/40 rounded-3xl border border-white/5 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-mono font-bold uppercase tracking-wider">
                    <Info className="w-3.5 h-3.5" /> Auto Updates
                  </div>
                  <p className="text-[10px] text-white/40 leading-relaxed font-sans">
                    All Zero loaders reference a cloud script. If games update, our backend triggers the cloud patch automatically. Your copied loadstring loader command never changes!
                  </p>
                </div>
              </div>

              {/* Right Settings and Copy Area (8 Cols) */}
              <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
                
                {/* 1. Config Selector (6 Cols) */}
                <div className="md:col-span-6">
                  <ScriptConfigurator 
                    game={activeGame} 
                    customValues={activeCustomState} 
                    onChange={handleCustomStateChange} 
                  />
                </div>

                {/* 2. Loader Snippet (6 Cols) */}
                <div className="md:col-span-6 flex flex-col h-full font-mono">
                  <LuaScriptView 
                    game={activeGame} 
                    customValues={activeCustomState} 
                  />

                  {/* Guide below code container */}
                  <div className="mt-4">
                    <InstructionSheet game={activeGame} />
                  </div>
                </div>

              </div>

            </div>

            {/* Quick Promo Carousel cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/5 pt-6 text-xs text-white/50">
              <div className="p-4 bg-zinc-950/40 border border-white/5 rounded-3xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-bold text-white tracking-wide">100% Mobile Safe</h4>
                  <p className="text-[10px] leading-relaxed text-white/40">Tested client-side on Android & iOS wrappers. Keeps your account secure.</p>
                </div>
              </div>
              <div className="p-4 bg-zinc-950/40 border border-white/5 rounded-3xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-bold text-white tracking-wide">Zero Keys Verification</h4>
                  <p className="text-[10px] leading-relaxed text-white/40">Instantly execute scripts. Bypass the obnoxious redirect link servers completely.</p>
                </div>
              </div>
              <div className="p-4 bg-zinc-950/40 border border-white/5 rounded-3xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-bold text-white tracking-wide">Automatic Cloud Updates</h4>
                  <p className="text-[10px] leading-relaxed text-white/40">When Roblox issues updates, we update remote files securely on the fly.</p>
                </div>
              </div>
            </div>

            {/* Bottom Section: Active Forest Simulator Playground (Let users test 99 Nights) */}
            <div className="border-t border-white/5 pt-6 space-y-4">
              <div className="flex items-center gap-2">
                <Trees className="w-5 h-5 text-cyan-400" />
                <div>
                  <h2 className="text-sm font-bold text-zinc-150 uppercase tracking-wide">Active Forest Simulator Playground</h2>
                  <p className="text-[11px] text-white/40 leading-relaxed font-sans">
                    An interactive map simulator calibrated to <strong className="text-cyan-300">99 Nights in the forest</strong>. Toggle the ESPs, test auto collection path sequences, warp coordinates by typing saying coords, and inspect logs.
                  </p>
                </div>
              </div>
              
              <ForestSimulator config={legacyConfigEquivalent} onConfigChange={setLegacyConfigEquivalent} />
            </div>

          </div>
        )}

        {/* Tab 2: Forest Simulator Only (Isolated preview screen) */}
        {activeTab === 'simulator' && (
          <div className="space-y-4">
            <div className="bg-zinc-950/40 p-5 rounded-3xl border border-white/5 space-y-1.5">
              <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                <Flame className="w-5 h-5 text-cyan-400 fill-cyan-400/20" /> Active 99 Nights Forest Playground
              </h2>
              <p className="text-xs text-white/40 font-medium">
                Verify speed scales, flight controls, say teleports and automatic map chest sweepers interactively.
              </p>
            </div>
            
            <ForestSimulator config={legacyConfigEquivalent} onConfigChange={setLegacyConfigEquivalent} />
          </div>
        )}

        {/* Tab 3: Sleek Change Log timeline */}
        {activeTab === 'changelog' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-zinc-950/40 p-5 rounded-3xl border border-white/5 space-y-2">
              <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                <History className="w-5 h-5 text-cyan-400" /> Zero Repository Change logs
              </h2>
              <p className="text-xs text-white/40">
                Track previous updates, anti-detection changes, and gameplay improvements deployed live.
              </p>
            </div>

            <div className="space-y-4">
              {INITIAL_CHANGELOGS.map((log) => {
                const badgeStyle = {
                  added: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20',
                  fixed: 'bg-cyan-400/10 text-cyan-300 border-cyan-400/20',
                  security: 'bg-purple-400/10 text-purple-300 border-purple-400/20',
                  database: 'bg-indigo-400/10 text-indigo-300 border-indigo-400/20',
                }[log.type] || 'bg-zinc-400/10 text-zinc-300 border-zinc-400/10';

                return (
                  <div key={log.id} className="glass-morphism rounded-3xl p-5 border border-white/5 space-y-3 bg-zinc-950/20 flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="sm:w-36 shrink-0 flex flex-col">
                      <span className="text-[10px] text-white/30 font-mono font-semibold">{log.date}</span>
                      <span className="text-[12px] font-bold text-white/80">{log.version}</span>
                      <span className="text-[10px] text-cyan-400 font-mono mt-1 font-bold">{log.gameName}</span>
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-[8px] font-mono border font-bold uppercase rounded px-1.5 py-0.5 ${badgeStyle}`}>
                          {log.type}
                        </span>
                        <h4 className="text-xs font-bold text-white">{log.title}</h4>
                      </div>
                      <p className="text-[11px] text-white/50 leading-relaxed font-sans">
                        {log.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: How It Works & Roblox Lua Compilers */}
        {activeTab === 'education' && (
          <div className="max-w-4xl mx-auto space-y-6 font-sans">
            <div className="bg-zinc-950/40 p-5 rounded-3xl border border-white/5 space-y-1.5">
              <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-cyan-400" /> Roblox Luau Loadstring Guide
              </h2>
              <p className="text-xs text-white/40">
                Learn the mechanisms that allow mobile game executors to dynamically compile scripts live from web sources.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="glass-morphism rounded-3xl p-6 border border-white/5 bg-zinc-950/10 space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono text-cyan-400">1. Anatomy of loadstring()</h3>
                <p className="text-xs text-white/50 leading-relaxed">
                  In normal Roblox scripting, all local scripts must be packaged into the game file when the server mounts. However, exploit developers take benefit of a Roblox command: <code className="text-amber-400 bg-black/40 px-1 py-0.5 rounded font-mono font-bold text-[10px]">loadstring(luaCodeString)()</code>.
                </p>
                <div className="p-3.5 bg-black/50 rounded-2xl border border-white/5 font-mono text-[10px] space-y-2 text-zinc-300">
                  <div className="text-cyan-400">-- Step 1: Query the web via premium API</div>
                  <div>local rawCode = <span className="text-amber-300">game:HttpGet("https://files.vapevoidware.xyz...", true)</span></div>
                  <div className="text-cyan-400">-- Step 2: Compile & Execute code string</div>
                  <div>local executableFunction = <span className="text-amber-300">loadstring(rawCode)</span></div>
                  <div>executableFunction() <span className="text-zinc-500">-- launches the GUI!</span></div>
                </div>
                <p className="text-xs text-white/40 leading-relaxed">
                  Executing via HTTP GET guarantees players always run the absolute latest release of Zero without copy-pasting bloated files whenever the game changes security hashes.
                </p>
              </div>

              <div className="glass-morphism rounded-3xl p-6 border border-white/5 bg-zinc-950/10 space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono text-emerald-400 font-sans">2. Auto-Updates & Cloud Synced Core</h3>
                <p className="text-xs text-white/50 leading-relaxed">
                  Roblox frequently pushes weekly game patches. If a game changes its character movement values or security detectors, old local text files instantly crash.
                </p>
                <div className="space-y-3 font-sans">
                  <div className="flex gap-3">
                    <span className="w-5 h-5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">✔</span>
                    <p className="text-xs text-white/50"><strong>Cloud Syncing</strong>: Our developer push goes live instantly onto our premium files hosting cluster.</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-5 h-5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">✔</span>
                    <p className="text-xs text-white/50"><strong>Zero Input Overhead</strong>: Since your in-game loader retrieves the file dynamically, you never need to copy-paste new code.</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-5 h-5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">✔</span>
                    <p className="text-xs text-white/50"><strong>Configuration Spoofer</strong>: Setting <code className="text-indigo-400 font-mono">_G.ZeroConfig</code> pre-conditions the local environments so walkspeed speeds and ESP boxes draw immediately upon load thread mount.</p>
                  </div>
                </div>
              </div>

            </div>

            {/* General FAQs */}
            <div className="glass-morphism rounded-3xl p-6 border border-white/5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-cyan-400">Common Security FAQ</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <h4 className="font-bold text-white font-sans">Q: Is game:HttpGet secure and safe?</h4>
                  <p className="text-white/45 leading-relaxed font-sans">
                    Yes. All loader requests in Zero redirect to trusted secure repositories. Because exploit scripts execute entirely inside your local Roblox memory space on your phone, your credentials remain private and unexposed.
                  </p>
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-white font-sans">Q: Does this bypass Easy Anti-Cheat?</h4>
                  <p className="text-white/45 leading-relaxed font-sans">
                    Our scripts alter character coordinates and physical velocity inputs by spoofing replication lags. The system simulates mobile network jitter, making memory modifications indistinguishable from generic cellular lags.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Dynamic footer */}
        <footer className="text-center text-[10px] text-white/30 pt-6 border-t border-white/5 flex justify-between items-center font-mono">
          <span>Zero Database Hub — Auto-Patched Cloud Syncing</span>
          <span>Designed with absolute performance & safety for mobile devices.</span>
        </footer>

      </div>

      {/* Dynamic Authorization Modal */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <AuthModal 
            onClose={() => setIsAuthModalOpen(false)}
            onSandboxLogin={handleSandboxSignIn}
            triggerToast={triggerToast}
            theme={theme}
          />
        )}
      </AnimatePresence>

      {/* Interactive Toast Messaging Overlay */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-950 border-2 border-white/20 p-3.5 px-5 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] flex items-center gap-2.5 font-mono text-[11px] text-white animate-bounce">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 animate-spin" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
