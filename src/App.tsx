import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Info, Flame, Trees, Sparkles, Plus, Search, 
  Terminal, History, HelpCircle, Gamepad2, Settings as SettingsIcon,
  ChevronRight, ChevronDown, ExternalLink, Zap, Check, Gift, Layers, CheckCircle, Share2,
  LogIn, LogOut, Sun, Moon, Database, Menu, X, Clock, Shield, Cpu, Globe, Archive, Trash2, Bot,
  ShieldAlert, Activity, Bug, Mail, Star, Code, ArrowUpDown, Copy, Flag, RotateCcw, Edit2
} from 'lucide-react';
import { ScriptConfig } from './types';
import { ScriptConfigurator } from './components/ScriptConfigurator';
import { LuaScriptView } from './components/LuaScriptView';
import { InstructionSheet } from './components/InstructionSheet';
import { INITIAL_GAMES, INITIAL_CHANGELOGS, RobloxGame, ChangeLogEntry } from './gamesData';
import { AuthModal } from './components/AuthModal';
import { SuggestionChannel } from './components/SuggestionChannel';
import { AiCompilerAgents } from './components/AiCompilerAgents';
import { SupportHub } from './components/SupportHub';
import { ScriptSandbox } from './components/ScriptSandbox';
import { InGamePreview } from './components/InGamePreview';
import { motion, AnimatePresence } from 'motion/react';

// Firebase imports
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, setDoc, getDoc, query, where, onSnapshot, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from './firebase';

// Helper to calculate deterministic performance rating based on script properties
const getPerformanceRating = (game: RobloxGame) => {
  const charSum = game.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const loadTime = (charSum % 110) + 60; // 60ms to 170ms
  
  // Base stability out of 100
  let stability = 94;
  if (game.status === 'Undetected') stability += 4;
  if (game.status === 'Updated') stability += 5;
  if (game.status === 'Testing') stability -= 15;
  if (game.status === 'Patching') stability -= 40;
  
  // Factor in features count
  const featureCount = game.features?.length || 0;
  stability += Math.min(featureCount, 4);
  
  // Custom script stability modifiers
  if (game.id.startsWith('custom_')) {
    stability += 2;
  }
  
  const score = Math.max(35, Math.min(100, stability));
  
  let stabilityText = 'High Stability';
  if (score < 75) stabilityText = 'Unstable';
  else if (score < 90) stabilityText = 'Stable';
  
  return {
    score,
    loadTime,
    stabilityText
  };
};

// Helper to determine colorful tag styles based on feature name category
const getFeatureBadgeStyle = (feat: string) => {
  const f = feat.toLowerCase();
  
  // Auto-Farm / Grind / Stats
  if (f.includes('farm') || f.includes('auto') || f.includes('grind') || f.includes('mine') || f.includes('collect') || f.includes('level') || f.includes('stat') || f.includes('quest')) {
    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.05)]';
  }
  // Combat / Aim / Weapons
  if (f.includes('kill') || f.includes('aura') || f.includes('hitbox') || f.includes('aim') || f.includes('combat') || f.includes('pvp') || f.includes('weapon') || f.includes('gun') || f.includes('sword') || f.includes('damage')) {
    return 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_8px_rgba(244,63,94,0.05)]';
  }
  // ESP / Visuals / Wallhacks
  if (f.includes('esp') || f.includes('chams') || f.includes('vision') || f.includes('radar') || f.includes('wallhack') || f.includes('visual') || f.includes('xray') || f.includes('tracker')) {
    return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_8px_rgba(6,182,212,0.05)]';
  }
  // Movement / Speed / Jumps
  if (f.includes('speed') || f.includes('fly') || f.includes('jump') || f.includes('clip') || f.includes('gravity') || f.includes('teleport') || f.includes('tp') || f.includes('sprint') || f.includes('dash') || f.includes('noclip') || f.includes('float')) {
    return 'bg-violet-500/10 text-violet-400 border-violet-500/20 shadow-[0_0_8px_rgba(139,92,246,0.05)]';
  }
  // Safeguards / UI / Configs
  if (f.includes('ui') || f.includes('menu') || f.includes('config') || f.includes('bypass') || f.includes('anti-cheat') || f.includes('anticheat') || f.includes('safe') || f.includes('stealth') || f.includes('key')) {
    return 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.05)]';
  }
  
  // Fallback
  return 'bg-zinc-500/10 text-zinc-300 border-zinc-500/20 shadow-[0_0_8px_rgba(148,163,184,0.05)]';
};

