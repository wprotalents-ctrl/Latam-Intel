// api/newsletter/send.ts — send latest newsletter draft to Beehiiv
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCors } from '../_lib/cors.js';
import { beehiivCreatePost } from '../_lib/beehiiv.js';

export const config = { maxDuration: 30 };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  // For POST requests, verify cron secret
  if (req.method === 'POST') {
    const secret = req.headers['x-cron-secret'] as string;
    if (!secret || secret !== process.env.CRON_SECRET) {
      return res.status(401).json({ error: 'Invalid or missing x-cron-secret' });
    }
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).end();
  }

  try {
    // 1. Fetch the most recent draft from Supabase
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: 'Supabase not configured' });
    }

    const { createClient } = await import('@supabase/supabase-js');
    const sb = createClient(supabaseUrl, supabaseKey);

    const { data: issue, error } = await sb
      .from('newsletter_issues')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !issue) {
      return res.status(404).json({ error: 'No newsletter draft found. Run generate first.' });
    }

    const body = issue.paid_analysis;
    if (!body || !body.en) {
      return res.status(400).json({ error: 'Draft has no body content' });
    }

    // 2. Send each language version to Beehiiv
    const results: Record<string, any> = {};
    for (const [lang, content] of Object.entries(body)) {
      try {
        const subject = content.subject || issue.subject_line;
        const post = await beehiivCreatePost({
          title: `${subject} [${lang.toUpperCase()}]`,
          content: content.body,
          preview_text: issue.preview_text,
          status: 'published',
        });
        results[lang] = { success: true, postId: post?.id };

        // Update the Beehiiv post ID on the issue
        if (post?.id && lang === 'en') {
          await sb.from('newsletter_issues').update(
            { beehiiv_post_id: post.id },
            { id: issue.id }
          );
        }
      } catch (e: any) {
        results[lang] = { success: false, error: e.message };
      }
    }

    return res.json({
      success: true,
      issueId: issue.id,
      subject: issue.subject_line,
      results,
    });
  } catch (e: any) {
    console.error('[newsletter/send] error:', e.message);
    return res.status(500).json({ error: e.message });
  }
}
