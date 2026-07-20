import type { Request, Response } from 'express';
import { ProductModel } from '../models/Product.js';

// GET /api/products?featured=true&category=womenswear
export async function listProducts(req: Request, res: Response) {
  const filter: Record<string, unknown> = {};
  if (req.query.featured === 'true') filter.featured = true;
  if (req.query.category) filter.category = req.query.category;

  try {
    const docs = await ProductModel.find(filter).sort({ createdAt: -1 }).limit(48);
    res.json({ data: docs.map((d) => d.toJSON()), total: docs.length });
  } catch {
    res.status(503).json({ error: 'Database unavailable', data: [], total: 0 });
  }
}

// GET /api/products/:slug
export async function getProduct(req: Request, res: Response) {
  try {
    const doc = await ProductModel.findOne({ slug: req.params.slug });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json({ data: doc.toJSON() });
  } catch {
    res.status(503).json({ error: 'Database unavailable' });
  }
}
