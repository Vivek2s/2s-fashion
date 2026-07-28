import type { Request, Response } from 'express';
import { UserModel } from '../models/User.js';
import { InterestModel } from '../models/Interest.js';

/** Upsert the signed-in Firebase user into our own users collection. */
async function syncUser(req: Request) {
  const fb = req.firebaseUser!;
  return UserModel.findOneAndUpdate(
    { firebaseUid: fb.uid },
    {
      $set: {
        email: fb.email,
        phone: fb.phone,
        displayName: fb.displayName,
        photoURL: fb.photoURL,
        provider: fb.provider,
      },
      $setOnInsert: { firebaseUid: fb.uid },
    },
    { new: true, upsert: true }
  );
}

// POST /api/interests  { productSlug, size? }
// Records a "Get in touch" lead against the user. Idempotent: a second submit
// for the same product returns { status: "exists" }.
export async function createInterest(req: Request, res: Response) {
  const { productSlug, size } = req.body as { productSlug?: string; size?: string };
  if (!productSlug || typeof productSlug !== 'string') {
    return res.status(400).json({ error: 'productSlug is required' });
  }

  try {
    const user = await syncUser(req);
    try {
      await InterestModel.create({ userId: user._id, productSlug, size });
      res.status(201).json({ data: { status: 'created' } });
    } catch (err) {
      // E11000 = unique index violation → this user already submitted.
      if (err instanceof Error && 'code' in err && (err as { code?: number }).code === 11000) {
        return res.json({ data: { status: 'exists' } });
      }
      throw err;
    }
  } catch {
    res.status(503).json({ error: 'Database unavailable' });
  }
}

// GET /api/interests/:productSlug — has the signed-in user already submitted?
export async function getInterest(req: Request, res: Response) {
  try {
    const user = await UserModel.findOne({ firebaseUid: req.firebaseUser!.uid });
    if (!user) return res.json({ data: { submitted: false } });
    const interest = await InterestModel.findOne({
      userId: user._id,
      productSlug: req.params.productSlug,
    });
    res.json({ data: { submitted: Boolean(interest) } });
  } catch {
    res.status(503).json({ error: 'Database unavailable' });
  }
}
