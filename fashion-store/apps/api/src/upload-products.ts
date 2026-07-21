import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import mongoose from 'mongoose';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { connectDB } from './config/db.js';
import { ProductModel } from './models/Product.js';

/**
 * Uploads product photos from the repo-root `products/` folder to S3 and
 * upserts the products described in `products/manifest.json` into MongoDB.
 *
 * Usage:  AWS_PROFILE=youstream npm --workspace api run upload-products
 * Env:    S3_BUCKET (default 2sfashion-products), S3_REGION (default ap-south-1),
 *         MONGODB_URI (default mongodb://localhost:27017/fashion-store)
 *
 * Idempotent: objects are keyed by slug/index and products upsert on slug.
 */

const BUCKET = process.env.S3_BUCKET ?? '2sfashion-products';
const REGION = process.env.S3_REGION ?? 'ap-south-1';
const PRODUCTS_DIR = path.resolve(process.cwd(), '../../products');

type ManifestProduct = {
  slug: string;
  name: string;
  color: string;
  description: string;
  price: number;
  currency: 'EUR' | 'USD' | 'GBP' | 'INR';
  category: 'womenswear' | 'menswear' | 'accessories';
  tag?: 'New' | 'Limited' | 'Sale';
  featured?: boolean;
  sizes: string[];
  inStock: boolean;
  images: string[]; // filenames inside products/
};

const s3 = new S3Client({ region: REGION });

const contentType = (f: string) =>
  f.endsWith('.png') ? 'image/png' : f.endsWith('.webp') ? 'image/webp' : 'image/jpeg';

async function uploadImage(slug: string, file: string, index: number): Promise<string> {
  const body = await readFile(path.join(PRODUCTS_DIR, file));
  const ext = path.extname(file).toLowerCase() || '.png';
  const key = `products/${slug}/${index + 1}${ext}`;
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType(ext),
      CacheControl: 'public, max-age=31536000, immutable',
    })
  );
  const url = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
  console.log(`[s3] ${file} -> ${url}`);
  return url;
}

async function run() {
  const manifest = JSON.parse(
    await readFile(path.join(PRODUCTS_DIR, 'manifest.json'), 'utf-8')
  ) as { products: ManifestProduct[] };

  // Products sharing a name are colourways of one style.
  const byName = new Map<string, ManifestProduct[]>();
  for (const p of manifest.products) {
    byName.set(p.name, [...(byName.get(p.name) ?? []), p]);
  }

  await connectDB(process.env.MONGODB_URI ?? 'mongodb://localhost:27017/fashion-store');

  for (const p of manifest.products) {
    const images = await Promise.all(p.images.map((f, i) => uploadImage(p.slug, f, i)));
    const colorways = (byName.get(p.name) ?? [])
      .map(({ color, slug }) => ({ color, slug }));
    await ProductModel.updateOne(
      { slug: p.slug },
      { $set: { ...p, images, colorways } },
      { upsert: true }
    );
    console.log(`[db] upserted ${p.slug} (${p.color}, ${images.length} image${images.length > 1 ? 's' : ''})`);
  }

  await mongoose.disconnect();
  console.log(`[done] ${manifest.products.length} products live`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
