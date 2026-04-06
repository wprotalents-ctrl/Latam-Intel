import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight, RotateCcw } from 'lucide-react';
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

type Mode = 'signin' | 'signup' | 'reset';

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
  }
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const reset = () => { setEmail(''); setPassword(''); setError(''); setResetSent(false); };

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
      await ensureUserDoc(result.user);
      onClose();
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
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await ensureUserDoc(result.user);
      onClose();
    } catch (err: any) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
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
                  {mode === 'reset' ? 'RESET PASSWORD' : mode === 'signup' ? 'CREATE ACCOUNT' : 'SIGN IN'}
                </span>
              </div>
              <button onClick={onClose} className="text-text/30 hover:text-text transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="p-6">
              {/* Google button */}
              {mode !== 'reset' && (
                <button
                  onClick={handleGoogle}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 border border-border bg-bg hover:border-accent/40 py-2.5 mono text-[10px] text-text/60 hover:text-text transition-all mb-4 disabled:opacity-40"
                >
                  <img src="https://www.google.com/favicon.ico" alt="" className="w-3.5 h-3.5" />
                  Continue with Google
                </button>
              )}

              {/* Divider */}
              {mode !== 'reset' && (
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-border" />
                  <span className="mono text-[8px] text-text/20">OR</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="mb-4 px-3 py-2 border border-red-500/20 bg-red-500/5 mono text-[9px] text-red-400">
                  {error}
                </div>
              )}

              {/* Reset sent */}
              {resetSent && (
                <div className="mb-4 px-3 py-2 border border-green-500/20 bg-green-500/5 mono text-[9px] text-green-400">
                  Reset link sent — check your inbox.
                </div>
              )}

              {/* Form */}
              <form onSubmit={mode === 'reset' ? handleReset : handleEmail} className="space-y-3">
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

                {mode !== 'reset' && (
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
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-accent text-black py-2.5 mono text-[10px] font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? '...' : mode === 'reset' ? 'SEND RESET LINK' : mode === 'signup' ? 'CREATE ACCOUNT' : 'SIGN IN'}
                  {!loading && <ArrowRight size={11} />}
                </button>
              </form>

              {/* Footer links */}
              <div className="mt-4 flex items-center justify-between">
                {mode === 'signin' && (
                  <>
                    <button onClick={() => { setMode('signup'); reset(); }} className="mono text-[9px] text-text/30 hover:text-accent transition-colors">
                      No account? Sign up
                    </button>
                    <button onClick={() => { setMode('reset'); reset(); }} className="mono text-[9px] text-text/30 hover:text-text/60 transition-colors">
                      Forgot password?
                    </button>
                  </>
                )}
                {mode === 'signup' && (
                  <button onClick={() => { setMode('signin'); reset(); }} className="mono text-[9px] text-text/30 hover:text-accent transition-colors">
                    Already have an account? Sign in
                  </button>
                )}
                {mode === 'reset' && (
                  <button onClick={() => { setMode('signin'); reset(); }} className="flex items-center gap-1 mono text-[9px] text-text/30 hover:text-text/60 transition-colors">
                    <RotateCcw size={9} /> Back to sign in
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
