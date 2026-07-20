import { Schema, model } from 'mongoose';
import type { Product } from '@fashion-store/shared-types';

// Mongoose document mirrors the shared Product contract (minus the derived `id`).
type ProductDoc = Omit<Product, 'id'>;

const productSchema = new Schema<ProductDoc>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true },
    currency: { type: String, enum: ['EUR', 'USD', 'GBP'], default: 'EUR' },
    images: { type: [String], default: [] },
    category: {
      type: String,
      enum: ['womenswear', 'menswear', 'accessories'],
      required: true,
    },
    tag: { type: String, enum: ['New', 'Limited', 'Sale'] },
    featured: { type: Boolean, default: false, index: true },
    sizes: { type: [String], default: [] },
    inStock: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = String(ret._id);
        delete ret._id;
      },
    },
  }
);

export const ProductModel = model<ProductDoc>('Product', productSchema);
