import { Schema, model } from 'mongoose';
import type { StoreUser } from '@fashion-store/shared-types';

// Mongoose document mirrors the shared StoreUser contract (minus the derived `id`).
type UserDoc = Omit<StoreUser, 'id'>;

const userSchema = new Schema<UserDoc>(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    email: { type: String },
    phone: { type: String },
    displayName: { type: String },
    photoURL: { type: String },
    provider: { type: String },
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

export const UserModel = model<UserDoc>('User', userSchema);
