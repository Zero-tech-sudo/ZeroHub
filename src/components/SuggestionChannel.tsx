import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Send, ThumbsUp, Calendar, Gamepad2, Sparkles, Database, 
  Clock, ShieldCheck, Heart, User, Sparkle, Hash, Bug, ShieldAlert, Users
} from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';

interface Suggestion {
  id: string;
  title: string;
  gameName: string;
  description: string;
  authorName: string;
  authorPhoto?: string;
  createdAt: any;
  likes: number;
  channel?: string;
}

interface SuggestionChannelProps {
  sessionUser: { uid: string; displayName: string; photoURL: string; email: string } | null;
  theme?: 'studio-light' | 'studio-dark';
  onShowAuth: () => void;
  triggerToast: (msg: string) => void;
}

export const SuggestionChannel: React.FC<SuggestionChannelProps> = ({
  sessionUser,
  theme,
  onShowAuth,
  triggerToast
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Active Channel Tab State
  const [activeChannel, setActiveChannel] = useState<'scripts' | 'anticheat' | 'bugs' | 'general'>('scripts');

  // Form State
  const [title, setTitle] = useState('');
  const [gameName, setGameName] = useState('');
  const [description, setDescription] = useState('');
  const [authorNameInput, setAuthorNameInput] = useState('');

  // Static fallback suggestions for multiple channels
  const backupSuggestions: Suggestion[] = [
    {
      id: 'bg1',
      title: 'Auto-fish and sell mechanism for Blox Fruits',
      gameName: 'Blox Fruits',
      description: 'Would love an automated fish collector and teleporter to the merchant so we can farm sea event items AFK during the night loop.',
      authorName: 'RobloxLegend_99',
      createdAt: null,
      likes: 12,
      channel: 'scripts'
    },
    {
      id: 'bg2',
      title: 'Flee the Facility computer hacker ESP',
      gameName: 'Flee the Facility',
      description: 'Requesting real-time line tracers to computer terminals that change color depending on hack completion percentage (red/yellow/green).',
      authorName: 'FTF_Runner',
      createdAt: null,
      likes: 8,
      channel: 'scripts'
    },
    {
      id: 'bg3',
      title: 'Doors Entity alert beep before flicker',
      gameName: 'Doors',
      description: 'Can we have a tiny warning sound or text notification on screen 2 seconds before Rush or Ambush flicker the lights? Extremely useful for high latency mobile devices.',
      authorName: 'Void Explorer',
      createdAt: null,
      likes: 19,
      channel: 'scripts'
    },
    {
      id: 'bg4',
      title: 'Byfron heartbeat monitor bypass optimization',
      gameName: 'Anti-Cheat Bypass',
      description: 'Byfron mobile telemetry sends integrity queries on thread frames. We need secure cellular network delay spoofers to hide the speed value changes.',
      authorName: 'CheatDev_X',
      createdAt: null,
      likes: 15,
      channel: 'anticheat'
    },
    {
      id: 'bg5',
      title: 'Android 14 Delta Injection patch',
      gameName: 'Android 14',
      description: 'Delta mobile crashes occasionally on Android 14. We should request dynamic metatable spoofing parameters updates to stabilise the hook.',
      authorName: 'MobileScripter',
      createdAt: null,
      likes: 11,
      channel: 'anticheat'
    },
    {
      id: 'bg6',
      title: '99 Nights warp function teleports under terrain',
      gameName: '99 Nights in the Forest',
      description: 'The warp script occasionally teleports players 2 studs too low, triggering in-game fall blocks. Can the elevation be raised by +2?',
      authorName: 'LaggyWarp',
      createdAt: null,
      likes: 5,
      channel: 'bugs'
    },
    {
      id: 'bg7',
      title: 'Blade Ball auto-parry delay offset on high latency',
      gameName: 'Blade Ball',
      description: 'The auto-parry activates too early when ping is above 150ms. Let us add a slider or toggle in settings to calibrate the ping offset manually.',
      authorName: 'BallSpeedy',
      createdAt: null,
      likes: 9,
      channel: 'bugs'
    },
    {
      id: 'bg8',
      title: 'Delta Mobile key system down error',
      gameName: 'Delta Key System',
      description: 'Has anyone got bypass options for Delta mobile key gate today? The website is offline for gateway issues.',
      authorName: 'RobloxGamer_Android',
      createdAt: null,
      likes: 7,
      channel: 'general'
    },
    {
      id: 'bg9',
      title: 'Welcome to the new ZeroHub Suggestions Channel!',
      gameName: 'ZeroHub Support',
      description: 'Let us keep this board clean and vote on our favorite features. Developers check this board weekly!',
      authorName: 'ZeroHub_Staff',
      createdAt: null,
      likes: 24,
      channel: 'general'
    }
  ];

  const fetchSuggestions = async () => {
    setIsLoading(true);
    try {
      const suggestionsRef = collection(db, 'suggestions');
      const q = query(suggestionsRef, orderBy('createdAt', 'desc'), limit(100));
      const querySnapshot = await getDocs(q);
      
      const loaded: Suggestion[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        loaded.push({
          id: doc.id,
          title: data.title || 'Untitled Suggestion',
          gameName: data.gameName || 'General',
          description: data.description || '',
          authorName: data.authorName || 'Anonymous Explorer',
          authorPhoto: data.authorPhoto || '',
          createdAt: data.createdAt,
          likes: data.likes || 0,
          channel: data.channel || 'scripts'
        });
      });

      if (loaded.length === 0) {
        setSuggestions(backupSuggestions);
      } else {
        setSuggestions(loaded);
      }
    } catch (err) {
      console.warn("Could not fetch suggestions from Firebase, falling back to cached list:", err);
      setSuggestions(backupSuggestions);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !gameName.trim() || !description.trim()) {
      triggerToast("Please complete all required fields.");
      return;
    }

    const finalAuthorName = sessionUser 
      ? sessionUser.displayName 
      : (authorNameInput.trim() || 'Guest Explorer');

    setIsSubmitting(true);
    try {
      const newDoc = {
        title: title.trim(),
        gameName: gameName.trim(),
        description: description.trim(),
        authorName: finalAuthorName,
        authorPhoto: sessionUser?.photoURL || '',
        createdAt: serverTimestamp(),
        likes: 0,
        channel: activeChannel
      };

      await addDoc(collection(db, 'suggestions'), newDoc);
      
      triggerToast(`Posted suggestion to #${getChannelLabel(activeChannel)}!`);
      setTitle('');
      setGameName('');
      setDescription('');
      setAuthorNameInput('');
      
      // Reload lists
      fetchSuggestions();
    } catch (err) {
      console.error("Firestore Suggestion submission error:", err);
      // Fallback local append for visual feedback if offline/rules issue
      const localNew: Suggestion = {
        id: 'local_' + Date.now(),
        title: title.trim(),
        gameName: gameName.trim(),
        description: description.trim(),
        authorName: finalAuthorName,
        authorPhoto: sessionUser?.photoURL || '',
        createdAt: null,
        likes: 0,
        channel: activeChannel
      };
      setSuggestions(prev => [localNew, ...prev]);
      triggerToast("Suggestion posted locally!");
      setTitle('');
      setGameName('');
      setDescription('');
      setAuthorNameInput('');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Local like simulation
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const toggleLike = (id: string) => {
    if (likedIds.includes(id)) {
      setLikedIds(prev => prev.filter(i => i !== id));
      setSuggestions(prev => prev.map(s => s.id === id ? { ...s, likes: s.likes - 1 } : s));
    } else {
      setLikedIds(prev => [...prev, id]);
      setSuggestions(prev => prev.map(s => s.id === id ? { ...s, likes: s.likes + 1 } : s));
      triggerToast("Upvoted community entry!");
    }
  };

  const getChannelLabel = (ch: string) => {
    switch (ch) {
      case 'scripts': return 'scripts-suggestions';
      case 'anticheat': return 'anti-cheat-bypasses';
      case 'bugs': return 'bug-reports';
      case 'general': return 'general-chat';
      default: return 'suggestions';
    }
  };

  const activeChannelDesc = {
    scripts: "Request specific Roblox games or exploit custom GUI features you want developed.",
    anticheat: "Discuss Byfron, Hyperion, or mobile integrity checks and request custom metatable bypasses.",
    bugs: "Report broken scripts, coordinate errors, or in-game kick triggers so developers can auto-patch.",
    general: "Casual discussion of loaders, performance, active executors, and key bypass options."
  }[activeChannel];

  // Filter suggestions by channel
  const filteredSuggestions = suggestions.filter(item => {
    if (!item.channel && activeChannel === 'scripts') return true;
    return item.channel === activeChannel;
  });

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
      
      {/* Header Banner */}
      <div className="lg:col-span-12 bg-zinc-950/40 p-5 rounded-3xl border border-white/5 space-y-2 text-left">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="space-y-1">
            <span className="p-1 px-2.5 bg-cyan-500/10 text-cyan-400 border border-cyan-400/20 rounded font-mono text-[9px] uppercase tracking-widest font-bold">
              Community Voting Board
            </span>
            <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-cyan-400" /> ZeroHub Discussion & Feedback
            </h2>
            <p className="text-xs text-white/40">
              Engage with our developer pipeline, report bugs, share tips, and request fresh Luau scripts.
            </p>
          </div>
          
          <button
            type="button"
            onClick={fetchSuggestions}
            className="p-2 px-4 bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-white/70 hover:text-white rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2"
          >
            <Database className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Sync Channels</span>
          </button>
        </div>
      </div>

      {/* CHANNELS NAVIGATION BAR - The core of 'more channels' requirement */}
      <div className="lg:col-span-12 flex flex-wrap bg-black/40 p-1 rounded-2xl border border-white/5 font-mono text-[11px] gap-1">
        <button
          onClick={() => setActiveChannel('scripts')}
          className={`flex-1 min-w-[120px] py-2 px-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
            activeChannel === 'scripts'
              ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.1)]'
              : 'bg-transparent border-transparent text-white/40 hover:text-white/70'
          }`}
        >
          <Hash className="w-3.5 h-3.5 text-cyan-400" />
          <span># scripts-suggestions</span>
        </button>

        <button
          onClick={() => setActiveChannel('anticheat')}
          className={`flex-1 min-w-[120px] py-2 px-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
            activeChannel === 'anticheat'
              ? 'bg-purple-500/15 border-purple-500/30 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.1)]'
              : 'bg-transparent border-transparent text-white/40 hover:text-white/70'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
          <span># anti-cheat-bypasses</span>
        </button>

        <button
          onClick={() => setActiveChannel('bugs')}
          className={`flex-1 min-w-[120px] py-2 px-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
            activeChannel === 'bugs'
              ? 'bg-rose-500/15 border-rose-500/30 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.1)]'
              : 'bg-transparent border-transparent text-white/40 hover:text-white/70'
          }`}
        >
          <Bug className="w-3.5 h-3.5 text-rose-400" />
          <span># bug-reports</span>
        </button>

        <button
          onClick={() => setActiveChannel('general')}
          className={`flex-1 min-w-[120px] py-2 px-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
            activeChannel === 'general'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.1)]'
              : 'bg-transparent border-transparent text-white/40 hover:text-white/70'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-emerald-400" />
          <span># general-chat</span>
        </button>
      </div>

      {/* Description of active channel */}
      <div className="lg:col-span-12 bg-zinc-950/20 p-3.5 rounded-2xl border border-white/5 text-left text-xs text-white/60 font-sans leading-relaxed">
        <strong className="text-cyan-400 font-mono">Channel Description:</strong> {activeChannelDesc}
      </div>

      {/* Left Form (5 Cols) */}
      <div className="lg:col-span-5 glass-morphism rounded-3xl p-5 border border-white/5 bg-zinc-950/10 space-y-4 text-left">
        <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
          <Sparkle className="w-4 h-4 text-cyan-400 animate-pulse" />
          <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            Post in #{getChannelLabel(activeChannel)}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[9px] text-white/50 uppercase tracking-widest font-mono font-bold pb-1">Post Title *</label>
            <input 
              type="text" 
              required
              placeholder={
                activeChannel === 'bugs' ? "e.g. Speed bypass kick in Bedwars" :
                activeChannel === 'anticheat' ? "e.g. Solara v3 Hyperion crash fix" :
                activeChannel === 'general' ? "e.g. Executor tier list question" :
                "e.g. Add Brookhaven GUI"
              } 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/20"
            />
          </div>

          <div>
            <label className="block text-[9px] text-white/50 uppercase tracking-widest font-mono font-bold pb-1">Target / Topic *</label>
            <div className="relative">
              <Gamepad2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
              <input 
                type="text" 
                required
                placeholder={
                  activeChannel === 'bugs' ? "e.g. Bedwars" :
                  activeChannel === 'anticheat' ? "e.g. Byfron PC" :
                  activeChannel === 'general' ? "e.g. Solara / Wave" :
                  "e.g. Brookhaven RP"
                } 
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-xl pl-9 pr-3 py-2 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-[9px] text-white/50 uppercase tracking-widest font-mono font-bold pb-1">Details *</label>
            <textarea 
              required
              rows={4}
              placeholder={
                activeChannel === 'bugs' ? "Paste any console logs, explain steps to reproduce, or list coordinates of the crash loop..." :
                activeChannel === 'anticheat' ? "Explain the metatable parameters or cellular jitter timings needed to stay undetected..." :
                activeChannel === 'general' ? "Ask the community your questions or share suggestions on executions..." :
                "Describe the cheat mechanics, custom ESPs, auto farms, or exploit bypass mechanisms you'd like us to develop..."
              } 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/20 leading-relaxed font-sans"
            />
          </div>

          {/* Author Details */}
          {sessionUser ? (
            <div className="bg-cyan-500/5 p-3 rounded-2xl border border-cyan-500/10 flex items-center gap-3">
              <img 
                src={sessionUser.photoURL} 
                referrerPolicy="no-referrer"
                alt={sessionUser.displayName} 
                className="w-7 h-7 rounded-lg border border-white/10"
              />
              <div>
                <span className="text-[10px] text-white/40 block leading-tight uppercase font-mono font-bold">Posting As</span>
                <span className="text-xs font-bold text-cyan-300 leading-tight">{sessionUser.displayName}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div>
                <label className="block text-[9px] text-white/50 uppercase tracking-widest font-mono font-bold pb-1">Your Nickname (Optional)</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                  <input 
                    type="text" 
                    placeholder="e.g. Guest_4821" 
                    value={authorNameInput}
                    onChange={(e) => setAuthorNameInput(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-xl pl-9 pr-3 py-2 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/20"
                  />
                </div>
              </div>
              
              <div className="p-2.5 bg-black/30 border border-white/5 rounded-2xl text-[10px] text-white/40 leading-relaxed">
                Want your posts to link securely across devices? 
                <button 
                  type="button" 
                  onClick={onShowAuth}
                  className="text-cyan-400 font-bold hover:underline ml-1 cursor-pointer"
                >
                  Sign in here
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-500/20 text-white font-bold rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 text-xs shadow-[0_4px_12px_rgba(6,182,212,0.25)]"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Posting...' : `Post to #${getChannelLabel(activeChannel)}`}</span>
          </button>
        </form>
      </div>

      {/* Right Suggestions List (7 Cols) */}
      <div className="lg:col-span-7 space-y-4 text-left">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-white/50 uppercase">
            <Clock className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
            <span>#{getChannelLabel(activeChannel)} Feed</span>
          </div>
          <span className="text-[9px] bg-zinc-900 border border-white/5 text-white/40 px-2 py-0.5 rounded font-mono uppercase">
            {filteredSuggestions.length} Entries
          </span>
        </div>

        {isLoading ? (
          <div className="py-20 text-center space-y-3 font-mono text-zinc-500">
            <div className="w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto" />
            <p className="text-[10px] uppercase">Retrieving entries...</p>
          </div>
        ) : (
          <div className="space-y-3 overflow-y-auto max-h-[520px] pr-1 scrollbar-thin scrollbar-thumb-white/5">
            {filteredSuggestions.length === 0 ? (
              <div className="py-16 text-center border-2 border-dashed border-white/5 rounded-3xl space-y-2">
                <MessageSquare className="w-8 h-8 text-white/10 mx-auto animate-pulse" />
                <h4 className="text-xs font-bold text-white/60 font-mono">No posts in #{getChannelLabel(activeChannel)} yet</h4>
                <p className="text-[10px] text-white/30 max-w-xs mx-auto leading-normal">
                  Be the first to submit a post in this channel using the form on the left!
                </p>
              </div>
            ) : (
              filteredSuggestions.map((item) => {
                const isLiked = likedIds.includes(item.id);
                return (
                  <div 
                    key={item.id} 
                    className="glass-morphism rounded-3xl p-4.5 border border-white/5 bg-zinc-950/25 space-y-3 relative hover:border-white/10 transition-all group animate-fadeIn"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-[8px] bg-cyan-500/10 text-cyan-400 border border-cyan-400/20 px-2 py-0.5 rounded font-mono uppercase font-black">
                          {item.gameName}
                        </span>
                        <h4 className="text-xs font-bold text-white leading-snug group-hover:text-cyan-300 transition-colors">
                          {item.title}
                        </h4>
                      </div>

                      {/* Upvote Button */}
                      <button
                        type="button"
                        onClick={() => toggleLike(item.id)}
                        className={`flex items-center gap-1.5 p-1.5 px-3 rounded-xl border font-mono text-[10px] font-bold transition-all cursor-pointer ${
                          isLiked 
                            ? 'bg-rose-500/15 border-rose-500/30 text-rose-300' 
                            : 'bg-white/3 border-white/5 text-white/50 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <Heart className={`w-3 h-3 ${isLiked ? 'fill-rose-400 text-rose-400 animate-bounce' : ''}`} />
                        <span>{item.likes}</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-white/50 leading-relaxed font-sans">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between border-t border-white/5 pt-2.5 text-[9px] font-mono text-white/30">
                      <div className="flex items-center gap-1.5">
                        {item.authorPhoto ? (
                          <img 
                            src={item.authorPhoto} 
                            referrerPolicy="no-referrer"
                            alt={item.authorName} 
                            className="w-4 h-4 rounded-full border border-white/10"
                          />
                        ) : (
                          <User className="w-3 h-3 text-zinc-500" />
                        )}
                        <span className="text-white/45 font-semibold">{item.authorName}</span>
                      </div>
                      
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-bold uppercase tracking-wider">Under Review</span>
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

    </div>
  );
};
