import { requireAuth } from '@stark-innovations/common';
import express, { Request, Response } from 'express';
import { Order } from '../models/orders';

const router = express.Router();

router.get('/api/orders', requireAuth, async (req: Request, res: Response) => {
  const orders = await Order.find({ userId: req.user!.id }).populate('ticket');
  res.status(200).send({ message: 'orders found', orders });
});

export { router as getOrdersRouter };
