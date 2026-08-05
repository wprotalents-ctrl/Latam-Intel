// scripts/test-pdf.mjs — quick local test of the PDF generator
// Run: node scripts/test-pdf.mjs
import { writeFileSync } from 'node:fs';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const ORANGE = rgb(1.0, 0.42, 0.0);
const DARK_BG = rgb(0.04, 0.04, 0.04);
const WHITE = rgb(1, 1, 1);
const GRAY_LIGHT = rgb(0.65, 0.65, 0.65);

const BASE_SALARY = {
  ai_ml: { BR: 65000, MX: 65000, CO: 55000, AR: 70000, CL: 70000 },
  llm: { BR: 70000, MX: 70000, CO: 60000, AR: 75000, CL: 75000 },
  backend: { BR: 45000, MX: 46000, CO: 42000, AR: 48000, CL: 51000 },
};
const SENIORITY_MULT = { junior: 0.59, mid: 1.00, senior: 1.55, staff: 2.17 };
const REMOTE_MULT = { BR: 1.70, MX: 1.70, CO: 1.70, AR: 1.50, CL: 1.50 };

const pdf = await PDFDocument.create();
const helv = await pdf.embedFont(StandardFonts.Helvetica);
const helvBold = await pdf.embedFont(StandardFonts.HelveticaBold);
const courier = await pdf.embedFont(StandardFonts.Courier);
const page = pdf.addPage([612, 792]);
const { width, height } = page.getSize();
page.drawRectangle({ x: 0, y: 0, width, height, color: DARK_BG });
page.drawText('WPRO INTEL', { x: 50, y: height - 60, size: 14, font: helvBold, color: ORANGE });
page.drawText('LATAM Salary Benchmark Report', { x: 50, y: height - 150, size: 24, font: helvBold, color: ORANGE });
page.drawText('AI / ML Engineer  ·  Brazil  ·  7 years  ·  Senior', { x: 50, y: height - 260, size: 18, font: helvBold, color: WHITE });
page.drawText('LOCAL: $100,750 / year', { x: 50, y: height - 360, size: 36, font: helvBold, color: WHITE });
page.drawText('REMOTE: $171,275 / year (+70%)', { x: 50, y: height - 410, size: 36, font: helvBold, color: ORANGE });
page.drawText('Source: Mismo · Howdy · Levels.fyi LATAM · Nexton · Terminal', { x: 50, y: 60, size: 8, font: helv, color: GRAY_LIGHT });
const bytes = await pdf.save();
writeFileSync('preview-salary-report.pdf', bytes);
console.log('PDF generated:', bytes.length, 'bytes');
