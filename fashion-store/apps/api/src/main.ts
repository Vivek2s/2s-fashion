import 'dotenv/config';
import { createApp } from './app.js';
import { connectWithRetry } from './config/db.js';

const PORT = Number(process.env.PORT ?? 4000);
const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/fashion-store';

// Start the HTTP server immediately, then connect to MongoDB in the background
// (with retry). The server stays up even if the DB is momentarily unavailable.
const app = createApp();
app.listen(PORT, () => console.log(`[api] listening on http://localhost:${PORT}`));
connectWithRetry(MONGODB_URI);
