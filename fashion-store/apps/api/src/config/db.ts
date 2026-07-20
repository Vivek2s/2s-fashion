import mongoose from 'mongoose';

/** Connect once, failing fast (5s) instead of hanging when MongoDB is down. */
export async function connectDB(uri: string): Promise<void> {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  console.log('[api] MongoDB connected');
}

/** Connect in the background and keep retrying, so the HTTP server can boot even
 *  if MongoDB isn't up yet (e.g. `brew services start mongodb-community`). */
export function connectWithRetry(uri: string, delayMs = 5000): void {
  connectDB(uri).catch((err: unknown) => {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(
      `[api] MongoDB not reachable (${msg}). Retrying in ${delayMs / 1000}s — ` +
      `start it with: brew services start mongodb-community`
    );
    setTimeout(() => connectWithRetry(uri, delayMs), delayMs);
  });
}