export default function App() {
  // Website Views: 'directory' | 'sandbox' | 'changelog' | 'education' | 'suggestions' | 'ai-compiler' | 'support'
  const [activeTab, setActiveTab] = useState<'directory' | 'sandbox' | 'changelog' | 'education' | 'suggestions' | 'ai-compiler' | 'support'>('directory');
  const [activeSubTab, setActiveSubTab] = useState<'reporter' | 'faq' | 'network' | 'creator-inbox'>('reporter');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [showCustomizer, setShowCustomizer] = useState<boolean>(false);
  const [preloadedSandboxCode, setPreloadedSandboxCode] = useState<string>('');
  const [previewGame, setPreviewGame] = useState<RobloxGame | null>(null);
  
  // Theme State
  const [theme, setTheme] = useState<'neon' | 'ultradark'>(() => {
    return (localStorage.getItem('voidware-theme') as 'neon' | 'ultradark') || 'neon';
  });

  const toggleTheme = (newTheme: 'neon' | 'ultradark') => {
    setTheme(newTheme);
    localStorage.setItem('voidware-theme', newTheme);
  };

  // Accent Color State
  const [accentColor, setAccentColor] = useState<'cyan' | 'emerald' | 'purple' | 'ruby' | 'blue' | 'amber' | 'indigo'>(() => {
    return (localStorage.getItem('zerohub-accent') as any) || 'indigo';
  });

  const accentThemes = {
    cyan: { primary: '#06b6d4', hover: '#0891b2', glow: 'rgba(6,182,212,0.4)', glowLight: 'rgba(6,182,212,0.15)' },
    emerald: { primary: '#10b981', hover: '#059669', glow: 'rgba(16,185,129,0.4)', glowLight: 'rgba(16,185,129,0.15)' },
    purple: { primary: '#a855f7', hover: '#9333ea', glow: 'rgba(168, 85, 247, 0.4)', glowLight: 'rgba(168, 85, 247, 0.15)' },
    ruby: { primary: '#f43f5e', hover: '#e11d48', glow: 'rgba(244, 63, 94, 0.4)', glowLight: 'rgba(244, 63, 94, 0.15)' },
    blue: { primary: '#3b82f6', hover: '#2563eb', glow: 'rgba(59, 130, 246, 0.4)', glowLight: 'rgba(59, 130, 246, 0.15)' },
    amber: { primary: '#f59e0b', hover: '#d97706', glow: 'rgba(245, 158, 11, 0.4)', glowLight: 'rgba(245, 158, 11, 0.15)' },
    indigo: { primary: '#6366f1', hover: '#4f46e5', glow: 'rgba(99, 102, 241, 0.4)', glowLight: 'rgba(99, 102, 241, 0.15)' }
  };
  const activeAccent = accentThemes[accentColor];

  // Auth States
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [mockUser, setMockUser] = useState<{ uid: string; displayName: string; photoURL: string; email: string } | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const sessionUser = currentUser || mockUser;

  const isDevOrOwner = 
    !!(sessionUser?.email && ['mohamedayanle0@gmail.com', 'owner@zerohub.net'].includes(sessionUser.email.toLowerCase()));

  // Device Platform Detection
  const [devicePlatform, setDevicePlatform] = useState<'PC' | 'Mobile'>('PC');
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua) || (window.innerWidth < 1024);
    setDevicePlatform(isMobileDevice ? 'Mobile' : 'PC');
  }, []);

  // Redirect out of AI Compiler Hub if not owner or developer
  useEffect(() => {
    if (!isDevOrOwner && activeTab === 'ai-compiler') {
      setActiveTab('directory');
    }
  }, [isDevOrOwner, activeTab]);

  // Updates Countdown State
  const [countdownStr, setCountdownStr] = useState<string>('00h : 00m : 00s');
  const [saturdayCountdown, setSaturdayCountdown] = useState<string>('0d : 00h : 00m : 00s');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      // Calculate remaining time in the current 4-hour slot (14400 seconds)
      const secondsSinceMidnight = 
        now.getUTCHours() * 3600 + 
        now.getUTCMinutes() * 60 + 
        now.getUTCSeconds();
      const interval = 4 * 3600; // 4 hours cycle
      const remainingSeconds = interval - (secondsSinceMidnight % interval);
      
      const hours = Math.floor(remainingSeconds / 3600);
      const minutes = Math.floor((remainingSeconds % 3600) / 60);
      const seconds = remainingSeconds % 60;
      
      const pad = (num: number) => String(num).padStart(2, '0');
      setCountdownStr(`${pad(hours)}h : ${pad(minutes)}m : ${pad(seconds)}s`);

      // Calculate next Saturday 12:00:00 UTC countdown
      const currentDay = now.getUTCDay();
      let daysUntilSaturday = 6 - currentDay;
      const targetTimeToday = Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        12, 0, 0
      );
      if (daysUntilSaturday === 0 && now.getTime() > targetTimeToday) {
        daysUntilSaturday = 7;
      }
      const targetDate = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + daysUntilSaturday,
        12, 0, 0
      ));
      const diffMs = targetDate.getTime() - now.getTime();
      const totalSecs = Math.max(0, Math.floor(diffMs / 1000));
      const d = Math.floor(totalSecs / (3600 * 24));
      const h = Math.floor((totalSecs % (3600 * 24)) / 3600);
      const m = Math.floor((totalSecs % 3600) / 60);
      const s = totalSecs % 60;
      setSaturdayCountdown(`${d}d : ${pad(h)}h : ${pad(m)}m : ${pad(s)}s`);
    };

    updateCountdown();
    const intervalId = setInterval(updateCountdown, 1000);
    return () => clearInterval(intervalId);
  }, []);
  const handleSandboxSignIn = (customEmail?: string, customName?: string) => {
    const userEmail = customEmail || 'guest@zerohub.net';
    const name = customName || 'Void Explorer';
    setMockUser({
      uid: 'sandbox_user_1337',
      displayName: name,
      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face',
      email: userEmail
    });
    triggerToast(`Session activated as ${userEmail}!`);
  };

  // Script Directory State
  const [games, setGames] = useState<RobloxGame[]>(INITIAL_GAMES);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<string>('nights_forest');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('voidware_recent_searches') || '[]');
    } catch {
      return [];
    }
  });
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'updated' | 'alphabetical' | 'rating'>('newest');

  const [changelogs, setChangelogs] = useState<ChangeLogEntry[]>(() => {
    try {
      const local = localStorage.getItem('voidware-saved-changelogs');
      const parsedLocal = local ? JSON.parse(local) : [];
      const merged = [...parsedLocal];
      INITIAL_CHANGELOGS.forEach((initLog) => {
        if (!merged.some(l => l.id === initLog.id)) {
          merged.push(initLog);
        }
      });
      return merged.sort((a, b) => b.date.localeCompare(a.date));
    } catch {
      return INITIAL_CHANGELOGS;
    }
  });

  const commitSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((q) => q.toLowerCase() !== trimmed.toLowerCase());
      const next = [trimmed, ...filtered].slice(0, 5);
      localStorage.setItem('voidware_recent_searches', JSON.stringify(next));
      return next;
    });
  };

  // Script Report Modal state
  const [reportingGame, setReportingGame] = useState<RobloxGame | null>(null);
  const [reportCategory, setReportCategory] = useState<string>('Script Detected / Broken');
  const [reportDescription, setReportDescription] = useState<string>('');
  const [reportEmail, setReportEmail] = useState<string>('');
  const [isSubmittingReport, setIsSubmittingReport] = useState<boolean>(false);

  // "Add Custom Script" form toggler and state
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [formGameName, setFormGameName] = useState<string>('');
  const [formRawUrl, setFormRawUrl] = useState<string>('');
  const [formEmojiText, setFormEmojiText] = useState<string>('🎮');
  const [formCategory, setFormCategory] = useState<RobloxGame['category']>('custom');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formFeatures, setFormFeatures] = useState<string>('');
  const [formStatus, setFormStatus] = useState<RobloxGame['status']>('Undetected');
  const [formPublished, setFormPublished] = useState<boolean>(false);
  const [editingGameId, setEditingGameId] = useState<string | null>(null);

  // Custom Changelog options inside the form
  const [formCreateChangelog, setFormCreateChangelog] = useState<boolean>(false);
  const [formChangelogTitle, setFormChangelogTitle] = useState<string>('');
  const [formChangelogDesc, setFormChangelogDesc] = useState<string>('');
  const [formChangelogType, setFormChangelogType] = useState<ChangeLogEntry['type']>('added');

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

  const handleResetCustomState = (game: RobloxGame) => {
    const defaults = {
      walkSpeed: game.settings.walkSpeed,
      jumpPower: game.settings.jumpPower,
      extraToggles: game.settings.extraToggles.reduce((acc, t) => ({ ...acc, [t.key]: t.val }), {} as Record<string, boolean>),
      extraSliders: game.settings.extraSliders.reduce((acc, s) => ({ ...acc, [s.key]: s.val }), {} as Record<string, number>)
    };
    setGameCustomStates({
      ...gameCustomStates,
      [game.id]: defaults
    });
    triggerToast(`🔄 Reset custom settings for ${game.name} to default!`);
  };

  // Authentication state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Listen to Firestore changelogs
  useEffect(() => {
    const q = query(collection(db, 'changelogs'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: ChangeLogEntry[] = [];
      snapshot.forEach((doc) => {
        fetched.push(doc.data() as ChangeLogEntry);
      });
      
      setChangelogs((prev) => {
        let localLogs: ChangeLogEntry[] = [];
        try {
          const stored = localStorage.getItem('voidware-saved-changelogs');
          if (stored) localLogs = JSON.parse(stored);
        } catch {}

        const merged = [...fetched, ...localLogs];
        INITIAL_CHANGELOGS.forEach((initLog) => {
          if (!merged.some(l => l.id === initLog.id)) {
            merged.push(initLog);
          }
        });
        
        const uniqueMap = new Map<string, ChangeLogEntry>();
        merged.forEach(log => {
          uniqueMap.set(log.id, log);
        });
        
        return Array.from(uniqueMap.values()).sort((a, b) => b.date.localeCompare(a.date));
      });
    }, (error) => {
      console.warn("Changelogs dynamic Firestore listener failed, using local list.", error);
    });
    return () => unsubscribe();
  }, []);

  // Load and sync favorites from Firestore or localStorage
  useEffect(() => {
    if (!sessionUser) {
      setFavorites([]);
      return;
    }

    if (sessionUser.uid === 'sandbox_user_1337') {
      const saved = localStorage.getItem('voidware-favorites');
      if (saved) {
        try {
          setFavorites(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse local favorites:", e);
        }
      } else {
        setFavorites([]);
      }
      return;
    }

    const favRef = doc(db, 'user_favorites', sessionUser.uid);
    const unsubscribe = onSnapshot(favRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFavorites(data.favorites || []);
      } else {
        setFavorites([]);
      }
    }, (error) => {
      console.warn("Error fetching favorites:", error);
    });

    return () => unsubscribe();
  }, [sessionUser]);

  const handleToggleFavorite = async (e: React.MouseEvent, gameId: string) => {
    e.stopPropagation();
    
    let updatedFavorites: string[];
    if (favorites.includes(gameId)) {
      updatedFavorites = favorites.filter(id => id !== gameId);
      triggerToast("Removed script from favorites");
    } else {
      updatedFavorites = [...favorites, gameId];
      triggerToast("Added script to favorites!");
    }

    setFavorites(updatedFavorites);

    if (!sessionUser) {
      return;
    }

    if (sessionUser.uid === 'sandbox_user_1337') {
      localStorage.setItem('voidware-favorites', JSON.stringify(updatedFavorites));
      return;
    }

    const favRef = doc(db, 'user_favorites', sessionUser.uid);
    try {
      await setDoc(favRef, {
        favorites: updatedFavorites,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `user_favorites/${sessionUser.uid}`);
    }
  };

  // Sync custom scripts from database or sandbox storage
  useEffect(() => {
    if (sessionUser?.uid === 'sandbox_user_1337') {
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

    const isAuthedOwner = !!(sessionUser?.email && ['mohamedayanle0@gmail.com'].includes(sessionUser.email.toLowerCase()));

    let q;
    if (isAuthedOwner) {
      // Owner/Developer can see ALL custom scripts (both Published and Backup drafts)
      q = query(collection(db, 'custom_scripts'));
    } else {
      // General public and other guests only see custom scripts that are explicitly published
      q = query(
        collection(db, 'custom_scripts'),
        where('published', '==', true)
      );
    }

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
        const idx = merged.findIndex(g => g.id === cs.id);
        if (idx !== -1) {
          merged[idx] = cs;
        } else {
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
        email: 'guest@zerohub.net'
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

  // Helper to generate a tamper-proof digital signature hash for log entry verification
  const generateTamperProofHash = (gameId: string, version: string, rawUrl: string, timestamp: string) => {
    const payload = `${gameId}|${version}|${rawUrl}|${timestamp}|ZeroHubShieldKey_v5_cyber`;
    let hash = 0;
    for (let i = 0; i < payload.length; i++) {
      const char = payload.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return 'ZH_SIG_' + Math.abs(hash).toString(16).toUpperCase();
  };

  // Automatically archives update logs whenever a custom script is created or modified
  const archiveScriptUpdateLog = async (game: RobloxGame, isEditing: boolean) => {
    const logId = `cl_auto_${game.id}_${Date.now()}`;
    const timestamp = new Date().toISOString();
    const logDate = timestamp.split('T')[0];
    const logVersion = `v4.${games.length}.${Math.floor(Math.random() * 9) + 1}`;
    
    const signature = generateTamperProofHash(game.id, logVersion, game.rawUrl, timestamp);
    
    const autoChangelog: ChangeLogEntry & { [key: string]: any } = {
      id: logId,
      date: logDate,
      version: logVersion,
      gameName: game.name,
      type: isEditing ? 'fixed' : 'added',
      title: isEditing ? `Automated System Audit: "${game.name}" Updated` : `Automated System Audit: "${game.name}" Deployed`,
      description: isEditing 
        ? `Chronological Archive - The script was modified. Raw URL target: ${game.rawUrl}. Integrity signature: ${signature}.`
        : `Chronological Archive - The script was registered under category "${game.category}". Integrity signature: ${signature}.`,
      signature: signature,
      tamperProof: true,
      action: isEditing ? 'update' : 'create',
      archivedAt: timestamp,
      editorId: sessionUser?.uid || 'guest'
    };

    const saveLocally = () => {
      try {
        const storedLogs = localStorage.getItem('voidware-saved-changelogs');
        let savedLogs = storedLogs ? JSON.parse(storedLogs) : [];
        savedLogs.push(autoChangelog);
        localStorage.setItem('voidware-saved-changelogs', JSON.stringify(savedLogs));
        
        // Also save to a dedicated separate local archive storage
        const storedArchives = localStorage.getItem('voidware-tamperproof-archives');
        let savedArchives = storedArchives ? JSON.parse(storedArchives) : [];
        savedArchives.push(autoChangelog);
        localStorage.setItem('voidware-tamperproof-archives', JSON.stringify(savedArchives));

        setChangelogs(prev => {
          const merged = [autoChangelog, ...prev];
          const uniqueMap = new Map<string, ChangeLogEntry>();
          merged.forEach(log => uniqueMap.set(log.id, log));
          return Array.from(uniqueMap.values()).sort((a, b) => b.date.localeCompare(a.date));
        });
      } catch (err) {
        console.error("Local archive write failed", err);
      }
    };

    if (sessionUser && sessionUser.uid !== 'sandbox_user_1337') {
      try {
        // Save to active changelogs so it is visible in the timeline
        await setDoc(doc(db, 'changelogs', logId), autoChangelog);
        // Save to secondary read-only tamper-proof changelogs_archive collection
        await setDoc(doc(db, 'changelogs_archive', logId), autoChangelog);
        console.log(`[Archive Trigger] Successfully saved tamper-proof log to Firestore: ${logId}`);
      } catch (err) {
        console.warn("Firestore archive write failed, falling back to local archive:", err);
        saveLocally();
      }
    } else {
      saveLocally();
    }
  };

  const submitCustomScript = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formGameName.trim() || !formRawUrl.trim()) return;

    if (!isDevOrOwner && sessionUser?.uid !== 'sandbox_user_1337') {
      triggerToast("Only the owner/developer can save scripts to the cloud database.");
      return;
    }

    let finalRawUrl = formRawUrl.trim();
    const needsMigration = /raw\.githubusercontent\.com|rawgithubusercontent\.com/i.test(finalRawUrl);
    
    if (needsMigration) {
      finalRawUrl = finalRawUrl
        .replace(/raw\.githubusercontent\.com/gi, 'files.vapevoidware.xyz')
        .replace(/rawgithubusercontent\.com/gi, 'files.vapevoidware.xyz');
    }

    const targetId = editingGameId || `custom_${Date.now()}`;
    const featureList = formFeatures.trim() 
      ? formFeatures.split(',').map(f => f.trim()) 
      : ['Custom Lua Thread', 'Fast Loadstring execution'];

    const existingGame = games.find(g => g.id === targetId);

    const isEditing = !!editingGameId;
    const logId = `cl_user_${Date.now()}`;
    const logDate = new Date().toISOString().split('T')[0];
    const logVersion = `v4.${games.length}.${Math.floor(Math.random() * 9) + 1}`;

    const newChangelog: ChangeLogEntry | null = formCreateChangelog ? {
      id: logId,
      date: logDate,
      version: logVersion,
      gameName: formGameName,
      type: formChangelogType,
      title: formChangelogTitle.trim() || (isEditing ? `Script Updated: ${formGameName}` : `New Script Deployed: ${formGameName}`),
      description: formChangelogDesc.trim() || (isEditing 
        ? `Upgraded and optimized security layers. Updated features: ${featureList.slice(0, 3).join(', ')}${featureList.length > 3 ? '...' : ''}.`
        : `Compiled and registered a secure dynamic loader script. Features: ${featureList.slice(0, 3).join(', ')}${featureList.length > 3 ? '...' : ''}.`)
    } : null;

    const saveChangelogLocally = () => {
      if (!formCreateChangelog || !newChangelog) return;
      try {
        const storedLogs = localStorage.getItem('voidware-saved-changelogs');
        let savedLogs = storedLogs ? JSON.parse(storedLogs) : [];
        savedLogs.push(newChangelog);
        localStorage.setItem('voidware-saved-changelogs', JSON.stringify(savedLogs));
        setChangelogs(prev => {
          const merged = [newChangelog, ...prev];
          const uniqueMap = new Map<string, ChangeLogEntry>();
          merged.forEach(log => uniqueMap.set(log.id, log));
          return Array.from(uniqueMap.values()).sort((a, b) => b.date.localeCompare(a.date));
        });
      } catch (err) {
        console.error("Local changelog save failed", err);
      }
    };

    const newGame: RobloxGame = {
      id: targetId,
      name: formGameName,
      category: formCategory,
      rawUrl: finalRawUrl,
      emojiText: formEmojiText,
      description: formDescription.trim() || 'Custom user added script executed instantly through our modular web wrapper.',
      status: formStatus,
      releaseDate: existingGame?.releaseDate || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString(),
      features: featureList,
      settings: existingGame?.settings || {
        walkSpeed: 16,
        jumpPower: 50,
        extraToggles: [],
        extraSliders: []
      },
      published: formPublished,
      userId: existingGame?.userId || sessionUser?.uid || 'guest'
    };

    // If session user exists, sync to Firestore
    if (sessionUser) {
      if (sessionUser.uid === 'sandbox_user_1337') {
        const stored = localStorage.getItem('voidware-saved-scripts');
        let savedList = stored ? JSON.parse(stored) : [];
        if (editingGameId) {
          savedList = savedList.map((g: RobloxGame) => g.id === targetId ? newGame : g);
        } else {
          savedList.push(newGame);
        }
        localStorage.setItem('voidware-saved-scripts', JSON.stringify(savedList));
        if (editingGameId) {
          setGames(games.map(g => g.id === targetId ? newGame : g));
        } else {
          setGames([...games, newGame]);
        }
        if (formCreateChangelog) {
          saveChangelogLocally();
        }
      } else {
        const scriptRef = doc(db, 'custom_scripts', targetId);
        try {
          await setDoc(scriptRef, newGame, { merge: true });
          if (isDevOrOwner && formCreateChangelog && newChangelog) {
            try {
              await setDoc(doc(db, 'changelogs', logId), newChangelog);
            } catch (err) {
              console.warn("Firestore changelog sync failed, saving locally:", err);
              saveChangelogLocally();
            }
          } else if (formCreateChangelog) {
            saveChangelogLocally();
          }
        } catch (error) {
          handleFirestoreError(error, editingGameId ? OperationType.UPDATE : OperationType.CREATE, `custom_scripts/${targetId}`);
        }
      }
      triggerToast(
        isEditing 
          ? `Successfully saved updates to "${formGameName}"${formCreateChangelog ? ` & Published Changelog ${logVersion}` : ''}!` 
          : `Deployed "${formGameName}"${formCreateChangelog ? ` & Published Changelog ${logVersion}` : ''}!`
      );
    } else {
      // Just local UI state
      if (editingGameId) {
        setGames(games.map(g => g.id === targetId ? newGame : g));
      } else {
        setGames([...games, newGame]);
      }
      if (formCreateChangelog) {
        saveChangelogLocally();
      }
      triggerToast(
        isEditing 
          ? `Updated "${formGameName}" locally${formCreateChangelog ? ` & Published Changelog ${logVersion}` : ''}!` 
          : `Added "${formGameName}" locally${formCreateChangelog ? ` & Published Changelog ${logVersion}` : ''}!`
      );
    }

    // Automatically archive this update in the accurate history log database
    await archiveScriptUpdateLog(newGame, isEditing);

    if (!editingGameId) {
      setGameCustomStates({
        ...gameCustomStates,
        [targetId]: {
          walkSpeed: 16,
          jumpPower: 50,
          extraToggles: {},
          extraSliders: {}
        }
      });
    }

    setSelectedGameId(targetId);
    setShowAddForm(false);
    setEditingGameId(null);
    
    // reset inputs
    setFormGameName('');
    setFormRawUrl('');
    setFormEmojiText('🎮');
    setFormDescription('');
    setFormFeatures('');
    setFormPublished(false);
  };

  const handleEditScript = (e: React.MouseEvent, game: RobloxGame) => {
    e.stopPropagation();
    setEditingGameId(game.id);
    setFormGameName(game.name);
    setFormRawUrl(game.rawUrl);
    setFormCategory(game.category);
    setFormEmojiText(game.emojiText);
    setFormDescription(game.description);
    setFormFeatures(game.features.join(', '));
    setFormPublished(game.published !== false);
    
    // Set changelog pre-populated fields
    setFormCreateChangelog(true);
    setFormChangelogTitle(`Optimized and Updated ${game.name}`);
    setFormChangelogDesc(`Upgraded security bypass and fixed compatibility hooks for ${game.name}.`);
    setFormChangelogType('fixed');

    setShowAddForm(true);
    triggerToast(`Loaded "${game.name}" details into editor!`);
  };

  const handleTogglePublish = async (e: React.MouseEvent, game: RobloxGame) => {
    e.stopPropagation(); // Avoid triggering card click selection
    if (!isDevOrOwner) return;
    const newStatus = game.published === false ? true : false;
    const docRef = doc(db, 'custom_scripts', game.id);
    const updatedGame: RobloxGame = {
      ...game,
      published: newStatus,
      updatedAt: new Date().toISOString()
    };
    try {
      await setDoc(docRef, updatedGame, { merge: true });
      triggerToast(newStatus ? `"${game.name}" is now LIVE for all users!` : `"${game.name}" moved back to Backup Server Draft!`);
      // Automatically archive this visibility modification
      await archiveScriptUpdateLog(updatedGame, true);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `custom_scripts/${game.id}`);
    }
  };

  const handleDeleteScript = async (e: React.MouseEvent, game: RobloxGame) => {
    e.stopPropagation(); // Avoid triggering card click selection
    if (!isDevOrOwner) return;
    if (!confirm(`Are you sure you want to completely delete "${game.name}" from the database?`)) return;
    const docRef = doc(db, 'custom_scripts', game.id);
    try {
      await deleteDoc(docRef);
      triggerToast(`Successfully deleted "${game.name}" from database.`);
      // If the deleted game was selected, reset to nights_forest
      if (selectedGameId === game.id) {
        setSelectedGameId('nights_forest');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `custom_scripts/${game.id}`);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingGame) return;
    if (!reportDescription.trim()) {
      triggerToast("Please provide a description of the bug/detection issue.");
      return;
    }
    const emailToUse = reportEmail.trim() || 'guest@zerohub.net';

    setIsSubmittingReport(true);
    const ticketId = `ticket_${Date.now()}`;

    try {
      await setDoc(doc(db, 'support_tickets', ticketId), {
        id: ticketId,
        email: emailToUse,
        category: reportCategory,
        gameName: reportingGame.name,
        gameId: reportingGame.id,
        description: `[GAME ID: ${reportingGame.id}] ${reportDescription.trim()}`,
        createdAt: new Date().toISOString(),
        status: 'Pending',
        ownerResponse: ''
      });

      triggerToast(`Bug report for ${reportingGame.name} submitted directly to Creator Bug Inbox!`);
      setReportingGame(null);
      setReportDescription('');
    } catch (err: any) {
      console.error(err);
      // Fallback in case of lack of Firestore permissions or offline:
      triggerToast("Offline fallback: Bug report stored locally.");
      const offlineReports = JSON.parse(localStorage.getItem('voidware_offline_reports') || '[]');
      offlineReports.push({
        id: ticketId,
        email: emailToUse,
        category: reportCategory,
        gameName: reportingGame.name,
        gameId: reportingGame.id,
        description: `[GAME ID: ${reportingGame.id}] ${reportDescription.trim()}`,
        createdAt: new Date().toISOString(),
        status: 'Pending',
        ownerResponse: ''
      });
      localStorage.setItem('voidware_offline_reports', JSON.stringify(offlineReports));
      setReportingGame(null);
      setReportDescription('');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const filteredGames = games.filter(game => {
    // Hide unpublished scripts from non-developers/non-owners
    if (game.published === false && !isDevOrOwner) {
      return false;
    }

    const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          game.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || game.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    // Keep favorites pinned at the top
    const aFav = favorites.includes(a.id) ? 1 : 0;
    const bFav = favorites.includes(b.id) ? 1 : 0;
    if (bFav !== aFav) {
      return bFav - aFav;
    }

    if (sortBy === 'alphabetical') {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === 'rating') {
      const ratingA = getPerformanceRating(a).score;
      const ratingB = getPerformanceRating(b).score;
      return ratingB - ratingA;
    }
    if (sortBy === 'updated') {
      const timeA = new Date(a.updatedAt || a.releaseDate || 0).getTime();
      const timeB = new Date(b.updatedAt || b.releaseDate || 0).getTime();
      return timeB - timeA;
    }
    // newest (default or fallback)
    const dateA = a.releaseDate || '';
    const dateB = b.releaseDate || '';
    if (dateA !== dateB) {
      return dateB.localeCompare(dateA); // Newest first
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <div 
      id="zero-script-app" 
      style={{
        ['--color-accent' as any]: activeAccent.primary,
        ['--color-accent-hover' as any]: activeAccent.hover,
        ['--color-accent-glow' as any]: activeAccent.glow,
        ['--color-accent-glow-light' as any]: activeAccent.glowLight
      }}
      className={`min-h-screen font-sans selection:bg-cyan-500/20 selection:text-cyan-300 relative overflow-x-hidden transition-colors duration-300 ${
        theme === 'ultradark' ? 'theme-ultradark bg-[#000000] text-zinc-100' : 'bg-[#06060c] text-white'
      }`}
    >
      
      {/* Background neon elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-950/20 blur-[130px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-950/15 blur-[130px] rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6 relative z-10">
        
        {/* Top Control Bar with 3-Line Menu and Right Corner Login */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-zinc-950/45 backdrop-blur-md p-4 px-6 rounded-3xl border border-white/5 shadow-xl relative z-20">
          <div className="flex flex-wrap items-center gap-3">
            {/* 3-Line Menu Icon (Hamburger) */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 px-4 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/25 text-cyan-300 rounded-2xl transition-all flex items-center gap-2 font-mono text-xs font-bold shadow-[0_0_15px_rgba(6,182,212,0.1)] active:scale-95 cursor-pointer"
              title="Open Navigation Menu"
            >
              <Menu className="w-4 h-4 text-cyan-400" />
              <span>Menu Nav</span>
            </button>

            {/* Platform indicator badge */}
            <div 
              className="flex items-center gap-2 bg-black/45 border border-white/5 text-zinc-300 px-3.5 py-1.5 rounded-2xl text-[10px] font-mono font-bold tracking-wide shadow-[0_0_12px_rgba(255,255,255,0.03)]"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${devicePlatform === 'Mobile' ? 'bg-amber-400 animate-pulse' : 'bg-cyan-400 animate-pulse'}`} />
              <span className="text-white/40 uppercase tracking-wider text-[9px]">Platform:</span>
              <span className={devicePlatform === 'Mobile' ? 'text-amber-300 font-extrabold' : 'text-cyan-300 font-extrabold'}>{devicePlatform}</span>
            </div>

            {/* Cloud connectivity indicator */}
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-2xl text-[10px] font-mono font-extrabold uppercase tracking-wide">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span>Real-Time Database Sync</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 font-mono">
            {/* Cloud Sync Section in the absolute right corner */}
            {sessionUser ? (
              <div className={`flex items-center gap-2.5 p-1.5 pl-3 pr-2 rounded-2xl border transition-all ${
                isDevOrOwner 
                  ? 'bg-amber-500/10 border-amber-400/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                  : 'bg-black/40 border-white/5'
              }`}>
                <div className="flex flex-col text-right">
                  <span className="text-[10px] font-black text-white max-w-[120px] truncate">{sessionUser.displayName}</span>
                  {isDevOrOwner ? (
                    <span className="text-[8px] text-amber-400 tracking-wider font-extrabold uppercase flex items-center gap-1 justify-end">
                      <span>👑</span> OWNER / CREATOR
                    </span>
                  ) : (
                    <span className="text-[8px] text-cyan-400 tracking-wider font-bold uppercase">Cloud User</span>
                  )}
                </div>
                <img
                  src={sessionUser.photoURL}
                  referrerPolicy="no-referrer"
                  alt={sessionUser.displayName}
                  className={`w-7 h-7 rounded-xl ${
                    isDevOrOwner ? 'border-2 border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.3)]' : 'border border-white/10'
                  }`}
                  title={sessionUser.email}
                />
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="text-[9px] text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 p-1.5 rounded-xl border border-rose-500/20 cursor-pointer font-bold transition-all"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-gradient-to-r from-cyan-500/10 via-cyan-500/20 to-indigo-500/25 hover:from-cyan-500/20 hover:to-indigo-500/35 border border-cyan-500/30 p-2 px-4 text-cyan-300 font-extrabold rounded-2xl text-xs flex items-center gap-2 transition-all cursor-pointer font-mono shadow-[0_0_15px_rgba(6,182,212,0.15)] active:scale-95 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] animate-pulse hover:animate-none"
                title="Sign Up or Login to sync configs"
              >
                <LogIn className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>Sign Up / Login</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation / Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1 px-2.5 bg-cyan-500/10 text-cyan-400 border border-cyan-400/20 rounded font-mono text-[9px] uppercase tracking-widest font-bold">
                ZeroHub Vault
              </span>
              <span className="flex items-center gap-1 text-[9px] text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded font-bold font-mono">
                <Sparkles className="w-3 h-3 text-cyan-400" /> INSTANT LOADSTRINGS
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2 font-mono">
              <Zap className="w-6 h-6 text-cyan-400 fill-cyan-400/20" />
              ZEROHUB <span className="text-cyan-400 font-normal font-sans">// Mobile Directory</span>
            </h1>
            <p className="text-xs text-white/50">
              Get modular external scripts, fine-tune physical configs, and copy high-performance executor loadstrings.
            </p>
          </div>

          {/* Tabs and Controls Station */}
          <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-4 self-stretch xl:self-center shrink-0">
            {/* Tab Selection */}
            <div className="flex flex-wrap p-1 rounded-2xl border shrink-0 relative items-center gap-1 bg-black/45 border-white/5">
              <button
                id="btn-nav-directory"
                onClick={() => {
                  setActiveTab('directory');
                  setIsDropdownOpen(false);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer select-none border ${
                  activeTab === 'directory'
                    ? 'font-extrabold shadow-md'
                    : 'text-slate-400 hover:text-slate-100 border-transparent hover:bg-white/5'
                }`}
                style={activeTab === 'directory' ? {
                  backgroundColor: activeAccent.glowLight,
                  borderColor: `${activeAccent.primary}30`,
                  color: activeAccent.primary,
                  boxShadow: `0 0 15px ${activeAccent.glow}`
                } : undefined}
              >
                <Gamepad2 className="w-4 h-4 transition-colors" style={{ color: activeTab === 'directory' ? activeAccent.primary : undefined }} />
                Game Directory
              </button>

              {/* Script Sandbox Tab */}
              <button
                id="btn-nav-sandbox"
                onClick={() => {
                  setActiveTab('sandbox');
                  setIsDropdownOpen(false);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer select-none border ${
                  activeTab === 'sandbox'
                    ? 'font-extrabold shadow-md'
                    : 'text-slate-400 hover:text-slate-100 border-transparent hover:bg-white/5'
                }`}
                style={activeTab === 'sandbox' ? {
                  backgroundColor: activeAccent.glowLight,
                  borderColor: `${activeAccent.primary}30`,
                  color: activeAccent.primary,
                  boxShadow: `0 0 15px ${activeAccent.glow}`
                } : undefined}
              >
                <Code className="w-4 h-4 transition-colors" style={{ color: activeTab === 'sandbox' ? activeAccent.primary : undefined }} />
                Script Sandbox
              </button>

              {/* Channels Dropdown */}
              <div className="relative shrink-0 flex items-center" id="channels-dropdown-container">
                <button
                  id="channels-dropdown-trigger"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer select-none border ${
                    activeTab !== 'directory' && activeTab !== 'sandbox'
                      ? 'font-extrabold'
                      : 'text-white/40 hover:text-white/70 border border-transparent'
                  }`}
                  style={activeTab !== 'directory' && activeTab !== 'sandbox' ? {
                    backgroundColor: activeAccent.glowLight,
                    borderColor: `${activeAccent.primary}30`,
                    color: activeAccent.primary,
                    boxShadow: `0 0 15px ${activeAccent.glow}`
                  } : undefined}
                >
                  <Layers className="w-4 h-4 transition-colors" style={{ color: activeTab !== 'directory' && activeTab !== 'sandbox' ? activeAccent.primary : undefined }} />
                  <span>
                    {activeTab === 'directory' ? 'More Channels' : (
                      activeTab === 'suggestions' ? 'Suggestions' :
                      activeTab === 'support' ? (
                        activeSubTab === 'reporter' ? 'Support Bot' :
                        activeSubTab === 'faq' ? 'FAQ' :
                        activeSubTab === 'network' ? 'Network Status' : 'Creator Inbox'
                      ) :
                      activeTab === 'changelog' ? 'Change Logs' :
                      activeTab === 'education' ? 'Injection Guide' :
                      'AI Compiler Hub'
                    )}
                  </span>
                  <ChevronDown 
                    className="w-3.5 h-3.5 ml-0.5 transition-transform duration-300" 
                    style={{ 
                      transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0)',
                      color: activeTab !== 'directory' && activeTab !== 'sandbox' ? activeAccent.primary : undefined
                    }} 
                  />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <>
                      {/* Invisible backdrop to dismiss dropdown */}
                      <div 
                        id="channels-dropdown-backdrop"
                        className="fixed inset-0 z-40 bg-transparent"
                        onClick={() => setIsDropdownOpen(false)}
                      />
                      <motion.div
                        id="channels-dropdown-menu"
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-56 bg-zinc-950/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl p-2 z-50 space-y-1 overflow-hidden"
                      >
                        <div className="px-3 py-1.5 text-[9px] text-white/30 uppercase tracking-widest font-mono font-bold border-b border-white/5 mb-1">
                          Select Channel
                        </div>

                        {/* Suggestions Channel */}
                        <button
                          id="btn-nav-suggestions"
                          onClick={() => {
                            setActiveTab('suggestions');
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer text-left ${
                            activeTab === 'suggestions'
                              ? 'bg-emerald-500/20 text-emerald-300 font-extrabold'
                              : 'text-white/60 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Suggestions Board</span>
                        </button>

                        {/* Support Bot */}
                        <button
                          id="btn-nav-support-bot"
                          onClick={() => {
                            setActiveTab('support');
                            setActiveSubTab('reporter');
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer text-left ${
                            activeTab === 'support' && activeSubTab === 'reporter'
                              ? 'bg-emerald-500/20 text-emerald-300 font-extrabold'
                              : 'text-white/60 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <Bot className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                          <span>Support Bot</span>
                        </button>

                        {/* FAQ */}
                        <button
                          id="btn-nav-faq"
                          onClick={() => {
                            setActiveTab('support');
                            setActiveSubTab('faq');
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer text-left ${
                            activeTab === 'support' && activeSubTab === 'faq'
                              ? 'bg-emerald-500/20 text-emerald-300 font-extrabold'
                              : 'text-white/60 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>FAQ Help Desk</span>
                        </button>

                        {/* Network Status */}
                        <button
                          id="btn-nav-network"
                          onClick={() => {
                            setActiveTab('support');
                            setActiveSubTab('network');
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer text-left ${
                            activeTab === 'support' && activeSubTab === 'network'
                              ? 'bg-emerald-500/20 text-emerald-300 font-extrabold'
                              : 'text-white/60 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <Globe className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Network Status</span>
                        </button>

                        {/* Change Logs */}
                        <button
                          id="btn-nav-changelog"
                          onClick={() => {
                            setActiveTab('changelog');
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer text-left border-t border-white/5 pt-2 mt-1 ${
                            activeTab === 'changelog'
                              ? 'bg-indigo-500/20 text-indigo-300 font-extrabold'
                              : 'text-white/60 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <History className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Change Logs</span>
                        </button>

                        {/* Injection Guide */}
                        <button
                          id="btn-nav-education"
                          onClick={() => {
                            setActiveTab('education');
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer text-left ${
                            activeTab === 'education'
                              ? 'bg-purple-500/20 text-purple-300 font-extrabold'
                              : 'text-white/60 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <Info className="w-3.5 h-3.5 text-purple-400" />
                          <span>Injection Guide</span>
                        </button>

                        {/* AI Compiler Hub */}
                        {isDevOrOwner && (
                          <button
                            id="btn-nav-ai-compiler"
                            onClick={() => {
                              setActiveTab('ai-compiler');
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer text-left border-t border-white/5 pt-2 mt-1 ${
                              activeTab === 'ai-compiler'
                                ? 'bg-amber-500/20 text-amber-300 font-extrabold'
                                : 'text-amber-400/70 hover:text-amber-300 hover:bg-white/5'
                            }`}
                          >
                            <Cpu className="w-3.5 h-3.5 text-amber-400" />
                            <span>AI Compiler Hub</span>
                          </button>
                        )}

                        {/* Creator Bug Inbox */}
                        {isDevOrOwner && (
                          <button
                            id="btn-nav-creator-inbox"
                            onClick={() => {
                              setActiveTab('support');
                              setActiveSubTab('creator-inbox');
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer text-left ${
                              activeTab === 'support' && activeSubTab === 'creator-inbox'
                                ? 'bg-amber-500/20 text-amber-300 font-extrabold'
                                : 'text-amber-400/70 hover:text-amber-300 hover:bg-white/5'
                            }`}
                          >
                            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                            <span>Creator Bug Inbox</span>
                          </button>
                        )}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Quick Toolbar Station (Theme & Sync status) */}
            <div className="flex items-center gap-2 self-start xl:self-center">
              {/* Theme Selector */}
              <div className="flex bg-black/45 p-1 rounded-2xl border border-white/5 items-center">
                <button
                  type="button"
                  onClick={() => toggleTheme('neon')}
                  className={`p-1.5 px-3 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer border ${
                    theme === 'neon'
                      ? 'bg-cyan-500/10 text-cyan-300 border-cyan-400/20 font-extrabold shadow-[0_0_12px_rgba(6,182,212,0.12)]'
                      : 'text-white/40 hover:text-white/70 border-transparent'
                  }`}
                  title="Neon Glow Theme"
                >
                  <Sun className={`w-3.5 h-3.5 transition-colors ${theme === 'neon' ? 'text-cyan-400' : 'text-white/40'}`} />
                  <span className="hidden sm:inline font-mono">Neon</span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleTheme('ultradark')}
                  className={`p-1.5 px-3 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer border ${
                    theme === 'ultradark'
                      ? 'bg-purple-500/10 text-purple-300 border-purple-500/20 font-extrabold shadow-[0_0_12px_rgba(168,85,247,0.12)]'
                      : 'text-white/40 hover:text-white/70 border-transparent'
                  }`}
                  title="Ultra Dark Theme"
                >
                  <Moon className={`w-3.5 h-3.5 transition-colors ${theme === 'ultradark' ? 'text-purple-400' : 'text-white/40'}`} />
                  <span className="hidden sm:inline font-mono">Pure Dark</span>
                </button>
              </div>

              {/* Accent Color Picker */}
              <div className="flex p-1 rounded-2xl border border-white/5 bg-black/45 items-center gap-1.5 px-2">
                <span className="text-[9px] font-mono uppercase mr-1 hidden sm:inline select-none text-white/35">Accent:</span>
                {([ 'indigo', 'cyan', 'emerald', 'purple', 'ruby', 'blue', 'amber'] as const).map((color) => {
                  const bgClass = {
                    indigo: 'bg-indigo-500',
                    cyan: 'bg-cyan-500',
                    emerald: 'bg-emerald-500',
                    purple: 'bg-purple-500',
                    ruby: 'bg-rose-500',
                    blue: 'bg-blue-500',
                    amber: 'bg-amber-500'
                  }[color];
                  
                  const borderClass = accentColor === color 
                    ? (theme === 'studio-light' ? 'border-slate-800 scale-110' : 'border-white scale-110') 
                    : 'border-transparent hover:scale-105';
                  
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        setAccentColor(color);
                        localStorage.setItem('zerohub-accent', color);
                        triggerToast(`Accent changed to ${color.toUpperCase()}!`);
                      }}
                      className={`w-3.5 h-3.5 rounded-full border ${borderClass} ${bgClass} transition-all cursor-pointer`}
                      title={`Select ${color} accent`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Inner Tab Content */}
        {activeTab === 'directory' && (
          <div className="space-y-6">
            
            {/* Database Search & Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-zinc-950/30 p-4 rounded-3xl border border-white/5 backdrop-blur-md">
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 flex-1">
                {/* Search field */}
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="text"
                    placeholder="Search Roblox game scripts... (Press Enter to save search)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        commitSearch(searchQuery);
                      }
                    }}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl pl-10 pr-16 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/30 font-sans"
                  />
                  {searchQuery.trim() && (
                    <button
                      type="button"
                      onClick={() => commitSearch(searchQuery)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 text-[9px] font-mono font-bold px-2 py-1 rounded-lg border border-cyan-400/20 cursor-pointer transition-all uppercase"
                      title="Save Search Query"
                    >
                      Save
                    </button>
                  )}
                </div>

                {/* Sort dropdown */}
                <div className="relative flex items-center bg-black/40 border border-white/5 rounded-2xl px-3 py-2 text-xs text-white shrink-0">
                  <ArrowUpDown className="w-3.5 h-3.5 text-white/35 mr-1.5 shrink-0" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent border-none text-white/70 focus:outline-none pr-6 cursor-pointer font-sans text-xs appearance-none font-medium focus:text-white"
                    style={{ background: 'none' }}
                  >
                    <option value="newest" className="bg-zinc-950 text-zinc-200 font-sans">Newest First</option>
                    <option value="updated" className="bg-zinc-950 text-zinc-200 font-sans">Last Updated</option>
                    <option value="alphabetical" className="bg-zinc-950 text-zinc-200 font-sans">Alphabetical (A-Z)</option>
                    <option value="rating" className="bg-zinc-950 text-zinc-200 font-sans">Highest Rating</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-white/35 absolute right-3 pointer-events-none" />
                </div>
                
                {/* Category filter */}
                <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5 font-mono text-[10px] uppercase font-bold text-center">
                  {['all', 'popular', 'combat', 'farming', 'survival', 'custom'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all border ${
                        categoryFilter === cat 
                          ? 'bg-zinc-800 font-bold border-white/5' 
                          : 'text-white/45 hover:text-white/70 border-transparent'
                      }`}
                      style={categoryFilter === cat ? {
                        color: activeAccent.primary,
                        borderColor: `${activeAccent.primary}20`
                      } : undefined}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add Custom script button */}
              {(isDevOrOwner || sessionUser?.uid === 'sandbox_user_1337') && (
                <button
                  onClick={() => {
                    if (!showAddForm) {
                      setEditingGameId(null);
                      setFormGameName('');
                      setFormRawUrl('');
                      setFormEmojiText('🎮');
                      setFormDescription('');
                      setFormFeatures('');
                      setFormPublished(false);
                      setFormCreateChangelog(true);
                      setFormChangelogTitle('New Script Deployed');
                      setFormChangelogDesc('Compiled and registered a secure dynamic loader script.');
                      setFormChangelogType('added');
                    }
                    setShowAddForm(!showAddForm);
                  }}
                  className="bg-cyan-500 hover:bg-cyan-400 font-bold text-white px-4 py-2.5 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_4px_12px_rgba(6,182,212,0.25)] hover:shadow-[0_4px_22px_rgba(6,182,212,0.4)] shrink-0 font-sans"
                >
                  <Plus className="w-4 h-4" />
                  Add Game Script
                </button>
              )}
            </div>

            {/* Recent Searches Sub-Bar */}
            {recentSearches.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 bg-zinc-950/20 border border-white/5 rounded-2xl animate-fadeIn text-xs text-white/50">
                <span className="font-mono text-[10px] uppercase text-white/35 font-bold tracking-wider mr-1">Recent:</span>
                <div className="flex flex-wrap items-center gap-1.5 flex-1">
                  {recentSearches.map((query, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1 bg-white/5 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/20 rounded-xl px-2.5 py-1 text-[11px] text-white/70 hover:text-cyan-300 transition-all cursor-pointer group"
                      onClick={() => setSearchQuery(query)}
                    >
                      <span>{query}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRecentSearches((prev) => {
                            const next = prev.filter((q) => q !== query);
                            localStorage.setItem('voidware_recent_searches', JSON.stringify(next));
                            return next;
                          });
                        }}
                        className="text-white/20 hover:text-rose-400 px-0.5 transition-colors"
                        title="Remove search"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setRecentSearches([]);
                    localStorage.removeItem('voidware_recent_searches');
                    triggerToast("🧹 Recent search history cleared!");
                  }}
                  className="text-[10px] font-mono text-rose-400/50 hover:text-rose-400 transition-colors cursor-pointer font-bold uppercase tracking-wider pl-2"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Expandable Add Script Form Content */}
            {(isDevOrOwner || sessionUser?.uid === 'sandbox_user_1337') && showAddForm && (
              <div className="glass-morphism rounded-3xl p-6 border-2 border-dashed border-cyan-500/20 bg-cyan-950/5 space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-1.5 font-mono">
                    {editingGameId ? <Edit2 className="w-4 h-4 text-cyan-400" /> : <Plus className="w-4 h-4 text-cyan-400" />} {editingGameId ? 'EDIT ROBLOX GAME LOADER' : 'ADD NEW ROBLOX GAME LOADER'}
                  </h3>
                  <button 
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingGameId(null);
                      setFormGameName('');
                      setFormRawUrl('');
                      setFormEmojiText('🎮');
                      setFormDescription('');
                      setFormFeatures('');
                      setFormPublished(false);
                    }}
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

                    {isDevOrOwner && (
                      <div className="bg-cyan-950/20 border border-cyan-500/15 p-3.5 rounded-2xl space-y-2 text-left">
                        <label className="block text-[10px] text-cyan-300 uppercase tracking-widest font-mono font-bold">
                          Cloud Publish Status (Staging Server)
                        </label>
                        <p className="text-[9px] text-white/40 font-sans leading-normal">
                          Choose whether to save as a private draft on your backup server, or publish it live for everyone.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 pt-1">
                          <label className="flex items-center gap-2 text-[10.5px] text-zinc-300 hover:text-white cursor-pointer select-none">
                            <input 
                              type="radio" 
                              name="publish_status"
                              checked={!formPublished}
                              onChange={() => setFormPublished(false)}
                              className="accent-cyan-500 w-3.5 h-3.5"
                            />
                            <span>Backup Server Draft (Hidden from public)</span>
                          </label>
                          <label className="flex items-center gap-2 text-[10.5px] text-emerald-400 hover:text-emerald-300 cursor-pointer select-none font-bold">
                            <input 
                              type="radio" 
                              name="publish_status"
                              checked={formPublished}
                              onChange={() => setFormPublished(true)}
                              className="accent-emerald-500 w-3.5 h-3.5"
                            />
                            <span>Publish Live (Visible to all users)</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Dynamic Changelog Publisher Card */}
                    <div className="bg-zinc-900/60 border border-white/5 p-4 rounded-2xl space-y-3 text-left">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-xs text-white hover:text-cyan-300 font-bold font-mono uppercase cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={formCreateChangelog}
                            onChange={(e) => setFormCreateChangelog(e.target.checked)}
                            className="accent-cyan-500 w-4 h-4 rounded"
                          />
                          <span>Publish Update Notes to Changelog</span>
                        </label>
                      </div>

                      {formCreateChangelog && (
                        <div className="space-y-3 pt-3 border-t border-white/5 animate-fadeIn">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[9px] text-white/40 uppercase tracking-widest font-mono font-bold pb-1">Log Type / Category</label>
                              <select 
                                value={formChangelogType}
                                onChange={(e) => setFormChangelogType(e.target.value as any)}
                                className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                              >
                                <option value="added">added</option>
                                <option value="fixed">fixed</option>
                                <option value="security">security</option>
                                <option value="database">database</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[9px] text-white/40 uppercase tracking-widest font-mono font-bold pb-1">Changelog Title / Subject</label>
                              <input 
                                type="text"
                                placeholder="e.g. Critical security update"
                                value={formChangelogTitle}
                                onChange={(e) => setFormChangelogTitle(e.target.value)}
                                className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[9px] text-white/40 uppercase tracking-widest font-mono font-bold pb-1">What was modified / Description</label>
                            <textarea 
                              rows={2}
                              placeholder="Describe exactly what was updated so users can track changes accurately..."
                              value={formChangelogDesc}
                              onChange={(e) => setFormChangelogDesc(e.target.value)}
                              className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none font-sans"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end pt-3">
                      <button 
                        type="submit" 
                        className="bg-emerald-500 hover:bg-emerald-400 font-bold text-white px-5 py-2.5 rounded-xl text-xs transition-all cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                      >
                        ✔ {editingGameId ? 'Update & Save Changes' : 'Add Script to Database'}
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
                        <div
                          key={game.id}
                          onClick={() => {
                            setSelectedGameId(game.id);
                            commitSearch(searchQuery);
                          }}
                          className={`w-full p-4 rounded-3xl border text-left transition-all relative cursor-pointer overflow-hidden flex flex-col gap-2 script-card-interactive group ${
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
                            <div className="flex items-center gap-1.5">
                              {/* Reset Slider Settings */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleResetCustomState(game);
                                }}
                                className="p-1.5 rounded-xl border bg-black/30 border-white/5 text-white/40 hover:text-amber-400 hover:border-amber-500/30 hover:bg-amber-500/10 transition-all duration-200 cursor-pointer flex items-center justify-center"
                                title="Reset Slider Settings to Defaults"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>

                              {/* Quick Copy on Hover */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(game.rawUrl);
                                  triggerToast(`📋 Script Raw URL copied for ${game.name}!`);
                                }}
                                className="opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 p-1.5 rounded-xl border bg-black/30 border-white/5 text-white/40 hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-cyan-500/10 transition-all duration-200 cursor-pointer flex items-center justify-center"
                                title="Quick Copy Raw URL"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>

                              {/* Share Button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const directUrl = `${window.location.origin}?tab=directory&game=${game.id}`;
                                  if (navigator.share) {
                                    navigator.share({
                                      title: `ZeroHub - ${game.name}`,
                                      text: game.description,
                                      url: directUrl,
                                    }).catch(() => {
                                      navigator.clipboard.writeText(directUrl);
                                      triggerToast(`🔗 Direct link copied to clipboard!`);
                                    });
                                  } else {
                                    navigator.clipboard.writeText(directUrl);
                                    triggerToast(`🔗 Direct link copied to clipboard!`);
                                  }
                                }}
                                className="p-1.5 rounded-xl border bg-black/30 border-white/5 text-white/40 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/10 transition-all duration-200 cursor-pointer flex items-center justify-center"
                                title="Share Script Link"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Star favorite toggle */}
                              <button
                                type="button"
                                onClick={(e) => handleToggleFavorite(e, game.id)}
                                className={`p-1.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-center ${
                                  favorites.includes(game.id)
                                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 hover:scale-105 active:scale-95'
                                    : 'bg-black/30 border-white/5 text-white/20 hover:text-white/60 hover:border-white/10 hover:bg-black/50'
                                }`}
                                title={favorites.includes(game.id) ? "Remove from Favorites" : "Pin to Top"}
                              >
                                <Star className={`w-3.5 h-3.5 ${favorites.includes(game.id) ? 'fill-amber-400 text-amber-400' : ''}`} />
                              </button>

                              <div className="flex flex-col items-end gap-1">
                                <span className={`text-[8px] border px-2 py-0.5 rounded-md font-mono font-bold ${statusColor}`}>
                                  {game.status.toUpperCase()}
                                </span>
                                {isDevOrOwner && game.id.startsWith('custom_') && (
                                  <span className={`text-[7px] border px-1.5 py-0.5 rounded-md font-mono font-bold flex items-center gap-1 ${
                                    game.published 
                                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' 
                                      : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                                  }`}>
                                    <Globe className="w-2 h-2" />
                                    {game.published ? 'LIVE' : 'BACKUP'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <p className="text-[10px] text-white/40 leading-relaxed font-sans line-clamp-2">
                            {game.description}
                          </p>

                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {game.features.slice(0, 3).map((feat, idx) => {
                              const badgeStyle = getFeatureBadgeStyle(feat);
                              return (
                                <span 
                                  key={idx} 
                                  className={`text-[9px] px-2 py-0.5 rounded-lg border font-medium flex items-center gap-1 transition-all duration-200 hover:scale-105 select-none ${badgeStyle}`}
                                >
                                  <span className="w-1 h-1 rounded-full bg-current opacity-85" />
                                  {feat}
                                </span>
                              );
                            })}
                            {game.features.length > 3 && (
                              <span className="text-[8px] text-white/35 font-mono self-center font-bold px-1.5 py-0.5 bg-white/5 rounded border border-white/5">
                                +{game.features.length - 3} MORE
                              </span>
                            )}
                          </div>

                          {/* Performance Rating Badge Section */}
                          {(() => {
                            const perf = getPerformanceRating(game);
                            return (
                              <div className="flex items-center justify-between text-[9px] font-mono border-t border-white/5 pt-2 mt-1 gap-2">
                                <span className="text-white/35 flex items-center gap-1">
                                  <span>⚡ Load:</span>
                                  <span className="text-white/65 font-semibold font-mono">{perf.loadTime}ms</span>
                                </span>
                                <span className="text-white/35 flex items-center gap-1">
                                  <span>🛡 Stability:</span>
                                  <span className={`font-semibold ${
                                    perf.score >= 90 ? 'text-emerald-400' : perf.score >= 75 ? 'text-amber-400' : 'text-rose-400'
                                  }`}>
                                    {perf.stabilityText}
                                  </span>
                                </span>
                                <span className={`px-1.5 py-0.5 rounded-md font-bold border transition-all ${
                                  perf.score >= 95 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.1)]' :
                                  perf.score >= 85 ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_8px_rgba(6,182,212,0.1)]' :
                                  perf.score >= 75 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.1)]' :
                                  'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_8px_rgba(239,68,68,0.1)]'
                                }`}>
                                  PERF: {perf.score}/100
                                </span>
                              </div>
                            );
                          })()}

                          {/* Last Updated Timestamp & Report Button Row */}
                          <div className="flex items-center justify-between border-t border-white/5 pt-2 mt-1.5 text-[9.5px] font-mono text-white/35">
                            <span className="flex items-center gap-1 text-white/30">
                              <Clock className="w-3 h-3 text-white/20" />
                              <span>Updated: {game.releaseDate || '2026-06-25'}</span>
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setReportingGame(game);
                                setReportDescription('');
                                setReportEmail(sessionUser?.email || '');
                              }}
                              className="flex items-center gap-1 text-white/40 hover:text-rose-400 transition-colors cursor-pointer px-2 py-0.5 rounded-lg hover:bg-rose-500/10 border border-transparent hover:border-rose-500/10"
                              title="Report script bug / cheat issue"
                            >
                              <Flag className="w-3 h-3 text-rose-500/75" />
                              <span>Report</span>
                            </button>
                          </div>

                          {/* In-Game Interactive Video Loop Preview Button */}
                          {isDevOrOwner && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewGame(game);
                                triggerToast(`Loading in-game HUD preview simulation for ${game.name}...`);
                              }}
                              className="mt-2.5 w-full py-1.5 px-3 rounded-2xl bg-cyan-500/5 hover:bg-cyan-500/10 border border-cyan-400/25 hover:border-cyan-400/50 text-cyan-300 hover:text-white text-[9px] font-mono font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.03)] cursor-pointer"
                            >
                              <span className="relative flex h-1.5 w-1.5 shrink-0">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
                              </span>
                              <span>🎥 In-Game Preview</span>
                            </button>
                          )}

                          {/* Owner/Developer quick management controls for custom scripts */}
                          {isDevOrOwner && (
                            <div className="flex gap-1.5 pt-2 border-t border-white/5 mt-1">
                              <button
                                type="button"
                                onClick={(e) => handleTogglePublish(e, game)}
                                className={`flex-1 py-1 px-1.5 rounded-xl text-[8px] font-bold font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer border ${
                                  game.published === false
                                    ? 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-300'
                                    : 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20 text-amber-300'
                                }`}
                              >
                                {game.published === false ? <Globe className="w-2.5 h-2.5" /> : <Archive className="w-2.5 h-2.5" />}
                                <span>{game.published === false ? 'Publish Live' : 'Send to Backup'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleEditScript(e, game)}
                                className="px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-300 rounded-xl transition-all cursor-pointer flex items-center justify-center"
                                title="Edit Script Metadata / Code URL"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              {game.id.startsWith('custom_') && (
                                <button
                                  type="button"
                                  onClick={(e) => handleDeleteScript(e, game)}
                                  className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 rounded-xl transition-all cursor-pointer flex items-center justify-center"
                                  title="Delete Script completely"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Settings and Copy Area (8 Cols) */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                
                {/* Customizer Toggle Header */}
                <div className="flex justify-between items-center bg-zinc-950/20 p-3 px-4 rounded-3xl border border-white/5 backdrop-blur-md">
                  <div className="flex items-center gap-2">
                    <SettingsIcon className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Script Configuration Options</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomizer(!showCustomizer);
                      triggerToast(showCustomizer ? "Script sliders hidden!" : "Custom walkspeed & jump sliders enabled!");
                    }}
                    className={`p-1.5 px-3.5 rounded-xl border text-[9px] font-mono font-bold uppercase transition-all cursor-pointer ${
                      showCustomizer 
                        ? 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.1)]' 
                        : 'bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-400/20 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.1)]'
                    }`}
                  >
                    <span>{showCustomizer ? 'Hide Sliders' : 'Customize Sliders'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch flex-1">
                  {/* 1. Config Selector (6 Cols) */}
                  {showCustomizer && (
                    <div className="md:col-span-6 animate-fadeIn">
                      <ScriptConfigurator 
                        game={activeGame} 
                        customValues={activeCustomState} 
                        onChange={handleCustomStateChange} 
                        sessionUser={sessionUser}
                        allCustomStates={gameCustomStates}
                        triggerToast={triggerToast}
                        allGames={games}
                      />
                    </div>
                  )}

                  {/* 2. Loader Snippet (6 or 12 Cols depending on showCustomizer) */}
                  <div className={`${showCustomizer ? 'md:col-span-6' : 'md:col-span-12'} flex flex-col h-full font-mono transition-all duration-300`}>
                    <LuaScriptView 
                      game={activeGame} 
                      customValues={activeCustomState} 
                      isDevOrOwner={isDevOrOwner}
                    />

                    {/* Guide below code container */}
                    <div className="mt-4">
                      <InstructionSheet game={activeGame} />
                    </div>
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
                  <h4 className="font-bold text-white tracking-wide">ZeroHub Keyless Verification</h4>
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



          </div>
        )}

        {/* Tab 2: Script Sandbox */}
        {activeTab === 'sandbox' && (
          <ScriptSandbox 
            sessionUser={sessionUser}
            theme={theme}
            triggerToast={triggerToast}
            onShowAuth={() => setIsAuthModalOpen(true)}
            preloadedCode={preloadedSandboxCode}
            onClearPreloadedCode={() => setPreloadedSandboxCode('')}
          />
        )}



        {/* Tab 3: Sleek Change Log timeline */}
        {activeTab === 'changelog' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-zinc-950/40 p-5 rounded-3xl border border-white/5 space-y-2">
              <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                <History className="w-5 h-5 text-cyan-400" /> ZeroHub Repository Change logs
              </h2>
              <p className="text-xs text-white/40">
                Track previous updates, anti-detection changes, and gameplay improvements deployed live.
              </p>
            </div>

            <div className="space-y-4">
              {changelogs.map((log) => {
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

        {/* Tab 5: Community Suggestions Box */}
        {activeTab === 'suggestions' && (
          <SuggestionChannel 
            sessionUser={sessionUser ? {
              uid: sessionUser.uid,
              displayName: sessionUser.displayName || 'Explorer',
              photoURL: sessionUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face',
              email: sessionUser.email || ''
            } : null}
            theme={theme}
            onShowAuth={() => setIsAuthModalOpen(true)}
            triggerToast={triggerToast}
          />
        )}

        {/* Tab 5.5: Support and Bug Sentinel Bot & Creator Mail Channel */}
        {activeTab === 'support' && (
          <SupportHub 
            sessionUser={sessionUser}
            isDevOrOwner={isDevOrOwner}
            triggerToast={triggerToast}
            theme={theme}
            activeSubTab={activeSubTab}
            onImportScriptToSandbox={(code) => {
              setPreloadedSandboxCode(code);
              setActiveTab('sandbox');
            }}
          />
        )}

        {/* Tab 6: AI Compiler & Executor Matrix Hub */}
        {activeTab === 'ai-compiler' && (
          <AiCompilerAgents 
            theme={theme}
            activeGameName={activeGame?.name}
            triggerToast={triggerToast}
            userEmail={sessionUser?.email || ''}
          />
        )}

        {/* Dynamic footer */}
        <footer className="text-center text-[10px] text-white/30 pt-6 border-t border-white/5 flex justify-between items-center font-mono">
          <span>ZeroHub Database Hub — Auto-Patched Cloud Syncing</span>
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

      {/* Report Script Modal */}
      <AnimatePresence>
        {reportingGame && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm"
              onClick={() => setReportingGame(null)}
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-lg bg-zinc-950 border border-white/10 rounded-3xl p-6 shadow-[0_0_50px_rgba(239,68,68,0.15)] z-10 text-left overflow-hidden"
            >
              {/* Top neon border accent */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500" />

              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
                    <Flag className="w-4 h-4 fill-rose-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-wide">Report Script Defect</h3>
                    <p className="text-[10px] text-white/35 font-mono">Game ID: {reportingGame.id}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setReportingGame(null)}
                  className="p-1.5 hover:bg-white/5 rounded-lg border border-white/5 text-white/50 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleReportSubmit} className="space-y-4">
                {/* Pre-filled Game ID / Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[9px] text-white/40 uppercase tracking-wider font-mono pb-1">Reported Game ID</label>
                    <input
                      type="text"
                      value={reportingGame.id}
                      disabled
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white/60 font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-white/40 uppercase tracking-wider font-mono pb-1">Script Title</label>
                    <input
                      type="text"
                      value={reportingGame.name}
                      disabled
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white/60 font-sans font-semibold focus:outline-none truncate"
                    />
                  </div>
                </div>

                {/* Contact Email & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[9px] text-white/50 uppercase tracking-wider font-mono pb-1">Your Contact Email</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. explorer@void.net"
                      value={reportEmail}
                      onChange={(e) => setReportEmail(e.target.value)}
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-rose-500/30"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-white/50 uppercase tracking-wider font-mono pb-1">Issue Category</label>
                    <select
                      value={reportCategory}
                      onChange={(e) => setReportCategory(e.target.value)}
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500/30 font-sans"
                    >
                      <option value="Script Detected / Broken" className="bg-zinc-950 text-white">Script Detected / Broken</option>
                      <option value="Lua Loadstring Crash" className="bg-zinc-950 text-white">Lua Loadstring Crash</option>
                      <option value="Outdated / Patch needed" className="bg-zinc-950 text-white">Outdated / Patch needed</option>
                      <option value="Key Bypass Fault" className="bg-zinc-950 text-white">Key Bypass Fault</option>
                    </select>
                  </div>
                </div>

                {/* Bug Description */}
                <div>
                  <label className="block text-[9px] text-white/50 uppercase tracking-wider font-mono pb-1">Describe the bug / detection</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe what's wrong (e.g. 'Since yesterday's Roblox update, the Walk Speed bypass crashes the executor immediately')."
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-rose-500/30 leading-relaxed"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-2.5 pt-2 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setReportingGame(null)}
                    className="bg-white/5 hover:bg-white/10 text-white/75 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors border border-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReport}
                    className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-5 py-2 rounded-xl text-xs cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.25)] flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isSubmittingReport ? (
                      <>
                        <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Flag className="w-3 h-3 fill-white" />
                        <span>Submit to Bug Inbox</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Slide-out Sidebar Hamburger Drawer */}
      <AnimatePresence>
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setIsSidebarOpen(false)}
            />
            
            {/* Drawer Body */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-sm bg-zinc-950 border-l border-white/10 p-6 flex flex-col gap-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-y-auto h-full z-10 text-left"
            >
              {/* Close Button */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-2">
                  <Menu className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">ZeroHub Navigation</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1.5 hover:bg-white/5 rounded-lg border border-white/5 text-white/50 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Navigation Section (Where is Changelog) */}
              <div className="space-y-3">
                <h4 className="text-[10px] text-white/40 uppercase tracking-widest font-mono font-bold">Quick Shortcuts</h4>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('directory');
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all text-xs font-bold font-mono flex items-center justify-between cursor-pointer ${
                      activeTab === 'directory' 
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300' 
                        : 'bg-white/3 border-white/5 text-white/60 hover:bg-white/5'
                    }`}
                  >
                    <span>🎮 Game Database Directory</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('changelog');
                      setIsSidebarOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all text-xs font-bold font-mono flex items-center justify-between cursor-pointer ${
                      activeTab === 'changelog' 
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300' 
                        : 'bg-white/3 border-white/5 text-white/60 hover:bg-white/5'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
                      📰 View Change Logs
                    </span>
                    <span className="text-[8px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded uppercase font-black font-mono">UPDATES LIVE</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('education');
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all text-xs font-bold font-mono flex items-center justify-between cursor-pointer ${
                      activeTab === 'education' 
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300' 
                        : 'bg-white/3 border-white/5 text-white/60 hover:bg-white/5'
                    }`}
                  >
                    <span>📖 Loadstring Guide</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  {isDevOrOwner && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('ai-compiler');
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full p-3.5 rounded-2xl border text-left transition-all text-xs font-bold font-mono flex items-center justify-between cursor-pointer ${
                        activeTab === 'ai-compiler' 
                          ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                          : 'bg-white/3 border-white/5 text-white/60 hover:bg-white/5'
                      }`}
                    >
                      <span>🤖 AI Compiler Hub</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('suggestions');
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all text-xs font-bold font-mono flex items-center justify-between cursor-pointer ${
                      activeTab === 'suggestions' 
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                        : 'bg-white/3 border-white/5 text-white/60 hover:bg-white/5'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      💬 Suggestions Board
                    </span>
                    <span className="text-[8px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded uppercase font-black font-mono">CLOUD</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('support');
                      setActiveSubTab('reporter');
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all text-xs font-bold font-mono flex items-center justify-between cursor-pointer ${
                      activeTab === 'support' && activeSubTab === 'reporter'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                        : 'bg-white/3 border-white/5 text-white/60 hover:bg-white/5'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-emerald-400 animate-pulse" />
                      🤖 Support Bot
                    </span>
                    <ChevronRight className="w-4 h-4 text-white/30" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('support');
                      setActiveSubTab('faq');
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all text-xs font-bold font-mono flex items-center justify-between cursor-pointer ${
                      activeTab === 'support' && activeSubTab === 'faq'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                        : 'bg-white/3 border-white/5 text-white/60 hover:bg-white/5'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-emerald-400" />
                      ❓ FAQ Help Desk
                    </span>
                    <ChevronRight className="w-4 h-4 text-white/30" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('support');
                      setActiveSubTab('network');
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all text-xs font-bold font-mono flex items-center justify-between cursor-pointer ${
                      activeTab === 'support' && activeSubTab === 'network'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                        : 'bg-white/3 border-white/5 text-white/60 hover:bg-white/5'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-emerald-400" />
                      🌐 Network Status
                    </span>
                    <ChevronRight className="w-4 h-4 text-white/30" />
                  </button>

                  {isDevOrOwner && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('support');
                        setActiveSubTab('creator-inbox');
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full p-3.5 rounded-2xl border text-left transition-all text-xs font-bold font-mono flex items-center justify-between cursor-pointer ${
                        activeTab === 'support' && activeSubTab === 'creator-inbox'
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)]' 
                          : 'bg-white/3 border-white/5 text-white/60 hover:bg-white/5'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-amber-400" />
                        📥 Creator Bug Inbox
                      </span>
                      <ChevronRight className="w-4 h-4 text-white/30" />
                    </button>
                  )}
                </div>
              </div>

              {/* Developer / Owner Dedicated Utility Hub */}
              {isDevOrOwner && (
                <div className="bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-500/20 p-4 rounded-3xl space-y-3 text-left animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">👑</span>
                    <h4 className="text-[10px] text-amber-400 uppercase tracking-wider font-mono font-bold">Creator Console</h4>
                  </div>
                  <div className="space-y-2 text-[11px] text-white/60 leading-relaxed font-sans">
                    <p>
                      You are logged in as the verified system owner. You can write custom loadstrings directly into the real-time cloud database from the catalog panel.
                    </p>
                    <div className="bg-black/45 p-2 rounded-xl border border-amber-500/10 font-mono text-[9px] text-amber-300">
                      Permissions: Full Read/Write/Delete Access
                    </div>
                  </div>
                </div>
              )}

              {/* Verified Status Section */}
              <div className="border-t border-white/5 pt-4 space-y-3 text-left">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-[10px] text-white/70 uppercase tracking-widest font-mono font-bold">Secure Infrastructure</h4>
                </div>
                <p className="text-[10px] text-white/40 leading-relaxed font-sans">
                  ZeroHub maintains fully persistent connections via Firebase cloud services for real-time preferences and configuration syncing.
                </p>
              </div>
              
              {/* Copyright / Branded footer in Drawer */}
              <div className="mt-auto text-center text-[9px] text-white/20 font-mono pt-4 border-t border-white/5">
                ZeroHub Cloud Console
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Interactive Toast Messaging Overlay */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-950 border-2 border-white/20 p-3.5 px-5 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] flex items-center gap-2.5 font-mono text-[11px] text-white animate-bounce">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 animate-spin" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Interactive In-Game Preview Modal overlay */}
      <AnimatePresence>
        {previewGame && (
          <InGamePreview
            game={previewGame}
            onClose={() => setPreviewGame(null)}
            theme={theme}
            triggerToast={triggerToast}
            onImportToSandbox={(code) => {
              setPreloadedSandboxCode(code);
              setActiveTab('sandbox');
            }}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
