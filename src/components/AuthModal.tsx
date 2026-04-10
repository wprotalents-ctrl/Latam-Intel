// src/components/AuthModal.tsx
import { useState } from 'react';
import { auth, db } from '../firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [role, setRole] = useState<'candidate' | 'company' | null>(null);
  const [step, setStep] = useState<'role' | 'auth'>('role');

  const handleGoogleSignIn = async () => {
    if (!role) return;
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Write role to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        role: role,
        subscriptionStatus: 'free',
        createdAt: new Date().toISOString(),
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
      }, { merge: true });

      onClose();
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-surface border border-border p-6 max-w-md w-full relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-text/40 hover:text-text">
          <X size={20} />
        </button>

        {step === 'role' ? (
          <>
            <h2 className="text-xl font-black mb-6">I am a...</h2>
            <button
              onClick={() => { setRole('candidate'); setStep('auth'); }}
              className="w-full p-4 border border-border mb-3 text-left hover:border-accent/50 transition-colors"
            >
              <div className="font-bold">Candidate</div>
              <div className="text-xs text-text/40">Looking for remote USD jobs</div>
            </button>
            <button
              onClick={() => { setRole('company'); setStep('auth'); }}
              className="w-full p-4 border border-border text-left hover:border-accent/50 transition-colors"
            >
              <div className="font-bold">Company / Hiring Manager</div>
              <div className="text-xs text-text/40">Hiring LATAM tech talent</div>
            </button>
          </>
        ) : (
          <>
            <h2 className="text-xl font-black mb-4">Sign in with Google</h2>
            <p className="text-sm text-text/60 mb-6">
              You selected: <span className="text-accent font-bold">{role === 'candidate' ? 'Candidate' : 'Company'}</span>
            </p>
            <button
              onClick={handleGoogleSignIn}
              className="w-full bg-accent text-black py-3 font-bold hover:opacity-90 transition"
            >
              Continue with Google
            </button>
            <button
              onClick={() => setStep('role')}
              className="w-full mt-3 text-xs text-text/40 hover:text-text"
            >
              ← Go back
            </button>
          </>
        )}
      </div>
    </div>
  );
}
