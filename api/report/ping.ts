// api/report/ping.ts
// Debug endpoint to test if pdf-lib can load in Vercel
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const pdf = await PDFDocument.create();
    const helv = await pdf.embedFont(StandardFonts.Helvetica);
    const page = pdf.addPage([612, 792]);
    page.drawText('pong', { x: 50, y: 700, size: 20, font: helv, color: rgb(1, 0.42, 0) });
    const bytes = await pdf.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.status(200).send(Buffer.from(bytes));
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'unknown', stack: e?.stack?.split('\n').slice(0, 5) });
  }
}
