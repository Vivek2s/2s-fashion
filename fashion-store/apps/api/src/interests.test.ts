import { describe, it, expect } from 'vitest';
import { createApp } from './app.js';

// Minimal request against the live express instance without binding a port.
async function inject(path: string, init?: RequestInit) {
  const app = createApp();
  const server = app.listen(0);
  const { port } = server.address() as { port: number };
  try {
    return await fetch(`http://127.0.0.1:${port}${path}`, init);
  } finally {
    server.close();
  }
}

describe('interests auth guard', () => {
  it('rejects POST /api/interests without a bearer token', async () => {
    const res = await inject('/api/interests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productSlug: 'wool-overcoat' }),
    });
    expect(res.status).toBe(401);
  });

  it('rejects GET /api/interests/:slug with a garbage token', async () => {
    const res = await inject('/api/interests/wool-overcoat', {
      headers: { Authorization: 'Bearer not-a-real-token' },
    });
    expect(res.status).toBe(401);
  });
});
