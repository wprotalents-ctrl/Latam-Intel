// src/components/ShareSalaryCard.tsx
// "Share my salary" modal — renders the SVG card (from src/lib/shareSalaryCard.ts),
// offers download (PNG via canvas) + copy share link. Anonymous by default.

import { useState } from 'react';
import { Download, Share2, X, Copy, Check } from 'lucide-react';
import { renderShareSvg, CARD_W, CARD_H, type ShareSalaryCardData } from '../lib/shareSalaryCard';

export default function ShareSalaryCard({ data, onClose }: { data: ShareSalaryCardData; onClose: () => void }) {
  const lang = data.lang || 'EN';
  const svgString = renderShareSvg(data);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const shareLink = typeof window !== 'undefined'
    ? `${window.location.origin}/?role=${data.role}&country=${data.country}&years=${data.yearsExp}`
    : `https://intel.wprotalents.lat/?role=${data.role}&country=${data.country}&years=${data.yearsExp}`;

  const ogImageUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/og/salary?role=${data.role}&country=${data.country}&years=${data.yearsExp}&lang=${lang}`
    : `https://intel.wprotalents.lat/api/og/salary?role=${data.role}&country=${data.country}&years=${data.yearsExp}&lang=${lang}`;

  const T = {
    EN: { share: 'Share your market value', download: 'Download image', copyLink: 'Copy share link', copied: 'Copied!', close: 'Close', blurb: 'Anonymous by default. No personal data used. Share to LinkedIn, X, or WhatsApp.' },
    ES: { share: 'Comparte tu valor de mercado', download: 'Descargar imagen', copyLink: 'Copiar enlace', copied: '¡Copiado!', close: 'Cerrar', blurb: 'Anónimo por defecto. Sin datos personales. Comparte en LinkedIn, X o WhatsApp.' },
    PT: { share: 'Compartilhe seu valor de mercado', download: 'Baixar imagem', copyLink: 'Copiar link', copied: 'Copiado!', close: 'Fechar', blurb: 'Anônimo por padrão. Sem dados pessoais. Compartilhe no LinkedIn, X ou WhatsApp.' },
  }[lang];

  async function handleDownload() {
    setDownloading(true);
    try {
      // Convert SVG to PNG via canvas. Render SVG into a Blob URL,
      // draw to canvas at 2x for crisp display, export as PNG.
      const img = new Image();
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);
      img.src = blobUrl;
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });
      const canvas = document.createElement('canvas');
      canvas.width = CARD_W * 2;
      canvas.height = CARD_H * 2;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('canvas not supported');
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0);
      const pngBlob = await new Promise<Blob | null>((res) => canvas.toBlob((b) => res(b), 'image/png'));
      if (!pngBlob) throw new Error('toBlob failed');
      const pngUrl = URL.createObjectURL(pngBlob);
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = `latam-intel-${data.role}-${data.country}-${data.yearsExp}y.png`;
      a.click();
      URL.revokeObjectURL(blobUrl);
      URL.revokeObjectURL(pngUrl);
    } catch (e) {
      console.error('PNG export failed:', e);
    } finally {
      setDownloading(false);
    }
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select the text in the input below
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-bg border border-accent/30 max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-accent/20">
          <h3 className="mono text-[10px] font-bold text-accent tracking-widest flex items-center gap-2">
            <Share2 size={12} /> {T.share}
          </h3>
          <button onClick={onClose} className="text-text/50 hover:text-text" aria-label={T.close}>
            <X size={14} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-black border border-border overflow-hidden">
            <div dangerouslySetInnerHTML={{ __html: svgString }} />
          </div>

          <p className="mono text-[9px] text-text/50 leading-relaxed">{T.blurb}</p>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="py-2.5 bg-accent text-black mono text-[9px] font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Download size={11} /> {downloading ? '...' : T.download}
            </button>
            <button
              onClick={handleCopyLink}
              className="py-2.5 bg-surface text-text mono text-[9px] font-bold hover:text-accent border border-border transition-colors flex items-center justify-center gap-2"
            >
              {copied ? <><Check size={11} /> {T.copied}</> : <><Copy size={11} /> {T.copyLink}</>}
            </button>
          </div>

          <div className="bg-bg border border-border p-2 mono text-[8px] text-text/40 break-all">
            {shareLink}
          </div>

          <details className="mono text-[8px] text-text/30">
            <summary className="cursor-pointer hover:text-text/60">OG image (link previews)</summary>
            <p className="mt-1 break-all text-text/50">{ogImageUrl}</p>
          </details>
        </div>
      </div>
    </div>
  );
}
