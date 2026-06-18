import React, { useState } from 'react';
import { 
  X, Mail, Lock, User, Sparkles, AlertCircle, Eye, EyeOff, 
  LogIn, UserPlus, Database, ArrowRight, ShieldAlert, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, googleProvider } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  signInWithPopup 
} from 'firebase/auth';

interface AuthModalProps {
  onClose: () => void;
  onSandboxLogin: () => void;
  triggerToast: (msg: string) => void;
  theme: 'neon' | 'ultradark';
}

export function AuthModal({ onClose, onSandboxLogin, triggerToast, theme }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Extra features
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const isUltradark = theme === 'ultradark';

  // Handle Google OAuth popup with smart iframe recovery
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await signInWithPopup(auth, googleProvider);
      triggerToast("Successfully connected to Google Cloud Auth!");
      onClose();
    } catch (err: any) {
      console.error("Google Auth Popup error:", err);
      // Construct a very helpful message for iframe blockages
      setErrorMessage(
        "Google popup block detected. This occurs when running inside an iframe workspace. " +
        "Please click 'Open App in New Tab' at the top right of your browser, or log in with our local 'Sandbox / Guest Mode' below."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Email & Password login
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      triggerToast("Logged in securely!");
      onClose();
    } catch (err: any) {
      let friendlyError = err.message;
      if (err.code === 'auth/invalid-credential') friendlyError = "Invalid email or password.";
      else if (err.code === 'auth/invalid-email') friendlyError = "Please enter a valid email address.";
      else if (err.code === 'auth/user-not-found') friendlyError = "No account found with this email.";
      else if (err.code === 'auth/wrong-password') friendlyError = "Incorrect password.";
      
      setErrorMessage(friendlyError);
    } finally {
      setIsLoading(false);
    }
  };

  // Email & Password signup
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !displayName) return;
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }
    
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      triggerToast(`Welcome to Zero, ${displayName}!`);
      onClose();
    } catch (err: any) {
      let friendlyError = err.message;
      if (err.code === 'auth/email-already-in-use') friendlyError = "An account with this email already exists.";
      else if (err.code === 'auth/weak-password') friendlyError = "Password is too weak. Must be at least 6 characters.";
      
      setErrorMessage(friendlyError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/60">
      {/* Container Motion Wrapper */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`w-full max-w-md overflow-hidden rounded-3xl border transition-all duration-300 relative shadow-[0_24px_64px_rgba(0,0,0,0.8)] ${
          isUltradark 
            ? 'bg-zinc-950 border-zinc-750 text-zinc-100' 
            : 'bg-zinc-950/95 border-cyan-500/30 text-white'
        }`}
      >
        {/* Glow visual decoration if neon theme */}
        {!isUltradark && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-cyan-500/10 blur-3xl pointer-events-none rounded-full" />
        )}

        {/* Modal Header */}
        <div className="p-6 pb-2 flex items-center justify-between border-b border-white/5 relative z-10">
          <div className="flex items-center gap-2">
            <span className={`p-1.5 rounded-lg ${isUltradark ? 'bg-zinc-800' : 'bg-cyan-500/10 border border-cyan-400/20'}`}>
              <Database className={`w-4 h-4 ${isUltradark ? 'text-white' : 'text-cyan-400'}`} />
            </span>
            <div>
              <h3 className="font-extrabold text-sm tracking-wide uppercase font-mono">Zero Account</h3>
              <p className="text-[10px] text-zinc-400 font-mono tracking-tight">Sync game sliders securely to Firestore</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 relative z-10">
          {/* Main Tabs */}
          <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5 mb-6">
            <button
              onClick={() => { setActiveTab('login'); setErrorMessage(null); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'login'
                  ? isUltradark 
                    ? 'bg-zinc-800 text-white' 
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/25 shadow-[0_0_12px_rgba(6,182,212,0.1)] font-extrabold'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </button>
            <button
              onClick={() => { setActiveTab('signup'); setErrorMessage(null); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'signup'
                  ? isUltradark 
                    ? 'bg-zinc-800 text-white' 
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/25 shadow-[0_0_12px_rgba(6,182,212,0.1)] font-extrabold'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Register
            </button>
          </div>

          {/* Social Sign-In (Google Auth) */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className={`w-full py-3 mb-5 rounded-2xl border flex items-center justify-center gap-2.5 text-xs font-bold transition-all cursor-pointer select-none active:scale-95 ${
              isUltradark 
                ? 'bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800' 
                : 'bg-white hover:bg-zinc-100 border-white text-zinc-950 font-mono font-extrabold shadow-[0_4px_12px_rgba(255,255,255,0.05)]'
            }`}
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22-.04-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Sign In with Google Cloud
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-[1px] bg-white/5" />
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">Or use email credential</span>
            <div className="flex-1 h-[1px] bg-white/5" />
          </div>

          {/* Error Message Box */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-5 bg-rose-500/10 border border-rose-500/20 p-3 rounded-2xl flex items-start gap-2 text-[10px]"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="text-zinc-300 leading-relaxed font-sans">{errorMessage}</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Forms */}
          {activeTab === 'login' ? (
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@voidware.net"
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/25 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/25 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-zinc-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold cursor-pointer transition-all active:scale-95 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                } ${
                  isUltradark 
                    ? 'bg-white text-black hover:bg-zinc-200' 
                    : 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white hover:brightness-110 shadow-[0_4px_16px_rgba(6,182,212,0.25)]'
                }`}
              >
                <span>Authorize Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleEmailSignUp} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">Display Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Arian"
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/25 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@voidware.net"
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/25 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">Password (Min. 6 chars)</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/25 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/25 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold cursor-pointer transition-all active:scale-95 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                } ${
                  isUltradark 
                    ? 'bg-white text-black hover:bg-zinc-200' 
                    : 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white hover:brightness-110 shadow-[0_4px_16px_rgba(6,182,212,0.25)]'
                }`}
              >
                <span>Create Secure Account</span>
                <Sparkles className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Secure Guest Offline Sandbox Option */}
          <div className="mt-6 pt-5 border-t border-white/5 space-y-3">
            <div className="text-center">
              <span className="text-[10px] text-zinc-500 font-sans">Popup blocked or prefer keeping data locally?</span>
            </div>
            <button
              onClick={() => {
                onSandboxLogin();
                onClose();
              }}
              className="w-full py-2.5 rounded-xl border border-dashed border-zinc-750 hover:bg-zinc-900 text-zinc-300 text-[11px] font-mono flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-zinc-500" />
              <span>Bypass with Sandbox Session</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
