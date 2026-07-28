'use client';

import type { User } from 'firebase/auth';
import type { InterestResult } from '@fashion-store/shared-types';

const API = process.env.NEXT_PUBLIC_API_URL;

/**
 * Record a "Get in touch" interest for the signed-in user. The API verifies
 * the Firebase ID token, upserts the user in our DB, and stores the lead
 * against their user_id.
 */
export async function submitInterest(
  user: User,
  productSlug: string,
  size?: string
): Promise<InterestResult> {
  const token = await user.getIdToken();
  const res = await fetch(`${API}/api/interests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ productSlug, size }),
  });
  if (!res.ok) throw new Error(`Interest submit failed (${res.status})`);
  const json = (await res.json()) as { data: InterestResult };
  return json.data;
}
