import React, { useState, useEffect } from 'react';
import { 
  Bot, Send, MessageSquare, Bug, CheckCircle2, Clock, Trash2, 
  Filter, User, Mail, AlertTriangle, ShieldCheck, RefreshCw, ChevronRight, Gamepad2,
  HelpCircle, Activity, Rss, ShieldAlert, Cpu, Terminal, ExternalLink, Copy
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { 
  collection, query, orderBy, onSnapshot, doc, setDoc, updateDoc, deleteDoc, where 
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';

interface SupportHubProps {
  sessionUser: any;
  isDevOrOwner: boolean;
  triggerToast: (msg: string) => void;
  theme: 'studio-light' | 'studio-dark' | 'neon' | 'ultradark';
  activeSubTab: 'reporter' | 'faq' | 'network' | 'creator-inbox';
  onImportScriptToSandbox?: (code: string) => void;
}

interface BugTicket {
  id: string;
  email: string;
  category: string;
  description: string;
  createdAt: string;
  status: 'Pending' | 'Investigating' | 'Resolved';
  ownerResponse?: string;
  gameName?: string;
}

export function SupportHub({ sessionUser, isDevOrOwner, triggerToast, theme, activeSubTab, onImportScriptToSandbox }: SupportHubProps) {
  const isUltradark = theme === 'studio-dark' || theme === 'ultradark' || theme === 'neon';

  // Support Bot Form States
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedGame, setSelectedGame] = useState<string>('General Hub');
  const [bugCategory, setBugCategory] = useState<string>('Anti-cheat Bypass Fail');
  const [userEmail, setUserEmail] = useState<string>(sessionUser?.email || '');
  const [bugDescription, setBugDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Markdown code parser for AI responses
  const renderMessageText = (text: string) => {
    // Regex to split text by markdown code blocks
    const parts = text.split(/(```[a-zA-Z]*[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        const lines = part.split('\n');
        const firstLine = lines[0] || '```lua';
        const language = firstLine.replace('```', '').trim() || 'lua';
        const code = lines.slice(1, -1).join('\n');
        return (
          <div key={index} className="mt-2 rounded-xl overflow-hidden border border-white/10 bg-black/80 font-mono text-xs w-full">
            <div className="flex items-center justify-between px-3 py-1.5 bg-white/5 border-b border-white/5 text-[9px] text-zinc-400 font-mono font-bold uppercase tracking-wider">
              <span>{language} draft outline</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(code);
                    triggerToast('Code copied to clipboard!');
                  }}
                  className="hover:text-white transition-colors bg-transparent border-none cursor-pointer flex items-center gap-1 text-[9px] text-zinc-400 font-bold"
                >
                  <Copy className="w-3 h-3 text-zinc-400" />
                  Copy
                </button>
                {onImportScriptToSandbox && (
                  <button
                    type="button"
                    onClick={() => onImportScriptToSandbox(code)}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors bg-transparent border-none cursor-pointer flex items-center gap-1 text-[9px] font-bold"
                  >
                    <Terminal className="w-3 h-3 text-cyan-400" />
                    Load Sandbox
                  </button>
                )}
              </div>
            </div>
            <pre className="p-3 overflow-x-auto text-emerald-400 font-mono text-[10px] leading-relaxed max-h-[180px] bg-[#050508]/90">
              <code>{code}</code>
            </pre>
          </div>
        );
      }
      return <p key={index} className="whitespace-pre-wrap leading-relaxed text-zinc-200">{part}</p>;
    });
  };

  // Chat Bot States
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; timestamp: Date }>>([
    {
      role: 'assistant',
      text: "Hello! I am ZeroHub's official AI Support & Script Request Agent. Are you looking to request an update for an existing game script, or want us to add a brand new game script? Let me know the game name and the features you want added! Type your request details here, then use the form on the right to officially submit it to the owner account.",
      timestamp: new Date()
    }
  ]);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [isSendingToAI, setIsSendingToAI] = useState<boolean>(false);

  const handleSendChatMessage = async () => {
    if (!currentInput.trim()) return;
    const userText = currentInput.trim();
    setCurrentInput('');
    
    // Append user message
    const updatedMessages = [
      ...chatMessages,
      { role: 'user' as const, text: userText, timestamp: new Date() }
    ];
    setChatMessages(updatedMessages);
    setIsSendingToAI(true);

    try {
      const res = await fetch('/api/support-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({
            role: m.role,
            text: m.text
          }))
        })
      });
      const data = await res.json();
      if (data.text) {
        setChatMessages(prev => [
          ...prev,
          { role: 'assistant' as const, text: data.text, timestamp: new Date() }
        ]);
        
        // Auto prefill description if empty
        setBugDescription(prev => {
          if (!prev.trim()) {
            return `Requesting update/addition: ${userText}`;
          }
          return prev;
        });
      } else if (data.error) {
        throw new Error(data.error);
      }
    } catch (err: any) {
      console.error(err);
      setChatMessages(prev => [
        ...prev,
        { role: 'assistant' as const, text: "Apologies, I encountered a communication error with our server. Feel free to fill in the 'Submit Request' form directly!", timestamp: new Date() }
      ]);
    } finally {
      setIsSendingToAI(false);
    }
  };

  // Tickets List & Owner Console States
  const [tickets, setTickets] = useState<BugTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<BugTicket | null>(null);
  const [ownerReplyText, setOwnerReplyText] = useState<string>('');
  const [ownerStatusSelect, setOwnerStatusSelect] = useState<'Pending' | 'Investigating' | 'Resolved'>('Investigating');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Investigating' | 'Resolved'>('All');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // FAQ Expanded index state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Auto-fill email when user state loads
  useEffect(() => {
    if (sessionUser?.email) {
      setUserEmail(sessionUser.email);
    }
  }, [sessionUser]);

  // Load Support Tickets in Real-Time
  useEffect(() => {
    // If not loaded/ready, wait or don't query
    if (!isDevOrOwner && !sessionUser?.email) {
      setTickets([]);
      setIsLoading(false);
      return;
    }

    const baseRef = collection(db, 'support_tickets');
    const q = isDevOrOwner 
      ? query(baseRef, orderBy('createdAt', 'desc'))
      : query(baseRef, where('email', '==', sessionUser.email), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ticketsData: BugTicket[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        ticketsData.push({
          id: doc.id,
          email: data.email || 'anonymous@zerohub.net',
          category: data.category || 'General Bug',
          description: data.description || '',
          createdAt: data.createdAt || new Date().toISOString(),
          status: data.status || 'Pending',
          ownerResponse: data.ownerResponse || '',
          gameName: data.gameName || 'General Hub',
        });
      });
      setTickets(ticketsData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error reading support tickets: ", error);
      setIsLoading(false);
      handleFirestoreError(error, OperationType.LIST, 'support_tickets');
    });

    return () => unsubscribe();
  }, [sessionUser, isDevOrOwner]);

  // Filter tickets for Owner Inbox or Personal User History
  const displayedTickets = tickets.filter(ticket => {
    // If not owner, only see own tickets matching logged in email
    if (!isDevOrOwner) {
      const userMailLower = sessionUser?.email?.toLowerCase();
      return userMailLower && ticket.email.toLowerCase() === userMailLower;
    }
    // If owner, apply selected filter status
    if (filterStatus === 'All') return true;
    return ticket.status === filterStatus;
  });

  // Reset Support Bot Steps
  const resetBot = () => {
    setStep(1);
    setBugDescription('');
  };

  // Submit Bug Report
  const handleBotSubmit = async () => {
    if (!bugDescription.trim()) {
      triggerToast("Please describe the issue first!");
      return;
    }
    if (!userEmail.trim()) {
      triggerToast("Please provide a contact email!");
      return;
    }

    setIsSubmitting(true);
    const ticketId = `ticket_${Date.now()}`;

    try {
      await setDoc(doc(db, 'support_tickets', ticketId), {
        id: ticketId,
        email: userEmail.trim(),
        category: bugCategory,
        gameName: selectedGame,
        description: bugDescription.trim(),
        createdAt: new Date().toISOString(),
        status: 'Pending',
        ownerResponse: ''
      });

      triggerToast("Bug report submitted successfully to the Creator Console!");
      setStep(4);
    } catch (err: any) {
      console.error(err);
      triggerToast("Failed to submit ticket. Ensure you are signed in.");
      handleFirestoreError(err, OperationType.CREATE, `support_tickets/${ticketId}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Developer Answer (Owner Only)
  const handleOwnerResponse = async (ticketId: string) => {
    if (!ownerReplyText.trim()) {
      triggerToast("Response text cannot be empty.");
      return;
    }

    try {
      await updateDoc(doc(db, 'support_tickets', ticketId), {
        status: ownerStatusSelect,
        ownerResponse: ownerReplyText.trim()
      });
      triggerToast("Ticket updated & resolution logged successfully!");
      setOwnerReplyText('');
      setSelectedTicket(null);
    } catch (err: any) {
      console.error(err);
      triggerToast("Failed to update support ticket.");
      handleFirestoreError(err, OperationType.UPDATE, `support_tickets/${ticketId}`);
    }
  };

  // Delete Ticket (Owner Only)
  const handleDeleteTicket = async (ticketId: string) => {
    if (!confirm("Are you sure you want to dismiss and delete this support report?")) return;
    try {
      await deleteDoc(doc(db, 'support_tickets', ticketId));
      triggerToast("Ticket successfully deleted.");
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(null);
      }
    } catch (err: any) {
      console.error(err);
      triggerToast("Failed to delete ticket.");
      handleFirestoreError(err, OperationType.DELETE, `support_tickets/${ticketId}`);
    }
  };

  const faqChannels = [
    {
      q: "⚡ How do I run and execute the loader scripts?",
      a: "Copy the loadstring command completely from our Directory tab, then paste it into any Roblox Level 7+ Executor (such as Solara, Wave, Codex, Delta, Hydrogen, or Celery) and press 'Execute'. The graphical ZeroHub overlay panel will immediately initialize in-game.",
      cat: "Execution"
    },
    {
      q: "🛡️ What should I do if the anti-cheat kicks me?",
      a: "Immediately turn off high-risk options such as 'Instant Kill' or 'Infinite Jump Fly' if playing on competitive servers. Turn on 'Legit Mode' and use our anti-detection script toggles. If Byfron kicks you persistently, clear your temporary Roblox cache and wait for our bypass server updates.",
      cat: "Bypass"
    },
    {
      q: "🌀 Why isn't the script menu opening?",
      a: "Check if your Roblox executor's DLL has injected successfully first. If your client injected but the script won't run, the script loadstring URL might be experiencing anti-DDOS protection. Retry in 1-2 minutes or check the Live Network feed tab for CDN status.",
      cat: "UI Glitch"
    },
    {
      q: "🔑 Are the scripts completely keyless and free?",
      a: "Yes! All scripts indexed on ZeroHub, including Vape V4 Roblox, Bedwars Bypass, and Blox Fruits, are 100% keyless and open-source. We do not use annoying linkvertise redirects or premium monetization blockers.",
      cat: "Pricing"
    }
  ];

  const networkServices = [
    { name: "ZeroHub script delivery CDN", status: "Operational", ping: "42ms", color: "bg-emerald-400" },
    { name: "Roblox Loadstring Registry Host", status: "Operational", ping: "26ms", color: "bg-emerald-400" },
    { name: "Byfron / Hyperion Anti-cheat bypass module", status: "Under Maintenance (Safe mode active)", ping: "135ms", color: "bg-amber-400" },
    { name: "Vape V4 premium custom assets cache", status: "Operational", ping: "18ms", color: "bg-emerald-400" },
    { name: "Secure Firestore ticket database sync", status: "Operational", ping: "55ms", color: "bg-emerald-400" }
  ];

  const liveFeeds = [
    {
      title: "🛡️ Byfron Hotfix Deployed",
      time: "2 hours ago",
      desc: "An updated anti-detection bypass patch has been automatically deployed to the Roblox Bedwars script loadstring. Re-executing now is completely safe!"
    },
    {
      title: "⚡ Vape V4 Roblox Optimized",
      time: "1 day ago",
      desc: "Optimized drawing loops for ESP and Silent Aim, boosting gameplay framerates by over 25% on mid-range computers and mobile executors."
    },
    {
      title: "🌀 ZeroHub Executor Release v2.4",
      time: "3 days ago",
      desc: "Added keybind manager custom profiles, and fixed a slider state issue where jump power would occasionally reset on server teleport."
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn" id="support-hub-container">
      {/* 1. Support Sentinel Bot Tab */}
      {activeSubTab === 'reporter' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            
            {/* Left Column: Conversational AI Chat Bot */}
            <div className={`lg:col-span-3 p-5 rounded-3xl border text-left flex flex-col h-[550px] ${
              isUltradark 
                ? 'bg-zinc-950/85 border-zinc-800' 
                : 'bg-black/45 border-cyan-500/15 shadow-[0_0_25px_rgba(6,182,212,0.03)]'
            }`}>
              {/* Bot Header */}
              <div className="flex items-center gap-3 border-b border-white/5 pb-4 shrink-0">
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/35 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-emerald-400 animate-pulse" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-black rounded-full animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider font-mono text-emerald-400 flex items-center gap-1.5">
                    Sentinel-1 Support Bot
                  </h3>
                  <p className="text-[10px] text-white/50 font-sans leading-relaxed">AI Assistant for script additions & updates</p>
                </div>
              </div>

              {/* Chat Message Box */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 font-sans text-xs scrollbar-thin">
                {chatMessages.map((msg, i) => (
                  <div 
                    key={i} 
                    className={`flex gap-3 max-w-[85%] ${
                      msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 text-emerald-400" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-cyan-400" />
                      </div>
                    )}
                    <div className={`p-3 rounded-2xl border text-xs leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-100 rounded-tr-none' 
                        : 'bg-zinc-900/50 border-white/5 text-zinc-200 rounded-tl-none'
                    }`}>
                      {msg.role === 'assistant' ? renderMessageText(msg.text) : <p className="whitespace-pre-wrap text-cyan-100">{msg.text}</p>}
                      <span className="text-[8px] text-white/20 block mt-1 text-right font-mono">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}

                {isSendingToAI && (
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-emerald-400 animate-spin" />
                    </div>
                    <div className="p-3.5 rounded-2xl border border-white/5 bg-zinc-900/40 text-zinc-400 rounded-tl-none flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                      <span>Thinking...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="border-t border-white/5 pt-3 mt-auto shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendChatMessage();
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    placeholder="Ask to update a script, e.g. Add auto-farm to Bedwars..."
                    disabled={isSendingToAI}
                    className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50 placeholder-white/30"
                  />
                  <button
                    type="submit"
                    disabled={isSendingToAI || !currentInput.trim()}
                    className="p-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-black rounded-2xl flex items-center justify-center transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column: Dispatch request directly to Developer / Owner */}
            <div className={`lg:col-span-2 p-5 rounded-3xl border text-left flex flex-col justify-between ${
              isUltradark 
                ? 'bg-zinc-950/85 border-zinc-800' 
                : 'bg-black/45 border-amber-500/15 shadow-[0_0_25px_rgba(245,158,11,0.02)]'
            }`}>
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                  <ShieldCheck className="w-4.5 h-4.5 text-amber-400 animate-pulse" />
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider font-mono text-amber-400 font-bold">Creator Dispatch Center</h3>
                    <p className="text-[10px] text-white/50 leading-relaxed">Sends request directly to developer/owner accounts</p>
                  </div>
                </div>

                {/* Form fields */}
                {step !== 4 ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[9px] font-mono text-white/40 uppercase mb-1">Select Roblox Game</label>
                      <select
                        value={selectedGame}
                        onChange={(e) => setSelectedGame(e.target.value)}
                        className="w-full bg-black/45 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                      >
                        {['General Hub', 'Vape V4 Roblox', 'Universal Bypass', 'Bedwars Bypass', 'Blox Fruits', 'Arsenal Suite'].map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono text-white/40 uppercase mb-1">Request Category</label>
                      <select
                        value={bugCategory}
                        onChange={(e) => setBugCategory(e.target.value)}
                        className="w-full bg-black/45 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                      >
                        <option value="✨ Script Addition Request">✨ Script Addition Request</option>
                        <option value="🔄 Script Update / Upgrade">🔄 Script Update / Upgrade</option>
                        <option value="🛡️ Anti-cheat Bypass Repair">🛡️ Anti-cheat Bypass Repair</option>
                        <option value="🌀 General Bug/Glitch report">🌀 General Bug/Glitch report</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono text-white/40 uppercase mb-1">Your Contact Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 w-3.5 h-3.5 text-white/30" />
                        <input
                          type="email"
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                          placeholder="your-email@gmail.com"
                          className="w-full pl-9 pr-4 py-2 bg-black/45 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50 placeholder-white/30"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono text-white/40 uppercase mb-1">Detailed Request Description</label>
                      <textarea
                        value={bugDescription}
                        onChange={(e) => setBugDescription(e.target.value)}
                        placeholder="Please write down exactly what features you want the developer to add or update..."
                        rows={5}
                        className="w-full p-3 bg-black/45 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50 resize-none font-sans"
                      />
                      <span className="text-[9px] text-white/30 font-mono italic mt-1 block leading-normal">
                        Tip: You can chat with our AI Support Agent on the left to clarify your request features, and then submit!
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleBotSubmit}
                      disabled={isSubmitting || !bugDescription.trim() || !userEmail.trim()}
                      className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 disabled:opacity-40 text-black text-xs font-mono font-black uppercase rounded-xl tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {isSubmitting ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      Submit Request to Creator
                    </button>
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6 space-y-4">
                    <div className="w-12 h-12 bg-amber-500/10 border border-amber-400/30 rounded-full flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                      <CheckCircle2 className="w-6 h-6 text-amber-400 animate-bounce" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase text-amber-300 font-mono tracking-widest">Dispatched Successfully</h4>
                      <p className="text-[10px] text-white/55 font-sans mt-1 max-w-sm mx-auto leading-relaxed">
                        Your script update request was compiled and written directly into our secure cloud databases. The developer can view it on their private Creator console inbox.
                      </p>
                    </div>
                    <button
                      onClick={resetBot}
                      className="px-4 py-2 bg-black/30 hover:bg-black/60 border border-white/10 text-white text-[10px] font-mono font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      File Another Request
                    </button>
                  </motion.div>
                )}
              </div>

              {/* Secure note */}
              <div className="bg-black/40 border border-white/5 p-3 rounded-2xl flex items-start gap-2.5 mt-4">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[9px] text-white/40 font-mono leading-normal">
                  ADMIN POLICY: All dispatched script and bypass requests are completely secured and automatically hidden for non-developers/owners. Your private communication remains fully encrypted.
                </p>
              </div>
            </div>

          </div>

          {/* User History: "Your Reported Bugs / Requests" */}
          <div className={`p-6 rounded-3xl border text-left space-y-4 ${
            isUltradark ? 'bg-zinc-950/80 border-zinc-800' : 'bg-black/40 border-cyan-500/15'
          }`}>
            <h4 className="text-[10px] text-white/50 uppercase tracking-widest font-mono font-extrabold flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              Your Active Requests History
            </h4>

            {displayedTickets.length === 0 ? (
              <div className="bg-black/25 rounded-2xl border border-white/5 p-4 text-center font-mono text-[10px] text-zinc-500">
                You haven't filed any requests using your logged in account email yet. Chat with Sentinel and submit a request to get started!
              </div>
            ) : (
              <div className="space-y-3">
                {displayedTickets.map((ticket) => (
                  <div key={ticket.id} className="bg-black/30 border border-white/5 rounded-2xl p-4 space-y-2 animate-fadeIn">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20 mr-1.5">
                          {ticket.gameName}
                        </span>
                        <span className="text-[9px] font-mono text-white/40">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                      </div>
                      <span className={`text-[8px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                        ticket.status === 'Resolved' 
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' 
                          : ticket.status === 'Investigating'
                          ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>

                    <div className="text-[11px] font-mono font-extrabold text-white">{ticket.category}</div>
                    
                    {/* Secure Shielded Contact Mail Indicator */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-mono text-zinc-500 bg-white/[0.02] border border-white/[0.04] p-1.5 px-2 rounded-lg mt-1 w-fit select-none">
                      <Mail className="w-3 h-3 text-white/30" />
                      <span>Contact Email:</span>
                      <span className="text-zinc-300 font-bold tracking-wide font-mono">
                        {isDevOrOwner 
                          ? ticket.email 
                          : `${ticket.email.split('@')[0].slice(0, 2)}***@${ticket.email.split('@')[1] || 'domain.com'}`}
                      </span>
                      <span className={`text-[8px] px-1 py-0.2 rounded font-black uppercase shrink-0 ${
                        isDevOrOwner 
                          ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20' 
                          : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 animate-pulse'
                      }`}>
                        {isDevOrOwner ? 'Owner View' : '🛡️ Protected'}
                      </span>
                    </div>

                    <p className="text-xs text-white/60 leading-relaxed font-sans mt-2">{ticket.description}</p>

                    {ticket.ownerResponse && (
                      <div className="mt-3 bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl space-y-1">
                        <div className="text-[9px] font-mono font-extrabold text-emerald-400 uppercase flex items-center gap-1">
                          <Bot className="w-3 h-3" />
                          <span>Owner/Developer Feedback:</span>
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed font-sans">{ticket.ownerResponse}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Discord Server Coming Soon Panel */}
          <div className={`p-6 rounded-3xl border text-left flex flex-col sm:flex-row items-center justify-between gap-4 ${
            isUltradark ? 'bg-zinc-950/80 border-zinc-800' : 'bg-black/40 border-indigo-500/15'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center">
                <Mail className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider font-mono text-indigo-400">Official Discord Server</h4>
                <p className="text-[11px] text-white/55 font-sans leading-relaxed">
                  We might launch an official Discord community server later after publishing ZeroHub! Stay tuned.
                </p>
              </div>
            </div>
            <button 
              disabled 
              className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[10px] font-bold text-indigo-300/40 font-mono uppercase cursor-not-allowed shrink-0"
            >
              Coming Soon
            </button>
          </div>
        </div>
      )}

      {/* 2. Quick Fixes & FAQ Tab */}
      {activeSubTab === 'faq' && (
        <div className={`p-6 rounded-3xl border text-left space-y-5 ${
          isUltradark ? 'bg-zinc-950/80 border-zinc-800' : 'bg-black/40 border-cyan-500/15'
        }`}>
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <HelpCircle className="w-4.5 h-4.5 text-cyan-400" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-cyan-300">Quick Fixes & Execution FAQ</h4>
              <p className="text-[10px] text-white/40">Resolve common injection and loader warnings instantly</p>
            </div>
          </div>

          <div className="space-y-3">
            {faqChannels.map((item, idx) => (
              <div 
                key={idx} 
                className="border border-white/5 rounded-2xl bg-black/35 hover:bg-black/50 transition-all overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full p-4 flex items-center justify-between text-left focus:outline-none cursor-pointer"
                >
                  <div className="space-y-1 pr-3">
                    <span className="text-[9px] font-mono font-black text-cyan-400 uppercase bg-cyan-400/10 border border-cyan-400/20 px-2 py-0.5 rounded-lg">
                      {item.cat}
                    </span>
                    <div className="text-[11px] font-mono font-black text-white">{item.q}</div>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-white/30 shrink-0 transition-transform ${expandedFaq === idx ? 'rotate-90 text-cyan-400' : ''}`} />
                </button>

                <AnimatePresence>
                  {expandedFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/5 bg-black/20"
                    >
                      <div className="p-4 text-xs text-white/70 leading-relaxed font-sans font-medium">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          <div className="bg-cyan-500/5 border border-cyan-500/10 p-4 rounded-2xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-[11px]">
              <p className="font-mono text-cyan-300 font-extrabold uppercase">Executor Compatibility Guard</p>
              <p className="text-white/50 font-sans mt-1 leading-relaxed">
                ZeroHub's loadstring relies on Luau compilation. It is heavily tested on <span className="text-white font-bold">Solara v3, Wave Emulator, Delta Mobile, and Codex Client</span>. Legacy injectors may experience stack overflow issues.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Network Status & Newsfeed Tab */}
      {activeSubTab === 'network' && (
        <div className={`p-6 rounded-3xl border text-left space-y-6 ${
          isUltradark ? 'bg-zinc-950/80 border-zinc-800' : 'bg-black/40 border-cyan-500/15'
        }`}>
          
          {/* Network Grid */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <Activity className="w-4.5 h-4.5 text-purple-400" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-purple-300">Live Network Services</h4>
                <p className="text-[10px] text-white/40">Real-time status check of bypass servers & CDNs</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {networkServices.map((srv, idx) => (
                <div key={idx} className="bg-black/35 border border-white/5 p-3.5 rounded-2xl flex items-center justify-between animate-fadeIn">
                  <div className="space-y-1">
                    <p className="text-[11px] font-mono font-bold text-white leading-tight">{srv.name}</p>
                    <p className="text-[9px] font-mono text-white/40">Latency metric: <span className="text-purple-400 font-bold">{srv.ping}</span></p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 pl-2">
                    <span className={`w-2 h-2 rounded-full ${srv.color} animate-pulse`} />
                    <span className="text-[9px] font-mono text-white/70 font-black uppercase">{srv.status.split(' ')[0]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Feeds / Newsfeed */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <Rss className="w-4.5 h-4.5 text-emerald-400 animate-bounce" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-emerald-300">Creator Broadcast & Patch Channel</h4>
                <p className="text-[10px] text-white/40">Official announcements directly from developers</p>
              </div>
            </div>

            <div className="space-y-3">
              {liveFeeds.map((feed, idx) => (
                <div key={idx} className="bg-black/20 hover:bg-black/40 border border-white/5 rounded-2xl p-4 transition-all">
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="text-[11px] font-mono font-black text-white">{feed.title}</h5>
                    <span className="text-[9px] font-mono text-white/35 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-400" />
                      {feed.time}
                    </span>
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed font-sans mt-2">{feed.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Creator Bug Inbox Tab (Only visible to verified Owner) */}
      {activeSubTab === 'creator-inbox' && isDevOrOwner && (
        <div className={`p-6 rounded-3xl border text-left relative overflow-hidden ${
          isUltradark 
            ? 'bg-zinc-950/80 border-zinc-800' 
            : 'bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20 shadow-[0_0_25px_rgba(245,158,11,0.03)]'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">👑</span>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider font-mono text-amber-400">Creator Bug Inbox</h3>
                <p className="text-[10px] text-white/50">Manage submitted support channels</p>
              </div>
            </div>
            <span className="text-[9px] font-mono font-black text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-xl animate-pulse">
              SECURE CONSOLE
            </span>
          </div>

          {/* Owner Console UI */}
          <div className="space-y-4">
            {/* Filter Tabs */}
            <div className="flex gap-1.5 bg-black/45 p-1 rounded-xl border border-white/5">
              {(['All', 'Pending', 'Investigating', 'Resolved'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`flex-1 py-1.5 text-[9px] font-mono font-black uppercase rounded-lg transition-all cursor-pointer ${
                    filterStatus === status 
                      ? 'bg-amber-400 text-black font-extrabold shadow-sm' 
                      : 'text-white/40 hover:text-white/80'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Tickets List */}
            {isLoading ? (
              <div className="text-center py-6">
                <RefreshCw className="w-5 h-5 text-amber-400 animate-spin mx-auto" />
              </div>
            ) : displayedTickets.length === 0 ? (
              <div className="bg-black/25 rounded-2xl border border-white/5 p-6 text-center font-mono text-[10px] text-zinc-500">
                No tickets found matching current filter "{filterStatus}".
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {displayedTickets.map(ticket => (
                  <div 
                    key={ticket.id}
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setOwnerReplyText(ticket.ownerResponse || '');
                      setOwnerStatusSelect(ticket.status);
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left relative ${
                      selectedTicket?.id === ticket.id 
                        ? 'bg-amber-400/10 border-amber-400/40' 
                        : 'bg-black/35 border-white/5 hover:border-white/10 hover:bg-black/50'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-1">
                      <span className="text-[10px] font-mono font-black text-amber-300 max-w-[180px] truncate">
                        {ticket.email}
                      </span>
                      <div className="flex gap-1">
                        <span className={`text-[8px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded-lg ${
                          ticket.status === 'Resolved' 
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' 
                            : ticket.status === 'Investigating'
                            ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                        }`}>
                          {ticket.status}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTicket(ticket.id);
                          }}
                          className="p-1 rounded bg-zinc-900 border border-white/5 text-zinc-400 hover:text-rose-400 cursor-pointer"
                          title="Delete Ticket"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="text-[10px] font-mono text-white/50 mt-1">
                      Game: <span className="text-white font-bold">{ticket.gameName}</span> | Category: <span className="text-white font-bold">{ticket.category}</span>
                    </div>

                    <p className="text-[11px] text-white/70 line-clamp-2 mt-2 font-sans">{ticket.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Resolution / Details Section */}
            <AnimatePresence>
              {selectedTicket && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="bg-black/45 border border-amber-500/20 rounded-2xl p-4 mt-3 space-y-3 relative z-10 text-left"
                >
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-[10px] font-mono font-black text-amber-400 uppercase">Write Developer Feedback</span>
                    <button 
                      onClick={() => setSelectedTicket(null)}
                      className="text-[10px] text-white/40 hover:text-white font-mono cursor-pointer"
                    >
                      [Close]
                    </button>
                  </div>

                  <div className="text-xs space-y-1.5">
                    <p className="font-mono text-[10px] text-white/40">
                      Reporting Account: <span className="text-white font-bold">{selectedTicket.email}</span>
                    </p>
                    <p className="text-xs text-white/90 leading-relaxed font-sans italic bg-black/30 p-2.5 rounded-xl border border-white/5">
                      "{selectedTicket.description}"
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 items-center">
                      <div>
                        <label className="block text-[9px] font-mono text-white/40 uppercase mb-1">Set Resolution Status</label>
                        <select
                          value={ownerStatusSelect}
                          onChange={(e) => setOwnerStatusSelect(e.target.value as any)}
                          className="w-full bg-zinc-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500/50"
                        >
                          <option value="Pending">Pending Review</option>
                          <option value="Investigating">Investigating</option>
                          <option value="Resolved">Resolved & Fixed</option>
                        </select>
                      </div>
                      <div className="pt-4 text-right">
                        <span className="text-[9px] font-mono text-zinc-400">
                          ID: {selectedTicket.id}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono text-white/40 uppercase mb-1">Quick Reply Templates</label>
                      <div className="flex flex-wrap gap-1.5 mb-2.5">
                        {[
                          { label: '🛠️ Sandbox Draft', text: 'We drafted a secure Lua script template for you! Click the "Load Sandbox" button in our AI Sentinel Chat message above to test, execute, or build on it.', status: 'Resolved' },
                          { label: '🔍 Needs Logs', text: 'We have received your report but require more details. Please copy-paste your Roblox executor exploit console logs or tell us which mobile/PC client you run.', status: 'Investigating' },
                          { label: '✅ Script Updated', text: 'Great news! Our developers updated the bypass patch for this script. It is now 100% active, undetected, and running live again. Thanks for reporting!', status: 'Resolved' },
                          { label: '🌀 Reviewing Request', text: 'Your request is officially in our system queue and is currently being audited by the development team. Stay tuned for changes!', status: 'Investigating' }
                        ].map((tpl) => (
                          <button
                            key={tpl.label}
                            type="button"
                            onClick={() => {
                              setOwnerReplyText(tpl.text);
                              setOwnerStatusSelect(tpl.status as any);
                              triggerToast(`Loaded template: ${tpl.label}`);
                            }}
                            className="text-[9px] font-mono font-bold bg-white/5 hover:bg-amber-400 hover:text-black border border-white/5 text-zinc-300 rounded-lg px-2 py-1 transition-all cursor-pointer"
                          >
                            {tpl.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono text-white/40 uppercase mb-1">Resolution Response / Answer</label>
                      <textarea
                        required
                        value={ownerReplyText}
                        onChange={(e) => setOwnerReplyText(e.target.value)}
                        placeholder="Type your response to the user here. They will see it live on their history log..."
                        rows={3}
                        className="w-full p-2.5 text-xs rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-amber-500/50 resize-none font-sans"
                      />
                    </div>

                    <button
                      onClick={() => handleOwnerResponse(selectedTicket.id)}
                      className="w-full py-2 bg-amber-400 hover:bg-amber-500 text-black text-xs font-mono font-black uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Dispatch Resolution Feedback
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
