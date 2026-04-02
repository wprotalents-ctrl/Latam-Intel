import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck } from 'lucide-react';
import { auth, googleProvider, signInWithPopup, db, handleFirestoreError, FirestoreOperation } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Initialize user profile in Firestore if it doesn't exist
      const userRef = doc(db, 'users', user.uid);
      let userSnap;
      try {
        userSnap = await getDoc(userRef);
      } catch (error) {
        handleFirestoreError(error, FirestoreOperation.GET, `users/${user.uid}`);
      }

      if (userSnap && !userSnap.exists()) {
        try {
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            subscriptionStatus: 'free',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } catch (error) {
          handleFirestoreError(error, FirestoreOperation.CREATE, `users/${user.uid}`);
        }
      }

      onClose();
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-md bg-surface border border-accent/20 rounded-xl overflow-hidden shadow-2xl shadow-accent/10"
          >
            <div className="relative p-8">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-text/40 hover:text-text transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-2">
                  <ShieldCheck className="text-accent" size={32} />
                </div>
                
                <h2 className="text-2xl font-bold tracking-tight text-text">
                  Join LATAM INTEL
                </h2>
                <p className="text-text/60 text-sm leading-relaxed">
                  Access premium intelligence briefings, salary data, and AI impact reports across Latin America.
                </p>
              </div>

              <div className="mt-8 space-y-4">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-text text-bg font-semibold py-3 px-4 rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
                >
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                  {loading ? 'Connecting...' : 'Continue with Google'}
                </button>

                <div className="relative flex items-center py-4">
                  <div className="flex-grow border-t border-border"></div>
                  <span className="flex-shrink mx-4 text-text/40 text-xs uppercase tracking-widest">Secure Access</span>
                  <div className="flex-grow border-t border-border"></div>
                </div>

                <p className="text-center text-xs text-text/40">
                  By continuing, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
