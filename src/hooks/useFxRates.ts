import { useState, useEffect } from 'react';

export interface FxRate {
  pair: string;
  rate: string;
  change: string;
  flag: string;
}

// Frankfurter: free, no auth, CORS-enabled, ECB data
const BASE_URL = 'https://api.frankfurter.app';

const PAIRS = [
  { code: 'COP', label: 'COP/USD', flag: '🇨🇴' },
  { code: 'BRL', label: 'BRL/USD', flag: '🇧🇷' },
  { code: 'ARS', label: 'ARS/USD', flag: '🇦🇷' },
  { code: 'MXN', label: 'MXN/USD', flag: '🇲🇽' },
  { code: 'CLP', label: 'CLP/USD', flag: '🇨🇱' },
  { code: 'PEN', label: 'PEN/USD', flag: '🇵🇪' },
];

function fmt(val: number, code: string): string {
  if (code === 'COP' || code === 'CLP' || code === 'ARS') return val.toLocaleString('en', { maximumFractionDigits: 0 });
  return val.toFixed(2);
}

export function useFxRates() {
  const [rates, setRates] = useState<FxRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    const codes = PAIRS.map(p => p.code).join(',');

    async function fetchRates() {
      try {
        const res = await fetch(`${BASE_URL}/latest?from=USD&to=${codes}`);
        if (!res.ok) throw new Error('fx fetch failed');
        const data = await res.json();
        if (cancelled) return;

        const built: FxRate[] = PAIRS.map(p => {
          const current: number = data.rates[p.code] ?? 0;
          return {
            pair: p.label,
            rate: fmt(current, p.code),
            change: '',
            flag: p.flag,
          };
        }).filter(r => r.rate !== '0');

        setRates(built);
        setLastUpdated(data.date || '');
      } catch {
        // Keep stale or empty — widget hides gracefully
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchRates();
    const id = setInterval(fetchRates, 4 * 60 * 60 * 1000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  return { rates, loading, lastUpdated };
}
