import { Schema, model, Types } from 'mongoose';

// A "Get in touch" lead: one entry per user per product.
interface InterestDoc {
  userId: Types.ObjectId;
  productSlug: string;
  size?: string;
  createdAt: Date;
}

const interestSchema = new Schema<InterestDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    productSlug: { type: String, required: true },
    size: { type: String },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

// One interest per user per product — duplicate submits are detected via this index.
interestSchema.index({ userId: 1, productSlug: 1 }, { unique: true });

export const InterestModel = model<InterestDoc>('Interest', interestSchema);
