import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight, RotateCcw, Briefcase, User as UserIcon } from 'lucide-react';
import {
  auth, googleProvider, signInWithPopup, db,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  sendPasswordResetEmail
} from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

// --- Translations ---
const translations = {
  EN: {
    selectRole: 'SELECT ROLE',
    resetPw: 'RESET PASSWORD',
    signIn: 'SIGN IN',
    createAccount: 'CREATE ACCOUNT',
    howJoining: 'How are you joining WProTalents? This helps us show you the right experience.',
    candidate: "I'm a Candidate",
    candidateDesc: 'Browse AI & tech roles across LATAM, USA & EU',
    company: "I'm a Company",
    companyDesc: 'Access market intel and talent acquisition tools',
    youSelected: 'You selected:',
    continueGoogle: 'Continue with Google',
    or: 'OR',
    emailPlaceholder: 'Email address',
    passwordPlaceholder: 'Password',
    forgotPassword: 'Forgot password?',
    changeRole: '← Change role',
    sendResetLink: 'SEND RESET LINK',
    backToSignIn: '← Back to sign in',
    resetLinkSent: 'Reset link sent — check your inbox.',
    loading: '...',
    noAccount: 'No account? Sign up',
    alreadyAccount: 'Already have an account? Sign in',
  },
  ES: {
    selectRole: 'SELECCIONAR ROL',
    resetPw: 'RESTABLECER CONTRASEÑA',
    signIn: 'INICIAR SESIÓN',
    createAccount: 'CREAR CUENTA',
    howJoining: '¿Cómo te unes a WProTalents? Esto nos ayuda a mostrarte la experiencia adecuada.',
    candidate: 'Soy Candidato',
    candidateDesc: 'Explora roles de IA y tecnología en LATAM, EE. UU. y UE',
    company: 'Soy Empresa',
    companyDesc: 'Accede a inteligencia de mercado y herramientas de adquisición de talento',
    youSelected: 'Seleccionaste:',
    continueGoogle: 'Continuar con Google',
    or: 'O',
    emailPlaceholder: 'Correo electrónico',
    passwordPlaceholder: 'Contraseña',
    forgotPassword: '¿Olvidaste tu contraseña?',
    changeRole: '← Cambiar rol',
    sendResetLink: 'ENVIAR ENLACE DE RESTABLECIMIENTO',
    backToSignIn: '← Volver a iniciar sesión',
    resetLinkSent: 'Enlace de restablecimiento enviado — revisa tu correo.',
    loading: '...',
    noAccount: '¿No tienes cuenta? Regístrate',
    alreadyAccount: '¿Ya tienes cuenta? Inicia sesión',
  },
  PT: {
    selectRole: 'SELECIONAR FUNÇÃO',
    resetPw: 'REDEFINIR SENHA',
    signIn: 'ENTRAR',
    createAccount: 'CRIAR CONTA',
    howJoining: 'Como você está se juntando à WProTalents? Isso nos ajuda a mostrar a experiência certa.',
    candidate: 'Sou Candidato',
    candidateDesc: 'Explore vagas de IA e tecnologia na LATAM, EUA e UE',
    company: 'Sou Empresa',
    companyDesc: 'Acesse inteligência de mercado e ferramentas de aquisição de talentos',
    youSelected: 'Você selecionou:',
    continueGoogle: 'Continuar com Google',
    or: 'OU',
    emailPlaceholder: 'E-mail',
    passwordPlaceholder: 'Senha',
    forgotPassword: 'Esqueceu a senha?',
    changeRole: '← Alterar função',
    sendResetLink: 'ENVIAR LINK DE REDEFINIÇÃO',
    backToSignIn: '← Voltar para entrar',
    resetLinkSent: 'Link de redefinição enviado — verifique seu e-mail.',
    loading: '...',
    noAccount: 'Não tem conta? Cadastre-se',
    alreadyAccount: 'Já tem conta? Entre',
  }
};

type Language = 'EN' | 'ES' | 'PT';
type Mode = 'role' | 'auth' | 'reset' | 'signin' | 'signup';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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
    return null;
  }
  return snap.data()?.role || null;
}

