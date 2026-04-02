/// <reference types="vite/client" />
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Zap, Globe, Shield, Coins, CreditCard } from 'lucide-react';
import { auth } from '../firebase';
import { loadStripe } from '@stripe/stripe-js';

// @ts-ignore
const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = STRIPE_KEY ? loadStripe(STRIPE_KEY) : Promise.resolve(null);

interface Plan {
  id: string;
  name: string;
  price: string;
  features: string[];
  isPopular?: boolean;
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Standard',
    price: '$0',
    features: [
      'Weekly general briefings',
      'Basic market pulse',
      'Public AI tool reviews',
      'Community access'
    ]
  },
  {
    id: 'premium',
    name: 'Executive',
    price: '$29',
    features: [
      'Daily deep-dive briefings',
      'AI Job Impact reports',
      'Salary & Recruitment data',
      'Exclusive HR strategies',
      'Crypto payment support'
    ],
    isPopular: true
  }
];

export const SubscriptionSection: React.FC = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);

  const handleStripePayment = async () => {
    if (!auth.currentUser) return;
    if (!STRIPE_KEY) {
      alert('Stripe is not configured. Please set VITE_STRIPE_PUBLISHABLE_KEY in your environment.');
      return;
    }
    setLoading('stripe');
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // @ts-ignore
          priceId: import.meta.env.VITE_STRIPE_PRO_PRICE_ID,
          userId: auth.currentUser.uid,
          customerEmail: auth.currentUser.email,
        }),
      });

      const session = await response.json();
      const stripe = await stripePromise;
      if (stripe) {
        // @ts-ignore - Stripe type mismatch in some environments
        const { error } = await stripe.redirectToCheckout({
          sessionId: session.id,
        });
        if (error) console.error(error);
      }
    } catch (error) {
      console.error('Stripe error:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleCryptoPayment = async () => {
    if (!auth.currentUser) return;
    setLoading('crypto');
    try {
      const response = await fetch('/api/create-crypto-charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: auth.currentUser.uid,
          userEmail: auth.currentUser.email,
        }),
      });

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Crypto error:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!auth.currentUser) {
      alert('Please sign in to subscribe.');
      return;
    }

    if (planId === 'free') return;
    setShowPaymentOptions(true);
  };

  return (
    <div className="py-24 bg-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-text tracking-tight mb-4">
            Intelligence for the <span className="text-accent">Next Cycle</span>
          </h2>
          <p className="text-text/40 max-w-2xl mx-auto text-lg">
            Join 12,000+ executives receiving daily signal on the LatAm tech ecosystem.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {PLANS.map((plan) => (
            <motion.div
              key={plan.id}
              whileHover={{ y: -5 }}
              className={`relative p-8 rounded-2xl border ${
                plan.isPopular 
                  ? 'border-accent bg-accent/5 shadow-2xl shadow-accent/10' 
                  : 'border-border bg-surface'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-bold text-text mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-text">{plan.price}</span>
                  <span className="text-text/40 text-sm">/month</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-text/60 text-sm">
                    <Check className="text-accent shrink-0" size={18} />
                    {feature}
                  </li>
                ))}
              </ul>

              {!showPaymentOptions || plan.id === 'free' ? (
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading !== null}
                  className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                    plan.isPopular
                      ? 'bg-accent text-black hover:opacity-90'
                      : 'bg-text text-bg hover:opacity-90'
                  } disabled:opacity-50`}
                >
                  {plan.id === 'free' ? 'Current Plan' : 'Subscribe Now'}
                </button>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={handleStripePayment}
                    disabled={loading !== null}
                    className="w-full py-4 rounded-xl font-bold bg-text text-bg hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <CreditCard size={18} />
                    {loading === 'stripe' ? 'Connecting...' : 'Pay with Card'}
                  </button>
                  <button
                    onClick={handleCryptoPayment}
                    disabled={loading !== null}
                    className="w-full py-4 rounded-xl font-bold bg-accent text-black hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Coins size={18} />
                    {loading === 'crypto' ? 'Connecting...' : 'Pay with Crypto'}
                  </button>
                  <button 
                    onClick={() => setShowPaymentOptions(false)}
                    className="w-full text-xs text-text/40 hover:text-text transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {plan.id === 'premium' && (
                <p className="mt-4 text-center text-[10px] text-text/40 uppercase tracking-widest flex items-center justify-center gap-2">
                  <Shield size={10} /> Supports USDC & Crypto via Stripe
                </p>
              )}
            </motion.div>
          ))}
        </div>

        <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-border pt-16">
          {[
            { icon: Globe, label: 'Regional Focus', desc: 'BR, MX, CO, AR, CL' },
            { icon: Zap, label: 'Daily Signal', desc: 'No fluff, just impact' },
            { icon: Shield, label: 'Verified Data', desc: 'Direct from source' },
            { icon: Coins, label: 'Crypto Ready', desc: 'Pay with USDC' }
          ].map((item, idx) => (
            <div key={idx} className="text-center space-y-2">
              <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center mx-auto mb-4">
                <item.icon className="text-accent" size={20} />
              </div>
              <h4 className="text-text font-semibold text-sm">{item.label}</h4>
              <p className="text-text/40 text-xs">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
