// api/_lib/beehiiv.ts — Beehiiv newsletter API wrapper

const BASE = 'https://api.beehiiv.com/v2';

export async function beehiivCreateSubscriber(email: string, opts?: {
  utm_source?: string;
  utm_medium?: string;
  subscriber_type?: string;
}) {
  const key = process.env.BEEHIIV_API_KEY;
  const pubId = process.env.BEEHIIV_PUB_ID;
  if (!key || !pubId) {
    console.warn('[beehiiv] BEEHIIV_API_KEY or BEEHIIV_PUB_ID not set — subscriber not pushed to Beehiiv');
    return null;
  }

  try {
    const res = await fetch(`${BASE}/publications/${pubId}/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({
        email,
        utm_source: opts?.utm_source || 'latam-intel',
        utm_medium: opts?.utm_medium || 'organic',
        reactivate_existing: true,
        send_welcome_email: true,
        custom_fields: [
          ...(opts?.subscriber_type ? [{ name: 'subscriber_type', value: opts.subscriber_type }] : []),
        ],
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.warn('[beehiiv] subscribe failed:', res.status, err);
      return null;
    }
    return await res.json();
  } catch (e: any) {
    console.warn('[beehiiv] subscribe error:', e.message);
    return null;
  }
}

export async function beehiivCreatePost(post: {
  title: string;
  content: string;
  subtitle?: string;
  preview_text?: string;
  status?: 'draft' | 'published';
  newsletter_id?: string;
}) {
  const key = process.env.BEEHIIV_API_KEY;
  const pubId = process.env.BEEHIIV_PUB_ID;
  if (!key || !pubId) throw new Error('BEEHIIV_API_KEY or BEEHIIV_PUB_ID not set');

  const res = await fetch(`${BASE}/publications/${pubId}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({
      title: post.title,
      content: post.content,
      subtitle: post.subtitle || '',
      preview_text: post.preview_text || '',
      status: post.status || 'published',
      ...(post.newsletter_id ? { newsletter_id: post.newsletter_id } : {}),
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Beehiiv post creation failed: ${res.status} ${JSON.stringify(err)}`);
  }
  return await res.json();
}
