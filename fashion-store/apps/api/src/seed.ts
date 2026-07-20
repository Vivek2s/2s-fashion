import 'dotenv/config';
import { connectDB } from './config/db.js';
import { ProductModel } from './models/Product.js';
import mongoose from 'mongoose';

const IMG = (p: string) => `https://images.unsplash.com/${p}?q=80&w=1200&auto=format&fit=crop`;

// Base products (primary photo id each).
const base = [
  { slug: 'wool-overcoat', name: 'Wool Overcoat', price: 480, category: 'womenswear', tag: 'New', featured: true, photo: 'photo-1591047139829-d91aecb6caea' },
  { slug: 'silk-slip-dress', name: 'Silk Slip Dress', price: 260, category: 'womenswear', featured: true, photo: 'photo-1595777457583-95e059d581b8' },
  { slug: 'tailored-trouser', name: 'Tailored Trouser', price: 190, category: 'womenswear', featured: true, photo: 'photo-1594633312681-425c7b97ccd1' },
  { slug: 'cashmere-knit', name: 'Cashmere Knit', price: 220, category: 'womenswear', tag: 'Limited', featured: true, photo: 'photo-1576566588028-4147f3842f27' },
  { slug: 'linen-shirt', name: 'Linen Shirt', price: 140, category: 'menswear', featured: true, photo: 'photo-1602810318383-e386cc2a3ccf' },
  { slug: 'leather-boot', name: 'Leather Boot', price: 340, category: 'accessories', tag: 'New', featured: true, photo: 'photo-1608256246200-53e635b5b65f' },
  { slug: 'structured-bag', name: 'Structured Bag', price: 390, category: 'accessories', featured: true, photo: 'photo-1584917865442-de89df76afd3' },
  { slug: 'pleated-skirt', name: 'Pleated Skirt', price: 180, category: 'womenswear', featured: true, photo: 'photo-1583496661160-fb5886a0aaaa' },
];

// Gallery = own primary + two siblings' photos (all valid), for a Zara-style PDP.
const products = base.map((p, i) => ({
  slug: p.slug,
  name: p.name,
  price: p.price,
  category: p.category,
  tag: p.tag,
  featured: p.featured,
  images: [p.photo, base[(i + 1) % base.length].photo, base[(i + 3) % base.length].photo].map(IMG),
}));

async function run() {
  await connectDB(process.env.MONGODB_URI ?? 'mongodb://localhost:27017/fashion-store');
  await ProductModel.deleteMany({});
  await ProductModel.insertMany(
    products.map((p) => ({ description: `${p.name} from the AW26 collection — quiet silhouettes in natural fibres, made to last.`, sizes: ['XS', 'S', 'M', 'L'], inStock: true, currency: 'EUR', ...p }))
  );
  console.log(`[seed] inserted ${products.length} products`);
  await mongoose.disconnect();
}

run().catch((e) => { console.error(e); process.exit(1); });
