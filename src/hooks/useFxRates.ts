import { useState, useEffect } from 'react';

export interface FxRate {
  pair: string;
  rate: string;
  change: string;
  flag: string;
}

// open.er-api.com: free, no auth, supports all LATAM currencies.
// (Replaces Frankfurter which only had BRL + MXN from LATAM, and
// exchangerate.host which now requires an API key.)
// Docs: https://www.exchangerate-api.com/docs/free
const BASE_URL = 'https://open.er-api.com/v6/latest';

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

    async function fetchRates() {
      try {
        // Endpoint returns rates keyed by code, where each rate is
        // "1 USD = X [CODE]". We invert to get "1 [CODE] = Y USD"
        // which is what the dashboard displays.
        const res = await fetch(`${BASE_URL}/USD`);
        if (!res.ok) throw new Error('fx fetch failed');
        const data = await res.json();
        if (cancelled) return;
        if (data.result !== 'success') throw new Error('fx api error: ' + (data['error-type'] || 'unknown'));

        const built: FxRate[] = PAIRS.map(p => {
          // data.rates.COP = "1 USD = 3233 COP" → invert
          const oneUnitInUsd = data.rates?.[p.code];
          if (!oneUnitInUsd) return null;
          const usdPerOne = 1 / oneUnitInUsd;
          return {
            pair: p.label,
            rate: fmt(usdPerOne, p.code),
            change: '',
            flag: p.flag,
          };
        }).filter((r): r is FxRate => r !== null);

        setRates(built);
        // time_last_update_utc is RFC 1123 format — convert to YYYY-MM-DD
        const d = new Date(data.time_last_update_utc);
        setLastUpdated(d.toISOString().slice(0, 10));
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
