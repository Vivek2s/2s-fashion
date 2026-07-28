import { Router } from 'express';
import { requireFirebaseAuth } from '../middleware/firebaseAuth.js';
import { createInterest, getInterest } from '../controllers/interests.js';

export const interestsRouter = Router();
interestsRouter.use(requireFirebaseAuth);
interestsRouter.post('/', createInterest);
interestsRouter.get('/:productSlug', getInterest);
