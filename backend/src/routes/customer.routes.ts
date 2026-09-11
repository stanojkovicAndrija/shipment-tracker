import { Router } from 'express';
import { db } from '../prisma/db.js';

export const customerRouter = Router();

customerRouter.get('/', async (_req, res) => {
  try {
    const customers = await db.orm.public.Customer.all();

    return res.json(customers);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Failed to fetch customers'
    });
  }
});