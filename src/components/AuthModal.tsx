import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight, RotateCcw, Briefcase, User as UserIcon } from 'lucide-react';
import {
  auth, googleProvider, signInWithPopup, db,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  sendPasswordResetEmail
} from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Mode = 'signin' | 'signup' | 'reset' | 'role';

async function ensureUserDoc(user: { uid: string; email: string | null; displayName: string | null; photoURL: string | null }) {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref).catch(() => null);
  if (!snap || !snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email?.split('@')[0] || 'User',
      photoURL: user.photoURL,
      subscriptionStatus: 'free',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }).catch(() => {});
    return null; // new user, no role yet
  }
  return snap.data()?.role || null;
}

async function saveUserRole(uid: string, role: 'candidate' | 'company') {
  const ref = doc(db, 'users', uid);
  await setDoc(ref, { role, updatedAt: serverTimestamp() }, { merge: true }).catch(() => {});
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'candidate' | 'company' | null>(null);

  const reset = () => { setEmail(''); setPassword(''); setError(''); setResetSent(false); };

  const handleClose = () => {
    setMode('signin');
    setSelectedRole(null);
    reset();
    onClose();
  };

  const friendlyError = (code: string) => {
    const map: Record<string, string> = {
      'auth/email-already-in-use': 'That email already has an account. Sign in instead.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/weak-password': 'Password must be at least 6 characters.',
      'auth/user-not-found': 'No account with that email. Sign up instead.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/invalid-credential': 'Incorrect email or password.',
      'auth/too-many-requests': 'Too many attempts. Try again later.',
      'auth/unauthorized-domain': 'Google sign-in is not enabled for this domain. Use email & password below.',
      'auth/popup-closed-by-user': 'Sign-in cancelled.',
      'auth/operation-not-allowed': 'This sign-in method is not enabled. Please contact the administrator.',
      'auth/popup-blocked': 'Popup was blocked by your browser. Please allow popups for this site.',
      'auth/network-request-failed': 'Network error. Check your connection and try again.',
      'auth/internal-error': 'An internal error occurred. Try again or use email & password.',
    };
    return map[code] || `Something went wrong (${code}). Please try again.`;
  };

  // After auth success: ensure user doc exists, save role if selected, then close
  const finalizeAuth = async (user: { uid: string; email: string | null; displayName: string | null; photoURL: string | null }) => {
    await ensureUserDoc(user);
    if (selectedRole) {
      await saveUserRole(user.uid, selectedRole);
    }
    handleClose();
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let result;
      if (mode === 'signup') {
        result = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        result = await signInWithEmailAndPassword(auth, email, password);
      }
      await finalizeAuth(result.user);
    } catch (err: any) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (err: any) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    if (!selectedRole && mode !== 'signin' && mode !== 'signup') {
      // If we're in auth step but no role (shouldn't happen), fallback
      setError('Please select a role first.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await finalizeAuth(result.user);
    } catch (err: any) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (role: 'candidate' | 'company') => {
    setSelectedRole(role);
    setMode('auth');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-sm bg-surface border border-border shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-accent" />
                <span className="mono text-[10px] text-accent font-bold tracking-widest">
                  {mode === 'role' ? 'SELECT ROLE' : mode === 'reset' ? 'RESET PASSWORD' : mode === 'auth' ? 'SIGN IN' : mode === 'signup' ? 'CREATE ACCOUNT' : 'SIGN IN'}
                </span>
              </div>
              <button onClick={handleClose} className="text-text/30 hover:text-text transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="p-6">
              {/* Role selection screen */}
              {mode === 'role' && (
                <div>
                  <p className="mono text-[10px] text-text/50 mb-6 leading-relaxed">
                    How are you joining WProTalents? This helps us show you the right experience.
                  </p>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => handleRoleSelect('candidate')}
                      className="flex items-center gap-4 w-full border border-border hover:border-accent/60 bg-bg hover:bg-text/5 p-4 text-left transition-all group"
                    >
                      <div className="w-9 h-9 border border-border group-hover:border-accent/40 flex items-center justify-center flex-shrink-0 transition-colors">
                        <UserIcon size={16} className="text-text/40 group-hover:text-accent transition-colors" />
                      </div>
                      <div>
                        <div className="mono text-[11px] text-text font-bold mb-0.5">I'm a Candidate</div>
                        <div className="mono text-[9px] text-text/40">Browse AI & tech roles across LATAM, USA & EU</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleRoleSelect('company')}
                      className="flex items-center gap-4 w-full border border-border hover:border-accent/60 bg-bg hover:bg-text/5 p-4 text-left transition-all group"
                    >
                      <div className="w-9 h-9 border border-border group-hover:border-accent/40 flex items-center justify-center flex-shrink-0 transition-colors">
                        <Briefcase size={16} className="text-text/40 group-hover:text-accent transition-colors" />
                      </div>
                      <div>
                        <div className="mono text-[11px] text-text font-bold mb-0.5">I'm a Company</div>
                        <div className="mono text-[9px] text-text/40">Access market intel and talent acquisition tools</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Auth screen (after role selected) */}
              {mode === 'auth' && (
                <>
                  <div className="mb-4 text-center">
                    <p className="mono text-[10px] text-text/60">
                      You selected: <span className="text-accent font-bold">{selectedRole === 'candidate' ? 'Candidate' : 'Company'}</span>
                    </p>
                  </div>

                  {/* Google button */}
                  <button
                    onClick={handleGoogle}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 border border-border bg-bg hover:border-accent/40 py-2.5 mono text-[10px] text-text/60 hover:text-text transition-all mb-4 disabled:opacity-40"
                  >
                    <img src="https://www.google.com/favicon.ico" alt="" className="w-3.5 h-3.5" />
                    Continue with Google
                  </button>

                  {/* Divider */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-px bg-border" />
                    <span className="mono text-[8px] text-text/20">OR</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  {/* Email/Password form */}
                  <form onSubmit={handleEmail} className="space-y-3">
                    <div className="relative">
                      <Mail size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-text/25" />
                      <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        className="w-full bg-bg border border-border pl-9 pr-4 py-2.5 mono text-[11px] text-text placeholder:text-text/20 focus:outline-none focus:border-accent/40 transition-colors"
                      />
                    </div>
                    <div className="relative">
                      <Lock size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-text/25" />
                      <input
                        type={showPw ? 'text' : 'password'}
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full bg-bg border border-border pl-9 pr-10 py-2.5 mono text-[11px] text-text placeholder:text-text/20 focus:outline-none focus:border-accent/40 transition-colors"
                      />
                      <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text/25 hover:text-text/60">
                        {showPw ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 bg-accent text-black py-2.5 mono text-[10px] font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {loading ? '...' : mode === 'signup' ? 'CREATE ACCOUNT' : 'SIGN IN'}
                      {!loading && <ArrowRight size={11} />}
                    </button>
                  </form>

                  {/* Footer links */}
                  <div className="mt-4 flex items-center justify-between">
                    <button onClick={() => { setMode('role'); setSelectedRole(null); reset(); }} className="mono text-[9px] text-text/30 hover:text-accent transition-colors">
                      ← Change role
                    </button>
                    <button onClick={() => { setMode('reset'); reset(); }} className="mono text-[9px] text-text/30 hover:text-text/60 transition-colors">
                      Forgot password?
                    </button>
                  </div>
                </>
              )}

              {/* Reset password screen */}
              {mode === 'reset' && (
                <form onSubmit={handleReset} className="space-y-3">
                  <div className="relative">
                    <Mail size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-text/25" />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className="w-full bg-bg border border-border pl-9 pr-4 py-2.5 mono text-[11px] text-text placeholder:text-text/20 focus:outline-none focus:border-accent/40 transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-accent text-black py-2.5 mono text-[10px] font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {loading ? '...' : 'SEND RESET LINK'}
                    {!loading && <ArrowRight size={11} />}
                  </button>
                  <button onClick={() => { setMode('signin'); reset(); }} className="w-full mt-2 mono text-[9px] text-text/30 hover:text-accent transition-colors">
                    ← Back to sign in
                  </button>
                </form>
              )}

              {error && (
                <div className="mt-4 px-3 py-2 border border-red-500/20 bg-red-500/5 mono text-[9px] text-red-400">
                  {error}
                </div>
              )}
              {resetSent && (
                <div className="mt-4 px-3 py-2 border border-green-500/20 bg-green-500/5 mono text-[9px] text-green-400">
                  Reset link sent — check your inbox.
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