async function saveUserRole(uid: string, role: 'candidate' | 'company') {
  const ref = doc(db, 'users', uid);
  try {
    await setDoc(ref, { role, updatedAt: serverTimestamp() }, { merge: true });
  } catch (err) {
    console.error('[saveUserRole] failed to save role:', err);
  }
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  // Get language from localStorage (same as main app)
  const getLang = (): Language => {
    const saved = localStorage.getItem('wpro_lang');
    if (saved === 'EN' || saved === 'ES' || saved === 'PT') return saved;
    return 'EN';
  };
  const [lang, setLang] = useState<Language>(getLang);
  const t = translations[lang];

  const [mode, setMode] = useState<Mode>('role');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'candidate' | 'company' | null>(null);

  const reset = () => { setEmail(''); setPassword(''); setError(''); setResetSent(false); };

  const handleClose = () => {
    setMode('role');
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

  const finalizeAuth = async (user: { uid: string; email: string | null; displayName: string | null; photoURL: string | null }) => {
    await ensureUserDoc(user);
    if (selectedRole) {
      // Role save is best-effort — never block login if it fails
      await saveUserRole(user.uid, selectedRole).catch(err =>
        console.error('[finalizeAuth] role save failed:', err)
      );
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

  // Language switcher inside modal (optional but useful)
  const LanguageSwitcher = () => (
    <div className="flex items-center gap-1 absolute top-4 right-12">
      {(['EN', 'ES', 'PT'] as Language[]).map((l) => (
        <button
          key={l}
          onClick={() => { setLang(l); localStorage.setItem('wpro_lang', l); }}
          className={`text-[8px] font-mono px-1.5 py-0.5 rounded-sm transition-colors ${lang === l ? 'bg-accent text-black' : 'text-text/40 hover:text-text/80'}`}
        >
          {l}
        </button>
      ))}
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-sm bg-surface border border-border shadow-2xl relative"
          >
            <LanguageSwitcher />
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-accent" />
                <span className="mono text-[10px] text-accent font-bold tracking-widest">
                  {mode === 'role' && t.selectRole}
                  {mode === 'reset' && t.resetPw}
                  {mode === 'auth' && (selectedRole ? t.signIn : '')}
                  {mode === 'signin' && t.signIn}
                  {mode === 'signup' && t.createAccount}
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
                    {t.howJoining}
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
                        <div className="mono text-[11px] text-text font-bold mb-0.5">{t.candidate}</div>
                        <div className="mono text-[9px] text-text/40">{t.candidateDesc}</div>
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
                        <div className="mono text-[11px] text-text font-bold mb-0.5">{t.company}</div>
                        <div className="mono text-[9px] text-text/40">{t.companyDesc}</div>
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
                      {t.youSelected} <span className="text-accent font-bold">{selectedRole === 'candidate' ? t.candidate : t.company}</span>
                    </p>
                  </div>

                  <button
                    onClick={handleGoogle}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 border border-border bg-bg hover:border-accent/40 py-2.5 mono text-[10px] text-text/60 hover:text-text transition-all mb-4 disabled:opacity-40"
                  >
                    <img src="https://www.google.com/favicon.ico" alt="" className="w-3.5 h-3.5" />
                    {t.continueGoogle}
                  </button>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-px bg-border" />
                    <span className="mono text-[8px] text-text/20">{t.or}</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  <form onSubmit={handleEmail} className="space-y-3">
                    <div className="relative">
                      <Mail size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-text/25" />
                      <input
                        type="email"
                        placeholder={t.emailPlaceholder}
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
                        placeholder={t.passwordPlaceholder}
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
                      {loading ? t.loading : (mode === 'signup' ? t.createAccount : t.signIn)}
                      {!loading && <ArrowRight size={11} />}
                    </button>
                  </form>

                  <div className="mt-4 flex items-center justify-between">
                    <button onClick={() => { setMode('role'); setSelectedRole(null); reset(); }} className="mono text-[9px] text-text/30 hover:text-accent transition-colors">
                      {t.changeRole}
                    </button>
                    <button onClick={() => { setMode('reset'); reset(); }} className="mono text-[9px] text-text/30 hover:text-text/60 transition-colors">
                      {t.forgotPassword}
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
                      placeholder={t.emailPlaceholder}
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
                    {loading ? t.loading : t.sendResetLink}
                    {!loading && <ArrowRight size={11} />}
                  </button>
                  <button onClick={() => { setMode('auth'); reset(); }} className="w-full mt-2 mono text-[9px] text-text/30 hover:text-accent transition-colors">
                    {t.backToSignIn}
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
                  {t.resetLinkSent}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
