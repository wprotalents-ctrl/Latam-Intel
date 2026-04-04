import type { VercelRequest, VercelResponse } from "@vercel/node";
export default (_req: VercelRequest, res: VercelResponse) =>
  res.json({ status: "ok", ts: new Date().toISOString() });
