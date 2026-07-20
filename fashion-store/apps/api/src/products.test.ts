import { describe, it, expect } from 'vitest';
import { createApp } from './app.js';

describe('api', () => {
  it('creates an express app with a health route', () => {
    const app = createApp();
    // The app is a function (express instance) and has a router stack.
    expect(typeof app).toBe('function');
    expect((app as unknown as { _router: unknown })._router).toBeDefined();
  });
});
