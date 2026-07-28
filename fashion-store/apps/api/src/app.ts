import express from 'express';
import cors from 'cors';
import { productsRouter } from './routes/products.js';
import { interestsRouter } from './routes/interests.js';

export function createApp() {
  const app = express();
  app.use(cors({ origin: process.env.CORS_ORIGIN ?? '*' }));
  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ ok: true }));
  app.use('/api/products', productsRouter);
  app.use('/api/interests', interestsRouter);

  return app;
}
