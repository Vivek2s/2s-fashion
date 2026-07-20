import { Router } from 'express';
import { listProducts, getProduct } from '../controllers/products.js';

export const productsRouter = Router();
productsRouter.get('/', listProducts);
productsRouter.get('/:slug', getProduct);
